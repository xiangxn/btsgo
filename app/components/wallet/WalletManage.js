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

    onImportKeyClick() {

    }

    render() {
        return (
            <div className="content">
                <XNFullButton label={this.context.intl.formatMessage({id: 'wallet_importKey'})}
                              onClick={this.onImportKeyClick.bind(this)}/>
                <XNFullButton label={this.context.intl.formatMessage({id: 'wallet_backup'})}
                              onClick={this.onImportKeyClick.bind(this)}/>
                <XNFullButton label={this.context.intl.formatMessage({id: 'wallet_importBackup'})}
                              onClick={this.onImportKeyClick.bind(this)}/>
                <XNFullButton label={this.context.intl.formatMessage({id: 'wallet_modifyPassword'})}
                              onClick={this.onImportKeyClick.bind(this)}/>
            </div>
        );

    }
}

WalletManage.contextTypes = {
    intl: intlShape.isRequired
};

export default WalletManage;