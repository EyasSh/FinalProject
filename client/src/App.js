import './App.css';
import Login from './LogIn/login';
import SignUp from './SignUp/SignUp';
import User from './User/User';
import Home from './Home/Home'
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route exact path="/" element={<Login />}></Route>
          <Route exact path="/Signup" element={<SignUp />}></Route>
          <Route exact path='/User' element={<User />}></Route>
          <Route exact path='/User/Home' element={<Home />}>
            <Route exact path='/User/Home/Chats' 
              element={<h1>chats work</h1>}>
            </Route>
            <Route exact path='/User/Home/Contacts'
              element={<h1>contacts work</h1>}>
            </Route>
          </Route>
          
        </Routes>
      </Router>
    </div>
  );
}

export default App;
