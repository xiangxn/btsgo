/**
 * Created by necklace on 2017/2/3.
 */
import React from 'react';


class TextLoading extends React.Component {
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
                <span className="text-loading">{this.state.progress}</span>
        );
    }
}

export default TextLoading;