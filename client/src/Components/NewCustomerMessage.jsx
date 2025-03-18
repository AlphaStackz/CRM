import React, { useState } from 'react';
import {IconButton, TextField, Dialog, DialogTitle, DialogActions, DialogContent, Select, MenuItem, InputLabel, FormControl} from '@mui/material'
import CommentIcon from '@mui/icons-material/Comment';
import Button from "@mui/material/Button";

export default function NewCustomerMessage() {
    const [open, setOpen] = useState(false);

    const [caseData, setCaseData] = useState({
        category: "",
        customer_email: "",
        title: "",
        customer_first_name: "",
        customer_last_name: "",
        case_message: "",

    });


    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCaseData({
            ...caseData,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        if (Object.values(caseData).some((value) => !String(value).trim())) {
            alert("Alla fält är obligatoriska!");
            return;
        }
        const requestBody = {
            caseData, // Separating case
            messageData: { // separating message from case
                text: caseData.case_message,
                is_sender_customer: true} // adding sender: customer
        };
        try {
            const respons = await fetch("/api/cases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (respons.ok) {
                alert("Message sent successfully"); /*Change to open dialog at later stage*/
                handleClose();
                setCaseData( {
                    category: "",
                    title: "",
                    customer_first_name: "",
                    customer_last_name: "",
                    customer_email: "",
                    case_message: ""
                });
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };
    return (
        <>
            {/*Add IconButton showing icon and handleOpen onClick Icon*/}
            <IconButton color="primary" onClick={handleOpen} sx={{padding:'.7rem' ,marginLeft:'75rem'}}>
                <CommentIcon sx={{fontSize:'4rem' ,color:'#42a5f5', marginRight:'auto'}} />
            </IconButton>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
                maxWidth="xs"
                fullWidth
                slotProps={{ /*Position lower right*/
                    paper: {
                        sx: {
                            position: "fixed",
                            bottom: 16,
                            right: 16,
                            margin: 0,
                            width: "500px"
                        }
                    },
                    backdrop: {
                        sx: {
                            backdropFilter: "blur(5px)",
                        }
                    }
                }}
            >
                <DialogTitle id="form-dialog-title">Case Title</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                            labelId="category-label"
                            id="category"
                            name="category"
                            value={caseData.category}
                            onChange={handleChange}
                            label="Kategori"
                        >
                            <MenuItem value="shipping">Shipping</MenuItem>
                            <MenuItem value="payment">Payment</MenuItem>
                            <MenuItem value="product">Product</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="E-postadress"
                        name="customer_email"
                        type="email"
                        value={caseData.customer_email}
                        onChange={handleChange}
                        margin="dense"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Förnamn"
                        name="customer_first_name"
                        value={caseData.customer_first_name}
                        onChange={handleChange}
                        margin="dense"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Efternamn"
                        name="customer_last_name"
                        value={caseData.customer_last_name}
                        onChange={handleChange}
                        margin="dense"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Rubrik"
                        name="title"
                        value={caseData.title}
                        onChange={handleChange}
                        margin="dense"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Beskriv ditt ärende"
                        name="case_message"
                        value={caseData.case_message}
                        onChange={handleChange}
                        margin="dense"
                        multiline={true}
                        rows={5}
                        /*maxRows={7}*/
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary" variant="contained">
                        Send</Button>
                </DialogActions>

            </Dialog>
        </>
    )
}