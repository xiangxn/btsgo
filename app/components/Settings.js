/**
 * Created by admin on 2016/12/21.
 */

import React from 'react';
import XNSelect from "./form/XNSelect";

class Settings extends React.Component {
    constructor(props) {
        super(props);
    }

    onLanguageChange(d) {
        console.debug(d);
    }

    render() {
        console.debug('Settings....');
        return (
            <div className="content">
                <XNSelect label="语言选择" onChange={this.onLanguageChange.bind(this)}/>
                <XNSelect label="API服务器"/>
                <XNSelect label="水龙头地址"/>
                <XNSelect label="显示记账单位"/>
                <XNSelect label="钱包自动锁定时间（秒）"/>
            </div>
        );
    }
}

export default Settings;