/**
 * Created by admin on 2016/12/21.
 */
import React from 'react';


const loadItems = [0, 1, 2, 3, 4, 5, 6, 7];

class Loading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {progress: 0};
    }

    render() {

        let items = loadItems.map((item, i) => {
            return <span key={i}>{item}</span>
        });
        return (
            <div className="loading">
                <div>{this.state.progress}</div>
            </div>
        );
    }
}

export default Loading;