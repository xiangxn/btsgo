import React from 'react';
import {ChainStore} from "graphenejs-lib";
import {Apis} from "graphenejs-ws";
import AccountStore from "../stores/AccountStore";
import SettingsStore from '../stores/SettingsStore';
import Loading from './Loading';
import NavigationBar from './NavigationBar';
import Settings from './Settings';
import {injectIntl, intlShape,FormattedMessage} from 'react-intl';

class Root extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            synced: false,
            syncFail: false,
            disableChat: SettingsStore.getState().settings.get("disableChat", true)
        };
    }

    componentWillUnmount() {
        SettingsStore.unlisten(this._onSettingsChange);
    }

    componentDidMount() {
        try {
            SettingsStore.listen(this.onSettingsChange.bind(this));
            ChainStore.init().then(() => {
                this.setState({synced: true});
                Promise.all([
                    AccountStore.loadDbData(Apis.instance().chainId)
                ]).then(() => {
                    AccountStore.tryToSetCurrentAccount();
                    this.setState({loading: false, syncFail: false});
                }).catch(error => {
                    console.log("[Root.js] ----- ERROR ----->", error);
                    this.setState({loading: false});
                });
            }).catch(error => {
                console.log("[App.jsx] ----- ChainStore.init error ----->", error);
                let syncFail = error.message === "ChainStore sync error, please check your system clock" ? true : false;
                this.setState({loading: false, syncFail});
            });
        } catch (e) {
            console.error("error:", e);
        }
    }

    onSettingsChange() {
        let {settings} = SettingsStore.getState();
        if (settings.get("disableChat") !== this.state.disableChat) {
            this.setState({
                disableChat: settings.get("disableChat")
            });
        }
    }

    render() {
        //console.debug(this.props);
        let {disableChat, syncFail, loading} = this.state;
        let content = null;
        if (syncFail) {
            content = (
                <Settings />
            );
        } else if (loading) {
            content = <Loading />;
        } else {
            content = (
                <div className="full vertical-box">
                    <NavigationBar/>
                    {this.props.children}
                </div>
            );
        }
        //console.debug(content);
        return content;
    }
}

export default Root;