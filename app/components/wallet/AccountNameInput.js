/**
 * Created by xiangxn on 2017/1/28.
 */

import React, {PropTypes} from "react";
import BaseComponent from "../BaseComponent";

import {ChainValidation} from "bitsharesjs"
import AltContainer from "alt-container";

//stores
import AccountStore from "../../stores/AccountStore";

//actions
import AccountActions from "../../actions/AccountActions";

class AccountNameInput extends BaseComponent {
    static propTypes = {
        id: PropTypes.string,
        placeholder: PropTypes.string,
        initial_value: PropTypes.string,
        onChange: PropTypes.func,
        onEnter: PropTypes.func,
        accountShouldExist: PropTypes.bool,
        accountShouldNotExist: PropTypes.bool,
        cheapNameOnly: PropTypes.bool
    };
/*

    static getPropsFromStores() {
        return AccountStore.getState()
    }

    static getStores() {
        return [AccountStore];
    }
*/

    constructor(props) {
        super(props);
        this.state = {
            value: null,
            error: null,
            existing_account: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.getValue=this.getValue.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.value !== this.state.value
            || nextState.error !== this.state.error
            || nextState.account_name !== this.state.account_name
            || nextState.existing_account !== this.state.existing_account
            || nextProps.searchAccounts !== this.props.searchAccounts
    }

    componentDidUpdate() {
        let error = this.getError()||this.state.warning;
        if (this.props.onChange) this.props.onChange(
            {value: this.state.value, valid: !this.getError(), errMsg: error}
        );
    }

    getValue() {
        return this.state.value;
    }

    setValue(value) {
        this.setState({value});
    }

    clear() {
        this.setState({account_name: null, error: null})
    }

    focus() {
        this.refs.input.focus();
    }

    valid() {
        return !this.getError();
    }

    getError() {
        if (this.state.value === null) return null;
        let error = null;
        if (this.state.error) {
            error = this.state.error;
        } else if (this.props.accountShouldExist || this.props.accountShouldNotExist) {
            let account = this.props.searchAccounts.find(a => a === this.state.value);
            if (this.props.accountShouldNotExist && account) {
                error = this.formatMessage('wallet_nameExist');
            }
            if (this.props.accountShouldExist && !account) {
                error = this.formatMessage('wallet_nameNotFound');
            }
        }
        return error;
    }

    validateAccountName(value) {
        this.state.error = value === "" ?
            this.formatMessage("wallet_createErrMsg3") :
            ChainValidation.is_account_name_error(value);

        this.state.warning = null;
        if (this.props.cheapNameOnly) {
            if (!this.state.error && !ChainValidation.is_cheap_name(value))
                this.state.error = this.formatMessage("wallet_createErrMsg");
        } else {
            if (!this.state.error && !ChainValidation.is_cheap_name(value))
                this.state.warning = this.formatMessage("wallet_createErrMsg2");
        }
        this.setState({value: value, warning: this.state.warning, error: this.state.error});
        //if (this.props.onChange) this.props.onChange({value: value, valid: !this.getError(), errMsg: this.state.error});
        if (this.props.accountShouldExist || this.props.accountShouldNotExist) AccountActions.accountSearch(value);
    }

    handleChange(e) {
        e.preventDefault();
        e.stopPropagation();
        var account_name = e.target.value.toLowerCase()
        account_name = account_name.match(/[a-z0-9\.-]+/)
        account_name = account_name ? account_name[0] : null
        this.setState({account_name})
        this.validateAccountName(account_name);
    }

    onKeyDown(e) {
        if (this.props.onEnter && event.keyCode === 13) this.props.onEnter(e);
    }

    render() {
        return (
            <div className="text-input">
                <div className="text-label">{this.formatMessage("wallet_accountName")}</div>
                <input onChange={this.handleChange} type="text"
                       onKeyDown={this.onKeyDown}
                       placeholder={this.props.placeholder}
                       value={this.state.account_name || this.props.initial_value}
                />
            </div>
        );
    }
}

//export default connectToStores(AccountNameInput);
export default class StoreWrapper extends React.Component {

    render() {

        return (
            <AltContainer stores={[AccountStore]}
                          inject={{
                              searchAccounts: () => {
                                  return AccountStore.getState().searchAccounts;
                              }
                          }}
            >
                <AccountNameInput
                    ref="nameInput"
                    {...this.props}
                />
            </AltContainer>
        )
    }
}