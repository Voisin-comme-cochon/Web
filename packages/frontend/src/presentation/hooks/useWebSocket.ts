import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GroupMessageModel } from '@/domain/models/messaging.model.ts';

interface WebSocketEvents {
    connected: { userId: number; socketId: string };
    'joined-group': { groupId: number };
    'left-group': { groupId: number };
    'message-sent': GroupMessageModel;

    'join-group': { groupId: number };
    'leave-group': { groupId: number };
    'send-message': { groupId: number; content: string };
}

interface UseWebSocketProps {
    onMessageReceived?: (message: GroupMessageModel) => void;
    onConnected?: (data: { userId: number; socketId: string }) => void;
}

export function useWebSocket({ onMessageReceived, onConnected }: UseWebSocketProps = {}) {
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const joinedGroupsRef = useRef<Set<number>>(new Set());

    const connect = useCallback(() => {
        if (socketRef.current) {
            return;
        }

        const token = localStorage.getItem('jwt');
        if (!token) {
            setError("Token d'authentification manquant");
            return;
        }

        const baseURL = import.meta.env.VITE_VCC_API_URL || 'http://localhost:3000';

        try {
            socketRef.current = io(`${baseURL}/messaging`, {
                auth: {
                    token: token,
                },
                autoConnect: true,
                transports: ['websocket', 'polling'],
            });

            const socket = socketRef.current;

            socket.on('connect', () => {
                setConnected(true);
                setError(null);
            });

            socket.on('disconnect', (reason) => {
                setConnected(false);
                joinedGroupsRef.current.clear();
            });

            socket.on('connect_error', (error) => {
                console.error('Erreur de connexion WebSocket:', error);
                setError('Erreur de connexion WebSocket');
                setConnected(false);
            });

            socket.on('connected', (data) => {
                onConnected?.(data);
            });

            socket.on('message-sent', (message) => {
                onMessageReceived?.(message);
            });

            socket.on('error', (error) => {
                console.error('WebSocket: Erreur reçue du serveur:', error);
                setError(`Erreur WebSocket: ${error.message || 'Erreur inconnue'}`);
            });

            socket.on('joined-group', (data) => {
                joinedGroupsRef.current.add(data.groupId);
            });

            socket.on('left-group', (data) => {
                joinedGroupsRef.current.delete(data.groupId);
            });
        } catch (err) {
            setError("Erreur lors de l'initialisation du WebSocket");
        }
    }, [onMessageReceived, onConnected]);

    const joinGroup = useCallback((groupId: number) => {
        if (!socketRef.current?.connected) {
            return;
        }

        if (joinedGroupsRef.current.has(groupId)) {
            return;
        }

        socketRef.current.emit('join-group', { groupId });
    }, []);

    const leaveGroup = useCallback((groupId: number) => {
        if (!socketRef.current?.connected) {
            return;
        }

        if (!joinedGroupsRef.current.has(groupId)) {
            return;
        }

        socketRef.current.emit('leave-group', { groupId });
    }, []);

    const sendMessage = useCallback((groupId: number, content: string) => {
        if (!socketRef.current?.connected) {
            return false;
        }

        if (!joinedGroupsRef.current.has(groupId)) {
            return false;
        }

        socketRef.current.emit('send-message', { groupId, content });
        return true;
    }, []);


    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setConnected(false);
            joinedGroupsRef.current.clear();
        }
    }, []);

    const reconnect = useCallback(() => {
        disconnect();
        setTimeout(connect, 1000);
    }, [disconnect, connect]);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    useEffect(() => {
        if (!socketRef.current) {
            connect();
        }
    }, []);

    return {
        connected,
        error,
        joinedGroups: Array.from(joinedGroupsRef.current),

        connect,
        disconnect,
        reconnect,
        joinGroup,
        leaveGroup,
        sendMessage,

        clearError: () => setError(null),
        isGroupJoined: (groupId: number) => joinedGroupsRef.current.has(groupId),
    };
}
