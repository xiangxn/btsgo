/**
 * Created by necklace on 2017/3/29.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import AltContainer from "alt-container";
import AssetName from "../Utility/AssetName";
import Immutable from "immutable";
import {debounce} from "lodash";
import utils from "../../../common/utils";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";

//stores
import AssetStore from "../../stores/AssetStore";
import MarketsStore from "../../stores/MarketsStore";
import SettingsStore from "../../stores/SettingsStore";

//actions
import AssetActions from "../../actions/AssetActions";
import MarketsActions from "../../actions/MarketsActions";

class MarketRow extends BaseComponent {
    static propTypes = {
        quote: ChainTypes.ChainAsset.isRequired,
        base: ChainTypes.ChainAsset.isRequired
    };

    constructor(props) {
        super(props);
        this.statsInterval = null;
    }

    componentDidMount() {
        MarketsActions.getMarketStats.defer(this.props.base, this.props.quote);
        this.statsChecked = new Date();
        this.statsInterval = setInterval(MarketsActions.getMarketStats.bind(this, this.props.base, this.props.quote), 35 * 1000);
    }

    componentWillUnmount() {
        clearInterval(this.statsInterval);
    }

    shouldComponentUpdate(nextProps) {
        return (
            !utils.are_equal_shallow(nextProps, this.props)
        );
    }

    onGoMarket(quoteSymbol, baseSymbol, e) {
        MarketsActions.switchMarket();
        this.context.router.push({
            pathname: '/transaction',
            state: {baseAsset: baseSymbol, quoteAsset: quoteSymbol}
        });
    }

    render() {
        let {quote, base, marketStats, priceStyle, changeStyle} = this.props;
        let quoteSymbol = quote.get("symbol");
        let baseSymbol = base.get("symbol");
        let stats = marketStats;//marketStats.get(quoteSymbol + '_' + baseSymbol);
        //价格
        let price = utils.convertPrice(quote, base);

        let finalPrice = stats && stats.latestPrice ?
            stats.latestPrice :
            stats && stats.close && (stats.close.quote.amount && stats.close.base.amount) ?
                utils.get_asset_price(stats.close.quote.amount, quote, stats.close.base.amount, base, true) :
                utils.get_asset_price(price.base.amount, base, price.quote.amount, quote);

        let highPrecisionAssets = ["BTC", "OPEN.BTC", "TRADE.BTC", "GOLD", "SILVER"];
        let precision = 6;
        if (highPrecisionAssets.indexOf(base.get("symbol")) !== -1) {
            precision = 8;
        }

        /*
         if (quoteSymbol === 'YOYOW') {
         console.debug('finalPrice', finalPrice);
         }
         */

        /*
         if (quoteSymbol === 'YOYOW') {
         console.debug('stats', stats);
         if (stats && stats.change) {
         console.debug('Infinity', isNaN('Infinity'))
         console.debug('xxxxxxx', isNaN(stats.change))
         }
         }
         */


        //涨幅
        let change = (stats && stats.change ) ? stats.change : '0.00';
        if (isNaN(change) || change === 'Infinity') change = "0.00";
        change = parseFloat(change);

        return (
            <div className="order-list-row" key={quoteSymbol}
                 onClick={this.onGoMarket.bind(this, quoteSymbol, baseSymbol)}>
                <span>{quoteSymbol}</span>
                <span className={change === 0 ? "" : change > 0 ? "green" : "orangeRed"}
                      style={priceStyle}>{utils.format_number(finalPrice, finalPrice > 1000 ? 0 : finalPrice > 10 ? 2 : precision, false)}</span>
                <span className={change === 0 ? "" : change > 0 ? "green" : "orangeRed"}
                      style={changeStyle}>{utils.format_number(change, 2)}%</span>
            </div>
        );
    }
}
MarketRow = BindToChainState(MarketRow);

