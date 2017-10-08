/**
 * Created by necklace on 2017/1/12.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import connectToStores from 'alt-utils/lib/connectToStores';
import {PrivateKey} from "bitsharesjs";

//stores
import WalletManagerStore from "../../stores/WalletManagerStore";
import BackupStore from "../../stores/BackupStore";
import WalletDb from "../../stores/WalletDb";

//actions
import BackupActions, {backup, decryptWalletBackup} from "../../actions/BackupActions";
import WalletActions from "../../actions/WalletActions";
import NotificationActions from "../../actions/NotificationActions";

class ImportBackup extends BaseComponent {

    static getPropsFromStores() {
        return {wallet: WalletManagerStore.getState(), backup: BackupStore.getState()};
    }

    static getStores() {
        return [WalletManagerStore, BackupStore];
    }

    constructor(props) {
        super(props);
        this.state = {verified: false, accept: false, new_wallet: ''};
    }

    onSelectClick(e) {
        let file = this.refs.file;
        file.click();
    }

    onFileUpload(e) {
        let file = e.target.files[0];
        console.debug('onFileUpload',file);
        BackupActions.incommingWebFile(file);
        this.forceUpdate();
    }

    reset() {
        BackupActions.reset();
    }

    onRestore(e) {
        e.preventDefault();
        let pass = this.refs.password.value;
        let private_key = PrivateKey.fromSeed(pass || "");
        let contents = this.props.backup.contents;
        decryptWalletBackup(private_key.toWif(), contents).then(wallet_object => {
            BackupStore.setWalletObjct(wallet_object);
            this.setState({verified: true});
            this.checkNewName();
        }).catch(error => {
            console.error("Error verifying wallet " + this.props.backup.name, error, error.stack);
            if (error === "invalid_decryption_key")
                NotificationActions.error(this.formatMessage('wallet_createErrMsg6'));
            else
                NotificationActions.error("" + error);
        })
    }

    checkNewName() {
        let has_current_wallet = !!this.props.wallet.current_wallet
        if (!has_current_wallet) {
            let name = "default";
            WalletManagerStore.setNewWallet(name);
            console.debug(this.props.backup.wallet_object)
            WalletActions.restore(name, this.props.backup.wallet_object);
            this.setState({accept: true, new_wallet: name});
        }
        if (has_current_wallet && this.props.backup.name && !this.state.new_wallet) {
            let new_wallet = this.props.backup.name.match(/[a-z0-9_-]*/)[0];
            if (new_wallet)
                this.setState({new_wallet});
        }
    }

    onNewNameChange(event) {
        let value = event.target.value;
        value = value.toLowerCase();
        if (/[^a-z0-9_-]/.test(value)) return;
        this.setState({new_wallet: value});
    }

    onAccept(e) {
        e.preventDefault();
        this.setState({accept: true});
        WalletManagerStore.setNewWallet(this.state.new_wallet);
        WalletActions.restore(this.state.new_wallet, this.props.backup.wallet_object);
    }

    render() {
        let check = !!(new FileReader).readAsBinaryString;
        let checkMsg = check ? this.formatMessage('wallet_importBackupDes') : this.formatMessage('wallet_backup_err');
        let is_invalid = this.props.backup.contents && !this.props.backup.public_key;
        if (is_invalid) checkMsg = this.formatMessage('wallet_importBackup_invalidFormat');

        if (this.props.backup.contents && this.props.backup.public_key) {
            if (this.state.accept) {
                return (
                    <div className="content">
                        <div className="message-box">
                            {this.formatMessage('wallet_importBackup_success', {name: this.state.new_wallet})}
                        </div>
                    </div>
                );
            } else if (this.state.verified && !this.state.accept) {
                return (
                    <div className="content">
                        <div className="text-input">
                            <div className="text-label">{this.formatMessage("wallet_importBackup_name")}</div>
                            <input type="text"
                                   ref="newName"
                                   value={this.state.new_wallet}
                                   onChange={this.onNewNameChange.bind(this)}
                                   placeholder={this.formatMessage("wallet_importBackup_name_ph")}/>
                        </div>
                        <div className="operate">
                            <input className="green-btn" type="button" value={this.formatMessage('btn_ok')}
                                   onClick={this.onAccept.bind(this)}/>
                        </div>
                    </div>
                );
            }
            checkMsg = <p className="middleSize">SHA1:{this.props.backup.sha1}</p>;
            return (
                <div className="content">
                    <div className="message-box">
                        {checkMsg}
                    </div>
                    <br/>
                    <div className="text-input">
                        <div className="text-label">{this.formatMessage("wallet_password")}</div>
                        <input autoComplete="off" type="password"
                               ref="password"
                               placeholder={this.formatMessage("wallet_password_ph")}/>
                    </div>
                    <div className="operate">
                        <input className="green-btn" type="button" value={this.formatMessage('wallet_importBackup_ok')}
                               onClick={this.onRestore.bind(this)}/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <input className="green-btn" type="button"
                               value={this.formatMessage('wallet_importBackup_reset')}
                               onClick={this.reset.bind(this)}/>
                    </div>
                </div>
            );
        }
        return (
            <div className="content">
                <div className="message-box">
                    {checkMsg}
                </div>
                {!check ? null :
                    <div className="operate">
                        <input className="green-btn" type="button"
                               value={this.formatMessage('wallet_selectFile')}
                               onClick={this.onSelectClick.bind(this)}
                        />
                        <input ref="file" type="file" style={{display: 'none'}}
                               onChange={this.onFileUpload.bind(this)}/>
                    </div>
                }
            </div>
        );
    }
}


export default connectToStores(ImportBackup);