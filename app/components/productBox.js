/**
 * Created by xiangxn on 2016/12/10.
 */
import React from 'react';
import connectToStores from 'alt-utils/lib/connectToStores';
import SettingsStore from '../stores/SettingsStore';
import SettingsActions from '../actions/SettingsActions';

class ProductBox extends React.Component {
    static getPropsFromStores() {
        return SettingsStore.getState();
    }
    static getStores() {
        return [SettingsStore];
    }


    render() {
        return (
            <div className="productBox">
                Hello World!
                <input type="button" onClick={()=>SettingsActions.changeSetting({setting: "locale", value: "cn"})} value="添加"/>
                {SettingsStore.getSetting('apiServer')}
            </div>
        );
    }
}
export default connectToStores(ProductBox);