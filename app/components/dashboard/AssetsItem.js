/**
 * Created by necklace on 2017/1/13.
 */
import React from "react";
import defaultIcon from "../../assets/imgs/symbols/bts.png";

class AssetsItem extends React.Component {
    static propTypes = {
        assetsIcon: React.PropTypes.string,//资产图标路径
        assetsName: React.PropTypes.string,//资产名
        clearingUnit: React.PropTypes.string,//结算单位
        unitPrice: React.PropTypes.number,//单价
        gain: React.PropTypes.number,//涨幅，为负值时反应的是跌幅
        onClick: React.PropTypes.func//单击事件
    };
    static defaultProps = {
        assetsIcon: defaultIcon,
        assetsName: "bitCNY",
        clearingUnit: "BTS",
        unitPrice: 123.001,
        gain: 12.01,
        onClick: null
    };

    constructor(props) {
        super(props);
    }

    onClickHandler(e) {
        this.props.onClick && this.props.onClick(e);
    }

    render() {
        let gainClass = "green-label";
        if (this.props.gain < 0) {
            gainClass = "orange-label";
        } else if (this.props.gain === 0) {
            gainClass = "def-label";
        }
        let unitPrice = this.props.unitPrice;
        let gain = this.props.gain;
        return (
            <div className="assets-item" onClick={this.onClickHandler.bind(this)}>
                <div><img src={this.props.assetsIcon}/></div>
                <div>
                    <label className="def-label">{this.props.assetsName}</label>
                    <label className="def-label">{unitPrice} {this.props.clearingUnit}</label>
                    <label className={gainClass}>{gain} %</label>
                </div>
            </div>
        );
    }
}

export default AssetsItem;