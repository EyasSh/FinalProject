const express = require("express")
const {admin, db} = require("./DB/firebase-admin")
const cors = require("cors");
const { createServer } = require("http");
const {Server} = require("socket.io");
const { count } = require("console");

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

//Sockets
var authSockets = []
var counter = 0
io.on("connection", socket => {
    counter++
    console.log(counter)
    socket.on("authenticate", (authToken) => {
        try {
            admin.auth().verifyIdToken(authToken)
            .then(decodedToken => {
                authSockets[socket.id] = decodedToken.uid
            })
            .catch(() => {
                console.log(`${socket.id} failed to authenticate with a token of value: ${authToken}`)
            })    
        } catch (e){console.error(e)}
    })

    socket.on("createConvo", async (user, contacts) => {
        if (!authSockets[socket.id]) return socket.emit("exception", {errMsg: "Not Authorized", requestedEvent: "createConvo", data: {contacts}})
        console.log(authSockets)
        if (authSockets[socket.id] != user.uid){
            socket.emit("exception", {errMsg: "Authorization error"})
            socket.disconnect()
            return
            // we close the connection here because someone is trying to manipulate the request
        }
        if (contacts.length == 1){
            contacts[0] = JSON.parse(contacts[0])
            const convo = db.collection("Conversations").doc(`${contacts[0].uid}--${user.uid}`)
            await convo.set({
                user1: contacts[0].uid,
                user2: user.uid,
                messages: []
            })
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