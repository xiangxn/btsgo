/**
 * Created by admin on 2016/12/27.
 */

import React from 'react';
import connectToStores from 'alt-utils/lib/connectToStores';
import IntlStore from '../stores/IntlStore';
import IntlActions from '../actions/IntlActions';
import {IntlProvider} from 'react-intl';
import Root from './Root';

class RootIntl extends React.Component {
    static getStores() {
        return [IntlStore];
    };

    static getPropsFromStores() {
        let state = IntlStore.getState();
        return {
            locale: state.currentLocale,
            localeObj: state.localesObject[state.currentLocale]
        };
    };

    componentDidMount() {
        IntlActions.switchLocale(this.props.locale);
    }

    render() {
        //console.debug(this.props.localeObj);
        return (
            <IntlProvider
                locale={this.props.locale}
                messages={this.props.localeObj}
            >
                <Root {...this.props}/>
            </IntlProvider>
        );
    }
}

export default connectToStores(RootIntl);