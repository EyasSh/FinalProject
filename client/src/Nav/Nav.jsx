import React, { Component, useState } from 'react';
import "./Nav.css"
import {SearchOutlined, ArrowLeftOutlined, CommentOutlined} from '@ant-design/icons';
import { format } from 'timeago.js';

export default function Nav(props) {
    const [searchFeild, setSearchFeild] = useState("")
    const [convoModalOpen, setConvoModalOpen] = useState(false)
    const [checkedContacts, setCheckedContacts] = useState([])
    const [newConvoSearch, setNewConvoSearch] = useState("")
    
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
        if (open){
            header.classList.add("hidden")
            chatsWrapper.classList.add("hidden")
            picture.classList.add("profileBtnOpen")
            profileInfo.classList.remove("hidden")
            profileBackButton.classList.remove("hiddenLeft")
        } else {
            header.classList.remove("hidden")
            chatsWrapper.classList.remove("hidden")
            picture.classList.remove("profileBtnOpen")
            profileInfo.classList.add("hidden")
            profileBackButton.classList.add("hiddenLeft")
        }
    }

    //New conversation prompt functions
    const toggleConvoModal = (event) => {
        event.stopPropagation();
        setConvoModalOpen(!convoModalOpen)
        setCheckedContacts([])
    }

    const getExistingConvos = () =>{
        const convosList = []
        chats.map(chat => {
            if (chat.recipientId){ // This checks if the conversation is a group chat or a private chat
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
            <div className='convoModalOverlay' onClick={toggleConvoModal}></div>
            <div className="convoModal">
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
                <button disabled={checkedContacts[0] == null} className="submitCreateConvo">Create Conversation</button>
            </div>
        </>
    )

    return (
      <div className='Nav'>
        <img src="https://instadownloader.co/view_photo.php?url=https%3A//instagram.fsdv1-2.fna.fbcdn.net/v/t51.2885-15/292586271_583938633454985_2981626577624270745_n.webp%3Fstp%3Ddst-jpg_e35%26_nc_ht%3Dinstagram.fsdv1-2.fna.fbcdn.net%26_nc_cat%3D105%26_nc_ohc%3D2Heioy5npy4AX_Ik2Th%26edm%3DAABBvjUBAAAA%26ccb%3D7-5%26ig_cache_key%3DMjg3ODU0NDc3MzU5NDkxOTE0NQ%253D%253D.2-ccb7-5%26oh%3D00_AT9wYxwOyXsIQJYA0JOJ3tFQtMJl0VcLaYQ_0Q-vo3gTVw%26oe%3D62F2CEDB%26_nc_sid%3D83d603" alt="" className="profileBtn" onClick={openProfile} />
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
                <span className="profileName">Name: Eyas Sharary</span>
                <span className="profileId">ID: eyas_sharary</span>
            </div>
        </div>

        {/* New Conversation Prompt */}
        {convoModalOpen ? convoModal : ""}
      </div>
    );
}
