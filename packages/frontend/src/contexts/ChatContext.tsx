import React from 'react';
import { useHeaderData } from '@/presentation/hooks/UseHeaderData';
import GlobalChatManager from '@/components/Messaging/global-chat-manager';

interface ChatProviderProps {
    children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const { user, neighborhoodId } = useHeaderData();

    return (
        <>
            {children}
            {user && neighborhoodId && <GlobalChatManager />}
        </>
    );
};