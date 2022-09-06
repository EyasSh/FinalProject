const express = require("express")
const {admin, db} = require("./DB/firebase-admin")
const cors = require("cors");
const { createServer } = require("http");
const {Server} = require("socket.io");

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
    const fsRef = db.collection("Conversations")
    const data = await fsRef.where("searchTerms", "array-contains", req.uid).get()
    const result = [] 
    data.forEach(doc => {
        result.push(doc.data())
    })
    res.status(200).send(result)
})

//Sockets
var authSockets = []
var socketAuths = [] // this is the same as the array above but swapped keys and values
var counter = 0
io.on("connection", socket => {
    counter++
    console.log(counter)
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
        if (contacts.length == 1){
            contacts[0] = JSON.parse(contacts[0])
            const id = `${contacts[0].uid}--${user.uid}`
            const convo = db.collection("Conversations").doc(id)
            const convoConstructor = {
                convoID: id,
                searchTerms: [contacts[0].uid, user.uid], // We need this to be able to get the document by ID (firebase doesnt support substrings)
                members: [
                    JSON.stringify({uid: contacts[0].uid, publicKey: null, name: contacts[0].displayName, picture: contacts[0].photoURL}),
                    JSON.stringify({uid: user.uid, publicKey: null, name: user.displayName, picture: user.photoURL})
                ],
                messages: [],
                group: false,
                createdBy: user.uid,
                createdAt: Date.now()
            }
            await convo.set(convoConstructor)
            socketAuths[user.uid].emit("createConvo", convoConstructor)
            if (socketAuths[contacts[0].uid])
                socketAuths[contacts[0].uid].emit("createConvo", convoConstructor)
        }
    })
})
io.on("disconnect", socket => {
    counter--
    console.log(counter)
    authSockets[socket.id] = null
})
// Start server
httpServer.listen(5000, () => {
    console.log("Server started at port 5000!")
})