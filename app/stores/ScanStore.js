/**
 * Created by xiangxn on 2017/10/18.
 */

import alt from '../../common/altObj';
import BaseStore from "./BaseStore";
import ScanActions from "../actions/ScanActions";

class ScanStore extends BaseStore {
    constructor() {
        super();
        this.bindActions(ScanActions);
        this.state = this.__initState();
    }

    __initState() {
        return {routerState: null, qrStr: null};
    }

    onScan(routerState) {
        this.setState({routerState});
    }

    onSetScanResult(qrStr) {
        this.setState({qrStr});
    }

    onReset() {
        this.setState(this.__initState());
    }
}

export default alt.createStore(ScanStore, "ScanStore");