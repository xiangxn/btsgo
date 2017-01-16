/**
 * Created by necklace on 2017/1/16.
 */
import React from "react";
import BaseComponent from "../BaseComponent";

class TransactionOperation extends BaseComponent {
    static propTypes = {
        aSymbol: React.PropTypes.string.isRequired,//交易资产符号
        bSymbol: React.PropTypes.string.isRequired,//结算资产符号
        btnClass: React.PropTypes.string.isRequired,//确认提交订单按钮的样式
        btnText: React.PropTypes.string.isRequired,//确认提交订单按钮的文本
        amountClass: React.PropTypes.string.isRequired,//交易金额的文本样式
        orderType: React.PropTypes.number,//交易单类型0为限价单，1为市价单
        onConfirmSub: React.PropTypes.func,//确认提交事件，会提供提交的数据对象

    };
    static defaultProps = {
        aSymbol: "bitCNY",
        bSymbol: "BTS",
        btnClass: "green-btn",
        btnText: "",
        amountClass: "green",
        orderType: 0,
        onConfirmSub: null,
        prive: null
    };

    constructor(props) {
        super(props);
        this.state = {
            orderType: props.orderType,     //当前交易单类型
            price: null,//价格初始由外部传入
            amount:null,//金额初始由外部传入
            turnover:null//成交额初始由外部传入
        }
    }

    //处理交易单类型选择
    onTypeChange(type) {
        this.setState({orderType: type});
    }

    onSubClick() {
        let form = {};
        if (this.state.orderType === 0) {
            form.orderType = this.state.orderType;
            form.price = this.refs.price.value;
            form.amount = this.refs.amount.value;
            form.turnover = this.refs.turnover.value;
            form.chargefee = this.refs.chargefee.value;
        } else {
            form.amount = this.refs.amount.value;
            form.chargefee = this.refs.chargefee.value;
        }
        this.props.onConfirmSub && this.props.onConfirmSub(form);
    }

    //金额输入变化，改变成交额
    onAmountChange(e) {
        let amount = e.target.value;
        let price = this.refs.price.value;
        if (amount !== "" && price !== "" && !isNaN(amount) && !isNaN(price)) {
            let val = parseFloat(price) * parseFloat(amount);
            this.refs.turnover.value = val;
        }
    }

    //成交额输入变化，改变金额
    onTurnoverChange(e) {

        let turnover = e.target.value;
        let price = this.refs.price.value;
        if (turnover !== "" && price !== "" && !isNaN(turnover) && !isNaN(price)) {
            let p = parseFloat(price);
            if (p > 0) {
                let val = parseFloat(turnover) / p;
                this.refs.amount.value = val;
            }
        }
    }

    render() {
        let aSymbol = this.props.aSymbol;
        let bSymbol = this.props.bSymbol;

        let checkBtnList = ["transaction_limitPrice", "transaction_marketPrice"];
        return (
            <div>
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
                {(this.state.orderType !== 0) ? null :
                    <p>
                        {this.formatMessage("transaction_price", {symbol: bSymbol})}<br/>
                        <input ref="price" type="number" value={this.state.price}/>
                    </p>
                }
                {(this.state.orderType === 0) ?
                    <p>
                        <label
                            className={this.props.amountClass}>{this.formatMessage("transaction_amount", {symbol: aSymbol})}</label><br/>
                        <input ref="amount" type="number" value={this.state.amount} onChange={this.onAmountChange.bind(this)}/>
                    </p>
                    :
                    <p>
                        <label
                            className={this.props.amountClass}>{this.formatMessage("transaction_count", {symbol: bSymbol})}</label><br/>
                        <input ref="amount" type="number"/>
                    </p>
                }

                {(this.state.orderType !== 0) ? null :
                    <p>
                        {this.formatMessage("transaction_turnover", {symbol: bSymbol})}<br/>
                        <input ref="turnover" type="number" value={this.state.turnover} onChange={this.onTurnoverChange.bind(this)}/>
                    </p>
                }
                < p >
                    {this.formatMessage("transaction_chargefee", {symbol: bSymbol})}<br/>
                    <input ref="chargefee" type="number"/>
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
