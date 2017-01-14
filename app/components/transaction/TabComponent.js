/**
 * Created by admin on 2017/1/14.
 */
import React from "react";

class TabComponent extends React.Component {

    static propTypes = {
        data: React.PropTypes.array.isRequired
    };
    static contextTypes = {
        router: React.PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {currentIndex: 0};
    }

    clickHandle(index, url) {
        //console.debug(this.context.router);
        this.setState({currentIndex: index});
        //let path = this.context.router.location.pathname + "/" + url;
        this.context.router.push(url);
    }

    render() {
        return (
            <div className="tabpage vertical-box vertical-flex">
                <div className="tabpage-title">
                    <div className="tabpage-title-items">
                        {this.props.data.map((item, i) => {
                            return (<div onClick={this.clickHandle.bind(this, i, item.url)}
                                         className={this.state.currentIndex === i ? "active" : "normal"}>{item.name}</div>);
                        })}
                    </div>
                    <div className="tabpage-title-separate"></div>
                </div>
                <div className="tabpage-content vertical-flex vertical-box">
                    {this.props.children}
                </div>
            </div>

        );
    }
}

export default TabComponent;