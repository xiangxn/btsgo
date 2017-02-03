/**
 * Created by necklace on 2017/2/3.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import {ChainTypes} from "graphenejs-lib";
import {FormattedDate} from "react-intl";

import FormattedAsset from "../Utility/FormattedAsset";

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
                    <span className="orangeRed">14.82281 BTS</span></div>
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
        return name_or_id;
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
                    //TODO:明天继续
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
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.authorizing_account"/></td>
                            <td>{this.linkToAccount(op[1].authorizing_account)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.listed_account"/></td>
                            <td>{this.linkToAccount(op[1].account_to_list)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.new_listing"/></td>
                            <td><Translate content={`transaction.whitelist_states.${listing}`}/></td>
                        </tr>
                    );

                    break;

                case "account_upgrade":
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.account_upgrade"/></td>
                            <td>{this.linkToAccount(op[1].account_to_upgrade)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.lifetime"/></td>
                            <td>{op[1].upgrade_to_lifetime_member.toString()}</td>
                        </tr>
                    );
                    break;

                case "account_transfer":
                    /* This case is uncomplete, needs filling out with proper fields */
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transfer.from"/></td>
                            <td>{this.linkToAccount(op[1].account_id)}</td>
                        </tr>
                    );

                    break;

                case "asset_create":
                    color = "warning";

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.assets.issuer"/></td>
                            <td>{this.linkToAccount(op[1].issuer)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.assets.symbol"/></td>
                            <td>{this.linkToAsset(op[1].symbol)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.assets.precision"/></td>
                            <td>{op[1].precision}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="account.user_issued_assets.max_supply"/></td>
                            <td>{utils.format_asset(op[1].common_options.max_supply, op[1])}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="account.user_issued_assets.description"/></td>
                            <td>{op[1].common_options.description}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.market_fee"/></td>
                            <td>{op[1].common_options.market_fee_percent / 100}%</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.max_market_fee"/></td>
                            <td>{utils.format_asset(op[1].common_options.max_market_fee, op[1])}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.common_options"/></td>
                            <td><Inspector data={ op[1] } search={false}/></td>
                        </tr>
                    );

                    break;

                case "asset_update":
                case "asset_update_bitasset":
                    console.log("op:", op);
                    color = "warning";

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.asset_update"/></td>
                            <td>{this.linkToAsset(op[1].asset_to_update)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.assets.issuer"/></td>
                            <td>{this.linkToAccount(op[1].issuer)}</td>
                        </tr>
                    );
                    if (op[1].new_issuer !== op[1].issuer) {
                        rows.push(
                            <tr key={key++}>
                                <td><Translate component="span" content="account.user_issued_assets.new_issuer"/></td>
                                <td>{this.linkToAccount(op[1].new_issuer)}</td>
                            </tr>
                        );
                    }
                    if (op[1].new_options.core_exchange_rate) {
                        rows.push(
                            <tr key={key++}>
                                <td><Translate component="span" content="markets.core_rate"/></td>
                                <td>
                                    <FormattedPrice
                                        base_asset={op[1].new_options.core_exchange_rate.base.asset_id}
                                        quote_asset={op[1].new_options.core_exchange_rate.quote.asset_id}
                                        base_amount={op[1].new_options.core_exchange_rate.base.amount}
                                        quote_amount={op[1].new_options.core_exchange_rate.quote.amount}
                                        noPopOver
                                    />
                                </td>
                            </tr>
                        );
                    }

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.new_options"/></td>
                            <td><Inspector data={ op[1].new_options } search={false}/></td>
                        </tr>
                    );

                    break;

                case "asset_update_feed_producers":
                    color = "warning";
                    console.log("op:", op);
                    let producers = [];
                    op[1].new_feed_producers.forEach(producer => {
                        // let missingAsset = this.getAccounts([producer])[0];
                        producers.push(<div>{this.linkToAccount(producer)}<br/></div>);
                    });

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.asset_update"/></td>
                            <td>{this.linkToAsset(op[1].asset_to_update)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.new_producers"/></td>
                            <td>{producers}</td>
                        </tr>
                    );

                    break;

                case "asset_issue":
                    color = "warning";

                    if (op[1].memo) {
                        let {text, isMine} = PrivateKeyStore.decodeMemo(op[1].memo);

                        memo = text ? (
                                <td>{text}</td>
                            ) : !text && isMine ? (
                                    <td>
                                        <Translate content="transfer.memo_unlock"/>&nbsp;
                                        <a href onClick={this._toggleLock.bind(this)}>
                                            <Icon name="locked"/>
                                        </a>
                                    </td>
                                ) : null;
                    }

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.assets.issuer"/></td>
                            <td>{this.linkToAccount(op[1].issuer)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.asset_issue"/></td>
                            <td><FormattedAsset style={{fontWeight: "bold"}} amount={op[1].asset_to_issue.amount}
                                                asset={op[1].asset_to_issue.asset_id}/></td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transfer.to"/></td>
                            <td>{this.linkToAccount(op[1].issue_to_account)}</td>
                        </tr>
                    );

                {
                    memo ?
                        rows.push(
                            <tr key={key++}>
                                <td><Translate content="transfer.memo"/></td>
                                {memo}
                            </tr>
                        ) : null
                }

                    break;

                case "asset_burn":
                    color = "cancel";

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.account.title"/></td>
                            <td>{this.linkToAccount(op[1].payer)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transfer.amount"/></td>
                            <td><FormattedAsset amount={op[1].amount_to_burn.amount}
                                                asset={op[1].amount_to_burn.asset_id}/></td>
                        </tr>
                    );

                    break;

                case "asset_fund_fee_pool":
                    color = "warning";
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.account.title"/></td>
                            <td>{this.linkToAccount(op[1].from_account)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.asset.title"/></td>
                            <td>{this.linkToAsset(op[1].asset_id)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transfer.amount"/></td>
                            <td><FormattedAsset amount={op[1].amount} asset="1.3.0"/></td>
                        </tr>
                    );

                    break;

                case "asset_settle":
                    color = "warning";

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.account.title"/></td>
                            <td>{this.linkToAccount(op[1].account)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.asset.title"/></td>
                            <td>{this.linkToAsset(op[1].amount.asset_id)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transfer.amount"/></td>
                            <td><FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id}/></td>
                        </tr>
                    );

                    break;

                case "asset_publish_feed":
                    color = "warning";
                    let {feed} = op[1];

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.publisher"/></td>
                            <td>{this.linkToAccount(op[1].publisher)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.asset.title"/></td>
                            <td>{this.linkToAsset(op[1].asset_id)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span"
                                           content="explorer.asset.price_feed.maximum_short_squeeze_ratio"/></td>
                            <td>{(feed.maximum_short_squeeze_ratio / 1000).toFixed(2)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span"
                                           content="explorer.asset.price_feed.maintenance_collateral_ratio"/></td>
                            <td>{(feed.maintenance_collateral_ratio / 1000).toFixed(2)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="markets.core_rate"/></td>
                            <td>
                                <FormattedPrice
                                    base_asset={feed.core_exchange_rate.base.asset_id}
                                    quote_asset={feed.core_exchange_rate.quote.asset_id}
                                    base_amount={feed.core_exchange_rate.base.amount}
                                    quote_amount={feed.core_exchange_rate.quote.amount}
                                    noPopOver
                                />
                            </td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.settlement_price"/></td>
                            <td>
                                <FormattedPrice
                                    base_asset={feed.settlement_price.base.asset_id}
                                    quote_asset={feed.settlement_price.quote.asset_id}
                                    base_amount={feed.settlement_price.base.amount}
                                    quote_amount={feed.settlement_price.quote.amount}
                                    noPopOver
                                />
                            </td>
                        </tr>
                    );

                    break;

                case "committee_member_create":

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.committee_member.title"/></td>
                            <td>{this.linkToAccount(op[1].committee_member_account)}</td>
                        </tr>
                    );

                    break;

                case "witness_create":

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.witness"/></td>
                            <td>{this.linkToAccount(op[1].witness_account)}</td>
                        </tr>
                    );

                    break;

                case "witness_update":

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.witness"/></td>
                            <td>{this.linkToAccount(op[1].witness_account)}</td>
                        </tr>
                    );

                    if (op[1].new_url) {
                        rows.push(
                            <tr key={key++}>
                                <td><Translate component="span" content="transaction.new_url"/></td>
                                <td><a href={op[1].new_url} target="_blank">{op[1].new_url}</a></td>
                            </tr>
                        );
                    }

                    break;

                case "balance_claim":
                    color = "success";

                    let bal_id = op[1].balance_to_claim.substring(5);
                    // console.log( "bal_id: ", bal_id, op[1].balance_to_claim );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.claimed"/></td>
                            <td><FormattedAsset amount={op[1].total_claimed.amount}
                                                asset={op[1].total_claimed.asset_id}/></td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.deposit_to"/></td>
                            <td>{this.linkToAccount(op[1].deposit_to_account)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.balance_id"/></td>
                            <td>#{bal_id}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.balance_owner"/></td>
                            <td style={{fontSize: "80%"}}>{op[1].balance_owner_key.substring(0, 10)}...</td>
                        </tr>
                    );
                    break;

                case "vesting_balance_withdraw":
                    color = "success";

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transfer.to"/></td>
                            <td>{this.linkToAccount(op[1].owner)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transfer.amount"/></td>
                            <td><FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id}/></td>
                        </tr>
                    );

                    break;

                case "transfer_to_blind":
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transfer.from"/></td>
                            <td>{this.linkToAccount(op[1].from)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transfer.amount"/></td>
                            <td><FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id}/></td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.blinding_factor"/></td>
                            <td style={{fontSize: "80%"}}>{op[1].blinding_factor}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.outputs"/></td>
                            <td><Inspector data={ op[1].outputs[0] } search={false}/></td>
                        </tr>
                    );
                    break;

                case "transfer_from_blind":
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transfer.to"/></td>
                            <td>{this.linkToAccount(op[1].to)}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transfer.amount"/></td>
                            <td><FormattedAsset amount={op[1].amount.amount} asset={op[1].amount.asset_id}/></td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.blinding_factor"/></td>
                            <td style={{fontSize: "80%"}}>{op[1].blinding_factor}</td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.inputs"/></td>
                            <td><Inspector data={ op[1].inputs[0] } search={false}/></td>
                        </tr>
                    );
                    break;

                case "blind_transfer":
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.inputs"/></td>
                            <td><Inspector data={ op[1].inputs[0] } search={false}/></td>
                        </tr>
                    );
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.outputs"/></td>
                            <td><Inspector data={ op[1].outputs[0]} search={false}/></td>
                        </tr>
                    );
                    break;

                case "proposal_create":
                    var expiration_date = new Date(op[1].expiration_time + 'Z')
                    var has_review_period = op[1].review_period_seconds !== undefined
                    var review_begin_time = !has_review_period ? null :
                        expiration_date.getTime() - op[1].review_period_seconds * 1000
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="proposal_create.review_period"/></td>
                            <td>
                                { has_review_period ?
                                    <FormattedDate
                                        value={new Date(review_begin_time)}
                                        format="full"
                                    />
                                    : <span>&mdash;</span>}
                            </td>
                        </tr>
                    )
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="proposal_create.expiration_time"/></td>
                            <td><FormattedDate
                                value={expiration_date}
                                format="full"
                            />
                            </td>
                        </tr>
                    )
                    var operations = [];
                    for (let pop of op[1].proposed_ops) operations.push(pop.op)

                    let proposalsText = op[1].proposed_ops.map((o, index) => {
                        return (
                            <ProposedOperation
                                key={index}
                                index={index}
                                op={o.op}
                                inverted={false}
                                hideFee={true}
                                hideOpLabel={true}
                                hideDate={true}
                                proposal={true}
                            />
                        );
                    });

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="proposal_create.proposed_operations"/></td>
                            <td>{proposalsText}</td>
                        </tr>
                    )
                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="proposal_create.fee_paying_account"/></td>
                            <td>{this.linkToAccount(op[1].fee_paying_account)}</td>
                        </tr>
                    )
                    break

                case "proposal_update":
                    let fields = [
                        "active_approvals_to_add", "active_approvals_to_remove",
                        "owner_approvals_to_add", "owner_approvals_to_remove",
                        "key_approvals_to_add", "key_approvals_to_remove"
                    ];

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="proposal_create.fee_paying_account"/></td>
                            <td>{this.linkToAccount(op[1].fee_paying_account)}</td>
                        </tr>
                    )

                    fields.forEach((field) => {
                        if (op[1][field].length) {
                            rows.push(
                                <tr key={key++}>
                                    <td><Translate content={`proposal.update.${field}`}/></td>
                                    <td>{op[1][field].map(value => {
                                            return <div key={value}>{this.linkToAccount(value)}</div>
                                        }
                                    )}
                                    </td>
                                </tr>
                            )
                        }
                    })

                    break;

                // proposal_delete

                case "asset_claim_fees":
                    color = "success";

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.claimed"/></td>
                            <td><FormattedAsset amount={op[1].amount_to_claim.amount}
                                                asset={op[1].amount_to_claim.asset_id}/></td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transaction.deposit_to"/></td>
                            <td>{this.linkToAccount(op[1].issuer)}</td>
                        </tr>
                    );

                    break;

                case "asset_reserve":

                    rows.push(
                        <tr key={key++}>
                            <td style={{textTranform: "capitalize"}}>
                                <Translate component="span" content="modal.reserve.from"/>
                            </td>
                            <td>{this.linkToAccount(op[1].payer)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.asset.title"/></td>
                            <td>{this.linkToAsset(op[1].amount_to_reserve.asset_id)}</td>
                        </tr>
                    );

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="transfer.amount"/></td>
                            <td><FormattedAsset amount={op[1].amount_to_reserve.amount}
                                                asset={op[1].amount_to_reserve.asset_id}/></td>
                        </tr>
                    );
                    break;

                default:
                    console.log("unimplemented op:", op);

                    rows.push(
                        <tr key={key++}>
                            <td><Translate component="span" content="explorer.block.op"/></td>
                            <td><Inspector data={ op } search={false}/></td>
                        </tr>
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