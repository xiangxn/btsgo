/**
 * Created by xiangxn on 2016/12/10.
 */
import React from 'react';
import {PropTypes} from "react-router";
import connectToStores from 'alt-utils/lib/connectToStores';
import SettingsStore from '../stores/SettingsStore';
import SettingsActions from '../actions/SettingsActions';
import {injectIntl, intlShape, FormattedMessage} from 'react-intl';

import PopupMenu, {menuItems} from './PopupMenu';

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

    onMenuItemClick(data) {
        //console.debug(data);

    }

    onBackClick() {
        this.context.router.goBack();
    }

    onUnlockClick(e) {
        this.context.router.push("/unlock");
    }

    getTitle() {
        let url = this.context.router.location.pathname;
        if (url === "/") {
            return this.context.intl.formatMessage({id: "menu_index"});
        }
        url = url.substring(1);
        let menu = menuItems.find((item) => {
            if (item.url === "/")return false;
            return url.startsWith(item.url.substring(1));
        });
        if (menu !== undefined) {
            return this.context.intl.formatMessage({id: menu.name});
        } else {
            return null;
        }
    }

    //SettingsStore.getSetting('apiServer')
    //()=>SettingsActions.changeSetting({setting: "locale", value: "cn"})

    render() {
        let props = this.props;
        //console.debug(this.context.router);
        let backBtn = null;
        let titleClass = "top-title";
        if (this.context.router.location.pathname !== "/") {
            backBtn = (<div className="top-back" onClick={this.onBackClick.bind(this)}>&lt;</div>);
        } else {
            titleClass = "top-left-title";
        }
        return (
            <div className="header">
                <div className={titleClass}>{this.getTitle()}</div>
                {backBtn}
                <div className="top-right">
                    <div className="ico-lock" onClick={this.onUnlockClick.bind(this)}>x</div>
                    <div ref="menuBtn" className="ico-menu" onClick={this.showMenu.bind(this)}>p</div>
                </div>
                <PopupMenu ref="menu" top={this.state.menuTop} left={this.state.menuLeft}
                           onMenuItemClick={this.onMenuItemClick.bind(this)}
                />
            </div>
        );
    }
}

NavigationBar.contextTypes = {
    intl: intlShape.isRequired,
    router: React.PropTypes.object
};

export default connectToStores(NavigationBar);