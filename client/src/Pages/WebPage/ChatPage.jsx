import Chat from "../../Components/Chat.jsx"
import React from "react";
import { useParams } from "react-router-dom";

const ChatPage = () => {
    const { chatToken } = useParams();

    if (!chatToken) return <p>Invalid chat session!</p>

    return (
        <>
            <h1>Chat</h1>
            <Chat customerChat={true} userCases={[]} selectedCase={null} chatToken={chatToken}/>
        </>
    )
}
export default ChatPage;
