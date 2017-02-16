/**
 * Created by xiangxn on 2017/2/16.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import utils from "../../../common/utils";
import connectToStores from 'alt-utils/lib/connectToStores';

//stores
import PrivateKeyStore from "../../stores/PrivateKeyStore";
import WalletUnlockStore from "../../stores/WalletUnlockStore";

//actions
import WalletUnlockActions from "../../actions/WalletUnlockActions";

class MemoInfo extends BaseComponent {
    static defaultProps = {
        fullLength: false
    };

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        return (
            !utils.are_equal_shallow(nextProps.memo, this.props.memo) ||
            nextProps.wallet_locked !== this.props.wallet_locked
        );
    }

    unLock(e) {
        e.preventDefault();
        WalletUnlockActions.unlock().then(() => {
            this.forceUpdate();
        })
    }

    render() {
        let {memo, fullLength} = this.props;
        if (!memo) {
            return null;
        }

        let {text, isMine} = PrivateKeyStore.decodeMemo(memo);

        if (!text && isMine) {
            return (
                <span onClick={this.unLock.bind(this)}>
                    <a href>{this.formatMessage('transfer_memoUnlock')}</a>
                </span>
            );
        }
        let full_memo = text;
        if (text && !fullLength && text.length > 35) {
            text = text.substr(0, 35) + "...";
        }

        if (text) {
            return (
                <span className="memo" style={{paddingTop: 5, cursor: "help"}}>
                    <span title={full_memo !== text ? full_memo : null}>
                        {text}
                    </span>
                </span>
            );
        } else {
            return null;
        }
    }
}

class MemoInfoWrapper extends React.Component {
    static getPropsFromStores() {
        return {wallet_locked: WalletUnlockStore.getState().locked};
    }

    static getStores() {
        return [WalletUnlockStore];
    }

    render() {
        return <MemoInfo {...this.props}/>;
    }
}
export default connectToStores(MemoInfoWrapper);