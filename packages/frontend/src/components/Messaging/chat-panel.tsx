import { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft,
    MoreVertical,
    Search,
    Send,
    Plus,
    Users,
    Lock,
    Globe,
    LogOut,
    Settings,
    UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CreateGroupDialog } from './create-group-dialog';
import { Group, JoinGroupDialog } from './join-group-dialog';
import { LeaveGroupDialog } from './leave-group-dialog';
import { useChatManager } from '@/presentation/hooks/useChatManager.ts';
import { useHeaderData } from '@/presentation/hooks/UseHeaderData.tsx';
import { GroupType } from '@/domain/models/messaging.model.ts';
import AvatarComponent from '@/components/AvatarComponent/AvatarComponent';
import { UserModel } from '@/domain/models/user.model.ts';
import { useToast } from '@/presentation/hooks/useToast.ts';

export default function ChatPanel({ onClose }: { onClose: () => void }) {
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('messages');
    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    const [joinGroupOpen, setJoinGroupOpen] = useState(false);
    const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);
    const { showSuccess } = useToast();

    // Ref pour le conteneur de messages pour le scroll
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Récupérer les données utilisateur et quartier
    const { user, neighborhoodId } = useHeaderData();

    // Hook principal pour la gestion du chat
    const chat = useChatManager({
        neighborhoodId: Number(neighborhoodId) || undefined,
        currentUserId: user?.id,
    });

    // Filtrer les conversations selon l'onglet actif et la recherche
    const filteredConversations = (() => {
        if (activeTab === 'messages') {
            // Onglet Messages : seulement les chats privés entre deux personnes
            return chat.groups.filter(
                (group) =>
                    group.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    group.type === GroupType.PRIVATE_CHAT
            );
        } else {
            // Onglet Groupes : seulement les groupes (publics et privés) mais pas les chats privés
            return chat.groups.filter(
                (group) =>
                    group.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    group.type !== GroupType.PRIVATE_CHAT
            );
        }
    })();

    // Charger les groupes disponibles et les invitations quand on change d'onglet
    useEffect(() => {
        if (activeTab === 'groups' && neighborhoodId) {
            chat.loadAvailableGroups();
            chat.loadGroupInvitations();
        }
    }, [activeTab, neighborhoodId, chat.loadAvailableGroups, chat.loadGroupInvitations]);

    // Gestionnaire d'envoi de message
    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !chat.activeConversation) return;

        const success = await chat.sendMessage(newMessage, chat.activeConversation);

        if (success) {
            setNewMessage('');
        }
    };

    // Gestionnaire de touche Entrée
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Gestionnaire de création de groupe
    const handleCreateGroup = async (group: any) => {
        // Mapper les types du dialog vers les types de l'API
        const groupType = group.type === 'public' ? GroupType.PUBLIC : GroupType.PRIVATE_GROUP;

        const groupData = {
            name: group.name,
            description: group.description,
            type: groupType,
            isPrivate: groupType !== GroupType.PUBLIC,
            neighborhoodId: neighborhoodId!,
            tagId: group.tagId,
            memberIds: group.members.map((m: any) => m.id),
        };

        const newGroup = await chat.createAndSelectGroup(groupData);
        if (newGroup) {
            setActiveTab('messages');
        }
    };

    // Gestionnaire de rejoindre un groupe
    const handleJoinGroup = async (group: any) => {
        const success = await chat.joinAndSelectGroup(group.id);
        showSuccess(`Vous avez rejoint le groupe ${group.name} avec succès.`);
        if (success) {
            setActiveTab('messages');
        }
    };

    // Gestionnaire de refuser une invitation
    const handleDeclineInvitation = async (group: any) => {
        const success = await chat.declineGroupInvitation(group.id);
        showSuccess(`Invitation déclinée pour le groupe ${group.name}.`);
        if (success) {
            console.log('Invitation déclinée avec succès pour le groupe:', group.name);
        }
    };

    // Vérifier si l'utilisateur est propriétaire du groupe actuel
    const isCurrentUserOwner = () => {
        console.log("Vérification de la propriété du groupe pour l'utilisateur:", chat.activeConversationData);
        if (!chat.activeConversationData || !user) return false;
        // Vérifier si l'utilisateur actuel est propriétaire dans les membres du groupe
        return (
            chat.activeConversationData.members?.some((member) => member.userId === user.id && member.isOwner) || false
        );
    };

    // Gestionnaire pour quitter le groupe
    const handleLeaveGroup = async () => {
        if (!chat.activeConversation || !chat.activeConversationData) return;

        const success = await chat.leaveGroup(chat.activeConversation);
        if (success) {
            showSuccess(`Vous avez quitté le groupe ${chat.activeConversationData.name}.`);
            chat.selectConversation(null); // Retourner à la liste des conversations
        }
        setLeaveGroupDialogOpen(false);
    };

    // Messages de la conversation active
    const activeMessages = chat.activeConversation ? chat.messages[chat.activeConversation] || [] : [];

    // Fonction pour scroller vers le bas
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    // Auto-scroll vers le bas quand on change de conversation ou quand les messages changent
    useEffect(() => {
        if (chat.activeConversation && activeMessages.length > 0) {
            // Délai pour s'assurer que le DOM est mis à jour
            setTimeout(scrollToBottom, 100);
        }
    }, [chat.activeConversation, activeMessages]);

    return (
        <div className="bg-white rounded-lg shadow-xl w-[350px] h-[500px] flex flex-col overflow-hidden border border-border">
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between">
                {chat.activeConversation ? (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-primary/80 -ml-2"
                            onClick={() => chat.selectConversation(null)}
                        >
                            <ArrowLeft size={20} />
                            <span className="sr-only">Retour</span>
                        </Button>
                        <div className="flex items-center flex-1 ml-1">
                            <div className="mr-2">
                                {chat.activeConversationData?.type === GroupType.PRIVATE_CHAT ? (
                                    <AvatarComponent
                                        user={chat.activeConversationData.members?.find((m) => m.id !== user?.id)}
                                        className="w-8 h-8"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary flex items-center justify-center text-white font-bold">
                                        {chat.activeConversationData?.name[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <span className="font-medium">
                                    {chat.activeConversationData &&
                                        chat.getGroupDisplayName(chat.activeConversationData, user?.id)}
                                </span>
                                {chat.activeConversationData?.type !== GroupType.PRIVATE_CHAT && (
                                    <div className="flex items-center text-xs text-white/70">
                                        {chat.activeConversationData?.isPrivate ? (
                                            <Lock size={10} className="mr-1" />
                                        ) : (
                                            <Globe size={10} className="mr-1" />
                                        )}
                                        <span>
                                            {chat.activeConversationData?.isPrivate ? 'Groupe privé' : 'Groupe public'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <h3 className="font-bold text-lg">Messages</h3>
                )}
                {chat.activeConversation && chat.activeConversationData?.type !== GroupType.PRIVATE_CHAT ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" size="icon" className="text-white hover:bg-primary/80">
                                <MoreVertical size={20} />
                                <span className="sr-only">Options</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={() => setLeaveGroupDialogOpen(true)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Quitter le groupe
                            </DropdownMenuItem>
                            {isCurrentUserOwner() && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            /* TODO: implémenter */
                                        }}
                                        disabled
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Gérer les membres
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            /* TODO: implémenter */
                                        }}
                                        disabled
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Gérer le groupe
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button variant="default" size="icon" className="text-white hover:bg-primary/80">
                        <MoreVertical size={20} />
                        <span className="sr-only">Options</span>
                    </Button>
                )}
            </div>

            {/* État de connexion WebSocket */}
            {!chat.webSocketConnected && (
                <div className="bg-orange/10 text-orange text-xs p-2 text-center">
                    Connexion temps réel indisponible
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-auto p-0 text-orange hover:text-orange-hover"
                        onClick={chat.reconnectWebSocket}
                    >
                        Reconnecter
                    </Button>
                </div>
            )}

            {/* Conversation List or Chat View */}
            {chat.activeConversation ? (
                // Chat View
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Messages */}
                    <div
                        ref={messagesContainerRef}
                        className="flex-1 overflow-y-auto bg-muted p-4"
                        style={{ minHeight: 0 }}
                    >
                        {chat.loading && activeMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Chargement des messages...
                            </div>
                        ) : activeMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Aucun message dans cette conversation
                            </div>
                        ) : (
                            activeMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'mb-4 max-w-[80%]',
                                        message.userId === user?.id ? 'ml-auto' : 'mr-auto'
                                    )}
                                >
                                    {message.groupId &&
                                        chat.activeConversationData?.type !== GroupType.PRIVATE_CHAT &&
                                        message.userId !== user?.id && (
                                            <div className="flex items-center">
                                                <div className="mr-1">
                                                    <AvatarComponent user={message.user as UserModel} />
                                                </div>
                                                <span className="text-xs font-medium text-primary/70">
                                                    {chat.getUserDisplayName(message.user)}
                                                </span>
                                            </div>
                                        )}
                                    <div
                                        className={cn(
                                            'p-3 rounded-lg break-words whitespace-pre-wrap',
                                            message.userId === user?.id
                                                ? 'bg-orange text-white rounded-br-none'
                                                : 'bg-white text-primary border border-border rounded-bl-none'
                                        )}
                                    >
                                        {message.content}
                                    </div>
                                    <div
                                        className={cn(
                                            'text-xs mt-1 flex items-center',
                                            message.userId === user?.id ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        <span className="text-muted-foreground">
                                            {chat.formatMessageTime(message.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="p-3 border-t border-border bg-white">
                        <div className="flex items-center">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Écrivez votre message..."
                                className="flex-1 border-border focus-visible:ring-orange"
                                disabled={chat.loading}
                            />
                            <Button
                                onClick={handleSendMessage}
                                className="ml-2 bg-orange hover:bg-orange-hover text-white"
                                size="icon"
                                disabled={newMessage.trim() === '' || chat.loading}
                            >
                                <Send size={18} />
                                <span className="sr-only">Envoyer</span>
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                // Conversation List
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Tabs */}
                    <div className="border-b border-border flex-shrink-0">
                        <Tabs defaultValue="messages" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full bg-white border-b border-border">
                                <TabsTrigger value="messages" className="flex-1 data-[state=active]:text-orange">
                                    Messages
                                </TabsTrigger>
                                <TabsTrigger value="groups" className="flex-1 data-[state=active]:text-orange">
                                    Groupes
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Search */}
                    <div className="p-3 border-b border-border flex-shrink-0">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                size={18}
                            />
                            <Input
                                placeholder={
                                    activeTab === 'groups'
                                        ? 'Rechercher un groupe...'
                                        : 'Rechercher une conversation privée...'
                                }
                                className="pl-10 border-border focus-visible:ring-orange"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Group Actions */}
                    {activeTab === 'groups' && (
                        <div className="p-3 border-b border-border flex gap-2 flex-shrink-0">
                            <Button
                                onClick={() => setCreateGroupOpen(true)}
                                className="flex-1 bg-orange hover:bg-orange-hover text-white"
                                size="sm"
                            >
                                <Plus size={16} className="mr-1" />
                                Créer
                            </Button>
                            <Button
                                onClick={() => {
                                    setJoinGroupOpen(true);
                                    chat.loadGroupInvitations();
                                }}
                                variant="outline"
                                className="flex-1 border-border text-primary"
                                size="sm"
                            >
                                <Users size={16} className="mr-1" />
                                Rejoindre
                            </Button>
                        </div>
                    )}

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
                        {chat.loading && filteredConversations.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground">Chargement...</div>
                        ) : filteredConversations.length > 0 ? (
                            filteredConversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onClick={() => chat.selectConversation(conversation.id)}
                                    className="p-3 border-b border-border hover:bg-muted cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <div className="mr-3">
                                                {conversation.type === GroupType.PRIVATE_CHAT ? (
                                                    <AvatarComponent
                                                        user={conversation.members?.find((m) => m.id !== user?.id)}
                                                        className="w-12 h-12"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center text-white font-bold">
                                                        {conversation.name[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            {conversation.type !== GroupType.PRIVATE_CHAT && (
                                                <div className="absolute bottom-0 right-3 w-4 h-4 bg-white rounded-full border border-white flex items-center justify-center">
                                                    {conversation.isPrivate ? (
                                                        <Lock size={10} className="text-muted-foreground" />
                                                    ) : (
                                                        <Globe size={10} className="text-muted-foreground" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium text-primary truncate">
                                                    {chat.getGroupDisplayName(conversation, user?.id)}
                                                </h4>
                                                <span className="text-xs text-muted-foreground">
                                                    {conversation.lastMessage
                                                        ? chat.formatMessageTime(conversation.lastMessage.createdAt)
                                                        : ''}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {conversation.lastMessage?.content || 'Aucun message'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-muted-foreground">
                                {activeTab === 'groups' ? 'Aucun groupe trouvé' : 'Aucune conversation privée trouvée'}
                            </div>
                        )}
                    </div>

                    {/* Erreurs */}
                    {chat.error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm">
                            {chat.error}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-auto p-0 text-destructive hover:text-destructive/80"
                                onClick={chat.clearError}
                            >
                                Fermer
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Dialogs */}
            <CreateGroupDialog
                open={createGroupOpen}
                onOpenChange={setCreateGroupOpen}
                onCreateGroup={handleCreateGroup}
                neighborhoodId={Number(neighborhoodId)}
            />

            <JoinGroupDialog
                open={joinGroupOpen}
                onOpenChange={setJoinGroupOpen}
                onJoinGroup={handleJoinGroup}
                onDeclineInvitation={handleDeclineInvitation}
                availableGroups={chat.availableGroups as unknown as Group[]}
                invitedGroups={chat.invitedGroups as unknown as Group[]}
                loading={chat.loading}
            />

            <LeaveGroupDialog
                open={leaveGroupDialogOpen}
                onOpenChange={setLeaveGroupDialogOpen}
                onConfirm={handleLeaveGroup}
                groupName={chat.activeConversationData?.name}
            />
        </div>
    );
}
