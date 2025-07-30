import React from 'react';
import { Route, Routes } from "react-router-dom";
import RootRedirect from "./components/RootRedirect";
import Login from "./components/Login";
// import Footer from './components/Footer';
import Main from './pages/Main';
import ReadingRecordsPage from "./pages/ReadingRecordsPage";
import PrivateRoute from "./components/PrivateRoute";
import './App.css';
import Layout from "./components/Layout";

function App() {
  return (
      <div className="app-container">
              <Routes>
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="/login" element={<Login/>}/>

                  <Route path="/" element={<Layout />}>
                      <Route path="/main" element={<PrivateRoute><Main/></PrivateRoute>} />
                      <Route path="/readingrecords" element={<PrivateRoute><ReadingRecordsPage/></PrivateRoute>}/>
                  </Route>
              </Routes>
            {/*<Footer />*/}
      </div>
  );
}

export default App;