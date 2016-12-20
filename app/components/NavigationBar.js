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

    //SettingsStore.getSetting('apiServer')
    //()=>SettingsActions.changeSetting({setting: "locale", value: "cn"})

    render() {
        return (
            <div className="header">
                <div className="top-title">Hello World!</div>
                <div className="top-back">&lt;</div>
                <div className="top-right"><div className="ico-lock">x</div><div className="ico-menu">p</div></div>
                <PopupMenu />
            </div>
        );
    }
}
export default connectToStores(NavigationBar);