import React, { useState } from 'react';
import "./Convo.css"
import {PhoneFilled, VideoCameraFilled, PaperClipOutlined, AudioTwoTone, RightCircleTwoTone} from '@ant-design/icons';
import Bubble from '../Bubble/Bubble';


function Convo(props) {
    const [msgFeild, setMessageFeild] = useState("")
    const handleMsgChange = e =>{
        setMessageFeild(e.target.value.trim())
    }
    return (
        <div className='convoSection'>
            {props.activeConvo ? 
                <>
                    <div className="convoHeader">
                        <img src={props.activeConvo.picture} alt="" className="convoPicture" />
                        <span className="convoName">{props.activeConvo.name}</span>
                        <div className="convoHeaderBtns">
                            <span id="voiceCallBtn"><PhoneFilled /></span>
                            <span id="videoCallBtn"><VideoCameraFilled /></span>
                        </div>
                    </div>
                    <div className="bubblesWrapper">
                        {props.activeConvo ? <Bubble activeChat={props.activeConvo}/> : <span>start a convo</span>}
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
                "start a convo"
            }

        </div>
    );
}

export default Convo;