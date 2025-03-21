import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoginForm from '../../Components/LoginForm';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { registertoken } = useParams(); 
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
      fetch(`/api/users/${registertoken}`, { 
        method: 'PATCH',
        credentials:'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          User_name: userName,
          New_password: password,
        }),
      })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Password update failed. Please try again.');
            }
            return response.json();
          })
          .then((data) => {
            console.log('Password updated successfully:', data);
            navigate('/login');
          })
          .catch((error) => {
            console.error(error.message);
            setErrors({ general: error.message });
          });
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
