/**
 * Created by necklace on 2017/1/16.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import utils from "../../../common/utils";
import {Asset, Price, LimitOrderCreate} from "../../../common/MarketClasses";

class TransactionOperation extends BaseComponent {
    static propTypes = {
        quoteAsset: React.PropTypes.object,//交易资产
        baseAsset: React.PropTypes.object,//结算资产
        feeAsset: React.PropTypes.object,//手续费资产
        btnClass: React.PropTypes.string.isRequired,//确认提交订单按钮的样式
        btnText: React.PropTypes.string.isRequired,//确认提交订单按钮的文本
        amountClass: React.PropTypes.string.isRequired,//交易金额的文本样式
        orderType: React.PropTypes.number,//交易单类型0为限价单，1为市价单
        onConfirmSub: React.PropTypes.func,//确认提交事件，会提供提交的数据对象
        isAsk: React.PropTypes.bool
    };
    static defaultProps = {
        quoteAsset: null,
        baseAsset: null,
        btnClass: "green-btn",
        btnText: "",
        amountClass: "green",
        orderType: 0,
        onConfirmSub: null,
        isAsk: false
    };

    constructor(props) {
        super(props);
        this.state = this.initialState(props);
    }

    initialState(props) {
        let qa = new Asset({
            asset_id: props.quoteAsset.get("id"),
            precision: props.quoteAsset.get("precision")
        });
        let ba = new Asset({
            asset_id: props.baseAsset.get("id"),
            precision: props.baseAsset.get("precision")
        });

        let s = {
            orderType: props.orderType,     //当前交易单类型
            price: new Price({base: ba, quote: qa}),//价格初始由外部传入
            priceText: '',
            amount: qa,//金额初始由外部传入
            amountText: '',
            turnover: ba,//成交额初始由外部传入
            turnoverText: ''
        };
        return s;
    }

    //处理交易单类型选择
    onTypeChange(type) {
        this.setState({orderType: type});
    }

    onSubClick() {
        let form = {};
        if (this.state.orderType === 0) {
            form.orderType = this.state.orderType;
            form.price = this.state.price;
            form.amount = this.state.amount;
            form.turnover = this.state.turnover;
            form.chargefee = this.props.fee;
        } else {
            form.amount = this.state.amount;
            form.chargefee = this.props.fee;
        }
        this.props.onConfirmSub && this.props.onConfirmSub(form);
    }

    //价格输入变化
    onPriceChange(e) {
        let {isAsk}=this.props;
        let price = this.refs.price.value;
        let p = new Price({
            base: isAsk ? this.state.amount : this.state.turnover,
            quote: isAsk ? this.state.turnover : this.state.amount,
            real: parseFloat(price) || 0
        });
        this.setState({price: p, priceText: price});
    }

    //金额输入变化，改变成交额
    onAmountChange(e) {
        let s_amount = e.target.value;
        let {amount, turnover, price}=this.state;

        // if (s_amount === "" || isNaN(s_amount)) s_amount = "0";

        let a = parseFloat(s_amount) || 0;
        let val = price.toReal() * a;
        amount.setAmount({real: a || 0});
        turnover.setAmount({real: val || 0});
        this.setState({
            amount: amount,
            amountText: s_amount,
            turnover: turnover,
            turnoverText: turnover.getAmount({real: true})
        });
    }

    //成交额输入变化，改变金额
    onTurnoverChange(e) {
        let s_turnover = e.target.value;
        let {amount, turnover, price}=this.state;
        //if (s_turnover === "" || isNaN(s_turnover)) s_turnover = "0";
        let p = price.toReal();
        let t = parseFloat(s_turnover) || 0;
        if (p > 0) {
            let val = t / p;
            amount.setAmount({real: val || 0});
            turnover.setAmount({real: t || 0});
            this.setState({
                amount: amount,
                amountText: amount.getAmount({real: true}),
                turnover: turnover,
                turnoverText: s_turnover
            });
        }
    }

    render() {
        let {quoteAsset, baseAsset, feeAsset, fee} = this.props;

        let checkBtnList = ["transaction_limitPrice", "transaction_marketPrice"];
        return (
            <div>
                {(this.state.orderType !== 0) ? null :
                    <p>
                        {this.formatMessage("transaction_price", {symbol: utils.getAssetName(baseAsset)})}<br/>
                        <input ref="price" type="number" value={this.state.priceText}
                               onChange={this.onPriceChange.bind(this)}/>
                    </p>
                }
                {(this.state.orderType === 0) ?
                    <p>
                        <label
                            className={this.props.amountClass}>{this.formatMessage("transaction_amount", {symbol: utils.getAssetName(quoteAsset)})}</label><br/>
                        <input ref="amount" type="number" value={this.state.amountText}
                               onChange={this.onAmountChange.bind(this)}/>
                    </p>
                    :
                    <p>
                        <label
                            className={this.props.amountClass}>{this.formatMessage("transaction_count", {symbol: utils.getAssetName(quoteAsset)})}</label><br/>
                        <input ref="amount" type="number"/>
                    </p>
                }

                {(this.state.orderType !== 0) ? null :
                    <p>
                        {this.formatMessage("transaction_turnover", {symbol: utils.getAssetName(baseAsset)})}<br/>
                        <input ref="turnover" type="number" value={this.state.turnoverText}
                               onChange={this.onTurnoverChange.bind(this)}/>
                    </p>
                }
                < p >
                    {this.formatMessage("transaction_chargefee", {symbol: utils.getAssetName(feeAsset)})}<br/>
                    <input ref="chargefee" type="number" value={fee.getAmount({real: true})} autoComplete="off"/>
                </p>
                <p>
                    <input type="button" className={this.props.btnClass}
                           value={this.props.btnText} onClick={this.onSubClick.bind(this)}/>
                </p>
            </div>
        );
    }
}

export default TransactionOperation;


/**
 <p className="check-btn-box">
 {
     checkBtnList.map((item, i) => {
         if (this.state.orderType === i) {
             return (<label className="active" onClick={this.onTypeChange.bind(this, i)}>
                 {this.formatMessage(item)}
             </label>);
         } else {
             return (<label onClick={this.onTypeChange.bind(this, i)}>
                 {this.formatMessage(item)}
             </label>);
         }
     })
 }
 </p>
 */