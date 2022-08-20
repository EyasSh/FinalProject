import React, { useState } from 'react';
import "./Convo.css"
import {PhoneFilled, VideoCameraFilled, PaperClipOutlined, AudioTwoTone, RightCircleTwoTone} from '@ant-design/icons';
import Bubble from '../Bubble/Bubble';

//assets
import chatImg from "../Assets/Images/chat.png"

function Convo(props) {
    const [msgFeild, setMessageFeild] = useState("")

    const handleMsgChange = e =>{
        setMessageFeild(e.target.value.trim())
    }

    const toggleUserProfile = toggle => {
        const header = document.querySelector(".convoHeader")
        const pic = document.querySelector(".convoPicture")
        const name = document.querySelector(".convoName")
        
        if (toggle){
            header.classList.add("headerEnlarged")
            pic.classList.add("picEnlarged")
            name.classList.add("profileTitle")
        } else {
            header.classList.remove("open")
            pic.classList.remove("enlarged")
            name.classList.remove("profileTitle")
        }
    }
    return (
        <div className='convoSection'>
            {props.activeConvo ? 
                <>
                    <div className="convoHeader">
                        <img src={props.activeConvo.picture} alt="" className="convoPicture" onClick={() => toggleUserProfile(true)} /><span className="convoName" onClick={() => toggleUserProfile(true)}>{props.activeConvo.name}</span>
                        <p className='convoUID' >@{props.activeConvo.recipientId}</p> 
                        <div className="convoHeaderBtns">
                            <span id="voiceCallBtn"><PhoneFilled /></span>
                            <span id="videoCallBtn"><VideoCameraFilled /></span>
                        </div>
                    </div>
                    <div className="bubblesWrapper">
                        {
                            props.activeConvo ? <Bubble activeChat={props.activeConvo}/>
                            :
                            <div className="noConvoSelected">
                                <img src={chatImg} alt="" />
                                <h1>End to end encrypted chat!</h1>
                                <p>Create a new conversation or select an existing one to start chatting with your partners securely.</p>
                            </div> 
                        }
                    </div>
                    <div className="convoFooter">
                        <span id="shareFileBtn"><PaperClipOutlined /></span>
                        <input placeholder='Type a message...' type="text" className="msgInput" onChange={handleMsgChange} />
                        {msgFeild === "" ? 
                            <span id="sendVCBtn"><AudioTwoTone twoToneColor={"blue"}/></span>
                            : <span id="sendMsgBtn"><RightCircleTwoTone twoToneColor={"blue"}/></span>
                        }
                    </div>
                </> : 
                <div className="noConvoSelected">
                    <img src={chatImg} alt="" />
                    <h1>End to end encrypted chat!</h1>
                    <p>Create a new conversation or select an existing one to start chatting with your partners securely.</p>
                </div>
            }

        </div>
    );
}

export default Convo;