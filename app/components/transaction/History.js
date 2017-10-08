/**
 * Created by necklace on 2017/3/23.
 */

import React from "react";
import BaseComponent from "../BaseComponent";
import AssetName from "../Utility/AssetName";
import PriceText from "../Utility/PriceText";
import market_utils from "../../../common/market_utils";
import utils from "../../../common/utils";
import {ChainTypes} from "bitsharesjs";

const {operations} = ChainTypes;
const TARGET_MY = "my";
const TARGET_ALL = "all";
class History extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {active: TARGET_ALL};//my or all
    }

    onTabClick(target, e) {
        this.setState({active: target});
    }


    render() {
        let {currentAccount, activeMarketHistory, quoteAsset, baseAsset}=this.props;
        let base = null, quote = null, quoteSymbol, baseSymbol, historyRows = null;
        if (quoteAsset.size && baseAsset.size && currentAccount.size) {
            base = baseAsset;
            quote = quoteAsset;
            baseSymbol = base.get("symbol");
            quoteSymbol = quote.get("symbol");
        }
        let isNullAccount = currentAccount.get("id") === "1.2.3";
        let myHistory = currentAccount.get("history");
        let {active} = this.state;
        if (isNullAccount) active = TARGET_ALL;

        if (active === TARGET_MY && (myHistory && myHistory.size)) {
            let keyIndex = -1;
            let flipped = base.get("id").split(".")[2] > quote.get("id").split(".")[2];
            historyRows = myHistory.filter(a => {
                let opType = a.getIn(["op", 0]);
                return (opType === operations.fill_order);
            }).filter(a => {
                let quoteID = quote.get("id");
                let baseID = base.get("id");
                let pays = a.getIn(["op", 1, "pays", "asset_id"]);
                let receives = a.getIn(["op", 1, "receives", "asset_id"]);
                let hasQuote = quoteID === pays || quoteID === receives;
                let hasBase = baseID === pays || baseID === receives;
                return hasQuote && hasBase;
            })
                .sort((a, b) => {
                    return a.get("block_num") - a.get("block_num");
                })
                .map(trx => {
                    let order = trx.toJS().op[1];
                    //console.debug('order',trx.toJS());
                    keyIndex++;
                    let paysAsset, receivesAsset, isAsk = false;
                    if (order.pays.asset_id === base.get("id")) {
                        paysAsset = base;
                        receivesAsset = quote;
                        isAsk = true;

                    } else {
                        paysAsset = quote;
                        receivesAsset = base;
                    }

                    let parsed_order = market_utils.parse_order_history(order, paysAsset, receivesAsset, isAsk, flipped);
                    //console.debug('parsed_order:', parsed_order)
                    const block_num = trx.get("block_num");
                    return (
                        <div key={"my_history_" + keyIndex} className="order-list-row">
                            <span className={!isAsk ? "orangeRed" : "green"}>
                                <PriceText preFormattedPrice={parsed_order}/>
                            </span>
                            <span>{utils.formatNumber(parsed_order.receives, 4)}</span>
                            <span className="blue">{utils.formatNumber(parsed_order.pays, 4)}</span>
                            <span>#{utils.format_number(block_num, 0)}</span>
                        </div>
                    );
                }).toArray();
        } else if (activeMarketHistory && activeMarketHistory.size) {
            let index = 0;
            let keyIndex = -1;
            let flipped = base.get("id").split(".")[2] > quote.get("id").split(".")[2];
            historyRows = activeMarketHistory
                .filter(a => {
                    index++;
                    return index % 2 === 0;
                })
                .take(100)
                .map(order => {
                    //console.debug('order:',order)
                    keyIndex++;
                    let paysAsset, receivesAsset, isAsk = false;
                    if (order.pays.asset_id === base.get("id")) {
                        paysAsset = base;
                        receivesAsset = quote;
                        isAsk = true;

                    } else {
                        paysAsset = quote;
                        receivesAsset = base;
                    }

                    let parsed_order = market_utils.parse_order_history(order, paysAsset, receivesAsset, isAsk, flipped);
                    let time = parsed_order.time.split(':');
                    if (time.length > 2) {
                        time = time[0].substr(2) + ':' + time[1];
                    }
                    //console.debug('parsed_order:',parsed_order)
                    return (
                        <div key={"history_" + keyIndex} className="order-list-row">
                            <span className={!isAsk ? "orangeRed" : "green"}>
                                <PriceText preFormattedPrice={parsed_order}/>
                            </span>
                            <span>{utils.formatNumber(parsed_order.receives, 4)}</span>
                            <span className="blue">{utils.formatNumber(parsed_order.pays, 4)}</span>
                            <span className="smallFontSize">{time}</span>
                        </div>
                    );
                }).toArray();
        }
        return (
            <div className="order-list vertical-flex vertical-box">
                <div className="order-list-header">
                    <div className="check-btn-box" style={{marginTop: '.1rem'}}>
                        <label className={active == TARGET_MY ? "active" : ""}
                               onClick={this.onTabClick.bind(this, TARGET_MY)}>{this.formatMessage('transaction_history_my')}</label>
                        <label className={active == TARGET_ALL ? "active" : ""}
                               onClick={this.onTabClick.bind(this, TARGET_ALL)}>{this.formatMessage('transaction_history_all')}</label>
                    </div>
                </div>
                <div className="separate2"></div>
                <div className="order-list-header">
                    <span>{this.formatMessage('transaction_depthPrice')}</span>
                    <AssetName name={quoteSymbol}/>
                    <AssetName name={baseSymbol}/>
                    <span>{this.formatMessage((active === TARGET_MY) ? 'transaction_history_block' : 'transaction_history_blockTime')}</span>
                </div>
                <div className="separate2"></div>
                <div className="order-list-rows vertical-flex scroll">
                    {historyRows}
                </div>
            </div>
        );
    }
}

export default History;