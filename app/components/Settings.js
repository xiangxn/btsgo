/**
 * Created by admin on 2016/12/21.
 */

import React from 'react';
import XNSelect from "./form/XNSelect";
import XNSwitch from "./form/XNSwitch";
import XNFullButton from "./form/XNFullButton";

import {injectIntl, intlShape, FormattedMessage} from 'react-intl';

class Settings extends React.Component {
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
        this.context.router.push("/wallet-manage");
    }

    onSetDefaultClick(e) {
        console.debug(e);
    }

    render() {
        //console.debug(this.props);
        return (
            <div className="content">
                <XNSelect label={this.props.intl.formatMessage({id: 'settings_labLanguage'})}
                          onChange={this.onLanguageChange.bind(this)}/>
                <div className="separate"></div>
                <XNSelect label={this.props.intl.formatMessage({id: 'settings_labAPI'})}
                          onChange={this.onAPIChange.bind(this)}/>
                <XNSelect label={this.props.intl.formatMessage({id: 'settings_labFaucet'})}
                          onChange={this.onFaucetChange.bind(this)}/>
                <div className="separate"></div>
                <XNSelect label={this.props.intl.formatMessage({id: 'settings_labShowUnit'})}
                          onChange={this.onUnitChange.bind(this)}/>
                <XNSelect label={this.props.intl.formatMessage({id: 'settings_labLockTime'})}
                          onChange={this.onLockTimeChange.bind(this)}/>
                <XNSwitch label={this.props.intl.formatMessage({id: 'settings_labDisableChat'})}
                          onChange={this.onSwitchIMChange.bind(this)}/>
                <XNFullButton label={this.props.intl.formatMessage({id: 'settings_labShowWalletManage'})}
                              onClick={this.onShowWalletManageClick.bind(this)}/>
                <XNFullButton isShowIcon={false}
                              label={this.props.intl.formatMessage({id: 'settings_labDefaultSetting'})}
                              onClick={this.onSetDefaultClick.bind(this)}/>
            </div>
        );
    }
}

Settings.propTypes = {
    intl: intlShape.isRequired,
};
Settings.contextTypes = {
    router: React.PropTypes.object
};

export default injectIntl(Settings);