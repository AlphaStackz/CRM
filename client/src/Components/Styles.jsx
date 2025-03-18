import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Card from '@mui/material/Card';



export const StyledTable = styled(Table)({


});

export const StyledTableCell = styled(TableCell)({
    width:'auto',

});
export const StyledUserTableCell = styled(TableCell)({
    fontWeight: 'bold',

});

export const StyledTableRow = styled(TableRow)({
    height: '.3rem'

});

export const StyledCard = styled(Card)({
    borderRadius: '10px',
    width:'100vw'
});

