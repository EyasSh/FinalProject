import {React, useRef, useState} from 'react';

//css
import "./Modal.css"

//assets
import {SearchOutlined} from '@ant-design/icons';
import defaultPNG from "../Assets/Images/default.png"

//firebase
import { firebaseApp } from "../DB/FireBaseConf";
import {getAuth, updateProfile} from "firebase/auth"
import {getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable} from "firebase/storage"


function Modal(props) {
    // new convo modal states
    const [checkedContacts, setCheckedContacts] = useState([])
    const [newConvoSearch, setNewConvoSearch] = useState("")

    // edit profile modal states
    const Auth = getAuth(firebaseApp)
    const Storage = getStorage(firebaseApp)
    const [epPhoto, setEpPhoto] = useState(props.profPic) // this state is to change the preview image before submitting the edit
    const inputImage = useRef(null)
    const [dname, setDname] = useState(Auth.currentUser.displayName)
    const epPrevImg = useRef(null)


    const handleNewConvoSearch = e => {
        setNewConvoSearch(e.target.value)
    }

    const getExistingConvos = () =>{
        const convosList = []
        props.chats.map(chat => {
            if (chat.recipientId){ 
                // This checks if the conversation is a group chat or a private chat
                // we only want private chats
                //we also need to handle search bar
                if (newConvoSearch.trim === ""){
                    convosList.push({name: chat.name, id: chat.recipientId})
                } else if (chat.name.toLowerCase().includes(newConvoSearch.toLowerCase())
                || chat.recipientId.toLowerCase().includes(newConvoSearch.toLowerCase())) {
                    convosList.push({name: chat.name, id: chat.recipientId})
                }
            }
        })
        return convosList
    }

    const handleCheck = (event) =>{
        var updatedList = [...checkedContacts]
        if (event.target.checked){
            updatedList = [...checkedContacts, event.target.value]
        } else {
            updatedList.splice(checkedContacts.indexOf(event.target.value), 1)
        }
        setCheckedContacts(updatedList)
    }

    const closeModal = () => {
        props.setModalOpen(false)
        setCheckedContacts([])
    }

    const removeProfPic = () => {
        setEpPhoto(defaultPNG)
    }

    const previewImage = (e) => {
        if (e.target.files[0]){
            var reader = new FileReader()
            reader.onload = function(e) {
                epPrevImg.current.src = e.target.result
            }
            reader.readAsDataURL(e.target.files[0])
            setEpPhoto(epPrevImg.current.src)
        }
    }

    const saveEp = (e) => {
        if (!(epPhoto == defaultPNG || epPhoto == props.profPic)){
            updateProfPic(epPrevImg.current.src)
        }
        updateProfile(Auth.currentUser, {
            displayName: dname,
        })
        closeModal()
    }

    const updateProfPic = src => {
        var reader = new FileReader()
            reader.onload = function(e) {
                // we need to turn the image into a byte array to upload it
                var arrayBuffer = e.target.result
                var array = new Uint8Array(arrayBuffer)

                // then we upload it to firebase
                const storageRef = ref(Storage, src)
                const uploadTask = uploadBytesResumable(storageRef, array)

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
                        setEpPhoto(downloadURL)
                        updateProfile(Auth.currentUser, {
                            photoURL: downloadURL
                        })
                    });
                });
            }
        reader.readAsArrayBuffer(inputImage.current.files[0])
    }

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
                        <input onChange={handleNewConvoSearch} className='convoModalSearchBar' type="text" placeholder='Enter username or select from the list bellow...' />
                    </div>
                    <div className="checkList">
                        {
                            getExistingConvos()[0] ? getExistingConvos().map(item => {
                                return(
                                    <div className='checkListItemWrapper'>
                                        <input value={item.id} type="checkbox" className="contactCheckBox" onChange={handleCheck}/>
                                        <span className='contactItemName'>{item.name}</span>
                                        <span className="contactItemId">{item.id}</span>
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
                        <input onChange={previewImage} ref={inputImage} type="file" accept='image/*' alt="" style={{display: "none"}} />
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
                            <button disabled={epPhoto == props.profPic} className="removeProfilePic" onClick={removeProfPic}>Remove Profile Picture</button>
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