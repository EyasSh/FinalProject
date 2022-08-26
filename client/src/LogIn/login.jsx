import "./login.css"
import {useState} from "react"
import { Link } from "react-router-dom"
import { UserOutlined } from '@ant-design/icons'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import {Input ,Form} from 'antd'
import * as Joi from "joi"
import { firebaseApp } from "../DB/FireBaseConf";
import {getAuth,signInWithEmailAndPassword} from "firebase/auth"

function Login(){
    let Auth=getAuth(firebaseApp);
    const [errMsg, setErrMsg] = useState();
    const [email, setEmail] = useState("");
    const [passwd, setPasswd] = useState("");

    function handleLogin(){     
        setErrMsg(null) // resets the state
        const schema = Joi.object({
            Email: Joi.string().email({tlds: {allow: false}}).required(),
            Password: Joi.string().min(8).max(30).required()
        })
        const {error} = schema.validate({Email: email, Password: passwd})
        if (error) {
            setErrMsg(error.message)
            return
        }
        else{
            try{
                if (!getAuth().currentUser){
                    signInWithEmailAndPassword(Auth, email, passwd)
                    .then((res)=>{
                        localStorage.setItem("user",JSON.stringify(res.user))
                    })    
                } else {
                    alert("already authenticated")
                }
            }
            catch(e){
                alert(e.message)
            }   
        }
    }

    return(
        <div className="Li-Container">
           <label>Email</label>
           <input className="loginInput" type={'text'}
           placeholder='Email' onChange={(e) => setEmail(e.target.value)}/>
           <label>Password</label>
           <input className="loginInput" type={'text'} 
           placeholder='Password' onChange={(e) => setPasswd(e.target.value)}/>
           <button className="Li-button" type="submit" onClick={handleLogin}>Login</button>
            
            {errMsg ? <span className="errMsg">{errMsg}</span> : ""}
            <br />
            <span className="No-Acc">Dont Have an Account? <Link to={"/Signup"}><u className="SignUp">Sign Up</u></Link></span>

        </div>
    
    )   
}
export default Login