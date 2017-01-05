/**
 * Created by admin on 2017/1/4.
 */

import React, {Component} from "react";

class CreeateAccount extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="content">
                <div className="text-input">
                    <div>账户名</div><input type="text" placeholder="请输入账户名"/>
                </div>
                <div className="text-input">
                    <div>密码</div><input type="password" placeholder="请输入密码"/>
                </div>
                <div className="text-input">
                    <div>确认密码</div><input type="password" placeholder="确认输入密码"/>
                </div>
                <div className="operate">
                    <input className="green-btn" type="button" value="确认"/>
                </div>
                <div className="message-box">
                    你使用的是高级账户名。高级账户名的注册需要花费
                    更多，因为无法通过免费水龙头服务进行注册。请选
                    择其他名字，包含至少一个横杠、数字或者不含元音
                    字母
                </div>
            </div>
        );
    }
}

export default CreeateAccount;