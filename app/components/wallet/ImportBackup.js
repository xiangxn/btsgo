/**
 * Created by necklace on 2017/1/12.
 */
import React from "react";
import {intlShape} from 'react-intl';

class ImportBackup extends React.Component {
    constructor(props) {
        super(props);
    }

    onSelectClick(e) {
        let file = this.refs.file;
        //console.debug(file);
        file.click();
    }

    render() {
        return (
            <div className="content">
                <div className="message-box">
                    {this.context.intl.formatMessage({id: 'wallet_importBackupDes'})}
                </div>
                <div className="operate">
                    <input className="green-btn" type="button"
                           value={this.context.intl.formatMessage({id: 'wallet_selectFile'})}
                           onClick={this.onSelectClick.bind(this)}
                    />
                    <input ref="file" type="file" style={{display: 'none'}}/>
                </div>
            </div>
        );
    }
}

ImportBackup.contextTypes = {
    intl: intlShape.isRequired,
    router: React.PropTypes.object
};

export default ImportBackup;