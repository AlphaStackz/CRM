import { Stack,Card, CardMedia, CardContent, Typography } from '@mui/material'
import Grid from '@mui/material/Grid';
import NewCustomerMessage from "../../Components/NewCustomerMessage.jsx";
import Chat from "../../Components/Chat.jsx";
import React from 'react'
import hotels from '../../data/hotels.js'
const WebShop = () => {
    return (
        <>
            <Typography variant="h3">Stay at our top unique properties</Typography>
            <Typography variant="subtitle1" sx={{margin:"1rem"}}>From castles and villas to boats and igloos, we've got it all</Typography>
            <Grid container spacing={2}>
                {hotels.map((hotel, index) => (
                    <Grid item xs={8} sm={4} key={index}>
                        <Card>
                            <CardMedia component="img" height="350" image={hotel.image} alt={hotel.hotel_name} />
                            <CardContent>
                                <Stack
                                    direction="row" spacing={20}>
                                    <Typography variant="h6">{hotel.hotel_name}</Typography>
                                    <Typography variant="subtitle1" sx={{fontWeight:"700",fontSize:"1.2rem"}}>{hotel.hotel_price} kr</Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <NewCustomerMessage />
        </>
    )
}

export default WebShop