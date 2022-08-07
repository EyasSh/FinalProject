import React from 'react';
import "./Bubble.css"
function Bubble(props) {

    const activeChat = props.activeChat


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

            {activeChat.messages.map( msg => {
                return <p className={msg.fromMe ? "from-me" : "from-them"}>{msg.content}</p>
            })}
        </div>
    );
}

export default Bubble;