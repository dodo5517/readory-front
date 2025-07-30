import React from 'react';
import { Route, Routes } from "react-router-dom";
import RootRedirect from "./components/RootRedirect";
import Login from "./components/Login";
// import Footer from './components/Footer';
import Main from './pages/Main';
import ReadingRecordsPage from "./pages/ReadingRecordsPage";
import PrivateRoute from "./components/PrivateRoute";
import { UserProvider } from './contexts/UserContext';
import './App.css';
import Layout from "./components/Layout";
import SignUp from "./components/SignUp";

function App() {
  return (
      <div className="app-container">
          <UserProvider>
              <Routes>
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="/login" element={<Login/>}/>
                  <Route path="/signUp" element={<SignUp/>}/>


                      <Route element={<Layout />}>
                          <Route path="/main" element={<PrivateRoute><Main/></PrivateRoute>} />
                          <Route path="/readingrecords" element={<PrivateRoute><ReadingRecordsPage/></PrivateRoute>}/>
                      </Route>
              </Routes>
            {/*<Footer />*/}
          </UserProvider>
      </div>
  );
}

export default App;