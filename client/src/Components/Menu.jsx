import React from 'react';
import { useUser } from '../context/UserContext.jsx';
import { NavLink } from 'react-router-dom';
import { Stack, Button, Typography } from '@mui/material';
import DeleteDialog from './DeleteUser.jsx';
import UpdateUserIcon from './UpdateUser.jsx';
import AddNewUserIcon from './AddNewUser.jsx';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';


const Menu = () => {

    const { user, login, logout } = useUser();

    // const handleLogin = () => {
    //   login({ name: "John Doe" });
    // };

    const linkStyle = {
        textDecoration: 'none',
        width: '100%',
        display: 'block',
        color:'black'
    };
    const buttonStyle = {
        width: '100%',
        height: '48px',
        textTransform: 'none',
        borderRadius: '8px',
        transition: 'background-color 0.3s ease',
        '&:hover': {
            backgroundColor: '#90caf9',
        },
    };
    const activeStyle = {
        backgroundColor: '#b874f1',
        color: 'white',
    };

    return (
        <div
            className="menu-container"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '13rem',
                height: '100%',
                padding: '1rem',
                boxSizing: 'border-box',
                // borderRight: '1px solid #ccc',
                backgroundColor:'#e3f2fd',
            }}
        >
            
        
                {user ? (
                    <>
                      <Typography>{user.name}</Typography>
                      <Button variant="outlined" endIcon={<LogoutIcon />} onClick={logout}>
                        Logout
                      </Button>
                    </>
                  ) : (
                <NavLink to="/login" style={linkStyle} activeStyle={activeStyle}>
                <Button variant="outlined" endIcon={<LoginIcon />}>
                login
                </Button>  
                </NavLink>)
            }
            
         
            <Typography variant='h3' sx={{fontSize:'1.5rem'}}>SeCuReMe</Typography>

            <Stack className="menu-buttons" spacing={2}>
                <div>
                    <DeleteDialog />
                    <UpdateUserIcon />
                    <AddNewUserIcon />
                </div>

                <NavLink to="/" style={linkStyle} activeStyle={activeStyle}>
                    <Button variant="outlined" sx={buttonStyle}>Home</Button>
                </NavLink>

                <NavLink to="/my-case" style={linkStyle} activeStyle={activeStyle}>
                    <Button variant="outlined" sx={buttonStyle}>My Cases</Button>
                </NavLink>

                <NavLink to="/cases" style={linkStyle} activeStyle={activeStyle}>
                    <Button variant="outlined" sx={buttonStyle}>All Cases</Button>
                </NavLink>

                <NavLink to="/user-list" style={linkStyle} activeStyle={activeStyle}>
                    <Button variant="outlined" sx={buttonStyle}>Users</Button>
                </NavLink>
            </Stack>
        </div>
    );
};
export default Menu;
