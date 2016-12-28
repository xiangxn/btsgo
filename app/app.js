/**
 * Created by admin on 2016/12/17.
 */

import {ChainStore} from "graphenejs-lib";
import {Apis} from "graphenejs-ws";

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, Redirect} from "react-router";
import createBrowserHistory from 'history/lib/createHashHistory';
import SettingsStore from './stores/SettingsStore';

import PrivateKeyActions from './actions/PrivateKeyActions';

import RootIntl from './components/RootIntl';
import iDB from './idb-instance';
import 'indexeddbshim';


let btsgoHistory = createBrowserHistory();
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
    Apis.instance(connectionString, true).init_promise.then(() => {
        var db;
        try {
            db = iDB.init_instance(window.openDatabase ? (shimIndexedDB || indexedDB) : indexedDB).init_promise;
        } catch (err) {
            console.log("db init error:", err);
        }
        return Promise.all([db]).then(() => {
            console.log("db init done");
            return Promise.all([
                PrivateKeyActions.loadDbData().then(() => AccountRefsStore.loadDbData()),
                WalletDb.loadDbData().then(() => {
                    if (!WalletDb.getWallet() && nextState.location.pathname !== "/create-account") {
                        replaceState(null, "/create-account");
                    }
                    if (nextState.location.pathname.indexOf("/auth/") === 0) {
                        replaceState(null, "/dashboard");
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
            replaceState(null, "/init-error");
            callback();
        }
    });
};

let routes = (
    <Route path='/' component={RootIntl} onEnter={willTransitionTo}/>
);

render(<Router history={btsgoHistory} routes={routes}/>, document.getElementById('content'));