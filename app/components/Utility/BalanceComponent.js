/**
 * Created by necklace on 2017/2/8.
 */
import React from "react";
import FormattedAsset from "./FormattedAsset";
import ChainTypes from "./ChainTypes";
import BindToChainState from "./BindToChainState";

/**
 * 显示一个余额对象
 * balance属性为余额对象的id
 */
class BalanceComponent extends React.Component {

    static propTypes = {
        balance: ChainTypes.ChainObject.isRequired,
        assetInfo: React.PropTypes.node
    }

    render() {
        let amount = Number(this.props.balance.get("balance"));
        let type = this.props.balance.get("asset_type");
        return (<FormattedAsset amount={amount} asset={type} asPercentage={this.props.asPercentage} assetInfo={this.props.assetInfo}/>);
    }
}

export default BindToChainState(BalanceComponent, {keep_updating: true});