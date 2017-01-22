/**
 * Created by necklace on 2017/1/7.
 */
import React, {Component} from "react";

class XNSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "请选择",
            selcted: null,
            data: [{text: "中文简体", value: "zh"}, {text: "英文", value: "en"}],
            isShowList: false//是否弹出选择列表
        };
        this.onDocumentClick = this.onDocumentClick.bind(this);
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isShowList) {
            document.addEventListener('click', this.onDocumentClick, false);
        } else {
            document.removeEventListener('click', this.onDocumentClick, false);
        }
    }

    componentWillUnmount() {
    }

    onDocumentClick(e) {
        this.setState({isShowList: false});
    }

    openList(e) {
        let flag = !this.state.isShowList;
        this.setState({isShowList: flag});
    }

    onItemClick(d, e) {
        e.nativeEvent.stopImmediatePropagation();
        let oldVal = this.state.value;
        this.setState({value: d.text});
        if (this.props.onChange !== null && oldVal !== d.text) {
            this.props.onChange(d);
        }
    }

    render() {
        let list = this.state.isShowList === false ? null : (
                <div>
                    <ul>
                        {this.state.data.map((item, i) => {
                            return (<li key={i} onClick={this.onItemClick.bind(this, item)}>
                                {item.text}
                            </li> );
                        })}
                    </ul>
                </div>
            );
        return (
            <div className="select-input" onClick={this.openList.bind(this)}>
                <div>
                    <label>{this.props.label}</label>
                    <span>{this.state.value}</span>
                </div>
                <i>&gt;</i>
                {list}
            </div>
        );
    }
}
XNSelect.propTypes = {
    label: React.PropTypes.string,
    onChange: React.PropTypes.func
};
XNSelect.defaultProps = {
    label: "显示名称",
    onChange: null
};

export default XNSelect;