const express = require("express")
const {admin} = require("./DB/firebase-admin")
const cors = require("cors")

const app = express()

//Middleware
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// Authorization middleware
const checkAuth = (req, res, next) => {
    admin.auth().verifyIdToken(req.headers.authorization)
    .then(decodedToken => {
        req.uid = decodedToken.uid
        next()
    })
    .catch(() => res.status(401).send("Unauthorized"))
}

//cors
const corsOptions = {
    origin: '*',
    methods: "*"
}
app.use(cors(corsOptions))

app.get("/users", (req, res)=> {
    var identifier = null
    if (req.query.email) identifier = req.query.email
    if (req.query.uid) identifier = req.query.uid
    if (!identifier) return res.status(400).send("Please provide an ID")
    admin.auth().getUserByEmail(identifier)
    .then(user => {
        res.status(200).send(user)
    })
    .catch(() => res.sendStatus(500))
})

app.listen(5000, () => {
    console.log("Server started at port 5000!")
})