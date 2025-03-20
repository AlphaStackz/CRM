import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import CaseList from './Pages/Backoffice/CaseList';
import UserList from './Pages/Backoffice/UserList';
import AdminHomePage from './Pages/Backoffice/AdminHomePage';
import WebShop from './Pages/Webpage/WebShop';
import MyCase from './Pages/Backoffice/MyCase';
import ChatPage from './Pages/Webpage/ChatPage';
import LoginPage from './Pages/BackOffice/LoginPage';
import RegisterPage from './Pages/BackOffice/RegisterPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<WebShop/>} />
                    <Route path="chat-page/:chatToken" element={<ChatPage />} />
                    <Route path="my-case" element={<MyCase />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register/:id" element={<RegisterPage />} />
                    <Route path="cases" element={<CaseList />} />
                    <Route path="admin-home-page" element={<AdminHomePage />} />
                    <Route path="user-list" element={<UserList />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
