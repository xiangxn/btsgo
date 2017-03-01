/**
 * Created by necklace on 2017/2/3.
 */
import React, {PropTypes} from "react";
import {FormattedNumber} from "react-intl";
import ChainTypes from "./ChainTypes";
import utils from "../../../common/utils";
import BindToChainState from "./BindToChainState";
import AssetName from "./AssetName";


class FormattedAsset extends React.Component {
    static propTypes = {
        amount: PropTypes.any.isRequired,           //数量
        exact_amount: PropTypes.bool,               //准确数量
        decimalOffset: PropTypes.number,            //十进制偏移
        asset: ChainTypes.ChainAsset.isRequired,    //资产
        hide_asset: PropTypes.bool,                 //隐藏资产名
        hide_amount: PropTypes.bool,                //隐藏资产数量
        asPercentage: PropTypes.bool,               //作为百分比显示
        assetInfo: PropTypes.node,                   //资产信息
        className: PropTypes.string                  //样式名
    }
    static defaultProps = {
        amount: 0,
        decimalOffset: 0,
        hide_asset: false,
        hide_amount: false,
        asPercentage: false,
        assetInfo: null,
        className: ""
    }

    render() {
        let {amount, decimalOffset, asset, hide_asset, hide_amount, asPercentage} = this.props;

        if (asset && asset.toJS) asset = asset.toJS();
        let decimals = Math.max(0, asset.precision - decimalOffset);
        let precision = utils.get_asset_precision(asset.precision);
        if (asPercentage) {
            let supply = parseInt(asset.dynamic.current_supply, 10);
            let percent = utils.format_number((amount / supply) * 100, 4);
            return (
                <span className={this.props.className}>
                    {percent}%
                </span>
            );
        }
        return (
            <span className={this.props.className}>
                {hide_amount ? null :
                    <FormattedNumber
                        value={this.props.exact_amount ? amount : amount / precision}
                        minimumFractionDigits={0}
                        maximumFractionDigits={decimals}
                    />
                }
                &nbsp;
                {hide_asset ? null :
                    <AssetName noPrefix={this.props.noPrefix} name={asset.symbol}/>
                }
            </span>
        );
    }
}

FormattedAsset = BindToChainState(FormattedAsset);

export default FormattedAsset;