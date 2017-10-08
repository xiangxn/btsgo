/**
 * Created by necklace on 2017/2/28.
 */
import React from "react";
import ChainTypes from "../Utility/ChainTypes";
import BaseComponent from "../BaseComponent";
import BindToChainState from "../Utility/BindToChainState";
import {EmitterInstance} from "bitsharesjs";
import AltContainer from "alt-container";

//stores
import AccountStore from "../../stores/AccountStore";
import MarketsStore from "../../stores/MarketsStore";
import SettingsStore from "../../stores/SettingsStore";
//actions
import MarketsActions from "../../actions/MarketsActions";

//组件
import Loading from "../Loading";
import Transaction from "./Transaction";

let emitter = EmitterInstance();
let callListener, limitListener, newCallListener, feedUpdateListener, settleOrderListener;
class TransactionSubscriber extends BaseComponent {
    static propTypes = {
        currentAccount: ChainTypes.ChainAccount.isRequired,
        quoteAsset: ChainTypes.ChainAsset.isRequired,
        baseAsset: ChainTypes.ChainAsset.isRequired
    };
    static defaultProps = {
        currentAccount: "1.2.3"
    };

    constructor() {
        super();
        this.state = {sub: null};

        this.subToMarket = this.subToMarket.bind(this);
    }

    componentWillMount() {
        if (this.props.quoteAsset.toJS && this.props.baseAsset.toJS) {
            this.subToMarket(this.props);
        }

        emitter.on("cancel-order", limitListener = MarketsActions.cancelLimitOrderSuccess);
        emitter.on("close-call", callListener = MarketsActions.closeCallOrderSuccess);
        emitter.on("call-order-update", newCallListener = MarketsActions.callOrderUpdate);
        emitter.on("bitasset-update", feedUpdateListener = MarketsActions.feedUpdate);
        emitter.on("settle-order-update", settleOrderListener = (object) => {
            let {isMarketAsset, marketAsset} = market_utils.isMarketAsset(this.props.quoteAsset, this.props.baseAsset);
            console.log("settle-order-update:", object, "isMarketAsset:", isMarketAsset, "marketAsset:", marketAsset);

            if (isMarketAsset && marketAsset.id === object.balance.asset_id) {
                MarketsActions.settleOrderUpdate(marketAsset.id);
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        /* 控制预测市场方向 */
        if (nextProps.baseAsset && nextProps.baseAsset.getIn(["bitasset", "is_prediction_market"])) {
            this.context.router.push({
                pathname: '/transaction',
                state: {baseAsset: nextProps.baseAsset.get("symbol"), quoteAsset: nextProps.quoteAsset.get("symbol")}
            });
        }

        if (nextProps.quoteAsset && nextProps.baseAsset) {
            if (!this.state.sub) {
                return this.subToMarket(nextProps);
            }
        }

        if (nextProps.quoteAsset.get("symbol") !== this.props.quoteAsset.get("symbol") || nextProps.baseAsset.get("symbol") !== this.props.baseAsset.get("symbol")) {
            let currentSub = this.state.sub.split("_");
            MarketsActions.unSubscribeMarket(currentSub[0], currentSub[1]);
            return this.subToMarket(nextProps);
        }
    }

    componentWillUnmount() {
        let {quoteAsset, baseAsset} = this.props;
        MarketsActions.unSubscribeMarket(quoteAsset.get("id"), baseAsset.get("id"));
        if (emitter) {
            emitter.off("cancel-order", limitListener);
            emitter.off("close-call", callListener);
            emitter.off("call-order-update", newCallListener);
            emitter.off("bitasset-update", feedUpdateListener);
            emitter.off("settle-order-update", settleOrderListener);
        }
    }

    subToMarket(props, newBucketSize) {
        let {quoteAsset, baseAsset, bucketSize} = props;
        if (newBucketSize) {
            bucketSize = newBucketSize;
        }
        if (quoteAsset.get("id") && baseAsset.get("id")) {
            MarketsActions.subscribeMarket.defer(baseAsset, quoteAsset, bucketSize);
            this.setState({sub: `${quoteAsset.get("id")}_${baseAsset.get("id")}`});
        }
    }

    render() {
        let content = null;
        if (!this.props.marketReady) content = <Loading/>;
        return (
            <div className="vertical-box vertical-flex">
                {content}
                <Transaction {...this.props} sub={this.state.sub} subToMarket={this.subToMarket}/>
            </div>
        );
    }
}
TransactionSubscriber = BindToChainState(TransactionSubscriber, {keep_updating: true, show_loader: true});

class TransactionContainer extends BaseComponent {

    render() {
        //console.log(this.props.params);
        let symbols = ["BTS", "CNY"];
        if(this.props.params.marketID){
            symbols.splice(0,symbols.length);
            symbols = this.props.params.marketID.split("_");
        }
        /*
        if (this.context.router.location && this.context.router.location.state) {
            symbols.splice(0,symbols.length);
            let s = this.context.router.location.state;
            symbols.push(s.quoteAsset);
            symbols.push(s.baseAsset);
        }
        */

        return (
            <AltContainer
                stores={[MarketsStore, AccountStore, SettingsStore]}
                inject={{
                    marketLimitOrders: () => {
                        return MarketsStore.getState().marketLimitOrders;
                    },
                    marketCallOrders: () => {
                        return MarketsStore.getState().marketCallOrders;
                    },
                    invertedCalls: () => {
                        return MarketsStore.getState().invertedCalls;
                    },
                    marketSettleOrders: () => {
                        return MarketsStore.getState().marketSettleOrders;
                    },
                    marketData: () => {
                        return MarketsStore.getState().marketData;
                    },
                    totals: () => {
                        return MarketsStore.getState().totals;
                    },
                    priceData: () => {
                        return MarketsStore.getState().priceData;
                    },
                    volumeData: () => {
                        return MarketsStore.getState().volumeData;
                    },
                    activeMarketHistory: () => {
                        return MarketsStore.getState().activeMarketHistory;
                    },
                    bucketSize: () => {
                        return MarketsStore.getState().bucketSize;
                    },
                    buckets: () => {
                        return MarketsStore.getState().buckets;
                    },
                    lowestCallPrice: () => {
                        return MarketsStore.getState().lowestCallPrice;
                    },
                    feedPrice: () => {
                        return MarketsStore.getState().feedPrice;
                    },
                    currentAccount: () => {
                        return AccountStore.getState().currentAccount;
                    },
                    linkedAccounts: () => {
                        return AccountStore.getState().linkedAccounts;
                    },
                    settings: () => {
                        return SettingsStore.getState().settings;
                    },
                    starredMarkets: () => {
                        return SettingsStore.getState().starredMarkets;
                    },
                    marketStats: () => {
                        return MarketsStore.getState().marketStats;
                    },
                    marketReady: () => {
                        return MarketsStore.getState().marketReady;
                    }
                }}
            >
                <TransactionSubscriber {...this.props} quoteAsset={symbols[0]} baseAsset={symbols[1]}/>
            </AltContainer>
        );
    }
}

export default TransactionContainer;