/**
 * Created by necklace on 2017/1/14.
 */
import React from "react";
import {intlShape} from 'react-intl';

class BaseComponent extends React.Component {
    static contextTypes = {
        intl: intlShape.isRequired,
        router: React.PropTypes.object
    };

    constructor(props) {
        super(props);
        this.formatMessage = this.formatMessage.bind(this);
    }

    formatMessage(id) {
        //console.debug('arguments.length',arguments.length);
        let values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        //console.debug(values)
        return this.context.intl.formatMessage({id: id}, values);
    }
}

export default BaseComponent;