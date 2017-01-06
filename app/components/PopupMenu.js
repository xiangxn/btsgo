/**
 * Created by admin on 2016/12/20.
 */
import React from 'react';
import {browserHistory} from 'react-router'

const menuItems = [
    {name: '首页', url: ''},
    {name: '交易', url: ''},
    {name: '近期操作', url: ''},
    {name: '扫一扫', url: ''},
    {name: '解锁钱包', url: ''},
    {name: '设置', url: '/settings'}
];

class PopupMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isShow: false};
    }

    onMenuClick(data) {
        //console.debug(data);
        this.setState({isShow: false});
        browserHistory.push(data.url);
    }

    render() {
        let props = this.props;
        //let omc = props.onItemClick || this.onMenuClick.bind(this);
        if (this.state.isShow) {
            return (
                <div className="popup-menu" style={{top: props.top, right:props.left}}>
                    <div className="menu-arrow">▲</div>
                    <div className="meun-content">
                        <ul>
                            {menuItems.map((item) => {
                                return (<li key={item.name} onClick={this.onMenuClick.bind(this, item)}>
                                    <div>{item.name}</div>
                                </li> );
                            })}
                        </ul>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}
PopupMenu.propTypes = {
    top: React.PropTypes.number,
    left: React.PropTypes.number
};
PopupMenu.defaultProps = {
    top: 0,
    left: 0
};


export default PopupMenu;