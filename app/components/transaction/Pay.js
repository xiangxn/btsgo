/**
 * Created by admin on 2017/1/14.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import TransactionOperation from "./TransactionOperation";

class Pay extends BaseComponent {
    constructor(props) {
        super(props);
    }

    onSetPriceClick(e) {
        this.refs.operationCtrl.setState({price: e.target.innerText});
    }

    onConfirmSub(data) {
        console.debug(data);
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
                    <TransactionOperation ref="operationCtrl" btnText={this.formatMessage("transaction_confirmPay")}
                                          btnClass="green-btn"
                                          onConfirmSub={this.onConfirmSub}/>
                    <div className="depth-list">
                        <div className="depth-list-header">
                            <div>{bSymbol}</div>
                            <div>{aSymbol}</div>
                            <div>{this.formatMessage("transaction_depthPrice")}</div>
                        </div>
                        <div className="depth-list-pay">
                            <div className="depth-list-pay-row">
                                <span>83372.64039</span><span>83372.64039</span><span onClick={this.onSetPriceClick.bind(this)}>83372.64039</span>
                            </div>
                            <div className="depth-list-pay-row">
                                <span>83372.64039</span><span>83372.64039</span><span>83372.64039</span>
                            </div>
                            <div className="depth-list-pay-row">
                                <span>83372.64039</span><span>83372.64039</span><span>83372.64039</span>
                            </div>
                            <div className="depth-list-pay-row">
                                <span>83372.64039</span><span>83372.64039</span><span>83372.64039</span>
                            </div>
                            <div className="depth-list-pay-row">
                                <span>83372.64039</span><span>83372.64039</span><span>83372.64039</span>
                            </div>
                            <div className="depth-list-pay-row">
                                <span>83372.64039</span><span>83372.64039</span><span>83372.64039</span>
                            </div>
                        </div>
                        <div className="depth-list-sell">
                            <div className="depth-list-pay-row">
                                <span>83372.64039</span><span>83372.64039</span><span>83372.64039</span>
                            </div>
                            <div className="depth-list-pay-row">
                                <span>83372.64039</span><span>83372.64039</span><span>83372.64039</span>
                            </div>
                            <div className="depth-list-pay-row">
                                <span>83372.64039</span><span>83372.64039</span><span>83372.64039</span>
                            </div>
                            <div className="depth-list-pay-row">
                                <span>83372.64039</span><span>83372.64039</span><span>83372.64039</span>
                            </div>
                            <div className="depth-list-pay-row">
                                <span>83372.64039</span><span>83372.64039</span><span>83372.64039</span>
                            </div>
                            <div className="depth-list-pay-row">
                                <span>83372.64039</span><span>83372.64039</span><span>83372.64039</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Pay;