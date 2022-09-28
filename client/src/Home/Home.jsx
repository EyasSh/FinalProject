import React, { useEffect, useState } from 'react';
import {Outlet, Navigate, useNavigate} from 'react-router-dom'
import Convo from '../Convo/Convo';
import Nav from '../Nav/Nav';
import { firebaseApp } from "../DB/FireBaseConf";
import{getAuth, onAuthStateChanged} from "firebase/auth"
import axios from "axios"
import {socket} from "../Services/socket";
import defaultPNG from "../Assets/Images/default.png"
import gDefaultPng from "../Assets/Images/groupDefault.png"
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
    const allowedImgTypes = ["image/png", "image/jpg", "image/jpeg"]

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
        props.setKeyData({})
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
            const privateKey = props.keyData.keyPair.privateKeyJwk
            if (!convo.group){
                convo.members.forEach(member => {
                    member = JSON.parse(member)
                    if (member.uid != Auth.currentUser.uid){
                        convo.name = member.name
                        convo.picture = member.picture ? member.picture : defaultPNG
                        convo.publicKey = member.publicKey
                    }
                })
                convo.derivedKey = await E2E.deriveKey(convo.publicKey, privateKey)
            } else {
                convo.picture = convo.picture ? convo.picture : gDefaultPng
                const selfKey = JSON.parse(convo.encryptionKeys)[Auth.currentUser.uid]
                const decryptionKey = await E2E.deriveKey(selfKey.publicKey, privateKey)
                var groupKeys = await E2E.decryptText(selfKey.encryptedKey, decryptionKey)
                groupKeys = JSON.parse(groupKeys)
                convo.derivedKey = await E2E.deriveKey(groupKeys.publicKey, groupKeys.privateKey)
            }

            // Check for duplicates
            var unique = true
            chats.forEach(chat => {
                if (convo.convoID == chat.convoID){
                    unique = false
                }
            })
            if (unique) setChats([...chats, convo]); // this is how you push to a state that is an array
            chats.map(chat => {
                chat.messages.map(msg => {
                    if (msg.sender == Auth.currentUser.uid){
                        msg.fromMe = true
                    }
                })
            })
        })

        socket.on("receiveMessage", async (messageJson) => {
            const index = getConvoById(messageJson.convoID)
            if (index == null) return
            const message = {
                name: messageJson.name,
                createdAt: messageJson.createdAt,
                content: await E2E.decryptText(messageJson.content, chats[index].derivedKey),
                attatchment: await E2E.decryptText(messageJson.attatchment, chats[index].derivedKey),
                voice: await E2E.decryptText(messageJson.voice, chats[index].derivedKey),
                sender: messageJson.sentBy
            }
            const convo = chats[index]
            if (convo.group) message.group = true;
            convo.messages.push(message)
            const newChats = [...chats]
            newChats[index] = convo
            setChats(newChats)
        })

        socket.on("deleteConvo", convoId => {
            for (const chat in chats) {
                const curr = chats[chat]
                if (curr.convoID == convoId){
                    chats.splice(chat, 1)
                    if (activeConvo == convoId){
                        setActiveConvo(null)
                    }
                    setChats(chats)
                }
            }
        })

        socket.on("updateConvo", (convo, msg) => {
            for (const chat in chats){
                if (convo.convoID == chats[chat].convoID){
                    // we can't just do chats[chat] = convo, because that will ruin the message decryption
                    chats[chat].members = convo.members
                    chats[chat].admins = convo.admins
                    chats[chat].searchTerms = convo.searchTerms
                    chats[chat].name = convo.name
                    chats[chat].encryptionKeys = convo.encryptionKeys
                    if (convo.group){
                        chats[chat].picture = convo.picture ?? gDefaultPng
                    } else {
                        chats[chat].picture = convo.picture ?? defaultPNG
                    }
                    chats[chat].systemMessages.push(msg)
                    // we use the spread operator in order to change the reference and rerender the component
                    // https://stackoverflow.com/questions/71185474/component-not-re-rendering-after-change-in-an-array-state-in-react
                    setChats([...chats])
                    chats.map(chat => {
                        chat.messages.map(msg => {
                            if (msg.sender == Auth.currentUser.uid){
                                msg.fromMe = true
                            }
                        })
                    })
                }
            }
        })

        if (isLoading && authenticated){
            const passwd = props.keyData.passwd
            const serverReq = props.keyData.keyPairReq

            // now that we got this data, we need to modify the state on the app.js
            const newKeyData = props.keyData
            newKeyData.passwd = null
            newKeyData.keyPairReq = null

            if (serverReq) {
                // The user just came from the signup page, and still havent posted the keys in the database
                server.post("fetchKeys", (serverReq))
                setKeysLoaded(true)
            }

            if (passwd && !keysLoaded){
                server.get("fetchKeys")
                .then(response => {
                    // before saving the keys into the local storage, we first need to decrypt the private key
                    const data = response.data.privateKey
                    var bytes = CryptoJS.AES.decrypt(data, passwd);
                    // we remove the password from the local storage ASAP
                    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    newKeyData.keyPair = {
                        publicKeyJwk: response.data.publicKey,
                        privateKeyJwk: decryptedData
                    }
                    setKeysLoaded(true)
                })    
            } else if (!passwd) { // The password is not available when coming from the signup page
                // when coming from the sign up page the keys are already set in the memory
                if (props.keyData.keyPair) {
                    setKeysLoaded(true)
                } else {
                    // The user has to re-enter the password
                    signOut()
                }
            }

            if (keysLoaded && authenticated) {
                //Load the existing conversations
                var proccessedChats = []
                server.get("conversations")
                .then( async res => {
                    for (const index in res.data){
                        const convo = res.data[index]
                        const privateKey = props.keyData.keyPair.privateKeyJwk
                        if (!convo.group){
                            convo.members.forEach(member => {
                                member = JSON.parse(member)
                                if (member.uid != Auth.currentUser.uid){
                                    convo.name = member.name
                                    convo.picture = member.picture ? member.picture : defaultPNG
                                    convo.publicKey = member.publicKey
                                }
                            })
                            convo.derivedKey = await E2E.deriveKey(convo.publicKey, privateKey)
                        } else {
                            convo.picture = convo.picture ? convo.picture : gDefaultPng
                            const selfKey = JSON.parse(convo.encryptionKeys)[Auth.currentUser.uid]
                            const decryptionKey = await E2E.deriveKey(selfKey.publicKey, privateKey)
                            var groupKeys = await E2E.decryptText(selfKey.encryptedKey, decryptionKey)
                            groupKeys = JSON.parse(groupKeys)
                            convo.derivedKey = await E2E.deriveKey(groupKeys.publicKey, groupKeys.privateKey)
                        }

                        for (const msgIndex in convo.messages){
                            const msg = convo.messages[msgIndex]
                            const message = {
                                group: convo.group,
                                name: msg.name,
                                createdAt: msg.createdAt,
                                content: await E2E.decryptText(msg.content, convo.derivedKey),
                                attatchment: await E2E.decryptText(msg.attatchment, convo.derivedKey),
                                voice: await E2E.decryptText(msg.voice, convo.derivedKey),
                                sender: msg.sentBy
                            }
                            convo.messages[msgIndex] = message
                        }

                        // Check for duplicates
                        var unique = true
                        proccessedChats.forEach(chat => {
                            if (convo.convoID == chat.convoID){
                                unique = false
                            }
                        })
                        if (unique)
                            proccessedChats = [...proccessedChats, convo] // this is how you push to a state that is an array
                    }
                    setChats([...proccessedChats])
                    chats.map(chat => {
                        chat.messages.map(msg => {
                            if (msg.sender == Auth.currentUser.uid){
                                msg.fromMe = true
                            }
                        })
                    })
                    setIsLoading(false)
                }).catch(e => {
                    console.log(e)
                    signOut()
                })
            }
            // now we just save the modified data
            props.setKeyData(newKeyData)
        }
        return () => {
            // That's a cleanup function so that the events don't register multiple times
            socket.off("createConvo")
            socket.off("receiveMessage")
            socket.off("deleteConvo")
            socket.off("updateConvo")
        }
    })

    const [activeConvo, setActiveConvo] = useState(null)
    if (!isLoading){
        return Auth.currentUser ? (
            <div>
                <Nav keyData={props.keyData} allowedImgTypes={allowedImgTypes} socket={socket} server={server} openConvo={setActiveConvo} chats={chats} />
                <Convo allowedImgTypes={allowedImgTypes} Auth={Auth} socket={socket} activeConvo={chats.find(convo => convo.convoID == activeConvo)}/>
                <Outlet></Outlet>
            </div>
        ) : (
            <Navigate to="/"/>
        )    
    } else {
        return <Spinner text={"Loading Conversations..."} />
    }
}

export default Home;