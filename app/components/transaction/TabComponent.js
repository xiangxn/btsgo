/**
 * Created by necklace on 2017/1/14.
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

    componentWillMount() {
        //console.debug('location:', this.context.router.location)
        let index = 0;
        this.props.data.forEach((x, i) => {
            if (x.url === this.context.router.location.pathname)
                index = i;
        });
        this.setState({currentIndex: index});
    }

    clickHandle(index, url) {
        //console.debug(this.context.router);
        this.setState({currentIndex: index});
        //let path = this.context.router.location.pathname + "/" + url;
        let s = this.context.router.location.state;
        //this.context.router.push(url,s);
        this.context.router.push({pathname: url, state: s});
    }

    render() {
        return (
            <div className="tabpage vertical-box vertical-flex">
                <div className="tabpage-title">
                    <div className="tabpage-title-items">
                        {this.props.data.map((item, i) => {
                            return (<div key={"tabc_"+i} onClick={this.clickHandle.bind(this, i, item.url)}
                                         className={this.state.currentIndex === i ? "active" : "normal"}>{item.name}</div>);
                        })}
                    </div>
                    <div className="tabpage-title-separate"></div>
                </div>
                <div className="tabpage-content vertical-flex vertical-box">
                    {React.cloneElement(this.props.children, {...this.props})}
                </div>
            </div>

        );
    }
}

export default TabComponent;