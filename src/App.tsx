import React from 'react';
import {Navigate, Route, Routes} from "react-router-dom";
import RootRedirect from "./components/RootRedirect";
import ThemeToggle from './components/ThemeToggle';
import Login from "./components/Login";
// import Footer from './components/Footer';
import Main from './pages/Main';
import ReadingRecordsPage from "./pages/ReadingRecordsPage";
import BookshelfPage from "./pages/BookshelfPage";
import PrivateRoute from "./components/PrivateRoute";
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import './App.css';
import Layout from "./layouts/Layout";
import SignUp from "./components/SignUp";
import MyPage from "./pages/MyPage";
import EditNamePage from "./pages/EditNamePage";
import EditPasswordPage from "./pages/EditPasswordPage";
import OAuthCallback from "./components/OAuthCallback";
import BookRecordPage from "./pages/BookRecordPage";
import CalendarPage from "./pages/CalendarPage";
import AdminUserPage from "./pages/AdminUserPage";
import AdminNav from "./layouts/AdminNav";
import AdminLayout from "./layouts/AdminLayout"
import AdminLogPage from "./pages/AdminAuthLogPage";
import AdminApiLogsPage from "./pages/AdminApiLogPage";
import AdminBookPage from "./pages/AdminBookPage";
import GuidePage from "./pages/GuidePage ";
import FaqPage from "./pages/FaqPage";
import AdminRecordPage from "./pages/AdminRecordPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function App() {
  return (
      <div className="app-container">
          <ThemeProvider>
              <UserProvider>
                  <ThemeToggle />
                  <Routes>
                      <Route path={"/"} element={<RootRedirect />} />
                      <Route path={"/login"} element={<Login/>}/>
                      <Route path={"/signUp"} element={<SignUp/>}/>
                      <Route path={"/oauth/callback"} element={<OAuthCallback/>}/>
                      <Route path="/guide" element={<GuidePage />} />
                      <Route path="/notice" element={<FaqPage />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />

                      <Route element={<AdminLayout />}>
                          <Route path="/admin" element={<AdminNav title="Readory Admin" />}>
                              <Route index element={<Navigate to="/admin/users" replace />} />
                              <Route path="users" element={<AdminUserPage />} />
                              <Route path="auth/logs" element={<AdminLogPage/>} />
                              <Route path="api/logs" element={<AdminApiLogsPage/>} />
                              <Route path="refreshTokens" element={<div>토큰 관리(준비중)</div>} />
                              <Route path="books" element={<AdminBookPage/>} />
                              <Route path="records" element={<AdminRecordPage/>} />
                          </Route>
                      </Route>

                      <Route element={<Layout />}>
                          <Route path={"/main"} element={<PrivateRoute><Main/></PrivateRoute>} />
                          <Route path={"/myPage"} element={<PrivateRoute><MyPage/></PrivateRoute>} />
                          <Route path={"/myPage/edit-name"} element={<PrivateRoute><EditNamePage/></PrivateRoute>} />
                          <Route path={"/myPage/edit-password"} element={<PrivateRoute><EditPasswordPage/></PrivateRoute>} />
                          <Route path={"/readingRecords"} element={<PrivateRoute><ReadingRecordsPage/></PrivateRoute>}/>
                          <Route path={"/bookshelf"} element={<PrivateRoute><BookshelfPage /></PrivateRoute>} />
                          <Route path={"/bookRecord/:bookId"} element={<PrivateRoute><BookRecordPage /></PrivateRoute>} />
                          <Route path={"/calendar"} element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
                      </Route>
                  </Routes>
                {/*<Footer />*/}
              </UserProvider>
          </ThemeProvider>
      </div>
  );
}

export default App;