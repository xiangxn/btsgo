/**
 * Created by admin on 2016/12/27.
 */
import alt from "../../common/altObj";

class IntlActions {
    switchLocale(locale) {
        return {locale};
    }

    getLocale(locale) {
        return {locale};
    }
}

export default alt.createActions(IntlActions);