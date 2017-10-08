/**
 * Created by necklace on 2017/2/8.
 */
import React from "react";
import BaseComponent,{CORE_ASSET_ID} from "../BaseComponent";
import ChainTypes from "./ChainTypes";
import utils from "../../../common/utils";
import BindToChainState from "./BindToChainState";
import FormattedAsset from "../Utility/FormattedAsset";
import connectToStores from 'alt-utils/lib/connectToStores';

//actions
import MarketsActions from "../../actions/MarketsActions";

//stores
import MarketsStore from "../../stores/MarketsStore";
import {ChainStore} from "bitsharesjs";

class ValueComponent extends BaseComponent {
    static propTypes = {
        toAsset: ChainTypes.ChainAsset.isRequired,
        fromAsset: ChainTypes.ChainAsset.isRequired
    };

    static defaultProps = {
        toAsset: CORE_ASSET_ID,
        fullPrecision: true,
        noDecimals: false
    };

    constructor(props) {
        super(props);
        this.fromStatsInterval = null;
        this.toStatsInterval = null;
    }

    componentWillMount() {
        let coreAsset = ChainStore.getAsset(CORE_ASSET_ID);
        if (coreAsset) {
            if (this.props.fromAsset.get("id") !== coreAsset.get("id")) {
                MarketsActions.getMarketStats(coreAsset, this.props.fromAsset);
                this.fromStatsInterval = setInterval(MarketsActions.getMarketStats.bind(this, coreAsset, this.props.fromAsset), 5 * 60 * 1000);
            }
            if (this.props.toAsset.get("id") !== coreAsset.get("id")) {
                // 延时处理防止连续 dispatch
                MarketsActions.getMarketStats.defer(coreAsset, this.props.toAsset);
                this.toStatsInterval = setInterval(() => {
                    MarketsActions.getMarketStats.defer(coreAsset, this.props.toAsset);
                }, 5 * 60 * 1000);
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.fromStatsInterval);
        clearInterval(this.toStatsInterval);
    }

    getValue() {
        let {amount, toAsset, fromAsset, fullPrecision, marketStats} = this.props;
        let coreAsset = ChainStore.getAsset(CORE_ASSET_ID);
        let toStats, fromStats;

        let toID = toAsset.get("id");
        let toSymbol = toAsset.get("symbol");
        let fromID = fromAsset.get("id");
        let fromSymbol = fromAsset.get("symbol");

        if (!fullPrecision) {
            amount = utils.get_asset_amount(amount, fromAsset);
        }
        if (coreAsset && marketStats) {
            let coreSymbol = coreAsset.get("symbol");

            toStats = marketStats.get(toSymbol + "_" + coreSymbol);
            fromStats = marketStats.get(fromSymbol + "_" + coreSymbol);
        }
        let price = utils.convertPrice(fromStats && fromStats.close ? fromStats.close : fromAsset, toStats && toStats.close ? toStats.close : toAsset, fromID, toID);
        return utils.convertValue(price, amount, fromAsset, toAsset);
    }

    render() {
        let {amount, toAsset, fromAsset, fullPrecision, marketStats} = this.props;
        let coreAsset = ChainStore.getAsset(CORE_ASSET_ID);
        let toStats, fromStats;


        let toID = toAsset.get("id");
        let toSymbol = toAsset.get("symbol");
        let fromID = fromAsset.get("id");
        let fromSymbol = fromAsset.get("symbol");

        if (!fullPrecision) {
            amount = utils.get_asset_amount(amount, fromAsset);
        }

        if (coreAsset && marketStats) {
            let coreSymbol = coreAsset.get("symbol");
            toStats = marketStats.get(toSymbol + "_" + coreSymbol);
            fromStats = marketStats.get(fromSymbol + "_" + coreSymbol);
        }

        let price = utils.convertPrice(fromStats && fromStats.close ? fromStats.close :
                fromID === CORE_ASSET_ID || fromAsset.has("bitasset") ? fromAsset : null,
            toStats && toStats.close ? toStats.close :
                (toID === CORE_ASSET_ID || toAsset.has("bitasset")) ? toAsset : null,
            fromID,
            toID);

        let eqValue = price ? utils.convertValue(price, amount, fromAsset, toAsset) : null;
        if (!eqValue) {
            return <span>{this.formatMessage('account_no_price')}</span>;
        }

        return <FormattedAsset noPrefix amount={eqValue} asset={toID}
                               decimalOffset={toSymbol.indexOf("BTC") !== -1 ? 4 : this.props.noDecimals ? toAsset.get("precision") : 0}/>;
    }
}
ValueComponent = BindToChainState(ValueComponent, {keep_updating: true});

class EquivalentValueComponent extends React.Component {
    static getPropsFromStores() {
        return {marketStats: MarketsStore.getState().allMarketStats};
    }

    static getStores() {
        return [MarketsStore];
    }

    render() {
        return <ValueComponent {...this.props} />;
    }
}
EquivalentValueComponent = connectToStores(EquivalentValueComponent);

class BalanceValueComponent extends React.Component {

    static propTypes = {
        balance: ChainTypes.ChainObject.isRequired
    }

    render() {
        let amount = Number(this.props.balance.get("balance"));
        let fromAsset = this.props.balance.get("asset_type");

        return <EquivalentValueComponent amount={amount} fromAsset={fromAsset} noDecimals={true}
                                         toAsset={this.props.toAsset}/>;
    }
}
BalanceValueComponent = BindToChainState(BalanceValueComponent, {keep_updating: true});

export {EquivalentValueComponent, BalanceValueComponent};