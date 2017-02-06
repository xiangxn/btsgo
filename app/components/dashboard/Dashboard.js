/**
 * Created by necklace on 2017/1/13.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import utils from "../../../common/utils";
import Immutable from "immutable";
import connectToStores from 'alt-utils/lib/connectToStores';

//组件
import AssetsItem from "./AssetsItem";
import AccountList from "./AccountList";

//strores
import {ChainStore} from "graphenejs-lib";
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

    }



    render() {
        let {linkedAccounts} = this.props;
        let names = linkedAccounts.toArray().sort();

        return (
            <div className="content clear-toppadding vertical-box vertical-flex">
                <div className="assets-list">
                    <AssetsItem/>
                    <AssetsItem/>
                    <AssetsItem/>
                </div>
                <div className="assets-list">
                    <AssetsItem/>
                    <AssetsItem/>
                    <AssetsItem/>
                </div>
                <AccountList accounts={Immutable.List(names)}/>
            </div>
        );
    }
}

export default connectToStores(Dashboard);
