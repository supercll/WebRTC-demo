"use strict";

//devices
let audioSource = document.querySelector("select#audioSource");
let audioOutput = document.querySelector("select#audioOutput");
let videoSource = document.querySelector("select#videoSource");
let filtersSelect = document.querySelector("select#filter");

let videoplay = document.querySelector("video#player");

//div
let divConstraints = document.querySelector("div#constraints");

function getDevices(deviceInfos) {
    deviceInfos.forEach(function (deviceinfo) {
        let option = document.createElement("option");
        option.text = deviceinfo.label;
        option.value = deviceinfo.deviceId;

        if (deviceinfo.kind === "audioinput") {
            audioSource.appendChild(option);
        } else if (deviceinfo.kind === "audiooutput") {
            audioOutput.appendChild(option);
        } else if (deviceinfo.kind === "videoinput") {
            videoSource.appendChild(option);
        }
    });
}

function gotMediaStream(stream) {
    // 拿到所有video 轨，取第一个
    let videoTrack = stream.getVideoTracks()[0];
    // 返回video的所有约束
    let videoConstraints = videoTrack.getSettings();
    // 转为JSON格式，添加到dom中
    divConstraints.textContent = JSON.stringify(videoConstraints, null, 2 /* 缩进空格 */);

    window.stream = stream;
    videoplay.srcObject = stream;

    //audioplay.srcObject = stream;
    return navigator.mediaDevices.enumerateDevices();
}

function handleError(err) {
    console.log("getUserMedia error:", err);
}

function start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("getUserMedia is not supported!");
        return;
    } else {
        let deviceId = videoSource.value;
        let constraints = {
            video: {
                width: 640,
                height: 480,
                frameRate: 15 /* 帧率 */,
                facingMode: "environment",
            },
            audio: {
                noiseSuppression: true,
                echoCancellation: true,
            },
            deviceId: deviceId ? { exact: deviceId } : undefined,
        };

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(gotMediaStream)
            .then(getDevices)
            .catch(handleError);
    }
}

start();

videoSource.onchange = start;

filtersSelect.onchange = function () {
    videoplay.className = filtersSelect.value;
};
