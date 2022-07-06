const mongoose=require('mongoose');
mongoose
    .connect("mongodb://localhost/project")
    .then(()=>console.log("Connected to DB"))
    .catch((err)=>console.log(`connection error\n ${err}`))
    
    
module.exports= mongoose;