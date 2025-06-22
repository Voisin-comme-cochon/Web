import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GroupMessageModel } from '@/domain/models/messaging.model.ts';

interface WebSocketEvents {
    connected: { userId: number; socketId: string };
    'joined-group': { groupId: number };
    'left-group': { groupId: number };
    'message-sent': GroupMessageModel;
    'user-typing': { userId: number; groupId: number; isTyping: boolean };

    'join-group': { groupId: number };
    'leave-group': { groupId: number };
    'send-message': { groupId: number; content: string };
    'typing-start': { groupId: number };
    'typing-stop': { groupId: number };
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
            console.log("WebSocket: Connexion déjà existante, arrêt de la création d'une nouvelle");
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
                console.log('WebSocket connecté:', socket.id);
                setConnected(true);
                setError(null);
            });

            socket.on('disconnect', (reason) => {
                console.log('WebSocket déconnecté:', reason);
                setConnected(false);
                joinedGroupsRef.current.clear();
            });

            socket.on('connect_error', (error) => {
                console.error('Erreur de connexion WebSocket:', error);
                setError('Erreur de connexion WebSocket');
                setConnected(false);
            });

            socket.on('connected', (data) => {
                console.log('Utilisateur connecté:', data);
                onConnected?.(data);
            });

            socket.on('message-sent', (message) => {
                console.log('WebSocket: Événement message-sent reçu:', message);
                onMessageReceived?.(message);
            });

            socket.onAny((eventName, ...args) => {
                console.log('WebSocket: Événement reçu:', eventName, args);
            });

            socket.onAnyOutgoing((eventName, ...args) => {
                console.log('WebSocket: Événement émis:', eventName, args);
            });

            socket.on('error', (error) => {
                console.error('WebSocket: Erreur reçue du serveur:', error);
                setError(`Erreur WebSocket: ${error.message || 'Erreur inconnue'}`);
            });

            socket.on('user-typing', (data) => {
                console.log('Utilisateur en train de taper:', data);
            });

            socket.on('joined-group', (data) => {
                console.log('Groupe rejoint:', data);
                joinedGroupsRef.current.add(data.groupId);
            });

            socket.on('left-group', (data) => {
                console.log('Groupe quitté:', data);
                joinedGroupsRef.current.delete(data.groupId);
            });
        } catch (err) {
            console.error("Erreur lors de l'initialisation du WebSocket:", err);
            setError("Erreur lors de l'initialisation du WebSocket");
        }
    }, [onMessageReceived, onConnected]);

    const joinGroup = useCallback((groupId: number) => {
        if (!socketRef.current?.connected) {
            console.warn('WebSocket: WebSocket non connecté, impossible de rejoindre le groupe', groupId);
            return;
        }

        if (joinedGroupsRef.current.has(groupId)) {
            console.log('WebSocket: Groupe déjà rejoint:', groupId);
            return;
        }

        console.log('WebSocket: Émission de join-group pour le groupe:', groupId);
        socketRef.current.emit('join-group', { groupId });
        console.log('WebSocket: Tentative de rejoindre le groupe:', groupId);
    }, []);

    const leaveGroup = useCallback((groupId: number) => {
        if (!socketRef.current?.connected) {
            console.warn('WebSocket non connecté');
            return;
        }

        if (!joinedGroupsRef.current.has(groupId)) {
            console.log('Groupe non rejoint:', groupId);
            return;
        }

        socketRef.current.emit('leave-group', { groupId });
        console.log('Tentative de quitter le groupe:', groupId);
    }, []);

    const sendMessage = useCallback((groupId: number, content: string) => {
        console.log("WebSocket: Tentative d'envoi de message:", {
            groupId,
            content,
            connected: socketRef.current?.connected,
            socketExists: !!socketRef.current,
            joinedGroups: Array.from(joinedGroupsRef.current),
        });

        if (!socketRef.current?.connected) {
            console.warn("WebSocket: WebSocket non connecté, impossible d'envoyer le message");
            return false;
        }

        if (!joinedGroupsRef.current.has(groupId)) {
            console.warn(
                "WebSocket: Groupe non rejoint, impossible d'envoyer le message. Groupes rejoints:",
                Array.from(joinedGroupsRef.current)
            );
            return false;
        }

        console.log("WebSocket: Émission de l'événement send-message");

        console.log('WebSocket: État de la socket avant émission:', {
            connected: socketRef.current.connected,
            id: socketRef.current.id,
            rooms: Object.keys(socketRef.current.rooms || {}),
            hasJoinedGroup: joinedGroupsRef.current.has(groupId),
        });

        socketRef.current.emit('send-message', { groupId, content });
        console.log('WebSocket: Message envoyé via WebSocket:', { groupId, content });
        return true;
    }, []);

    const startTyping = useCallback((groupId: number) => {
        if (!socketRef.current?.connected || !joinedGroupsRef.current.has(groupId)) {
            return;
        }

        socketRef.current.emit('typing-start', { groupId });
    }, []);

    const stopTyping = useCallback((groupId: number) => {
        if (!socketRef.current?.connected || !joinedGroupsRef.current.has(groupId)) {
            return;
        }

        socketRef.current.emit('typing-stop', { groupId });
    }, []);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            console.log('WebSocket: Déconnexion du socket');
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
        startTyping,
        stopTyping,

        clearError: () => setError(null),
        isGroupJoined: (groupId: number) => joinedGroupsRef.current.has(groupId),
    };
}
