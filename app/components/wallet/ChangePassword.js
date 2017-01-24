/**
 * Created by necklace on 2017/1/12.
 */
import React from "react";
import {intlShape} from 'react-intl';

class ChangePassword extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div className="content">
                <div className="text-input">
                    <div className="text-label">{this.context.intl.formatMessage({id: 'wallet_oldPassword'})}</div>
                    <input type="text" placeholder={this.context.intl.formatMessage({id: 'wallet_oldPassword_ph'})}/>
                </div>
                <div className="text-input">
                    <div className="text-label">{this.context.intl.formatMessage({id: 'wallet_newPassword'})}</div>
                    <input type="text" placeholder={this.context.intl.formatMessage({id: 'wallet_newPassword_ph'})}/>
                </div>
                <div className="text-input">
                    <div className="text-label">{this.context.intl.formatMessage({id: 'wallet_confirmPassword'})}</div>
                    <input type="text" placeholder={this.context.intl.formatMessage({id: 'wallet_confirmPassword_ph'})}/>
                </div>
                <div className="operate">
                    <input className="green-btn" type="button" value={this.context.intl.formatMessage({id:'btn_ok'})}/>
                </div>
            </div>
        );
    }
}

ChangePassword.contextTypes = {
    intl: intlShape.isRequired,
    router: React.PropTypes.object
};

export default ChangePassword;