import alt from "../../common/altObj"
import WalletDb from "./WalletDb"
import AccountRefsStore from "./AccountRefsStore"
import AccountStore from "./AccountStore"
import BalanceClaimActiveStore from "./BalanceClaimActiveStore"
import CachedPropertyStore from "./CachedPropertyStore"
import PrivateKeyActions from "../actions/PrivateKeyActions"
import WalletActions from "../actions/WalletActions"
import {ChainStore} from "bitsharesjs";
import BaseStore from "./BaseStore"
import iDB from "../idb-instance"
import Immutable from "immutable"

/**  High-level container for managing multiple wallets.
 */
class WalletManagerStore extends BaseStore {

    constructor() {
        super()
        this.state = this._getInitialState()
        this.bindListeners({
            onRestore: WalletActions.restore,
            onSetWallet: WalletActions.setWallet,
            onSetBackupDate: WalletActions.setBackupDate,
            onSetBrainkeyBackupDate: WalletActions.setBrainkeyBackupDate
        })
        super._export("init", "setNewWallet", "onDeleteWallet", "onDeleteAllWallets")
    }

    _getInitialState() {
        return {
            new_wallet: undefined,// pending restore
            current_wallet: undefined,
            wallet_names: Immutable.Set()
        }
    }

    /** This will change the current wallet the newly restored wallet. */
    onRestore({wallet_name, wallet_object}) {
        iDB.restore(wallet_name, wallet_object).then(() => {
            return this.onSetWallet({wallet_name})
        }).catch(error => {
            console.error(error)
            return Promise.reject(error)
        })
    }

    /** This may result in a new wallet name being added, only in this case
     should a <b>create_wallet_password</b> be provided.
     */
    onSetWallet({wallet_name = "default", create_wallet_password, brnkey, resolve}) {

        let p = new Promise(resolve => {
            if (/[^a-z0-9_-]/.test(wallet_name) || wallet_name === "")
                throw new Error("Invalid wallet name")

            if (this.state.current_wallet === wallet_name) {
                resolve()
                return
            }

            let add
            if (!this.state.wallet_names.has(wallet_name)) {
                let wallet_names = this.state.wallet_names.add(wallet_name)
                add = iDB.root.setProperty("wallet_names", wallet_names)
                this.setState({wallet_names})
            }

            let current = iDB.root.setProperty("current_wallet", wallet_name)

            resolve(Promise.all([add, current]).then(() => {
                // 在当前应用程序代码可以初始化其新状态之前，必须首先关闭并重新打开数据库。
                iDB.close()
                ChainStore.clearCache()
                BalanceClaimActiveStore.reset()
                // 当调用loadDbData时，Store可能会重置
                return iDB.init_instance().init_promise.then(() => {
                    // 在调用CachedPropertyStore.reset（）时确保数据库准备就绪
                    CachedPropertyStore.reset()
                    return Promise.all([
                        WalletDb.loadDbData().then(() => AccountStore.loadDbData()),
                        PrivateKeyActions.loadDbData().then(() => AccountRefsStore.loadDbData())
                    ]).then(() => {
                        // 在这里再次更新状态，以确保侦听器重新渲染

                        if (!create_wallet_password) {
                            this.setState({current_wallet: wallet_name})
                            return
                        }

                        return WalletDb.onCreateWallet(
                            create_wallet_password,
                            brnkey, //brainkey,
                            true, //unlock
                            wallet_name
                        ).then(() => this.setState({current_wallet: wallet_name}))
                    })
                })
            }))
        }).catch(error => {
            console.error(error)
            return Promise.reject(error)
        })
        if (resolve) resolve(p)
    }

    /** Used by the components during a pending wallet create. */
    setNewWallet(new_wallet) {
        this.setState({new_wallet})
    }

    init() {
        return iDB.root.getProperty("current_wallet").then(
            current_wallet => {
                return iDB.root.getProperty("wallet_names", []).then(wallet_names => {
                    this.setState({
                        wallet_names: Immutable.Set(wallet_names),
                        current_wallet
                    })
                })
            })
    }

    onDeleteAllWallets() {
        var deletes = []
        this.state.wallet_names.forEach(wallet_name =>
            deletes.push(this.onDeleteWallet(wallet_name)))
        return Promise.all(deletes)
    }

    onDeleteWallet(delete_wallet_name) {
        return new Promise(resolve => {
            var {current_wallet, wallet_names} = this.state
            if (!wallet_names.has(delete_wallet_name)) {
                throw new Error("Can't delete wallet, does not exist in index")
            }
            wallet_names = wallet_names.delete(delete_wallet_name)
            iDB.root.setProperty("wallet_names", wallet_names)
            if (current_wallet === delete_wallet_name) {
                current_wallet = wallet_names.size ? wallet_names.first() : undefined
                iDB.root.setProperty("current_wallet", current_wallet)
            }
            this.setState({current_wallet, wallet_names})
            var database_name = iDB.getDatabaseName(delete_wallet_name)
            var req = iDB.impl.deleteDatabase(database_name)
            resolve(database_name)
        })
    }

    onSetBackupDate() {
        WalletDb.setBackupDate()
    }

    onSetBrainkeyBackupDate() {
        WalletDb.setBrainkeyBackupDate()
    }

}

export var WalletManagerStoreWrapped = alt.createStore(WalletManagerStore, "WalletManagerStore");
export default WalletManagerStoreWrapped
