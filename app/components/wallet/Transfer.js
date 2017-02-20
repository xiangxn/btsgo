/**
 * Created by necklace on 2017/1/22.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import AccountSelectInput from "../wallet/AccountSelectInput";

//stores
import AccountStore from "../../stores/AccountStore";
import {ChainStore} from "graphenejs-lib";

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
        let currentAccount = AccountStore.getState().currentAccount;
        if (!this.state.from_name) this.state.from_name = currentAccount;
    }

    onFromAccChange(e) {

    }

    onFromChange(from_name) {
        let asset = undefined
        let amount = undefined
        this.setState({from_name, error: null, propose: false, propose_account: ""})
    }

    onToAccChange(to_name){

    }

    onToChange(to_name){
        this.setState({to_name, error: null});
    }

    render() {
        let {
            from_account, to_account, asset, asset_id,
            amount, error, to_name, from_name, memo, feeAsset, fee_asset_id
        } = this.state;
        let from_my_account = AccountStore.isMyAccount(from_account);


        return (
            <div className="content">
                <AccountSelectInput
                    lable={this.formatMessage('transfer_from')}
                    placeholder={this.formatMessage('transfer_from_ph')}
                    account={from_name}
                    accountName={from_name}
                    onChange={this.onFromChange.bind(this)} onAccountChanged={this.onFromAccChange.bind(this)}/>
                <AccountSelectInput
                    lable={this.formatMessage('transfer_to')}
                    placeholder={this.formatMessage('transfer_to_ph')}
                    account={to_name}
                    accountName={to_name}
                    onChange={this.onToChange.bind(this)} onAccountChanged={this.onToAccChange.bind(this)}/>

                <div className="text-img-input">
                    <div className="text-box clear-leftpadding">
                        <div className="label">
                            <span>{this.formatMessage('transfer_amount')}</span><span>{this.formatMessage('transfer_balance')}: </span><span
                            className="orangeRed underline">66666.88888 BTS</span>
                        </div>
                        <div className="input"><input type="text"
                                                      placeholder={this.formatMessage('transfer_amount_ph')}/><label>BTS</label>
                        </div>
                    </div>
                </div>
                <div className="text-img-input">
                    <div className="text-box clear-leftpadding">
                        <div className="label"><span>{this.formatMessage('transfer_memo')}</span></div>
                        <div className="input"><input type="text" placeholder={this.formatMessage('transfer_memo_ph')}/>
                        </div>
                    </div>
                </div>
                <div className="text-img-input">
                    <div className="text-box clear-leftpadding">
                        <div className="label"><span>{this.formatMessage('transfer_chargefee')}</span></div>
                        <div className="input"><input type="text" value="2.64174"/><label>BTS</label></div>
                    </div>
                </div>
                <div className="operate">
                    <input className="green-btn" value={this.formatMessage('transfer_send')}/>
                </div>
            </div>
        );
    }
}

export default Transfer;