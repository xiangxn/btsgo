/**
 * Created by necklace on 2017/3/29.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import AltContainer from "alt-container";
import AssetName from "../Utility/AssetName";
import Immutable from "immutable";
import {debounce} from "lodash";

//stores
import AssetStore from "../../stores/AssetStore";
import MarketsStore from "../../stores/MarketsStore";
import SettingsStore from "../../stores/SettingsStore";

//actions
import AssetActions from "../../actions/AssetActions";

class MarketList extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeBase: 'CNY',
            filterValue: '',
            lookupQuote: '',
            lookupBase: ''
        };
        this.getAssetList = debounce(AssetActions.getAssetList, 150);
    }

    onTabClick(base, e) {
        this.setState({activeBase: base});
    }

    onFilterChange(e) {
        this.setState({filterValue: e.target.value});
    }

    render() {
        let {preferredBases, searchAssets} = this.props;
        let {activeBase, filterValue} = this.state;
        //console.debug('preferredBases', preferredBases);
        let changeStyle = {textAlign: 'right'};
        let priceStyle = {textAlign: 'center'};

        let searchMarkets = [], allMarkets = [];
        if (searchAssets.size) {
            searchAssets.forEach(asset => {
                let marketID = asset.symbol + "_" + activeBase;
                if (activeBase !== asset.symbol) {
                    allMarkets.push([marketID, {quote: asset.symbol, base: base}]);
                }
            });
        }
        console.debug(searchAssets);
        allMarkets = Immutable.Map(allMarkets);
        if (allMarkets.size > 0) {
            searchMarkets = allMarkets.take(50).toArray();
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
                    <div className="separate2"></div>
                    <div className="order-list vertical-flex vertical-box">
                        <div className="order-list-header">
                            <span>{this.formatMessage('balance_assets')}</span>
                            <span style={priceStyle}>{this.formatMessage('transaction_depthPrice')}</span>
                            <span style={changeStyle}>{this.formatMessage('markets_change')}</span>
                        </div>
                        <div className="separate2"></div>
                        <div className="order-list-rows vertical-flex scroll">
                            {searchMarkets.map(market => {
                                return (
                                    <div className="order-list-row">
                                        <span>{market.quote}</span>
                                        <span className="green" style={priceStyle}>0.00015</span>
                                        <span className="green" style={changeStyle}>+100%</span>
                                    </div>
                                );
                            })}
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
                    }
                }}>
                <MarketList/>
            </AltContainer>
        );
    }
}
export default MarketListContainer;