import React from "react";
import BaseComponent from "../BaseComponent";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import FormattedAsset from "../Utility/FormattedAsset";
import {ChainStore} from "bitsharesjs";


class AssetOption extends React.Component {

    static propTypes = {
        asset: ChainTypes.ChainObject,
        asset_id: React.PropTypes.string
    }

    render() {
        let symbol = this.props.asset ? this.props.asset.get("symbol") : this.props.asset_id;
        return (<option value={this.props.asset_id}>{symbol}</option>);
    }
}
AssetOption = BindToChainState(AssetOption);

class AssetSelector extends React.Component {

    static propTypes = {
        value: React.PropTypes.string, // 资产id
        assets: React.PropTypes.array, // 显示lable的locale属性id
        onChange: React.PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            selected: props.value || props.assets[0]
        }
    }

    onChange(event) {
        let asset = ChainStore.getAsset(event.target.value);
        this.props.onChange(asset);
        this.setState({
            selected: asset ? asset.get("id") : "1.3.0"
        });
    }

    render() {
        if (this.props.assets.length === 0) return null;
        var options = this.props.assets.map(function (value) {
            return <AssetOption key={value} asset={value} asset_id={value}/>
        });

        if (this.props.assets.length == 1) {
            return ( <FormattedAsset asset={this.props.assets[0]} amount={0} hide_amount={true}/> )

        } else {
            return (
                <select className="select" value={this.state.selected} onChange={this.onChange.bind(this)}>
                    {options}
                </select>
            );
        }
    }
}

class AmountSelector extends BaseComponent {
    static propTypes = {
        label: React.PropTypes.string, // 显示lable
        asset: ChainTypes.ChainAsset.isRequired, // 默认选择的资产
        assets: React.PropTypes.array,
        amount: React.PropTypes.any,
        placeholder: React.PropTypes.string,
        onChange: React.PropTypes.func.isRequired,
        balance: React.PropTypes.object//余额对象不为空时显示
    };

    static defaultProps = {
        disabled: false
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.onAssetChange(this.props.asset);
    }

    formatAmount(v) {
        if (!v) v = "";
        if (typeof v === "number") v = v.toString();
        let value = v.trim().replace(/,/g, "");
        while (value.substring(0, 2) == "00")
            value = value.substring(1);
        if (value[0] === ".") value = "0" + value;
        else if (value.length) {
            let n = Number(value)
            if (isNaN(n)) {
                value = parseFloat(value);
                if (isNaN(value)) return "";
            }
            let parts = (value + "").split('.');
            value = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (parts.length > 1) value += "." + parts[1];
        }
        return value;
    }

    onChange(event) {
        let amount = event.target.value
        this.setState({amount})
        this.props.onChange({amount: amount, asset: this.props.asset})
    }

    onAssetChange(selected_asset) {
        this.setState({selected_asset})
        this.props.onChange({amount: this.props.amount, asset: selected_asset})
    }

    /**
     * 点击余额
     * @param e
     */
    onBalanceClick(e) {

    }

    render() {
        //console.debug('balance==',this.props.balance)
        let value = this.formatAmount(this.props.amount);


        return (
            <div className="text-img-input">
                <div className="text-box clear-leftpadding">
                    <div className="label">
                        <span>{this.props.label}</span>
                        {!this.props.balance ? null :
                            <span>{this.formatMessage('transfer_balance')}: </span>
                        }
                        {!this.props.balance ? null :
                            this.props.balance
                        }
                    </div>
                    <div className="input">
                        <input
                            disabled={this.props.disabled}
                            value={value || ""}
                            onChange={this.onChange.bind(this) }
                            placeholder={this.props.placeholder}
                            type="text"/>
                        <label>
                            <AssetSelector
                                ref={this.props.refCallback}
                                value={this.props.asset.get("id")}
                                assets={this.props.assets}
                                onChange={this.onAssetChange.bind(this)}
                            />
                        </label>
                    </div>
                </div>
            </div>
        );
    }
}

AmountSelector = BindToChainState(AmountSelector);
export default AmountSelector;
