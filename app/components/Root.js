
import React from 'react';
import SettingsStore from '../stores/SettingsStore';
import Loading from './Loading';
import NavigationBar from './NavigationBar';
import Settings from './Settings';

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
                <div>
                    <NavigationBar />
                    <div>
                        {this.props.children}
                    </div>
                </div>
            );
        }
        return ( {content});
    }
}

export default Root;