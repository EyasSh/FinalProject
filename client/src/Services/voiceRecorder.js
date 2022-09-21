import { sleep } from "./misc"

let chunks = []
let stopped = false
let mediaRecorder = null
let dataAvailable = false
export const recordAudio = async () => {
    cancelRecording()
    stopped = false
    let stream = null
    try {
        stream = await navigator.mediaDevices.getUserMedia({audio: true})
    } catch (e) {
        console.log(e)
    }
    console.log(stream)
    if (stream) {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start()
        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data)
            dataAvailable = true
        }
    }
}

export const saveRecording = async () => {
    stopped = true
    mediaRecorder?.stop()
    while(stopped && !dataAvailable){
        await sleep(200)
    }
    dataAvailable = false
    console.log(chunks)
    if (chunks[0]){
        const blob = new Blob(chunks, {"type": "audio/ogg; codecs=opus"})
        chunks = []
        console.log(blob)
        const bytes = await readBlob(blob)
        return bytes
    }
    return
}

export const cancelRecording = () => {
    stopped = true
    dataAvailable = false
    chunks = []
    mediaRecorder = null
}

const readBlob = blob => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const srcUrl = e.target.result;
            resolve(srcUrl)
        };
        reader.readAsArrayBuffer(blob)
    })
}