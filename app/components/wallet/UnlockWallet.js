/**
 * Created by necklace on 2017/1/12.
 */

import React from "react";
import BaseComponent from "../BaseComponent";
import Modal from "../layout/Modal";

import {Apis} from "bitsharesjs-ws";
import AltContainer from "alt-container";

//stores
import WalletDb from "../../stores/WalletDb";
import WalletUnlockStore from "../../stores/WalletUnlockStore";
//actions
import NotificationActions from "../../actions/NotificationActions";
import WalletUnlockActions from "../../actions/WalletUnlockActions";

class UnlockWallet extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
        this.onPasswordEnter = this.onPasswordEnter.bind(this);
    }

    getInitialState() {
        return {
            visible: false,
            password_error: null,
            password_input_reset: Date.now()
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.resolve) {
            if (WalletDb.isLocked())
                this.show();
            else
                nextProps.resolve();
        }
    }

    show() {
        let wallet = WalletDb.getWallet();
        if (!wallet) {
            return;
        }
        if (Apis.instance().chain_id !== wallet.chain_id) {
            NotificationActions.error("This wallet was intended for a different block-chain; expecting " +
                wallet.chain_id.substring(0, 4).toUpperCase() + ", but got " +
                Apis.instance().chain_id.substring(0, 4).toUpperCase());
            return;
        }
        this.setState({visible: true});
    }

    hide(ok) {
        if (!ok) {
            WalletUnlockActions.cancel();
        }
        this.setState({visible: false, password_error: null});

    }

    onPasswordEnter(e) {
        e.preventDefault();
        let password = this.refs.password_input.value;
        this.setState({password_error: null});
        WalletDb.validatePassword(password || "", true);
        if (WalletDb.isLocked()) {
            this.setState({password_error: this.formatMessage("wallet_passwordErrMsg")});
            return false;
        }
        else {
            this.refs.password_input.value = "";
            this.props.resolve();
            WalletUnlockActions.change();
            this.setState({password_input_reset: Date.now(), password_error: null, visible: false});
        }
        return false;
    }

    render() {
        return (
            <div className="popup-window">
                <Modal visible={this.state.visible} onClose={this.hide.bind(this)} height={3.2}>
                    <div className="title">{this.formatMessage('transaction_confirm_unlock')}</div>
                    <div className="message-box"></div>
                    <div className="body">
                        <div className="input-row">
                            <div className="label">{this.formatMessage('wallet_password')}</div>
                            <input ref="password_input" className="input" type="password"
                                   placeholder={this.formatMessage('wallet_password_ph')}/>
                        </div>
                    </div>
                    <div className="message-box">
                        {this.state.password_error}
                    </div>
                    <div className="buttons">
                        <input onClick={this.onPasswordEnter} className="green-btn" type="button"
                               value={this.formatMessage('btn_ok')}/>
                    </div>
                </Modal>
            </div>
        );
    }
}

class WalletUnlockModalContainer extends React.Component {
    render() {
        return (
            <AltContainer store={WalletUnlockStore}>
                <UnlockWallet/>
            </AltContainer>
        )
    }
}
export default WalletUnlockModalContainer