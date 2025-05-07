import React from 'react';
import { Route, Routes } from "react-router-dom";
import Header from './components/Header';
// import Footer from './components/Footer';
import Main from './pages/Main';
import ReadingRecordsPage from "./pages/ReadingRecordsPage";
import './App.css';

function App() {
  return (
      <div className="app-container">
        <Header />
          <Routes>
              <Route path="/" element={<Main/>} />
              <Route path="/ReadingRecords" element={<ReadingRecordsPage/>} />
          </Routes>
        {/*<Footer />*/}
      </div>
  );
}

export default App;