class MarketList extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeBase: 'CNY',
            filterValue: '',
            lookupQuote: '',
            lookupBase: '',
            desc: false,
            sort: 'name'
        };
        this.getAssetList = debounce(AssetActions.getAssetList, 150);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !Immutable.is(nextProps.searchAssets, this.props.searchAssets) || !Immutable.is(nextProps.markets, this.props.markets) || !Immutable.is(nextProps.starredMarkets, this.props.starredMarkets) || !Immutable.is(nextProps.marketStats, this.props.marketStats) ||
            nextState.desc !== this.state.desc ||
            nextState.sort !== this.state.sort ||
            nextState.activeBase !== this.state.activeBase ||
            nextState.lookupQuote !== this.state.lookupQuote ||
            nextState.lookupBase !== this.state.lookupBase ||
            nextProps.preferredBases !== this.props.preferredBases
        );
    }

    onTabClick(base, e) {
        this.setState({activeBase: base, desc: false, sort: 'name'});
    }

    onFilterChange(e) {
        this.setState({filterValue: e.target.value, lookupQuote: e.target.value.toUpperCase()});
    }

    onSort(sort, e) {
        let x = this.state.desc;
        this.setState({sort: sort, desc: !x});
    }

    render() {
        let {preferredBases, searchAssets, starredMarkets, marketStats} = this.props;
        let {activeBase, filterValue, lookupQuote} = this.state;
        //console.debug('preferredBases', preferredBases);
        let changeStyle = {textAlign: 'right'};
        let priceStyle = {textAlign: 'center'};

        let searchMarkets = [], allMarkets = [];
        if (searchAssets.size) {
            searchAssets.forEach(asset => {
                let marketID = asset.symbol + "_" + activeBase;
                if (activeBase !== asset.symbol) {
                    allMarkets.push([marketID, {id: marketID, quote: asset.symbol, base: base}]);
                }
            });
        }

        allMarkets = Immutable.Map(allMarkets);
        let activeMarkets = (allMarkets && allMarkets.size > 0) ? allMarkets : starredMarkets;

        let marketRows = null;
        if (activeMarkets.size > 0) {
            searchMarkets = activeMarkets.filter(a => {
                if (lookupQuote !== '') {
                    return (a.quote.indexOf(lookupQuote) !== -1) && (a.base === activeBase);
                }
                return a.base === activeBase;
            }).toArray();
            marketRows = searchMarkets.map(market => {
                return (
                    <MarketRow
                        key={market.id}
                        quote={market.quote}
                        base={market.base}
                        priceStyle={priceStyle}
                        changeStyle={changeStyle}
                        marketStats={marketStats.get(market.id)}
                    />
                );
            }).sort((a, b) => {
                //console.debug('stats',a.props)
                switch (this.state.sort) {
                    case 'name':
                        if (a.props.quote > b.props.quote) {
                            return this.state.desc ? -1 : 1;
                        } else if (a.props.quote < b.props.quote) {
                            return this.state.desc ? 1 : -1;
                        } else {
                            return 0;
                        }
                        break;
                    case 'change':
                        let aVal = parseFloat(a.props.marketStats.change.replace(',', ''));
                        let bVal = parseFloat(b.props.marketStats.change.replace(',', ''));
                        if (aVal > bVal) {
                            return this.state.desc ? -1 : 1;
                        } else if (aVal < bVal) {
                            return this.state.desc ? 1 : -1;
                        } else {
                            return 0;
                        }
                        break;
                    default:
                        return 0;
                }
            });
        }


        return (
            <div className="content vertical-flex vertical-box clear-toppadding">
                <div className="full-page vertical-flex vertical-box">
                    <div className="full-page-header">
                        <div className="check-btn-box-full">
                            {preferredBases.map((base, index) => {
                                return <label
                                    key={base}
                                    onClick={this.onTabClick.bind(this, base)}
                                    className={activeBase === base ? 'active' : ''}>
                                    <AssetName name={base}/>
                                </label>
                            })}
                        </div>
                    </div>
                    <div className="full-page-header search-bar">
                        <label>{this.formatMessage('markets_asset_filter')}</label>
                        <input onChange={this.onFilterChange.bind(this)} value={filterValue} type="text"
                               placeholder={this.formatMessage('markets_asset_filter_ph')}/>
                    </div>

                    <div className="order-list vertical-flex vertical-box">
                        <div className="order-list-header">
                            <span onClick={this.onSort.bind(this, 'name')}>{this.formatMessage('balance_assets')}</span>
                            <span style={priceStyle}>{this.formatMessage('transaction_depthPrice')}</span>
                            <span onClick={this.onSort.bind(this, 'change')}
                                  style={changeStyle}>{this.formatMessage('markets_change')}</span>
                        </div>
                        <div className="separate2"></div>
                        <div className="order-list-rows vertical-flex scroll">
                            {marketRows}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class MarketListContainer extends React.Component {
    render() {
        return (
            <AltContainer
                stores={[SettingsStore, MarketsStore, AssetStore]}
                inject={{
                    preferredBases: () => {
                        return SettingsStore.getState().preferredBases;
                    },
                    marketStats: () => {
                        return MarketsStore.getState().allMarketStats;
                    },
                    searchAssets: () => {
                        return AssetStore.getState().assets;
                    },
                    starredMarkets: () => {
                        return SettingsStore.getState().starredMarkets;
                    }
                }}>
                <MarketList />
            </AltContainer>
        );
    }
}
export default MarketListContainer;