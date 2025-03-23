import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoginForm from '../../Components/LoginForm';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    // 1) Fetch the username from GET /api/register/{token}
    useEffect(() => {
        fetch(`/api/register/${token}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch user info.");
                }
                return res.json();
            })
            .then((data) => {
                // Pre-fill the username in state with the value returned from the server
                setUserName(data.userName);
            })
            .catch((err) => {
                console.error("Error fetching user info:", err);
            });
    }, [token]);
    

    // 2) Validate
    const validate = () => {
        let tempErrors = {};
        tempErrors.userName = userName ? '' : 'Username is required';
        tempErrors.password =
            password && password.length >= 6
                ? ''
                : 'Password must be at least 6 characters long';
        setErrors(tempErrors);
        return Object.values(tempErrors).every((x) => x === '');
    };

    // 3) Submit -> POST /register
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        fetch('/api/register', {
            method: 'POST', // Using POST to complete registration
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                User_name: userName,
                Password: password
            })
        })
            .then((res) => {
                if (!res.ok) throw new Error('Password update failed. Please try again.');
                return res.json();
            })
            .then((data) => {
                console.log('Registration completed successfully:', data);
                navigate('/login');
            })
            .catch((error) => {
                console.error(error.message);
                setErrors({ general: error.message });
            });
    };

    return (
        <LoginForm
            title="Set New Password"
            isLoginForm={false}
            handleSubmit={handleSubmit}
            userName={userName}
            setUserName={setUserName}
            password={password}
            setPassword={setPassword}
            errors={errors}
            readOnlyUser={true} // Make the username field read-only so it can't be changed
        />
    );
};

export default RegisterPage;
