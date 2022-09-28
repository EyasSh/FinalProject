import React, { useEffect, useRef } from 'react';
import Player from '../Player/Player';
import { isJSON } from '../Services/misc';
import "./Bubble.css"
function Bubble(props) {

    const activeChat = props.activeChat
    const bottomRef = useRef()
    const messagesJSX = []
    const urlRegex = /(https?:\/\/[^\s]+)/;

    const scrollToBottom = () => {
        document.querySelector(".bubbleWrapper").scrollTop = document.querySelector(".bubbleWrapper").scrollHeight
    }

    useEffect(() => {
        scrollToBottom()
    })
    const allMessages = [...activeChat.messages, ...activeChat.systemMessages]
    allMessages.sort((a, b) => {
        if (a.createdAt > b.createdAt) return 1;
        return -1
    })
    allMessages.forEach( msg => {
        if (typeof msg.attatchment == "string"){
            msg.attatchment = isJSON(msg.attatchment)
        }
        if (typeof msg.voice == "string"){
            msg.voice = isJSON(msg.voice)
        }
        const isURL = urlRegex.test(msg.attatchment?.url)
        const isVoiceUrl = urlRegex.test(msg.voice?.url)
        if (!isURL){
            if (!isVoiceUrl){
                if(msg.systemMessage) {
                    messagesJSX.push(
                        <p className='systemMessage'>
                            {msg.content}
                        </p>
                    )
                } else {
                    messagesJSX.push(
                        <p key={msg.createdAt} className={msg.fromMe ? "from-me" : "from-them"}>
                            {msg.group ?<><span className='messageName'>{msg.name}</span> <br></br></> : ""}
                            {msg.content}
                        </p>
                    )
                }
            } else {
                messagesJSX.push(
                    <p key={msg.createdAt} className={msg.fromMe ? "from-me" : "from-them"}>
                        {msg.group ?<><span className='messageName'>{msg.name}</span> <br></br></> : ""}
                        <Player style={msg.fromMe ? {color: "white"} : {color: "black"}} src={msg.voice?.url} type={msg.voice.type}/>
                    </p>
                )
            }
        } else if (props.allowedImgTypes.includes(msg.attatchment?.data.type)){
            loadImage(msg.attatchment.url)
            messagesJSX.push(
                <p key={msg.createdAt} className={msg.fromMe ? "from-me" : "from-them"}>
                    {msg.group ?<><span className='messageName'>{msg.name}</span> <br></br></> : ""}
                    <img className='imageAttatchment' src={msg.attatchment.url} alt="" />
                    <hr></hr>
                    {msg.content}
                </p>
            )
        } else {
            messagesJSX.push(
                <p key={msg.createdAt} className={msg.fromMe ? "from-me" : "from-them"}>
                    {msg.group ?<><span className='messageName'>{msg.name}</span> <br></br></> : ""}
                    File: <a href={msg.attatchment.url}>{msg.attatchment.data?.name}</a>
                    <br></br>
                    <hr></hr>
                    {msg.content}
                </p>
            )
        }
    })

    return (
        <div className='bubbleWrapper'>
            {/* <p className="from-them">It was loud. We just laid there and said &ldquo;is this an earthquake? I think this is an earthquake.&rdquo;</p>
            <p className="from-me">Like is this an earthquake just go back to sleep</p>
            <p className="from-them">It&rsquo;s more like &ldquo;this is an earthquake. Check the Internet. Yup. Earthquake. This is the size. This is the epicenter. Check social media. Make sure the East Coast knows I&rsquo;m alive. Okay, try and go back to sleep.&rdquo;</p>
            <p className="from-me no-tail emoji">👍🏻</p>
            <p className="from-me">Glad you&rsquo;re safe</p>
            <p className='from-them'>
                <img src='https://media.istockphoto.com/photos/powerful-tornado-and-storm-with-lightning-picture-id1271509006?b=1&k=20&m=1271509006&s=170667a&w=0&h=xJpY6cXHLI3rimXCQSyen0o5g4BG2H0BpHK9N_gaUdU='></img>
            </p> */}

            {messagesJSX}
            <div ref={bottomRef}></div>
        </div>
    );
}

const loadImage = url => {
    const image = new Image()
    image.onload = () => {
        document.querySelector(".bubbleWrapper").scrollTop = document.querySelector(".bubbleWrapper").scrollHeight
    }
    image.src = url
}


export default Bubble;