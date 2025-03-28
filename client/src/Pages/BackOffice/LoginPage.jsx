import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../Components/LoginForm';

const LoginPage = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

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
      fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          User_name: userName,
          Password: password,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Page failed. Please check your credentials.');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Login successful:', data);
          login({ name: userName, userName });
          navigate('/');
        })
        .catch((error) => {
          console.error(error.message);
          setErrors({ general: error.message });
        });
    }
  };

  return (
    <LoginForm
      title="Login"
      isLoginForm={true}
      handleSubmit={handleSubmit}
      userName={userName}
      setUserName={setUserName}
      password={password}
      setPassword={setPassword}
      errors={errors}
    />
  );
};

export default LoginPage;
