const express = require("express")
const {admin} = require("./DB/firebase-admin")
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
var counter = 0
io.on("connection", socket => {
    counter++
    console.log(counter)
    socket.on("createConvo", (user, contacts) => {
        console.log(user.uid, contacts)
    })
})
io.on("disconnect", socket => {
    counter--
    console.log(counter)
})
// Start server
httpServer.listen(5000, () => {
    console.log("Server started at port 5000!")
})