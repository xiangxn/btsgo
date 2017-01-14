/**
 * Created by admin on 2017/1/14.
 */
import React from "react";
import BaseComponent from "../BaseComponent";

class Pay extends BaseComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let aSymbol = "bitCNY";
        let bSymbol = "BTS";
        return (
            <div className="vertical-flex vertical-box">
                <div className="current-balance">
                    <div>
                        <p>{this.formatMessage("transaction_currentBalance", {symbol: aSymbol})}: <label
                            className="green">100.9999</label></p>
                        <p>{this.formatMessage("transaction_canBuy", {symbol: bSymbol})}: <label className="green">3662.26</label>
                        </p>
                    </div>
                    <div></div>
                </div>
                <div className="separate2"></div>
                <div className="transaction-operate vertical-flex">
                    <div>
                        <p><label><input type="checkbox"
                                         checked="checked"/> {this.formatMessage("transaction_marketPrice")}</label></p>
                        <p>
                            价格 BTS<br/>
                            <input type="text"/>
                        </p>
                        <p>
                            <label className="green">金额 bitCNY</label><br/>
                            <input type="text"/>
                        </p>
                        <p>
                            成交额 BTS<br/>
                            <input type="text"/>
                        </p>
                        <p>
                            手续费 BTS<br/>
                            <input type="text"/>
                        </p>
                        <p>
                            <input type="button" className="green-btn" value="立即售出"/>
                        </p>
                    </div>
                    <div>bbbbbb</div>
                </div>
            </div>
        );
    }
}

export default Pay;