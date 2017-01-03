/**
 * Created by admin on 2016/12/28.
 */
import alt from '../../common/altObj';

class PrivateKeyActions {

    addKey(private_key_object, transaction) {
        return new Promise(resolve => {
            return {private_key_object, transaction, resolve};
        });
    }

    loadDbData(fun) {
        return (dispatch) => {
            let pro = new Promise(resolve => {
                dispatch(resolve)
            });
            pro.then(()=> {
                fun();
            })
        };
    }
}
export default alt.createActions(PrivateKeyActions);