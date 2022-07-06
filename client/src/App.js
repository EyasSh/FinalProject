import './App.css';
import Login from './LogIn/login';
import SignUp from './SignUp/SignUp';
import User from './User/User';
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route exact path="/" element={<Login />}></Route>
          <Route exact path="/Signup" element={<SignUp />}></Route>
          <Route exact path='/User' element={<User />}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
