/**
 * Created by xiangxn on 2016/12/12.
 */
import alt from '../../common/altObj';

class SettingsActions {

    //修改设置
    changeSetting(value) {
        return value;
    }

    //添加api服务器
    addWS(ws) {
        return ws;
    }

    //移除api服务器
    removeWS(index) {
        return index;
    }

    //修改语言
    switchLocale(locale) {
        return {locale};
    }

    //清除设置
    clearSettings() {
        return null;
    }

    //添加初始账号
    addStarAccount(account) {
        return account;
    }

    //删除初始账号
    removeStarAccount(account) {
        return account;
    }

    //改变资产方向
    changeMarketDirection(value) {
        return value;
    }
}
export default alt.createActions(SettingsActions);