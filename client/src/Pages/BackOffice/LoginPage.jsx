import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const Login = () => {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Match the C# property names exactly:
          User_name: userName,
          Password: password
        }),
      })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Login failed. Please check your credentials.');
            }
            return response.json();
          })
          .then((data) => {
            console.log('Login successful:', data);
            // Optionally store user info in context
            login({ name: userName, userName });
            // Redirect after successful login
            navigate('/');
          })
          .catch((error) => {
            console.error(error.message);
            setErrors({ general: error.message });
          });
    }
  };

  return (
      <Container maxWidth="sm">
        <Box mt={8} p={3} boxShadow={3} borderRadius={2}>
          <Typography variant="h5" gutterBottom>
            Login
          </Typography>
          {errors.general && (
              <Typography color="error" variant="body2">
                {errors.general}
              </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                error={!!errors.userName}
                helperText={errors.userName}
            />
            <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
            />
            <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
            >
              Login
            </Button>
          </form>
        </Box>
      </Container>
  );
};

export default Login;
