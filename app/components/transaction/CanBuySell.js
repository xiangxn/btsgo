/**
 * Created by necklace on 2017/3/1.
 */
import React from "react";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import utils from "../../../common/utils";
import {FormattedNumber} from "react-intl";

class CanBuySell extends React.Component {
    static propTypes = {
        balance: ChainTypes.ChainObject.isRequired,
        price: React.PropTypes.number,
        fromAsset: ChainTypes.ChainAsset.isRequired,
        isAsk: React.PropTypes.bool
    };
    static defaultProps = {
        isAsk: false
    };

    render() {
        let {fromAsset, balance, price}=this.props;
        let balances = Number(balance.get("balance"));
        let value = 0;
        let cn = 'green';
        if (fromAsset && fromAsset.toJS) fromAsset = fromAsset.toJS();
        let precision = utils.get_asset_precision(fromAsset.precision);
        if (this.props.isAsk) {
            cn = 'orangeRed';
            value = (balances/precision) * price;
        } else {
            value = (balances/precision) / price;
        }
        let decimals = Math.max(0, fromAsset.precision);

        return (
            <label className={cn}>
                <FormattedNumber
                    value={value}
                    minimumFractionDigits={0}
                    maximumFractionDigits={decimals}
                />
            </label>
        );
    }
}
export default BindToChainState(CanBuySell);