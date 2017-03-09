/**
 * Created by necklace on 2017/1/7.
 */
import React from "react";
import BaseComponent from "../BaseComponent";

class XNSelect extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            data: props.data,//[{text: "中文简体", value: "zh"}, {text: "英文", value: "en"}],
            isShowList: false//是否弹出选择列表
        };
        this.onDocumentClick = this.onDocumentClick.bind(this);
    }

    stopEvent(e) {
        e.nativeEvent.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.state.value || nextProps.data !== this.state.data) {
            this.setState({value: nextProps.value, data: nextProps.data});
        }
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
        //console.debug('onDocumentClick', e)
        this.setState({isShowList: false});
    }

    openList(e) {
        //console.debug('openList')
        let flag = !this.state.isShowList;
        this.setState({isShowList: flag});
    }

    //单击行事件
    onItemClick(d, e) {
        e.nativeEvent.stopImmediatePropagation();
        let oldVal = this.state.value;
        this.setState({value: d.text});
        if (this.props.onChange !== null && oldVal !== d.value) {
            this.props.onChange(d);
        }
    }

    //删除行事件
    onDelItemClick(item, index, e) {
        this.stopEvent(e);
        //console.debug('onDelItemClick', item);
        this.props.onDeleteItem && this.props.onDeleteItem(item, index);
    }

    //添加事件
    onAddClick(e) {
        this.stopEvent(e);
        let newItem = this.refs.newItem.value;
        //console.debug('onAddClick', newItem);
        this.props.onAddItem && this.props.onAddItem(newItem);
    }

    onInputClick(e) {
        this.stopEvent(e);
    }

    render() {
        let list = this.state.isShowList === false ? null : (
            <div className="select-input-popup">
                <ul>
                    {this.state.data.map((item, i) => {
                        return (<li key={i}>
                            <span onClick={this.onItemClick.bind(this, item)}>{item.text}</span>
                            {
                                this.props.isDelete === false ? null : (
                                    <span onClick={this.onDelItemClick.bind(this, item, i)}>'</span>
                                )
                            }
                        </li> );
                    })}
                </ul>
                {
                    this.props.isAdd === false ? null : (
                        <div>
                            <input ref="newItem" type="text" onClick={this.onInputClick.bind(this)}/><span
                            onClick={this.onAddClick.bind(this)}>{this.formatMessage('settings_add')}</span>
                        </div>
                    )
                }
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
    onChange: React.PropTypes.func,
    onDeleteItem: React.PropTypes.func,
    onAddItem: React.PropTypes.func,
    isAdd: React.PropTypes.bool,
    isDelete: React.PropTypes.bool,
    data: React.PropTypes.array,
    value: React.PropTypes.string
};
XNSelect.defaultProps = {
    label: "显示名称",
    onChange: null,
    onDeleteItem: null,
    onAddItem: null,
    isAdd: false,
    isDelete: false,
    data: [],
    value: ""
};

export default XNSelect;