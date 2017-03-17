/**
 * Created by necklace on 2017/3/17.
 */
import alt from "../../../common/altObj";

class ConfirmActions {
    show(title, msg, onok, oncancel, height, nocancel) {

        return {title, msg, onok, oncancel, height, nocancel};
    }

    reset() {
        return true;
    }
}

let WrappedConfirmActions = alt.createActions(ConfirmActions)
export default WrappedConfirmActions