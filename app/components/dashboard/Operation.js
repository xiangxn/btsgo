/**
 * Created by necklace on 2017/2/16.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import {ChainStore, ChainTypes as grapheneChainTypes} from "bitsharesjs";
import account_constants from "../../../common/account_constants";
import BlockTime from "../Blockchain/BlockTime";
import FormattedAsset from "../Utility/FormattedAsset";
import utils from "../../../common/utils";
import market_utils from "../../../common/market_utils";
import MemoInfo from "../Blockchain/MemoInfo";
import FormattedPrice from "../Utility/FormattedPrice";
import AccountName from "../Utility/AccountName";

const {operations} = grapheneChainTypes;
let ops = Object.keys(operations);
let listings = account_constants.account_listing;

class Info extends BaseComponent {
    static propTypes = {
        /**
         * 链全局对象
         */
        dynGlobalObject: ChainTypes.ChainObject.isRequired,
    };

    static defaultProps = {
        dynGlobalObject: "2.1.0"
    };

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        let {block, dynGlobalObject} = this.props;
        let last_irreversible_block_num = dynGlobalObject.get("last_irreversible_block_num");
        if (nextProps.dynGlobalObject === this.props.dynGlobalObject) {
            return false;
        }
        return block > last_irreversible_block_num;
    }

    getTrxType(type) {
        let id = "trxTypes_" + ops[type];
        return id;
    }

    render() {
        let {block, fee, type} = this.props;

        let last_irreversible_block_num = this.props.dynGlobalObject.get("last_irreversible_block_num");
        let pending = null;
        if (block > last_irreversible_block_num) {
            pending =
                <span>({this.formatMessage('operation_pending', {blocks: block - last_irreversible_block_num})})</span>
        }
        fee.amount = parseInt(fee.amount, 10);

        return (
            <div className="last-operation-row">
                <span>{this.formatMessage(this.getTrxType(type))}</span>
                <div>
                    <div>{this.props.info}</div>
                    <div>
                        <BlockTime block_number={block}/> - <FormattedAsset amount={fee.amount} asset={fee.asset_id}/>
                        {pending ? <span> - {pending}</span> : null}
                    </div>
                </div>
            </div>
        );
    }
}
Info = BindToChainState(Info, {keep_updating: true});

class Operation extends BaseComponent {
    static propTypes = {
        op: React.PropTypes.array.isRequired,
        current: React.PropTypes.string,
        block: React.PropTypes.number
    };

    static defaultProps = {
        op: [],
        current: "",
        block: null,
    };

    constructor(props) {
        super(props);
        this.getTranslateInfo = this.getTranslateInfo.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        if (!this.props.op || !nextProps.op) {
            return false;
        }
        return !utils.are_equal_shallow(nextProps.op[1], this.props.op[1]);
    }

    linkToAccount(name_or_id) {
        if (!name_or_id) return <span>-</span>;
        return utils.is_object_id(name_or_id) ? <AccountName account={name_or_id}/> : name_or_id;
    }

    linkToAsset(symbol_or_id) {
        return symbol_or_id;
    }

    /**
     * 获取操作的文字描述
     * @param localId 语言id
     * @param keys 数据项
     * @param par 语句内参数
     */
    getTranslateInfo(localId, keys, par) {
        let text = this.formatMessage(localId, par);
        let splitText = utils.get_translation_parts(text);
        keys.forEach(key => {
            if (splitText.indexOf(key.arg)) {
                let value;
                switch (key.type) {
                    case "account":
                        value = this.linkToAccount(key.value);
                        break;
                    case "asset":
                        value = this.linkToAsset(key.value);
                        break;
                    case "amount":
                        value = <FormattedAsset amount={key.value.amount} asset={key.value.asset_id}
                                                decimalOffset={key.decimalOffset}/>
                        break;
                    case "price":
                        value = <FormattedPrice
                            base_asset={key.value.base.asset_id}
                            base_amount={key.value.base.amount}
                            quote_asset={key.value.quote.asset_id}
                            quote_amount={key.value.quote.amount}
                        />
                        break;
                    default:
                        value = key.value;
                        break;
                }

                splitText[splitText.indexOf(key.arg)] = value;
            }
        })

        let finalText = splitText.map((text, index) => {
            return <span key={index}>{text}</span>
        });

        return <span>{finalText}</span>
    }

