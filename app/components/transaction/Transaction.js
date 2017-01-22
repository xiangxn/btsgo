/**
 * Created by necklace on 2017/1/14.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import TabComponent from "./TabComponent";

class Transaction extends BaseComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let latestPrice = 36.26734;
        let aVolume = "29.13k";
        let bVolume = "1.05M";
        let aUnit = "bitCNY";
        let bUint = "BTS";
        let tabData = [
            {name: this.formatMessage("transaction_pay"), url: "/transaction/pay"},
            {name: this.formatMessage("transaction_sell"), url: "/transaction/sell"},
            {name: this.formatMessage("transaction_orders"), url: "/transaction/orders"}];
        return (
            <div className="content clear-toppadding vertical-box vertical-flex">
                <div className="last-price">
                    <div>{this.formatMessage("transaction_latest")}: {latestPrice}</div>
                    <div>
                        <label>{this.formatMessage("transaction_volume")}: </label>
                        <div>
                            <div>{aVolume} {aUnit}</div>
                            <div>{bVolume} {bUint}</div>
                        </div>
                    </div>
                </div>
                <TabComponent data={tabData} {...this.props}/>
            </div>
        );
    }
}

export default Transaction;