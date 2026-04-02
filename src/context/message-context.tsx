import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, mockMessages } from '../data/mock-data';

interface MessageContextType {
    messages: Message[];
    sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    deleteMessage: (id: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/messages');
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            // Fallback to mock data if backend not running (optional, but good for dev)
            // setMessages(mockMessages);
        }
    };

    const sendMessage = async (newMessage: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
        try {
            const response = await fetch('http://localhost:5001/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMessage),
            });

            if (response.ok) {
                const savedMessage = await response.json();
                setMessages(prev => [savedMessage, ...prev]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message to server');
        }
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setMessages(prev =>
            prev.map(msg =>
                msg.id === id ? { ...msg, read: true } : msg
            )
        );

        try {
            await fetch(`http://localhost:5001/api/messages/${id}/read`, {
                method: 'PATCH',
            });
        } catch (error) {
            console.error('Failed to mark message as read:', error);
        }
    };

    const updateMessage = async (id: string, updates: Partial<Message>) => {
        try {
            const response = await fetch(`http://localhost:5001/api/messages/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                const updatedMessage = await response.json();
                setMessages(prev =>
                    prev.map(msg => (msg.id === id ? updatedMessage : msg))
                );
            }
        } catch (error) {
            console.error('Failed to update message:', error);
            alert('Failed to update message');
        }
    };

    const deleteMessage = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:5001/api/messages/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMessages(prev => prev.filter(msg => msg.id !== id));
            } else {
                console.error('Failed to delete message:', response.statusText);
                alert(`Failed to delete message: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert('Failed to delete message');
        }
    };

    return (
        <MessageContext.Provider value={{ messages, sendMessage, markAsRead, updateMessage, deleteMessage }}>
            {children}
        </MessageContext.Provider>
    );
}

export function useMessages() {
    const context = useContext(MessageContext);
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessageProvider');
    }
    return context;
}
