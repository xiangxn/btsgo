/**
 * Created by necklace on 2017/1/12.
 */

import React from "react";
import {intlShape} from 'react-intl';

class UnlockWallet extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div className="content">
                <div className="text-input">
                    <div>{this.context.intl.formatMessage({id: 'wallet_password'})}</div>
                    <input type="text" placeholder={this.context.intl.formatMessage({id: 'wallet_password_ph'})}/>
                </div>
                <div className="operate">
                    <input className="green-btn" type="button" value={this.context.intl.formatMessage({id:'btn_ok'})}/>
                </div>
                <div className="message-box">
                    {this.context.intl.formatMessage({id:"wallet_passworkErrMsg"})}
                </div>
            </div>
        );
    }
}

UnlockWallet.contextTypes = {
    intl: intlShape.isRequired,
    router: React.PropTypes.object
};

export default UnlockWallet;