/**
 * Created by admin on 2016/12/17.
 */

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, Redirect} from "react-router";
import createBrowserHistory from 'history/lib/createHashHistory';
import SettingsStore from './stores/SettingsStore';

import Loading from './components/Loading';
import NavigationBar from './components/NavigationBar';
import Settings from './components/Settings';

let btsgoHistory = createBrowserHistory();

class App extends React.Component {
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
                <Settings />
            );
        } else if (loading) {
            content = <Loading />;
        } else {
            content = (
                <NavigationBar />
            );
        }
        return ( {content});
    }
}

let routes = (
    <Route path='/' component={Settings}/>
);

render(<Router history={btsgoHistory} routes={routes}/>, document.getElementById('content'));