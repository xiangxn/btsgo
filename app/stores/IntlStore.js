/**
 * Created by necklace on 2016/12/27.
 */

import alt from '../../common/altObj';
import BaseStore, {STORAGE_KEY} from './BaseStore';
import IntlActions from '../actions/IntlActions';
import SettingsActions from '../actions/SettingsActions';
import ls from '../../common/localStorage';

let ss = new ls(STORAGE_KEY);

import {addLocaleData} from 'react-intl';
import {zh_CN} from '../assets/locales/locale-zh';
import {en_US} from '../assets/locales/locale-en';
import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
addLocaleData(zh);
addLocaleData(en);

class IntlStore extends BaseStore {
    constructor() {
        super();
        this.currentLocale = ss.has("settings_v3") ? ss.get("settings_v3").locale : "zh";

        this.locales = ["zh", "en"];
        //console.debug(zh_CN);
        this.localesObject = {zh: zh_CN, en: en_US};

        this.bindListeners({
            onSwitchLocale: IntlActions.switchLocale,
            onGetLocale: IntlActions.getLocale,
            onClearSettings: SettingsActions.clearSettings
        });

        this._export("getCurrentLocale", "hasLocale");
    }

    hasLocale(locale) {
        return this.locales.indexOf(locale) !== -1;
    }

    getCurrentLocale() {
        return this.currentLocale;
    }

    onSwitchLocale({locale}) {

        switch (locale) {
            case "zh":
                this.localesObject[locale] = zh_CN;
                break;
            case "en":
                this.localesObject[locale] = en_US;
                break;
            default:
                this.localesObject[locale] = zh_CN;
                break;
        }
        this.currentLocale = locale;
    }

    onGetLocale(locale) {
        if (this.locales.indexOf(locale) === -1) {
            this.locales.push(locale);
        }
    }

    onClearSettings() {
        this.onSwitchLocale("zh");
    }
}

export default alt.createStore(IntlStore, "IntlStore");