import React from 'react';
import { Route, Routes } from "react-router-dom";
import RootRedirect from "./components/RootRedirect";
import ThemeToggle from './components/ThemeToggle';
import Login from "./components/Login";
// import Footer from './components/Footer';
import Main from './pages/Main';
import ReadingRecordsPage from "./pages/ReadingRecordsPage";
import PrivateRoute from "./components/PrivateRoute";
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import './App.css';
import Layout from "./components/Layout";
import SignUp from "./components/SignUp";
import MyPage from "./components/MyPage";

function App() {
  return (
      <div className="app-container">
          <ThemeProvider>
              <UserProvider>
                  <ThemeToggle />
                  <Routes>
                      <Route path="/" element={<RootRedirect />} />
                      <Route path="/login" element={<Login/>}/>
                      <Route path="/signUp" element={<SignUp/>}/>


                      <Route element={<Layout />}>
                          <Route path="/main" element={<PrivateRoute><Main/></PrivateRoute>} />
                          <Route path={"/myPage"} element={<PrivateRoute><MyPage/></PrivateRoute>} />
                          <Route path="/readingrecords" element={<PrivateRoute><ReadingRecordsPage/></PrivateRoute>}/>
                      </Route>
                  </Routes>
                {/*<Footer />*/}
              </UserProvider>
          </ThemeProvider>
      </div>
  );
}

export default App;