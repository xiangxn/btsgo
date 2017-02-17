/**
 * Created by necklace on 2017/1/12.
 */
import React from "react";
import BaseComponent from "./BaseComponent";

//actions
import SettingsActions from "../actions/SettingsActions";
import IntlActions from "../actions/IntlActions";

import XNSelect from "./form/XNSelect";
import XNSwitch from "./form/XNSwitch";
import XNFullButton from "./form/XNFullButton";
import XNFullText from "./form/XNFullText";


class GlobalSetting extends BaseComponent {
    constructor(props) {
        super(props);
    }

    //修改语言
    onLanguageChange(d) {
        //console.debug(d);
        IntlActions.switchLocale(d.value);
        SettingsActions.changeSetting({setting: "locale", value: d.value});
    }

    //修改wsapi服务器地址
    onAPIChange(d) {
        SettingsActions.changeSetting({setting: "apiServer", value: d.value});
        setTimeout(() => {
            window.location.reload();
        }, 250);
    }

    /**
     * 修改水龙头服务器地址
     * @param d
     */
    onFaucetChange(d) {
        SettingsActions.changeSetting({setting: "faucet_address", value: d.value});
        setTimeout(() => {
            window.location.reload();
        }, 250);
    }

    onUnitChange(d) {
        SettingsActions.changeSetting({setting: "unit", value: d.value});
    }

    onLockTimeChange(d) {
        let newValue = parseInt(d, 10);
        if (newValue && !isNaN(newValue) && typeof newValue === "number") {
            SettingsActions.changeSetting({setting: "walletLockTimeout", value: d});
        }
    }

    onSwitchIMChange(d) {
        SettingsActions.changeSetting({setting: "disableChat", value: d});
    }

    onShowWalletManageClick(e) {
        e.preventDefault();
        this.context.router.push("/settings/wallet-manage");
    }

    onSetDefaultClick(e) {
        SettingsActions.clearSettings();
    }

    render() {
        //console.debug(this.props);
        let locales = [];
        this.props.defaults.locale.map((item) => {
            locales.push({value: item, text: this.formatMessage('languages_' + item)});
        });

        let saveApi = this.props.settings.get('apiServer');
        let api = this.props.defaults.apiServer.find((a) => {
            if (a.value === saveApi)return a;
        });

        let faucet_address = this.props.settings.get('faucet_address');
        let faucets = this.props.defaults.apiFaucets;//[{value: faucet_address, text: faucet_address}];

        let units = [];
        let unit = this.props.settings.get('unit');
        this.props.defaults.unit.map((item, i) => {
            units.push({value: item, text: item});
        });

        let walletLockTimeout = this.props.settings.get("walletLockTimeout");

        let disableChat = this.props.settings.get("disableChat");

        return (
            <div className="vertical-flex scroll">
                <XNSelect label={this.formatMessage('settings_labLanguage')}
                          onChange={this.onLanguageChange.bind(this)}
                          data={locales}
                          value={this.formatMessage('languages_' + this.props.settings.get('locale'))}/>
                <div className="separate"></div>
                <XNSelect label={this.formatMessage('settings_labAPI')}
                          onChange={this.onAPIChange.bind(this)} isDelete={true} isAdd={true}
                          data={this.props.defaults.apiServer}
                          value={api.text}/>
                <XNSelect label={this.formatMessage('settings_labFaucet')}
                          onChange={this.onFaucetChange.bind(this)} value={faucet_address}
                          data={faucets}/>
                <div className="separate"></div>
                <XNSelect label={this.formatMessage('settings_labShowUnit')}
                          onChange={this.onUnitChange.bind(this)} value={unit} data={units}/>
                <XNFullText label={this.formatMessage('settings_labLockTime')} type="number"
                            onChange={this.onLockTimeChange.bind(this)} value={walletLockTimeout}/>
                <XNSwitch label={this.formatMessage('settings_labDisableChat')}
                          onChange={this.onSwitchIMChange.bind(this)} value={disableChat}/>
                <XNFullButton label={this.formatMessage('settings_labShowWalletManage')}
                              onClick={this.onShowWalletManageClick.bind(this)}/>
                <XNFullButton isShowIcon={false}
                              label={this.formatMessage('settings_labDefaultSetting')}
                              onClick={this.onSetDefaultClick.bind(this)}/>
            </div>
        );
    }
}

export default GlobalSetting;