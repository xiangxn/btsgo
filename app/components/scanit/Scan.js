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

    componentWillMount() {

    }

    componentDidMount() {
        this.initCamera();
    }

    initCamera() {
        let _this = this;
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
    }

    openCamera(cArray) {
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }
        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function (constraints) {

                var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }

                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }
        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        //let constraints = { video: { frameRate: { ideal: 10, max: 15 } } };
        let constraints = {video: true};
        if (navigator.mediaDevices.getUserMedia) {
            //console.debug(navigator.mediaDevices.getUserMedia);
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                let video = this.refs.video;
                if (video.mozSrcObject !== undefined) {
                    video.mozSrcObject = stream;
                }
                else {
                    video.src = window.URL && window.URL.createObjectURL(stream) || stream;
                }
                video.onloadedmetadata = function (e) {
                    video.play();
                };
            }).catch((e) => {
                console.error('openCamera', e);
            });
        }
    }

    render() {
        let browserName = this.userBrowser();
        let content = null;
        if (this.state.hasCamera) {
            content = <video ref="video" style={{width: "6.4rem"}}></video>;
        } else {
            content = <div>未发现摄像头</div>;
        }


        return (

            <div className="content">
                {content}
            </div>
        )
            ;
    }
}

export default Scan;