import { useEffect, useMemo, useState } from 'react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, Copy, Trash2 } from 'lucide-react';
import { InvitationModel } from '@/domain/models/invitation.model.ts';
import { useToast } from '@/presentation/hooks/useToast.ts';

export default function NeighborhoodManageInvitationsPage({
    uc,
    neighborhood,
}: {
    uc: HomeUc;
    neighborhood: FrontNeighborhood;
}) {
    const [invitations, setInvitations] = useState<InvitationModel[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sortBy, setSortBy] = useState<keyof InvitationModel | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const { showSuccess } = useToast();

    useEffect(() => {
        uc.getInvitationsByNeighborhoodId(neighborhood.id).then((data) => {
            setInvitations(data);
        });
    }, [neighborhood.id, uc]);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleDelete = async () => {
        await Promise.all(selectedIds.map((id) => uc.deleteInvitation(id)));
        const remaining = invitations.filter((inv) => !selectedIds.includes(inv.id));
        setInvitations(remaining);
        setSelectedIds([]);
        showSuccess('Invitations supprimées avec succès !');
    };

    const handleSort = (field: keyof InvitationModel) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const sortedInvitations = useMemo(() => {
        if (!sortBy) return invitations;
        return [...invitations].sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            if (typeof aVal === 'string' && Date.parse(aVal)) {
                return (new Date(aVal).getTime() - new Date(bVal as string).getTime()) * (sortOrder === 'asc' ? 1 : -1);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return (aVal - bVal) * (sortOrder === 'asc' ? 1 : -1);
            }
            return 0;
        });
    }, [invitations, sortBy, sortOrder]);

    const allSelected = sortedInvitations.length > 0 && selectedIds.length === sortedInvitations.length;

    const shorten = (str: string) => `${str.slice(0, 8)}…${str.slice(-8)}`;

    const copyLink = (token: string) => {
        const link = `${window.location.origin}/login?redirect=/neighborhoods/invite/${token}`;
        navigator.clipboard.writeText(link);
        showSuccess(`Lien d'invitation copié !`);
    };

    return (
        <div className="space-y-4">
            <div className={'flex justify-end'}>
                <Button variant={'destructive'} disabled={selectedIds.length == 0} onClick={handleDelete}>
                    Supprimer la sélection
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-8">
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={(checked) => {
                                    setSelectedIds(checked ? sortedInvitations.map((i) => i.id) : []);
                                }}
                            />
                        </TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('token')}>
                            <div className="flex items-center space-x-1">
                                <span>Lien</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('maxUse')}>
                            <div className="flex items-center space-x-1">
                                <span>Utilisations max</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('usedCount')}>
                            <div className="flex items-center space-x-1">
                                <span>Utilisées</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('creationDate')}>
                            <div className="flex items-center space-x-1">
                                <span>Créé le</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('expiredAt')}>
                            <div className="flex items-center space-x-1">
                                <span>Expire le</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedInvitations.map((inv) => (
                        <TableRow key={inv.id}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedIds.includes(inv.id)}
                                    onCheckedChange={() => toggleSelect(inv.id)}
                                />
                            </TableCell>
                            <TableCell>{inv.id}</TableCell>
                            <TableCell className="flex items-center space-x-2">
                                <span className="font-mono">{shorten(inv.token)}</span>
                                <Button variant="ghost" size="icon" onClick={() => copyLink(inv.token)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            <TableCell>{inv.maxUse}</TableCell>
                            <TableCell>{inv.usedCount}</TableCell>
                            <TableCell>{new Date(inv.creationDate).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell>{new Date(inv.expiredAt).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={async () => {
                                        await uc.deleteInvitation(inv.id);
                                        setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
                                        setSelectedIds((prev) => prev.filter((x) => x !== inv.id));
                                        showSuccess('Invitation supprimée avec succès !');
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
