const mongoose =require('../DB/database.js')
const express= require("express")
const router=express.Router();
router.use(express.json())
const userSchema=new mongoose.Schema({
    email: {type:String, unique:true},
    full_name:{type:String, default:null}, 
    password:{type:String, },
    number:{type:String},
    token:{type:String}
  })
  
const User = mongoose.model('Users',userSchema);

router.post('/register', async(req,res)=>{
    console.log(req.body)
    
    try{
      let {full_name,number,email,password}=req.body
      console.log ("in the try")
      if(!(full_name && number &&email &&password)){
        
        res.status(400).send("all data must be filled")
      }
      console.log("past if no.1")
      const olderUser= await User.findOne({ 
        email:req.body.email,
        password:bcrypt.hash(req.body.password,10),
        full_name:req.body.full_name,
        number:req.body.number
       });
      if(olderUser!=null || olderUser!=undefined)
      {
       console.log("in if 2")
        res.status(409).send("a user with similar credentials already exists")
      }
      password = await bcrypt.hash(password,10);
      let user= await User.create({
        full_name:req.body.full_name,
        number:req.body.number,
        email:req.body.email,
        password:password,
      })
  
      res.status(200).send("user registered")
    }
    catch(e){
      
      console.log("an error occured")
      res.status(500).send("internal server error")
    }
   
   
    
  })
module.exports=router