import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    IconButton,
    Paper,
    Typography,
    Avatar,
    Stack,
    Container,
    TextField,
    Button
} from "@mui/material";
import { styled } from "@mui/system";
import SendIcon from "@mui/icons-material/Send";

// ---------------------------------------------
// Main Chat component (export default)
// ---------------------------------------------
export default function Chat({ customerChat, userCases, selectedCase, chatToken }) {
    // Basic states
    const [isCustomerChat, setIsCustomerChat] = useState(customerChat);
    const [fetchedCaseId, setFetchedCaseId] = useState(selectedCase?.id || null);

    // Holds all chat data
    const [chatData, setChatData] = useState({
        caseDetails: {},
        messages: [],
        user: {},
    });

    // The text the user is typing
    const [typedMessage, setTypedMessage] = useState("");

    // Tracks the newMessage payload
    const [newMessage, setNewMessage] = useState({
        case_id: null,
        is_sender_customer: isCustomerChat,
    });

    // Sync props to state
    useEffect(() => {
        setIsCustomerChat(customerChat);
        setFetchedCaseId(selectedCase?.id || null);
    }, [customerChat, selectedCase]);

    // ---------------------------------------------
    // Fetch data for customer's chat
    // ---------------------------------------------
    const fetchCustomerChatData = useCallback((token) => {
        fetch(`/api/chat/case/${token}`)
            .then((res) => res.json())
            .then((data) => {
                setChatData(data);
                setNewMessage((prev) => ({
                    ...prev,
                    case_id: data.caseDetails?.id || null,
                }));
            })
            .catch((error) => console.error("fetch chatCustomerData error:", error));
    }, []);

    // ---------------------------------------------
    // Fetch data for employee/backoffice chat
    // ---------------------------------------------
    const fetchUserChatData = useCallback(() => {
        if (!fetchedCaseId) return;

        fetch(`/api/chat/backoffice/${fetchedCaseId}`)
            .then((res) => res.json())
            .then((data) => {
                const updatedData = {
                    ...data,
                    caseDetails: { ...data.caseDetails },
                };
                setChatData(updatedData);
                setNewMessage((prev) => ({
                    ...prev,
                    case_id: fetchedCaseId || null,
                }));
            })
            .catch((error) => console.error("fetch chatUserChatData error:", error));
    }, [fetchedCaseId]);

    // ---------------------------------------------
    // Initial load (once)
    // ---------------------------------------------
    useEffect(() => {
        if (isCustomerChat) {
            fetchCustomerChatData(chatToken);
        } else {
            fetchUserChatData();
        }
    }, [isCustomerChat, chatToken, fetchedCaseId, fetchCustomerChatData, fetchUserChatData]);

    // ---------------------------------------------
    // Polling: fetch messages every 3s
    // ---------------------------------------------
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (isCustomerChat) {
                fetchCustomerChatData(chatToken);
            } else {
                fetchUserChatData();
            }
        }, 3000);

        return () => clearInterval(intervalId);
    }, [isCustomerChat, chatToken, fetchedCaseId, fetchCustomerChatData, fetchUserChatData]);

    // ---------------------------------------------
    // Send a New Message
    // ---------------------------------------------
    const handleNewMessage = async () => {
        const messageText = typedMessage.trim();
        if (!newMessage.case_id) {
            alert("No case connected. Cannot send message.");
            return;
        }
        if (!messageText) {
            alert("No message entered.");
            return;
        }

        try {
            const response = await fetch(`/api/chat/new-message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    case_id: newMessage.case_id,
                    text: messageText,
                    is_sender_customer: isCustomerChat,
                }),
            });

            if (response.ok) {
                // Clear the typed message only after successful send
                setTypedMessage("");
                // Re-fetch updated messages
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

    // ---------------------------------------------
    // Handle closing case for employee
    // ---------------------------------------------
    const handleCloseCase = async (id) => {
        if (!id) {
            console.error("No provided id for closing case.");
            return;
        }
        try {
            const response = await fetch(`/api/chat/close-case/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!response.ok) {
                console.log(`Failed to close case with id ${id}. Status is ${response.status}`);
            }
        } catch (error) {
            console.error("Error when closing case: ", error);
        }
    };

    // ---------------------------------------------
    // Render
    // ---------------------------------------------
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

                    <ChatMessages messages={chatData?.messages || []} />

                    <ChatInput
                        typedMessage={typedMessage}
                        setTypedMessage={setTypedMessage}
                        onSend={handleNewMessage}
                        isCustomerChat={isCustomerChat}
                        onCloseCase={() => handleCloseCase(chatData?.caseDetails?.id)}
                    />
                </ChatContainer>
            </Container>
        </>
    );
}

// ---------------------------------------------
// Child component: ChatMessages
// ---------------------------------------------
function ChatMessages({ messages }) {
    return (
        <MessagesContainer>
            {messages
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
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
    );
}

// ---------------------------------------------
// Child component: ChatInput
// ---------------------------------------------
function ChatInput({ typedMessage, setTypedMessage, onSend, isCustomerChat, onCloseCase }) {
    return (
        <InputContainer>
            <Stack direction="row" spacing={2}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <IconButton
                    onClick={onSend}
                    color="inherit"
                    aria-label="Send message..."
                    sx={{ backgroundColor: "#fff", color: "black" }}
                >
                    <SendIcon />
                </IconButton>
                {!isCustomerChat && (
                    <Button variant="outlined" color="inherit" onClick={onCloseCase}>
                        Close Case
                    </Button>
                )}
            </Stack>
        </InputContainer>
    );
}

// ---------------------------------------------
// Styled Components
// ---------------------------------------------
const ChatContainer = styled(Paper)({
    height: "70vh",
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 4px 20px",
});

const MessagesContainer = styled(Box)({
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    "&::-webkit-scrollbar": { width: "6px" },
    "&::-webkit-scrollbar-track": { background: "transparent" },
    "&::-webkit-scrollbar-thumb": { background: "grey", borderRadius: "3px" },
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
