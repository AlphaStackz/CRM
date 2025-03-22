import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoginForm from '../../Components/LoginForm';

const RegisterPage = () => {
    const navigate = useNavigate();
    // **update: Get the token parameter from the URL instead of id
    const { token } = useParams();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    // **update: Fetch pending user info by token from GET /register/{token}
    useEffect(() => {
        fetch(`/register/${token}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch user info.");
                }
                return response.json();
            })
            .then((data) => {
                // Pre-fill the username field with the username returned by the server
                setUserName(data.userName);
            })
            .catch((error) => {
                console.error("Error fetching user info:", error);
            });
    }, [token]);
    // **update: End fetch pending user info

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // **update: Call PUT /register to update the pending user record with new password
            fetch('/register', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    User_name: userName,
                    Password: password
                }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Password update failed. Please try again.');
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Registration completed successfully:', data);
                    navigate('/login');
                })
                .catch((error) => {
                    console.error(error.message);
                    setErrors({ general: error.message });
                });
            // **update: End update
        }
    };

    return (
        <LoginForm
            title="Set new Password"
            isLoginForm={false}
            handleSubmit={handleSubmit}
            userName={userName}
            setUserName={setUserName}
            password={password}
            setPassword={setPassword}
            errors={errors}
        />
    );
};

export default RegisterPage;
