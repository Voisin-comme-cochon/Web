import { useEffect, useMemo, useState } from 'react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/presentation/hooks/useToast.ts';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Copy, Eye, Link as LinkIcon, Trash2 } from 'lucide-react';
import { NeighborhoodUserModel } from '@/domain/models/NeighborhoodUser.model.ts';
import { Roles } from '@/domain/models/Roles.ts';

type Props = {
    uc: HomeUc;
    neighborhoodId: number;
};

const getRoleText = (role: Roles | string) => {
    switch (role) {
        case Roles.ADMIN:
            return 'Administrateur';
        case Roles.USER:
            return 'Membre';
        case Roles.JOURNALIST:
            return 'Journaliste';
        default:
            return 'Inconnu';
    }
};

export default function MemberManagePage({ uc, neighborhoodId }: Props) {
    const [members, setMembers] = useState<NeighborhoodUserModel[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [duration, setDuration] = useState<number>(7);
    const [maxUses, setMaxUses] = useState<number>(1);
    const [inviteLink, setInviteLink] = useState<string>('');
    const { showSuccess } = useToast();

    const itemsPerPage = 10;

    useEffect(() => {
        async function fetchMembers() {
            const data = await uc.getNeighborhoodMembers(neighborhoodId);
            setMembers(data);
        }

        fetchMembers();
    }, [neighborhoodId, uc]);

    const filtered = useMemo(
        () =>
            members.filter((m) =>
                `${m.firstName} ${m.lastName} ${m.neighborhoodRole}`.toLowerCase().includes(search.toLowerCase())
            ),
        [members, search]
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const start = (currentPage - 1) * itemsPerPage;
    const current = filtered.slice(start, start + itemsPerPage);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        setSelectedIds((prev) => {
            if (prev.size === current.length) return new Set<number>();
            return new Set(current.map((m) => m.id));
        });
    };

    const handleDelete = (ids: number[]) => {
        if (!confirm(`Supprimer ${ids.length} membre(s) ?`)) return;
        setMembers((prev) => prev.filter((m) => !ids.includes(m.id)));
        setSelectedIds((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => next.delete(id));
            return next;
        });
    };

    const generateLink = async () => {
        const link = await uc.generateInviteLink(neighborhoodId, duration, maxUses);
        setInviteLink(link);
        showSuccess('Lien généré avec succès !');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink).then(() => {
            showSuccess('Lien copié dans le presse-papier !');
        });
    };

    return (
        <div className="flex justify-center items-center mb-12">
            <div className="w-full max-w-5xl bg-white border-t-4 border-orange rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <Input
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="max-w-xs"
                    />
                    <div className="flex space-x-2">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="orange" size="sm" className="flex items-center">
                                    <LinkIcon className="mr-2 h-4 w-4" /> Inviter des membres
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Inviter des membres</DialogTitle>
                                    <DialogDescription>
                                        Renseignez la durée de validité du lien (en jours) et le nombre maximum
                                        d'utilisations.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Durée (jours)</label>
                                        <Input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(Number(e.target.value))}
                                            min={1}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Nombre max d'utilisations
                                        </label>
                                        <Input
                                            type="number"
                                            value={maxUses}
                                            onChange={(e) => setMaxUses(Number(e.target.value))}
                                            min={1}
                                        />
                                    </div>

                                    {inviteLink && (
                                        <div className="mt-2 flex items-center space-x-2 bg-gray-100 p-3 rounded-lg">
                                            <Input value={inviteLink} readOnly className="flex-1 bg-white" />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={copyToClipboard}
                                                className="flex items-center space-x-1"
                                            >
                                                <Copy className="h-4 w-4" />
                                                <span>Copier</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Annuler</Button>
                                    </DialogClose>
                                    <Button onClick={generateLink} variant="orange">
                                        Générer le lien
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={selectedIds.size === 0}
                            onClick={() => handleDelete(Array.from(selectedIds))}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer sélection
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-4 px-4">
                                <Checkbox
                                    checked={selectedIds.size === current.length && current.length > 0}
                                    indeterminate={selectedIds.size > 0 && selectedIds.size < current.length}
                                    onCheckedChange={selectAll}
                                />
                            </TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Prénom</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {current.map((member) => (
                            <TableRow key={member.id} className="hover:bg-gray-50">
                                <TableCell className="px-4">
                                    <Checkbox
                                        checked={selectedIds.has(member.id)}
                                        onCheckedChange={() => toggleSelect(member.id)}
                                    />
                                </TableCell>
                                <TableCell>{member.lastName}</TableCell>
                                <TableCell>{member.firstName}</TableCell>
                                <TableCell>{getRoleText(member.neighborhoodRole)}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="icon" onClick={() => {}}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete([member.id])}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex justify-between items-center mt-4">
                    <span>
                        Page {currentPage} sur {totalPages}
                    </span>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        >
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
