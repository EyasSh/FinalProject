import React, { useState, useRef, useEffect } from 'react';
import "./Convo.css"
import {PhoneFilled, VideoCameraFilled, PaperClipOutlined, AudioTwoTone, RightCircleTwoTone} from '@ant-design/icons';
import Bubble from '../Bubble/Bubble';
import * as E2E from "../Services/E2E"

//assets
import chatImg from "../Assets/Images/chat.png"

function Convo(props) {
    const [msgFeild, setMessageFeild] = useState("")
    const sendBtn = useRef()
    const msgBox = useRef()

    const handleMsgChange = e =>{
        setMessageFeild(e.target.value)
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

    useEffect(() => {
        //Listen for Enter key as an alternative to the Login button click
        const keyDownHandler = event => {    
          if (event.key === 'Enter') {
            event.preventDefault();
            if (msgFeild.trim == "") return
            sendBtn.current.click()
          }
        };
        document.addEventListener('keydown', keyDownHandler);
    
        return () => {
            //cleanup the listener on component unmount
          document.removeEventListener('keydown', keyDownHandler); // cleanup
        };
    }, []);

    const sendMessage = async e => {
        e.preventDefault()
        if (msgFeild.trim == "") return
        msgBox.current.value = ""
        const encryptedText = await E2E.encryptText(msgFeild, props.activeConvo.derivedKey)
        props.socket.emit("sendMessage", props.Auth.currentUser, encryptedText, props.activeConvo.convoID)
    }

    return (
        <div className='convoSection'>
            {props.activeConvo ? 
                <>
                    <div className="convoHeader">
                        <img src={props.activeConvo.picture} alt="" className="convoPicture" onClick={() => toggleUserProfile(true)} /><span className="convoName" onClick={() => toggleUserProfile(true)}>{props.activeConvo.name}</span>
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
                        <input ref={msgBox} placeholder='Type a message...' type="text" className="msgInput" onChange={handleMsgChange} />
                        {msgFeild.trim() === "" ? 
                            <span id="sendVCBtn"><AudioTwoTone twoToneColor={"blue"}/></span>
                            : <span onClick={sendMessage} id="sendMsgBtn" ref={sendBtn}><RightCircleTwoTone twoToneColor={"blue"}/></span>
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