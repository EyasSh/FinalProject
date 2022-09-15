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
import CryptoJS from "crypto-js";
import Spinner from '../Spinner/Spinner';


function Home(props) {
    const Auth = getAuth(firebaseApp)
    const [isLoading, setIsLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)
    const [keysLoaded, setKeysLoaded] = useState(false)
    const navigate = useNavigate()
    const [authToken, setAuthToken] = useState(null)
    const [chats, setChats] = useState([])

    const server = axios.create({
        baseURL: "http://localhost:5000/",
        timeout: "60000",
        headers: {"Authorization": authToken}
    })

    // wait for the user data before rendering the page
    onAuthStateChanged(Auth, async (user) => {
        if (!user){
            navigate("/")
        } else {
            setAuthToken(await Auth.currentUser.getIdToken())
            setAuthenticated(true)
        }
    })
    const signOut = () => {
        localStorage.clear()
        Auth.signOut()
    }
    const getConvoById = id => {
        var rtval;
        chats.forEach((chat, index) => {
            if (chat.convoID == id) rtval = index
        })
        return rtval
    }

    useEffect(() => {
        socket.on("createConvo", async convo => {
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

        socket.on("receiveMessage", async (messageJson) => {
            const index = getConvoById(messageJson.convoID)
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

        if (isLoading && authenticated){
            const passwd = localStorage.getItem("passwdEyas'sFinal")
            if (passwd && !keysLoaded){
                server.get("fetchKeys")
                .then(response => {
                    // before saving the keys into the local storage, we first need to decrypt the private key
                    const data = response.data.privateKey
                    var bytes = CryptoJS.AES.decrypt(data, passwd);
                    // we remove the password from the local storage ASAP
                    localStorage.removeItem("passwdEyas'sFinal")
                    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    localStorage.setItem("keyPairEyas'sFinal", JSON.stringify({
                        publicKeyJwk: response.data.publicKey,
                        privateKeyJwk: decryptedData
                    }))
                    setKeysLoaded(true)
                })    
            } else if (!passwd) { // The password is not available when coming from the signup page
                // when coming from the sign up page the keys are already set in the localstorage
                if (JSON.parse(localStorage.getItem("keyPairEyas'sFinal"))) {
                    setKeysLoaded(true)
                } else {
                    // The user has to re-enter the password
                    signOut()
                }
            }

            if (keysLoaded) {
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
                        convo.messages.forEach(async (msg, msgIndex) => {
                            const message = {
                                createdAt: msg.createdAt,
                                content: await E2E.decryptText(msg.content, convo.derivedKey),
                                sender: msg.sentBy
                            }
                            convo.messages[msgIndex] = message
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
                    setIsLoading(false)
                }).catch(e => {
                    signOut()
                })
            }
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
        return <Spinner />
    }
}

export default Home;