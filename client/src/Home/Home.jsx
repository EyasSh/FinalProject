import React, { useEffect, useState } from 'react';
import {Outlet, Navigate, useNavigate} from 'react-router-dom'
import Convo from '../Convo/Convo';
import Nav from '../Nav/Nav';
import { firebaseApp } from "../DB/FireBaseConf";
import{getAuth, onAuthStateChanged} from "firebase/auth"
import axios from "axios"
import {socket} from "../Services/socket";
import defaultPNG from "../Assets/Images/default.png"


function Home(props) {
    const Auth = getAuth(firebaseApp)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()
    const [authToken, setAuthToken] = useState(null)
    const [chats, setChats] = useState([])

    // wait for the user data before rendering the page
    onAuthStateChanged(Auth, async (user) => {
        setIsLoading(false)

        if (!user){
            navigate("/")
        } else {
            setAuthToken(await Auth.currentUser.getIdToken())
        }
    })

    const server = axios.create({
        baseURL: "http://localhost:5000/",
        timeout: "60000",
        headers: {"Authorization": authToken}
    })

    useEffect(() => {
        socket.on("createConvo", convo => {
            console.log("got something")
            convo.members.forEach(member => {
                member = JSON.parse(member)
                if (member.uid != Auth.currentUser.uid){
                    convo.name = member.name
                    convo.picture = member.picture ? member.picture : defaultPNG
                }
            })
            // convo.messages.push({
            //     sender: convo.createdBy,
            //     fromMe: false,
            //     content: "Created a conversation",
            //     createdAt: Date.now()
            // })

            // Check for duplicates
            var unique = true
            chats.forEach(chat => {
                if (convo.convoID == chat.convoID){
                    unique = false
                }
            })
            if (unique)
                setChats([...chats, convo]) // this is how you push to a state that is an array
        })

        if (!isLoading){
            //Load the existing conversations
            server.get("conversations")
            .then(res => {
                console.log(res)
                res.data.forEach(convo => {
                    convo.members.forEach(member => {
                        member = JSON.parse(member)
                        if (member.uid != Auth.currentUser.uid){
                            convo.name = member.name
                            convo.picture = member.picture ? member.picture : defaultPNG
                        }
                    })

                    // Check for duplicates
                    var unique = true
                    chats.forEach(chat => {
                        if (convo.convoID == chat.convoID){
                            unique = false
                        }
                    })
                    if (unique)
                        setChats([...chats, convo]) // this is how you push to a state that is an array
                })
            })
        }
        return () => {
            socket.off("createConvo")
        }
    })

    chats.map(chat => {
        chat.messages.map(msg => {
            if (msg.sender == Auth.currentUser.uid){
                msg.fromMe = true
            }
        })
    })

    const [activeConvo, setActiveConvo] = useState(null)
    if (!isLoading){
        return Auth.currentUser ? (
            <div>
                
                <Nav socket={socket} server={server} openConvo={setActiveConvo} chats={chats} />
                <Convo socket={socket} activeConvo={chats.find(convo => convo.convoID == activeConvo)}/>
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