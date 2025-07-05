import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useMessaging } from './useMessaging';
import { useWebSocket } from './useWebSocket';
import { GroupMessageModel, GroupModel } from '../../domain/models/messaging.model';
import { userCache } from '@/utils/userCache';

interface UseChatManagerProps {
    neighborhoodId?: number;
    currentUserId?: number;
}

export function useChatManager({ neighborhoodId, currentUserId }: UseChatManagerProps) {
    const [activeConversation, setActiveConversation] = useState<number | null>(null);

    // Refs pour maintenir les valeurs à jour lors du cleanup
    const activeConversationRef = useRef<number | null>(null);
    const webSocketRef = useRef<any>(null);

    // Hook pour les appels API REST
    const messaging = useMessaging(neighborhoodId, currentUserId);

    // Gestion des messages reçus via WebSocket
    const handleMessageReceived = useCallback(
        (message: GroupMessageModel) => {
            // Mettre en cache l'utilisateur du message
            if (message.user) {
                userCache.set(message.user);
            }

            messaging.setMessages((prev) => ({
                ...prev,
                [message.groupId]: [...(prev[message.groupId] || []), message],
            }));

            // Mettre à jour le dernier message du groupe
            messaging.setGroups((prev) =>
                prev.map((group) => (group.id === message.groupId ? { ...group, lastMessage: message } : group))
            );
        },
        [messaging]
    );

    // Hook WebSocket
    const webSocket = useWebSocket({
        onMessageReceived: handleMessageReceived,
    });

    // Maintenir les refs à jour
    activeConversationRef.current = activeConversation;
    webSocketRef.current = webSocket;

    // Changer de conversation active
    const selectConversation = useCallback(
        (groupId: number | null) => {
            // Quitter l'ancien groupe
            if (activeConversation && webSocket.isGroupJoined(activeConversation)) {
                webSocket.leaveGroup(activeConversation);
            }

            setActiveConversation(groupId);

            // Rejoindre le nouveau groupe
            if (groupId) {
                // Attendre un peu si le WebSocket n'est pas encore connecté
                if (!webSocket.connected) {
                    setTimeout(() => {
                        if (webSocket.connected) {
                            webSocket.joinGroup(groupId);
                        }
                    }, 1000);
                } else {
                    webSocket.joinGroup(groupId);
                }

                // Toujours recharger les messages pour s'assurer d'avoir les derniers
                messaging.loadMessages(groupId);

                // Charger les membres du groupe pour vérifier si l'utilisateur est propriétaire
                const group = messaging.groups.find((g) => g.id === groupId);
                if (group && (!group.members || group.members.length === 0)) {
                    messaging.loadGroupMembers(groupId);
                }
            }
        },
        [activeConversation, webSocket, messaging]
    );

    // Envoyer un message (via WebSocket si connecté, sinon via API REST)
    const sendMessage = useCallback(
        async (content: string, groupId: number): Promise<boolean> => {
            if (!content.trim()) return false;

            // Vérifier si connecté mais pas dans le groupe - tenter de rejoindre
            if (webSocket.connected && !webSocket.isGroupJoined(groupId)) {
                webSocket.joinGroup(groupId);

                // Attendre un peu pour que la jointure se fasse
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            // Essayer d'abord via WebSocket si connecté et dans le groupe
            if (webSocket.connected && webSocket.isGroupJoined(groupId)) {
                const sent = webSocket.sendMessage(groupId, content.trim());
                if (sent) {
                    return true;
                }
            }

            // Fallback via API REST
            return await messaging.sendMessage(content, groupId);
        },
        [webSocket, messaging]
    );

    // Rejoindre un groupe et le sélectionner
    const joinAndSelectGroup = useCallback(
        async (groupId: number): Promise<boolean> => {
            const success = await messaging.joinGroup(groupId);
            if (success) {
                selectConversation(groupId);
            }
            return success;
        },
        [messaging, selectConversation]
    );

    // Créer un groupe et le sélectionner
    const createAndSelectGroup = useCallback(
        async (groupData: any): Promise<GroupModel | null> => {
            const newGroup = await messaging.createGroup(groupData);
            if (newGroup) {
                selectConversation(newGroup.id);
            }
            return newGroup;
        },
        [messaging, selectConversation]
    );

    // Créer un chat privé et le sélectionner
    const createAndSelectPrivateChat = useCallback(
        async (targetUserId: number): Promise<GroupModel | null> => {
            const chat = await messaging.createPrivateChat(targetUserId);
            if (chat) {
                selectConversation(chat.id);
            }
            return chat;
        },
        [messaging, selectConversation]
    );

    // Nettoyer à la fermeture du composant uniquement
    useEffect(() => {
        return () => {
            // Cette cleanup function ne se déclenchera qu'au unmount du composant
            if (activeConversationRef.current && webSocketRef.current) {
                webSocketRef.current.leaveGroup(activeConversationRef.current);
            }
        };
    }, []); // Pas de dépendances pour que cela ne se déclenche qu'au unmount

    // Trier les groupes par date du dernier message (plus récent en premier)
    const sortedGroups = useMemo(() => {
        return [...messaging.groups].sort((a, b) => {
            const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    }, [messaging.groups]);

    // Obtenir la conversation active
    const getActiveConversation = useCallback((): GroupModel | null => {
        if (!activeConversation) return null;
        return messaging.groups.find((g) => g.id === activeConversation) || null;
    }, [activeConversation, messaging.groups]);

    return {
        // État de base
        ...messaging,
        // Groupes triés
        groups: sortedGroups,

        // État WebSocket
        webSocketConnected: webSocket.connected,
        webSocketError: webSocket.error,

        // Conversation active
        activeConversation,
        activeConversationData: getActiveConversation(),

        // Actions de conversation
        selectConversation,
        sendMessage,

        // Actions de groupe
        joinAndSelectGroup,
        createAndSelectGroup,
        createAndSelectPrivateChat,

        // WebSocket
        reconnectWebSocket: webSocket.reconnect,

        // Nettoyage
        clearWebSocketError: webSocket.clearError,
    };
}
