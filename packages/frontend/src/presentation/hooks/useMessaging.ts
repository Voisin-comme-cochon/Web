import { useState, useEffect, useMemo, useCallback } from 'react';
import { MessagingUc } from '@/domain/use-cases/messagingUc.ts';
import { MessagingRepository } from '@/infrastructure/repositories/MessagingRepository.ts';
import { GroupModel, GroupMessageModel, UserSummaryModel, CreateGroupDto } from '@/domain/models/messaging.model.ts';
import { userCache } from '@/utils/userCache';

export function useMessaging(neighborhoodId?: number, currentUserId?: number) {
    const [groups, setGroups] = useState<GroupModel[]>([]);
    const [messages, setMessages] = useState<Record<number, GroupMessageModel[]>>({});
    const [availableGroups, setAvailableGroups] = useState<GroupModel[]>([]);
    const [invitedGroups, setInvitedGroups] = useState<GroupModel[]>([]);
    const [users, setUsers] = useState<UserSummaryModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [groupsVerified, setGroupsVerified] = useState(false);

    const messagingUc = useMemo(() => {
        const repository = new MessagingRepository();
        return new MessagingUc(repository);
    }, []);

    const loadGroups = useCallback(async () => {
        if (!neighborhoodId) return;

        setLoading(true);
        setError(null);
        try {
            const result = await messagingUc.getGroups(neighborhoodId);
            let memberGroups = result.data;

            if (currentUserId && !groupsVerified) {
                const verifiedGroups = [];

                for (const group of result.data) {
                    try {
                        const members = await messagingUc.getGroupMembers(group.id);
                        const isMember = members.some((member) => member.userId === currentUserId);

                        if (isMember) {
                            verifiedGroups.push(group);
                        }
                    } catch (error) {
                        console.error(`Messaging: Erreur lors de la vérification du groupe ${group.name}:`, error);
                    }
                }

                memberGroups = verifiedGroups;
                setGroupsVerified(true);
            } else if (currentUserId && groupsVerified) {
                return;
            }

            setGroups(memberGroups);
        } catch (err) {
            console.error('Messaging: Erreur lors du chargement des groupes:', err);
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des groupes');
        } finally {
            setLoading(false);
        }
    }, [messagingUc, neighborhoodId]);

    const loadAvailableGroups = useCallback(async () => {
        if (!neighborhoodId) return;

        setLoading(true);
        setError(null);
        try {
            const result = await messagingUc.getAvailableGroups(neighborhoodId);
            setAvailableGroups(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des groupes disponibles');
        } finally {
            setLoading(false);
        }
    }, [messagingUc, neighborhoodId]);

    const loadGroupInvitations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await messagingUc.getGroupInvitations();
            setInvitedGroups(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des invitations de groupes');
        } finally {
            setLoading(false);
        }
    }, [messagingUc]);

    const loadMessages = useCallback(
        async (groupId: number, page: number = 1) => {
            setLoading(true);
            setError(null);
            try {
                const result = await messagingUc.getMessages(groupId, page);

                // Trier les messages par date croissante (du plus ancien au plus récent)
                const sortedMessages = result.data.sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );

                // Mettre en cache les utilisateurs des messages
                sortedMessages.forEach(message => {
                    if (message.user) {
                        userCache.set(message.user);
                    }
                });

                setMessages((prev) => ({
                    ...prev,
                    [groupId]: page === 1 ? sortedMessages : [...(prev[groupId] || []), ...sortedMessages],
                }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
            } finally {
                setLoading(false);
            }
        },
        [messagingUc]
    );

    const searchUsers = useCallback(
        async (searchTerm?: string) => {
            if (!neighborhoodId) return;

            setLoading(true);
            setError(null);
            try {
                const result = await messagingUc.searchUsers(neighborhoodId, searchTerm);
                setUsers(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur lors de la recherche d'utilisateurs");
            } finally {
                setLoading(false);
            }
        },
        [messagingUc, neighborhoodId]
    );

    const createGroup = useCallback(
        async (groupData: CreateGroupDto): Promise<GroupModel | null> => {
            setLoading(true);
            setError(null);
            try {
                const newGroup = await messagingUc.createGroup(groupData);
                setGroups((prev) => [newGroup, ...prev]);
                return newGroup;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors de la création du groupe');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [messagingUc]
    );

    const createPrivateChat = useCallback(
        async (targetUserId: number): Promise<GroupModel | null> => {
            if (!neighborhoodId) return null;

            setLoading(true);
            setError(null);
            try {
                const chat = await messagingUc.createPrivateChat(targetUserId, neighborhoodId);
                setGroups((prev) => {
                    const exists = prev.find((g) => g.id === chat.id);
                    return exists ? prev : [chat, ...prev];
                });
                return chat;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors de la création du chat privé');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [messagingUc, neighborhoodId]
    );

    const joinGroup = useCallback(
        async (groupId: number): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                await messagingUc.joinGroup(groupId);

                if (neighborhoodId) {
                    const result = await messagingUc.getGroups(neighborhoodId);
                    setGroups(result.data);
                }

                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur lors de l'adhésion au groupe");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [messagingUc, neighborhoodId]
    );

    const declineGroupInvitation = useCallback(
        async (groupId: number): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                await messagingUc.declineGroupInvitation(groupId);

                // Recharger les invitations pour mettre à jour la liste
                const updatedInvitations = await messagingUc.getGroupInvitations();
                setInvitedGroups(updatedInvitations);

                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur lors du déclin de l'invitation");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [messagingUc]
    );

    const leaveGroup = useCallback(
        async (groupId: number): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                await messagingUc.leaveGroup(groupId);

                // Recharger les groupes pour mettre à jour la liste
                if (neighborhoodId) {
                    const result = await messagingUc.getGroups(neighborhoodId);
                    setGroups(result.data);
                }

                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors de la sortie du groupe');
                return false;
            } finally {
                setLoading(false);
            }
        },
        [messagingUc, neighborhoodId]
    );

    const loadGroupMembers = useCallback(
        async (groupId: number) => {
            try {
                const members = await messagingUc.getGroupMembers(groupId);
                
                // Mettre à jour le groupe avec les membres chargés
                setGroups((prev) =>
                    prev.map((group) => 
                        group.id === groupId ? { ...group, members } : group
                    )
                );
                
                return members;
            } catch (err) {
                console.error('Erreur lors du chargement des membres:', err);
                return [];
            }
        },
        [messagingUc]
    );

    const sendMessage = useCallback(
        async (content: string, groupId: number): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                const newMessage = await messagingUc.sendMessage(content, groupId);

                setMessages((prev) => {
                    const existing = prev[groupId] || [];
                    const messageExists = existing.some((msg) => msg.id === newMessage.id);
                    if (messageExists) {
                        return prev;
                    }

                    return {
                        ...prev,
                        [groupId]: [...existing, newMessage],
                    };
                });

                setGroups((prev) =>
                    prev.map((group) => (group.id === groupId ? { ...group, lastMessage: newMessage } : group))
                );

                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur lors de l'envoi du message");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [messagingUc]
    );

    useEffect(() => {
        setGroupsVerified(false);
    }, [currentUserId]);

    useEffect(() => {
        if (neighborhoodId) {
            loadGroups();
        }
    }, [loadGroups, neighborhoodId, currentUserId]);

    return {
        groups,
        messages,
        availableGroups,
        invitedGroups,
        users,
        loading,
        error,

        loadGroups,
        loadAvailableGroups,
        loadGroupInvitations,
        loadMessages,
        loadGroupMembers,
        searchUsers,
        createGroup,
        createPrivateChat,
        joinGroup,
        declineGroupInvitation,
        leaveGroup,
        sendMessage,

        getUserDisplayName: messagingUc.getUserDisplayName,
        isPrivateChat: messagingUc.isPrivateChat,
        getGroupDisplayName: messagingUc.getGroupDisplayName,
        formatMessageTime: messagingUc.formatMessageTime,

        setGroups,
        setMessages,
        setAvailableGroups,
        setInvitedGroups,
        setUsers,

        clearError: () => setError(null),
        clearMessages: (groupId?: number) => {
            if (groupId) {
                setMessages((prev) => ({ ...prev, [groupId]: [] }));
            } else {
                setMessages({});
            }
        },
        forceRefresh: () => {
            setGroupsVerified(false);
            if (neighborhoodId) {
                loadGroups();
            }
        },
    };
}
