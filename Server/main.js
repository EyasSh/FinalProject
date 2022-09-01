const express = require("express")
const {admin} = require("./DB/firebase-admin")
const cors = require("cors")

const app = express()

//Middleware
app.use(express.json())
app.use(express.urlencoded({extended: false}))

//cors
const corsOptions = {
    origin: '*',
    methods: "*"
}
app.use(cors({}))

app.get("/users", (req, res)=> {
    admin.auth().getUserByEmail(req.query.email)
    .then(user => {
        res.send(user)
    })
    .catch(() => res.sendStatus(500))
})

app.listen(5000, () => {
    console.log("Server started at port 5000!")
})