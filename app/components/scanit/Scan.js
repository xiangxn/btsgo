/**
 * Created by necklace on 2017/1/18.
 */
import React from "react";
import BaseComonent from "../BaseComponent";

class Scan extends BaseComonent {
    constructor(props) {
        super(props);
    }

    render() {
        let info = navigator.userAgent;
        console.debug(info);
        return (
            <div className="content">
                {info}
            </div>
        );
    }
}

export default Scan;