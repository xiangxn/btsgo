/**
 * Created by necklace on 2017/1/23.
 */
import React from "react";
import BaseComponent from "../BaseComponent";

class Balance extends BaseComponent {
    constructor(props) {
        super(props);
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

export default Balance;