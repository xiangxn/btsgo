/**
 * Created by necklace on 2017/1/14.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import TransactionOperation from "./TransactionOperation";
import CurrentBalance from "./CurrentBalance";
import {Asset, Price, LimitOrderCreate} from "../../../common/MarketClasses";
import utils from "../../../common/utils";
import account_utils from "../../../common/account_utils";
import OrderBook from "./OrderBook";

//actions
import NotificationActions from "../../actions/NotificationActions";
import MarketsActions from "../../actions/MarketsActions";

//stores
import {ChainStore} from "bitsharesjs";

class Sell extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            sellFeeAssetIdx: 0
        };
    }

    onBalanceClick(sellFeeAsset, sellFee, balance) {

        let operationCtrl = this.refs.operationCtrl;
        balance = account_utils.getBalanceById(balance);
        //console.debug('onBalanceClick', sellFeeAsset.get('id'), sellFee.getAmount({real: true}), balance);
        let {price, turnover}=operationCtrl.state;
        let a = balance.getAmount({real: true});
        if (sellFeeAsset.get('id') === balance.asset_id) {
            //console.debug('----------------------')
            a = a - sellFee.getAmount({real: true});
            balance.setAmount({real: a || 0});
        }
        let val = price.toReal() * a;
        turnover.setAmount({real: val || 0});

        operationCtrl.setState({
            amount: balance,
            amountText: balance.getAmount({real: true}),
            turnover: turnover,
            turnoverText: turnover.getAmount({real: true})
        });
    }

    onSetPriceClick(order) {
        let operationCtrl = this.refs.operationCtrl;
        const isBid = order.isBid();

        let forSale = order.totalToReceive({noCache: true});
        let toReceive = forSale.times(order.sellPrice());

        let newPrice = new Price({
            base: isBid ? toReceive : forSale,
            quote: isBid ? forSale : toReceive
        });

        if (operationCtrl.state.orderType === 0) {
            operationCtrl.setState({
                price: newPrice,
                priceText: newPrice.toReal(),
                amount: isBid ? forSale : toReceive,
                amountText: isBid ? forSale.getAmount({real: true}) : toReceive.getAmount({real: true}),
                turnover: isBid ? toReceive : forSale,
                turnoverText: isBid ? toReceive.getAmount({real: true}) : forSale.getAmount({real: true})
            });
        }
    }

    onConfirmSub(buyAsset, sellAsset, sellBalance, coreBalance, feeAsset, current, short = true) {
        let {highestBid, lowestAsk} = this.props.marketData;
        sellBalance = current.amount.clone(sellBalance ? parseInt(ChainStore.getObject(sellBalance).toJS().balance, 10) : 0);
        coreBalance = new Asset({
            amount: coreBalance ? parseInt(ChainStore.getObject(coreBalance).toJS().balance, 10) : 0
        });

        let fee = this.getFee(feeAsset);

        let feeID = this.verifyFee(fee, current.amount.getAmount(), sellBalance.getAmount(), coreBalance.getAmount());
        if (!feeID) {
            return NotificationActions.addNotification({
                message: "Insufficient funds to pay fees",
                level: "error"
            });
        }
        let isPredictionMarket = sellAsset.getIn(["bitasset", "is_prediction_market"]);
        //判断可用余额
        if (current.amount.gt(sellBalance) && !isPredictionMarket) {
            return NotificationActions.addNotification({
                message: "Insufficient funds to place current. Required: " + current.amount.getAmount({real: true}) + " " + sellAsset.get("symbol"),
                level: "error"
            });
        }
        //判断输入的值
        if (!(current.amount.getAmount() > 0 && current.turnover.getAmount() > 0)) {
            return NotificationActions.addNotification({
                message: "Please enter a valid amount and price",
                level: "error"
            });
        }

        //创建short单
        if (isPredictionMarket && short) {
            return this.createPredictionShort(current, feeID);
        }
        //创建order
        this.createLimitOrder(current, feeID);
    }

    createLimitOrder(current, feeID) {
        let {amount, turnover}=current;
        const order = new LimitOrderCreate({
            for_sale: amount,
            to_receive: turnover,
            seller: this.props.currentAccount.get("id"),
            fee: {
                asset_id: feeID,
                amount: 0
            }
        });

        console.debug("order:", order.toObject());  //调试订单数据
        return MarketsActions.createLimitOrder2(order).then((result) => {
            if (result.error) {
                if (result.error.message !== "wallet locked")
                    NotificationActions.addNotification({
                        message: "Unknown error. Failed to place order for " + turnover.getAmount({real: true}) + " " + turnover.asset_id,
                        level: "error"
                    });
            }
        }).catch(e => {
            console.log("order failed:", e);
        });
    }

    createPredictionShort(current, feeID) {
        const order = new LimitOrderCreate({
            for_sale: current.amount,
            to_receive: current.turnover,
            seller: this.props.currentAccount.get("id"),
            fee: {
                asset_id: feeID,
                amount: 0
            }
        });

        Promise.all([
            FetchChain("getAsset", this.props.quoteAsset.getIn(["bitasset", "options", "short_backing_asset"]))
        ]).then(assets => {
            let [backingAsset] = assets;
            let collateral = new Asset({
                amount: order.amount_for_sale.getAmount(),
                asset_id: backingAsset.get("id"),
                precision: backingAsset.get("precision")
            });

            MarketsActions.createPredictionShort(
                order,
                collateral
            ).then(result => {
                if (result.error) {
                    if (result.error.message !== "wallet locked")
                        NotificationActions.addNotification({
                            message: "Unknown error. Failed to place order for " + current.amount.getAmount() + " " + current.amount.get("symbol"),
                            level: "error"
                        });
                }
            });
        });
    }

    verifyFee(fee, sellAmount, sellBalance, coreBalance) {
        let coreFee = this.getFee();

        let sellSum = fee.getAmount() + sellAmount;
        if (fee.asset_id === "1.3.0") {
            if (coreFee.getAmount() <= coreBalance) {
                return "1.3.0";
            } else {
                return null;
            }
        } else {
            if (sellSum <= sellBalance) { // 有足够资产余额
                return fee.asset_id;
            } else if (coreFee.getAmount() <= coreBalance && fee.asset_id !== "1.3.0") { // 有足够核心资产余额支付手续费
                return "1.3.0";
            } else {
                return null; // 没有可支付费用的资产
            }
        }
    }

    getFee(asset) {
        let fee = utils.estimateFee("limit_order_create", [], ChainStore.getObject("2.0.0")) || 0;
        const coreFee = new Asset({
            amount: fee
        });
        if (!asset || asset.get("id") === "1.3.0") return coreFee;

        const cer = asset.getIn(["options", "core_exchange_rate"]).toJS();

        if (cer.base.asset_id === cer.quote.asset_id) return coreFee;

        const cerBase = new Asset({
            asset_id: cer.base.asset_id,
            amount: cer.base.amount,
            precision: ChainStore.getAsset(cer.base.asset_id).get("precision")
        });
        const cerQuote = new Asset({
            asset_id: cer.quote.asset_id,
            amount: cer.quote.amount,
            precision: ChainStore.getAsset(cer.quote.asset_id).get("precision")
        });
        try {
            const cerPrice = new Price({
                base: cerBase, quote: cerQuote
            });
            const convertedFee = coreFee.times(cerPrice);

            return convertedFee;
        }
        catch (err) {
            return coreFee;
        }
    }

    getFeeAssets(quote, base, coreAsset) {
        let {currentAccount} = this.props;

        function addMissingAsset(target, asset) {
            if (target.indexOf(asset) === -1) {
                target.push(asset);
            }
        }

        let sellFeeAssets = [coreAsset, quote === coreAsset ? base : quote];
        addMissingAsset(sellFeeAssets, quote);
        addMissingAsset(sellFeeAssets, base);
        let sellFeeAsset;

        let balances = {};

        currentAccount.get("balances", []).filter((balance, id) => {
            return (["1.3.0", quote.get("id"), base.get("id")].indexOf(id) >= 0);
        }).forEach((balance, id) => {
            let balanceObject = ChainStore.getObject(balance);
            balances[id] = {
                balance: balanceObject ? parseInt(balanceObject.get("balance"), 10) : 0,
                fee: this.getFee(ChainStore.getAsset(id))
            };
        });

        sellFeeAssets = sellFeeAssets.filter(a => {
            if (!balances[a.get("id")]) {
                return false;
            }
            ;
            return balances[a.get("id")].balance > balances[a.get("id")].fee.getAmount();
        });

        if (!sellFeeAssets.length) {
            sellFeeAsset = coreAsset;
            sellFeeAssets.push(coreAsset);
        } else {
            sellFeeAsset = sellFeeAssets[Math.min(sellFeeAssets.length - 1, this.state.sellFeeAssetIdx)];
        }

        let sellFee = this.getFee(sellFeeAsset);

        return {
            sellFeeAsset,
            sellFeeAssets,
            sellFee
        };
    }

    render() {
        let {quoteAsset, baseAsset, marketData, currentAccount} = this.props;
        let base = null, quote = null, accountBalance = null, baseBalance = null, coreBalance = null, quoteBalance = null, quoteSymbol, baseSymbol;
        if (quoteAsset.size && baseAsset.size && currentAccount.size) {
            base = baseAsset;
            quote = quoteAsset;
            baseSymbol = base.get("symbol");
            quoteSymbol = quote.get("symbol");
            accountBalance = currentAccount.get("balances").toJS();
            if (accountBalance) {
                for (let id in accountBalance) {
                    if (id === quote.get("id")) {
                        quoteBalance = accountBalance[id];
                    }
                    if (id === base.get("id")) {
                        baseBalance = accountBalance[id];
                    }
                    if (id === "1.3.0") {
                        coreBalance = accountBalance[id];
                    }
                }
            }
        }
        const {
            combinedBids, combinedAsks, lowestAsk, highestBid
        } = marketData;
        let coreAsset = ChainStore.getAsset("1.3.0");
        if (!coreAsset) {
            return null;
        }
        let {
            sellFeeAsset,
            sellFeeAssets,
            sellFee
        } = this.getFeeAssets(quote, base, coreAsset);
        return (
            <div className="vertical-flex vertical-box scroll">
                <CurrentBalance {...this.props} isAsk={true}
                                onBalanceClick={this.onBalanceClick.bind(this, sellFeeAsset, sellFee)}/>
                <div className="separate2"></div>
                <div className="transaction-operate vertical-flex">
                    <TransactionOperation ref="operationCtrl" btnText={this.formatMessage("transaction_confirmSell")}
                                          btnClass="orange-red-btn" amountClass="orangeRed"
                                          isAsk={true}
                                          baseAsset={base}
                                          quoteAsset={quote}
                                          feeAsset={sellFeeAsset}
                                          fee={sellFee}
                                          onConfirmSub={this.onConfirmSub.bind(this, base, quote, quoteBalance, coreBalance, sellFeeAsset)}/>
                    <OrderBook
                        baseSymbol={baseSymbol}
                        quoteSymbol={quoteSymbol}
                        base={base}
                        quote={quote}
                        combinedBids={combinedBids}
                        combinedAsks={combinedAsks}
                        highestBid={highestBid}
                        lowestAsk={lowestAsk}
                        isAsk={true}
                        onClick={this.onSetPriceClick.bind(this)}
                    />
                </div>
            </div>
        );
    }
}

export default Sell;