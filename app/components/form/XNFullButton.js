/**
 * Created by necklace on 2017/1/11.
 */
import React from "react";
import {intlShape, FormattedMessage} from 'react-intl';

export default class XNFullButton extends React.Component {
    constructor(props) {
        super(props);
    }

    onClick(e) {
        this.props.onClick && this.props.onClick(e);
    }

    render() {
        let icon = null;
        if (this.props.isShowIcon) icon = <i>&gt;</i>;
        return (
            <div className="fullBtn" onClick={this.onClick.bind(this)}>
                <label>{this.props.label}</label>
                {icon}
            </div>
        );
    }
}

XNFullButton.propTypes = {
    label: React.PropTypes.string,
    isShowIcon: React.PropTypes.bool,
    onClick: React.PropTypes.func
};
XNFullButton.defaultProps = {
    label: "",
    isShowIcon: true,
    onClick: null
};