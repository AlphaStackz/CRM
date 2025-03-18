import React from 'react'
import Menu from '../../Components/Menu'
import UserList from './UserList'
import NewUserForm from '../../Components/NewUserForm'

const AdminHomePage = () => {
    return (
        <>
            <h1>hello user</h1>
            <Menu></Menu>
            <UserList></UserList>
            <NewUserForm></NewUserForm>
        </>
    )
}

export default AdminHomePage