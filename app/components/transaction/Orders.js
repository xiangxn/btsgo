/**
 * Created by necklace on 2017/1/14.
 */
import React from "react";
import BaseComponent from "../BaseComponent";

class Orders extends BaseComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let aSymbol = "bitCNY";
        let bSymbol = "BTS";

        return (
            <div className="order-list vertical-flex vertical-box">
                <div className="order-list-header">
                    <span>价格</span>
                    <span>{aSymbol}</span>
                    <span>{bSymbol}</span>
                    <span>过期时间</span>
                </div>
                <div className="separate2"></div>
                <div className="order-list-rows vertical-flex scroll">
                    <div className="order-list-row">
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>2017-01-31</span>
                    </div>
                    <div className="order-list-row">
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>2017-01-31</span>
                    </div>
                    <div className="order-list-row">
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>2017-01-31</span>
                    </div>
                    <div className="order-list-row">
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>2017-01-31</span>
                    </div>
                    <div className="order-list-row">
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>2017-01-31</span>
                    </div>
                    <div className="order-list-row">
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>2017-01-31</span>
                    </div>
                    <div className="order-list-row">
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>83372.64039</span>
                        <span>2017-01-31</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default Orders;