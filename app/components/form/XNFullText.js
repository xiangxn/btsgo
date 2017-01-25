/**
 * Created by necklace on 2017/1/25.
 */

import React from "react";

export default class XNFullText extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: props.value};
    }

    onTextChange(e) {
        this.setState({value: e.target.value});
        this.props.onChange && this.props.onChange(e.target.value);
    }

    render() {
        return (
            <div className="fullText">
                <label>{this.props.label}</label>
                <input type={this.props.type} onChange={this.onTextChange.bind(this)} value={this.state.value}/>
            </div>
        );
    }
}

XNFullText.propTypes = {
    label: React.PropTypes.string,
    value: React.PropTypes.number,
    type: React.PropTypes.string,
    onChange: React.PropTypes.func
};
XNFullText.defaultProps = {
    label: "",
    value: 0,
    type: 'text',
    onChange: null
};