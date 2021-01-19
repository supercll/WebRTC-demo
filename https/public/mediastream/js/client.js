"use strict";

//devices
let audioSource = document.querySelector("select#audioSource");
let audioOutput = document.querySelector("select#audioOutput");
let videoSource = document.querySelector("select#videoSource");


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
    let videoTrack = stream.getVideoTracks()[0];
    let videoConstraints = videoTrack.getSettings();

    divConstraints.textContent = JSON.stringify(videoConstraints, null, 2);

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
        let constraints = {
            video: true,
            audio: true,
        };

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(gotMediaStream)
            .then(getDevices)
            .catch(handleError);
    }
}

start();