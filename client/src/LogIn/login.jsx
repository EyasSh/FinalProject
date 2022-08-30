import "./login.css"
import {useState, useEffect} from "react"
import { Link, Navigate, useNavigate} from "react-router-dom"
import { UserOutlined } from '@ant-design/icons'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import {Input ,Form} from 'antd'
import * as Joi from "joi"
import { firebaseApp } from "../DB/FireBaseConf";
import {getAuth, signInWithEmailAndPassword, onAuthStateChanged} from "firebase/auth"

//assets
import logo from "../Assets/Images/Logo.png"

function Login(){
    let Auth=getAuth(firebaseApp);
    const [errMsg, setErrMsg] = useState();
    const [email, setEmail] = useState("");
    const [passwd, setPasswd] = useState("");
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    onAuthStateChanged(Auth, (user) => {
        setIsLoading(false)
        if (user){
            navigate("/app")
        }
    })

    useEffect(() => {
        const keyDownHandler = event => {
          console.log('User pressed: ', event.key);
    
          if (event.key === 'Enter') {
            event.preventDefault();
            handleLogin()
          }
        };
        document.addEventListener('keydown', keyDownHandler);
    
        return () => {
          document.removeEventListener('keydown', keyDownHandler); // cleanup
        };
      }, []);

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
                    }).catch(e => setErrMsg("Wrong email or password!"))
                } else {
                    alert("already authenticated")
                }
            }
            catch(e){
                alert(e.message)
            }   
        }
    }

    if (!isLoading){
        return !Auth.currentUser ? (
            <div className="Li-Container">
                <img className="Logo" src={logo}></img>
               <label>Email</label>
               <input className="loginInput" type={'text'}
                onChange={(e) => setEmail(e.target.value)}/>
               <label>Password</label>
               <input className="loginInput" type={'password'} 
                onChange={(e) => setPasswd(e.target.value)}/>
               <button className="Li-button" type="submit" onClick={handleLogin}>Login</button>
                
                {errMsg ? <span className="errMsg">{errMsg}</span> : ""}
                <br />
                <span className="No-Acc">Dont Have an Account? <Link to={"/Signup"}><u className="SignUp">Sign Up</u></Link></span>
    
            </div>
        ) : (
            <Navigate to="/app"/>
        )
    } else {
        return ""
    }
}
export default Login