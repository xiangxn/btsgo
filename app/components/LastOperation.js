/**
 * Created by necklace on 2017/1/17.
 */
import React from "react";
import BaseComponent from "./BaseComponent";

class LastOperation extends BaseComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="content vertical-flex vertical-box clear-toppadding">
                <div className="last-operation vertical-flex vertical-box">
                    <div className="last-operation-header">
                        <span>{this.formatMessage("lastOperation_operation")}</span>
                        <span>{this.formatMessage("lastOperation_info")}</span>
                    </div>
                    <div className="separate2"></div>
                    <div className="last-operation-body vertical-flex scroll">
                        <div className="last-operation-row">
                            <span>{this.formatMessage("lastOperation_createAccount")}</span>
                            <div>
                                <div>btsabc.reg 注册了账户 b3b4</div>
                                <div>4个月前 - 14.82381 BTS</div>
                            </div>
                        </div>
                        <div className="last-operation-row">
                            <span>创建账户</span>
                            <div>
                                <div>btsabc.reg 注册了账户 b3b4</div>
                                <div>4个月前 - 14.82381 BTS</div>
                            </div>
                        </div>
                        <div className="last-operation-row">
                            <span>创建账户</span>
                            <div>
                                <div>btsabc.reg 注册了账户 b3b4</div>
                                <div>4个月前 - 14.82381 BTS</div>
                            </div>
                        </div>
                        <div className="last-operation-row">
                            <span>创建账户</span>
                            <div>
                                <div>btsabc.reg 注册了账户 b3b4</div>
                                <div>4个月前 - 14.82381 BTS</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LastOperation;