import React, { useState, useRef, useEffect } from 'react';
import "./Convo.css"
import {PhoneFilled, VideoCameraFilled, PaperClipOutlined, AudioTwoTone, RightCircleTwoTone, CheckCircleTwoTone, CloseCircleTwoTone} from '@ant-design/icons';
import Bubble from '../Bubble/Bubble';
import * as E2E from "../Services/E2E"
import Timer from '../Timer/Timer';
import * as VC from "../Services/voiceRecorder"

//assets
import chatImg from "../Assets/Images/chat.png"
import Modal from '../Modal/Modal';
import { uploadFile } from '../Services/misc';

function Convo(props) {
    const [msgFeild, setMessageFeild] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const sendBtn = useRef()
    const msgBox = useRef()
    const [voiceMsgActive, setVoiceMsgActive] = useState(false)

    const handleMsgChange = e =>{
        setMessageFeild(e.target.value)
    }

    const toggleHeaderExpantion = toggle => {
        if (!props.activeConvo.group && toggle) return
        const header = document.querySelector(".convoHeader")
        const pic = document.querySelector(".convoPicture")
        const name = document.querySelector(".convoName")
        const groupControlBtns = document.querySelector(".groupControlBtns")
        const groupInfo = document.querySelector(".groupInfo")
        const leaveGroup = document.querySelector(".leaveGroup")
        
        if (toggle){
            header?.classList.add("headerEnlarged")
            pic?.classList.add("picEnlarged")
            name?.classList.add("profileTitle")
            groupControlBtns?.classList.add("gBtnsEnabled")
        } else {
            header?.classList.remove("headerEnlarged")
            pic?.classList.remove("picEnlarged")
            name?.classList.remove("profileTitle")
            groupControlBtns?.classList.remove("gBtnsEnabled")
        }
    }

    const toggleVoiceUI = toggle => {
        const voiceMessagBtn = document.getElementById("sendVCBtn")
        const msgInput = document.querySelector(".msgInput")
        const sendVCCtrls = document.querySelector(".sendVCCtrls")
        const shareFileBtn = document.getElementById("shareFileBtn")

        if (toggle) {
            voiceMessagBtn.classList.add("hidden")
            msgInput.classList.add("hidden")
            sendVCCtrls?.classList.remove("hidden")
            shareFileBtn.classList.add("hidden")
        } else {
            voiceMessagBtn.classList.remove("hidden")
            msgInput.classList.remove("hidden")
            sendVCCtrls?.classList.add("hidden")
            shareFileBtn.classList.remove("hidden")
        }
    }

    const startVoiceMessage = async () => {
        setVoiceMsgActive(true)
        toggleVoiceUI(true)
        msgBox.current.value = ""
        setMessageFeild("")
        VC.recordAudio() // starts the recording
    }

    const saveVoiceMessage = async () => {
        setVoiceMsgActive(false)
        toggleVoiceUI(false)
        sendVoiceMessage(await VC.saveRecording())
    }

    const cancelVoiceMessage = () => {
        setVoiceMsgActive(false)
        toggleVoiceUI(false)
        VC.cancelRecording()
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
        setMessageFeild("")
        const encryptedText = await E2E.encryptText(msgFeild, props.activeConvo.derivedKey)
        props.socket.emit("sendMessage", props.Auth.currentUser, encryptedText, props.activeConvo.convoID)
    }

    const sendVoiceMessage = (data) => {
        uploadFile(data, `voiceMsg/${props.activeConvo.convoID}`, false)
        .then(async url => {
            const voice = {
                url: url,
                type: "audio/ogg; codecs=opus"
            }
            const encryptedVoice = await E2E.encryptText(JSON.stringify(voice), props.activeConvo.derivedKey)
            props.socket.emit("sendMessage", props.Auth.currentUser, "", props.activeConvo.convoID, null, encryptedVoice)
        })
    }

    const openFileModal = () => {
        setModalOpen("sendFile")
        msgBox.current.value = ""
        setMessageFeild("")
    }

    const leaveGroup = () => {
        if (props.activeConvo.group){
            props.socket.emit("leaveGroup", props.Auth.currentUser, props.activeConvo.convoID)
        }
    }

    const amIAdmin = () => {
        if(props.activeConvo?.admins?.includes(props.Auth.currentUser.uid)){
            return true
        }
        return false
        // There is also another check on the backend
    }

    return (
        <div className='convoSection'>
            {props.activeConvo ?
                <>
                    {toggleHeaderExpantion(false)}
                    <div className="convoHeader">
                        <img src={props.activeConvo.picture} alt="" className="convoPicture" /><span className="convoName" onClick={() => toggleHeaderExpantion(true)}>{props.activeConvo.name}</span>
                        <div className="convoHeaderBtns">
                            <span id="voiceCallBtn"><PhoneFilled /></span>
                            <span id="videoCallBtn"><VideoCameraFilled /></span>
                        </div>
                        <div className="groupControlBtns">
                            <button className="groupInfo" onClick={() => setModalOpen("groupInfo")}>Group Info</button>
                            <button className="leaveGroup" onClick={leaveGroup}>Leave Group</button>
                        </div>
                    </div>
                    <div className="bubblesWrapper">
                        {
                            props.activeConvo ? 
                            <>
                                <Bubble allowedImgTypes={props.allowedImgTypes} activeChat={props.activeConvo}/>
                                {modalOpen ? <Modal isConvoAdmin={amIAdmin()} allowedImgTypes={props.allowedImgTypes} socket={props.socket} Auth={props.Auth} modalOpen={modalOpen} setModalOpen={setModalOpen} convo={props.activeConvo}/> : ""}
                            </>
                            :
                            <div className="noConvoSelected">
                                <img src={chatImg} alt="" />
                                <h1>End to end encrypted chat!</h1>
                                <p>Create a new conversation or select an existing one to start chatting with your partners securely.</p>
                            </div> 
                        }
                    </div>
                    <div className="convoFooter">
                        <span id="shareFileBtn" onClick={openFileModal}><PaperClipOutlined /></span>
                        <input ref={msgBox} placeholder='Type a message...' type="text" className="msgInput" onChange={handleMsgChange} />
                        {msgFeild.trim() === "" ? 
                            <span onClick={startVoiceMessage} id="sendVCBtn"><AudioTwoTone twoToneColor={"blue"}/></span>
                            : <span onClick={sendMessage} id="sendMsgBtn" ref={sendBtn}><RightCircleTwoTone twoToneColor={"blue"}/></span>
                        }
                        <div className='sendVCCtrls hidden'>
                            <span onClick={cancelVoiceMessage} id='cancelVC'><CloseCircleTwoTone twoToneColor={"red"} /></span>
                                {voiceMsgActive ?<Timer /> : ""}
                            <span id='sendVC' onClick={saveVoiceMessage}><CheckCircleTwoTone twoToneColor={"#00CC00"} /></span>
                        </div>
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