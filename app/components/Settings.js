/**
 * Created by admin on 2016/12/21.
 */

import React from 'react';
import NavigationBar from './NavigationBar';

class Settings extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <NavigationBar title="设置"/>
        );
    }
}

export default Settings;