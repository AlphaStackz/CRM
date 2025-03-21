import React, { useState } from 'react';
import {
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button
} from '@mui/material';
import AddBoxTwoToneIcon from '@mui/icons-material/AddBoxTwoTone';

function AddNewUser({ onUserAdded }) {
    const [open, setOpen] = useState(false);

    const [userData, setUserData] = useState({
        user_name: '',
        email: '',
        password: '',
        role: 'customer_support', // Default role
        active: true, // Default active status
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        if (!userData.user_name.trim() || !userData.email.trim() || !userData.password.trim()) {
            alert('Alla fält är obligatoriska!');
            return;
        }

        try {
            const response = await fetch('/api/new-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                alert('User added successfully!');
                setUserData({ user_name: '', email: '', password: '', role: 'customer_support', active: true });
                handleClose();

                // ✅ Call parent function to refresh user list
                if (onUserAdded) onUserAdded();
            } else {
                const errorData = await response.json();
                alert(`Error adding user: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <IconButton color="primary" onClick={handleOpen}>
                <AddBoxTwoToneIcon />
            </IconButton>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-title"
                maxWidth="xs"
                fullWidth
                BackdropProps={{
                    style: { backdropFilter: 'blur(5px)' },
                }}
            >
                <DialogTitle id="dialog-title">Add New User</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Användarnamn"
                        name="user_name"
                        value={userData.user_name}
                        onChange={handleChange}
                        margin="dense"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Epostadress"
                        name="email"
                        type="email"
                        value={userData.email}
                        onChange={handleChange}
                        margin="dense"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Lösenord"
                        name="password"
                        type="password"
                        value={userData.password}
                        onChange={handleChange}
                        margin="dense"
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary" variant="contained">
                        Add User
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AddNewUser;
