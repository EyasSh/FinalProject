import './App.css';
import Login from './LogIn/login';
import SignUp from './SignUp/SignUp';
import Home from './Home/Home'
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";
import { useEffect, useState } from 'react';

function App() {
  const [keyData, setKeyData] = useState({})

  const updateKeyData = newKeyData => {
    localStorage.setItem("keyDataEyas'sFinal", JSON.stringify(newKeyData))
    setKeyData(newKeyData)
  }

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("keyDataEyas'sFinal"))
    setKeyData(data ? data : {})
  }, [])
  return (
    <div>
      <Router>
        <Routes>
          <Route exact path="/" element={<Login keyData={keyData} setKeyData={updateKeyData} />}></Route>
          <Route exact path="/Signup" element={<SignUp keyData={keyData} setKeyData={updateKeyData} />}></Route>
          <Route exact path='/App' element={<Home keyData={keyData} setKeyData={updateKeyData}/>}>
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
