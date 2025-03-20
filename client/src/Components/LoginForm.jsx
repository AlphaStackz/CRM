import React from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const LoginForm = ({
  title,
  isLoginForm,
  handleSubmit,
  userName,
  setUserName,
  password,
  setPassword,
  errors,
}) => {
  return (
    <Container maxWidth="sm">
      <Box mt={8} p={3} boxShadow={3} borderRadius={2}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        {errors?.general && (
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
            error={!!errors?.userName}
            helperText={errors?.userName}
          />
          <TextField
            label={isLoginForm ? 'Password' : 'New Password'}
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors?.password}
            helperText={errors?.password}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            {isLoginForm ? 'Login' : 'Register'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default LoginForm;
