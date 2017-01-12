/**
 * Created by necklace on 2017/1/12.
 */

import React from "react";
import {intlShape} from 'react-intl';

class Backup extends React.Component {
    constructor(props) {
        super(props);
    }

    onBackupClick(e) {
        console.debug(e);
    }

    render() {
        return (
            <div className="content">
                <div className="message-box">
                    {this.context.intl.formatMessage({id: 'wallet_backupDescription'})}
                </div>
                <div className="operate">
                    <input className="green-btn" type="button"
                           value={this.context.intl.formatMessage({id: 'wallet_backup'})}
                           onClick={this.onBackupClick.bind(this)}/>
                </div>
            </div>
        );
    }
}
Backup.contextTypes = {
    intl: intlShape.isRequired,
    router: React.PropTypes.object
};

export default Backup;