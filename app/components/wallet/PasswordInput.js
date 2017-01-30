/**
 * Created by xiangxn on 2017/1/28.
 */
import React, {PropTypes} from "react";
import BaseComponent from "../BaseComponent";

class PasswordInput extends BaseComponent {

    static propTypes = {
        onChange: PropTypes.func,
        onEnter: PropTypes.func,
        confirmation: PropTypes.bool,
        wrongPassword: PropTypes.bool,
        noValidation: PropTypes.bool
    };

    static defaultProps = {
        confirmation: false,
        wrongPassword: false,
        noValidation: false
    };

    constructor() {
        super();
        this.handleChange = this.handleChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.state = {value: "", error: null, wrong: false, doesnt_match: false};
    }

    value() {
        let node = this.refs.password;
        return node ? node.value : "";
    }

    clear() {
        this.refs.password.value = "";
        if (this.props.confirmation) this.refs.confirm_password.value = "";
    }

    focus() {
        this.refs.password.focus();
    }

    valid() {
        return !(this.state.error || this.state.wrong || this.state.doesnt_match) && this.state.value.length >= 8;
    }

    handleChange(e) {
        e.preventDefault();
        e.stopPropagation();
        const confirmation = this.props.confirmation ? this.refs.confirm_password.value : true;
        const password = this.refs.password.value;
        const doesnt_match = this.props.confirmation ? confirmation && password !== confirmation : false;
        if (!this.props.noValidation && !this.state.error && (password.length > 0 && password.length < 8))
            this.state.error = this.formatMessage('wallet_createErrMsg4');
        if(doesnt_match)
            this.state.error = this.formatMessage('wallet_createErrMsg5');
        if(this.state.wrong || this.props.wrongPassword)
            this.state.error = this.formatMessage('wallet_createErrMsg6');
        let state = {
            valid: !this.state.error && !this.state.wrong
            && !(this.props.confirmation && doesnt_match)
            && confirmation && password.length >= 8,
            value: password,
            error: this.state.error,
            doesnt_match
        };
        if (this.props.onChange) this.props.onChange(state);
        this.setState(state);
        this.setState({error:null});
    }

    onKeyDown(e) {
        if (this.props.onEnter && e.keyCode === 13) this.props.onEnter(e);
    }

    render() {
        return (
            <div>
                <div className="text-input">
                    <div className="text-label">{this.formatMessage("wallet_password")}</div>
                    <input autoComplete="off" type="password"
                           onChange={this.handleChange}
                           ref="password"
                           placeholder={this.formatMessage("wallet_password_ph")}/>
                </div>
                {!this.props.confirmation ? null :
                    <div className="text-input">
                        <div className="text-label">{this.formatMessage("wallet_confirmPassword")}</div>
                        <input autoComplete="off" type="password"
                               onChange={this.handleChange}
                               ref="confirm_password"
                               placeholder={this.formatMessage("wallet_confirmPassword_ph")}/>
                    </div>
                }
            </div>
        );
    }
}
export default PasswordInput;