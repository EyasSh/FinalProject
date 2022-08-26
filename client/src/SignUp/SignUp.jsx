import React, { useState } from 'react';
import {Navigate, useNavigate} from 'react-router-dom'
import './signup.css'
import axios from 'axios'
import { firebaseApp } from "../DB/FireBaseConf";
import{getAuth, createUserWithEmailAndPassword, onAuthStateChanged} from "firebase/auth"
import * as Joi from "joi"


function SignUp() {
    let Auth=getAuth(firebaseApp);
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [passwd, setPasswd] = useState("");
    const [errMsg, setErrMsg] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    onAuthStateChanged(Auth, (user) => {
        setIsLoading(false)
        
        if (user){
            navigate("/app")
        }
    })

    const handleSubmit=async ()=>{
        setErrMsg("")
        const schema = Joi.object({
            "First Name": Joi.string().regex(/^[a-zA-Z ]*$/).messages({'string.pattern.base': `First Name can only contain letters.`}).min(2).max(20).required(),
            "Last Name": Joi.string().regex(/^[a-zA-Z ]*$/).messages({'string.pattern.base': `Last Name can only contain letters.`}).min(2).max(20).required(),
            "Phone": Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
            "Email": Joi.string().email({tlds: {allow: false}}).required(),
            "Password": Joi.string().min(8).max(30).required()
        })

        const {error} = schema.validate({
            "First Name": fname,
            "Last Name": lname,
            "Phone": phone,
            "Email": email,
            "Password": passwd
        });

        if (error) {
            setErrMsg(error.message)
            return
        } else {
            try{
                if (!getAuth().currentUser){
                    let newUser=await createUserWithEmailAndPassword(Auth,email,passwd)
                    .then((res)=>{
                      localStorage.setItem("user",JSON.stringify(res.user))
                    }).catch(e=>console.log(e.message))      
                }
            }
            catch(e){}
        }
    }

    if(!isLoading){
        return !Auth.currentUser ? (
            <div className='SuContainer'>
                
                <div className='signUpForm'>
                    <h1 className='SignUpHeader'><u>Sign Up</u></h1>
                    <label>
                        First Name
                    </label>
                    <br></br>
                    <input placeholder="First Name" type={"text"} className="UserData"
                        onChange={(e) => setFname(e.target.value)}
                    />
    
                    <label>
                        Last Name
                    </label>
                    <br></br>
                    <input placeholder="Last Name" type={"text"} className="UserData"
                        onChange={(e) => setLname(e.target.value)}
                    />
    
                    <br></br>
                    <label>
                        Phone
                    </label>
                    <br></br>
                    <input placeholder="Phone" type={"text"} className="UserData"
                    onChange={(e) => setPhone(e.target.value)}
                    />
                    <br></br>
                    <label >Email</label>
                    <br></br>
                    <input type={"text"} placeholder="Email" className="UserData"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <br></br>
                    <label>Password</label>
                    <br></br>
                    <input type={"password"} placeholder="Password" className="UserData"
                        onChange={(e) => setPasswd(e.target.value)}
                    />
                    {errMsg ? <span className="errMsg">{errMsg}</span> : ""}
                    <br></br>
                    <button className="Submit" 
                    onClick={handleSubmit} >Sign Up</button>
                </div>
                
                
            </div>
        ) : (
            <Navigate to="/app"/>
        )    
    } else {
        return ""
    }
}

export default SignUp;  