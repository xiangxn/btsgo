/**
 * Created by necklace on 2017/2/3.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import {ChainTypes} from "bitsharesjs";
import {FormattedDate} from "react-intl";
import account_constants from "../../../common/account_constants";
import utils from "../../../common/utils";

import FormattedAsset from "../Utility/FormattedAsset";
import FormattedPrice from "../Utility/FormattedPrice";
import AccountName from "../Utility/AccountName";

//stores
import PrivateKeyStore from "../../stores/PrivateKeyStore";

//actions
import WalletUnlockActions from "../../actions/WalletUnlockActions";


let {operations} = ChainTypes;
let ops = Object.keys(operations);

class OpType extends BaseComponent {

    shouldComponentUpdate(nextProps) {
        return (
            nextProps.type !== this.props.type
        );
    }

    render() {
        let msgId = "trxTypes_" + ops[this.props.type];

        return (
            <div className="row">
                <span className="blue">{this.formatMessage(msgId)}</span>
            </div>
        );
    }
}
class OperationTable extends BaseComponent {
    render() {
        let fee_row = this.props.fee.amount > 0 ? (
                <div className="row">
                    <span>{this.formatMessage('transfer_chargefee')}</span>
                    <FormattedAsset className="orangeRed" amount={this.props.fee.amount} asset={this.props.fee.asset_id}/>
                </div>
            ) : null;
        return (
            <div className="list">
                <OpType type={this.props.type} color={this.props.color}/>
                {this.props.children}
                {fee_row}
            </div>
        );
    }
}

class Transaction extends BaseComponent {

    linkToAccount(name_or_id) {
        if (!name_or_id) return <span>-</span>;
        return utils.is_object_id(name_or_id) ? <AccountName account={name_or_id}/> : name_or_id;
    }

    toggleLock(e) {
        e.preventDefault();
        WalletUnlockActions.unlock().then(() => {
            this.forceUpdate();
        })
    }

    render() {
        let {trx} = this.props;
        let info = [];

        let opCount = trx.operations.length;
        let memo = null;

        trx.operations.forEach((op, opIndex) => {

            let rows = [];
            let key = 0;

            let color = "";
            switch (ops[op[0]]) { // 遍历交易的操作类型
                case "transfer":
                    color = "success";
                    if (op[1].memo) {
                        let {text, isMine} = PrivateKeyStore.decodeMemo(op[1].memo);
                        memo = text ? (
                                <span>{text}</span>
                            ) : !text && isMine ? (
                                    <span>
                                        {this.formatMessage('transfer_memoUnlock')}&nbsp;
                                        <a href onClick={this.toggleLock.bind(this)}>
                                            x
                                        </a>
                                    </span>
                                ) : null;
                    }
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_from')}</span>
                            <span>{this.linkToAccount(op[1].from)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_to')}</span>
                            <span>{this.linkToAccount(op[1].to)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_amount')}</span>
                            <FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id}/>
                        </div>
                    );

                {
                    memo ?
                        rows.push(
                            <div key={key++} className="row">
                                <span>{this.formatMessage('transfer_memo')}</span>
                                {memo}
                            </div>
                        ) : null
                }

                    break;

                case "limit_order_create":
                    color = "warning";
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('exchange_price')}</span>
                            <FormattedPrice
                                base_asset={op[1].amount_to_sell.asset_id}
                                quote_asset={op[1].min_to_receive.asset_id}
                                base_amount={op[1].amount_to_sell.amount}
                                quote_amount={op[1].min_to_receive.amount}
                                noPopOver
                            />
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('exchange_sell')}</span>
                            <FormattedAsset amount={op[1].amount_to_sell.amount} asset={op[1].amount_to_sell.asset_id}/>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('exchange_buyMin')}</span>
                            <FormattedAsset amount={op[1].min_to_receive.amount} asset={op[1].min_to_receive.asset_id}/>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_seller')}</span>
                            <span>{this.linkToAccount(op[1].seller)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_expiration')}</span>
                            <span><FormattedDate
                                value={op[1].expiration}
                                format="full"
                            /></span>
                        </div>
                    );
                    break;

                case "limit_order_cancel":
                    color = "cancel";
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_orderId')}</span>
                            <span>{op[1].order}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_feePayer')}</span>
                            <span>{this.linkToAccount(op[1].fee_paying_account)}</span>
                        </div>
                    );
                    break;

                case "short_order_cancel":
                    color = "cancel";
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_orderId')}</span>
                            <span>{op[1].order}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_feePayer')}</span>
                            <span>{this.linkToAccount(op[1].fee_paying_account)}</span>
                        </div>
                    );
                    break;

                case "call_order_update":
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_fundingAccount')}</span>
                            <span>{this.linkToAccount(op[1].funding_account)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_deltaCollateral')}</span>
                            <FormattedAsset amount={op[1].delta_collateral.amount}
                                            asset={op[1].delta_collateral.asset_id}/>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_deltaDebt')}</span>
                            <FormattedAsset amount={op[1].delta_debt.amount} asset={op[1].delta_debt.asset_id}/>
                        </div>
                    );
                    break;

                case "key_create":
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_feePayer')}</span>
                            <span>{this.linkToAccount(op[1].fee_paying_account)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_Publickey')}</span>
                            <span>{op[1].key_data[1]}</span>
                        </div>
                    );

                    break;

                case "account_create":
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('account_name')}</span>
                            <span>{this.linkToAccount(op[1].name)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('account_registrar')}</span>
                            <span>{this.linkToAccount(op[1].registrar)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('account_lifetimeReferrer')}</span>
                            <span>{this.linkToAccount(op[1].referrer)}</span>
                        </div>
                    );

                    break;

                case "account_update":
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('account_name')}</span>
                            <span>{this.linkToAccount(op[1].account)}</span>
                        </div>
                    );
                    if (op[1].new_options) {
                        if (op[1].new_options.voting_account) {
                            rows.push(
                                <div key={key++} className="row">
                                    <span>{this.formatMessage('account_votesProxy')}</span>
                                    <span>{this.linkToAccount(op[1].new_options.voting_account)}</span>
                                </div>
                            );
                        }
                        else {
                            console.log("num witnesses: ", op[1].new_options.num_witness)
                            console.log("===============> NEW: ", op[1].new_options)
                            rows.push(
                                <div key={key++} className="row">
                                    <span>{this.formatMessage('account_votesProxy')}</span>
                                    <span>{this.formatMessage('account_votesNoProxy')}</span>
                                </div>
                            );
                            rows.push(
                                <div key={key++} className="row">
                                    <span>{this.formatMessage('account_numCommittee')}</span>
                                    <span>{op[1].new_options.num_committee}</span>
                                </div>
                            );
                            rows.push(
                                <div key={key++} className="row">
                                    <span>{this.formatMessage('account_num_witnesses')}</span>
                                    <span>{op[1].new_options.num_witness}</span>
                                </div>
                            );
                            rows.push(
                                <div key={key++} className="row">
                                    <span>{this.formatMessage('account_votes')}</span>
                                    <span>{JSON.stringify(op[1].new_options.votes) }</span>
                                </div>
                            );
                        }

                        rows.push(
                            <div key={key++} className="row">
                                <span>{this.formatMessage('account_memoKey')}</span>
                                <span>{op[1].new_options.memo_key.substring(0, 10) + "..."}</span>
                            </div>
                        );
                    }
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_commonOptions')}</span>
                            <span>{JSON.stringify(op[1]) }</span>
                        </div>
                    );
                    break;

                case "account_whitelist":
                    let listing;
                    for (var i = 0; i < listings.length; i++) {
                        if (account_constants.account_listing[listings[i]] === op[1].new_listing) {
                            console.log("listings:", listings[i]);
                            listing = listings[i];
                        }
                    }
                    ;

                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_authorizingAccount')}</span>
                            <span>{this.linkToAccount(op[1].authorizing_account)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_listedAccount')}</span>
                            <span>{this.linkToAccount(op[1].account_to_list)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_new_listing')}</span>
                            <span>{this.formatMessage(`transaction_${listing}`)}</span>
                        </div>
                    );
                    break;

                case "account_upgrade":
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_account_upgrade')}</span>
                            <span>{this.linkToAccount(op[1].account_to_upgrade)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_lifetime')}</span>
                            <span>{op[1].upgrade_to_lifetime_member.toString()}</span>
                        </div>
                    );
                    break;

                case "account_transfer":
                    /* 这种情况不完整，需要填写适当的字段 */
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_from')}</span>
                            <span>{this.linkToAccount(op[1].account_id)}</span>
                        </div>
                    );
                    break;

                case "asset_create":
                    color = "warning";
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('assets_issuer')}</span>
                            <span>{this.linkToAccount(op[1].issuer)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('assets_symbol')}</span>
                            <span>{this.linkToAsset(op[1].symbol)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('assets_precision')}</span>
                            <span>{op[1].precision}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('assets_max_supply')}</span>
                            <span>{utils.format_asset(op[1].common_options.max_supply, op[1])}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('assets_description')}</span>
                            <span>{op[1].common_options.description}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_market_fee')}</span>
                            <span>{op[1].common_options.market_fee_percent / 100}%</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_max_market_fee')}</span>
                            <span>{utils.format_asset(op[1].common_options.max_market_fee, op[1])}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_commonOptions')}</span>
                            <span>{op[1]}</span>
                        </div>
                    );
                    break;

                case "asset_update":
                case "asset_update_bitasset":
                    console.log("op:", op);
                    color = "warning";
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_asset_update')}</span>
                            <span>{this.linkToAsset(op[1].asset_to_update)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('assets_issuer')}</span>
                            <span>{this.linkToAccount(op[1].issuer)}</span>
                        </div>
                    );
                    if (op[1].new_issuer !== op[1].issuer) {
                        rows.push(
                            <div key={key++} className="row">
                                <span>{this.formatMessage('assets_new_issuer')}</span>
                                <span>{this.linkToAccount(op[1].new_issuer)}</span>
                            </div>
                        );
                    }
                    if (op[1].new_options.core_exchange_rate) {
                        rows.push(
                            <div key={key++} className="row">
                                <span>{this.formatMessage('markets_core_rate')}</span>
                                <FormattedPrice
                                    base_asset={op[1].new_options.core_exchange_rate.base.asset_id}
                                    quote_asset={op[1].new_options.core_exchange_rate.quote.asset_id}
                                    base_amount={op[1].new_options.core_exchange_rate.base.amount}
                                    quote_amount={op[1].new_options.core_exchange_rate.quote.amount}
                                />
                            </div>
                        );
                    }
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_new_options')}</span>
                            <span>{op[1].new_options}</span>
                        </div>
                    );
                    break;

                case "asset_update_feed_producers":
                    color = "warning";
                    console.debug("op:", op);
                    let producers = [];
                    op[1].new_feed_producers.forEach(producer => {
                        // let missingAsset = this.getAccounts([producer])[0];
                        producers.push(<span>{this.linkToAccount(producer)} </span>);
                    });
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_asset_update')}</span>
                            <span>{this.linkToAsset(op[1].asset_to_update)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_new_producers')}</span>
                            <span>{producers}</span>
                        </div>
                    );
                    break;

                case "asset_issue":
                    color = "warning";
                    if (op[1].memo) {
                        let {text, isMine} = PrivateKeyStore.decodeMemo(op[1].memo);
                        memo = text ? (
                                <span>{text}</span>
                            ) : !text && isMine ? (
                                    <span>
                                        {this.formatMessage('transfer_memoUnlock')}&nbsp;
                                        <a href onClick={this.toggleLock.bind(this)}>
                                            x
                                        </a>
                                    </span>
                                ) : null;
                    }

                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('block_issuer')}</span>
                            <span>{this.linkToAccount(op[1].issuer)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('assets_asset_issue')}</span>
                            <FormattedAsset style={{fontWeight: "bold"}} amount={op[1].asset_to_issue.amount}
                                            asset={op[1].asset_to_issue.asset_id}/>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_to')}</span>
                            <span>{this.linkToAccount(op[1].issue_to_account)}</span>
                        </div>
                    );
                    if (memo) {
                        rows.push(
                            <div key={key++} className="row">
                                <span>{this.formatMessage('transfer_memo')}</span>
                                {memo}
                            </div>
                        );
                    }
                    break;

                case "asset_burn":
                    color = "cancel";

                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_accounts_title')}</span>
                            <span>{this.linkToAccount(op[1].payer)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_amount')}</span>
                            <FormattedAsset amount={op[1].amount_to_burn.amount} asset={op[1].amount_to_burn.asset_id}/>
                        </div>
                    );
                    break;

                case "asset_fund_fee_pool":
                    color = "warning";
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_accounts_title')}</span>
                            <span>{this.linkToAccount(op[1].from_account)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_assets_title')}</span>
                            <span>{this.linkToAsset(op[1].asset_id)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_amount')}</span>
                            <FormattedAsset amount={op[1].amount} asset="1.3.0"/>
                        </div>
                    );
                    break;

                case "asset_settle":
                    color = "warning";
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_accounts_title')}</span>
                            <span>{this.linkToAccount(op[1].account)}</span>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_assets_title')}</span>
                            <span>{this.linkToAsset(op[1].amount.asset_id)}</span>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_amount')}</span>
                            <FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id}/>
                        </div>
                    );
                    break;

                case "asset_publish_feed":
                    color = "warning";
                    let {feed} = op[1];
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_publisher')}</span>
                            <span>{this.linkToAccount(op[1].publisher)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_assets_title')}</span>
                            <span>{this.linkToAsset(op[1].asset_id)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_maximum_short_squeeze_ratio')}</span>
                            <span>{(feed.maximum_short_squeeze_ratio / 1000).toFixed(2)}</span>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_maintenance_collateral_ratio')}</span>
                            <span>{(feed.maintenance_collateral_ratio / 1000).toFixed(2)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('markets_core_rate')}</span>
                            <FormattedPrice
                                base_asset={feed.core_exchange_rate.base.asset_id}
                                quote_asset={feed.core_exchange_rate.quote.asset_id}
                                base_amount={feed.core_exchange_rate.base.amount}
                                quote_amount={feed.core_exchange_rate.quote.amount}
                            />
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_settlement_price')}</span>
                            <FormattedPrice
                                base_asset={feed.settlement_price.base.asset_id}
                                quote_asset={feed.settlement_price.quote.asset_id}
                                base_amount={feed.settlement_price.base.amount}
                                quote_amount={feed.settlement_price.quote.amount}
                            />
                        </div>
                    );
                    break;

                case "committee_member_create":
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_committee_members_title')}</span>
                            <span>{this.linkToAccount(op[1].committee_member_account)}</span>
                        </div>
                    );
                    break;

                case "witness_create":
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_witness')}</span>
                            <span>{this.linkToAccount(op[1].witness_account)}</span>
                        </div>
                    );
                    break;

                case "witness_update":
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_witness')}</span>
                            <span>{this.linkToAccount(op[1].witness_account)}</span>
                        </div>
                    );
                    if (op[1].new_url) {
                        rows.push(
                            <div key={key++} className="row">
                                <span>{this.formatMessage('transaction_new_url')}</span>
                                <span><a href={op[1].new_url} target="_blank">{op[1].new_url}</a></span>
                            </div>
                        );
                    }
                    break;

                case "balance_claim":
                    color = "success";
                    let bal_id = op[1].balance_to_claim.substring(5);
                    // console.log( "bal_id: ", bal_id, op[1].balance_to_claim );

                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_claimed')}</span>
                            <FormattedAsset amount={op[1].total_claimed.amount} asset={op[1].total_claimed.asset_id}/>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_deposit_to')}</span>
                            <span>{this.linkToAccount(op[1].deposit_to_account)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_balance_id')}</span>
                            <span>#{bal_id}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_balance_owner')}</span>
                            <span>{op[1].balance_owner_key.substring(0, 10)}...</span>
                        </div>
                    );
                    break;

                case "vesting_balance_withdraw":
                    color = "success";
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_to')}</span>
                            <span>{this.linkToAccount(op[1].owner)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_amount')}</span>
                            <FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id}/>
                        </div>
                    );
                    break;

                case "transfer_to_blind":
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_from')}</span>
                            <span>{this.linkToAccount(op[1].from)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_amount')}</span>
                            <FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id}/>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_blinding_factor')}</span>
                            <span>{op[1].blinding_factor}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_outputs')}</span>
                            <span>{op[1].outputs[0]}</span>
                        </div>
                    );
                    break;

                case "transfer_from_blind":
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_to')}</span>
                            <span>{this.linkToAccount(op[1].to)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_amount')}</span>
                            <FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id}/>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_blinding_factor')}</span>
                            <span>{op[1].blinding_factor}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_inputs')}</span>
                            <span>{op[1].inputs[0]}</span>
                        </div>
                    );
                    break;

                case "blind_transfer":
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_inputs')}</span>
                            <span>{op[1].inputs[0]}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_outputs')}</span>
                            <span>{op[1].outputs[0]}</span>
                        </div>
                    );
                    break;

                case "proposal_create":
                    var expiration_date = new Date(op[1].expiration_time + 'Z')
                    var has_review_period = op[1].review_period_seconds !== undefined
                    var review_begin_time = !has_review_period ? null :
                        expiration_date.getTime() - op[1].review_period_seconds * 1000
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('proposal_create_review_period')}</span>
                            { has_review_period ?
                                <FormattedDate
                                    value={new Date(review_begin_time)}
                                    format="full"
                                />
                                : <span>&mdash;</span>
                            }
                        </div>
                    )
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('proposal_create_expiration_time')}</span>
                            <FormattedDate value={expiration_date} format="full"/>
                        </div>
                    );
                    var operations = [];
                    for (let pop of op[1].proposed_ops) operations.push(pop.op)
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('proposal_create_proposed_operations')}</span>
                            <span>{operations}</span>
                        </div>
                    )
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('proposal_create_fee_paying_account')}</span>
                            <span>{this.linkToAccount(op[1].fee_paying_account)}</span>
                        </div>
                    )
                    break

                case "proposal_update":
                    let fields = [
                        "active_approvals_to_add", "active_approvals_to_remove",
                        "owner_approvals_to_add", "owner_approvals_to_remove",
                        "key_approvals_to_add", "key_approvals_to_remove"
                    ];
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('proposal_create_fee_paying_account')}</span>
                            <span>{this.linkToAccount(op[1].fee_paying_account)}</span>
                        </div>
                    )
                    fields.forEach((field) => {
                        if (op[1][field].length) {
                            rows.push(
                                <div key={key++} className="row">
                                    <span>{this.formatMessage(`proposal.update.${field}`)}</span>
                                    <span>
                                        {op[1][field].map(value => {
                                                return <i key={value}>{this.linkToAccount(value)}</i>
                                            }
                                        )}
                                    </span>
                                </div>
                            )
                        }
                    })
                    break;

                // proposal_delete

                case "asset_claim_fees":
                    color = "success";
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_claimed')}</span>
                            <FormattedAsset amount={op[1].amount_to_claim.amount}
                                            asset={op[1].amount_to_claim.asset_id}/>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transaction_deposit_to')}</span>
                            <span>{this.linkToAccount(op[1].issuer)}</span>
                        </div>
                    );
                    break;

                case "asset_reserve":
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_accounts_title')}</span>
                            <span>{this.linkToAccount(op[1].payer)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_assets_title')}</span>
                            <span>{this.linkToAsset(op[1].amount_to_reserve.asset_id)}</span>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('transfer_amount')}</span>
                            <FormattedAsset amount={op[1].amount_to_reserve.amount}
                                            asset={op[1].amount_to_reserve.asset_id}/>
                        </div>
                    );
                    break;

                default:
                    console.debug("unimplemented op:", op);
                    rows.push(
                        <div key={key++} className="row">
                            <span>{this.formatMessage('explorer_op')}</span>
                            <span>{op}</span>
                        </div>
                    );
                    break;
            }

            info.push(
                <OperationTable key={opIndex} opCount={opCount} index={opIndex} color={color} type={op[0]}
                                fee={op[1].fee}>
                    {rows}
                </OperationTable>
            );
        });
        return (
            <div className="body">
                {info}
            </div>
        );
    }
}
export default Transaction;