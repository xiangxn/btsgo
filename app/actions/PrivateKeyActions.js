/**
 * Created by necklace on 2016/12/28.
 */
import alt from '../../common/altObj';

class PrivateKeyActions {

    addKey(private_key_object, transaction) {
        return (dispatch) => {
            return new Promise( resolve => {
                dispatch({private_key_object, transaction, resolve});
            });
        };
    }

    loadDbData() {
        return (dispatch) => {
            return new Promise( resolve => {
                dispatch(resolve);
            });
        };
    }
}
export default alt.createActions(PrivateKeyActions);