/**
 * Created by necklace on 2017/1/13.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import Immutable from "immutable";
import connectToStores from 'alt-utils/lib/connectToStores';
import utils from "../../../common/utils";

//组件
import AssetsItem from "./AssetsItem";
import AccountList from "./AccountList";

//strores
import {ChainStore} from "bitsharesjs";
import AccountStore from "../../stores/AccountStore";

class Dashboard extends BaseComponent {
    static getPropsFromStores() {
        return {linkedAccounts: AccountStore.getState().linkedAccounts};
    }

    static getStores() {
        return [AccountStore];
    }

    constructor(props) {
        super(props);
        this.state = {
            mainMarkets: [
                ["BTS", "CNY",false],
                ["BTS", "USD",false],
                ["BTS", "EUR",false]
                , ["OPEN.BTC", "BTS"],
                ["OPEN.BTC", "CNY"],
                ["OPEN.BTC", "USD"]
            ]
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !utils.are_equal_shallow(nextState.mainMarkets, this.state.mainMarkets) ||
            nextProps.linkedAccounts !== this.props.linkedAccounts
        );
    }


    render() {
        let {linkedAccounts} = this.props;
        let names = linkedAccounts.toArray().sort();

        let markets = this.state.mainMarkets.map((item, index) => {
            if (index < 3)
                return (
                    <AssetsItem
                        key={item[0] + "_" + item[1]}
                        quote={item[0]}
                        base={item[1]}
                        invert={item[2]}
                    />
                );
        });
        let markets2 = this.state.mainMarkets.map((item, index) => {
            if (index > 2)
                return (
                    <AssetsItem
                        key={item[0] + "_" + item[1]}
                        quote={item[0]}
                        base={item[1]}
                        invert={item[2]}
                    />
                );
        });

        return (
            <div className="content clear-toppadding vertical-box vertical-flex">
                <div className="assets-list" style={{paddingTop:'.1rem'}}>
                    {markets}
                </div>
                <div className="assets-list" style={{paddingBottom:'.1rem'}}>
                    {markets2}
                </div>
                <AccountList accounts={Immutable.List(names)}/>
            </div>
        );
    }
}

export default connectToStores(Dashboard);
