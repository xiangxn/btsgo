/**
 * Created by admin on 2017/1/7.
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
    }

    openList() {
        let flag = !this.state.isShowList;
        this.setState({isShowList: flag});
    }

    onItemClick(d) {
        //event.preventDefault();
        //console.debug(d);
        this.setState({value: d.text});
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
    label: React.PropTypes.string
};
XNSelect.defaultProps = {
    label: "显示名称"
};

export default XNSelect;