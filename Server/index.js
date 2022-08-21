const express =require('express')
const app=express()
const cors =require('cors')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose =require('./DB/database.js')
app.use(cors());
app.use(express.json())


const Users=require("./User/User")
app.use("/User",Users)



app.get('/', (req,res)=>{
    res.send("Hi")
})



let port = 3100
app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})