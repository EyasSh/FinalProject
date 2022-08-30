import {React, useRef, useState} from 'react';
import axios from "axios"

//css
import "./Modal.css"

//assets
import {SearchOutlined} from '@ant-design/icons';
import defaultPNG from "../Assets/Images/default.png"

//firebase
import { firebaseApp } from "../DB/FireBaseConf";
import {getAuth, updateProfile} from "firebase/auth"


function Modal(props) {
    // new convo modal states
    const [checkedContacts, setCheckedContacts] = useState([])
    const [newConvoSearch, setNewConvoSearch] = useState("")

    // edit profile modal states
    const Auth = getAuth(firebaseApp)
    const [epPhoto, setEpPhoto] = useState(props.profPic) // this state is to change the preview image before submitting the edit
    const inputImage = useRef(null)
    const [dname, setDname] = useState(Auth.currentUser.displayName)
    const epPrevImg = useRef(null)

    //axios imgur instance
    const imgur = axios.create({
        baseURL: 'https://api.imgur.com/3/',
        timeout: 60000,
        headers: {
            'Authorization': 'Client-ID 5c92913fb3701ad',
            "Content-type": "application/x-www-form-urlencoded",
        }
    });


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
        updateProfPic(epPrevImg.current.src)
        updateProfile(Auth.currentUser, {
            displayName: dname,
        })
        closeModal()
    }

    const updateProfPic = src => {
        // var reader = new FileReader()
        //     reader.onload = function(e) {
        //         // we need to turn the image into a byte array to upload it
        //         var arrayBuffer = e.target.result
        //         var array = new Uint8Array(arrayBuffer)
        //         console.log(arrayBuffer)
                
        //     }
        // reader.readAsArrayBuffer(inputImage.current.files[0])
        if (inputImage.current.files[0]){
            console.log("got a file")
            const formData = new FormData()
            formData.append("image", inputImage.current.files[0])
            imgur.post("image", formData) // imgur doesnt accept localhost, so we pointed "collegehost" to local host and borwsed the page from collegehost:3000
            .then(res => {
                updateProfile(Auth.currentUser, {
                    photoURL: res.data.data.link
                }).then(() => {
                    props.setProfPic(Auth.currentUser.photoURL) // to update the photo on the nav
                })
            })
        } else {
            console.log("removed")
            updateProfile(Auth.currentUser, {
                photoURL: 0
            })
        }
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