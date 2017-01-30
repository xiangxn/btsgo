/**
 * Created by xiangxn on 2017/1/27.
 */

import alt from "../../common/altObj";
import BaseStore from "./BaseStore";

class ImportKeysStore extends BaseStore {

    constructor() {
        super()
        this.state = this._getInitialState()
        this._export("importing")
    }

    _getInitialState() {
        return { importing: false }
    }

    importing(importing) {
        this.setState({ importing })
    }
}

export default alt.createStore(ImportKeysStore, "ImportKeysStore");