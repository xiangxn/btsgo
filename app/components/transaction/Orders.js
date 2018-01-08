/**
 * Created by necklace on 2017/1/14.
 */
import React, { PropTypes } from "react";
import BaseComponent from "../BaseComponent";
import utils from "../../../common/utils";
import market_utils from "../../../common/market_utils";
import AssetName from "../Utility/AssetName";
import PriceText from "../Utility/PriceText";
import { FormattedDate } from "react-intl";
import Gestures from "react-gestures";
import { ChainStore } from "bitsharesjs";

//actions
import MarketsActions from "../../actions/MarketsActions";

class OrderRow extends BaseComponent {
    static propTypes = {
        onCancel: PropTypes.func
    };
    static defaultProps = {
        onCancel: null
    };

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        return (
            nextProps.order.for_sale !== this.props.order.for_sale ||
            nextProps.order.id !== this.props.order.id ||
            nextProps.quote !== this.props.quote ||
            nextProps.base !== this.props.base
        );
    }

    onSwipeLeft(orderID, e) {
        let x = e.gesture.absX;
        let row = document.getElementById("row_" + orderID);
        row.style.marginLeft = -x + "px";
        if (e.gesture.done) row.style.marginLeft = "";
        if (x >= 120) {
            row.style.marginLeft = "";
            if (this.props.onCancel) this.props.onCancel(orderID);
        }
    }

    render() {
        let { base, quote, order } = this.props;
        let { value, price, amount } = market_utils.parseOrder(order, base, quote);
        let isAsk = market_utils.isAsk(order, base);

        return (
            <Gestures onSwipeLeft={this.onSwipeLeft.bind(this, order.id)} swipeThreshold={2}>
                <div id={"row_" + order.id} key={order.id} className="order-list-row" style={{ touchAction: 'none' }}>
                    <span className={isAsk ? "orangeRed" : "green"}><PriceText preFormattedPrice={price} /></span>
                    <span>{utils.formatNumber(amount, 4)}</span>
                    <span className="blue">{utils.formatNumber(value, 4)}</span>
                    <span><FormattedDate value={order.expiration} format="short" /></span>
                </div>
            </Gestures>
        );
    }
}

class Orders extends BaseComponent {
    static propTypes = {
        base: PropTypes.object.isRequired,
        quote: PropTypes.object.isRequired,
        orders: PropTypes.object.isRequired,
        quoteSymbol: PropTypes.string.isRequired,
        baseSymbol: PropTypes.string.isRequired
    };
    static defaultProps = {
        base: {},
        quote: {},
        orders: {},
        quoteSymbol: "",
        baseSymbol: ""
    };

    constructor(props) {
        super(props);
    }

    cancelLimitOrder(orderID) {
        let { currentAccount } = this.props;
        //console.debug('currentAccount:', currentAccount.get('id'))
        //console.debug('orderID:', orderID)
        MarketsActions.cancelLimitOrder(
            currentAccount.get("id"),
            orderID // 用订单id取消订单
        );
    }

    render() {
        let {
            currentAccount, quoteAsset, baseAsset
        } = this.props;
        let orders = [], base = null, quote = null, quoteSymbol, baseSymbol, bids = null, asks = null, account = null;
        if (quoteAsset.size && baseAsset.size && currentAccount.size) {
            base = baseAsset;
            quote = quoteAsset;
            baseSymbol = base.get("symbol");
            quoteSymbol = quote.get("symbol");
            account = currentAccount.get("id");
        }

        orders = currentAccount.get("orders");

        let emptyRow = (<div className="order-list-row"><span>{this.formatMessage('account_no_orders')}</span></div>);
        let rows = [];
        orders.forEach(orderID => {
            let order = ChainStore.getObject(orderID).toJS();
            let orderbase = ChainStore.getAsset(order.sell_price.base.asset_id);
            let orderquote = ChainStore.getAsset(order.sell_price.quote.asset_id);
            let { price } = market_utils.parseOrder(order, orderbase, orderquote);
            rows.push(
                <OrderRow price={price.full} key={orderID} order={order} base={orderbase}
                    quote={orderquote} onCancel={this.cancelLimitOrder.bind(this)} />
            );
        });
        if (rows.size < 0) {
            rows.push(
                <div className="order-list vertical-flex vertical-box">
                    <div className="order-list-header">
                        <span>{this.formatMessage('transaction_depthPrice')}</span>
                        <AssetName name={quoteSymbol} />
                        <AssetName name={baseSymbol} />
                        <span>{this.formatMessage('transaction_expiration')}</span>
                    </div>
                    <div className="separate2"></div>
                    <div className="order-list-rows vertical-flex scroll">
                        {emptyRow}
                    </div>
                </div>
            );

        } 

        return (
            <div className="order-list vertical-flex vertical-box">
                <div className="order-list-header">
                    <span>{this.formatMessage('transaction_depthPrice')}</span>
                    <AssetName name={quoteSymbol} />
                    <AssetName name={baseSymbol} />
                    <span>{this.formatMessage('transaction_expiration')}</span>
                </div>
                <div className="separate2"></div>
                <div className="order-list-rows vertical-flex scroll">
                    {rows}
                </div>
            </div>
        );
    }
}

export default Orders;