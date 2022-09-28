import {React, useRef, useState} from 'react';
import * as Joi from "joi"
import { uploadFile } from '../Services/misc';
import Spinner from "../Spinner/Spinner"
import { deriveKey, encryptText, generateKeyPair } from '../Services/E2E';

//css
import "./Modal.css"

//assets
import {SearchOutlined} from '@ant-design/icons';
import defaultPNG from "../Assets/Images/default.png"
import gDefaultPng from "../Assets/Images/groupDefault.png"


//firebase
import { firebaseApp } from "../DB/FireBaseConf";
import {getAuth, updateProfile} from "firebase/auth"
import { useEffect } from 'react';


function Modal(props) {
    // new convo modal states
    const [checkedContacts, setCheckedContacts] = useState([])
    const [newConvoSearch, setNewConvoSearch] = useState("")
    const [contactList, setcontactList] = useState(props.contacts)
    const [publicKeys, setPublicKeys] = useState([])

    // edit profile modal states
    const Auth = getAuth(firebaseApp)
    const [epPhoto, setEpPhoto] = useState(props.profPic) // this state is to change the preview image before submitting the edit
    const inputImage = useRef(null)
    const [dname, setDname] = useState(Auth.currentUser.displayName)
    const epPrevImg = useRef(null)

    //send file modal states
    const [fileTextFeild, setFileTextFeild] = useState("")
    const selectedImage = useRef()
    const [selectedFile, setSelectedFile] = useState(null)
    const [uploading, setUploading] = useState(false)

    //group info modal states
    const giPrev = useRef()
    const giFile = useRef()
    const [groupNameInput, setGroupNameInput] = useState(props.convo?.name)
    const [giPhoto, setGiPhoto] = useState(gDefaultPng)

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
                if (res.status != 200 || Auth.currentUser.email == res.data.email) return // we dont want to list ourselves
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
        contactList.forEach(data => {
            const user = data.user
            if (!publicKeys[user.uid]){
                var newPubKeys = publicKeys
                newPubKeys[user.uid] = data.publicKey ? data.publicKey : user.publicKey
                setPublicKeys(newPubKeys)    
            }
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

    const createConvo = async (e) => {
        if (checkedContacts.length == 1){
            props.socket.emit("createConvo", Auth.currentUser, checkedContacts)
        } else if (checkedContacts.length > 1){
            //we need to generate 2 key pairs and derive a key from them
            const groupPair1 = await generateKeyPair()
            const groupPair2 = await generateKeyPair()
            var rawKey = {
                publicKey: groupPair1.publicKeyJwk, 
                privateKey: groupPair2.privateKeyJwk
            }
            const groupKeys = {}
            //add your own key
            const selfDerived = await deriveKey(props.keyData.keyPair.publicKeyJwk, props.keyData.keyPair.privateKeyJwk)
            const selfEncryptedKey = await encryptText(JSON.stringify(rawKey), selfDerived)
            groupKeys[Auth.currentUser.uid] = {
                encryptedKey: selfEncryptedKey,
                publicKey: props.keyData.keyPair.publicKeyJwk
            }
            // loop through the selected contacts and add their keys
            for (const contact in checkedContacts) {
                const resPubKey = publicKeys[JSON.parse(checkedContacts[contact]).uid]
                groupKeys[JSON.parse(checkedContacts[contact]).uid] = {
                    encryptedKey: await encryptText(JSON.stringify(rawKey), await deriveKey(resPubKey, props.keyData.keyPair.privateKeyJwk)),
                    publicKey: props.keyData.keyPair.publicKeyJwk
                }
            }
            props.socket.emit("createConvo", Auth.currentUser, checkedContacts, JSON.stringify(groupKeys))
        }
        closeModal()
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
            if (!props.allowedImgTypes.includes(e.target.files[0].type)){
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

    // TODO: Move this function to a util folder and only return the download link
    const updateProfPic = src => {
        uploadFile(src, `profilePics/${Auth.currentUser.uid}`, true)
        .then(url => {
            props.setProfPic(url)
            updateProfile(Auth.currentUser, {
                photoURL: url
            })
        })
        .catch(e => alert(e))
    }

    const handleFileSelection = e => {
        e.preventDefault()
        if (!e.target.files[0]) {
            selectedImage.current.src = ""
            selectedImage.current.classList.add("hidden")
            return
        }
        const file = e.target.files[0]
        setSelectedFile(file)
        if (props.allowedImgTypes.includes(file.type)){
            var reader = new FileReader()
            reader.onload = function(e) {
                selectedImage.current.src = e.target.result
                selectedImage.current.classList.remove("hidden")
            }
            reader.readAsDataURL(e.target.files[0])
        } else {
            selectedImage.current.src = ""
            selectedImage.current.classList.add("hidden")
        }
    }

    const sendFile = e => {
        e.preventDefault()
        if (selectedFile) {
            setUploading(true)
            uploadFile(selectedFile, `chatFiles/${props.convo.convoID}`, true)
            .then(async url => {
                closeModal()
                var txtMsg = fileTextFeild.trim() ? fileTextFeild : ""
                txtMsg = await encryptText(txtMsg, props.convo.derivedKey)
                const fileObject = {
                    url: url,
                    data: {
                        size: selectedFile.size,
                        type: selectedFile.type,
                        name: selectedFile.name
                    }
                }
                const encryptedFile = await encryptText(JSON.stringify(fileObject), props.convo.derivedKey)
                props.socket.emit("sendMessage", props.Auth.currentUser, txtMsg, props.convo.convoID, encryptedFile)
                setUploading(false)
            })
            .catch(e => {
                console.log(e)
                setUploading(false)
            })
        }
    }

    const setAdmin = (e) => {
        props.socket.emit("setGroupAdmin", props.Auth.currentUser, props.convo.convoID, e.target.value)
    }

    const kickMember = (e) => {
        props.socket.emit("kickGroupMember", props.Auth.currentUser, props.convo.convoID, e.target.value)
    }

    const handleGroupNameInputChange = (e) => {
        setGroupNameInput(e.target.value)
    }

    const handleGroupInfoImage = (e) => {
        if (!e.target.files[0]) return
        if (!props.allowedImgTypes.includes(e.target.files[0].type)){
            e.target.files = []
            return alert("Unsupported type")
        }
        var reader = new FileReader()
        reader.onload = function(e) {
            giPrev.current.src = e.target.result
            setGiPhoto(e.target.result)
        }
        reader.readAsDataURL(e.target.files[0])
    }

    const saveGiModal = async (e) => {
        const file = giFile.current?.files[0]
        var imgUrl = null
        setUploading(true)
        if (file && props.allowedImgTypes.includes(file.type)){
            imgUrl = await uploadFile(file, `groupImages/${props.convo.convoID}`, true)
        }
        if (groupNameInput.trim()){
            props.socket.emit("editGroup", props.Auth.currentUser, props.convo.convoID, {
                imgUrl: imgUrl,
                name: groupNameInput
            })
        }
        setUploading(false)
        closeModal()
    }

    const getMembersJSX = () => {
        const rtval = []
        props.convo.members.forEach((member) => {
            member = JSON.parse(member)
            rtval.push(
                <div className="groupMember">
                    <img src={member.picture?? defaultPNG} alt="" className="giPhoto" />
                    <div className="memberData">
                        <span className="memberName">{member.name}</span>
                        <br></br>
                        <span className="memberEmail">{member.email}</span>
                    </div>
                    {props.isConvoAdmin ?
                        <div className="memberControls">
                            {!props.convo.admins.includes(member.uid) ? 
                             <>
                                <button onClick={setAdmin} value={member.uid} className='setAdmin'>Set Admin</button>
                                <button onClick={kickMember} value={member.uid} className='kickMember'>Kick</button>
                             </> : "Admin"
                            }
                        </div>
                        : ""
                    }
                </div>
            )
        })
        return rtval
    }

    // Modal types
    //TODO: Add an incoming call modal
    const modals = {
        "newConvo": props.modalOpen == "newConvo" ? (
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
                    <button disabled={checkedContacts[0] == null} onClick={createConvo} className="submitModal">Create Conversation</button>
                </div>
            </>
        ) : null,

        "editProfile": props.modalOpen == "editProfile" ? (
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
        ) : null,

        "sendFile": props.modalOpen == "sendFile" ?  (
            <>
            { uploading ? <Spinner /> :
                <div className="modal" style={{
                    width: "400px",
                    height: "fit-content"
                }}>
                    <span className="exitBtn" onClick={closeModal}>x</span>
                    <h3 className='sfTitle'>Send a file to {props.convo.name}</h3>
                    <input onChange={handleFileSelection} type="file" className="sendFileModalInput" />
                    <input placeholder='Write a message... (Optional)' onChange={(e) => setFileTextFeild(e.target.value)} type="text" className='fileTextFeild' />
                    <img ref={selectedImage} src="" alt="" className='sendFileImage hidden'/>
                    <div className="sendFileBtns">
                        <button className="cancelSendFile" onClick={closeModal}>Cancel</button>
                        <button disabled={!selectedFile} className="sendFile" onClick={sendFile}>Send</button>
                    </div>
                </div>
            }
            </>
        ) : null,

        "groupInfo": props.modalOpen == "groupInfo" ? (
            <>
                {uploading ? <Spinner /> : 
                    <>
                        <div className="modal" style={{
                            width: "500px",
                            height: "300px"                
                        }}>
                            <span className="exitBtn" onClick={closeModal}>x</span>
                            <h3 className='sfTitle'>{props.convo.name} Info</h3>
                            <input onChange={handleGroupInfoImage} ref={giFile} disabled={!props.isConvoAdmin} type="file" accept='image/png, image/jpg, image/jpeg' style={{display: "none"}} />
                            <div className="mainInfo">
                                <img onClick={() => giFile.current?.click()} ref={giPrev} src={props.convo.picture} style={props.isConvoAdmin ? {cursor: "pointer"} : {}} alt="" className="giPhoto" />
                                <input maxLength="20" placeholder='Enter a desired name...' onChange={handleGroupNameInputChange} className='giNameFeild' type="text" defaultValue={props.convo.name} disabled={!props.isConvoAdmin} />
                            </div>
                            <div className="groupMembers">
                                {getMembersJSX()}
                            </div>
                            <div className="giBtns">
                                <button onClick={closeModal} className="closeGroupInfo">Close</button>
                                <button onClick={saveGiModal} disabled={(groupNameInput == props.convo.name || !groupNameInput.trim()) && giPhoto == props.convo.picture} className="saveGroupInfo">Save</button>
                            </div>
                        </div>
                    </>
                }
            </>
        ) : null
    }
    return (
        <div>
            <div className='modalOverlay' onClick={closeModal}></div>
            {modals[props.modalOpen]}
        </div>
    );
}

export default Modal;