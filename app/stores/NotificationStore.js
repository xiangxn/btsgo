/**
 * Created by xiangxn on 2017/1/27.
 */

import alt from "../../common/altObj";
import NotificationActions from "../actions/NotificationActions";


class NotificationStore {

    constructor() {
        this.bindListeners({
            addNotification: [
                NotificationActions.addNotification,
                NotificationActions.success,
                NotificationActions.warning,
                NotificationActions.error,
                NotificationActions.info
            ]
        })

        this.state = {
            notification: null
        }
    }

    addNotification(notification) {
        this.setState({ notification: notification })
    }
}

export default alt.createStore(NotificationStore, 'NotificationStore');