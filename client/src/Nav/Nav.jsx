import React, { Component, useState } from 'react';
import "./Nav.css"
import {SearchOutlined, ArrowLeftOutlined} from '@ant-design/icons';
import { format } from 'timeago.js';

export default function Nav(props) {
    const [searchFeild, setSearchFeild] = useState("")

    const handlechange = e => {
        setSearchFeild(e.target.value)
    }

    


    const chatsJSX = []
    const chats = props.chats
    if (searchFeild.trim() === "") {
        for (let index = 0; index < chats.length; index++) {
            const chat = chats[index];
            chatsJSX.push(
                <div className="chat">
                    <img src={chat.picture} alt="" className="profilePic" />
                    <span className='contactName'>{chat.name}</span>
                    <span className='date'>{format(chat.messages[chat.messages.length -1].createdAt)}</span>
                    <span className='lastMessage'>{chat.messages[chat.messages.length -1].content}</span>
                </div>
            )
        }
    } else {
        for (let index = 0; index < chats.length; index++) {
            const chat = chats[index];
            if (!chat.name.toLowerCase().includes(searchFeild.toLowerCase())) continue;
            chatsJSX.push(
                <div className="chat">
                    <img src={chat.picture} alt="" className="profilePic" />
                    <span className='contactName'>{chat.name}</span>
                    <span className='date'>{format(chat.messages[chat.messages.length -1].createdAt)}</span>
                    <span className='lastMessage'>{chat.messages[chat.messages.length -1].content}</span>
                </div>
            )
        }
    }

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
        </div>

        <div className="profile">
            <span className="profileBackButton hiddenLeft" onClick={closeProfile}><ArrowLeftOutlined /></span>
            <div className="profileInfo hidden">
                <span className="profileName">Name: Eyas Sharary</span>
                <span className="profileId">ID: eyas_sharary</span>
            </div>
        </div>
      </div>
    );
}
