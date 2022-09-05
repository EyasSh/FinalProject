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

    //Wait for the user data before rendering
    onAuthStateChanged(Auth, (user) => {
        setIsLoading(false)
        if (user){
            // if the user is looged in redirect him to the app
            navigate("/app")
        }
    })

    useEffect(() => {
        //Listen for Enter key as an alternative to the Login button click
        const keyDownHandler = event => {    
          if (event.key === 'Enter') {
            event.preventDefault();
            handleLogin()
          }
        };
        document.addEventListener('keydown', keyDownHandler);
    
        return () => {
            //cleanup the listener on component unmount
          document.removeEventListener('keydown', keyDownHandler); // cleanup
        };
      }, []);

    function handleLogin(){     
        setErrMsg(null) // resets the error message

        // check if the data is valid before sending it to firebase
        const schema = Joi.object({
            Email: Joi.string().email({tlds: {allow: false}}).required(),
            Password: Joi.string().min(8).max(30).required()
        })
        const {error} = schema.validate({Email: email, Password: passwd})
        if (error) {
            // if the data is not valid output an error message
            setErrMsg(error.message)
            return
        }
        else{
            try{
                // if there is no user logged in, log a user in with this data
                if (!getAuth().currentUser){
                    signInWithEmailAndPassword(Auth, email, passwd)
                    .then((res)=>{
                        //save the user in the local storage
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
        // if there is a user authenticated redirect him to the app
        return !Auth.currentUser ? (
            <div className="Li-Container">
                <img className="Login-Logo" src={logo} alt='eyas login'></img>
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