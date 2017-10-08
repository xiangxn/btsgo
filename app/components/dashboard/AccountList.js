/**
 * Created by necklace on 2017/2/7.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import utils from "../../../common/utils";
import BindToChainState from "../Utility/BindToChainState";
import ChainTypes from "../Utility/ChainTypes";
import Immutable from "immutable";
import TotalBalanceValue from "../Utility/TotalBalanceValue";
import AccountStore from "../../stores/AccountStore";
import {ChainStore} from "bitsharesjs";


class AccountList extends BaseComponent {
    static propTypes = {
        accounts: ChainTypes.ChainAccountsList.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {dashboardFilter: "", inverseSort: true};
    }

    onItemClick(name) {
        //let acc = e.target.parentNode.childNodes[0].innerHTML;
        //this.context.router.push({pathname: '/balance', state: {account: name}});
        this.context.router.push(`/balance/${name}`);
    }

    onFilter(e) {
        this.setState({dashboardFilter: e.target.value.toLowerCase()});
    }

    setSort(field) {
        let inverse = !this.state.inverseSort;
        this.setState({
            inverseSort: inverse
        });
    }

    render() {
        let {dashboardFilter, inverseSort} = this.state;
        let balanceList = Immutable.List();
        let accounts = this.props.accounts
            .filter(a => {
                if (!a) return false;
                return a.get("name").toLowerCase().indexOf(dashboardFilter) !== -1;
            }).sort((a, b) => {
                return utils.sortText(a.get("name"), b.get("name"), inverseSort);
            }).map(account => {
                if (account) {
                    let collateral = 0, debt = {}, openOrders = {};
                    balanceList = balanceList.clear();
                    let accountName = account.get("name");
                    let isLTM = account.get("lifetime_referrer_name") === accountName;
                    let account_orders=account.get("orders");
                    if (account_orders) {
                        account_orders.forEach((orderID, key) => {
                            let order = ChainStore.getObject(orderID);
                            if (order) {
                                let orderAsset = order.getIn(["sell_price", "base", "asset_id"]);
                                if (!openOrders[orderAsset]) {
                                    openOrders[orderAsset] = parseInt(order.get("for_sale"), 10);
                                } else {
                                    openOrders[orderAsset] += parseInt(order.get("for_sale"), 10);
                                }
                            }
                        });
                    }
                    let account_call_orders = account.get("call_orders");
                    if (account_call_orders) {
                        account_call_orders.forEach((callID, key) => {
                            let position = ChainStore.getObject(callID);
                            if (position) {
                                collateral += parseInt(position.get("collateral"), 10);
                                let debtAsset = position.getIn(["call_price", "quote", "asset_id"]);
                                if (!debt[debtAsset]) {
                                    debt[debtAsset] = parseInt(position.get("debt"), 10);
                                } else {
                                    debt[debtAsset] += parseInt(position.get("debt"), 10);
                                }
                            }
                        });
                    }
                    let account_balances = account.get("balances");
                    if (account_balances) {
                        account_balances.forEach(balance => {
                            let balanceAmount = ChainStore.getObject(balance);
                            if (!balanceAmount || !balanceAmount.get("balance")) {
                                return null;
                            }
                            balanceList = balanceList.push(balance);
                        });
                    }

                    let isMyAccount = AccountStore.isMyAccount(account);

                    return (
                        <div key={accountName} className="account-list-row"
                             onClick={this.onItemClick.bind(this, accountName)}>
                            <label className={isLTM ? "orangeRed" : ""}>{accountName}</label>
                            <label><TotalBalanceValue balances={[]} openOrders={openOrders}/></label>
                            <label><TotalBalanceValue balances={[]} collateral={collateral}/></label>
                            <label><TotalBalanceValue noPrefix balances={balanceList} collateral={collateral}
                                                      debt={debt}
                                                      openOrders={openOrders}/></label>
                        </div>
                    );
                }
            });
        return (
            <div className="vertical-flex vertical-box">
                <div className="search-bar">
                    <label>{this.formatMessage("index_account")}</label>
                    <input onChange={this.onFilter.bind(this)} type="text"
                           placeholder={this.formatMessage("index_account_ph")}/>
                </div>
                <div className="account-list-head">
                    <label onClick={this.setSort.bind(this)}>{this.formatMessage("index_account")}</label>
                    <label>{this.formatMessage("index_order")}</label>
                    <label>{this.formatMessage("index_collateral")}</label>
                    <label>{this.formatMessage("index_marketValue")}</label>
                </div>
                <div className="account-list-separate"></div>
                <div className="account-list vertical-flex scroll">
                    {accounts}
                </div>
            </div>
        );
    }
}

AccountList = BindToChainState(AccountList);
export default AccountList;