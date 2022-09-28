const express = require("express")
const {admin, db} = require("./DB/firebase-admin")
const cors = require("cors");
const { createServer } = require("http");
const {Server} = require("socket.io");
const { QuerySnapshot } = require("firebase-admin/firestore");
const {uuid} = require("uuidv4")

const app = express();
const httpServer = createServer(app)
//cors
const corsOptions = {
    origin: '*',
    methods: "*"
}
const io = new Server(httpServer, {cors: corsOptions})

//Middleware
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors(corsOptions))

// Authorization middleware
const checkAuth = (req, res, next) => {
    admin.auth().verifyIdToken(req.headers.authorization)
    .then(decodedToken => {
        req.uid = decodedToken.uid
        next()
    })
    .catch(() => res.status(401).send("Unauthorized"))
}

app.get("/users", checkAuth,  (req, res)=> {
    if (req.query.email) {
        admin.auth().getUserByEmail(req.query.email)
        .then(async user => {
            const data = {
                user: user,
                publicKey: await getPublicKey(user.uid)
            }
            res.status(200).send(data)
        })
        .catch(() => res.sendStatus(500))
    } else{
        res.status(400).send("Please provide an ID")
    }
})

app.get("/conversations", checkAuth, async (req, res) => {
    const cnovoRef = db.collection("Conversations")
    const data = await cnovoRef.where("searchTerms", "array-contains", req.uid).get()
    const result = [] 
    
    // we need to convert the "data" variable to an array
    // because its a custom type made by firebase
    const dataArray = []
    data.forEach(sample => dataArray.push(sample))
    for (const doc of dataArray ){
        var convo = doc.data()
        if (socketAuths[req.uid]){
            socketAuths[req.uid].join(convo.convoID)
        } else {
            console.log("Warning: couldn't join rooms")
        }
        const msgData = await db.collection("Message")
        .doc(convo.convoID)
        .collection("Messages")
        .orderBy("createdAt")
        .get()
        msgData.docs.forEach(msg => {
            msg = msg.data()
            if (msg) convo.messages.push(msg)
        })
        
        //update member profiles
        for (const member in convo.members){
            const curr = JSON.parse(convo.members[member])
            const user = await admin.auth().getUser(curr.uid)
            curr.name = user.displayName
            curr.picture = user.photoURL
            convo.members[member] = JSON.stringify(curr)
        }
        result.push(convo)

    }
    res.status(200).send(result)
})

app.post("/fetchKeys", checkAuth, async (req, res) => {
    await db.collection("Users").doc(req.uid).set({
        publicKey: req.body.publicKey,
        privateKey: req.body.privateKey
    })
    res.sendStatus(200)
})

app.get("/fetchKeys", checkAuth, async (req, res) => {
    const doc = await db.collection("Users").doc(req.uid).get()
    if (!doc.exists) return res.sendStatus(404)
    res.status(200).send(doc.data())
})

