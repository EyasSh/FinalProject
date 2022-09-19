import React, { useEffect, useRef } from 'react';
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

    activeChat.messages.forEach( msg => {
        if (typeof msg.attatchment == "string"){
            msg.attatchment = isJSON(msg.attatchment)
        }
        const isURL = urlRegex.test(msg.attatchment?.url)
        if (!isURL){
            messagesJSX.push(<p className={msg.fromMe ? "from-me" : "from-them"}>{msg.content}</p>)
        } else if (props.allowedImgTypes.includes(msg.attatchment?.data.type)){
            loadImage(msg.attatchment.url)
            messagesJSX.push(
                <p className={msg.fromMe ? "from-me" : "from-them"}>
                    <img className='imageAttatchment' src={msg.attatchment.url} alt="" />
                    <hr></hr>
                    {msg.content}
                </p>
            )
        } else {
            messagesJSX.push(
                <p className={msg.fromMe ? "from-me" : "from-them"}>
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