/**
 * Created by necklace on 2017/2/3.
 */
import React, {PropTypes} from "react";
import {FormattedNumber} from "react-intl";
import ChainTypes from "./ChainTypes";
import utils from "../../../common/utils";
import BindToChainState from "./BindToChainState";


class FormattedAsset extends React.Component {
    static propTypes = {
        amount: PropTypes.any.isRequired,
        exact_amount: PropTypes.bool,
        decimalOffset: PropTypes.number,
        asset: ChainTypes.ChainAsset.isRequired
    }
    static defaultProps = {
        decimalOffset: 0,
        amount: 0
    }

    render() {
        let {amount, decimalOffset, asset} = this.props;
        let decimals = Math.max(0, asset.precision - decimalOffset);
        let precision = utils.get_asset_precision(asset.precision);
        return (
            <span>
            <FormattedNumber
                value={this.props.exact_amount ? amount : amount / precision}
                minimumFractionDigits={0}
                maximumFractionDigits={decimals}
            />
                <AssetName noPrefix={this.props.noPrefix} name={asset.symbol}/>
            </span>
        );
    }
}

FormattedAsset = BindToChainState(FormattedAsset);

export default FormattedAsset;