import React from 'react'
import {useEffect,useState} from "react";
import Typography from '@mui/material/Typography';
import List from '../../Components/List';
// import { StyledMainCard } from '../../Components/styles';
import { TextField } from '@mui/material';


const CaseList = () => {
    // store the array of case objects
    const [cases, setCases] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");


    useEffect(() => {
        console.log("Calling useEffect");

        const fetchAllCases = () => {
            console.log("Fetching cases...");

            fetch("/api/cases", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Fetched data:", data);
                    setCases(data);
                })
                .catch((error) => console.error("fetch error:", error));
        };

        fetchAllCases();
    }, []);


    const columns = [
        { field: "id", headerName: "ID" },
        { field: "status", headerName: "Status" },
        { field: "category", headerName: "Category" },
        { field: "title", headerName: "Title" },
        { field: "customer_first_name", headerName: "First Name" },
        { field: "customer_last_name", headerName: "Last Name" },
        { field: "customer_email", headerName: "Email" },
        { field: "case_opened", headerName: "Opened" },
    ];

    const filteredCases = cases.filter((caseItem) =>
        Object.values(caseItem).some(
            (value) =>
                typeof value === "string" &&
                value.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return<>
        <Typography variant="h3" sx={{margin:"2rem"}}>All Case</Typography>
        {/* <StyledMainCard > */}
        <TextField
            label="Search Users"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search state
        />
        <List title="Case List" columns={columns} rows={filteredCases} />
        {/* </StyledMainCard> */}
    </>
};

export default CaseList;
