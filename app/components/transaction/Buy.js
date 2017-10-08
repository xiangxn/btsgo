/**
 * Created by necklace on 2017/1/14.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import TransactionOperation from "./TransactionOperation";
import CurrentBalance from "./CurrentBalance";
import OrderBook from "./OrderBook";
import {Asset, Price, LimitOrderCreate} from "../../../common/MarketClasses";
import utils from "../../../common/utils";
import account_utils from "../../../common/account_utils";

//actions
import NotificationActions from "../../actions/NotificationActions";
import MarketsActions from "../../actions/MarketsActions";

//stores
import {ChainStore} from "bitsharesjs";

class Buy extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            buyFeeAssetIdx: 0
        };
    }

    onBalanceClick(buyFeeAsset, buyFee, balance) {

        let operationCtrl = this.refs.operationCtrl;
        let {amount, price}=operationCtrl.state;
        balance = account_utils.getBalanceById(balance);
        let p = price.toReal();
        let t = balance.getAmount({real: true});
        if (buyFeeAsset.get('id') === balance.asset_id) {
            t = t - buyFee.getAmount({real: true});
            balance.setAmount({real: t || 0});
        }
        if (p > 0) {
            let val = t / p;
            amount.setAmount({real: val || 0});
        }
        operationCtrl.setState({
            amount: amount,
            amountText: amount.getAmount({real: true}),
            turnover: balance,
            turnoverText: balance.getAmount({real: true})
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

    onConfirmSub(buyAsset, sellAsset, sellBalance, coreBalance, feeAsset, current) {
        let {highestBid, lowestAsk} = this.props.marketData;
        sellBalance = current.turnover.clone(sellBalance ? parseInt(ChainStore.getObject(sellBalance).toJS().balance, 10) : 0);
        coreBalance = new Asset({
            amount: coreBalance ? parseInt(ChainStore.getObject(coreBalance).toJS().balance, 10) : 0
        });
        let fee = this.getFee(feeAsset);
        let feeID = this.verifyFee(fee, current.turnover.getAmount(), sellBalance.getAmount(), coreBalance.getAmount());
        if (!feeID) {
            return NotificationActions.addNotification({
                message: "Insufficient funds to pay fees",
                level: "error"
            });
        }
        let isPredictionMarket = sellAsset.getIn(["bitasset", "is_prediction_market"]);
        //判断可用余额
        if (current.turnover.gt(sellBalance) && !isPredictionMarket) {
            return NotificationActions.addNotification({
                message: "Insufficient funds to place current. Required: " + current.turnover.getAmount() + " " + sellAsset.get("symbol"),
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
        //创建order
        this.createLimitOrder(current, feeID);
    }

    createLimitOrder(current, feeID) {
        let {amount, turnover}=current;
        const order = new LimitOrderCreate({
            for_sale: turnover,
            to_receive: amount,
            seller: this.props.currentAccount.get("id"),
            fee: {
                asset_id: feeID,
                amount: 0
            }
        });

        //console.log("order:", JSON.stringify(order.toObject()));  //调试订单数据
        return MarketsActions.createLimitOrder2(order).then((result) => {
            if (result.error) {
                if (result.error.message !== "wallet locked")
                    NotificationActions.addNotification({
                        message: "Unknown error. Failed to place order for " + amount.getAmount({real: true}) + " " + amount.asset_id,
                        level: "error"
                    });
            }
        }).catch(e => {
            console.log("order failed:", e);
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

        let buyFeeAssets = [coreAsset, base === coreAsset ? quote : base];
        addMissingAsset(buyFeeAssets, quote);
        addMissingAsset(buyFeeAssets, base);
        let buyFeeAsset;

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
        buyFeeAssets = buyFeeAssets.filter(a => {
            if (!balances[a.get("id")]) {
                return false;
            }
            ;
            return balances[a.get("id")].balance > balances[a.get("id")].fee.getAmount();
        });

        if (!buyFeeAssets.length) {
            buyFeeAsset = coreAsset;
            buyFeeAssets.push(coreAsset);
        } else {
            buyFeeAsset = buyFeeAssets[Math.min(buyFeeAssets.length - 1, this.state.buyFeeAssetIdx)];
        }

        let buyFee = this.getFee(buyFeeAsset);

        return {
            buyFeeAsset,
            buyFeeAssets,
            buyFee
        };
    }

    render() {
        let {quoteAsset, baseAsset, marketCallOrders, marketData, currentAccount} = this.props;
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
            combinedBids, combinedAsks, lowestAsk, highestBid,
            flatBids, flatAsks, flatCalls, flatSettles
        } = marketData;
        let coreAsset = ChainStore.getAsset("1.3.0");
        if (!coreAsset) {
            return null;
        }
        let {
            buyFeeAsset,
            buyFeeAssets,
            buyFee
        } = this.getFeeAssets(quote, base, coreAsset);
        return (
            <div className="vertical-flex vertical-box scroll">
                <CurrentBalance {...this.props} onBalanceClick={this.onBalanceClick.bind(this, buyFeeAsset, buyFee)}/>
                <div className="separate2"></div>
                <div className="transaction-operate vertical-flex">
                    <TransactionOperation ref="operationCtrl" btnText={this.formatMessage("transaction_confirmPay")}
                                          baseAsset={base}
                                          quoteAsset={quote}
                                          feeAsset={buyFeeAsset}
                                          fee={buyFee}
                                          btnClass="green-btn"
                                          onConfirmSub={this.onConfirmSub.bind(this, quote, base, baseBalance, coreBalance, buyFeeAsset)}/>
                    <OrderBook
                        baseSymbol={baseSymbol}
                        quoteSymbol={quoteSymbol}
                        base={base}
                        quote={quote}
                        combinedBids={combinedBids}
                        combinedAsks={combinedAsks}
                        highestBid={highestBid}
                        lowestAsk={lowestAsk}
                        onClick={this.onSetPriceClick.bind(this)}
                    />
                </div>
            </div>
        );
    }
}

export default Buy;