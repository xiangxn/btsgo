/**
 * Created by necklace on 2017/1/18.
 */
import React from "react";
import ReactDOM from "react-dom";
import BaseComonent from "../BaseComponent";
import QrCode from "qrcode-reader";
import pica from "pica/dist/pica";
import connectToStores from 'alt-utils/lib/connectToStores';
import ScanStore from "../../stores/ScanStore";

import ScanActions from "../../actions/ScanActions";

//import EXIF from "exif-js";


class Scan extends BaseComonent {
    static getPropsFromStores() {
        return ScanStore.getState();
    }

    static getStores() {
        return [ScanStore];
    }

    constructor(props) {
        super(props);
        this.state = {
            hasCamera: false,
            cameras: []//存储设备源ID
        };
        this.qrcode = new QrCode();
        this.mStream = null;
        this.scan = this.scan.bind(this);
        this.qrcodeSuccess = this.qrcodeSuccess.bind(this);
    }

    userBrowser() {
        let browserName = navigator.userAgent.toLowerCase();
        if (/msie/i.test(browserName) && !/opera/.test(browserName)) {
            return "IE";
        } else if (/firefox/i.test(browserName)) {
            return "Firefox";
        } else if (/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName)) {
            return "Chrome";
        } else if (/opera/i.test(browserName)) {
            return "Opera";
        } else if (/webkit/i.test(browserName) && !(/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName))) {
            return "Safari";
        } else {
            return "unKnow";
        }
    }

    isIphone() {
        let agent = navigator.userAgent.toLowerCase();
        return /iphone/i.test(agent);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        if (this.mStream) {
            this.mStream.getVideoTracks().forEach(function (videoTrack) {
                videoTrack.stop();
            });
        }
    }

    componentDidMount() {
        this.initCamera();
    }

    qrcodeSuccess(data, err) {
        if (err !== undefined) {
            console.error('qrcode:', err);
        }
        if (this.refs.msgBox) {
            if (data === undefined) {
                this.refs.msgBox.innerText = this.formatMessage('scan_noQrcode');
            } else {
                this.refs.msgBox.innerText = this.formatMessage('scan_yesQrcode');
            }
        }

        if (data !== undefined) {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            let routerState = this.props.routerState;
            if (routerState != null) {//处理有路由状态的扫描
                ScanActions.setScanResult(data);
                this.context.router.push(routerState.pathname);
            } else if (data.startsWith("T:")) {//根据扫描数据处理为转账
                ScanActions.setScanResult(data);
                this.context.router.push("/transfer");
            } else {
                alert(data);
                ScanActions.reset();
            }
        }
    }

    scan() {
        if (this.mStream) {
            //console.debug("scan2", this.mStream)
            let video = this.refs.video;
            //console.debug("scan video", video)
            video.width = video.clientWidth;
            video.height = video.clientHeight;
            let canvas = this.refs.qrCanvas;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            let scale = video.videoWidth / video.width;
            let left = Math.round(scale * canvas.offsetLeft);
            let top = Math.round(scale * canvas.offsetTop);
            let w = Math.round(scale * canvas.clientWidth);
            let h = Math.round(scale * canvas.clientHeight);
            let context = canvas.getContext('2d');
            console.log(`canvas:ol:${canvas.offsetLeft},ot:${canvas.offsetTop},vw:${video.width},vvw:${video.videoWidth}`);
            console.log(`scan data[left:${left},top:${top},w:${w},h:${h},cw:${canvas.clientWidth},ch:${canvas.clientHeight}]`);
            context.drawImage(video, left, top, w, h, 0, 0, canvas.clientWidth, canvas.clientHeight);
            try {
                let data = context.getImageData(0, 0, canvas.clientWidth, canvas.clientHeight);
                //console.log("context.getImageData", data)
                //this.qrcode.decode(data);
                this.qrcode.decode();
                context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            } catch (e) {
                console.error('scan error:', e);
            }
        }
    }

    initCamera() {
        let _this = this;
        if (navigator.mediaDevices) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                //console.debug("devices:", devices);
                let cArray = [];
                let flag = false;
                for (var i = 0; i != devices.length; ++i) {
                    var device = devices[i];
                    //这里会遍历audio,video，所以要加以区分
                    if (device.kind === 'videoinput') {
                        cArray.push(device.deviceId);
                        //console.info('cameraID:', device.deviceId);
                        flag = true;
                    }
                }
                if (flag) {
                    _this.setState({hasCamera: true, cameras: cArray});
                    _this.openCamera(cArray);
                }
            });
        } else {
            this.refs.file.click();
        }
    }

    openCamera(cArray) {
        let _this = this;
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        if (navigator.mediaDevices.getUserMedia === undefined) {
            console.log("openCamera:reset getUserMedia");
            navigator.mediaDevices.getUserMedia = function (constraints) {
                let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }
                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }
        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        let video = this.refs.video;

        let constraints = {
            video: {
                facingMode: "user",
                deviceId: undefined
                //width: video.clientWidth,
                //height: video.clientHeight
            },
            audio: false
        };
        if (this.state.cameras.length > 0) {
            constraints.video.deviceId = this.state.cameras.length > 1 ? this.state.cameras[1] : this.state.cameras[0];
            if (this.state.cameras.length > 1) constraints.video.facingMode = {exact: "environment"};
        }
        //constraints = {audio: false, video: true};
        console.log("openCamera constraints:", constraints)
        if (navigator.mediaDevices.getUserMedia) {
            //console.debug(navigator.mediaDevices.getUserMedia);
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                var videoTracks = stream.getVideoTracks();
                console.log('Using video device: ' + videoTracks[0].label);

                if (video["srcObject"] !== undefined) {
                    video.srcObject = stream;
                }
                else if (video["mozSrcObject"] !== undefined) {
                    video.mozSrcObject = stream;
                } else {
                    video.src = window.URL && window.URL.createObjectURL(stream) || stream;
                }
                _this.mStream = stream;
                video.onloadedmetadata = function (e) {
                    video.play();
                    _this.timer = setInterval(_this.scan, 2000);
                };
                _this.qrcode.callback = (result, err) => {
                    //console.log("qrcode.callback", result)
                    _this.qrcodeSuccess(result, err);
                };
            }).catch((e) => {
                console.error('openCamera error:', e);
                //alert(e.message)
            });
        }
    }

    onSelectPicClick() {
        this.refs.file.click();
    }

    onFileChange() {
        let _this = this;
        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        this.qrcode.callback = (result, err) => {
            this.qrcodeSuccess(result, err);
        };

        pica.WEBGL = true;

        let qrCanvas = this.refs.qrCanvas;
        let fileElm = this.refs.file;
        if (fileElm.files.length > 0) {
            let file = fileElm.files[0];
            let imageType = /^image\//;
            if (!imageType.test(file.type)) {
                console.info('File type not valid');
                return;
            }
            /*
             let Orientation = null;
             EXIF.getData(file, function () {
             console.debug('exif:', EXIF.pretty(this));
             Orientation = EXIF.getTag(this, 'Orientation');
             });
             */


            let img = new Image();
            let tmpCvs = document.createElement("canvas");
            let tmpCtx = null;
            img.onload = function () {

                //alert('Orientation:' + Orientation);

                let sw = img.width, sh = img.height;
                let scale = sw / sh;
                let tw = _this.refs.videoImg.clientWidth;
                let th = parseInt(tw / scale);

                tmpCvs.width = sw;
                tmpCvs.height = sh;
                tmpCtx = tmpCvs.getContext("2d");
                tmpCtx.drawImage(img, 0, 0);

                qrCanvas.width = tw;
                qrCanvas.height = th;

                //console.debug('st:', sw, sh, tw, th);

                pica.resizeCanvas(tmpCvs, qrCanvas, {
                    quality: 3,
                    alpha: false,
                    unsharpAmount: 80,
                    unsharpRadius: 0.6,
                    unsharpThreshold: 2,
                    transferable: true
                }, (err) => {
                    if (err !== undefined) {
                        console.error('resizeCanvas:', err);
                        return;
                    }
                    _this.qrcode.decode();
                });

            }.bind(img);
            let fdata = window.URL.createObjectURL(file);
            img.src = fdata;
        }
    }

    render() {
        let browserName = this.userBrowser();
        let content = null;
        if (this.state.hasCamera) {
            content = (
                <div className="scan">
                    <video ref="video" autoPlay playsInline></video>
                    <div className="picture-frame"></div>
                    <canvas ref="qrCanvas" id="qr-canvas"/>
                </div>
            );
        } else {
            if (this.isIphone()) {
                content = (
                    <div className="scan">
                        <div className="video" ref="videoImg">
                            <canvas ref="qrCanvas" id="qr-canvas" style={{display: 'none'}}></canvas>
                        </div>
                        <br/>
                        <div className="message-box" ref="msgBox">
                            {this.formatMessage('scan_defaultMsg')}
                        </div>
                        <br/>
                        <div className="operate">
                            <input type="button" className="green-btn" value={this.formatMessage('scan_selectImg')}
                                   onClick={this.onSelectPicClick.bind(this)}/>
                            <input ref="file" type="file" accept="image/*" style={{display: 'none'}}
                                   onChange={this.onFileChange.bind(this)}/>
                        </div>
                    </div>
                );
            } else {
                content = (
                    <div className="scan">
                        <div className="video">{this.formatMessage('scan_noCamera')}</div>
                    </div>
                );
            }
        }

        return (
            <div className="content clear-toppadding">
                {content}
            </div>
        );
    }
}

export default connectToStores(Scan);