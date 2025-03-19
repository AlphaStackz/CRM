import AddBoxTwoToneIcon from '@mui/icons-material/AddBoxTwoTone';

import React, {useEffect, useState} from 'react';
import {
    IconButton, 
    Dialog, 
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button
} from "@mui/material";
import UserList from "../Pages/Backoffice/UserList";

function AddNewUser() {
    const [open, setOpen] = useState(false);
    
    const [userData, setUserData] = useState({
        user_name: "",
        email: "",
        password: "",
        role: "customer_support", // Hardcoded admin inserts new user
        active: true, // Hardcoded Active automatically
    });
    
    const handleOpen = () => setOpen(true);

    const handleClose = () => setOpen(false);

    // e = event, handles input changes
    const handleChange = (e) => {
        setUserData({
            ...userData, 
            [e.target.name]: e.target.value, // name = username, email, password. value = input 
        });
    };

    const handleSubmit = async () => {
        if (!userData.user_name.trim() || !userData.email.trim() || !userData.password.trim()) {
            alert("Alla fält är obligatoriska!");
            return;
        }
        try {
            const response = await fetch("/api/new-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                alert("User added successfully!");
                handleClose();
                UserList;
                setUserData({ user_name: "", email: "", password: "" }); // Nollställer formuläret
            } 
            else {
                // If the response is not ok, attempt to parse the response body
                const errorData = await response.json(); // assuming the response is JSON
                console.error("Error response:", errorData); // Log error details
                alert(`Error adding user: ${errorData.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div>
            {/* Button to open the form */}
            <IconButton color="primary" onClick={handleOpen}>
                <AddBoxTwoToneIcon/>
            </IconButton>
            
            {/* Dialog with a form */}
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-title"
                maxWidth="xs"
                fullWidth
                BackdropProps={{
                    style: { backdropFilter: "blur(5px)" },
                }}
            >
                <DialogTitle id="dialog-title">Add New User</DialogTitle>
                <DialogContent>
                    {/* Input fields for user details */}
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
                    {/* Submit & Cancel Buttons */}
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
