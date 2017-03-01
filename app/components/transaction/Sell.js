/**
 * Created by necklace on 2017/1/14.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import TransactionOperation from "./TransactionOperation";
import CurrentBalance from "./CurrentBalance";

class Sell extends BaseComponent {
    constructor(props) {
        super(props);
    }

    onSetPriceClick(e) {
        let operationCtrl = this.refs.operationCtrl;
        if (operationCtrl.state.orderType === 0) {
            let spans = e.target.parentNode.childNodes;
            operationCtrl.setState({
                price: spans[2].innerText,
                amount: spans[1].innerText,
                turnover: spans[0].innerText
            });
        }
    }

    onConfirmSub(data) {
        console.debug(data);
    }

    render() {
        let aSymbol = "bitCNY";
        let bSymbol = "BTS";
        return (
            <div className="vertical-flex vertical-box scroll">
                <CurrentBalance {...this.props} isAsk={true} />
                <div className="separate2"></div>
                <div className="transaction-operate vertical-flex">
                    <TransactionOperation ref="operationCtrl" btnText={this.formatMessage("transaction_confirmSell")}
                                          btnClass="orange-red-btn" amountClass="orangeRed"
                                          onConfirmSub={this.onConfirmSub}/>
                    <div className="depth-list">
                        <div className="depth-list-header">
                            <div>{bSymbol}</div>
                            <div>{aSymbol}</div>
                            <div>{this.formatMessage("transaction_depthPrice")}</div>
                        </div>
                        <div className="depth-list-sell">
                            <div className="depth-list-pay-row" onClick={this.onSetPriceClick.bind(this)}>
                                <span>1</span><span>2</span><span>83372.64039</span>
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
                        <div className="separate2"></div>
                        <div className="depth-list-pay">
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

export default Sell;