import {React, useRef, useState} from 'react';
import MD5 from "crypto-js/md5"
import * as Joi from "joi"

//css
import "./Modal.css"

//assets
import {SearchOutlined} from '@ant-design/icons';
import defaultPNG from "../Assets/Images/default.png"

//firebase
import { firebaseApp } from "../DB/FireBaseConf";
import {getAuth, updateProfile} from "firebase/auth"
import {getStorage, ref, getDownloadURL, uploadBytesResumable} from "firebase/storage"


function Modal(props) {
    // new convo modal states
    const [checkedContacts, setCheckedContacts] = useState([])
    const [newConvoSearch, setNewConvoSearch] = useState("")
    const [contactList, setcontactList] = useState([])

    // edit profile modal states
    const Auth = getAuth(firebaseApp)
    const Storage = getStorage(firebaseApp)
    const [epPhoto, setEpPhoto] = useState(props.profPic) // this state is to change the preview image before submitting the edit
    const inputImage = useRef(null)
    const [dname, setDname] = useState(Auth.currentUser.displayName)
    const epPrevImg = useRef(null)
    const allowedImgTypes = ["image/png", "image/jpg", "image/jpeg"]

    const server = props.server

    const handleNewConvoSearch = e => {
        setNewConvoSearch(e.target.value)
    }

    //gets the user by its email from the server
    const getUserByEmail = email => {
        const schema = Joi.object({
            Email: Joi.string().email({tlds: {allow: false}}).required()
        })
        const {error} = schema.validate({Email: newConvoSearch})
        if (!error){
            server.get(`users?email=${newConvoSearch}`)
            .then((res) => {
                if (res.status != 200) return
                setcontactList([...contactList, res.data])
            })
        }
    }

    const isUserChecked = (user) => {
        var rtval = false
        checkedContacts.forEach(checkedUser => {
            if (JSON.parse(checkedUser).uid == user.uid){
                rtval = true
            }
        })
        return rtval
    }

    const updateExistingConvos = () =>{
        var matchSearch = []
        var uniqueIDs = []
        props.chats.forEach(chat => {
            if (chat.recepientId) {
                server.get(`users?uid=${chat.recepientId}`)
                .then((res) => {
                    if (res.status != 200) return
                    setcontactList([...contactList, res.data])
                })
            }
        })
        contactList.forEach(user => {
            if (user.displayName.toLowerCase().includes(newConvoSearch.toLowerCase()) || user.email.toLowerCase().includes(newConvoSearch.toLowerCase()) || isUserChecked(user)){
                matchSearch.push(user)
            }
        })
        var rtval = []
        //now we need to remove duplicates before we return
        matchSearch.map(user => {
            if (!uniqueIDs.includes(user.uid)){
                uniqueIDs.push(user.uid)
                rtval.push(user)
            }
        })
        return rtval
    }

    // Handle a checkbox change on the modal to create a new convo
    const handleCheck = (event) =>{
        var updatedList = [...checkedContacts]
        if (event.target.checked){
            updatedList = [...checkedContacts, event.target.value]
        } else {
            updatedList.splice(checkedContacts.indexOf(event.target.value), 1)
        }
        setCheckedContacts(updatedList)
    }

    //closes the modal and clears the not needed data
    const closeModal = () => {
        props.setModalOpen(false)
        setCheckedContacts([])
    }

    const removeProfPic = () => {
        setEpPhoto(defaultPNG)
    }

    // updates the preview image when the user selects a file for their profile pic
    const previewImage = (e) => {
        if (e.target.files[0]){
            if (e.target.files[0].size > 8000000){
                e.target.files = []
                return alert("Can't upload a file larger than 8MB")
            }
            if (!allowedImgTypes.includes(e.target.files[0].type)){
                e.target.files = []
                return alert("Unsupported type")
            }
            var reader = new FileReader()
            reader.onload = function(e) {
                epPrevImg.current.src = e.target.result
                setEpPhoto(e.target.result)
            }
            reader.readAsDataURL(e.target.files[0])
        }
    }

    //saves the edit profile form and uploads the new data
    const saveEp = (e) => {
        if (epPhoto == defaultPNG){
            updateProfile(Auth.currentUser, {
                displayName: dname,
                photoURL: 0
            })
            props.setProfPic(defaultPNG)
        } else if (inputImage.current.files[0]){
            updateProfPic(inputImage.current.files[0])
        } else {
            updateProfile(Auth.currentUser, {
                displayName: dname,
            })
        }
        closeModal()
    }

    //calculates the MD5 hash of a string
    const getMD5 = async (file) => {
        const reader = new FileReader()
        var hashMD5 = null
        reader.onload = function(e){
            hashMD5 = MD5(e.target.result)
        }
        reader.readAsBinaryString(file)
        while (hashMD5 == null){
            await sleep(100)
        } 
        return hashMD5
    }

    // a sleep function
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // TODO: Move this function to a util folder and only return the download link
    const updateProfPic = async src => {
        if (!src) return
        // we name the file with its md5 hash to prevent file duplicates
        const storageRef = ref(Storage, `${Auth.currentUser.uid}/${await getMD5(src)}`) // the second argument is the path to the file in firebase
        getDownloadURL(storageRef)
        .then(url => {
            //no need to upload
            console.log(`File Exists at: ${url}`)
            updateProfile(Auth.currentUser, {
                photoURL: url
            })
            .then (() => {
                props.setProfPic(Auth.currentUser.photoURL)
            })
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
            }, 
            () => {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    props.setProfPic(downloadURL)
                    updateProfile(Auth.currentUser, {
                        photoURL: downloadURL
                    })
                });
            });    
        })
    }

    // Modal types
    //TODO: Add an incoming call modal
    const modals = {
        "newConvo": (
            <>
                <div className="modal" style={{
                    width: "500px",
                    height: "300px"                
                }}>
                    <span className="exitBtn" onClick={closeModal}>x</span>
                    <div className="convoModalSearch">
                        <span className='convoModalSearchIcon'><SearchOutlined /></span>
                        <input onChange={handleNewConvoSearch} className='convoModalSearchBar' type="text" placeholder='Enter email or select from the list bellow...' />
                        <button onClick={() => getUserByEmail(newConvoSearch)} className='convoModalSearchEmail'>Search email</button>
                    </div>
                    <div className="checkList">
                        {
                            updateExistingConvos()[0] ? updateExistingConvos().map(user => {
                                return(
                                    <div className='checkListItemWrapper'>
                                        <input value={JSON.stringify(user)} type="checkbox" className="contactCheckBox" onChange={handleCheck}/>
                                        <span className='contactItemName'>{user.displayName}</span>
                                        <span className="contactItemId">{user.email}</span>
                                    </div>
                                )
                            }) : <span>You don't have any contacts</span>
                        }
                    </div>
                    <button disabled={checkedContacts[0] == null} className="submitModal">Create Conversation</button>
                </div>
            </>
        ),

        "editProfile": (
            <>
                <div className="modal" style={{
                    width: "400px",
                    height: "150px"                
                }}>
                    <div className="epInfo">
                        <span className="exitBtn" onClick={closeModal}>x</span>
                        <input onChange={previewImage} ref={inputImage} type="file" accept='image/png, image/jpg, image/jpeg' alt="" style={{display: "none"}} />
                        <img ref={epPrevImg} onClick={() => inputImage.current.click()} src={epPhoto} alt="" className="epImage" />

                        <div>
                            <label className="epDnameLbl">First name:</label>
                            <br></br>
                            
                            <input placeholder='Enter a new name...' 
                            type="text"
                            defaultValue={dname}
                            onChange={(e) => setDname(e.target.value)}
                            className="epDname" />
                        </div>

                        <div className="epBtns">
                            <button disabled={epPhoto == defaultPNG} className="removeProfilePic" onClick={removeProfPic}>Remove Profile Picture</button>
                            <button disabled={(dname.trim() == "" || dname == Auth.currentUser.displayName) && epPhoto == props.profPic} className="saveEp" onClick={saveEp}>Save</button>
                        </div>
                    </div>

                </div>
            </>
        ),
    }

    return (
        <div>
            <div className='modalOverlay' onClick={closeModal}></div>
            {modals[props.modalOpen]}
        </div>
    );
}

export default Modal;