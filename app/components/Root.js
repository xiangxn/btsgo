import React from 'react';

//stores
import AccountStore from "../stores/AccountStore";
import SettingsStore from '../stores/SettingsStore';
import NotificationStore from "../stores/NotificationStore";

import {ChainStore} from "bitsharesjs";
import {Apis} from "bitsharesjs-ws";

//组件
import Loading from './Loading';
import NavigationBar from './NavigationBar';
import NotificationSystem from "react-notification-system";
import TransactionConfirm from "./TransactionConfirm";
import UnlockWallet from "./wallet/UnlockWallet";
import Settings from './Settings';
import Confirm from './layout/Confirm';
import GlobalSettingContainer from './containers/GlobalSettingContainer';

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

    onNotificationChange() {
        let notification = NotificationStore.getState().notification;
        if (notification.autoDismiss === void 0) {
            notification.autoDismiss = 10;
        }
        if (this.refs.notificationSystem) this.refs.notificationSystem.addNotification(notification);
    }

    componentWillUnmount() {
        NotificationStore.unlisten(this.onNotificationChange);
        SettingsStore.unlisten(this.onSettingsChange);
    }

    componentDidMount() {
        try {
            NotificationStore.listen(this.onNotificationChange.bind(this));
            SettingsStore.listen(this.onSettingsChange.bind(this));
            ChainStore.init().then(() => {
                this.setState({synced: true});
                Promise.all([
                    AccountStore.loadDbData()
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
        let {disableChat, syncFail, loading} = this.state;
        let content = null;
        if (syncFail) {
            content = (
                <Settings>
                    <GlobalSettingContainer/>
                </Settings>
            );
        } else if (loading) {
            content = <Loading/>;
        } else {
            content = (
                <div className="full vertical-box">
                    <NavigationBar/>
                    {this.props.children}
                    <NotificationSystem ref="notificationSystem" allowHTML={true}/>
                    <TransactionConfirm/>
                    <UnlockWallet/>
                    <Confirm/>
                </div>
            );
        }
        //console.debug(content);
        return content;
    }
}

export default Root;