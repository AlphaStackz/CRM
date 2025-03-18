import React, { useState } from "react";
import {TableBody, TableCell, TableContainer, TableHead,  Paper, Collapse, Card,
    CardContent,} from "@mui/material";
import Chat from "../Components/Chat.jsx";

import {
    StyledTable,
    StyledTableRow,
    StyledCard,
    StyledTableCell
} from './styles.jsx';

const List = ({ columns, rows, title }) => {
    const [expandedRow, setExpandedRow] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCaseId, setSelectedCaseId] = useState(null);

    //  Added logic to filter cases based on searchQuery
    const filteredCases = rows.filter(caseItem =>
        caseItem.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRowClick = (caseId) => {
        setSelectedCaseId(caseId);
        setExpandedRow(expandedRow === caseId ? null : caseId);
    };
    //Find selected case based on selectedCaseId
    const selectedCase = rows.find(caseItem => caseItem.id === selectedCaseId);

    return (
        <>
            <TableContainer component={Paper} sx={{overflowX: 'auto',overflow:'scroll',maxHeight:'70vh',width:'80vw'}} >

                <StyledTable stickyHeader>
                    <TableHead sx={{backgroundColor:'#e3f2fd'}}>
                        <StyledTableRow>
                            {columns.map((column) => (
                                <TableCell  key={column.field} style={{backgroundColor:'#e3f2fd',fontWeight: "600",fontSize:'1rem'}}>
                                    {column.headerName}
                                </TableCell>
                            ))}
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCases.map((caseItem) => (
                            <React.Fragment key={caseItem.id}>
                                {/* Case Row */}
                                <StyledTableRow onClick={() => handleRowClick(caseItem.id)} style={{ cursor: "pointer" }}>
                                    {columns.map((column) => (
                                        <StyledTableCell key={column.field}>{caseItem[column.field]}</StyledTableCell>
                                    ))}
                                </StyledTableRow>

                                {/* Case Details Dropdown */}
                                <StyledTableRow>
                                    <StyledTableCell colSpan={columns.length} style={{ padding: 0, borderBottom: "none" }}>
                                        <Collapse in={expandedRow === caseItem.id} timeout="auto" unmountOnExit>
                                            <StyledCard sx={{  backgroundColor: '#e3f2fd', borderRadius: "10px",width:'100%' }}>
                                                <CardContent>
                                                    <Chat customerChat={false} userCases={rows} selectedCase={selectedCase}/>
                                                </CardContent>
                                            </StyledCard>
                                        </Collapse>
                                    </StyledTableCell>
                                </StyledTableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </StyledTable>
            </TableContainer >
        </>
    );
};

export default List;
