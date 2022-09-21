import MD5 from "crypto-js/md5"

//firebase
import { firebaseApp } from "../DB/FireBaseConf";
import {getStorage, ref, getDownloadURL, uploadBytesResumable} from "firebase/storage"
const Storage = getStorage(firebaseApp)

export const uploadFile = (src, destanation, limit) => {
    return new Promise(async (resolve, reject) => {
        if (!src) reject("No file was provided!")
        if (src.size > 8000000 && limit) reject("File is larger than 8MB!")
        // we name the file with its md5 hash to prevent file duplicates
        const storageRef = ref(Storage, `${destanation}/${await getMD5(src)}`) // the second argument is the path to the file in firebase
        getDownloadURL(storageRef)
        .then(url => {
            //no need to upload
            resolve(url)
        })
        .catch(() => {
            //an error means the file needs to be uploaded
            const uploadTask = uploadBytesResumable(storageRef, src)

            uploadTask.on('state_changed', 
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            }, 
            (error) => {
                // Handle unsuccessful uploads
                reject(error)
            }, 
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL)
                });
            });    
        }) 
    })
}

//calculates the MD5 hash of a string
export const getMD5 = async file => {
    const reader = new FileReader()
    var hashMD5 = null
    try {
        reader.onload = function(e){
            hashMD5 = MD5(e.target.result)
        }
        reader.readAsBinaryString(file)
    } catch {
        hashMD5 = Date.now()
    }
    
    while (hashMD5 == null){
        await sleep(100)
    }
    return hashMD5
}

// a sleep function
export const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// a check if a string is JSON
export const isJSON = string => {
    try{
        JSON.parse(string)
    } catch (e) {
        return false
    }
    return JSON.parse(string)
}