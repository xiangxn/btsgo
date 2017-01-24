/**
 * Created by necklace on 2017/1/12.
 */
import React from "react";
import XNSelect from "./form/XNSelect";
import XNSwitch from "./form/XNSwitch";
import XNFullButton from "./form/XNFullButton";

import BaseComponent from "./BaseComponent";

class GlobalSetting extends BaseComponent {
    constructor(props) {
        super(props);
    }

    onLanguageChange(d) {
        console.debug(d);
    }

    onAPIChange(d) {
        console.debug(d);
    }

    onFaucetChange(d) {
        console.debug(d);
    }

    onUnitChange(d) {
        console.debug(d);
    }

    onLockTimeChange(d) {
        console.debug(d);
    }

    onSwitchIMChange(d) {
        console.debug(d);
    }

    onShowWalletManageClick(e) {
        e.preventDefault();
        this.context.router.push("/settings/wallet-manage");
    }

    onSetDefaultClick(e) {
        console.debug(e);
    }

    render() {
        console.debug(this.props);
        let locales = [];
        this.props.defaults.locale.map((item) => {
            locales.push({value: item, text: this.formatMessage('languages_' + item)});
        });

        let saveApi = this.props.settings.get('apiServer');
        let api = this.props.defaults.apiServer.find((a) => {
            if (a.value === saveApi)return a;
        });

        return (
            <div className="vertical-flex scroll">
                <XNSelect label={this.formatMessage('settings_labLanguage')}
                          onChange={this.onLanguageChange.bind(this)}
                          data={locales}
                          value={this.formatMessage('languages_' + this.props.settings.get('locale'))}/>
                <div className="separate"></div>
                <XNSelect label={this.formatMessage('settings_labAPI')}
                          onChange={this.onAPIChange.bind(this)} isEdit={true}
                          data={this.props.defaults.apiServer}
                          value={api.text}/>
                <XNSelect label={this.formatMessage('settings_labFaucet')}
                          onChange={this.onFaucetChange.bind(this)}/>
                <div className="separate"></div>
                <XNSelect label={this.formatMessage('settings_labShowUnit')}
                          onChange={this.onUnitChange.bind(this)}/>
                <XNSelect label={this.formatMessage('settings_labLockTime')}
                          onChange={this.onLockTimeChange.bind(this)}/>
                <XNSwitch label={this.formatMessage('settings_labDisableChat')}
                          onChange={this.onSwitchIMChange.bind(this)}/>
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