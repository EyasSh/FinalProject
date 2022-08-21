import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom'
import './signup.css'
import axios from 'axios'
import { firebaseApp } from "../DB/FireBaseConf";
import{getAuth, createUserWithEmailAndPassword} from "firebase/auth"

function SignUp() {
    let [fullName,setFullName]=useState('');
    let[number,SetNumber]=useState('');
    let [email,setEmail]=useState('');
    let [password,setPassword]=useState('');
    let nav=useNavigate();
    let Auth=getAuth();
    const handleSubmit=async ()=>{
        
        // let data={
        //     full_name:fullName,
        //     number:number,
        //     email:email,
        //     password:password,
        // }
        // console.log(data)
      
        // let requestOptions={
        //     method:"POST",
        //     headers:{"Content-Type":"application/json"},
        //     body:JSON.stringify(data)
        // }
        // console.log(data)
        // let res=await fetch("http://localhost:3100/User/register",requestOptions)
        // if(res.ok){
        //     nav('/')
        // }
        // else{
        //     nav('/Signup')
        // }
        try{
           let newUser=await createUserWithEmailAndPassword(Auth,email,password)
           .then((res)=>{
             alert(res.user)
           }).catch(e=>console.log(e.message)) 
        }
        catch(e){

        }
    }
    return (
        <div className='SuContainer'>
            
            <div className='signUpForm'>
                <h1 className='SignUpHeader'><u>Sign Up</u></h1>
                <label>
                    Full Name
                </label>
                <br></br>
                <input placeholder="Full Name" type={"text"} className="UserData" 
                    onChange={(e)=>{
                    setFullName(e.target.value); 
                    }}></input>
                <br></br>
                <label>
                    Phone
                </label>
                <br></br>
                <input placeholder="Phone" type={"text"} className="UserData"
                onChange={(e)=>{
                    SetNumber(e.target.value);
                }}></input>
                <br></br>
                <label >Email</label>
                <br></br>
                <input type={"text"} placeholder="Email" className="UserData"
                    onChange={(e)=>{
                    setEmail(e.target.value) 
                    }}
                />
                <br></br>
                <label>Password</label>
                <br></br>
                <input type={"password"} placeholder="Password" className="UserData"
                    onChange={(e)=>{
                        setPassword(e.target.value);
                    }} 
                    ></input>
                
                <br></br>
                <button className="Submit" 
                onClick={handleSubmit} >submit</button>
            </div>
            
            
        </div>
    );
}

export default SignUp;  