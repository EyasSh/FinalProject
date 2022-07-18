import "./login.css"
import { Link } from "react-router-dom"
import { UserOutlined } from '@ant-design/icons'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import {Input ,Form} from 'antd'
function Login()
{
    return(
        <div className="Li-Container">
            <Form>
            <Form.Item label='Email/Phone' name={'username'}
            rules={[{required:true, message:'Email or Phone Number'}]}
            >
                <Input 
                className="Email"
                placeholder="Email/Phone" 
                prefix={<UserOutlined className="Icons-User"></UserOutlined>}/>
            </Form.Item>
            <Form.Item
                label="Password"
                name="password"
                rules={[
                {
                    required: true,
                    message: 'Please input your password!',
                },
                    ]}
            >
                <Input.Password 
                className="Password"
                placeholder="Password" 
                iconRender={visible => (visible ? <span className="Icon-Password"> <EyeTwoTone  /> </span>: 
                <span className="Icon-Password"> <EyeInvisibleOutlined  /> </span> )}
                />
            </Form.Item>
            <br />
            <input 
            type="submit"
            value="Login"
            
            className="Li-button"/>
            </Form>
            
            
            <br />
            <span className="No-Acc">Dont Have an Account? <Link to={"/Signup"}><u className="SignUp">Sign Up</u></Link></span>

        </div>
    
    )   
}
export default Login