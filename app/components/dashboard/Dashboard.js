/**
 * Created by necklace on 2017/1/13.
 */
import React from "react";
import {intlShape} from 'react-intl';

//组件
import AssetsItem from "./AssetsItem";

class Dashboard extends React.Component {
    static contextTypes = {
        intl: intlShape.isRequired,
        router: React.PropTypes.object
    };

    constructor(props) {
        super(props);
    }

    onItemClick(e) {
        let acc = e.target.parentNode.childNodes[0].innerHTML;
        this.context.router.push({pathname: '/balance', state: {account: acc}});
    }

    render() {
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
                <div className="search-bar">
                    <label>{this.context.intl.formatMessage({id: "index_account"})}</label>
                    <input type="text" placeholder={this.context.intl.formatMessage({id: "index_account_ph"})}/>
                </div>
                <div className="account-list-head">
                    <label>{this.context.intl.formatMessage({id: "index_account"})}</label>
                    <label>{this.context.intl.formatMessage({id: "index_order"})}</label>
                    <label>{this.context.intl.formatMessage({id: "index_debt"})}</label>
                    <label>{this.context.intl.formatMessage({id: "index_marketValue"})}</label>
                </div>
                <div className="account-list-separate"></div>
                <div className="account-list vertical-flex">
                    <div className="account-list-row" onClick={this.onItemClick.bind(this)}>
                        <label>xiangxn</label>
                        <label>188.505 BTS</label>
                        <label>188.505 BTS</label>
                        <label>188.505 BTS</label>
                    </div>
                    <div className="account-list-row" onClick={this.onItemClick.bind(this)}>
                        <label>necklace</label>
                        <label>188.505 BTS</label>
                        <label>188.505 BTS</label>
                        <label>188.505 BTS</label>
                    </div>
                    <div className="account-list-row" onClick={this.onItemClick.bind(this)}>
                        <label>XIANGXN1</label>
                        <label>188.505 BTS</label>
                        <label>188.505 BTS</label>
                        <label>188.505 BTS</label>
                    </div>
                    <div className="account-list-row" onClick={this.onItemClick.bind(this)}>
                        <label>XIANGXN2</label>
                        <label>188.505 BTS</label>
                        <label>188.505 BTS</label>
                        <label>188.505 BTS</label>
                    </div>
                </div>
            </div>
        );
    }
}

export default Dashboard;
