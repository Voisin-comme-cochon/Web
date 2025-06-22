import { useState } from 'react';
import { ArrowLeft, MoreVertical, Search, Send, Plus, Users, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { CreateGroupDialog } from './create-group-dialog';
import { JoinGroupDialog } from './join-group-dialog';

// Types
type User = {
    id: string;
    name: string;
    avatar: string;
    online?: boolean;
};

type Conversation = {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
    isGroup?: boolean;
    type?: 'public' | 'private';
    members?: { name: string; avatar: string; status: string }[];
};

type Message = {
    id: string;
    content: string;
    sender: 'user' | 'other';
    senderName?: string;
    senderAvatar?: string;
    time: string;
    read: boolean;
    isGroup?: boolean;
};

// Mock data
const conversations: Conversation[] = [
    {
        id: '1',
        name: 'Marie Dupont',
        avatar: '/placeholder.svg?height=40&width=40',
        lastMessage: "Bonjour, comment allez-vous aujourd'hui?",
        time: '10:30',
        unread: 2,
        online: true,
    },
    {
        id: '2',
        name: 'Thomas Martin',
        avatar: '/placeholder.svg?height=40&width=40',
        lastMessage: 'Merci pour votre aide hier!',
        time: 'Hier',
        unread: 0,
        online: false,
    },
    {
        id: '3',
        name: 'Sophie Bernard',
        avatar: '/placeholder.svg?height=40&width=40',
        lastMessage: 'À quelle heure est la réunion de quartier?',
        time: 'Lun',
        unread: 1,
        online: true,
    },
    {
        id: '4',
        name: 'Lucas Petit',
        avatar: '/placeholder.svg?height=40&width=40',
        lastMessage: "J'ai trouvé un électricien pour le problème.",
        time: 'Dim',
        unread: 0,
        online: false,
    },
    {
        id: '5',
        name: 'Groupe du Quartier',
        avatar: '/placeholder.svg?height=40&width=40',
        lastMessage: 'Réunion confirmée pour samedi à 15h!',
        time: 'Mer',
        unread: 3,
        online: false,
        isGroup: true,
        type: 'public',
        members: [
            { name: 'Marie Dupont', avatar: '/placeholder.svg?height=40&width=40', status: 'En ligne' },
            { name: 'Thomas Martin', avatar: '/placeholder.svg?height=40&width=40', status: 'Vu à 14:30' },
            { name: 'Sophie Bernard', avatar: '/placeholder.svg?height=40&width=40', status: 'En ligne' },
            { name: 'Lucas Petit', avatar: '/placeholder.svg?height=40&width=40', status: 'Vu hier' },
            { name: 'Émilie Rousseau', avatar: '/placeholder.svg?height=40&width=40', status: 'En ligne' },
        ],
    },
    {
        id: 'g5',
        name: 'Copropriété Résidence des Fleurs',
        avatar: '/placeholder.svg?height=40&width=40',
        lastMessage: 'La réunion de copropriété aura lieu le 15 juin.',
        time: 'Lun',
        unread: 0,
        online: false,
        isGroup: true,
        type: 'private',
        members: [
            { name: 'Marie Dupont', avatar: '/placeholder.svg?height=40&width=40', status: 'En ligne' },
            { name: 'Thomas Martin', avatar: '/placeholder.svg?height=40&width=40', status: 'Vu à 14:30' },
            { name: 'Sophie Bernard', avatar: '/placeholder.svg?height=40&width=40', status: 'En ligne' },
        ],
    },
];

const messages: Record<string, Message[]> = {
    '1': [
        {
            id: 'm1',
            content: "Bonjour Marie, comment allez-vous aujourd'hui?",
            sender: 'user',
            time: '10:15',
            read: true,
        },
        {
            id: 'm2',
            content: 'Bonjour! Je vais très bien, merci. Et vous?',
            sender: 'other',
            time: '10:17',
            read: true,
        },
        {
            id: 'm3',
            content: "Très bien aussi! Avez-vous des nouvelles concernant l'événement du quartier ce weekend?",
            sender: 'user',
            time: '10:20',
            read: true,
        },
        {
            id: 'm4',
            content:
                "Oui, l'événement est confirmé pour samedi à 15h au parc central. Plusieurs voisins ont déjà confirmé leur présence!",
            sender: 'other',
            time: '10:25',
            read: true,
        },
        {
            id: 'm5',
            content: "Super! J'y serai. Dois-je apporter quelque chose?",
            sender: 'user',
            time: '10:28',
            read: true,
        },
        {
            id: 'm6',
            content:
                "Vous pouvez apporter une boisson ou un dessert si vous voulez, mais ce n'est pas obligatoire. L'essentiel est votre présence!",
            sender: 'other',
            time: '10:30',
            read: false,
        },
    ],
    '5': [
        {
            id: 'g1',
            content:
                'Bonjour à tous! Je propose une réunion de quartier ce samedi à 15h au parc central. Qui serait disponible?',
            sender: 'other',
            senderName: 'Marie Dupont',
            senderAvatar: '/placeholder.svg?height=40&width=40',
            time: 'Mer, 14:15',
            read: true,
            isGroup: true,
        },
        {
            id: 'g2',
            content: 'Je serai présent!',
            sender: 'user',
            time: 'Mer, 14:20',
            read: true,
            isGroup: true,
        },
        {
            id: 'g3',
            content: 'Moi aussi, je viendrai avec quelques boissons.',
            sender: 'other',
            senderName: 'Sophie Bernard',
            senderAvatar: '/placeholder.svg?height=40&width=40',
            time: 'Mer, 14:25',
            read: true,
            isGroup: true,
        },
        {
            id: 'g4',
            content: 'Je ne pourrai pas être là ce samedi, mais tenez-moi au courant des décisions prises.',
            sender: 'other',
            senderName: 'Thomas Martin',
            senderAvatar: '/placeholder.svg?height=40&width=40',
            time: 'Mer, 14:30',
            read: true,
            isGroup: true,
        },
        {
            id: 'g5',
            content:
                "Parfait! Donc nous confirmons la réunion pour samedi à 15h. N'hésitez pas à inviter d'autres voisins intéressés.",
            sender: 'other',
            senderName: 'Marie Dupont',
            senderAvatar: '/placeholder.svg?height=40&width=40',
            time: 'Mer, 14:45',
            read: false,
            isGroup: true,
        },
    ],
};

export default function ChatPanel({ onClose }: { onClose: () => void }) {
    const [activeConversation, setActiveConversation] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('messages');
    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    const [joinGroupOpen, setJoinGroupOpen] = useState(false);
    const [localConversations, setLocalConversations] = useState(conversations);

    const filteredConversations = localConversations.filter(
        (conv) =>
            conv.name.toLowerCase().includes(searchQuery.toLowerCase()) && (activeTab !== 'groups' || conv.isGroup)
    );

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;
        // Here you would typically send the message to your backend
        console.log('Sending message:', newMessage);
        setNewMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleCreateGroup = (group: { id: string; name: string; description: string; type: 'public' | 'private'; members: User[]; avatar: string }) => {
        const newGroup: Conversation = {
            id: group.id,
            name: group.name,
            avatar: group.avatar,
            lastMessage: `Groupe créé le ${new Date().toLocaleDateString()}`,
            time: "Aujourd'hui",
            unread: 0,
            online: false,
            isGroup: true,
            type: group.type,
            members: group.members.map((member) => ({
                name: member.name,
                avatar: member.avatar,
                status: 'online' in member && member.online ? 'En ligne' : 'Hors ligne',
            })),
        };

        setLocalConversations([newGroup, ...localConversations]);
        setActiveConversation(group.id);
        setActiveTab('messages');
    };

    const handleJoinGroup = (group: { id: string; name: string; description: string; type: 'public' | 'private'; avatar: string }) => {
        const newGroup: Conversation = {
            id: group.id,
            name: group.name,
            avatar: group.avatar,
            lastMessage: `Vous avez rejoint ce groupe le ${new Date().toLocaleDateString()}`,
            time: "Aujourd'hui",
            unread: 0,
            online: false,
            isGroup: true,
            type: group.type,
            members: [],
        };

        // Check if the group is already in the conversations
        if (!localConversations.some((conv) => conv.id === group.id)) {
            setLocalConversations([newGroup, ...localConversations]);
        }

        setActiveConversation(group.id);
        setActiveTab('messages');
    };

    return (
        <div className="bg-white rounded-lg shadow-xl w-[350px] h-[500px] flex flex-col overflow-hidden border border-border">
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between">
                {activeConversation ? (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-primary/80 -ml-2"
                            onClick={() => setActiveConversation(null)}
                        >
                            <ArrowLeft size={20} />
                            <span className="sr-only">Retour</span>
                        </Button>
                        <div className="flex items-center flex-1 ml-1">
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 relative">
                                <img
                                    src={
                                        localConversations.find((c) => c.id === activeConversation)?.avatar ||
                                        '/placeholder.svg'
                                    }
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                                {localConversations.find((c) => c.id === activeConversation)?.online && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-primary"></div>
                                )}
                            </div>
                            <div>
                                <span className="font-medium">
                                    {localConversations.find((c) => c.id === activeConversation)?.name}
                                </span>
                                {localConversations.find((c) => c.id === activeConversation)?.isGroup && (
                                    <div className="flex items-center text-xs text-white/70">
                                        {localConversations.find((c) => c.id === activeConversation)?.type ===
                                        'private' ? (
                                            <Lock size={10} className="mr-1" />
                                        ) : (
                                            <Globe size={10} className="mr-1" />
                                        )}
                                        <span>
                                            {localConversations.find((c) => c.id === activeConversation)?.type ===
                                            'private'
                                                ? 'Groupe privé'
                                                : 'Groupe public'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <h3 className="font-bold text-lg">Messages</h3>
                )}
                <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
                    <MoreVertical size={20} />
                    <span className="sr-only">Options</span>
                </Button>
            </div>

            {/* Conversation List or Chat View */}
            {activeConversation ? (
                // Chat View
                <div className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-hidden">
                        <div className="h-full p-4 overflow-y-auto bg-muted">
                        {messages[activeConversation]?.map((message) => (
                            <div
                                key={message.id}
                                className={cn('mb-4 max-w-[80%]', message.sender === 'user' ? 'ml-auto' : 'mr-auto')}
                            >
                                {message.isGroup && message.sender === 'other' && (
                                    <div className="flex items-center mb-1 ml-2">
                                        <div className="w-5 h-5 rounded-full overflow-hidden mr-1">
                                            <img
                                                src={message.senderAvatar || '/placeholder.svg'}
                                                alt={message.senderName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-primary/70">
                                            {message.senderName}
                                        </span>
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        'p-3 rounded-lg',
                                        message.sender === 'user'
                                            ? 'bg-orange text-white rounded-br-none'
                                            : 'bg-white text-primary border border-border rounded-bl-none'
                                    )}
                                >
                                    {message.content}
                                </div>
                                <div
                                    className={cn(
                                        'text-xs mt-1 flex items-center',
                                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    <span className="text-muted-foreground">{message.time}</span>
                                </div>
                            </div>
                        ))}
                        </div>
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
                            />
                            <Button
                                onClick={handleSendMessage}
                                className="ml-2 bg-orange hover:bg-orange-hover text-white"
                                size="icon"
                                disabled={newMessage.trim() === ''}
                            >
                                <Send size={18} />
                                <span className="sr-only">Envoyer</span>
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                // Conversation List
                <div className="flex-1 flex flex-col">
                    {/* Tabs */}
                    <div className="border-b border-border">
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
                    <div className="p-3 border-b border-border">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                size={18}
                            />
                            <Input
                                placeholder={
                                    activeTab === 'groups'
                                        ? 'Rechercher un groupe...'
                                        : 'Rechercher une conversation...'
                                }
                                className="pl-10 border-border focus-visible:ring-orange"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Group Actions */}
                    {activeTab === 'groups' && (
                        <div className="p-3 border-b border-border flex gap-2">
                            <Button
                                onClick={() => setCreateGroupOpen(true)}
                                className="flex-1 bg-orange hover:bg-orange-hover text-white"
                                size="sm"
                            >
                                <Plus size={16} className="mr-1" />
                                Créer
                            </Button>
                            <Button
                                onClick={() => setJoinGroupOpen(true)}
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
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onClick={() => setActiveConversation(conversation.id)}
                                    className="p-3 border-b border-border hover:bg-muted cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                                                <img
                                                    src={conversation.avatar || '/placeholder.svg'}
                                                    alt={conversation.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {conversation.online && !conversation.isGroup && (
                                                <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                            )}
                                            {conversation.isGroup && (
                                                <div className="absolute bottom-0 right-3 w-4 h-4 bg-white rounded-full border border-white flex items-center justify-center">
                                                    {conversation.type === 'private' ? (
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
                                                    {conversation.name}
                                                </h4>
                                                <span className="text-xs text-muted-foreground">{conversation.time}</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {conversation.lastMessage}
                                                </p>
                                                {conversation.unread > 0 && (
                                                    <span className="ml-2 bg-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                        {conversation.unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-muted-foreground">
                                {activeTab === 'groups' ? 'Aucun groupe trouvé' : 'Aucune conversation trouvée'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <CreateGroupDialog
                open={createGroupOpen}
                onOpenChange={setCreateGroupOpen}
                onCreateGroup={handleCreateGroup}
            />

            <JoinGroupDialog open={joinGroupOpen} onOpenChange={setJoinGroupOpen} onJoinGroup={handleJoinGroup} />
        </div>
    );
}
