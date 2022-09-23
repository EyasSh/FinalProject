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

function SignUp(props) {
    let Auth=getAuth(firebaseApp);
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [passwd, setPasswd] = useState("");
    const [errMsg, setErrMsg] = useState("")
    const navigate = useNavigate()

    useEffect(() => {

        const cleanup = onAuthStateChanged(Auth, (user) => {
        
            if (user){
                // if there is an authenticated user redirect to the app page
                navigate("/app")
            }
        })
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
          cleanup()
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
                    // we clear the local storage to prevent any data collisions
                    // We create the keypair and save it before sign up
                    // To prevent the redirect to Home without the keys being saved
                    const keyPair = await E2E.generateKeyPair()
                    // we need to encrypt the private key
                    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(keyPair.privateKeyJwk), passwd).toString();
                    //now that the private key is encrypted we send to the server to be saved into the database

                    props.setKeyData({
                        "keyPair": {
                            publicKeyJwk: keyPair.publicKeyJwk,
                            privateKeyJwk: keyPair.privateKeyJwk
                        },
                        "keyPairReq": {
                            publicKey: keyPair.publicKeyJwk,
                            privateKey: ciphertext
                        }
                    })
                    createUserWithEmailAndPassword(Auth,email,passwd)
                    .then(async (res)=>{
                        updateProfile(Auth.currentUser, {
                            displayName: `${fname} ${lname}`
                        })
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

    return (
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
    )
}

export default SignUp;  