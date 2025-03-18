import React from 'react'
import Menu from './Components/Menu'
import { Outlet } from 'react-router'


const Layout = () => {

    return (
        <>
            <header>
                <Menu/>
            </header>
            <main>
                <Outlet/>
            </main>
        </>
    )
}

export default Layout