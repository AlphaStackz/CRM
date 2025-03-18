import ModeEditOutlineTwoToneIcon from '@mui/icons-material/ModeEditOutlineTwoTone';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useState } from 'react';
import Button from '@mui/material/Button';

function UpdateUser() {
    // State to control whether the dialog is open
    const [open, setOpen] = useState(false);

    // Local state for the search input
    const [searchQuery, setSearchQuery] = useState('');

    // Example state for search results (array)
    const [searchResults, setSearchResults] = useState([]);

    // Handler to open the dialog
    const handleOpen = () => {
        setOpen(true);
    };

    // Handler to close the dialog
    const handleClose = () => {
        setOpen(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Handler for updating the search query
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Handler for performing the search
    const handleSearch = () => {
        // Example: dummy data
        const dummyUsers = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' },
            { id: 4, name: 'Diana' },
        ];

        // Filter logic as an example:
        const filtered = dummyUsers.filter((user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setSearchResults(filtered);
    };

    return (
        <div>
            {/* Wrap the icon in IconButton instead of putting IconButton inside the icon */}
            <IconButton color="primary" onClick={handleOpen}>
                <ModeEditOutlineTwoToneIcon/>
            </IconButton>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-title"
                maxWidth="xs"
                fullWidth
                BackdropProps={{
                    // For blur, must use `backdropFilter`
                    style: { backdropFilter: 'blur(5px)' },
                }}
            >
                <DialogTitle id="dialog-title">Small Popup</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Search for User"
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                        style={{ marginBottom: '1rem' }}
                    />
                    <Button variant="contained" onClick={handleSearch} color="primary">
                        Search
                    </Button>

                    <div style={{ marginTop: '1rem' }}>
                        {/* Show message if user typed something but got no results */}
                        {searchResults.length === 0 && searchQuery.length > 0 && (
                            <p>No results found for "{searchQuery}".</p>
                        )}

                        {/* Otherwise, display list of matching users */}
                        {searchResults.map((user) => (
                            <div key={user.id}>
                                <p>{user.name}</p>
                            </div>
                        ))}
                    </div>

                    <DialogActions style={{ marginTop: '1rem' }}>
                        <p>Are you sure you want to edit this user?</p>
                    </DialogActions>
                </DialogContent>
                <DialogActions>
                    <IconButton onClick={handleClose} color="primary">
                        Cancel
                    </IconButton>
                    <IconButton onClick={handleClose} color="primary" variant="contained">
                        Submit
                    </IconButton>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default UpdateUser;
