/**
 * Created by xiangxn on 2016/12/10.
 */
import React from 'react';
import connectToStores from 'alt-utils/lib/connectToStores';
import SettingsStore from '../stores/SettingsStore';
import SettingsActions from '../actions/SettingsActions';

import PopupMenu from './PopupMenu';

class NavigationBar extends React.Component {
    static getPropsFromStores() {
        return SettingsStore.getState();
    }

    static getStores() {
        return [SettingsStore];
    }

    constructor(props) {
        super(props);
        this.state = {
            menuTop: 0,
            menuLeft: 0,
            isShowMenu: false
        };
    }

    showMenu() {
        let rect = this.refs.menuBtn.getBoundingClientRect();
        /*
         let menu = this.refs.mainMenu;
         menu.setState({top: rect.top + rect.height - 30, left: rect.left - 145, isShow: !menu.state.isShow});
         */
        //console.debug(rect);
        this.setState({
            menuTop: '.6rem',//(rect.top + rect.height) / 100,
            menuLeft: '.12rem'// (rect.left + rect.width) / 100,
        });
        let menuState = this.refs.menu.state;
        this.refs.menu.setState({isShow: !menuState.isShow});
    }

    onMenuClick(data) {
        console.debug(data);
        //this.setState({isShow: false});
        //browserHistory.push(data.url);
    }

    //SettingsStore.getSetting('apiServer')
    //()=>SettingsActions.changeSetting({setting: "locale", value: "cn"})

    render() {
        let props = this.props;
        return (
            <div className="header">
                <div className="top-title">{props.title}</div>
                <div className="top-back">&lt;</div>
                <div className="top-right">
                    <div className="ico-lock">x</div>
                    <div ref="menuBtn" className="ico-menu" onClick={this.showMenu.bind(this)}>p</div>
                </div>
                <PopupMenu ref="menu" top={this.state.menuTop} left={this.state.menuLeft}
                />
            </div>
        );
    }
}

NavigationBar.PropTypes = {
    title: React.PropTypes.string
}

NavigationBar.defaultProps = {
    title: 'BTSGO'
}

export default connectToStores(NavigationBar);