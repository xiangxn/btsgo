/**
 * Created by necklace on 2017/3/6.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import utils from "../../../common/utils";
import market_utils from "../../../common/market_utils";
import AssetName from "../Utility/AssetName";

//import PriceText from "../Utility/PriceText";

class OrderBookRow extends BaseComponent {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.order.market_base !== this.props.order.market_base) return false;
        return (
            nextProps.order.ne(this.props.order) ||
            nextProps.index !== this.props.index
        );
    }

    render() {
        let {order, quote, base} = this.props;
        const isBid = order.isBid();
        const isCall = order.isCall();

        //let price = <PriceText price={order.getPrice()} quote={quote} base={base}/>;
        let {price} = market_utils.parseOrder(order, base, quote);

        return (
            <div className="depth-list-row" onClick={this.props.onClick}>
                <span>{utils.formatNumber(order[isBid ? "amountForSale" : "amountToReceive"]().getAmount({real: true}), 4)}</span>
                <span>{utils.formatNumber(order[isBid ? "amountToReceive" : "amountForSale"]().getAmount({real: true}), 4)}</span>
                <span>{utils.formatNumber(price.full, 4)}</span>
            </div>
        );
    }
}

class OrderBook extends BaseComponent {
    static propTypes = {
        isAsk: React.PropTypes.bool
    };
    static defaultProps = {
        isAsk: false
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let uplist = this.refs.uplist;
        setTimeout(() => {
            uplist.scrollTop = uplist.scrollHeight;
        }, 200);
    }

    render() {
        let {
            combinedBids, combinedAsks, highestBid, lowestAsk, quote, base,
            totalAsks, totalBids, quoteSymbol, baseSymbol, isAsk
        } = this.props;

        let bidRows = null, askRows = null;
        if (base && quote) {
            let tempBids = combinedBids.filter(a => {
                return a.getPrice() >= highestBid.getPrice() / 5;
            });
            if (isAsk) {
                tempBids.sort((a, b) => {
                    return a.getPrice() - b.getPrice();
                });
            }
            bidRows = tempBids.map((order, index) => {
                return (
                    <OrderBookRow
                        index={index}
                        key={order.getPrice() + (order.isCall() ? "_call" : "")}
                        order={order}
                        onClick={this.props.onClick.bind(this, order)}
                        base={base}
                        quote={quote}
                    />
                );
            });

            let tempAsks = combinedAsks
                .filter(a => {
                    return a.getPrice() <= lowestAsk.getPrice() * 5;
                });
            if (!isAsk) {
                tempAsks.sort((a, b) => {
                    return b.getPrice() - a.getPrice();
                });
            }
            askRows = tempAsks.map((order, index) => {
                return (
                    <OrderBookRow
                        index={index}
                        key={order.getPrice() + (order.isCall() ? "_call" : "")}
                        order={order}
                        onClick={this.props.onClick.bind(this, order)}
                        base={base}
                        quote={quote}
                        type={order.type}
                    />
                );
            });
        }

        let cnbid, cnask;
        if (!isAsk) {
            cnbid = 'depth-list-buy scroll';
            cnask = 'depth-list-sell scroll';
            askRows.splice(0, askRows.length - 50);
            bidRows.splice(50, bidRows.length);
        } else {
            cnbid = 'depth-list-sell scroll';
            cnask = 'depth-list-buy scroll';
            bidRows.splice(0, bidRows.length - 50);
            askRows.splice(50, askRows.length);
        }


        return (
            <div className="depth-list">
                <div className="depth-list-header">
                    <div><AssetName name={baseSymbol}/></div>
                    <div><AssetName name={quoteSymbol}/></div>
                    <div>{this.formatMessage("transaction_depthPrice")}</div>
                </div>
                <div ref="uplist" className={cnask}>
                    {(!isAsk) ? askRows : bidRows}
                </div>
                <div className="separate2"></div>
                <div className={cnbid}>
                    {(!isAsk) ? bidRows : askRows}
                </div>
            </div>
        );
    }
}

export default OrderBook;