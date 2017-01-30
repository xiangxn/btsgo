/**
 * Created by necklace on 2017/1/12.
 */
import React from "react";
import BaseComponent from '../BaseComponent';
import connectToStores from 'alt-utils/lib/connectToStores';

//stores
import ImportKeysStore from "../../stores/ImportKeysStore";
import PrivateKeyStore from "../../stores/PrivateKeyStore";
import WalletDb from "../../stores/WalletDb";

//actions
import NotificationActions from "../../actions/NotificationActions";
import BalanceClaimActiveActions from "../../actions/BalanceClaimActiveActions";
import WalletUnlockActions from "../../actions/WalletUnlockActions";

//graphene
import {PrivateKey, Address, Aes, PublicKey, hash} from "graphenejs-lib";

class ImportKey extends BaseComponent {
    static getPropsFromStores() {
        return {
            importing: ImportKeysStore.getState().importing
        }
    }

    static getStores() {
        return [ImportKeysStore];
    }

    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    //初始化state
    getInitialState(keep_file_name = false) {
        return {
            keys_to_account: {},
            no_file: true,
            account_keys: [],
            reset_file_name: keep_file_name ? this.state.reset_file_name : Date.now(),
            reset_password: Date.now(),
            password_checksum: null,
            import_file_message: null,
            import_password_message: null,
            imported_keys_public: {},
            key_text_message: null
        };
    }

    onImportClick(e) {
        let value = this.refs.wifInput.value;
        let count = this.addByPattern(value);
        if (count === 1) {
            this.importWIFKey();
        }
    }

    importWIFKey() {
        var keys = PrivateKeyStore.getState().keys
        var dups = {}
        for (let public_key_string in this.state.imported_keys_public) {
            if (!keys.has(public_key_string)) continue
            delete this.state.imported_keys_public[public_key_string]
            dups[public_key_string] = true
        }
        if (Object.keys(this.state.imported_keys_public).length === 0) {
            NotificationActions.error("This wallet has already been imported")
            return
        }
        var keys_to_account = this.state.keys_to_account
        for (let private_plainhex of Object.keys(keys_to_account)) {
            var {account_names, public_key_string} = keys_to_account[private_plainhex]
            if (dups[public_key_string]) delete keys_to_account[private_plainhex]
        }
        WalletUnlockActions.unlock().then(() => {
            ImportKeysStore.importing(true)
            // show the loading indicator
            setTimeout(() => this.saveImport(), 200)
        })
    }

    saveImport() {
        var keys_to_account = this.state.keys_to_account
        var private_key_objs = []
        for (let private_plainhex of Object.keys(keys_to_account)) {
            var {account_names, public_key_string} = keys_to_account[private_plainhex]
            private_key_objs.push({
                private_plainhex,
                import_account_names: account_names,
                public_key_string
            })
        }
        this.reset()
        WalletDb.importKeysWorker(private_key_objs).then(result => {
            ImportKeysStore.importing(false)
            var import_count = private_key_objs.length
            NotificationActions.success(`Successfully imported ${import_count} keys.`)
            this.onCancel() // back to claim balances
        }).catch(error => {
            console.error("error:", error)
            ImportKeysStore.importing(false)
            var message = error
            try {
                message = error.target.error.message
            } catch (e) {
            }
            NotificationActions.error(`Key import error: ${message}`)
        })
    }

    addByPattern(contents) {
        if (!contents)
            return false

        var count = 0, invalid_count = 0
        var wif_regex = /5[HJK][1-9A-Za-z]{49}/g
        for (let wif of contents.match(wif_regex) || []) {
            try {
                var private_key = PrivateKey.fromWif(wif) //could throw and error
                var private_plainhex = private_key.toBuffer().toString('hex')
                var public_key = private_key.toPublicKey() // S L O W
                var public_key_string = public_key.toPublicKeyString()
                this.state.imported_keys_public[public_key_string] = true
                this.state.keys_to_account[private_plainhex] = {
                    account_names: [], public_key_string
                }
                count++
            } catch (e) {
                console.error('addByPattern:',e);
                invalid_count++
            }
        }
        this.setState({
            key_text_message: 'Found ' +
            (!count ? "" : count + " valid") +
            (!invalid_count ? "" : " and " + invalid_count + " invalid") +
            " key" + ( count > 1 || invalid_count > 1 ? "s" : "") + "."
        }, () => this.updateOnChange())
        // removes the message on the next render
        this.state.key_text_message = null
        return count
    }

    updateOnChange() {
        BalanceClaimActiveActions.setPubkeys(Object.keys(this.state.imported_keys_public))
    }

    render() {
        //console.debug('importKey', this.props);
        return (
            <div className="content">
                <div className="text-input">
                    <div className="text-label">{this.formatMessage('wallet_accountPrivateKey')}</div>
                    <input ref="wifInput" type="text" placeholder={this.formatMessage('wallet_accountPrivateKey_ph')}/>
                </div>
                <div className="operate">
                    <input className="green-btn" type="button" value={this.formatMessage('btn_ok')}
                           onClick={this.onImportClick.bind(this)}/>
                </div>
                {this.state.key_text_message === null ? null :
                    <div className="message-box">
                        {this.state.key_text_message}
                    </div>
                }
            </div>
        );
    }
}

export default connectToStores(ImportKey);