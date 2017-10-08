/**
 * Created by necklace on 2017/1/23.
 */
import React from "react";
import BaseComponent, {CORE_ASSET_ID} from "../BaseComponent";
import BindToChainState from "../Utility/BindToChainState";
import ChainTypes from "../Utility/ChainTypes";
import accountUtils from "../../../common/account_utils";
import connectToStores from 'alt-utils/lib/connectToStores';
import {BalanceValueComponent, EquivalentValueComponent} from "../Utility/ValueComponent";
import BalanceComponent from "../Utility/BalanceComponent";
import TotalBalanceValue from "../Utility/TotalBalanceValue";
import Immutable from "immutable";
import FormattedAsset from "../Utility/FormattedAsset";
import utils from "../../../common/utils";
import asset_utils from "../../../common/asset_utils";
import KeysView from "../wallet/KeysView";

//actions
import AccountActions from "../../actions/AccountActions";

//stores
import AccountStore from "../../stores/AccountStore";
import SettingsStore from "../../stores/SettingsStore";
import WalletUnlockStore from "../../stores/WalletUnlockStore";
import {ChainStore} from "bitsharesjs";

class Balance extends BaseComponent {
    static propTypes = {
        balanceAssets: ChainTypes.ChainAssetsList
    };

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !utils.are_equal_shallow(nextProps.balanceAssets, this.props.balanceAssets) || !utils.are_equal_shallow(nextProps.balances, this.props.balances) ||
            nextProps.account !== this.props.account ||
            nextProps.settings !== this.props.settings ||
            nextProps.hiddenAssets !== this.props.hiddenAssets
        );
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

    /**
     * 渲染资产项
     * @param balanceList {Immutable.List()}
     */
    renderBalances(balanceList) {
        let {settings, orders} = this.props;
        let preferredUnit = settings.get("unit") || CORE_ASSET_ID;
        let showAssetPercent = true;

        let balances = [];
        balanceList.forEach((balance, i) => {
            let balanceObject = ChainStore.getObject(balance);
            let asset_type = balanceObject.get("asset_type");
            let asset = ChainStore.getObject(asset_type);
            let isBitAsset = asset && asset.has("bitasset_data_id");
            let core_asset = ChainStore.getAsset(CORE_ASSET_ID);

            let hasBalance = !!balanceObject.get("balance");
            let hasOnOrder = !!orders[asset_type];

            let onOrders = hasOnOrder ? <FormattedAsset amount={orders[asset_type]} asset={asset_type}/> : null;

            balances.push(
                <div className="balance-row" key={'balanceList' + i}>
                    <span>
                        {hasBalance ? <BalanceComponent balance={balance} assetInfo={null}/> : null}
                        {hasOnOrder ? <span>({onOrders})</span> : null}
                    </span>
                    <div>
                        {hasBalance ? <BalanceValueComponent balance={balance} toAsset={preferredUnit}/> : null}
                        {hasOnOrder ?
                            <span>
                                (<EquivalentValueComponent amount={orders[asset_type]} fromAsset={asset_type}
                                                           noDecimals={true} toAsset={preferredUnit}/>)</span> : null}
                    </div>
                </div>
            );

        });
        return balances;
    }

    render() {
        let {account, hiddenAssets, settings, orders} = this.props;

        if (!account) {
            return null;
        }

        let call_orders = [], collateral = 0, debt = {};

        if (account.toJS && account.has("call_orders")) call_orders = account.get("call_orders").toJS();
        let includedBalances, hiddenBalances;
        let account_balances = account.get("balances");

        let includedBalancesList = Immutable.List(), hiddenBalancesList = Immutable.List();

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

        if (account_balances) {
            // 过滤掉余额为0和不在订单里的资产
            account_balances = account_balances.filter((a, index) => {
                let balanceObject = ChainStore.getObject(a);
                if (!balanceObject.get("balance") && !orders[index]) {
                    return false;
                } else {
                    return true;
                }
            });

            // 分离隐藏和包含的资产
            account_balances.forEach((a, asset_type) => {
                if (hiddenAssets.includes(asset_type)) {
                    hiddenBalancesList = hiddenBalancesList.push(a);
                } else {
                    includedBalancesList = includedBalancesList.push(a);
                }
            });

            includedBalances = this.renderBalances(includedBalancesList);
            hiddenBalances = this.renderBalances(hiddenBalancesList);
        }

        let totalBalanceList = includedBalancesList.concat(hiddenBalancesList);
        let totalBalance = totalBalanceList.size ?
            <TotalBalanceValue
                balances={totalBalanceList}
                openOrders={orders}
                debt={debt}
                collateral={collateral}
                noPrefix
            /> : null;
        return (
            <div className="content vertical-flex vertical-box clear-toppadding">
                <div className="balance vertical-flex vertical-box">
                    <div className="balance-account">
                        <label>{this.formatMessage('account_name')}：</label>
                        <KeysView account={account}/>
                    </div>
                    <div className="separate2"></div>
                    <div className="balance-header">
                        <span>{this.formatMessage("balance_assets")}</span>
                        <span>{this.formatMessage("balance_conversion")}</span>
                    </div>
                    <div className="separate2"></div>
                    <div className="balance-body vertical-flex scroll">
                        {includedBalances}
                        {hiddenBalances}
                        {totalBalanceList.size > 1 ?
                            <div className="balance-row">
                                <span>{this.formatMessage('account_totalBalance')}：</span>
                                {totalBalance}
                            </div>
                            : null}
                    </div>
                </div>
            </div>
        );
    }
}

