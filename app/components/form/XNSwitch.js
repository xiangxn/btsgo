/**
 * Created by admin on 2017/1/8.
 */
import React, {Component} from "react";

export default class XNSwitch extends Component {
    constructor(props) {
        super(props);
        this.state = {value: false};
    }

    onSpanClick(e) {
        this.setState({value: !this.state.value});
        this.props.onChange && this.props.onChange(d);
    }

    render() {
        let openClass = this.state.value ? "open" : "close";
        return (
            <div className="switch-input">
                <label>{this.props.label}</label>
                <span className={openClass} onClick={this.onSpanClick.bind(this)}></span>
            </div>
        );
    }
}

XNSwitch.propTypes = {
    label: React.PropTypes.string,
    onChange: React.PropTypes.func
};
XNSwitch.defaultProps = {
    label: "显示名称",
    onChange: null
};