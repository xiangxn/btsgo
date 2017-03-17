/**
 * Created by necklace on 2017/1/12.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import PasswordInput from "../wallet/PasswordInput";
import TextLoading from "../TextLoading";

//stores
import WalletDb from "../../stores/WalletDb";

//actions
import NotificationActions from "../../actions/NotificationActions";

class ChangePassword extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = this.initState();
    }

    initState() {
        return {error_message: null, oldPwd: '', newPwd: '', loading: false};
    }

    onOldPwdChange(e) {
        this.setState({oldPwd: e.target.value});
    }

    onNewPwdChange(e) {
        if (e.error) {
            this.setState({error_message: e.error, newPwd: null});
        } else {
            this.setState({error_message: null, newPwd: e.value});
        }
    }

    onAccept(e) {
        e.preventDefault();
        let {oldPwd, newPwd} = this.state;
        this.setState({loading: true});
        if (WalletDb.validatePassword(oldPwd)) {
            WalletDb.changePassword(oldPwd, newPwd, true)
                .then(() => {
                    NotificationActions.success("Password changed");
                    this.setState(this.initState());
                    this.context.router.push("/settings/backup");
                })
                .catch(error => {
                    console.error(error);
                    NotificationActions.error("Unable to change password: " + error);
                    this.setState({loading: false});
                });
        } else {
            NotificationActions.error("Invalid Password");
        }
    }

    render() {
        return (
            <div className="content">
                <div className="text-input">
                    <div className="text-label">{this.formatMessage('wallet_oldPassword')}</div>
                    <input value={this.state.oldPwd} onChange={this.onOldPwdChange.bind(this)} type="password"
                           placeholder={this.formatMessage('wallet_oldPassword_ph')}/>
                </div>
                <PasswordInput confirmation={true} onChange={this.onNewPwdChange.bind(this)}/>
                <div className="operate">
                    {this.state.loading ? <TextLoading/> :
                        <input onClick={this.onAccept.bind(this)} className="green-btn" type="button"
                               value={this.formatMessage('btn_ok')}/>
                    }
                </div>
                {this.state.error_message === null ? null :
                    <div className="message-box">
                        {this.state.error_message}
                    </div>
                }
            </div>
        );
    }
}

export default ChangePassword;