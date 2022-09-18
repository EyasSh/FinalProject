const express = require("express")
const {admin, db} = require("./DB/firebase-admin")
const cors = require("cors");
const { createServer } = require("http");
const {Server} = require("socket.io");
const { QuerySnapshot } = require("firebase-admin/firestore");

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

app.get("/users", checkAuth, (req, res)=> {
    console.log(req)
    if (req.query.email) {
        admin.auth().getUserByEmail(req.query.email)
        .then(user => {
            res.status(200).send(user)
        })
        .catch(() => res.sendStatus(500))
    } else{
        res.status(400).send("Please provide an ID")
    }
})

app.get("/conversations", checkAuth, async (req, res) => {
    console.log(req)
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
            curr.photoURL = user.photoURL
            convo.members[member] = JSON.stringify(curr)
        }
        result.push(convo)

    }

    res.status(200).send(result)
})

app.post("/fetchKeys", checkAuth, async (req, res) => {
    console.log(req)
    await db.collection("Users").doc(req.uid).set({
        publicKey: req.body.publicKey,
        privateKey: req.body.privateKey
    })
    res.sendStatus(200)
})

app.get("/fetchKeys", checkAuth, async (req, res) => {
    console.log(req)
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

    socket.on("createConvo", async (user, contacts) => {
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
                    JSON.stringify({uid: contacts[0].uid, publicKey: await getPublicKey(contacts[0].uid), name: contacts[0].displayName, picture: contacts[0].photoURL}),
                    JSON.stringify({uid: user.uid, publicKey: await getPublicKey(user.uid), name: user.displayName, picture: user.photoURL})
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
        }
    })

    socket.on("sendMessage", async (user, text, convoID, attatchment) => {
        try {
            if (!authSockets[socket.id]) return socket.emit("exception", {errMsg: "Not Authorized", requestedEvent: "createConvo", data: {contacts}})
            if (authSockets[socket.id] != user.uid){
                socket.emit("exception", {errMsg: "Authorization error"})
                socket.disconnect()
                return
                // we close the connection here because someone is trying to manipulate the request
            }
            const messageJSON = {
                content: text,
                attatchment: attatchment || 0, // The content and the url are both encrypted by the user
                createdAt: Date.now(),
                sentBy: user.uid,
                convoID: convoID
            }
            await saveMessage(messageJSON, convoID)
            io.to(convoID).emit("receiveMessage", messageJSON)
        } catch (e) {
            console.log(`An error occured: ${e}`)
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