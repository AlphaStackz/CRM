import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogActions,
    Button,
    IconButton
} from '@mui/material';
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

// *** CHANGED the component signature to receive `open` and `userId`.
function DeleteUser({ open, userId, user_name, handleClose, handleDelete }) {
    return (
        <Dialog
            // *** Pass the boolean open prop
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-title"
            maxWidth="xs"
            fullWidth
            BackdropProps={{
                style: { backdropFilter: 'blur(5px)' },
            }}
        >
            <DialogTitle id="dialog-title">Are you sure you want to delete: {user_name}</DialogTitle>

            {/* *** Removed the second IconButton from here, so it doesn’t open again. */}
            <DialogActions>
                <Button onClick={handleClose} color="error" variant="contained">
                    Cancel
                </Button>
                {/* *** On click, call handleDelete with userId */}
                <Button
                    type="submit"
                    onClick={() => handleDelete(userId)}
                    color="primary"
                    variant="contained"
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DeleteUser;
