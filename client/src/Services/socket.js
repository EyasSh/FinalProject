import {io} from "socket.io-client"
import{getAuth, onAuthStateChanged} from "firebase/auth"

export const socket = io("http://localhost:5000")
const Auth = getAuth()

onAuthStateChanged(Auth, async (user) => {
    if (user){
        console.log("authenticating")
        const token = await Auth.currentUser.getIdToken()
        socket.emit("authenticate", token)
    }
})