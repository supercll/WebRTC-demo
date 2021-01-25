"use strict";

//devices
let audioSource = document.querySelector("select#audioSource");
let audioOutput = document.querySelector("select#audioOutput");
let videoSource = document.querySelector("select#videoSource");

// filter
let filtersSelect = document.querySelector("select#filter");

// snapshot
let snapshot = document.querySelector("button#snapshot");
let picture = document.querySelector("canvas#picture");
picture.width = 640;
picture.height = 480;

let videoplay = document.querySelector("video#player");
//let audioplay = document.querySelector('audio#audioplayer');

//div
let divConstraints = document.querySelector("div#constraints");

//record
let recvideo = document.querySelector("video#recplayer");
let btnRecord = document.querySelector("button#record");
let btnPlay = document.querySelector("button#recplay");
let btnDownload = document.querySelector("button#download");

let buffer;
let mediaRecorder;

//socket.io
let btnConnect = document.querySelector("button#connect");
let btnLeave = document.querySelector("button#leave");
let inputRoom = document.querySelector("input#room");

let socket;
let room;

function gotDevices(deviceInfos) {
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
        let deviceId = videoSource.value;
        let constraints = {
            video: {
                width: 640,
                height: 480,
                frameRate: 15 /* 帧率 */,
                facingMode: "enviroment",
                deviceId: deviceId ? { exact: deviceId } : undefined,
            },
            audio: false,
        };

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(gotMediaStream)
            .then(gotDevices)
            .catch(handleError);
    }
}
function startDesktop() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("getUserMedia is not supported!");
        return;
    } else {
        let constraints = {
            video: true,
            audio: false,
        };

        navigator.mediaDevices
            .getDisplayMedia(constraints)
            .then(gotMediaStream)
            .then(gotDevices)
            .catch(handleError);
    }
}

// start();
// startOnlyAudio();
startDesktop();

videoSource.onchange = start;

filtersSelect.onchange = function () {
    videoplay.className = filtersSelect.value;
};

snapshot.onclick = function () {
    picture.className = filtersSelect.value;
    picture.getContext("2d").drawImage(videoplay, 0, 0, picture.width, picture.height);
};

// recorder

function handleDataAvailable(e) {
    if (e && e.data && e.data.size > 0) {
        buffer.push(e.data);
    }
}

function startRecord() {
    buffer = [];

    let options = {
        mimeType: "video/webm;codecs=vp8",
    };

    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported!`);
        return;
    }

    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
        console.error("Failed to create MediaRecorder:", e);
        return;
    }

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10);
}

function stopRecord() {
    mediaRecorder.stop();
}

btnRecord.onclick = () => {
    if (btnRecord.textContent === "Start Record") {
        startRecord();
        btnRecord.textContent = "Stop Record";
        btnPlay.disabled = true;
        btnDownload.disabled = true;
    } else {
        stopRecord();
        btnRecord.textContent = "Start Record";
        btnPlay.disabled = false;
        btnDownload.disabled = false;
    }
};

btnPlay.onclick = () => {
    let blob = new Blob(buffer, { type: "video/webm" });
    recvideo.src = window.URL.createObjectURL(blob);
    recvideo.srcObject = null;
    recvideo.controls = true;
    recvideo.play();
};

btnDownload.onclick = () => {
    let blob = new Blob(buffer, { type: "video/webm" });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");

    a.href = url;
    a.style.display = "none";
    a.download = "aaa.webm";
    a.click();
};

function connectServer() {
    socket = io.connect();

    btnLeave.disabled = false;
    btnConnect.disabled = true;

    ///////
    socket.on("joined", function (room, id) {
        console.log("The User(" + id + ") have joined into " + room);
    });

    socket.on("leaved", function (room, id) {
        console.log("The User(" + id + ") have leaved from " + room);
    });

    //join room
    room = inputRoom.value;
    if (room !== "") {
        socket.emit("join", room);
    }
}

btnConnect.onclick = () => {
    connectServer();
};

btnLeave.onclick = () => {
    if (room !== "") {
        socket.emit("leave", room);
        btnLeave.disabled = true;
        btnConnect.disabled = false;
        socket.disconnect();
    }
};
