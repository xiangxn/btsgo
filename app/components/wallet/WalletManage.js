/**
 * Created by necklace on 2017/1/11.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import connectToStores from 'alt-utils/lib/connectToStores';
import XNFullButton from "../form/XNFullButton";
import XNSelect from "../form/XNSelect";

//stores
import WalletManagerStore from "../../stores/WalletManagerStore";

//actions
import WalletActions from "../../actions/WalletActions";
import NotificationActions from "../../actions/NotificationActions";

class WalletManage extends BaseComponent {
    static getPropsFromStores() {
        return WalletManagerStore.getState();
    }

    static getStores() {
        return [WalletManagerStore];
    }

    constructor(props) {
        super(props);
        this.state = {names: props.wallet_names};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.wallet_names.size != this.props.wallet_names.size) {
            this.setState({names: nextProps.wallet_names});
        }
    }

    onImportKeyClick(e) {
        e.preventDefault();
        this.context.router.push("/settings/import-key");
    }

    onBackupClick(e) {
        e.preventDefault();
        this.context.router.push("/settings/backup");
    }

    onImportBackupClick(e) {
        e.preventDefault();
        this.context.router.push("/settings/import-backup");
    }

    onModifyPasswordClick(e) {
        e.preventDefault();
        this.context.router.push("/settings/change-password");
    }

    onWalletChange(item) {
        WalletActions.setWallet(item.value);
    }

    onDeleteWallet(item) {
        let names = this.props.wallet_names;
        let size = names.size;

        WalletManagerStore.onDeleteWallet(item.value);
        if (this.props.current_wallet === item.value) {
            if (size > 1) {
                let wn = null;
                names.forEach(name => {
                    if (name !== item.value) {
                        wn = name;
                    }
                });
                if (wn) WalletActions.setWallet(wn);
            } else {
                setTimeout(() => {
                    window.location.reload();
                }, 250);
            }
        }
    }

    render() {
        let wallets = [];
        //console.debug(this.props.wallet_names);
        this.state.names.forEach(name => {
            wallets.push({text: name, value: name});
        });
        let current_wallet = this.props.current_wallet;
        return (
            <div className="content">
                <XNSelect isDelete={true} data={wallets} label={this.formatMessage('settings_currentWallet')}
                          value={current_wallet}
                          onChange={this.onWalletChange.bind(this)}
                          onDeleteItem={this.onDeleteWallet.bind(this)}
                />
                <XNFullButton label={this.formatMessage('wallet_importKey')}
                              onClick={this.onImportKeyClick.bind(this)}/>
                <XNFullButton label={this.formatMessage('wallet_backup')}
                              onClick={this.onBackupClick.bind(this)}/>
                <XNFullButton label={this.formatMessage('wallet_importBackup')}
                              onClick={this.onImportBackupClick.bind(this)}/>
                <XNFullButton label={this.formatMessage('wallet_modifyPassword')}
                              onClick={this.onModifyPasswordClick.bind(this)}/>
            </div>
        );

    }
}

export default connectToStores(WalletManage);