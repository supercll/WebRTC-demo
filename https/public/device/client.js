"use strict";

const audioSource = document.querySelector("select#audioSource");
const audioOutput = document.querySelector("select#audioOutput");
const videoSource = document.querySelector("select#videoSource");
async function getRtc() {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
}
if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    throw new Error("enumerateDevice is not support!");
} else {
    getRtc();
    navigator.mediaDevices.enumerateDevices().then(getDevices).catch(handleError);
}
function getDevices(deviceInfos) {
    // 遍历数组
    deviceInfos.forEach(deviceInfo => {
        console.log(`kind: ${deviceInfo.kind};label: ${deviceInfo.label};
            deviceId=${deviceInfo.deviceId};groupId: ${deviceInfo.groupId}`);
        let option = document.createElement("option");
        option.text = deviceInfo.label;
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === "audioinput") {
            audioSource.appendChild(option);
        } else if (deviceInfo.kind === "audiooutput") {
            audioOutput.appendChild(option);
        } else if (deviceInfo.kind === "videoinput") {
            videoSource.appendChild(option);
        }
    });
}

function handleError(err) {
    console.log(err.name, err.message);
}
