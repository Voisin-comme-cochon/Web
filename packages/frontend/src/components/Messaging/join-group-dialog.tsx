import { useState } from 'react';
import { Search, Lock, Globe, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Group = {
    id: string;
    name: string;
    description: string;
    avatar: string;
    type: 'public' | 'private';
    memberCount: number;
    createdAt: string;
};

// Mock data for public groups
const publicGroups: Group[] = [
    {
        id: 'g1',
        name: 'Entraide Quartier Saint-Michel',
        description: "Groupe d'entraide entre voisins du quartier Saint-Michel",
        avatar: '/placeholder.svg?height=40&width=40',
        type: 'public',
        memberCount: 28,
        createdAt: '2023-05-15T10:30:00Z',
    },
    {
        id: 'g2',
        name: 'Jardin Partagé Central',
        description: 'Organisation et gestion du jardin partagé du quartier',
        avatar: '/placeholder.svg?height=40&width=40',
        type: 'public',
        memberCount: 15,
        createdAt: '2023-06-20T14:45:00Z',
    },
    {
        id: 'g3',
        name: 'Événements Locaux',
        description: 'Annonces et organisation des événements dans le quartier',
        avatar: '/placeholder.svg?height=40&width=40',
        type: 'public',
        memberCount: 42,
        createdAt: '2023-04-10T09:15:00Z',
    },
    {
        id: 'g4',
        name: 'Petites Annonces',
        description: 'Achats, ventes et dons entre voisins',
        avatar: '/placeholder.svg?height=40&width=40',
        type: 'public',
        memberCount: 36,
        createdAt: '2023-07-05T16:20:00Z',
    },
];

// Mock data for private groups with invites
const invitedGroups: Group[] = [
    {
        id: 'g5',
        name: 'Copropriété Résidence des Fleurs',
        description: 'Groupe des propriétaires de la Résidence des Fleurs',
        avatar: '/placeholder.svg?height=40&width=40',
        type: 'private',
        memberCount: 12,
        createdAt: '2023-05-22T11:30:00Z',
    },
];

export function JoinGroupDialog({
    open,
    onOpenChange,
    onJoinGroup,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onJoinGroup: (group: Group) => void;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('discover');

    const filteredPublicGroups = publicGroups.filter(
        (group) =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleJoinGroup = (group: Group) => {
        onJoinGroup(group);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-primary">Rejoindre un groupe</DialogTitle>
                    <DialogDescription>Découvrez et rejoignez des groupes de discussion.</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="discover" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full bg-muted">
                        <TabsTrigger value="discover" className="flex-1">
                            Découvrir
                        </TabsTrigger>
                        <TabsTrigger value="invites" className="flex-1">
                            Invitations ({invitedGroups.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="discover" className="space-y-4 py-2">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                size={18}
                            />
                            <Input
                                placeholder="Rechercher des groupes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-border focus-visible:ring-orange"
                            />
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {filteredPublicGroups.length > 0 ? (
                                filteredPublicGroups.map((group) => (
                                    <div
                                        key={group.id}
                                        className="border border-border rounded-lg p-3 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-start">
                                            <img
                                                src={group.avatar || '/placeholder.svg'}
                                                alt={group.name}
                                                className="w-12 h-12 rounded-lg mr-3"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center">
                                                    <h4 className="font-medium text-primary truncate">
                                                        {group.name}
                                                    </h4>
                                                    <Globe size={14} className="ml-2 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                    {group.description}
                                                </p>
                                                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                                    <Users size={14} className="mr-1" />
                                                    <span>{group.memberCount} membres</span>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handleJoinGroup(group)}
                                                className="ml-2 bg-orange hover:bg-orange-hover text-white"
                                                size="sm"
                                            >
                                                Rejoindre
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Aucun groupe trouvé pour "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="invites" className="space-y-4 py-2">
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {invitedGroups.length > 0 ? (
                                invitedGroups.map((group) => (
                                    <div
                                        key={group.id}
                                        className="border border-border rounded-lg p-3 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-start">
                                            <img
                                                src={group.avatar || '/placeholder.svg'}
                                                alt={group.name}
                                                className="w-12 h-12 rounded-lg mr-3"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center">
                                                    <h4 className="font-medium text-primary truncate">
                                                        {group.name}
                                                    </h4>
                                                    <Lock size={14} className="ml-2 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                    {group.description}
                                                </p>
                                                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                                    <Users size={14} className="mr-1" />
                                                    <span>{group.memberCount} membres</span>
                                                </div>
                                            </div>
                                            <div className="ml-2 flex flex-col gap-2">
                                                <Button
                                                    onClick={() => handleJoinGroup(group)}
                                                    className="bg-orange hover:bg-orange-hover text-white"
                                                    size="sm"
                                                >
                                                    Accepter
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => onOpenChange(false)}
                                                    className="border-border text-primary"
                                                    size="sm"
                                                >
                                                    Refuser
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Vous n'avez pas d'invitations en attente
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
