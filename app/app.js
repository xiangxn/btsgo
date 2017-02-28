/**
 * Created by necklace on 2016/12/17.
 */

//graphene类库
import {ChainStore} from "graphenejs-lib";
import {Apis} from "graphenejs-ws";
//react类
import React from 'react';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, Redirect, browserHistory, hashHistory} from "react-router";
//store类
import SettingsStore from './stores/SettingsStore';
import AccountRefsStore from './stores/AccountRefsStore';
import WalletDb from './stores/WalletDb';
import WalletManagerStore from './stores/WalletManagerStore';
//action类
import PrivateKeyActions from './actions/PrivateKeyActions';
//数据库
import iDB from './idb-instance';
import 'indexeddbshim';
//组件
import RootIntl from './components/RootIntl';
import Dashboard from "./components/dashboard/Dashboard";
import Settings from "./components/Settings";
import GlobalSettingContainer from "./components/containers/GlobalSettingContainer";
import CreeateAccount from "./components/wallet/CreateAccount";
import WalletManage from "./components/wallet/WalletManage";
import ImportKey from "./components/wallet/ImportKey";
import Backup from  "./components/wallet/Backup";
import ChangePassword from  "./components/wallet/ChangePassword";
import ImportBackup from  "./components/wallet/ImportBackup";
import UnlockWallet from "./components/wallet/UnlockWallet";
import TransactionContainer from "./components/transaction/TransactionContainer";
import Pay from "./components/transaction/Pay";
import Sell from "./components/transaction/Sell";
import Orders from "./components/transaction/Orders";
import LastOperationContainer from "./components/LastOperation";
import Scan from "./components/scanit/Scan";
import TransferContainer from "./components/wallet/Transfer";
import BalanceWrapper from "./components/dashboard/Balance";


//let btsgoHistory = createBrowserHistory();
ChainStore.setDispatchFrequency(20);


let willTransitionTo = (nextState, replaceState, callback) => {

    let connectionString = SettingsStore.getSetting("apiServer");

    if (nextState.location.pathname === "/init-error") {

        return Apis.reset(connectionString, true).init_promise
            .then(() => {
                var db = iDB.init_instance(window.openDatabase ? (shimIndexedDB || indexedDB) : indexedDB).init_promise;
                return db.then(() => {
                    return callback();
                }).catch((err) => {
                    console.log("err:", err);
                    return callback();
                });
            }).catch((err) => {
                console.log("err:", err);
                return callback();
            });

    }
    //console.debug('Apis.instance');
    Apis.instance(connectionString, true).init_promise.then(() => {
        var db;
        try {
            db = iDB.init_instance(window.openDatabase ? (shimIndexedDB || indexedDB) : indexedDB).init_promise;
        } catch (err) {
            console.log("db init error:", err);
        }
        //console.debug(db);
        return Promise.all([db]).then(() => {
            console.log("db init done");
            return Promise.all([
                PrivateKeyActions.loadDbData().then(()=>AccountRefsStore.loadDbData()),
                WalletDb.loadDbData().then(() => {
                    if (!WalletDb.getWallet() && nextState.location.pathname !== "/create-account") {
                        replaceState("/create-account");
                    }
                    if (nextState.location.pathname.indexOf("/auth/") === 0) {
                        replaceState("/dashboard");
                    }
                }).catch((error) => {
                    console.error("----- WalletDb.willTransitionTo error ----->", error);
                }),
                WalletManagerStore.init()
            ]).then(() => {
                callback();
            });
        });
    }).catch(error => {
        console.error("----- App.willTransitionTo error ----->", error, (new Error).stack);
        if (error.name === "InvalidStateError") {
            alert("Can't access local storage.\nPlease make sure your browser is not in private/incognito mode.");
        } else {
            replaceState("/init-error");
            callback();
        }
    });
};

let routes = (
    <Route path='/' component={RootIntl} onEnter={willTransitionTo}>
        <IndexRoute component={Dashboard}/>
        <Route path="create-account" component={CreeateAccount}/>
        <Route path="init-error" component={Settings}/>
        <Route path="settings" component={Settings}>
            <IndexRoute component={GlobalSettingContainer}/>
            <Route path="wallet-manage" component={WalletManage}/>
            <Route path="import-key" component={ImportKey}/>
            <Route path="backup" component={Backup}/>
            <Route path="change-password" component={ChangePassword}/>
            <Route path="import-backup" component={ImportBackup}/>
        </Route>
        <Route path="unlock" component={UnlockWallet}/>
        <Route path="transaction" component={TransactionContainer}>
            <IndexRoute component={Pay}/>
            <Route path="pay" component={Pay}/>
            <Route path="sell" component={Sell}/>
            <Route path="orders" component={Orders}/>
        </Route>
        <Route path="last-operate" component={LastOperationContainer}/>
        <Route path="scan" component={Scan}/>
        <Route path="transfer" component={TransferContainer}/>
        <Route path="balance" component={BalanceWrapper} />
    </Route>
);

render(<Router history={browserHistory} routes={routes}/>, document.getElementById('content'));