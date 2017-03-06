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

//actions
import NotificationActions from "../../actions/NotificationActions";
import MarketsActions from "../../actions/MarketsActions";

//stores
import {ChainStore} from "graphenejs-lib";

class Buy extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            buyFeeAssetIdx: 0
        };
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

    onConfirmSub(data) {
        console.debug(data.chargefee.getAmount({real: true}));
    }

    createLimitOrder(type, feeID) {
        let operationCtrl = this.refs.operationCtrl;
        let {amount,turnover}=operationCtrl.state;
        const order = new LimitOrderCreate({
            for_sale: amount,
            to_receive: turnover,
            seller: this.props.currentAccount.get("id"),
            fee: {
                asset_id: feeID,
                amount: 0
            }
        });

        console.log("order:", JSON.stringify(order.toObject()));
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
        let {quoteAsset, baseAsset, marketCallOrders, marketData} = this.props;
        let base = null, quote = null, quoteSymbol, baseSymbol;
        if (quoteAsset.size && baseAsset.size) {
            base = baseAsset;
            quote = quoteAsset;
            baseSymbol = base.get("symbol");
            quoteSymbol = quote.get("symbol");
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
                <CurrentBalance {...this.props} />
                <div className="separate2"></div>
                <div className="transaction-operate vertical-flex">
                    <TransactionOperation ref="operationCtrl" btnText={this.formatMessage("transaction_confirmPay")}
                                          baseAsset={base}
                                          quoteAsset={quote}
                                          feeAsset={buyFeeAsset}
                                          fee={buyFee}
                                          btnClass="green-btn"
                                          onConfirmSub={this.onConfirmSub}/>
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