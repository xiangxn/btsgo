/**
 * Created by xiangxn on 2017/1/29.
 */
import React from "react";
import BaseComponent from "./BaseComponent";
import Modal from "./layout/Modal";
import Transaction from "./Blockchain/Transaction";
import TextLoading from "./TextLoading";
import AltContainer from "alt-container";

import {ChainStore} from "bitsharesjs";

//actions
import TransactionConfirmActions from "../actions/TransactionConfirmActions";

//ChainStores
import WalletDb from "../stores/WalletDb";
import TransactionConfirmStore from "../stores/TransactionConfirmStore";

class TransactionConfirm extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {visible: false};
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.closed !== this.props.closed) {
            if (!nextProps.closed) {
                this.show();
            } else {
                this.hide(true);
            }
        }
    }

    show() {
        this.setState({visible: true});
    }

    hide(ok) {
        this.setState({visible: false});
    }

    onConfirmClick(e) {
        e.preventDefault();
        if (this.props.propose) {
            TransactionConfirmActions.close();
            const propose_options = {
                fee_paying_account: ChainStore.getAccount(this.props.fee_paying_account).get("id")
            };
            this.props.transaction.update_head_block().then(() => {
                WalletDb.process_transaction(this.props.transaction.propose(propose_options), null, true);
            });
        } else
            TransactionConfirmActions.broadcast(this.props.transaction);
    }

    onCloseClick(e) {
        e.preventDefault && e.preventDefault();
        TransactionConfirmActions.close();
    }

    render() {
        let {broadcast, broadcasting} = this.props;
        if (!this.props.transaction || this.props.closed) {
            return null;
        }

        let title = null;
        let button = (
            <div className="buttons">
                <input type="button" className="green-btn" value={this.formatMessage('btn_ok')}
                       onClick={this.onCloseClick.bind(this)}/>
            </div>
        );
        if (this.props.error || this.props.included) {
            if (this.props.error) {
                title = (
                    <div className="title">
                        {this.formatMessage('transaction_broadcast_fail')}<br/>
                        <span className="smallFontSize">{this.props.error}</span>
                    </div>
                );//transaction_broadcast_fail transaction_confirm
            } else {
                title = (
                    <div className="title">
                        {this.formatMessage('transaction_confirm')}<br/>
                        <span className="smallFontSize">#{this.props.trx_id}@{this.props.trx_block_num}</span>
                    </div>
                );
            }
        } else if (broadcast) {
            title = (
                <div className="title">
                    {this.formatMessage('transaction_broadcast_success')}<br/>
                    <span>{this.formatMessage('transaction_waiting')}</span>
                </div>
            );
        } else if (broadcasting) {
            title = (
                <div className="title">
                    {this.formatMessage('transaction_broadcasting')}<br/>
                    <span><TextLoading/></span>
                </div>
            );
            button = null;
        } else {
            title = (
                <div className="title">
                    {this.formatMessage('transaction_confirm')}
                </div>
            );
            button = (
                <div className="buttons">
                    <input type="button" className="green-btn" value={this.formatMessage('btn_ok')}
                           onClick={this.onConfirmClick.bind(this)}/>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="button" className="green-btn" value={this.formatMessage('btn_cancel')}
                           onClick={this.onCloseClick.bind(this)}/>
                </div>
            );
        }
        return (
            <div className="popup-window">
                <Modal visible={this.state.visible} showCloseButton={!broadcasting}
                       customStyles={{height: 'auto', margin: '10px auto 10px auto'}}
                       onClose={this.onCloseClick.bind(this)}>
                    {title}
                    <Transaction key={Date.now()} trx={this.props.transaction.serialize()}/>
                    {button}
                </Modal>
            </div>
        );
    }
}

class TransactionConfirmContainer extends React.Component {
    render() {
        return (
            <AltContainer store={TransactionConfirmStore}>
                <TransactionConfirm/>
            </AltContainer>
        )
    }
}
export default TransactionConfirmContainer