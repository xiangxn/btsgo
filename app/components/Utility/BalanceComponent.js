/**
 * Created by necklace on 2017/2/8.
 */
import React,{PropTypes} from "react";
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
        assetInfo: React.PropTypes.node,
        hide_asset: PropTypes.bool,                 //隐藏资产名
        hide_amount: PropTypes.bool                //隐藏资产数量
    }
    static defaultProps = {
        hide_asset: false,
        hide_amount: false
    }

    getBalance(){
        return Number(this.props.balance.get("balance"));
    }

    render() {
        let amount = this.getBalance();
        let type = this.props.balance.get("asset_type");
        return (<FormattedAsset noPrefix={this.props.noPrefix} hide_amount={this.props.hide_amount} hide_asset={this.props.hide_asset} amount={amount}
                                asset={type} asPercentage={this.props.asPercentage} assetInfo={this.props.assetInfo}/>);
    }
}

export default BindToChainState(BalanceComponent, {keep_updating: true});