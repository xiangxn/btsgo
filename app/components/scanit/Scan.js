/**
 * Created by necklace on 2017/1/18.
 */
import React from "react";
import BaseComonent from "../BaseComponent";
import QrCode from "qrcode-reader";

class Scan extends BaseComonent {
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
        this.mStream.getVideoTracks().forEach(function (videoTrack) {
            videoTrack.stop();
        });
    }

    componentDidMount() {
        this.initCamera();
    }

    qrcodeSuccess(data) {
        console.debug(data);
        alert(data);
        if (data !== undefined && this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    scan() {
        if (this.mStream) {
            //console.debug(this.mStream)
            let video = this.refs.video;
            video.width = video.clientWidth;
            video.height = video.clientHeight;
            let canvas = this.refs.qrCanvas;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            let scale = 640 / video.width;
            let left = scale * canvas.offsetLeft;
            let top = scale * canvas.offsetTop;
            let w = scale * canvas.clientWidth;
            let h = scale * canvas.clientHeight;
            let context = canvas.getContext('2d');
            context.drawImage(video, left, top, w, h, 0, 0, canvas.clientWidth, canvas.clientHeight);
            try {
                let data = context.getImageData(0, 0, canvas.clientWidth, canvas.clientHeight);
                //console.debug(data)
                //this.qrcode.decode(data);
                this.qrcode.decode();
                context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            } catch (e) {
                console.error('scan', e);
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
                        console.info('cameraID:', device.deviceId);
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
        let constraints = {video: {width: video.clientWidth, height: video.clientHeight}};
        //let constraints = {video: true};
        if (navigator.mediaDevices.getUserMedia) {
            //console.debug(navigator.mediaDevices.getUserMedia);
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                if (video.mozSrcObject !== undefined) {
                    video.mozSrcObject = stream;
                }
                else {
                    video.src = window.URL && window.URL.createObjectURL(stream) || stream;
                }
                _this.mStream = stream;
                video.onloadedmetadata = function (e) {
                    video.play();
                    _this.timer = setInterval(_this.scan, 2000);
                };
                _this.qrcode.callback = (result) => {
                    _this.qrcodeSuccess(result);
                };
            }).catch((e) => {
                console.error('openCamera', e);
            });
        }
    }

    onSelectPicClick() {
        this.refs.file.click();
    }

    onFileChange() {
        let _this = this;
        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        this.qrcode.callback = (result) => {
            this.qrcodeSuccess(result);
        };
        //初始化文件选择来打开摄像头
        let qrCanvas = this.refs.qrCanvas;
        let fileElm = this.refs.file;
        if (fileElm.files.length > 0) {
            let file = fileElm.files[0];
            let imageType = /^image\//;
            if (!imageType.test(file.type)) {
                console.info('File type not valid');
                return;
            }

            let img = this.refs.videoImg;
            img.onload = () => {
                img.width = img.clientWidth;
                img.height = img.clientHeight;
                qrCanvas.width = img.naturalWidth;
                qrCanvas.height = img.naturalHeight;
                let context = qrCanvas.getContext('2d');
                context.drawImage(img, 0, 0);
                _this.qrcode.decode();
            };
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
                    <video ref="video"></video>
                    <div className="picture-frame"></div>
                    <canvas ref="qrCanvas" id="qr-canvas"/>
                </div>
            );
        } else {
            if (this.isIphone()) {
                content = (
                    <div className="scan">
                        <div className="video"><img ref="videoImg"/>
                            <canvas ref="qrCanvas" id="qr-canvas" style={{display: 'none'}}></canvas>
                        </div>

                        <input type="button" className="green-btn" value="选择图片"
                               onClick={this.onSelectPicClick.bind(this)}/>
                        <input ref="file" type="file" accept="image/*" style={{display: 'none'}}
                               onChange={this.onFileChange.bind(this)}/>
                    </div>
                );
            } else {
                content = (
                    <div className="scan">
                        <div className="video">未发现摄像头</div>
                    </div>
                );
            }
        }


        return (

            <div className="content clear-toppadding">
                {content}
            </div>
        )
            ;
    }
}

export default Scan;