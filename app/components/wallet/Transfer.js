/**
 * Created by necklace on 2017/1/22.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import AccountSelectInput from "../wallet/AccountSelectInput";
import AmountSelector from "../wallet/AmountSelectInput";
import utils from "../../../common/utils";
import connectToStores from 'alt-utils/lib/connectToStores';
import BalanceComponent from "../Utility/BalanceComponent";

//stores
import AccountStore from "../../stores/AccountStore";
import {ChainStore} from "bitsharesjs";
import AssetStore from "../../stores/AssetStore";
import TransactionConfirmStore from "../../stores/TransactionConfirmStore";

//actions
import AccountActions from "../../actions/AccountActions";

class Transfer extends BaseComponent {
    static getInitialState() {
        return {
            from_name: "",
            to_name: "",
            from_account: null,
            to_account: null,
            amount: "",
            asset_id: null,
            asset: null,
            memo: "",
            error: null,
            propose: false,
            propose_account: "",
            feeAsset: null,
            fee_asset_id: "1.3.0"
        };
    };

    constructor(props) {
        super(props);
        this.state = Transfer.getInitialState();
        let {query} = this.props.location;

        if (query.from) {
            this.state.from_name = query.from;
            ChainStore.getAccount(query.from);
        }
        if (query.to) {
            this.state.to_name = query.to;
            ChainStore.getAccount(query.to);
        }
        if (query.amount) this.state.amount = query.amount;
        if (query.asset) {
            this.state.asset_id = query.asset;
            this.state.asset = ChainStore.getAsset(query.asset);
        }
        if (query.memo) this.state.memo = query.memo;
        let currentAccount = AccountStore.getState().currentAccount;
        if (!this.state.from_name && query.to !== currentAccount) this.state.from_name = currentAccount;
        this.onTrxIncluded = this.onTrxIncluded.bind(this);
    }

    componentWillMount() {
        this.nestedRef = null;
    }

    onFromAccChange(from_account) {
        this.setState({from_account, error: null});
    }

    onFromChange(from_name) {
        let asset = undefined;
        let amount = undefined;
        this.setState({from_name, error: null, propose: false, propose_account: ""});
    }

    onToAccChange(to_account) {
        this.setState({to_account, error: null});
    }

    onToChange(to_name) {
        this.setState({to_name, error: null});
    }

    onAmountChanged({amount, asset}) {
        if (!asset) {
            return;
        }
        this.setState({amount, asset, asset_id: asset.get("id"), error: null});
    }

    onMemoChanged(e) {
        this.setState({memo: e.target.value});
    }

    onFeeChanged({asset}) {
        this.setState({feeAsset: asset, error: null});
    }

    setNestedRef(ref) {
        this.nestedRef = ref;
    }

    /**
     * 点击余额
     * @param asset_id
     * @param balance_id
     * @param fee
     * @param fee_asset_id
     * @param e
     */
    onBalanceClick(asset_id, balance_id, fee, fee_asset_id, e) {
        let balanceObject = ChainStore.getObject(balance_id);
        let transferAsset = ChainStore.getObject(asset_id);
        //let feeAsset = ChainStore.getObject(fee_asset_id);
        if (balanceObject) {
            let amount = utils.get_asset_amount(balanceObject.get("balance"), transferAsset);
            amount = parseFloat((amount - (asset_id === fee_asset_id ? fee : 0)).toFixed(8));
            this.setState({amount});
        }
    }

    onTrxIncluded(confirm_store_state) {
        if (confirm_store_state.included && confirm_store_state.broadcasted_transaction) {
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.reset();
        } else if (confirm_store_state.closed) {
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.reset();
        }
    }

    onDoTransfer(e) {
        e.preventDefault();
        this.setState({error: null});
        let asset = this.state.asset;
        let precision = utils.get_asset_precision(asset.get("precision"));
        let amount = this.state.amount.replace(/,/g, "");

        AccountActions.transfer(
            this.state.from_account.get("id"),
            this.state.to_account.get("id"),
            parseInt(amount * precision, 10),
            asset.get("id"),
            this.state.memo ? new Buffer(this.state.memo, "utf-8") : this.state.memo,
            this.state.propose ? this.state.propose_account : null,
            this.state.feeAsset ? this.state.feeAsset.get("id") : "1.3.0"
        ).then(() => {
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.listen(this.onTrxIncluded);
        }).catch(e => {
            let msg = e.message ? e.message.split('\n')[1] : null;
            console.error("error: ", e, msg);
            this.setState({error: msg});
        });
    }

    render() {
        //console.debug('props', this.props)
        let from_error = null;
        let {
            from_account, to_account, asset, asset_id, propose,
            amount, error, to_name, from_name, memo, feeAsset, fee_asset_id
        } = this.state;
        //console.debug('state:', this.state)
        let from_my_account = AccountStore.isMyAccount(from_account);
        if (from_account && !from_my_account && !propose) {
            from_error = <span>
                {this.formatMessage('account_not_yours')}
            </span>;
        }
        let asset_types = [], fee_asset_types = [];
        let balance = null;
        let globalObject = ChainStore.getObject("2.0.0");
        let fee = utils.estimateFee("transfer", null, globalObject);

        if (from_account && from_account.get("balances") && !from_error) {
            let account_balances = from_account.get("balances").toJS();
            asset_types = Object.keys(account_balances).sort(utils.sortID);
            fee_asset_types = Object.keys(account_balances).sort(utils.sortID);
            for (let key in account_balances) {
                let asset = ChainStore.getObject(key);
                let balanceObject = ChainStore.getObject(account_balances[key]);
                if (balanceObject && balanceObject.get("balance") === 0) {
                    asset_types.splice(asset_types.indexOf(key), 1);
                    if (fee_asset_types.indexOf(key) !== -1) {
                        fee_asset_types.splice(fee_asset_types.indexOf(key), 1);
                    }
                }

                if (asset) {
                    if (asset.get("id") !== "1.3.0" && !utils.isValidPrice(asset.getIn(["options", "core_exchange_rate"]))) {
                        fee_asset_types.splice(fee_asset_types.indexOf(key), 1);
                    }
                }
            }

            // 完成估价
            let core = ChainStore.getObject("1.3.0");
            if (feeAsset && feeAsset.get("id") !== "1.3.0" && core) {

                let price = utils.convertPrice(core, feeAsset.getIn(["options", "core_exchange_rate"]).toJS(), null, feeAsset.get("id"));
                fee = utils.convertValue(price, fee, core, feeAsset);

                if (parseInt(fee, 10) !== fee) {
                    fee += 1;
                }
            }
            if (core) {
                fee = utils.limitByPrecision(utils.get_asset_amount(fee, feeAsset || core), feeAsset ? feeAsset.get("precision") : core.get("precision"));
            }
            if (asset_types.length > 0) {
                let current_asset_id = asset ? asset.get("id") : asset_types[0];
                let feeID = feeAsset ? feeAsset.get("id") : "1.3.0";
                let accBalance = account_balances[current_asset_id];
                //console.debug('accBalance:',accBalance);
                balance = (
                    <span className="orangeRed underline"
                          onClick={this.onBalanceClick.bind(this, current_asset_id, accBalance, fee, feeID)}>
                                <BalanceComponent balance={accBalance}/>
                    </span>
                );
            } else {
                balance = null;
            }
        } else {
            let core = ChainStore.getObject("1.3.0");
            fee_asset_types = ["1.3.0"];
            if (core) {
                fee = utils.limitByPrecision(utils.get_asset_amount(fee, feeAsset || core), feeAsset ? feeAsset.get("precision") : core.get("precision"));
            }
        }
        let submitButtonClass = "green-btn";
        if (!from_account || !to_account || !amount || amount === "0" || !asset || from_error)
            submitButtonClass = "disabled-btn";
        return (
            <div className="content">
                <AccountSelectInput
                    lable={this.formatMessage('transfer_from')}
                    placeholder={this.formatMessage('transfer_from_ph')}
                    account={from_name}
                    accountName={from_name}
                    error={from_error}
                    onChange={this.onFromChange.bind(this)} onAccountChanged={this.onFromAccChange.bind(this)}/>
                <AccountSelectInput
                    lable={this.formatMessage('transfer_to')}
                    placeholder={this.formatMessage('transfer_to_ph')}
                    account={to_name}
                    accountName={to_name}
                    onChange={this.onToChange.bind(this)} onAccountChanged={this.onToAccChange.bind(this)}/>
                <AmountSelector
                    label={this.formatMessage('transfer_amount')}
                    amount={amount}
                    onChange={this.onAmountChanged.bind(this)}
                    asset={asset_types.length > 0 && asset ? asset.get("id") : ( asset_id ? asset_id : asset_types[0])}
                    assets={asset_types}
                    balance={balance}
                    placeholder={this.formatMessage('transfer_amount_ph')}/>
                <div className="text-img-input">
                    <div className="text-box clear-leftpadding">
                        <div className="label"><span>{this.formatMessage('transfer_memo')}</span></div>
                        <div className="input">
                            <input type="text" value={memo} placeholder={this.formatMessage('transfer_memo_ph')}
                                   onChange={this.onMemoChanged.bind(this)}/>
                        </div>
                    </div>
                </div>
                <AmountSelector
                    refCallback={this.setNestedRef.bind(this)}
                    label={this.formatMessage('transfer_chargefee')} disabled={true}
                    amount={fee}
                    onChange={this.onFeeChanged.bind(this)}
                    asset={fee_asset_types.length && feeAsset ? feeAsset.get("id") : ( fee_asset_types.length === 1 ? fee_asset_types[0] : fee_asset_id ? fee_asset_id : fee_asset_types[0])}
                    assets={fee_asset_types}
                />

                <div className="operate">
                    <input type="button" className={submitButtonClass} value={this.formatMessage('transfer_send')}
                           onClick={this.onDoTransfer.bind(this)}/>
                </div>
            </div>
        );
    }
}
class TransferContainer extends React.Component {
    static getPropsFromStores() {
        return {
            cachedAccounts: AccountStore.getState().cachedAccounts,
            myAccounts: AccountStore.getMyAccounts(),
            accountBalances: AccountStore.getState().balances,
            assets: AssetStore.getState().assets,
            account_name_to_id: AccountStore.getState().account_name_to_id,
            searchAccounts: AccountStore.getState().searchAccounts
        };
    }

    static getStores() {
        return [AccountStore, AssetStore];
    }

    render() {
        //console.debug('props:',this.props)
        return <Transfer {...this.props} />;
    }
}
export default connectToStores(TransferContainer);