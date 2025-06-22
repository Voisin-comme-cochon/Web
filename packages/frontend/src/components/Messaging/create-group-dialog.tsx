import { useState } from 'react';
import { Search, Plus, Lock, Globe, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

type User = {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
};

const suggestedUsers: User[] = [
    { id: '1', name: 'Marie Dupont', avatar: '/placeholder.svg?height=40&width=40', online: true },
    { id: '2', name: 'Thomas Martin', avatar: '/placeholder.svg?height=40&width=40', online: false },
    { id: '3', name: 'Sophie Bernard', avatar: '/placeholder.svg?height=40&width=40', online: true },
    { id: '4', name: 'Lucas Petit', avatar: '/placeholder.svg?height=40&width=40', online: false },
    { id: '6', name: 'Émilie Rousseau', avatar: '/placeholder.svg?height=40&width=40', online: true },
    { id: '7', name: 'Antoine Lefevre', avatar: '/placeholder.svg?height=40&width=40', online: false },
    { id: '8', name: 'Camille Dubois', avatar: '/placeholder.svg?height=40&width=40', online: true },
];

export function CreateGroupDialog({
    open,
    onOpenChange,
    onCreateGroup,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateGroup: (group: { id: string; name: string; description: string; type: 'public' | 'private'; members: User[]; avatar: string }) => void;
}) {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupType, setGroupType] = useState('public');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

    const filteredUsers = suggestedUsers.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !selectedMembers.some((member) => member.id === user.id)
    );

    const handleAddMember = (user: User) => {
        setSelectedMembers([...selectedMembers, user]);
        setSearchQuery('');
    };

    const handleRemoveMember = (userId: string) => {
        setSelectedMembers(selectedMembers.filter((member) => member.id !== userId));
    };

    const handleCreateGroup = () => {
        if (!groupName.trim()) return;

        const newGroup = {
            id: `group-${Date.now()}`,
            name: groupName,
            description: groupDescription,
            type: groupType,
            members: selectedMembers,
            createdAt: new Date().toISOString(),
            avatar: '/placeholder.svg?height=40&width=40',
        };

        onCreateGroup(newGroup);
        onOpenChange(false);

        // Reset form
        setGroupName('');
        setGroupDescription('');
        setGroupType('public');
        setSelectedMembers([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-primary">Créer un nouveau groupe</DialogTitle>
                    <DialogDescription>
                        Créez un canal de discussion pour échanger avec plusieurs personnes.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-primary">
                            Nom du groupe
                        </Label>
                        <Input
                            id="name"
                            placeholder="Ex: Voisins du Quartier"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="border-border focus-visible:ring-orange"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-primary">
                            Description (optionnelle)
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Décrivez l'objectif de ce groupe..."
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            className="border-border focus-visible:ring-orange resize-none h-20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-primary">Type de groupe</Label>
                        <RadioGroup value={groupType} onValueChange={setGroupType} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="public" id="public" className="text-orange" />
                                <Label htmlFor="public" className="flex items-center cursor-pointer">
                                    <Globe size={16} className="mr-1 text-muted-foreground" />
                                    Public
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="private" id="private" className="text-orange" />
                                <Label htmlFor="private" className="flex items-center cursor-pointer">
                                    <Lock size={16} className="mr-1 text-muted-foreground" />
                                    Privé
                                </Label>
                            </div>
                        </RadioGroup>
                        <p className="text-xs text-muted-foreground mt-1">
                            {groupType === 'public'
                                ? 'Tout le monde peut trouver et rejoindre ce groupe.'
                                : 'Seules les personnes invitées peuvent rejoindre ce groupe.'}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-primary">Ajouter des membres</Label>
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                size={16}
                            />
                            <Input
                                placeholder="Rechercher des personnes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-border focus-visible:ring-orange"
                            />
                        </div>

                        {/* Selected Members */}
                        {selectedMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center bg-muted rounded-full pl-1 pr-2 py-1"
                                    >
                                        <img
                                            src={member.avatar || '/placeholder.svg'}
                                            alt={member.name}
                                            className="w-5 h-5 rounded-full mr-1"
                                        />
                                        <span className="text-xs text-primary">{member.name}</span>
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="ml-1 text-muted-foreground hover:text-primary"
                                        >
                                            <X size={14} />
                                            <span className="sr-only">Retirer {member.name}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Suggested Users */}
                        {searchQuery && filteredUsers.length > 0 && (
                            <div className="mt-2 border border-border rounded-md max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => handleAddMember(user)}
                                        className="flex items-center p-2 hover:bg-muted cursor-pointer"
                                    >
                                        <div className="relative">
                                            <img
                                                src={user.avatar || '/placeholder.svg'}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full mr-2"
                                            />
                                            {user.online && (
                                                <div className="absolute bottom-0 right-2 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                                            )}
                                        </div>
                                        <span className="text-sm text-primary">{user.name}</span>
                                        <Plus size={16} className="ml-auto text-orange" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-border text-primary"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleCreateGroup}
                        disabled={!groupName.trim()}
                        className="bg-orange hover:bg-orange-hover text-white"
                    >
                        Créer le groupe
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
