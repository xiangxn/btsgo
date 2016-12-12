/**
 * Created by xiangxn on 2016/12/12.
 */

import alt from '../../common/altObj';
import SettingsActions from '../actions/SettingsActions';
import Immutable from "immutable";
import {merge} from "lodash";
import ls from '../../common/localStorage';

const CORE_ASSET = "BTS";
const STORAGE_KEY = "__btsgo__";

let ss = new ls(STORAGE_KEY);

class SettingsStore {
    constructor() {
        this.exportPublicMethods({getSetting: this.getSetting.bind(this)});
        this.defaultSettings = Immutable.Map({
            locale: "cn",
            apiServer: "wss://bitshares.openledger.info/ws",
            faucet_address: "https://bitshares.openledger.info",
            unit: CORE_ASSET,
            walletLockTimeout: 60 * 10,
            disableChat: true
        });
        let topMarkets = [
            "MKR", "OPEN.MKR", "BTS", "OPEN.ETH", "ICOO", "BTC", "OPEN.LISK",
            "OPEN.STEEM", "OPEN.DAO", "PEERPLAYS", "USD", "CNY", "BTSR", "OBITS",
            "OPEN.DGD", "EUR", "TRADE.BTC", "CASH.BTC", "GOLD", "SILVER",
            "OPEN.USDT", "OPEN.EURT", "OPEN.BTC", "CADASTRAL", "BLOCKPAY"
        ];
        this.preferredBases = Immutable.List([CORE_ASSET, "OPEN.BTC", "USD", "CNY", "BTC"]);
        function addMarkets(target, base, markets) {
            markets.filter(a => {
                return a !== base;
            }).forEach(market => {
                target.push([`${market}_${base}`, {"quote": market,"base": base}]);
            });
        }
        let defaultMarkets = [];
        this.preferredBases.forEach(base => {
            addMarkets(defaultMarkets, base, topMarkets);
        });
        let apiServer = [
            {url: "wss://bitshares.openledger.info/ws", location: "Nuremberg, Germany"},
            {url: "wss://bit.btsabc.org/ws", location: "Hong Kong"},
            {url: "wss://bts.transwiser.com/ws", location: "Hangzhou, China"},
            {url: "wss://bitshares.dacplay.org:8089/ws", location:  "Hangzhou, China"},
            {url: "wss://openledger.hk/ws", location: "Hong Kong"},
            {url: "wss://secure.freedomledger.com/ws", location: "Toronto, Canada"},
            {url: "wss://testnet.bitshares.eu/ws", location: "Public Testnet Server (Frankfurt, Germany)"}
        ];
        let defaults = {
            locale: [
                "cn",
                "en"
            ],
            apiServer: [],
            unit: [
                CORE_ASSET,
                "USD",
                "CNY",
                "BTC",
                "EUR",
                "GBP"
            ],
            disableChat: [true, false]
        };
        this.bindListeners({
            onChangeSetting: SettingsActions.changeSetting,
            onAddWS: SettingsActions.addWS,
            onRemoveWS: SettingsActions.removeWS,
            onClearSettings: SettingsActions.clearSettings,
            onSwitchLocale: SettingsActions.switchLocale
        });
        this.settings = Immutable.Map(merge(this.defaultSettings.toJS(), ss.get("settings_v3")));
        this.marketsString = "markets";
        this.starredMarkets = Immutable.Map(ss.get(this.marketsString, defaultMarkets));
        let savedDefaults = ss.get("defaults_v1", {});
        this.defaults = merge({}, defaults, savedDefaults);
    }

    getSetting(setting) {
        return this.settings.get(setting);
    }

    onChangeSetting(payload) {
        this.settings = this.settings.set(
            payload.setting,
            payload.value
        );
        ss.set("settings_v3", this.settings.toJS());
        if (payload.setting === "walletLockTimeout") {
            ss.set("lockTimeout", payload.value);
        }
    }

    onAddWS(ws) {
        if (typeof ws === "string") {
            ws = {url: ws, location: null};
        }
        this.defaults.apiServer.push(ws);
        ss.set("defaults_v1", this.defaults);
    }

    onRemoveWS(index) {
        if (index !== 0) { // Prevent removing the default apiServer
            this.defaults.apiServer.splice(index, 1);
            ss.set("defaults_v1", this.defaults);
        }
    }

    onClearSettings() {
        ss.remove("settings_v3");
        this.settings = this.defaultSettings;

        ss.set("settings_v3", this.settings.toJS());

        if (window && window.location) {
            // window.location.reload();
        }
    }

    onSwitchLocale({locale}) {
        console.log("onSwitchLocale:", locale);

        this.onChangeSetting({setting: "locale", value: locale});
    }
}
export default alt.createStore(SettingsStore, "SettingsStore");