import React, { useEffect, useState } from 'react';
import {Outlet, Navigate, useNavigate} from 'react-router-dom'
import Convo from '../Convo/Convo';
import Nav from '../Nav/Nav';
import { firebaseApp } from "../DB/FireBaseConf";
import{getAuth, onAuthStateChanged} from "firebase/auth"
import axios from "axios"
import {socket} from "../Services/socket";
import defaultPNG from "../Assets/Images/default.png"
import * as E2E from "../Services/E2E"


function Home(props) {
    const Auth = getAuth(firebaseApp)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()
    const [authToken, setAuthToken] = useState(null)
    const [chats, setChats] = useState([])
    const [sentPubKey, setSentPubKey] = useState(false)

    const server = axios.create({
        baseURL: "http://localhost:5000/",
        timeout: "60000",
        headers: {"Authorization": authToken}
    })

    // wait for the user data before rendering the page
    onAuthStateChanged(Auth, async (user) => {
        setIsLoading(false)

        if (!user){
            navigate("/")
        } else {
            setAuthToken(await Auth.currentUser.getIdToken())
            if (!sentPubKey) {
                server.post("pubKey", {publicKey: JSON.parse(localStorage.getItem("keyPairEyas'sFinal")).publicKeyJwk})
            }
        }
    })

    const getConvoById = id => {
        var rtval;
        chats.forEach((chat, index) => {
            if (chat.convoID == id) rtval = index
        })
        return rtval
    }

    useEffect(() => {
        socket.on("createConvo", async convo => {
            console.log("got something")
            convo.members.forEach(member => {
                member = JSON.parse(member)
                if (member.uid != Auth.currentUser.uid){
                    convo.name = member.name
                    convo.picture = member.picture ? member.picture : defaultPNG
                    convo.publicKey = member.publicKey
                }
            })
            const privateKey = JSON.parse(localStorage.getItem("keyPairEyas'sFinal")).privateKeyJwk
            convo.derivedKey = await E2E.deriveKey(convo.publicKey, privateKey)
            console.log(convo.derivedKey)
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

        socket.on("receiveMessage", async (messageJson, convoID) => {
            const index = getConvoById(convoID)
            console.log(messageJson)
            if (index == null) return
            const message = {
                createdAt: messageJson.createdAt,
                content: await E2E.decryptText(messageJson.content, chats[index].derivedKey),
                sender: messageJson.sentBy
            }
            const convo = chats[index]
            convo.messages.push(message)
            const newChats = [...chats]
            newChats[index] = convo
            setChats(newChats)
        })

        if (!isLoading){
            //Load the existing conversations
            server.get("conversations")
            .then( res => {
                res.data.forEach(async convo => {
                    convo.members.forEach(member => {
                        member = JSON.parse(member)
                        if (member.uid != Auth.currentUser.uid){
                            convo.name = member.name
                            convo.picture = member.picture ? member.picture : defaultPNG
                            convo.publicKey = member.publicKey
                        }
                    })

                    const privateKey = JSON.parse(localStorage.getItem("keyPairEyas'sFinal")).privateKeyJwk
                    convo.derivedKey = await E2E.deriveKey(convo.publicKey, privateKey)
                    console.log(convo.derivedKey)
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
            socket.off("receiveMessage")
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
                <Convo Auth={Auth} socket={socket} activeConvo={chats.find(convo => convo.convoID == activeConvo)}/>
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