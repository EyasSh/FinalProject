import React, { useState, useEffect } from 'react';
import {Link, Navigate, useNavigate} from 'react-router-dom'
import './signup.css'
import axios from 'axios'
import { firebaseApp } from "../DB/FireBaseConf";
import{getAuth, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile   } from "firebase/auth"
import * as Joi from "joi"
import logo from "../Assets/Images/Logo.png"
import * as E2E from "../Services/E2E"
import CryptoJS from "crypto-js"
import {nanoid} from "nanoid"
//ant design & images
import {ArrowLeftOutlined} from '@ant-design/icons'

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

    //Wait for the user to load before rendering
    onAuthStateChanged(Auth, (user) => {
        setIsLoading(false)
        
        if (user){
            // if there is an authenticated user redirect to the app page
            navigate("/app")
        }
    })

    useEffect(() => {
        // Listen for an Enter key press as an alternative for the sign up button
        const keyDownHandler = event => {    
          if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit()
          }
        };
        document.addEventListener('keydown', keyDownHandler);
    
        return () => {
          document.removeEventListener('keydown', keyDownHandler); // cleanup
        };
      }, []);

    const handleSubmit=async ()=>{
        setErrMsg("") // reset the error message

        // Check if the fields are valid before sending them to firebase servers
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
                // make sure there is no authenticated user before signup
                if (!getAuth().currentUser){
                    let newUser=await createUserWithEmailAndPassword(Auth,email,passwd)
                    .then(async (res)=>{
                        localStorage.clear()
                        localStorage.setItem("user",JSON.stringify(res.user))
                        updateProfile(Auth.currentUser, {
                            displayName: `${fname} ${lname}`
                        })

                        // now we create the key pair
                        const keyPair = await E2E.generateKeyPair()
                        // we need to encrypt the private key
                        var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(keyPair.privateKeyJwk), passwd).toString();
                        //now that the private key is encrypted we send to the server to be saved into the database
                        axios.post("http://localhost:5000/fetchKeys", {
                            publicKey: keyPair.publicKeyJwk,
                            privateKey: ciphertext
                        },{
                            headers: {
                                "Authorization": await Auth.currentUser.getIdToken()
                            }
                        })
                        localStorage.setItem("keyPairEyas'sFinal", JSON.stringify({
                            publicKeyJwk: keyPair.publicKeyJwk,
                            privateKeyJwk: keyPair.privateKeyJwk
                        }))
                    })
                    .catch(e=>{
                        console.log(e)
                        setErrMsg("Email already exists!")
                    })      
                }
            }
            catch(e){}
        }
    }

    if(!isLoading){
        return !Auth.currentUser ? (
            <div className='SuContainer'>
                <Link to='/'>
                    <ArrowLeftOutlined className='Back-Arrow' />
                </Link>
                <div className='signUpForm'>
                    
                    <h1 className='SignUpHeader'>Sign Up</h1>
                    <img src={logo} className='Logo' alt='eyas'></img>
                    <br></br>
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