/**
 * Created by necklace on 2017/1/12.
 */
import React from "react";
import {intlShape} from 'react-intl';

class ImportKey extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="content">
                <div className="text-input">
                    <div className="text-label">{this.context.intl.formatMessage({id: 'wallet_accountPrivateKey'})}</div>
                    <input type="text" placeholder={this.context.intl.formatMessage({id: 'wallet_accountPrivateKey_ph'})}/>
                </div>
                <div className="operate">
                    <input className="green-btn" type="button" value={this.context.intl.formatMessage({id:'btn_ok'})}/>
                </div>
            </div>
        );
    }
}
ImportKey.contextTypes = {
    intl: intlShape.isRequired,
    router: React.PropTypes.object
};

export default ImportKey;