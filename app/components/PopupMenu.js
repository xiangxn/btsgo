/**
 * Created by admin on 2016/12/20.
 */
import React from 'react';

const menuItems = [
    {name: '首页', url: ''},
    {name: '交易', url: ''},
    {name: '近期操作', url: ''},
    {name: '扫一扫', url: ''},
    {name: '解锁钱包', url: ''},
    {name: '设置', url: ''}
];

class PopupMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let props = this.props;
        if (props.isShow) {
            return (
                <div className="popup-menu" style={{top: props.top, left: props.left}}>
                    <div className="menu-arrow">▲</div>
                    <div className="meun-content">
                        <ul>
                            {menuItems.map((item) => {
                                return (<li key={item.name}><div>{item.name}</div></li> );
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
    left: React.PropTypes.number,
    isShow: React.PropTypes.bool
};
PopupMenu.defaultProps = {
    top: 0,
    left: 0,
    isShow: false
};


export default PopupMenu;