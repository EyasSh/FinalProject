import './App.css';
import Login from './LogIn/login';
import SignUp from './SignUp/SignUp';
import Home from './Home/Home'
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";
import { useState } from 'react';

function App() {
  const [keyData, setKeyData] = useState({})
  return (
    <div>
      <Router>
        <Routes>
          <Route exact path="/" element={<Login keyData={keyData} setKeyData={setKeyData} />}></Route>
          <Route exact path="/Signup" element={<SignUp keyData={keyData} setKeyData={setKeyData} />}></Route>
          <Route exact path='/App' element={<Home keyData={keyData} setKeyData={setKeyData}/>}>
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
