/**
 * Created by necklace on 2017/1/22.
 */
import React from "react";
import BaseComponent from "../BaseComponent";

class Transfer extends BaseComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="content">
                <div className="text-img-input">
                    <div className="icon"><span>U</span><img/></div>
                    <div className="placeholder"></div>
                    <div className="text-box">
                        <div className="label">
                            <span>{this.formatMessage('transfer_from')}</span><span>{this.formatMessage('transfer_permanent', {id: 14035})}</span>
                        </div>
                        <div className="input"><input type="text" placeholder={this.formatMessage('transfer_from_ph')}/>
                        </div>
                    </div>
                </div>
                <div className="text-img-input">
                    <div className="icon"><span>U</span><img/></div>
                    <div className="placeholder"></div>
                    <div className="text-box">
                        <div className="label">
                            <span>{this.formatMessage('transfer_to')}</span><span>{this.formatMessage('transfer_permanent', {id: 131086})}</span>
                        </div>
                        <div className="input"><input type="text" placeholder={this.formatMessage('transfer_to_ph')}/></div>
                    </div>
                </div>
                <div className="text-img-input">
                    <div className="text-box clear-leftpadding">
                        <div className="label"><span>{this.formatMessage('transfer_amount')}</span><span>{this.formatMessage('transfer_balance')}: </span><span className="orangeRed underline">66666.88888 BTS</span>
                        </div>
                        <div className="input"><input type="text" placeholder={this.formatMessage('transfer_amount_ph')}/><label>BTS</label></div>
                    </div>
                </div>
                <div className="text-img-input">
                    <div className="text-box clear-leftpadding">
                        <div className="label"><span>{this.formatMessage('transfer_memo')}</span></div>
                        <div className="input"><input type="text" placeholder={this.formatMessage('transfer_memo_ph')}/></div>
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