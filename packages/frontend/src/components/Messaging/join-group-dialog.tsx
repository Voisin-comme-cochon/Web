import { useState } from 'react';
import { Globe, Lock, Search, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type Group = {
    id: string;
    name: string;
    description: string;
    avatar: string;
    imageUrl?: string;
    type: 'public' | 'private';
    memberCount: number;
    createdAt: string;
};

export function JoinGroupDialog({
    open,
    onOpenChange,
    onJoinGroup,
    onDeclineInvitation,
    availableGroups,
    invitedGroups,
    loading,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onJoinGroup: (group: Group) => void;
    onDeclineInvitation?: (group: Group) => void;
    availableGroups: Group[];
    invitedGroups: Group[];
    loading?: boolean;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('discover');

    const filteredPublicGroups = availableGroups.filter(
        (group) =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleJoinGroup = (group: Group) => {
        onJoinGroup(group);
        onOpenChange(false);
    };

    const handleDeclineInvitation = (group: Group) => {
        if (onDeclineInvitation) {
            onDeclineInvitation(group);
        }
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
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">Chargement des groupes...</div>
                            ) : filteredPublicGroups.length > 0 ? (
                                filteredPublicGroups.map((group) => (
                                    <div
                                        key={group.id}
                                        className="border border-border rounded-lg p-3 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-start">
                                            <img
                                                src={group.avatar || group.imageUrl || '/placeholder.svg'}
                                                alt={group.name}
                                                className="w-12 h-12 rounded-lg mr-3"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center">
                                                    <h4 className="font-medium text-primary truncate">{group.name}</h4>
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
                                                src={group.avatar || group.imageUrl || '/placeholder.svg'}
                                                alt={group.name}
                                                className="w-12 h-12 rounded-lg mr-3"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center">
                                                    <h4 className="font-medium text-primary truncate">{group.name}</h4>
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
                                                    onClick={() => handleDeclineInvitation(group)}
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
