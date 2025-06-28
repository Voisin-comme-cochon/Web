import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Hourglass, Ban, X, RotateCw } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AvatarComponent from '@/components/AvatarComponent/AvatarComponent';
import { GroupModel, MembershipStatus, UserSummaryModel } from '@/domain/models/messaging.model';
import { MessagingUc } from '@/domain/use-cases/messagingUc';
import { MessagingRepository } from '@/infrastructure/repositories/MessagingRepository';
import { useToast } from '@/presentation/hooks/useToast';

interface ManageMembersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group: GroupModel | null;
    neighborhoodId?: number;
    onMembersUpdated?: () => void;
}

export function ManageMembersDialog({
    open,
    onOpenChange,
    group,
    neighborhoodId,
    onMembersUpdated,
}: ManageMembersDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSummaryModel[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('active');

    const { showSuccess, showError } = useToast();

    const messagingUc = useMemo(() => new MessagingUc(new MessagingRepository()), []);

    // ===== SEARCH USERS =====
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const search = async () => {
            if (!neighborhoodId || searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const users = await messagingUc.searchUsers(neighborhoodId, searchQuery.trim());
                if (!signal.aborted) {
                    // Exclure les membres déjà présents (tous statuts)
                    const existingIds = new Set(group?.members?.map((m) => m.userId));
                    const filtered = users.filter((u) => !existingIds.has(u.id));
                    setSearchResults(filtered);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (!signal.aborted) setIsSearching(false);
            }
        };
        void search();
        return () => controller.abort();
    }, [searchQuery, neighborhoodId, group?.members, messagingUc]);

    const handleReinvite = async (member: any) => {
        try {
            // supprimer l'ancienne invitation refusée puis renvoyer
            await messagingUc.revokeInvitation(member.id);
            await messagingUc.inviteToGroup(group!.id, [member.userId]);
            const updated = await messagingUc.getGroupMembers(group!.id);
            setMembers(updated);
            onMembersUpdated?.();
            showSuccess('Invitation relancée');
        } catch (e) {
            showError("Erreur lors de la relance");
        }
    };

    const handleRevoke = async (membershipId: number) => {
        try {
            await messagingUc.revokeInvitation(membershipId);
            const updated = await messagingUc.getGroupMembers(group!.id);
            setMembers(updated);
            onMembersUpdated?.();
            showSuccess('Invitation révoquée');
        } catch (e) {
            showError("Erreur lors de la révocation");
        }
    };

    const handleInvite = async (user: UserSummaryModel) => {
        if (!group) return;
        try {
            await messagingUc.inviteToGroup(group.id, [user.id]);
            showSuccess(`${user.firstName} ${user.lastName} a été invité`);
            // recharger membres pour inclure nouveau statut pending
            const updated = await messagingUc.getGroupMembers(group.id);
            setMembers(updated);
            onMembersUpdated?.();
            setSearchQuery('');
            setSearchResults([]);
        } catch (e) {
            showError("Erreur lors de l'invitation");
        }
    };

    const [members, setMembers] = useState(group?.members || []);

    // charger membres quand ouverture
    useEffect(() => {
        const load = async () => {
            if (open && group) {
                try {
                    const result = await messagingUc.getGroupMembers(group.id);
                    setMembers(result);
                } catch (e) {
                    console.error('Erreur chargement membres', e);
                }
            }
        };
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, group?.id]);

    const membersByStatus = {
        [MembershipStatus.ACTIVE]: members.filter((m) => m.status === MembershipStatus.ACTIVE),
        [MembershipStatus.PENDING]: members.filter((m) => m.status === MembershipStatus.PENDING),
        [MembershipStatus.DECLINED]: members.filter((m) => m.status === MembershipStatus.DECLINED),
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-primary">Gérer les membres</DialogTitle>
                    <DialogDescription>Inviter de nouveaux voisins et consulter le statut des invitations.</DialogDescription>
                </DialogHeader>

                {/* SEARCH */}
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        placeholder="Rechercher des utilisateurs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-border focus-visible:ring-orange"
                    />
                </div>
                {searchQuery.trim().length > 0 && (
                    <div className="mt-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 border border-border rounded-md">
                        {isSearching ? (
                            <div className="p-3 text-center text-muted-foreground text-sm">Recherche...</div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center p-2 hover:bg-muted cursor-pointer"
                                    onClick={() => handleInvite(user)}
                                >   
                                    <AvatarComponent image={user.profileImageUrl} className="w-8 h-8 mr-2" />
                                    <span className="text-sm text-primary">
                                        {user.firstName} {user.lastName}
                                    </span>
                                    <Plus size={16} className="text-orange" />
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-center text-muted-foreground text-sm">Aucun résultat</div>
                        )}
                    </div>
                )}

                {/* MEMBERS LIST */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
                    <TabsList className="w-full bg-muted">
                        <TabsTrigger value="active" className="flex-1">
                            Membres ({membersByStatus[MembershipStatus.ACTIVE].length})
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="flex-1">
                            En attente ({membersByStatus[MembershipStatus.PENDING].length})
                        </TabsTrigger>
                        <TabsTrigger value="rejected" className="flex-1">
                            Refusées ({membersByStatus[MembershipStatus.DECLINED].length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="mt-3 max-h-[250px] overflow-y-auto">
                        {membersByStatus[MembershipStatus.ACTIVE].length > 0 ? (
                            membersByStatus[MembershipStatus.ACTIVE].map((member) => (
                                <div key={member.id} className="flex items-center p-2 border-b border-border last:border-0">
                                    <AvatarComponent image={member.user.profileImageUrl} className="w-8 h-8 mr-2" />
                                    <span className="text-sm text-primary">
                                        {member.user.firstName} {member.user.lastName}
                                    </span>
                                    {member.isOwner && (
                                        <span className="ml-auto text-xs text-muted-foreground">Propriétaire</span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-sm text-muted-foreground text-center">Aucun membre</div>
                        )}
                    </TabsContent>

                    <TabsContent value="pending" className="mt-3 max-h-[250px] overflow-y-auto">
                        {membersByStatus[MembershipStatus.PENDING].length > 0 ? (
                            membersByStatus[MembershipStatus.PENDING].map((member) => (
                                <div key={member.id} className="flex items-center p-2 border-b border-border last:border-0">
                                    <AvatarComponent image={member.user.profileImageUrl} className="w-8 h-8 mr-2" />
                                    <span className="text-sm text-primary">
                                        {member.user.firstName} {member.user.lastName}
                                    </span>
                                    <Hourglass size={14} className="ml-2 text-muted-foreground" />
                                    <button
                                        className="ml-auto text-destructive hover:text-destructive/80"
                                        onClick={() => handleRevoke(member.id)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-sm text-muted-foreground text-center">Aucune invitation en cours</div>
                        )}
                    </TabsContent>

                    <TabsContent value="rejected" className="mt-3 max-h-[250px] overflow-y-auto">
                        {membersByStatus[MembershipStatus.DECLINED].length > 0 ? (
                            membersByStatus[MembershipStatus.DECLINED].map((member) => (
                                <div key={member.id} className="flex items-center p-2 border-b border-border last:border-0">
                                    <AvatarComponent image={member.user.profileImageUrl} className="w-8 h-8 mr-2" />
                                    <span className="text-sm text-primary">
                                        {member.user.firstName} {member.user.lastName}
                                    </span>
                                    <Ban size={14} className="ml-2 text-destructive" />
                                    <button
                                        className="ml-auto text-primary hover:text-primary/80"
                                        onClick={() => handleReinvite(member)}
                                        title="Relancer l'invitation"
                                    >
                                        <RotateCw size={14} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-sm text-muted-foreground text-center">Aucune invitation refusée</div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
