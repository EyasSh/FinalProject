const mongoose =require('../DB/database.js')
const express= require("express")
const router=express.Router();
router.use(express.json())





router.post('/register', async(req,response)=>{
    try{
      console.log("above new user")
      let newUser= await firebaseAuth.createUserWithEmailAndPassword(
        Auth,req.body.email,req.body.password)
        .then((res)=>{
          
          response.send(res.user).status(200)
        })
      
      
    }
    catch(e){
      console.log("in the catch")
      response.status(500).send(e.message);
    }
  })
  router.get('/login',async(request,response)=>{
    try{
      await firebaseAuth.signInWithEmailAndPassword(Auth,
        request.body.email,
        request.body.password).then((res)=>{
          response.status(200).send(res.user)
        }
        )
    }
    catch(e){
      console.log(e.message)
      response.status(500)
    }
  })
module.exports=router