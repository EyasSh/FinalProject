import React, { Component, useState } from 'react';
import {useNavigate} from "react-router-dom";
import "./Nav.css"
import {SearchOutlined, ArrowLeftOutlined, CommentOutlined} from '@ant-design/icons';
import { format } from 'timeago.js';
import { firebaseApp } from "../DB/FireBaseConf";
import {getAuth, signInWithEmailAndPassword, onAuthStateChanged} from "firebase/auth"
import defaultPNG from "../Assets/Images/default.png"


export default function Nav(props) {
    const Auth = getAuth(firebaseApp)
    const [searchFeild, setSearchFeild] = useState("")
    const [convoModalOpen, setConvoModalOpen] = useState(false)
    const [checkedContacts, setCheckedContacts] = useState([])
    const [newConvoSearch, setNewConvoSearch] = useState("")
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [profPic, setProfPic] = useState(defaultPNG)

    const navigate = useNavigate();
    onAuthStateChanged(Auth, (user) => {
        if (!user){
            navigate("/")
        } else {
            // we relaod the user object to make up for the delay of data after signing up
            user.reload().then(()=> {
                setDisplayName(user.displayName)
                setEmail(user.email)
                setProfPic(user.photoURL? user.photoURL : defaultPNG)
            })
        }
    })
    
    const handlechange = e => {
        setSearchFeild(e.target.value)
    }

    const handleNewConvoSearch = e => {
        setNewConvoSearch(e.target.value)
    }

    const chatsJSX = []
    const chats = props.chats
    if (searchFeild.trim() === "") {
        for (let index = 0; index < chats.length; index++) {
            const chat = chats[index];
            chatsJSX.push(
                <div className="chat" onClick={() => props.openConvo(chat.convoID)}>
                    <img src={chat.picture} alt="" className="profilePic" />
                    <span className='contactName'>{chat.name}</span>
                    <span className='date'>{format(chat.messages[chat.messages.length -1].createdAt)}</span>
                    <span className='lastMessage'>{(chat.messages[chat.messages.length -1].fromMe ? "You: " : "") + chat.messages[chat.messages.length -1].content}</span>
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
                    <span className='date'>{format(chat.messages[chat.messages.length -1].createdAt)}</span>
                    <span className='lastMessage'>{(chat.messages[chat.messages.length -1].fromMe ? "You: " : "") + chat.messages[chat.messages.length -1].content}</span>
                </div>
            )
        }
    }
    // END OF SAMPLE DATA
    const openProfile = e => toggleProfile(true)
    const closeProfile = e => toggleProfile(false)

    const toggleProfile = open =>{
        const picture = document.querySelector(".profileBtn")
        const header = document.querySelector(".header")
        const chatsWrapper = document.querySelector(".chatsWrapper")
        const profileInfo = document.querySelector(".profileInfo")
        const profileBackButton = document.querySelector(".profileBackButton")
        const logoutBtn = document.querySelector(".logOut")

        if (open){
            header.classList.add("hidden")
            chatsWrapper.classList.add("hidden")
            picture.classList.add("profileBtnOpen")
            profileInfo.classList.remove("hidden")
            profileBackButton.classList.remove("hiddenLeft")
            logoutBtn.classList.remove("hidden")
        } else {
            header.classList.remove("hidden")
            chatsWrapper.classList.remove("hidden")
            picture.classList.remove("profileBtnOpen")
            profileInfo.classList.add("hidden")
            profileBackButton.classList.add("hiddenLeft")
            logoutBtn.classList.add("hidden")
        }
    }

    //New conversation prompt functions
    const toggleConvoModal = (event) => {
        
        setConvoModalOpen(!convoModalOpen)
        setCheckedContacts([])
    }

    const getExistingConvos = () =>{
        const convosList = []
        chats.map(chat => {
            if (chat.recipientId){ 
                // This checks if the conversation is a group chat or a private chat
                // we only want private chats
                //we also need to handle search bar
                if (newConvoSearch.trim == ""){
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

    const convoModal = (
        <>
            <div className='modalOverlay' onClick={toggleConvoModal}></div>
            <div className="modal" style={{
                width: "500px",
                height: "300px"                
            }}>
                <span className="exitBtn" onClick={toggleConvoModal}>x</span>
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
    );

    const epModal = ( // ep stands for edit profile
        <>
        
        </>
    );
    return (
      <div className='Nav'>
        <img src={profPic} alt="" className="profileBtn" onClick={openProfile} />
        <div className="header">
            <h1 className="chatsTitle">Chats</h1>
            <div className="searchBar">
                <span className='searchIcon'>
                    <SearchOutlined />
                </span>
                <input placeholder='Search...' type="text" className="searchInput" onChange={handlechange} />
            </div>
        </div>

        <div className="chatsWrapper">
            {chatsJSX}
            <span className="createConvo" onClick={toggleConvoModal}><CommentOutlined /></span>
        </div>

        {/* PROFILE */}
        <div className="profile">
            <span className="profileBackButton hiddenLeft" onClick={closeProfile}><ArrowLeftOutlined /></span>
            <div className="profileInfo hidden">
                <span className="profileName">Name: {displayName}</span>
                <span className="profileId">Email: {email}</span>
            </div>
            <button onClick={(e) => Auth.signOut()} className="logOut hidden">Log Out</button>
        </div>

        {/* New Conversation Prompt */}
        {convoModalOpen ? convoModal : ""}
      </div>
    );
}
