import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Button, TableSortLabel } from '@mui/material'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { IconButton, Typography,Stack, TextField} from '@mui/material';
import DeleteDialog from '../../Components/DeleteUser';

import AddNewUser from '../../Components/AddNewUser';
import UpdateUserIcon from'../../Components/UpdateUser';

export default function UserList() {
    const [userData, setUserData] = useState([]); // store userdata from API
    const [searchQuery, setSearchQuery] = useState(''); // setting search to useState
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc'}); // setting column filter to use State

    // 
    const [isOpen, setIsOpen] = useState(false);            // used to control DeleteDialog open state
    const [selectedUserId, setSelectedUserId] = useState(null); // track which user is being deleted
    const [selectedUser_name, setSelectedUser_name] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            setUserData(data);
            console.log('Fetched users:', data);
        } catch (error) {
            console.error('fetch error:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' // Setting sort direction
        }));
    };

    // CHANGED: handleDelete is only for doing the DELETE fetch
    const handleDelete = (id) => {
        console.log("Deleting user with ID:", id);
        fetch(`/api/users/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
            .then(() => {
                console.log("User deleted successfully");
                setIsOpen(false); // closing the dialog when finished -.- 
                // Refetch or remove from local state:
                setUserData(prevData => prevData.filter(user => user.id !== id));
            })
            .catch((error) => console.error("Delete error:", error));
    };

    // Just open/close the dialog and set user to delete
    const handleDialogOpen = (user) => {
        setSelectedUserId(user.id); // storing user ID
        setSelectedUser_name(user.user_name); // storing username to show which User to delete
        setIsOpen(true);
    };

    const handleDialogClose = () => {
        setIsOpen(false);
    };

    // Sort userData for column and direction
    const sortedData = [...userData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    })];

    // Filter userData for search
    const filteredData = userData.filter(user =>
        user.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
             <Typography variant='h3'>Users</Typography>
        <Stack direction={'row'} >
        <AddNewUser onUserAdded={fetchUsers} />
        {/* //  handleSubmit={handleAddSubmit} newUser={newUser} setNewUser={setNewUser} */}
        <UpdateUserIcon />
        </Stack>
            <TextField
                label="Search Users"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 600 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Aktiv</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'id'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('id')}
                                >
                                    ID
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'user_name'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('user_name')}
                                >
                                    Användarnamn
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'email'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('email')}
                                >
                                    E-post
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'role'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('role')}
                                >
                                    Roll
                                </TableSortLabel>
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((user) => (
                            <TableRow
                                key={user.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell align="right">
                                    <Box
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            backgroundColor: user.active ? "green" : "red",
                                            borderRadius: "2px"
                                        }}
                                    />
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {user.id}
                                </TableCell>
                                <TableCell align="left">{user.user_name}</TableCell>
                                <TableCell align="left">{user.email}</TableCell>
                                <TableCell align="left">{user.role}</TableCell>
                                <TableCell align="left">
                                    {/* open the dialog with the selected user (to get id & name) */}
                                    <IconButton onClick={() => handleDialogOpen(user)} color="primary">
                                        <DeleteOutlineRoundedIcon/>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Only render the DeleteDialog if isOpen === true */}
            {isOpen && (
                <DeleteDialog
                    // Pass a boolean to the open prop
                    open={isOpen}
                    // Pass the userId & user_name so the dialog knows which ID & Name to delete
                    userId={selectedUserId}
                    user_name={selectedUser_name}
                    handleClose={handleDialogClose}
                    handleDelete={handleDelete}
                />
            )}
        </>
    )
}