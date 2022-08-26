import React, { useState } from 'react';
import {Outlet, Navigate, useNavigate} from 'react-router-dom'
import Convo from '../Convo/Convo';
import Nav from '../Nav/Nav';
import { firebaseApp } from "../DB/FireBaseConf";
import{getAuth, createUserWithEmailAndPassword, onAuthStateChanged} from "firebase/auth"


function Home(props) {
    const Auth = getAuth(firebaseApp)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    onAuthStateChanged(Auth, (user) => {
        setIsLoading(false)

        if (!user){
            navigate("/")
        }
    })

    // SAMPLE DATA
    const myId = "eyas_sharary"
    const chats = [
        {
            name: "Firas Sharary",
            recipientId: "firas_sharary",
            convoID: "firas_sharary,eyas_sharay",
            picture: "https://cdn.inflact.com/media/293676483_1084918885444539_5446438895038859389_n.webp?url=https%3A%2F%2Fscontent.cdninstagram.com%2Fv%2Ft51.2885-15%2F293676483_1084918885444539_5446438895038859389_n.webp%3Fstp%3Ddst-jpg_e35%26_nc_ht%3Dscontent.cdninstagram.com%26_nc_cat%3D103%26_nc_ohc%3DDCxPDOqo_X4AX_KThHw%26edm%3DAJBgZrYBAAAA%26ccb%3D7-5%26ig_cache_key%3DMjg4NDQ3MDMwNDQwNDY1Njc4Mw%253D%253D.2-ccb7-5%26oh%3D00_AT8J8LDChsJYLmG6a4F1HzCdu3Q1wU952rIQ4l4yaRGqzg%26oe%3D62F270DC%26_nc_sid%3D78c662&time=1659535200&key=d90cc87c4205cc0b6613c9a80abba39e",
            messages: [
                {
                    sender: "firas_sharary",
                    fromMe: false,
                    content: "Hi",
                    read: false,
                    createdAt: 1659600598233
                },
                {
                    sender: "eyas_sharary",
                    fromMe: false,
                    content: "Sup bro, how are u doing?!",
                    read: false,
                    createdAt: 1659640598233
                },
                {
                    sender: "firas_sharary",
                    fromMe: false,
                    content: "I'm good, hbu?",
                    read: false,
                    createdAt: 1659640598233
                },
                {
                    sender: "eyas_sharary",
                    fromMe: false,
                    content: "Nice to hear, today was a hard day, I was at work all day long, then we went on a trip to the sea, the wind felt awesome!",
                    read: false,
                    createdAt: 1659640598233
                }
            ]           
        }
    ]

    chats.map(chat => {
        chat.messages.map(msg => {
            if (msg.sender == myId){
                msg.fromMe = true
            }
        })
    })

    const [activeConvo, setActiveConvo] = useState(null)
    if (!isLoading){
        return Auth.currentUser ? (
            <div>
                
                <Nav openConvo={setActiveConvo} chats={chats} />
                <Convo activeConvo={chats.find(convo => convo.convoID == activeConvo)}/>
                <Outlet></Outlet>
            </div>
        ) : (
            <Navigate to="/"/>
        )    
    } else {
        return ""
    }
}

export default Home;