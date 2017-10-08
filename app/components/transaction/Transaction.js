/**
 * Created by necklace on 2017/1/14.
 */
import React, {PropTypes} from "react";
import BaseComponent from "../BaseComponent";
import TabComponent from "./TabComponent";
import utils from "../../../common/utils";
import market_utils from "../../../common/market_utils";

//组件
import AssetName from "../Utility/AssetName";

class Transaction extends BaseComponent {
    static propTypes = {
        marketCallOrders: PropTypes.object.isRequired,
        activeMarketHistory: PropTypes.object.isRequired,
        priceData: PropTypes.array.isRequired,
        volumeData: PropTypes.array.isRequired
    };

    static defaultProps = {
        marketCallOrders: [],
        activeMarketHistory: {},
        priceData: [],
        volumeData: []
    };

    constructor(props) {
        super(props);
    }

    render() {
        let marketID = this.props.params.marketID;
        let latestPrice = 0;
        let aVolume = 0;
        let bVolume = 0;
        let tabData = [
            {name: this.formatMessage("transaction_pay"), url: `/transaction/${marketID}/buy`},
            {name: this.formatMessage("transaction_sell"), url: `/transaction/${marketID}/sell`},
            {name: this.formatMessage("transaction_orders"), url: `/transaction/${marketID}/orders`},
            {name: this.formatMessage("transaction_history"), url: `/transaction/${marketID}/history`}
        ];

        let {activeMarketHistory, quoteAsset, baseAsset, marketStats} = this.props;
        let base = null, quote = null, quoteBalance = null,
            baseBalance = null, coreBalance = null, quoteSymbol, baseSymbol, changeClass;
        if (quoteAsset.size && baseAsset.size) {
            base = baseAsset;
            quote = quoteAsset;
            baseSymbol = base.get("symbol");
            quoteSymbol = quote.get("symbol");
        }


        //最新价格
        if (activeMarketHistory.size) {
            // 取得最后成交订单
            let latest_two = activeMarketHistory.take(3);
            let latest = latest_two.first();
            let second_latest = latest_two.last();
            let paysAsset, receivesAsset, isAsk = false;
            if (latest.pays.asset_id === base.get("id")) {
                paysAsset = base;
                receivesAsset = quote;
                isAsk = true;
            } else {
                paysAsset = quote;
                receivesAsset = base;
            }
            let flipped = base.get("id").split(".")[2] > quote.get("id").split(".")[2];
            latestPrice = market_utils.parse_order_history(latest, paysAsset, receivesAsset, isAsk, flipped);

            isAsk = false;
            if (second_latest) {
                if (second_latest.pays.asset_id === base.get("id")) {
                    paysAsset = base;
                    receivesAsset = quote;
                    isAsk = true;
                } else {
                    paysAsset = quote;
                    receivesAsset = base;
                }

                let oldPrice = market_utils.parse_order_history(second_latest, paysAsset, receivesAsset, isAsk, flipped);
                changeClass = latestPrice.full === oldPrice.full ? "" : latestPrice.full - oldPrice.full > 0 ? "green" : "orangeRed";
            }
        }

        //成交量
        const volumeBase = marketStats.get("volumeBase");
        const volumeQuote = marketStats.get("volumeQuote");
        aVolume = utils.format_volume(volumeBase);
        bVolume = utils.format_volume(volumeQuote);

        return (
            <div className="content clear-toppadding vertical-box vertical-flex">
                <div className="last-price">
                    <div>
                        <span>{this.formatMessage("transaction_latest")} : </span>
                        <span
                            className={changeClass}>{utils.price_text(latestPrice.full, quoteAsset, baseAsset)}</span>&nbsp;
                        <span>
                            <AssetName name={baseSymbol}/>
                            {quoteAsset ? <span>/<AssetName name={quoteSymbol}/></span> : null}
                        </span>
                    </div>
                    <div>
                        <span>{this.formatMessage("transaction_volume")} : </span>
                        <span>{aVolume} <AssetName name={baseSymbol}/></span>
                        <span style={{float: 'right'}}>{bVolume} <AssetName name={quoteSymbol}/></span>
                    </div>
                </div>
                <TabComponent data={tabData} {...this.props} latestPrice={latestPrice.full}/>
            </div>
        );
    }
}

export default Transaction;