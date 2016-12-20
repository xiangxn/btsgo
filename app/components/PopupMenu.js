/**
 * Created by admin on 2016/12/20.
 */
import React from 'react';

class PopupMenu extends React.Component {
    constructor() {
        super();
    }

    render() {
        const props = this.props;
        return (
            <div className="popup-menu">
                <div className="menu-arrow">▲</div>
                <div className="meun-content"></div>
            </div>
        );
    }
}

export default PopupMenu;