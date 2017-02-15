/**
 * Created by necklace on 2017/1/13.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import ChainTypes from "../Utility/ChainTypes";
import utils from "../../../common/utils";
import BindToChainState from "../Utility/BindToChainState";
import connectToStores from "alt-utils/lib/connectToStores";
import AssetName from "../Utility/AssetName";

//actions
import MarketsActions from "../../actions/MarketsActions";

//stores
import MarketsStore from "../../stores/MarketsStore";

class AssetsItem extends BaseComponent {
    static propTypes = {
        quote: ChainTypes.ChainAsset.isRequired,
        base: ChainTypes.ChainAsset.isRequired,
        invert: React.PropTypes.bool
    };

    static defaultProps = {
        invert: true
    };

    constructor(props) {
        super(props);
        this.statsInterval = null;
    }

    shouldComponentUpdate(nextProps) {
        return (
            !utils.are_equal_shallow(nextProps, this.props)
        );
    }

    componentWillMount() {
        MarketsActions.getMarketStats.defer(this.props.quote, this.props.base);
        this.statsChecked = new Date();
        this.statsInterval = setInterval(MarketsActions.getMarketStats.bind(this, this.props.quote, this.props.base), 35 * 1000);
    }

    componentWillUnmount() {
        clearInterval(this.statsInterval);
    }

    onClickHandler(e) {
        e.preventDefault();
        this.context.router.push(`/transaction/${this.props.base.get("symbol")}_${this.props.quote.get("symbol")}`);
    }

    render() {
        let {base, quote, marketStats} = this.props;

        function getImageName(asset) {
            let symbol = asset.get("symbol");
            if (symbol === "OPEN.BTC") return symbol;
            let imgName = asset.get("symbol").split(".");
            return imgName.length === 2 ? imgName[1] : imgName[0];
        }

        let imgName = getImageName(base);
        let marketID = base.get("symbol") + "_" + quote.get("symbol");
        let stats = marketStats.get(marketID);
        let gainClass = "def-label";
        if (stats) {
            let change = parseFloat(stats.change);
            gainClass = change > 0 ? "green-label" : change < 0 ? "orange-label" : "def-label";
        }
        if (imgName === "BTS") {
            imgName = getImageName(quote);
        }

        let unitPrice = this.props.unitPrice;
        let gain = this.props.gain;
        return (
            <div className="assets-item" onClick={this.onClickHandler.bind(this)}>
                <div><img ref={imgName.toLowerCase()} onError={() => {this.refs[imgName.toLowerCase()].src = "asset-symbols/bts.png";}}
                          src={"asset-symbols/"+ imgName.toLowerCase() + ".png"}/></div>
                <div>
                    <label className="def-label"><AssetName name={base.get("symbol")} /> : <AssetName name={quote.get("symbol")} /></label>
                    <label className="def-label">{unitPrice} {this.props.clearingUnit}</label>
                    <label className={gainClass}>{gain} %</label>
                </div>
            </div>
        );
    }
}

AssetsItem = BindToChainState(AssetsItem);

class AssetsItemWrapper extends React.Component {
    static getPropsFromStores() {
        return {
            marketStats: MarketsStore.getState().allMarketStats
        };
    }

    static getStores() {
        return [MarketsStore];
    }

    render() {
        return (
            <AssetsItem {...this.props} />
        );
    }
}

export default connectToStores(AssetsItemWrapper);