    render() {
        let {op, current, block} = this.props;
        let line = null, column = null;
        let memoComponent = null;

        switch (ops[op[0]]) {

            case "transfer":

                if (op[1].memo) {
                    memoComponent = <MemoInfo memo={op[1].memo}/>
                }

                op[1].amount.amount = parseFloat(op[1].amount.amount);

                column = (
                    <span>
                        {
                            this.getTranslateInfo(
                                "operation_transfer",
                                [
                                    {type: "account", value: op[1].from, arg: "from"},
                                    {
                                        type: "amount",
                                        value: op[1].amount,
                                        arg: "amount",
                                        decimalOffset: op[1].amount.asset_id === "1.3.0" ? 5 : null
                                    },
                                    {type: "account", value: op[1].to, arg: "to"}
                                ]
                            )
                        } {memoComponent}
                    </span>
                );

                break;

            case "limit_order_create":
                let o = op[1];
                let isAsk = market_utils.isAskOp(op[1]);

                column = (
                    <span>
                        {
                            this.getTranslateInfo(
                                isAsk ? "operation_limit_order_sell" : "operation_limit_order_buy",
                                [
                                    {type: "account", value: op[1].seller, arg: "account"},
                                    {
                                        type: "amount",
                                        value: isAsk ? op[1].amount_to_sell : op[1].min_to_receive,
                                        arg: "amount"
                                    },
                                    {
                                        type: "price",
                                        value: {
                                            base: isAsk ? op[1].min_to_receive : op[1].amount_to_sell,
                                            quote: isAsk ? op[1].amount_to_sell : op[1].min_to_receive
                                        },
                                        arg: "price"
                                    }
                                ]
                            )
                        }
                        </span>
                );
                break;


            case "limit_order_cancel":
                column = (
                    <span>
                        {
                            this.getTranslateInfo(
                                "operation_limit_order_cancel",
                                [
                                    {type: "account", value: op[1].fee_paying_account, arg: "account"},
                                    //{type:'order',value:op[1].order.substring(4),arg:'order'}
                                ],
                                {order: op[1].order.substring(4)}
                            )
                        }
                    </span>
                );
                break;

            case "call_order_update":
                column = (
                    <span>
                        {
                            this.getTranslateInfo(
                                "operation_call_order_update",
                                [
                                    {type: "account", value: op[1].funding_account, arg: "account"},
                                    {type: "asset", value: op[1].delta_debt.asset_id, arg: "debtSymbol"},
                                    {type: "amount", value: op[1].delta_debt, arg: "debt"},
                                    {type: "amount", value: op[1].delta_collateral, arg: "collateral"}
                                ]
                            )
                        }
                    </span>
                );
                break;

            case "key_create":
                column = (
                    <span>
                        {this.formatMessage('transaction_create_key')}
                    </span>
                );
                break;

            case "account_create":
                column = this.getTranslateInfo(
                    "operation_reg_account",
                    [
                        {type: "account", value: op[1].registrar, arg: "registrar"},
                        {type: "account", value: op[1].name, arg: "new_account"}
                    ]
                );
                break;

            case "account_update":
                column = this.getTranslateInfo(
                    "operation_update_account",
                    [{type: "account", value: op[1].account, arg: "account"}]
                );
                break;

            case "account_whitelist":

                let label = op[1].new_listing === listings.no_listing ? "unlisted_by" :
                    op[1].new_listing === listings.white_listed ? "whitelisted_by" :
                        "blacklisted_by";
                column = this.getTranslateInfo(
                    "operation_" + label,
                    [
                        {type: "account", value: op[1].authorizing_account, arg: "lister"},
                        {type: "account", value: op[1].account_to_list, arg: "listee"}
                    ]
                );
                break;

            case "account_upgrade":
                column = this.getTranslateInfo(
                    op[1].upgrade_to_lifetime_member ? "operation_lifetime_upgrade_account" : "operation_annual_upgrade_account",
                    [{type: "account", value: op[1].account_to_upgrade, arg: "account"}]
                );
                break;

            case "account_transfer":
                column = this.getTranslateInfo(
                    "operation_account_transfer",
                    [
                        {type: "account", value: op[1].account_id, arg: "account"},
                        {type: "account", value: op[1].new_owner, arg: "to"}
                    ]
                );
                break;

            case "asset_create":
                column = this.getTranslateInfo(
                    "operation_asset_create",
                    [
                        {type: "account", value: op[1].issuer, arg: "account"},
                        {type: "asset", value: op[1].symbol, arg: "asset"}
                    ]
                );
                break;

            case "asset_update":
            case "asset_update_bitasset":
                column = this.getTranslateInfo(
                    "operation_asset_update",
                    [
                        {type: "account", value: op[1].issuer, arg: "account"},
                        {type: "asset", value: op[1].asset_to_update, arg: "asset"}
                    ]
                );
                break;

            case "asset_update_feed_producers":
                column = this.getTranslateInfo(
                    "operation_asset_update_feed_producers",
                    [
                        {type: "account", value: op[1].issuer, arg: "account"},
                        {type: "asset", value: op[1].asset_to_update, arg: "asset"}
                    ]
                );
                break;

            case "asset_issue":
                if (op[1].memo) {
                    memoComponent = <MemoText memo={op[1].memo}/>
                }
                op[1].asset_to_issue.amount = parseInt(op[1].asset_to_issue.amount, 10);
                column = (
                    <span>
                        {
                            this.getTranslateInfo(
                                "operation_asset_issue",
                                [
                                    {type: "account", value: op[1].issuer, arg: "account"},
                                    {type: "amount", value: op[1].asset_to_issue, arg: "amount"},
                                    {type: "account", value: op[1].issue_to_account, arg: "to"},
                                ]
                            )
                        }
                        {memoComponent}
                    </span>
                );
                break;

            case "asset_fund_fee_pool":
                column = this.getTranslateInfo(
                    "operation_asset_fund_fee_pool",
                    [
                        {type: "account", value: op[1].from_account, arg: "account"},
                        {type: "asset", value: op[1].asset_id, arg: "asset"},
                        {type: "amount", value: {amount: op[1].amount, asset_id: "1.3.0"}, arg: "amount"}
                    ]
                );
                break;

            case "asset_settle":
                column = this.getTranslateInfo(
                    "operation_asset_settle",
                    [
                        {type: "account", value: op[1].account, arg: "account"},
                        {type: "amount", value: op[1].amount, arg: "amount"}
                    ]
                );
                break;

            case "asset_global_settle":
                column = this.getTranslateInfo(
                    "operation_asset_global_settle",
                    [
                        {type: "account", value: op[1].account, arg: "account"},
                        {type: "asset", value: op[1].asset_to_settle, arg: "asset"},
                        {type: "price", value: op[1].price, arg: "price"}
                    ]
                );
                break;

            case "asset_publish_feed":
                column = this.getTranslateInfo(
                    "operation_publish_feed",
                    [
                        {type: "account", value: op[1].publisher, arg: "account"},
                        {type: "price", value: op[1].feed.settlement_price, arg: "price"}
                    ]
                );
                break;

            case "witness_create":
                column = this.getTranslateInfo(
                    "operation_witness_create",
                    [{type: "account", value: op[1].witness_account, arg: "account"}]
                );
                break;

            case "witness_update":
                column = this.getTranslateInfo(
                    "operation_witness_update",
                    [{type: "account", value: op[1].witness_account, arg: "account"}]
                );
                break;

            case "witness_withdraw_pay":
                if (current === op[1].witness_account) {
                    column = (
                        <span>
                            {this.formatMessage('operation_witness_pay')}
                            &nbsp;<FormattedAsset amount={op[1].amount} asset={"1.3.0"}/>
                            {this.formatMessage('transfer_to')}
                            &nbsp;{this.linkToAccount(op[1].witness_account)}
                        </span>
                    );
                } else {
                    column = (
                        <span>
                            {this.formatMessage('transaction_received')}
                            &nbsp;<FormattedAsset amount={op[1].amount} asset={"1.3.0"}/>
                            {this.formatMessage('transfer_from')}
                            &nbsp;{this.linkToAccount(op[1].witness_account)}
                        </span>
                    );
                }
                break;

            case "proposal_create":
                column = this.getTranslateInfo(
                    "operation_proposal_create",
                    [{type: "account", value: op[1].fee_paying_account, arg: "account"}]
                );
                break;

            case "proposal_update":
                column = this.getTranslateInfo(
                    "operation_proposal_update",
                    [{type: "account", value: op[1].fee_paying_account, arg: "account"}]
                );
                break;

            case "proposal_delete":
                column = this.getTranslateInfo(
                    "operation_proposal_delete",
                    [{type: "account", value: op[1].fee_paying_account, arg: "account"}]
                );
                break;

            case "withdraw_permission_create":
                column = (
                    <span>
                        {this.formatMessage('transaction_withdraw_permission_create')}
                        &nbsp;{this.linkToAccount(op[1].withdraw_from_account)}
                        {this.formatMessage('transfer_to')}
                        &nbsp;{this.linkToAccount(op[1].authorized_account)}
                    </span>
                );
                break;

            case "withdraw_permission_update":
                column = (
                    <span>
                        {this.formatMessage('transaction_withdraw_permission_update')}
                        &nbsp;{this.linkToAccount(op[1].withdraw_from_account)}
                        {this.formatMessage('transfer_to')}
                        &nbsp;{this.linkToAccount(op[1].authorized_account)}
                    </span>
                );
                break;

            case "withdraw_permission_claim":
                column = (
                    <span>
                        {this.formatMessage('transaction_withdraw_permission_claim')}
                        &nbsp;{this.linkToAccount(op[1].withdraw_from_account)}
                        {this.formatMessage('transfer_to')}
                        &nbsp;{this.linkToAccount(op[1].withdraw_to_account)}
                    </span>
                );
                break;

            case "withdraw_permission_delete":
                column = (
                    <span>
                        {this.formatMessage('transaction_withdraw_permission_delete')}
                        &nbsp;{this.linkToAccount(op[1].withdraw_from_account)}
                        {this.formatMessage('transfer_to')}
                        &nbsp;{this.linkToAccount(op[1].authorized_account)}
                    </span>
                );
                break;

            case "fill_order":
                o = op[1];

                let receivedAmount = o.fee.asset_id === o.receives.asset_id ? o.receives.amount - o.fee.amount : o.receives.amount;
                column = this.getTranslateInfo(
                    "operation_fill_order",
                    [
                        {type: "account", value: op[1].account_id, arg: "account"},
                        {
                            type: "amount",
                            value: {amount: receivedAmount, asset_id: op[1].receives.asset_id},
                            arg: "received",
                            decimalOffset: op[1].receives.asset_id === "1.3.0" ? 3 : null
                        },
                        {type: "price", value: {base: o.pays, quote: o.receives}, arg: "price"}
                    ]
                );
                break;

            case "global_parameters_update":
                column = this.formatMessage('transaction_global_parameters_update');
                break;

            case "vesting_balance_create":
                column = (
                    <span>
                        &nbsp;{this.linkToAccount(op[1].creator)}
                        {this.formatMessage('transaction_vesting_balance_create')}
                        &nbsp;<FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id}/>
                        &nbsp;{this.linkToAccount(op[1].owner)}
                    </span>
                );
                break;

            case "vesting_balance_withdraw":
                column = this.getTranslateInfo(
                    "operation_vesting_balance_withdraw",
                    [
                        {type: "account", value: op[1].owner, arg: "account"},
                        {type: "amount", value: op[1].amount, arg: "amount"}
                    ]
                );
                break;

            case "worker_create":
                column = this.getTranslateInfo(
                    "operation_worker_create",
                    [
                        {type: "account", value: op[1].owner, arg: "account"},
                        {type: "amount", value: {amount: op[1].daily_pay, asset_id: "1.3.0"}, arg: "pay"}
                    ],
                    {name: op[1].name}
                );
                break;


            case "balance_claim":
                op[1].total_claimed.amount = parseInt(op[1].total_claimed.amount, 10);
                column = this.getTranslateInfo(
                    "operation_balance_claim",
                    [
                        {type: "account", value: op[1].deposit_to_account, arg: "account"},
                        {type: "amount", value: op[1].total_claimed, arg: "amount"}
                    ]
                );
                break;

            case "committee_member_create":
                column = (
                    <span>
                        {this.formatMessage('transaction_committee_member_create')}
                        &nbsp;{this.linkToAccount(op[1].committee_member_account)}
                    </span>
                );
                break;

            case "transfer_to_blind":
                column = (
                    <span>
                        {this.linkToAccount(op[1].from)}
                        &nbsp;{this.formatMessage('transfer_send')}
                        &nbsp;<FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id}/>
                    </span>
                );
                break;

