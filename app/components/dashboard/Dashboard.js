/**
 * Created by necklace on 2017/1/13.
 */
import React from "react";

//组件
import AssetsItem from "./AssetsItem";

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="content clear-toppadding">
                <div className="assets-list">
                    <AssetsItem/>
                    <AssetsItem/>
                    <AssetsItem/>
                </div>
                <div className="assets-list">
                    <AssetsItem/>
                    <AssetsItem/>
                    <AssetsItem/>
                </div>
            </div>
        );
    }
}

export default Dashboard;
