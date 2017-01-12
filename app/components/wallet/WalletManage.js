/**
 * Created by admin on 2017/1/11.
 */
import React from "react";
import XNFullButton from "../form/XNFullButton";
import {intlShape, FormattedMessage} from 'react-intl';

class WalletManage extends React.Component {
    constructor(props) {
        super(props);
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

    render() {
        return (
            <div className="content">
                <XNFullButton label={this.context.intl.formatMessage({id: 'wallet_importKey'})}
                              onClick={this.onImportKeyClick.bind(this)}/>
                <XNFullButton label={this.context.intl.formatMessage({id: 'wallet_backup'})}
                              onClick={this.onBackupClick.bind(this)}/>
                <XNFullButton label={this.context.intl.formatMessage({id: 'wallet_importBackup'})}
                              onClick={this.onImportBackupClick.bind(this)}/>
                <XNFullButton label={this.context.intl.formatMessage({id: 'wallet_modifyPassword'})}
                              onClick={this.onModifyPasswordClick.bind(this)}/>
            </div>
        );

    }
}

WalletManage.contextTypes = {
    intl: intlShape.isRequired,
    router: React.PropTypes.object
};

export default WalletManage;