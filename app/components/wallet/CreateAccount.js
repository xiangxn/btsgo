/**
 * Created by admin on 2017/1/4.
 */

import React, {Component} from "react";
import {intlShape} from 'react-intl';

class CreeateAccount extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="content">
                <div className="text-input">
                    <div>{this.context.intl.formatMessage({id: "wallet_accountName"})}</div>
                    <input type="text" placeholder={this.context.intl.formatMessage({id: "wallet_accountName_ph"})}/>
                </div>
                <div className="text-input">
                    <div>{this.context.intl.formatMessage({id:"wallet_password"})}</div>
                    <input type="password" placeholder={this.context.intl.formatMessage({id:"wallet_password_ph"})}/>
                </div>
                <div className="text-input">
                    <div>{this.context.intl.formatMessage({id:"wallet_confirmPassword"})}</div>
                    <input type="password" placeholder={this.context.intl.formatMessage({id:"wallet_confirmPassword_ph"})}/>
                </div>
                <div className="operate">
                    <input className="green-btn" type="button" value={this.context.intl.formatMessage({id:'btn_ok'})}/>
                </div>
                <div className="message-box">
                    {this.context.intl.formatMessage({id:"wallet_createErrMsg"})}
                </div>
            </div>
        );
    }
}

CreeateAccount.contextTypes = {
    intl: intlShape.isRequired,
    router: React.PropTypes.object
};

export default CreeateAccount;