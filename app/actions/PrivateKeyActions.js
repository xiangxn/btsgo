/**
 * Created by admin on 2016/12/28.
 */
import alt from '../../common/altObj';

class PrivateKeyActions {

    addKey(private_key_object, transaction) {
        return {private_key_object, transaction};
    }

    loadDbData() {
        return {};
    }

}