import React, { useEffect, useState, useRef } from "react";
import { Box, TextField, IconButton, Paper, Typography, Avatar, Stack, Container } from "@mui/material";
import { styled } from "@mui/system";
import SendIcon from '@mui/icons-material/Send';
import Button from "@mui/material/Button";

export default function Chat({ customerChat, userCases, selectedCase, chatToken }) {
    // define props
    const [isCustomerChat, setIsCustomerChat] = useState(customerChat);
    const [fetchedUserCases, setFetchedUserCases] = useState(userCases || []);
    const [fetchedCaseId, setFetchedCaseId] = useState(selectedCase?.id || null);

    // update state if prop changes
    useEffect(() => {
        setIsCustomerChat(customerChat);
        setFetchedUserCases(userCases || []);
        setFetchedCaseId(selectedCase?.id || null);
    }, [customerChat, userCases, selectedCase]);

    // define chatData 
    const [chatData, setChatData] = useState({
        caseDetails: {},
        messages: [],
        user: {},
    });

    // define newMessage for handling a new message
    const [newMessage, setNewMessage] = useState({
        case_id: null,
        is_sender_customer: isCustomerChat,
    });
    // use ref for new message input. Prevents re-rendering
    const [inputRef, setInputRef] = useState();

    // Fetch data for customer's chat
    const fetchCustomerChatData = (chatToken) => {
        fetch(`/api/chat/case/${chatToken}`)
            .then(response => response.json())
            .then(data => {
                setChatData(data);
                setNewMessage(prev => ({
                    ...prev,
                    case_id: data.caseDetails?.id || null,
                }));
            })
            .catch(error => console.log("fetch chatCustomerData error:", error));
    };

    // Fetch data for employee/backoffice chat
    const fetchUserChatData = () => {
        if (!userCases || userCases.length === 0) {
            console.log("No user cases available");
            return;
        }
        const selectedCase = fetchedUserCases.find(caseItem => caseItem.id === fetchedCaseId);
        fetch(`/api/chat/backoffice/${fetchedCaseId}`)
            .then(response => response.json())
            .then(data => {
                const updatedData = {
                    ...data,
                    caseDetails: {
                        ...data.caseDetails,
                        ...selectedCase,
                    }
                };
                setChatData(updatedData);
                setNewMessage(prev => ({
                    ...prev,
                    case_id: fetchedCaseId || null,
                }));
            })
            .catch(error => console.log("fetch chatUserChatData error:", error));
    };

  /*  useEffect(() => {
        if (isCustomerChat) {
            fetchCustomerChatData(chatToken);
        } else {
            fetchUserChatData();
        }
    }, [isCustomerChat, userCases, chatToken]);
*/
    // Handle sending new message via on-click (fetch) logic
    const handleNewMessage = async () => {
        const newMessageText = inputRef.current.value.trim();
        console.log(newMessageText);
        
        if (!newMessage.case_id) {
            alert("Make sure that there is a case connected before sending");
            return;
        }
        if (!newMessageText) {
            alert("No message entered");
            return;
        }

        try {
            const response = await fetch(`/api/chat/new-message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    case_id: newMessage.case_id,
                    text: newMessageText,
                    is_sender_customer: isCustomerChat,
                }),
            });

            if (response.ok) {
                inputRef.current.value = "";
                // Re-fetch updated chat data after sending the message
                if (isCustomerChat) {
                    fetchCustomerChatData(chatToken);
                } else {
                    fetchUserChatData();
                }
            } else {
                const errorData = await response.json();
                console.error("Error response:", errorData);
                alert("Error sending message");
            }
        } catch (error) {
            console.log("Error sending new message:", error);
        }
    };

    // Handle closing case for employee
    const handleCloseCase = async (id) => {
        if (!id) {
            console.error("No provided id for closing case.");
            return;
        }
        try {
            const response = await fetch(`/api/chat/close-case/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            if (!response.ok) {
                console.log(`Failed to close case with id ${id}. Status is ${response.status}`);
            }
        } catch (error) {
            console.error("Error when closing case: ", error);
        }
    };

    // Styled components (unchanged)
    const ChatContainer = styled(Paper)(({ theme }) => ({
        height: isCustomerChat ? "70vh" : "40vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 20px"
    }));

    const MessagesContainer = styled(Box)({
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        "&::-webkit-scrollbar": {
            width: "6px",
        },
        "&::-webkit-scrollbar-track": {
            background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
            background: "grey",
            borderRadius: "3px",
        },
    });

    const MessageBubble = styled(Box, {
        shouldForwardProp: (prop) => prop !== "isUser",
    })(({ isUser }) => ({
        display: "flex",
        alignItems: "flex-start",
        marginBottom: "14px",
        flexDirection: isUser ? "row" : "row-reverse",
    }));

    const MessageContent = styled(Paper)(({ isUser }) => ({
        padding: "12px 16px",
        borderRadius: "16px",
        maxWidth: "70%",
        marginLeft: isUser ? 0 : "12px",
        marginRight: isUser ? "12px" : 0,
        backgroundColor: isUser ? "#e4c2ff" : "#f5f5f5",
        color: "#000",
    }));

    const InputContainer = styled(Box)({
        padding: "20px",
        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
    });

    const ChatHeader = styled(Box)({
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingRight: "15px",
        paddingLeft: "15px",
    });

    const StyledAvatar = styled(Avatar)(({ isUser }) => ({}));

    // UseEffect to update
    useEffect(() => {
        function onTimeOut() {
            if (isCustomerChat) {
                fetchCustomerChatData(chatToken);
            } else {
                fetchUserChatData();
            }
        }
        const timeout = setTimeout(onTimeOut, 1000);

        return () => {clearTimeout(timeout)}
    }, [])

    return (
        <>
            <h1>Live Chat</h1>
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <ChatContainer>
                    <ChatHeader>
                        <h4>Customer: {chatData?.caseDetails?.customer_first_name}</h4>
                        <h3>{chatData?.caseDetails?.title}</h3>
                        <h4>Case handler: {chatData?.user?.user_name}</h4>
                    </ChatHeader>
                    <MessagesContainer>
                        {chatData?.messages
                            ?.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                            .map((message) => (
                                <MessageBubble key={message.id} isUser={message.is_sender_customer}>
                                    <StyledAvatar />
                                    <MessageContent isUser={message.is_sender_customer}>
                                        <Typography variant="body1">{message.text}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: "block" }}>
                                            {message.timestamp}
                                        </Typography>
                                    </MessageContent>
                                </MessageBubble>
                            ))}
                    </MessagesContainer>
                    <InputContainer>
                        <Stack direction="row" spacing={2}>
                            {/* <TextField inputRef={inputRef} fullWidth multiline maxRows={4} />*/}
                            <input type={"text"} onChange={e => setInputRef(e.target.value)} />
                            <IconButton
                                onClick={handleNewMessage}
                                color="inherit"
                                aria-label="Send message..."
                                sx={{ backgroundColor: "#fff", color: "black" }}
                            >
                                <SendIcon />
                            </IconButton>
                            {!customerChat && (
                                <Button variant="outlined" color="inherit" onClick={() => handleCloseCase(chatData?.caseDetails?.id)}>
                                    Close Case
                                </Button>
                            )}
                        </Stack>
                    </InputContainer>
                </ChatContainer>
            </Container>
        </>
    );
}
