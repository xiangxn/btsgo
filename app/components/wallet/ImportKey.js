/**
 * Created by necklace on 2017/1/12.
 */
import React from "react";
import BaseComponent from '../BaseComponent';
import connectToStores from 'alt-utils/lib/connectToStores';
import TextLoading from "../TextLoading";
import PasswordInput from "./PasswordInput";
import Modal from "../layout/Modal";

//stores
import ImportKeysStore from "../../stores/ImportKeysStore";
import PrivateKeyStore from "../../stores/PrivateKeyStore";
import WalletDb from "../../stores/WalletDb";
import ScanStore from "../../stores/ScanStore";

//actions
import NotificationActions from "../../actions/NotificationActions";
import BalanceClaimActiveActions from "../../actions/BalanceClaimActiveActions";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import WalletActions from "../../actions/WalletActions";
import ScanActions from "../../actions/ScanActions";

//graphene
import {PrivateKey, Address, Aes, PublicKey, hash} from "bitsharesjs";

class ImportKey extends BaseComponent {
    static getPropsFromStores() {
        return {
            importing: ImportKeysStore.getState().importing,
            qrcode: ScanStore.getState().qrStr
        }
    }

    static getStores() {
        return [ImportKeysStore, ScanStore];
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
            key_text_message: null,
            validPassword: false,
            error_message: null,
            wif: "",
            encrypt_wif: false,
            qrcode_password_error: null
        };
    }

    componentWillMount() {
        let {qrcode} = this.props;
        if (qrcode != null) {
            if (qrcode.length == 51) {
                this.setState({wif: qrcode});
            } else {
                this.setState({encrypt_wif: true});
            }
        }
    }

    onCancel(e) {
        if (e) e.preventDefault();
        this.setState(this.getInitialState());
    }

    updateOnChange() {
        BalanceClaimActiveActions.setPubkeys(Object.keys(this.state.imported_keys_public));
    }

    onPasswordChange(e) {
        if (e.error) {
            this.setState({error_message: e.error, validPassword: e.valid});
        } else {
            this.setState({error_message: null, validPassword: e.valid});
        }
    }

    reset(e, keep_file_name) {
        if (e) e.preventDefault();
        let state = this.getInitialState(keep_file_name);
        this.setState(state, () => this.updateOnChange());
    }

    onImportClick(e) {
        let value = this.state.wif;
        let count = this.addByPattern(value);
        if (count === 1) {
            if (WalletDb.getWallet()) {
                this.importWIFKey();
            } else {
                let password = this.refs.password.value();
                this.createWallet(password).then(() => {
                    this.importWIFKey();
                });
            }
        }
    }

    //创建钱包
    createWallet(password) {
        return WalletActions.setWallet(
            "default", //wallet name
            password
        ).then(() => {
            console.log("Congratulations, your wallet was successfully created.");
        }).catch(err => {
            console.error("CreateWallet failed:", err);
            NotificationActions.addNotification({
                message: this.formatMessage('wallet_createCatch', {err: err}),
                level: "error",
                autoDismiss: 10
            })
        });
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
            NotificationActions.error(this.formatMessage('wallet_importKey_imported'));
            this.onCancel();
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
                console.error('addByPattern:', e);
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

    onQrcodePasswordEnter(e) {
        e.preventDefault();
        let pwd = this.refs.qrcode_pwd_input.value;
        let pwd_aes = Aes.fromSeed(pwd);
        let wif = pwd_aes.decryptHexToText(this.props.qrcode);
        //let w2 = pwd_aes.decryptHex(this.props.qrcode);
        //console.log("dec qr:", this.props.qrcode, wif, w2);
        if (wif == null || wif.length != 51) {
            this.setState({qrcode_password_error: this.formatMessage("wallet_passwordErrMsg")});
        } else {
            this.setState({wif: wif, encrypt_wif: false, qrcode_password_error: null});
            ScanActions.reset();
        }
    }

    onWifChange(e) {
        this.setState({wif: e.target.value});
    }

    hideQrcodeModal() {
        this.setState({wif: "", encrypt_wif: false, qrcode_password_error: null});
        ScanActions.reset();
    }

    render() {
        let qrcode_pwd = (
            <div className="popup-window">
                <Modal visible={this.state.encrypt_wif} onClose={this.hideQrcodeModal.bind(this)} height={3.2}>
                    <div className="title">{this.formatMessage('wallet_importKey_decryption')}</div>
                    <div className="message-box"></div>
                    <div className="body">
                        <div className="input-row">
                            <div className="label">{this.formatMessage('wallet_importKey_qrcode_pwd')}</div>
                            <input ref="qrcode_pwd_input" className="input" type="password"
                                   placeholder={this.formatMessage('wallet_importKey_qrcode_pwd_ph')}/>
                        </div>
                    </div>
                    <div className="message-box">
                        {this.state.qrcode_password_error}
                    </div>
                    <div className="buttons">
                        <input onClick={this.onQrcodePasswordEnter.bind(this)} className="green-btn" type="button"
                               value={this.formatMessage('btn_ok')}/>
                    </div>
                </Modal>
            </div>
        );
        let hasWallet = (WalletDb.getWallet()) ? true : false;

        return (
            <div className="content">
                {hasWallet ? null :
                    <PasswordInput
                        ref="password"
                        confirmation={true}
                        onChange={this.onPasswordChange.bind(this)}
                    />
                }
                <div className="text-input">
                    <div className="text-label">{this.formatMessage('wallet_accountPrivateKey')}</div>
                    <input value={this.state.wif}
                           onChange={this.onWifChange.bind(this)} type="text"
                           placeholder={this.formatMessage('wallet_accountPrivateKey_ph')}/>
                </div>
                <div className="operate">
                    {this.props.importing ? <TextLoading/> :
                        <input className="green-btn" type="button" value={this.formatMessage('btn_ok')}
                               onClick={this.onImportClick.bind(this)}/>
                    }
                </div>
                {this.state.key_text_message === null ? null :
                    <div className="message-box">
                        {this.state.key_text_message}
                    </div>
                }
                {this.state.error_message === null ? null :
                    <div className="message-box">
                        {this.state.error_message}
                    </div>
                }
                {qrcode_pwd}
            </div>
        );
    }
}

export default connectToStores(ImportKey);