/**
 * Created by admin on 2016/12/21.
 */

import React from 'react';

class Settings extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="content">
                {this.props.children}
            </div>
        );
    }
}

export default Settings;