//Sockets
var authSockets = []
var socketAuths = [] // this is the same as the array above but swapped keys and values
io.on("connection", socket => {
    socket.on("authenticate", (authToken) => {
        try {
            admin.auth().verifyIdToken(authToken)
            .then(decodedToken => {
                authSockets[socket.id] = decodedToken.uid
                socketAuths[decodedToken.uid] = socket
            })
            .catch(() => {
                console.log(`${socket.id} failed to authenticate with a token of value: ${authToken}`)
            })    
        } catch (e){console.error(e)}
    })

    socket.on("createConvo", async (user, contacts, encryptionKeys) => {        
        if (!authSockets[socket.id]) return socket.emit("exception", {errMsg: "Not Authorized", requestedEvent: "createConvo", data: {contacts}})
        if (authSockets[socket.id] != user.uid){
            socket.emit("exception", {errMsg: "Authorization error"})
            socket.disconnect()
            return
            // we close the connection here because someone is trying to manipulate the request
        }

        if (contacts.length == 1){ // Private Message
            contacts[0] = JSON.parse(contacts[0])
            const participantIds = [contacts[0].uid, user.uid].sort() // we sort the ids alphabetically to prevent duplicate conversations with inverted ids
            const id = `${participantIds[0]}--${participantIds[1]}`

            const convo = db.collection("Conversations").doc(id)
            const data = await convo.get()
            if (data.exists) return // convo already exists
            const convoConstructor = {
                convoID: id,
                searchTerms: participantIds, // We need this to be able to get the document by ID (firebase doesnt support substrings)
                members: [
                    JSON.stringify({uid: contacts[0].uid, publicKey: await getPublicKey(contacts[0].uid), name: contacts[0].displayName, picture: contacts[0].photoURL, email: contacts[0].email}),
                    JSON.stringify({uid: user.uid, publicKey: await getPublicKey(user.uid), name: user.displayName, picture: user.photoURL, email: user.email})
                ],
                messages: [], // this stays as an empty array which is filled up after fetching the messages collection to be sent to the client
                group: false,
                createdBy: user.uid,
                createdAt: Date.now()
            }
            await convo.set(convoConstructor)
            socketAuths[user.uid].emit("createConvo", convoConstructor)
            socket.join(id)
            if (socketAuths[contacts[0].uid]){
                socketAuths[contacts[0].uid].emit("createConvo", convoConstructor)
                socketAuths[contacts[0].uid].join(id)
            }
        } else if (contacts.length > 1 && encryptionKeys){ // Group Chat
            let participantIds = [user.uid]
            let id = uuid()
            contacts.forEach(contact => {
                participantIds.push(JSON.parse(contact).uid)
            })
            const convo = db.collection("Conversations").doc(id)
            const data = await convo.get()
            if (data.exists) return // convo already exists

            //set the members array
            const members = [JSON.stringify({uid: user.uid, publicKey: await getPublicKey(user.uid), name: user.displayName, picture: user.photoURL, email: user.email})]
            for (const contact in contacts){
                const curr = JSON.parse(contacts[contact])
                members.push(JSON.stringify({uid: curr.uid, publicKey: await getPublicKey(curr.uid), name: curr.displayName, picture: curr.photoURL, email: curr.email}))
            }

            const convoConstructor = {
                convoID: id,
                name: `${user.displayName}'s group`,
                searchTerms: participantIds, // We need this to be able to get the document by ID (firebase doesnt support substrings)
                members: members,
                messages: [], // this stays as an empty array which is filled up after fetching the messages collection to be sent to the client
                systemMessages: [],
                group: true,
                encryptionKeys: encryptionKeys, // this is an array where there is an end to end encrypted key for each user to decrypt to get the main group key
                createdBy: user.uid,
                admins: [user.uid],
                createdAt: Date.now()
            }

            await convo.set(convoConstructor)
            socketAuths[user.uid].emit("createConvo", convoConstructor)
            socket.join(id)
            participantIds.forEach(uid => {
                socketAuths[uid]?.emit("createConvo", convoConstructor)
                socketAuths[uid]?.join(id)
            })
        }
    })

    socket.on("sendMessage", async (user, text, convoID, attatchment, voice) => {
        try {
            if (!authSockets[socket.id]) return socket.emit("exception", {errMsg: "Not Authorized", requestedEvent: "createConvo", data: {contacts}})
            if (authSockets[socket.id] != user.uid){
                socket.emit("exception", {errMsg: "Authorization error"})
                socket.disconnect()
                return
                // we close the connection here because someone is trying to manipulate the request
            }
            const messageJSON = {
                name: user.displayName,
                content: text,
                attatchment: attatchment || 0, // The content and the url are both encrypted by the user
                createdAt: Date.now(),
                sentBy: user.uid,
                convoID: convoID,
                voice: voice || 0
            }
            await saveMessage(messageJSON, convoID)
            io.to(convoID).emit("receiveMessage", messageJSON)
        } catch (e) {
            console.log(`An error occured: ${e}`)
        }
    })

    socket.on("leaveGroup", async (user, groupId) => {
        if (!authSockets[socket.id]) return socket.emit("exception", {errMsg: "Not Authorized", requestedEvent: "leaveGroup", data: {groupId}})
        if (authSockets[socket.id] != user.uid){
            socket.emit("exception", {errMsg: "Authorization error"})
            socket.disconnect()
            return
            // we close the connection here because someone is trying to manipulate the request
        }
        const cnovoRef = db.collection("Conversations")
        const data = await cnovoRef.where("convoID", "==", groupId).get()

        var dataArray = []
        data.forEach(sample => dataArray.push(sample))
        for (const doc of dataArray){
            var deletedGroup = false
            const group = doc.data()
            // We do for loops because its valid for all object types unlike .filter() which is only valid for arrays
            for (const index in group.searchTerms){
                if (user.uid == group.searchTerms[index]){
                    group.searchTerms.splice(index, 1)
                }
            }

            for (const index in group.members){
                const member = JSON.parse(group.members[index])
                if (member.uid == user.uid) {
                    group.members.splice(index, 1)
                }
            }

            for (const index in group.admins){
                if (group.admins[index] == user.uid) group.admins.splice(index, 1)
            }

            if (group.members.length == 0){//There are no members left, we delete the group and its messages
                await doc.ref.delete()
                deletedGroup = true
                const msgData = await db.collection("Message")
                .doc(group.convoID).get()
                msgData.ref.delete()
            } else if (group.members.length != 0 && group.admins.length == 0){ // There are still members but the admins left
                const randomMember = group.members[Math.floor(Math.random() * group.members.length)]
                group.admins.push(JSON.parse(randomMember).uid)
            }

            if(!deletedGroup){ // if the group is not deleted then we need to save the new data
                const systemMessage = {
                    createdAt: Date.now(),
                    content: `${user.displayName} has left the group!`,
                    systemMessage: true
                }
                group.systemMessages.push(systemMessage)

                await cnovoRef.doc(groupId).set(group)

                socket.emit("deleteConvo", groupId)
                socket.leave(groupId)
                io.to(groupId).emit("updateConvo", group, systemMessage)
            } else {
                io.to(groupId).emit("deleteConvo", groupId)
            }
        }
    })

    socket.on("setGroupAdmin", async (user, groupId, target) => {
        if (!authSockets[socket.id]) return socket.emit("exception", {errMsg: "Not Authorized", requestedEvent: "setGroupAdmin", data: {groupId: groupId, target: target}})
        if (authSockets[socket.id] != user.uid){
            socket.emit("exception", {errMsg: "Authorization error"})
            socket.disconnect()
            return
            // we close the connection here because someone is trying to manipulate the request
        }

        const cnovoRef = db.collection("Conversations")
        const data = await cnovoRef.where("convoID", "==", groupId).get()

        var dataArray = []
        data.forEach(sample => dataArray.push(sample)) // converting the data to an itrable object
        for (const doc of dataArray){
            const group = doc.data()
            if (!group.admins.includes(user.uid) || !group.group || group.admins.includes(target)) return;

            const targetUser = await admin.auth().getUser(target)

            if (!targetUser) return;

            group.admins.push(target)
            const systemMessage = {
                createdAt: Date.now(),
                content: `${targetUser.displayName} is now an admin!`,
                systemMessage: true
            }
            group.systemMessages.push(systemMessage)

            cnovoRef.doc(groupId).set(group)
            io.to(groupId).emit("updateConvo", group, systemMessage)
        }
    })

    socket.on("kickGroupMember", async (user, groupId, target) => {
        if (!authSockets[socket.id]) return socket.emit("exception", {errMsg: "Not Authorized", requestedEvent: "kickGroupMember", data: {groupId: groupId, target: target}})
        if (authSockets[socket.id] != user.uid){
            socket.emit("exception", {errMsg: "Authorization error"})
            socket.disconnect()
            return
            // we close the connection here because someone is trying to manipulate the request
        }

        const cnovoRef = db.collection("Conversations")
        const data = await cnovoRef.where("convoID", "==", groupId).get()

        var dataArray = []
        data.forEach(sample => dataArray.push(sample)) // converting the data to an itrable object
        for (const doc of dataArray){
            const group = doc.data()
            if (!group.admins.includes(user.uid) || !group.group) return;
            const targetUser = await admin.auth().getUser(target)

            if (!targetUser) return;

            for (const index in group.searchTerms){
                if (targetUser.uid == group.searchTerms[index]){
                    group.searchTerms.splice(index, 1)
                }
            }

            for (const index in group.members){
                const member = JSON.parse(group.members[index])
                if (member.uid == targetUser.uid) {
                    group.members.splice(index, 1)
                }
            }
            const systemMessage = {
                createdAt: Date.now(),
                content: `${targetUser.displayName} has been kicked out!`,
                systemMessage: true
            }
            group.systemMessages.push(systemMessage)
            await cnovoRef.doc(groupId).set(group)
            socketAuths[targetUser.uid]?.leave(groupId)
            socketAuths[targetUser.uid]?.emit("deleteConvo", groupId)
            io.to(groupId).emit("updateConvo", group, systemMessage)
        }
    })

    socket.on("editGroup", async (user, groupId, newInfo) => {
        if (!authSockets[socket.id]) return socket.emit("exception", {errMsg: "Not Authorized", requestedEvent: "editGroup", data: {groupId: groupId, newInfo: newInfo}})
        if (authSockets[socket.id] != user.uid){
            socket.emit("exception", {errMsg: "Authorization error"})
            socket.disconnect()
            return
            // we close the connection here because someone is trying to manipulate the request
        }

        const cnovoRef = db.collection("Conversations")
        const data = await cnovoRef.where("convoID", "==", groupId).get()

        var dataArray = []
        data.forEach(sample => dataArray.push(sample)) // converting the data to an itrable object
        for (const doc of dataArray){
            const group = doc.data()
            if (!group.admins.includes(user.uid) || !group.group) return;
            const urlRegex = /(https?:\/\/[^\s]+)/;
            if (newInfo.imgUrl && urlRegex.test(newInfo.imgUrl)){
                group.picture = newInfo.imgUrl
            }
            if (newInfo.name.trim()){
                group.name = newInfo.name
            }
            const systemMessage = {
                createdAt: Date.now(),
                content: `${user.displayName} updated the group info!`,
                systemMessage: true
            }
            group.systemMessages.push(systemMessage)
            await cnovoRef.doc(groupId).set(group)
            io.to(groupId).emit("updateConvo", group, systemMessage)
        }
    })
})

io.on("disconnect", socket => {
    authSockets[socket.id] = null
})

// functions
const saveMessage = (message, convoID) => {
    return new Promise((resolve, reject) => {
      db.collection('Message')
        .doc(convoID)
        .collection('Messages')
        .add(message)
        .then(function (docRef) {
          resolve(message)
        })
        .catch(function (error) {
          reject(error)
        })
    })
}

const getPublicKey = async uid => {
    const docRef = db.collection("Users").doc(uid)
    const doc = await docRef.get()
    if (!doc.exists){
        return
    }
    return doc.data().publicKey
}
// Start server
httpServer.listen(5000, () => {
    console.log("Server started at port 5000!")
})