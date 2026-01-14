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
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminLayout from "./layouts/AdminLayout";

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

                      <Route path="/admin" element={<AdminLayout title="Readory Admin" />}>
                          <Route index element={<Navigate to="/admin/users" replace />} />
                          <Route path="users" element={<AdminUsersPage />} />

                          {/* 나중에 추가 */}
                          <Route path="logs/auth" element={<div>인증 로그(준비중)</div>} />
                          <Route path="books" element={<div>책 관리(준비중)</div>} />
                          <Route path="records" element={<div>기록 관리(준비중)</div>} />
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