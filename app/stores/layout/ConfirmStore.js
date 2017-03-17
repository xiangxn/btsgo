/**
 * Created by necklace on 2017/3/17.
 */
import alt from "../../../common/altObj";
import  ConfirmActions from "../../actions/layout/ConfirmActions";

class ConfirmStore {
    constructor() {
        this.bindActions(ConfirmActions);
        this.state = this.initState();
    }

    initState() {
        return {
            show: false,
            title: '',
            msg: '',
            height: 4,
            showCancelButton: true,
            onOK: null,
            onCancel: null
        };
    }

    onReset() {
        this.setState(this.initState());
    }

    onShow({title, msg, onok, oncancel, height, nocancel}) {
        this.setState(
            {
                show: true,
                title: title,
                msg: msg,
                height: height ? height : 4,
                showCancelButton: nocancel ? false : true,
                onOK: onok ? onok : null,
                onCancel: oncancel ? oncancel : null
            }
        );
    }
}
export default alt.createStore(ConfirmStore, 'ConfirmStore');