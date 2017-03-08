/**
 * Created by necklace on 2017/1/14.
 */
import React, {PropTypes} from "react";
import BaseComponent from "../BaseComponent";
import utils from "../../../common/utils";
import market_utils from "../../../common/market_utils";
import AssetName from "../Utility/AssetName";
import PriceText from "../Utility/PriceText";
import {FormattedDate} from "react-intl";

//actions
import MarketsActions from "../../actions/MarketsActions";

class OrderRow extends BaseComponent {
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

    render() {
        let {base, quote, order} = this.props;
        let {value, price, amount} = market_utils.parseOrder(order, base, quote);
        let isAskOrder = market_utils.isAsk(order, base);

        return (
            <div key={order.id} className="order-list-row">
                <span><PriceText preFormattedPrice={price}/></span>
                <span>{utils.format_number(amount, 4)}</span>
                <span>{utils.format_number(value, 4)}</span>
                <span><FormattedDate value={order.expiration} format="short"/></span>
            </div>
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

    cancelLimitOrder(orderID, e) {
        e.preventDefault();
        let {currentAccount} = this.props;
        MarketsActions.cancelLimitOrder(
            currentAccount.get("id"),
            orderID // 用订单id取消订单
        );
    }

    render() {
        let {
            currentAccount, quoteAsset, baseAsset, marketLimitOrders
        } = this.props;
        let orders = marketLimitOrders, base = null, quote = null, quoteSymbol, baseSymbol, bids = null, asks = null,account=null;
        if (quoteAsset.size && baseAsset.size && currentAccount.size) {
            base = baseAsset;
            quote = quoteAsset;
            baseSymbol = base.get("symbol");
            quoteSymbol = quote.get("symbol");
            account = currentAccount.get("id");
        }

        let emptyRow = (<div className="order-list-row"><span>{this.formatMessage('account_no_orders')}</span></div>);

        if (orders.size > 0 && base && quote) {
            bids = orders.filter(a => {
                return (a.seller === account && a.sell_price.quote.asset_id !== base.get("id"));
            }).sort((a, b) => {
                let {price: a_price} = market_utils.parseOrder(a, base, quote);
                let {price: b_price} = market_utils.parseOrder(b, base, quote);

                return b_price.full - a_price.full;
            }).map(order => {
                let {price} = market_utils.parseOrder(order, base, quote);
                return <OrderRow price={price.full} ref="orderRow" key={order.id} order={order} base={base}
                                 quote={quote} onCancel={this.cancelLimitOrder.bind(this, order.id)}/>;
            }).toArray();

            asks = orders.filter(a => {
                return (a.seller === account && a.sell_price.quote.asset_id === base.get("id"));
            }).sort((a, b) => {
                let {price: a_price} = market_utils.parseOrder(a, base, quote);
                let {price: b_price} = market_utils.parseOrder(b, base, quote);

                return a_price.full - b_price.full;
            }).map(order => {
                let {price} = market_utils.parseOrder(order, base, quote);
                return <OrderRow price={price.full} key={order.id} order={order} base={base} quote={quote}
                                 onCancel={this.cancelLimitOrder.bind(this, order.id)}/>;
            }).toArray();

        } else {
            return (
                <div className="order-list vertical-flex vertical-box">
                    <div className="order-list-header">
                        <span>{this.formatMessage('transaction_depthPrice')}</span>
                        <AssetName name={quoteSymbol}/>
                        <AssetName name={baseSymbol}/>
                        <span>{this.formatMessage('transaction_expiration')}</span>
                    </div>
                    <div className="separate2"></div>
                    <div className="order-list-rows vertical-flex scroll">
                        {emptyRow}
                    </div>
                </div>
            );
        }

        let rows = [];

        if (asks.length) {
            rows = rows.concat(asks);
        }
        if (bids.length) {
            rows = rows.concat(bids);
        }
        rows.sort((a, b) => {
            return a.props.price - b.props.price;
        });

        return (
            <div className="order-list vertical-flex vertical-box">
                <div className="order-list-header">
                    <span>{this.formatMessage('transaction_depthPrice')}</span>
                    <AssetName name={quoteSymbol}/>
                    <AssetName name={baseSymbol}/>
                    <span>{this.formatMessage('transaction_expiration')}</span>
                </div>
                <div className="separate2"></div>
                <div className="order-list-rows vertical-flex scroll">
                    {rows.length ? rows : emptyRow}
                </div>
            </div>
        );
    }
}

export default Orders;