/**
 * Created by admin on 2016/12/20.
 */
import React from 'react';
import {browserHistory} from 'react-router'
import {injectIntl, intlShape, FormattedMessage} from 'react-intl';

export const menuItems = [
    {name: 'menu_index', url: '/'},
    {name: 'menu_transaction', url: '/transaction'},
    {name: 'menu_lastOperate', url: '/last-operate'},
    {name: 'menu_scan', url: '/scan'},
    {name: 'menu_unlockWallet', url: '/unlock'},
    {name: 'menu_settings', url: '/settings'}
];

class PopupMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isShow: false};
        this.onDocumentClick = this.onDocumentClick.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isShow) {
            document.addEventListener('click', this.onDocumentClick, false);
        } else {
            document.removeEventListener('click', this.onDocumentClick, false);
        }
    }

    onMenuClick(data, e) {
        e.nativeEvent.stopImmediatePropagation();
        this.setState({isShow: false});
        browserHistory.push(data.url);
        this.props.onMenuItemClick && this.props.onMenuItemClick(data);
    }

    onDocumentClick(e) {
        this.setState({isShow: false});
    }

    render() {
        let props = this.props;
        //let omc = props.onItemClick || this.onMenuClick.bind(this);
        if (this.state.isShow) {
            return (
                <div className="popup-menu" style={{top: props.top, right: props.left}}>
                    <div className="menu-arrow">▲</div>
                    <div className="meun-content">
                        <ul>
                            {menuItems.map((item) => {
                                return (<li key={item.name} onClick={this.onMenuClick.bind(this, item)}>
                                    <div>{this.context.intl.formatMessage({id: item.name})}</div>
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
    left: React.PropTypes.number,
    onMenuItemClick: React.PropTypes.func
};
PopupMenu.contextTypes = {
    intl: intlShape.isRequired
};
PopupMenu.defaultProps = {
    top: 0,
    left: 0,
    onMenuItemClick: null
};


export default PopupMenu;