/**
 * Created by xiangxn on 2017/1/29.
 */
import React from "react";
import BaseComponent from "./BaseComponent";
import Modal from "./layout/Modal";

class TransactionConfirm extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {visible: false};
        //this.show = this.show.bind(this);
        //this.hide = this.hide.bind(this);
    }

    show() {
        this.setState({visible: true});
    }

    hide(ok) {
        this.setState({visible: false});
        console.debug('hide', ok)
    }

    render() {
        return (
            <div className="popup-window">
                <Modal visible={this.state.visible} onClose={this.hide.bind(this)}>
                    <div className="title">{this.formatMessage('transaction_confirm')}</div>
                    <div className="body">
                        <div className="list">
                            <div className="row">
                                <span className="blue">{this.formatMessage('lastOperation_createAccount')}</span>
                            </div>
                            <div className="row">
                                <span>{this.formatMessage('transaction_confirm_accountName')}</span>
                                <span>mmm000</span>
                            </div>
                            <div className="row">
                                <span>{this.formatMessage('transaction_confirm_registerName')}</span>
                                <span>xiangxn</span>
                            </div>
                            <div className="row">
                                <span>{this.formatMessage('transaction_confirm_recommender')}</span>
                                <span>xiangxn</span>
                            </div>
                            <div className="row">
                                <span>{this.formatMessage('transfer_chargefee')}</span>
                                <span className="orangeRed">14.82281 BTS</span></div>
                        </div>
                    </div>
                    <div className="buttons">
                        <input type="button" className="green-btn" value={this.formatMessage('btn_ok')}
                               onClick={this.hide.bind(this, true)}/>
                    </div>
                </Modal>
            </div>
        );
    }
}
export default TransactionConfirm;