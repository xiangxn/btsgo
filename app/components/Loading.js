/**
 * Created by necklace on 2016/12/21.
 */
import React from 'react';


class Loading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {progress: 0};
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            let p = this.state.progress;
            p += 1;
            if (p > 7) p = 0;
            this.setState({progress: p});
        }, 70);
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
        this.timer = null;
    }

    render() {
        return (
            <div className="loading">
                <div>{this.state.progress}</div>
            </div>
        );
    }
}

export default Loading;