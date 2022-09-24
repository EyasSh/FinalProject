import React, { Component, useState } from 'react';
import {useNavigate} from "react-router-dom";
import "./Nav.css"
import {SearchOutlined, ArrowLeftOutlined, CommentOutlined} from '@ant-design/icons';
import { format } from 'timeago.js';
import { firebaseApp } from "../DB/FireBaseConf";
import {getAuth, onAuthStateChanged} from "firebase/auth"
import defaultPNG from "../Assets/Images/default.png"
import Modal from "../Modal/Modal"
import { isJSON } from '../Services/misc';

export default function Nav(props) {
    const Auth = getAuth(firebaseApp)
    const [searchFeild, setSearchFeild] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [profPic, setProfPic] = useState(defaultPNG)

    const navigate = useNavigate();
    // if there is no user authenticated redirect to login page
    onAuthStateChanged(Auth, (user) => {
        if (!user){
            navigate("/")
        } else {
            // we reload the user object to make up for the delay of data after signing up
            user.reload().then(()=> {
                setDisplayName(user.displayName)
                setEmail(user.email)
                setProfPic(user.photoURL == 0 || !user.photoURL ? defaultPNG : user.photoURL)
            })
        }
    })
    
    const handleConvoSearch = e => {
        setSearchFeild(e.target.value)
    }

    // Get the chats and render all of the ones that match the search
    const chatsJSX = []
    const chats = props.chats
    const getChatString = (index) => {
        const chat = chats[index]
        const lastMsg = chat.messages[chat.messages.length -1]
        const currAttatchment = isJSON(lastMsg.attatchment)
        var str = ""
        if (chat.group && !lastMsg.fromMe){
            str += lastMsg.name + ":"
        }
        if (currAttatchment?.data){
            if (props.allowedImgTypes.includes(currAttatchment.data?.type)){
                str += "📷"
            } else {
                str += "📄"
            }
        }
        if (!lastMsg.voice || lastMsg.voice.includes("error decrypting")){
            str += ` ${lastMsg.content}`
        } else {
            str += "🎙️ Voice Message"
        }
        return str
    }
    if (searchFeild.trim() === "") {
        for (let index = 0; index < chats.length; index++) {
            const chat = chats[index];
            chatsJSX.push(
                <div className="chat" onClick={() => props.openConvo(chat.convoID)}>
                    <img src={chat.picture} alt="" className="profilePic" />
                    <span className='contactName'>{chat.name}</span>
                    {chat.messages[chat.messages.length -1] ?
                        <>
                            <span className='date'>{format(chat.messages[chat.messages.length -1].createdAt)}</span>
                            <span className='lastMessage'>{(chat.messages[chat.messages.length -1].fromMe ? "You: " : "") + getChatString(index)}</span>
                        </>
                    :
                        <>
                            <span className='date'>{format(chat.createdAt)}</span>
                            <span className='lastMessage'>Conversation has been created!</span>
                        </>
                    }
                </div>
            )
        }
    } else {
        for (let index = 0; index < chats.length; index++) {
            const chat = chats[index];
            if (!chat.name.toLowerCase().includes(searchFeild.toLowerCase())) continue;
            chatsJSX.push(
                <div className="chat" onClick={() => props.openConvo(chat.convoID)}>
                    <img src={chat.picture} alt="" className="profilePic" />
                    <span className='contactName'>{chat.name}</span>
                    {chat.messages[chat.messages.length -1] ?
                        <>
                            <span className='date'>{format(chat.messages[chat.messages.length -1].createdAt)}</span>
                            <span className='lastMessage'>{(chat.messages[chat.messages.length -1].fromMe ? "You: " : "") + getChatString(index)}</span>
                        </>
                    :
                        <>
                            <span className='date'>{format(chat.createdAt)}</span>
                            <span className='lastMessage'>Conversation has been created!</span>
                        </>
                    }
                </div>
            )
        }
    }
    // END OF SAMPLE DATA

    // Manipulate DOM classes for the personal profile open effects
    const openProfile = e => toggleProfile(true)
    const closeProfile = e => toggleProfile(false)

    const toggleProfile = open =>{
        const picture = document.querySelector(".profileBtn")
        const header = document.querySelector(".header")
        const chatsWrapper = document.querySelector(".chatsWrapper")
        const profileInfo = document.querySelector(".profileInfo")
        const profileBackButton = document.querySelector(".profileBackButton")
        const logoutBtn = document.querySelector(".logOut")
        const editBtn=document.querySelector(".Edit-Prof")

        if (open){
            header.classList.add("hidden")
            chatsWrapper.classList.add("hidden")
            picture.classList.add("profileBtnOpen")
            profileInfo.classList.remove("hidden")
            profileBackButton.classList.remove("hiddenLeft")
            logoutBtn.classList.remove("hidden")
            editBtn.classList.remove("hidden")

        } else {
            header.classList.remove("hidden")
            chatsWrapper.classList.remove("hidden")
            picture.classList.remove("profileBtnOpen")
            profileInfo.classList.add("hidden")
            profileBackButton.classList.add("hiddenLeft")
            logoutBtn.classList.add("hidden")
            editBtn.classList.add("hidden")
        }
    }

    //Forms prompts (Modals)
    const toggleModal = (modalToOpen) => {
        //modalToOpen options: newConvo, editProfile
        if (typeof modalToOpen == "string"){
            setModalOpen(modalToOpen)
        } else {
            setModalOpen(false)
        }
    }

    return (
      <div className='Nav'>
        <img src={profPic} alt="" className="profileBtn" onClick={openProfile} />
        <div className="header">
            <h1 className="chatsTitle">Chats</h1>
            <div className="searchBar">
                <span className='searchIcon'>
                    <SearchOutlined />
                </span>
                <input placeholder='Search...' type="text" className="searchInput" onChange={handleConvoSearch} />
            </div>
        </div>

        <div className="chatsWrapper">
            {chatsJSX}
            <span className="createConvo" onClick={() => toggleModal("newConvo")}><CommentOutlined /></span>
        </div>

        {/* PROFILE */}
        <div className="profile">
            <span className="profileBackButton hiddenLeft" onClick={closeProfile}><ArrowLeftOutlined /></span>
            <div className="profileInfo hidden">
                <span className="profileName">Name: {displayName}</span>
                <span className="profileId">Email: {email}</span>
            </div>
            <button onClick={() => toggleModal("editProfile")} className='Edit-Prof hidden'>Edit Profile</button>
            <button onClick={(e) => Auth.signOut()} className="logOut hidden">Log Out</button>
        </div>

        {/* Prompts */}
        {modalOpen ? <Modal keyData={props.keyData} allowedImgTypes={props.allowedImgTypes} socket={props.socket} server={props.server} setProfPic={setProfPic} profPic={profPic} modalOpen={modalOpen} setModalOpen={setModalOpen} chats={chats} /> : ""}
      </div>
    );
}
