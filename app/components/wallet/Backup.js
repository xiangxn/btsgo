/**
 * Created by necklace on 2017/1/12.
 */

import React from "react";
import BaseComponent from "../BaseComponent";
import connectToStores from 'alt-utils/lib/connectToStores';
import {ChainConfig} from "bitsharesjs-ws";
import {saveAs} from "file-saver";

//stores
import WalletManagerStore from "../../stores/WalletManagerStore";
import BackupStore from "../../stores/BackupStore";
import WalletDb from "../../stores/WalletDb";

//actions
import BackupActions, {backup, decryptWalletBackup} from "../../actions/BackupActions";
import WalletActions from "../../actions/WalletActions";
import NotificationActions from "../../actions/NotificationActions";

class Backup extends BaseComponent {
    static getPropsFromStores() {
        return {wallet: WalletManagerStore.getState(), backup: BackupStore.getState()};
    }

    static getStores() {
        return [WalletManagerStore, BackupStore];
    }

    constructor(props) {
        super(props);
        this.onDownload = this.onDownload.bind(this);
    }

    //生成文件名
    getBackupName() {
        let name = this.props.wallet.current_wallet
        let address_prefix = ChainConfig.address_prefix.toLowerCase()
        if (name.indexOf(address_prefix) !== 0)
            name = address_prefix + "_" + name
        let date = new Date();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let stampedName = `${name}_${date.getFullYear()}${month >= 10 ? month : "0" + month}${day >= 10 ? day : "0" + day}`;
        name = stampedName + ".bin";
        return name;
    }


    onBackupClick(e) {
        if (this.props.backup.sha1) {
            this.onDownload();
        } else {
            this.onCreateBackup();
        }
    }

    onCreateBackup() {
        let backup_pubkey = WalletDb.getWallet().password_pubkey
        backup(backup_pubkey).then(contents => {
            let name = this.getBackupName();
            BackupActions.incommingBuffer({name, contents})
        })
    }

    onDownload() {
        let isFileSaverSupported = false;
        try {
            isFileSaverSupported = !!new Blob;
        } catch (e) {
        }
        if (!isFileSaverSupported) {
            NotificationActions.error(this.formatMessage('wallet_backup_noBlob'));
            return;
        }

        let blob = new Blob([this.props.backup.contents], {
            type: "application/octet-stream; charset=us-ascii"
            //type: "text/plain;charset=us-ascii"
        })

        if (blob.size !== this.props.backup.size) {
            NotificationActions.error(this.formatMessage('wallet_backup_invalidBackup'));
            return;
        }
        this.saveFile(blob, this.props.backup.name);
        WalletActions.setBackupDate();
    }

    /**
     * 兼容文件下载
     * @param obj
     * @param name
     */
    saveFile(obj, name) {
        if (window.requestFileSystem !== undefined) {
            console.debug('use window.requestFileSystem');
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                fileSystem.root.getDirectory('Download', {create: true}, function (dirTry) {
                    dirTry.getFile(name, {create: true, exclusive: false}, function (entry) {
                        let fileUrl = entry.toURL();
                        entry.createWriter(function (writer) {
                            writer.onwriteend = function (evt) {
                                //console.debug("Successfully saved file to " + fileUrl);
                                NotificationActions.success("Successfully saved file to " + fileUrl);
                            };
                            // Write to the file
                            writer.write(obj);
                        }, function (error) {
                            //console.debug("Error: Could not create file writer, " + error.code);
                            NotificationActions.error("Could not create file writer, " + error.code);
                        });
                    }, function (error) {
                        //console.debug("Error: Could not create file, " + error.code);
                        NotificationActions.error("Could not create file, " + error.code);
                    });
                }, function (error) {
                    NotificationActions.error("Could not create dir, " + error.code);
                });
            }, function (evt) {
                //console.debug("Error: Could not access file system, " + evt.target.error.code);
                NotificationActions.error("Could not access file system, " + evt.target.error.code);
            });
        } else {
            console.debug('not window.requestFileSystem');
            saveAs(obj, name);
        }
    }

    render() {
        let msg = null;
        let btnValue = "";
        if (this.props.backup.sha1) {
            msg = <p className="middleSize">{this.props.backup.name}({this.props.backup.size} bytes)
                <br/><br/>
                SHA1:{this.props.backup.sha1}</p>;
            btnValue = this.formatMessage('wallet_backup_download');
        } else {
            msg = this.formatMessage('wallet_backupDescription');
            btnValue = this.formatMessage('wallet_backup');
        }

        return (
            <div className="content">
                <div className="message-box">
                    {msg}
                </div>
                <div className="operate">
                    <input className="green-btn" type="button"
                           value={btnValue}
                           onClick={this.onBackupClick.bind(this)}/>
                </div>
            </div>
        );
    }
}

export default connectToStores(Backup);