            case "transfer_from_blind":
                column = (
                    <span>
                        {this.linkToAccount(op[1].to)}
                        &nbsp;{this.formatMessage('transaction_received')}
                        &nbsp;<FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id}/>
                    </span>
                );
                break;

            case "asset_claim_fees":
                let _this = this;
                op[1].amount_to_claim.amount = parseInt(op[1].amount_to_claim.amount, 10);
                column = (
                    <span>
                        {this.linkToAccount(op[1].issuer)}&nbsp;
                        <BindToChainState.Wrapper asset={op[1].amount_to_claim.asset_id}>
                           { ({asset}) =>
                               _this.formatMessage('transaction_asset_claim_fees', {
                                   asset: asset.get("symbol",),
                                   balance_amount: utils.format_asset(op[1].amount_to_claim.amount, asset)
                               })
                           }
                       </BindToChainState.Wrapper>
                    </span>
                );
                break;

            case "custom":
                column = this.formatMessage('transaction_custom');
                break;

            case "asset_reserve":
                column = this.getTranslateInfo(
                    "operation_asset_reserve",
                    [
                        {type: "account", value: op[1].payer, arg: "account"},
                        {type: "amount", value: op[1].amount_to_reserve, arg: "amount"}
                    ]
                );
                break;

            case "committee_member_update_global_parameters":
                column = this.getTranslateInfo(
                    "operation_committee_member_update_global_parameters",
                    [{type: "account", value: "1.2.0", arg: "account"}]
                );
                break;

            case "override_transfer":
                column = this.getTranslateInfo(
                    "operation_override_transfer",
                    [
                        {type: "account", value: op[1].issuer, arg: "issuer"},
                        {type: "account", value: op[1].from, arg: "from"},
                        {type: "account", value: op[1].to, arg: "to"},
                        {type: "amount", value: op[1].amount, arg: "amount"}
                    ]
                );
                break;

            default:
                column = <span>#{block}</span>;
        }

        line = column ? (<Info block={block} type={op[0]} fee={op[1].fee} info={column}/>) : null;
        return (
            line ? line : <div className="last-operation-row"></div>
        );
    }
}

