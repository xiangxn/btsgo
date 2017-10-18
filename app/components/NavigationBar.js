/**
 * Created by xiangxn on 2016/12/10.
 */
import React from 'react';
import BaseComponent from "./BaseComponent";
import AltContainer from "alt-container";
import WalletUnlockStore from "../stores/WalletUnlockStore";
import WalletDb from "../stores/WalletDb";

//actions
import WalletUnlockActions from "../actions/WalletUnlockActions";
import PopupMenu, {menuItems} from './PopupMenu';
import ScanActions from "../actions/ScanActions";

class NavigationBar extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            menuTop: '0',
            menuLeft: '0',
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
        if (data.url === 'reload') {
            window.location.reload();
        } else if (data.url === 'scan') {
            ScanActions.scan(this.context.router.location);
            this.context.router.push('/' + data.url);
        }
    }

    onBackClick() {
        this.context.router.goBack();
    }

    onUnlockClick(e) {
        e.preventDefault();
        let wallet = WalletDb.getWallet();
        if (!wallet) {
            this.context.router.push('/create-account');
            return;
        }
        if (WalletDb.isLocked()) WalletUnlockActions.unlock();
        else WalletUnlockActions.lock();
    }

    getTitle() {
        let url = this.context.router.location.pathname;
        if (url === "/") {
            return this.context.intl.formatMessage({id: "menu_index"});
        }
        if(url==="/init-error"){
            return this.context.intl.formatMessage({id:"menu_settings"});
        }
        url = url.substring(1);
        let menu = menuItems.find((item) => {
            if (item.url === "/") return false;
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
        let titleClass = "top-title";
        if (this.context.router.location.pathname == "/init-error") {
            return (
                <div className="header">
                    <div className={titleClass}>{this.getTitle()}</div>
                </div>
            );
        }
        let props = this.props;
        //console.debug(this.context.router);
        let backBtn = null;
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
                    <div ref="lockBtn" className="ico-lock" onClick={this.onUnlockClick.bind(this)}>
                        {this.props.locked ? 'x' : 'w'}
                    </div>
                    <div ref="menuBtn" className="ico-menu" onClick={this.showMenu.bind(this)}>p</div>
                </div>
                <PopupMenu ref="menu" top={this.state.menuTop} left={this.state.menuLeft}
                           onMenuItemClick={this.onMenuItemClick.bind(this)}
                />
            </div>
        );
    }
}

class NavigationBarContainer extends React.Component {
    render() {
        return (
            <AltContainer store={WalletUnlockStore}>
                <NavigationBar/>
            </AltContainer>
        )
    }
}

export default NavigationBarContainer