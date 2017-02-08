/**
 * Created by necklace on 2017/1/23.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import BindToChainState from "../Utility/BindToChainState";
import ChainTypes from "../Utility/ChainTypes";
import accountUtils from "../../../common/account_utils";
import connectToStores from 'alt-utils/lib/connectToStores';

//actions
import AccountActions from "../../actions/AccountActions";

//stores
import AccountStore from "../../stores/AccountStore";
import SettingsStore from "../../stores/SettingsStore";
import WalletUnlockStore from "../../stores/WalletUnlockStore";

class Balance extends BaseComponent {
    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired
    };
    static defaultProps = {
        account: "props.account_name"
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.account) {
            if (AccountStore.isMyAccount(this.props.account)) {
                AccountActions.setCurrentAccount.defer(this.props.account.get("name"));
            }
            // 在这里提取可能的费用资产，以避免以后的异步问题(will resolve assets)
            accountUtils.getPossibleFees(this.props.account, "transfer");
        }
    }

    render() {
        let account = this.context.router.location.state.account;
        console.debug("Account:", account);
        return (
            <div className="content vertical-flex vertical-box clear-toppadding">
                <div className="balance vertical-flex vertical-box">
                    <div className="balance-account">
                        <label>账户：</label>
                        <label>{account}</label>
                    </div>
                    <div className="separate2"></div>
                    <div className="balance-header">
                        <span>{this.formatMessage("balance_assets")}</span>
                        <span>{this.formatMessage("balance_conversion")}</span>
                    </div>
                    <div className="separate2"></div>
                    <div className="balance-body vertical-flex scroll">
                        <div className="balance-row">
                            <span>666666.888888 BTS</span>
                            <div>
                                666666.888888 BTS
                            </div>
                        </div>
                        <div className="balance-row">
                            <span>666666.888888 BTS</span>
                            <div>
                                666666.888888 BTS
                            </div>
                        </div>
                        <div className="balance-row">
                            <span>666666.888888 BTS</span>
                            <div>
                                666666.888888 BTS
                            </div>
                        </div>
                        <div className="balance-row">
                            <span>666666.888888 BTS</span>
                            <div>
                                666666.888888 BTS
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
Balance = BindToChainState(Balance, {keep_updating: true, show_loader: true});
class BalanceWrapper extends BaseComponent {
    static getPropsFromStores() {
        return {
            linkedAccounts: AccountStore.getState().linkedAccounts,
            searchAccounts: AccountStore.getState().searchAccounts,
            settings: SettingsStore.getState().settings,
            wallet_locked: WalletUnlockStore.getState().locked,
            myAccounts:  AccountStore.getState().myAccounts
        };
    }
    static getStores() {
        return [AccountStore, SettingsStore, WalletUnlockStore];
    }
    render() {
        let account_name = this.context.router.location.state.account;
        if (account_name) {
            return <Balance {...this.props} account_name={account_name}/>;
        } else {
            return <div></div>;
        }
    }
}
export default connectToStores(BalanceWrapper);