function compareOps(b, a) {
    if (a.block_num === b.block_num) {
        return a.virtual_op - b.virtual_op;
    } else {
        return a.block_num - b.block_num;
    }
}

function textContent(n) {
    return n ? `"${n.textContent.replace(/[\s\t\r\n]/gi, " ")}"` : "";
}

class RecentTransactions extends BaseComponent {
    static propTypes = {
        accountsList: ChainTypes.ChainAccountsList.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            limit: props.limit || 20
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!utils.are_equal_shallow(this.props.accountsList, nextProps.accountsList)) return true;
        if (nextState.limit !== this.state.limit) return true;
        return false;
    }

    getMore() {
        this.setState({
            limit: this.state.limit + 30
        });
    }

    getHistory(accountsList, filterOp, customFilter) {
        let history = [];
        let seen_ops = new Set();
        for (let account of accountsList) {
            if (account) {
                let h = account.get("history");
                if (h) history = history.concat(h.toJS().filter(op => !seen_ops.has(op.id) && seen_ops.add(op.id)));
            }
        }
        if (filterOp) {
            history = history.filter(a => {
                return a.op[0] === operations[filterOp];
            });
        }

        if (customFilter) {
            history = history.filter(a => {
                let finalValue = customFilter.fields.reduce((final, filter) => {
                    switch (filter) {
                        case "asset_id":
                            return final && a.op[1]["amount"][filter] === customFilter.values[filter];
                            break;
                        default:
                            return final && a.op[1][filter] === customFilter.values[filter];
                            break;
                    }
                }, true)
                return finalValue;
            });
        }
        return history;
    }

    render() {
        let {limit} = this.state;
        let {accountsList} = this.props;
        let current_account_id = accountsList.length === 1 && accountsList[0] ? accountsList[0].get("id") : null;
        let history = this.getHistory(accountsList).sort(compareOps);
        let historyCount = history.length;

        const display_history = history.length ?
            history.slice(0, limit)
                .map(o => {
                    return (
                        <Operation
                            key={o.id}
                            op={o.op}
                            result={o.result}
                            block={o.block_num}
                            current={current_account_id}
                        />
                    );
                }) : null;
        return (
            <div className="last-operation-body vertical-flex scroll">
                {display_history}
                {historyCount > this.props.limit || 20 && limit < historyCount ? (
                    <div className="last-operation-row">
                        <input type="button" value={this.formatMessage('account_more')} className="green-btn"
                               onClick={this.getMore.bind(this)} style={{flex: 1}}/>
                    </div>
                ) : null}
            </div>
        );
    }
}
RecentTransactions = BindToChainState(RecentTransactions, {keep_updating: true});

class TransactionWrapper extends React.Component {

    static propTypes = {
        asset: ChainTypes.ChainAsset.isRequired,
        to: ChainTypes.ChainAccount.isRequired,
        fromAccount: ChainTypes.ChainAccount.isRequired
    };

    static defaultProps = {
        asset: "1.3.0"
    };

    render() {
        return <span>{this.props.children(this.props)}</span>;
    }
}
TransactionWrapper = BindToChainState(TransactionWrapper);

export {RecentTransactions, TransactionWrapper};