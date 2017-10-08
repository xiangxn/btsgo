/**
 * Created by necklace on 2017/1/17.
 */
import React from "react";
import BaseComponent from "./BaseComponent";
import {ChainTypes as grapheneChainTypes} from "bitsharesjs";
import AltContainer from "alt-container";
import {RecentTransactions} from "./dashboard/Operation";

//stores
import AccountStore from "../stores/AccountStore";


const {operations} = grapheneChainTypes;



class LastOperation extends BaseComponent {
    constructor(props) {
        super(props);
    }
    getHistory(accountsList, filterOp, customFilter) {
        let history = [];
        let seen_ops = new Set();
        for (let account of accountsList) {
            if(account) {
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
        let {linkedAccounts} = this.props;
        let accountCount = linkedAccounts.size;

        return (
            <div className="content vertical-flex vertical-box clear-toppadding">
                <div className="last-operation vertical-flex vertical-box">
                    <div className="last-operation-header">
                        <span>{this.formatMessage("lastOperation_operation")}</span>
                        <span>{this.formatMessage("lastOperation_info")}</span>
                    </div>
                    <div className="separate2"></div>
                    {accountCount ? <RecentTransactions
                        accountsList={linkedAccounts}
                        limit={10}
                    /> :
                        <div className="last-operation-body vertical-flex scroll">
                        </div>
                    }
                </div>
            </div>
        );
    }
}

class LastOperationContainer extends React.Component {
    render() {
        return (
            <AltContainer
                stores={[AccountStore]}
                inject={{
                    linkedAccounts: () => {
                        return AccountStore.getState().linkedAccounts;
                    }
                }}>
                <LastOperation/>
            </AltContainer>
        );
    }
}
export default LastOperationContainer;