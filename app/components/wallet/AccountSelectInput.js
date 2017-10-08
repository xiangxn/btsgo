/**
 * Created by xiangxn on 2017/2/19.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import utils from "../../../common/utils";
import BindToChainState from "../Utility/BindToChainState";
import AccountImage from "../Utility/AccountImage";
import ChainTypes from "../Utility/ChainTypes";
import {ChainStore, PublicKey, ChainValidation} from "bitsharesjs";

class AccountSelectInput extends BaseComponent {
    static propTypes = {
        error: React.PropTypes.element,
        onChange: React.PropTypes.func, // 用户输入时调用
        onAccountChanged: React.PropTypes.func, // 账户选择变化时调用
        accountName: React.PropTypes.string, // 用户输入的当前账户名
        account: ChainTypes.ChainAccount, // 绑定的账户对象
        lable: React.PropTypes.string,//显示标题
        placeholder: React.PropTypes.string,//输入框提示内容
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.onAccountChanged && this.props.account)
            this.props.onAccountChanged(this.props.account);
    }

    componentWillReceiveProps(newProps) {
        if ((this.props.onAccountChanged && newProps.account) && newProps.account !== this.props.account)
            this.props.onAccountChanged(newProps.account);
    }

    getNameType(value) {
        if (!value) return null;
        if (value[0] === "#" && utils.is_object_id("1.2." + value.substring(1))) return "id";
        if (ChainValidation.is_account_name(value, true)) return "name";
        if (this.props.allowPubKey && PublicKey.fromPublicKeyString(value)) return "pubkey";
        return null;
    }

    onInputChange(e) {
        let value = e.target.value.trim();
        if (!this.props.allowUppercase) {
            value = value.toLowerCase();
        }
        let newValue = value.match(/(?:#\/account\/)(.*)(?:\/overview)/);
        if (newValue) value = newValue[1];

        if (this.props.onChange && value !== this.props.accountName) this.props.onChange(value);
    }

    render() {
        let type = this.getNameType(this.props.accountName);
        let lookup_display;
        if (this.props.allowPubKey) {
            if (type === "pubkey") lookup_display = "Public Key";
        } else if (this.props.account) {
            if (type === "name") lookup_display = "#" + this.props.account.get("id").substring(4);
            else if (type === "id") lookup_display = this.props.account.get("name");
        }
        let member_status = null;
        if (this.props.account)
            member_status = this.formatMessage("transfer_member_" + ChainStore.getAccountMemberStatus(this.props.account));
        return (
            <div className="text-img-input">
                <AccountImage account={this.props.account ? this.props.account.get("name") : null}/>
                <div className="placeholder"></div>
                <div className="text-box">
                    <div className="label">
                        <span>{this.props.lable}</span><span>{member_status} {lookup_display}</span>
                    </div>
                    <div className="input">
                        <input type="text" onChange={this.onInputChange.bind(this)}
                               value={this.props.accountName || ""}
                               placeholder={this.props.placeholder}/>
                    </div>
                </div>
                <div className="error">{this.props.error}</div>
            </div>
        );
    }
}
export default BindToChainState(AccountSelectInput, {keep_updating: true})