import { Typography} from '@mui/material'
import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from 'react'
import List from '../../Components/List';
// import {StyledMainCard } from '../../Components/styles';

const MyCase = () => {
    const [userCases,setUserCases]=useState([]);
    const [searchQuery, setSearchQuery] = useState("");



    useEffect(() => {
        const fetchAllCases = () => {

            fetch("/api/user-cases/7", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Fetched data:", data);
                    setUserCases(data);
                })
                .catch((error) => console.error("fetch error:", error));
        };

        fetchAllCases();
    }, []);
    const columns = [
        { field: "title", headerName: "Title" },
        { field: "status", headerName: "Status" },
        { field: "category", headerName: "Category" },
        { field: "customer_first_name", headerName: "First Name" },
        { field: "customer_last_name", headerName: "Last Name" },
        { field: "case_opened", headerName: "Opened" },
        { field: "case_closed", headerName: "Closed" },
    ];
    const filteredCases = userCases.filter((caseItem) =>
        Object.values(caseItem).some(
            (value) =>
                typeof value === "string" &&
                value.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );


    return (
        <>
            <Typography variant="h3" sx={{margin:"2rem"}}>My Case</Typography>
            {/* <StyledMainCard> */}
            <TextField
                label="Search Users"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* </Stack> */}

            <List title="User Cases" columns={columns} rows={filteredCases} />
            {/* </StyledMainCard> */}
        </>
    );
};

export default MyCase;