import React, { useState } from 'react';
import "./Convo.css"
import {PhoneFilled, VideoCameraFilled, PaperClipOutlined, AudioTwoTone, RightCircleTwoTone} from '@ant-design/icons';


function Convo(props) {
    const [msgFeild, setMessageFeild] = useState("")
    const handleMsgChange = e =>{
        setMessageFeild(e.target.value.trim())
    }
    return (
        <div className='convoSection'>
            <div className="convoHeader">
                <img src="https://cdn.inflact.com/media/293676483_1084918885444539_5446438895038859389_n.webp?url=https%3A%2F%2Fscontent.cdninstagram.com%2Fv%2Ft51.2885-15%2F293676483_1084918885444539_5446438895038859389_n.webp%3Fstp%3Ddst-jpg_e35%26_nc_ht%3Dscontent.cdninstagram.com%26_nc_cat%3D103%26_nc_ohc%3DDCxPDOqo_X4AX_KThHw%26edm%3DAJBgZrYBAAAA%26ccb%3D7-5%26ig_cache_key%3DMjg4NDQ3MDMwNDQwNDY1Njc4Mw%253D%253D.2-ccb7-5%26oh%3D00_AT8J8LDChsJYLmG6a4F1HzCdu3Q1wU952rIQ4l4yaRGqzg%26oe%3D62F270DC%26_nc_sid%3D78c662&time=1659535200&key=d90cc87c4205cc0b6613c9a80abba39e" alt="" className="convoPicture" />
                <span className="convoName">Firas Sharary</span>
                <div className="convoHeaderBtns">
                    <span id="voiceCallBtn"><PhoneFilled /></span>
                    <span id="videoCallBtn"><VideoCameraFilled /></span>
                </div>
            </div>
            <div className="bubblesWrapper">
            </div>
            <div className="convoFooter">
                <span id="shareFileBtn"><PaperClipOutlined /></span>
                <input placeholder='Type a message...' type="text" className="msgInput" onChange={handleMsgChange} />
                {msgFeild === "" ? 
                    <span id="sendVCBtn"><AudioTwoTone twoToneColor={"blue"}/></span>
                    : <span id="sendMsgBtn"><RightCircleTwoTone twoToneColor={"blue"}/></span>
                }
                
                
            </div>
        </div>
    );
}

export default Convo;