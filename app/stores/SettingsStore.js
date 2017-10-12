/**
 * Created by xiangxn on 2016/12/12.
 */

import alt from '../../common/altObj';
import SettingsActions from '../actions/SettingsActions';
import Immutable from "immutable";
import {merge} from "lodash";
import ls from '../../common/localStorage';
import BaseStore, {STORAGE_KEY} from './BaseStore';

const CORE_ASSET = "BTS";

let ss = new ls(STORAGE_KEY);

class SettingsStore extends BaseStore {
    constructor() {
        super();
        this.exportPublicMethods({getSetting: this.getSetting.bind(this)});
        this.defaultSettings = Immutable.Map({
            locale: "zh",
            apiServer: "wss://bitshares-api.wancloud.io/ws",
            faucet_address: "https://bit.btsabc.org",//https://bitshares.openledger.info
            unit: "CNY",// CORE_ASSET,
            walletLockTimeout: 60 * 10,
            disableChat: true
        });
        let topMarkets = [
            "OPEN.MKR", "BTS", "OPEN.ETH", "ICOO", "BTC", "OPEN.LISK", "BKT",
            "OPEN.STEEM", "OPEN.GAME", "PEERPLAYS", "USD", "CNY", "BTSR", "OBITS",
            "OPEN.DGD", "EUR", "GOLD", "SILVER", "IOU.CNY", "OPEN.DASH",
            "OPEN.USDT", "OPEN.EURT", "OPEN.BTC", "CADASTRAL", "BLOCKPAY", "BTWTY",
            "OPEN.INCNT", "KAPITAL","YOYOW"
        ];
        this.preferredBases = Immutable.List(["CNY", "USD", "BTC", "OPEN.BTC", CORE_ASSET]);
        function addMarkets(target, base, markets) {
            markets.filter(a => {
                return a !== base;
            }).forEach(market => {
                target.push([`${market}_${base}`, {"id": market + '_' + base, "quote": market, "base": base}]);
            });
        }

        let defaultMarkets = [];
        this.preferredBases.forEach(base => {
            addMarkets(defaultMarkets, base, topMarkets);
        });
        let apiFaucets = [
            {value: "https://bit.btsabc.org", text: "https://bit.btsabc.org"},
            {value: "https://bitshares.openledger.info", text: "https://bitshares.openledger.info"}
        ];
        let apiServer = [
            {value: "wss://bitshares.openledger.info/ws", text: "openledger(Nuremberg, Germany)"},
            {value: "wss://bitshares-api.wancloud.io/ws", text: "wancloud.io(China)"},
            {value: "wss://bit.btsabc.org/ws", text: "btsabc.org(Hong Kong)"},
            {value: "wss://openledger.hk/ws", text: "openledger.hk(Hong Kong)"},
            {value: "wss://bts.ai.la/ws", text: "bts.ai.la(Hong Kong)"},
            {value: "wss://dexnode.net/ws", text: "dexnode.net(Dallas, USA)"},
            {value: "wss://eu.openledger.info/ws", text: "openledger(Berlin, Germany)"}
            //{value: "wss://testnet.bitshares.eu/ws", text: "Public Testnet Server (Frankfurt, Germany)"}
        ];
        let defaults = {
            locale: [
                "zh",
                "en"
            ],
            apiServer: [],
            apiFaucets: apiFaucets,
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
            onSwitchLocale: SettingsActions.switchLocale,
            onAddStarAccount: SettingsActions.addStarAccount,
            onChangeMarketDirection: SettingsActions.changeMarketDirection,
            onRemoveStarAccount: SettingsActions.removeStarAccount
        });
        this.settings = Immutable.Map(merge(this.defaultSettings.toJS(), ss.get("settings_v3")));
        this.marketsString = "markets";
        this.starredMarkets = Immutable.Map(ss.get(this.marketsString, defaultMarkets));
        this.starredAccounts = Immutable.Map(ss.get("starredAccounts"));
        let savedDefaults = ss.get("defaults_v1", {});
        this.defaults = merge({}, defaults, savedDefaults);
        (savedDefaults.connection || []).forEach(api => {
            let hasApi = false;
            if (typeof api === "string") {
                api = {value: api, text: api};
            }
            apiServer.forEach(server => {
                if (server.value === api.value) {
                    hasApi = true;
                }
            });

            if (!hasApi) {
                this.defaults.apiServer.push(api);
            }
        });

        (savedDefaults.apiServer || []).forEach(api => {
            let hasApi = false;
            if (typeof api === "string") {
                api = {value: api, text: api};
            }
            this.defaults.apiServer.forEach(server => {
                if (server.value === api.value) {
                    hasApi = true;
                }
            });

            if (!hasApi) {
                this.defaults.apiServer.push(api);
            }
        });

        for (let i = apiServer.length - 1; i >= 0; i--) {
            let hasApi = false;
            this.defaults.apiServer.forEach(api => {
                if (api.value === apiServer[i].value) {
                    hasApi = true;
                }
            });
            if (!hasApi) {
                this.defaults.apiServer.unshift(apiServer[i]);
            }
        }
        this.marketDirections = Immutable.Map(ss.get("marketDirections"));
        this.hiddenAssets = Immutable.List(ss.get("hiddenAssets", []));
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
            ws = {value: ws, text: ws};
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
            window.location.reload();
        }
    }

    onSwitchLocale({locale}) {
        console.log("onSwitchLocale:", locale);

        this.onChangeSetting({setting: "locale", value: locale});
    }

    onAddStarAccount(account) {
        if (!this.starredAccounts.has(account)) {
            this.starredAccounts = this.starredAccounts.set(account, {name: account});
            ss.set("starredAccounts", this.starredAccounts.toJS());
        } else {
            return false;
        }
    }

    onRemoveStarAccount(account) {
        this.starredAccounts = this.starredAccounts.delete(account);
        ss.set("starredAccounts", this.starredAccounts.toJS());
    }

    onChangeMarketDirection(payload) {
        for (let key in payload) {
            this.marketDirections = this.marketDirections.set(key, payload[key]);
        }

        ss.set("marketDirections", this.marketDirections.toJS());
    }
}
export default alt.createStore(SettingsStore, "SettingsStore");