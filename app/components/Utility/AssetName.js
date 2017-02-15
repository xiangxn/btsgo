/**
 * Created by necklace on 2017/2/4.
 */
import React from "react";
import BindToChainState from "./BindToChainState";
import ChainTypes from "./ChainTypes";
import utils from "../../../common/utils";

class AssetName extends React.Component {
    static propTypes = {
        asset: ChainTypes.ChainAsset.isRequired,
        replace: React.PropTypes.bool.isRequired,
        name: React.PropTypes.string.isRequired
    };

    static defaultProps = {
        replace: true,
        noPrefix: false
    };

    shouldComponentUpdate(nextProps) {
        return (
            nextProps.replace !== this.props.replace ||
            nextProps.name !== this.props.replace
        );
    }

    render() {
        let {name, replace, asset, noPrefix} = this.props;
        let isBitAsset = asset.has("bitasset");
        let isPredMarket = isBitAsset && asset.getIn(["bitasset", "is_prediction_market"]);

        let {name: replacedName, prefix} = utils.replaceName(name, isBitAsset && !isPredMarket && asset.get("issuer") === "1.2.0");

        if (replace && replacedName !== this.props.name) {
            return <span>{!noPrefix ? prefix : null}{replacedName}</span>;
        } else {
            return <span>{!noPrefix ? prefix : null}{name}</span>;
        }
    }
}

AssetName = BindToChainState(AssetName);

export default class AssetNameWrapper extends React.Component {

    render() {
        return (
            <AssetName {...this.props} asset={this.props.name} />
        );
    }
}