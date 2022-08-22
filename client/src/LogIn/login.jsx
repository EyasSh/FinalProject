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
    let Auth=getAuth();
    const [errMsg, setErrMsg] = useState();
    function handleLogin(values){
        
        setErrMsg(null) // resets the state
        const schema = Joi.object({
            email: Joi.string().email({tlds: {allow: false}}).required(),
            password: Joi.string().min(8).max(30).required()
        })
        const {error} = schema.validate({email: values.email, password: values.password})
        if (error) {
            setErrMsg(error.message)
            return
        }
        else{
            try{
                signInWithEmailAndPassword(Auth,values.email,values.password)
                .then((res)=>{
                localStorage.setItem("user",JSON.stringify(res.user))
                })
            }
            catch(e){
                alert(e.message)
            }
            
            
        }


    }
    return(
        <div className="Li-Container">
            <Form
                onFinish={handleLogin}
            >
            <Form.Item label='Email/Phone' name={'email'}
            >
                <Input 
                className="Email"
                placeholder="Email/Phone"
                prefix={<UserOutlined className="Icons-User"></UserOutlined>}/>
            </Form.Item>
            <Form.Item
                label="Password"
                name="password"
            >
                <Input.Password 
                className="Password"
                placeholder="Password"
                iconRender={visible => (visible ? <span className="Icon-Password"> <EyeTwoTone  /> </span>: 
                <span className="Icon-Password"> <EyeInvisibleOutlined  /> </span> )}
                />
            </Form.Item>
            {errMsg ? <span className="errorMsg">{errMsg}</span>: ""} 
            <br />
            <input 
            type="submit"
            value="Login"
            onClick={handleLogin}
            className="Li-button"/>
            
            </Form>
            
            <br />
            <span className="No-Acc">Dont Have an Account? <Link to={"/Signup"}><u className="SignUp">Sign Up</u></Link></span>

        </div>
    
    )   
}
export default Login