//Balance = BindToChainState(Balance);
class BalanceWrapper extends BaseComponent {
    static propTypes = {
        balances: ChainTypes.ChainObjectsList,
        orders: ChainTypes.ChainObjectsList
    };

    static defaultProps = {
        balances: Immutable.List(),
        orders: Immutable.List()
    };

    render() {
        let balanceAssets = this.props.balances.map(b => {
            return b && b.get("asset_type");
        }).filter(b => !!b);

        let ordersByAsset = this.props.orders.reduce((orders, o) => {
            if (o.getIn !== undefined && o.getIn !== null) {
                let asset_id = o.getIn(["sell_price", "base", "asset_id"]);
                if (!orders[asset_id]) orders[asset_id] = 0;
                orders[asset_id] += parseInt(o.get("for_sale"), 10);
                return orders;
            }
        }, {});

        for (let id in ordersByAsset) {
            if (balanceAssets.indexOf(id) === -1) {
                balanceAssets.push(id);
            }
        }

        return <Balance {...this.props} orders={ordersByAsset}
                        balanceAssets={Immutable.List(balanceAssets)}/>;
    }
}

BalanceWrapper = BindToChainState(BalanceWrapper);

class BalancePage extends React.Component {
    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired
    };

    static defaultProps = {
        account: "props.account_name"
    };

    render() {
        let account = this.props.account;
        return (
            <BalanceWrapper {...this.props} balances={account.get("balances", null)}
                            orders={account.get("orders", null)}/>
        );
    }
}

BalancePage = BindToChainState(BalancePage, {keep_updating: true, show_loader: true});

class BalancePageWrapper extends BaseComponent {
    static getPropsFromStores() {
        return {
            linkedAccounts: AccountStore.getState().linkedAccounts,
            searchAccounts: AccountStore.getState().searchAccounts,
            settings: SettingsStore.getState().settings,
            hiddenAssets: SettingsStore.getState().hiddenAssets,
            wallet_locked: WalletUnlockStore.getState().locked,
            myAccounts: AccountStore.getMyAccounts()
        };
    }

    static getStores() {
        return [AccountStore, SettingsStore, WalletUnlockStore];
    }

    render() {
        //let account_name = this.context.router.location.state.account;
        let account_name = this.props.params.account;
        return (
            <BalancePage {...this.props} account_name={account_name}/>
        );
    }
}

export default connectToStores(BalancePageWrapper);