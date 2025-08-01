import { useEffect, useMemo, useState } from 'react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/presentation/hooks/useToast.ts';
import { Eye, Trash2 } from 'lucide-react';
import { NeighborhoodMemberManageModel } from '@/domain/models/NeighborhoodUser.model.ts';
import { Roles } from '@/domain/models/Roles.ts';
import { UserStatus } from '@/domain/models/UserStatus.ts';
import { getRoleText, getStatusText } from '@/shared/utils/get-enum-values.ts';
import { ApiError } from '@/shared/errors/ApiError.ts';
import { InvitationDialog } from '@/components/InvitationDialog/InvitationDialog.tsx';
import { useAppNavigation } from '@/presentation/state/navigate.ts';

type Props = {
    uc: HomeUc;
    neighborhoodId: number;
};

export default function MemberManagePage({ uc, neighborhoodId }: Props) {
    const [members, setMembers] = useState<NeighborhoodMemberManageModel[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const { showSuccess, showError } = useToast();
    const { goUserProfile } = useAppNavigation();

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
                `${m.firstName} ${m.lastName} ${getRoleText(m.neighborhoodRole)} ${getStatusText(m.status)}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
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
            return new Set(current.map((m) => m.userId));
        });
    };

    const handleDelete = (ids: number[]) => {
        if (!confirm(`Supprimer ${ids.length} membre(s) ?`)) return;
        setMembers((prev) => prev.filter((m) => !ids.includes(m.userId) || m.neighborhoodRole === Roles.ADMIN));
        setSelectedIds((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => next.delete(id));
            return next;
        });
        try {
            ids.forEach((id) => {
                uc.removeUserFromNeighborhood(neighborhoodId, id).catch((err) => {
                    showError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
                });
            });
            showSuccess('Membre(s) supprimé(s) avec succès !');
        } catch (err) {
            showError((err as ApiError).message || 'Erreur lors de la suppression');
        }
    };

    const handleRoleChange = async (userId: number, newRole: Roles) => {
        try {
            await uc.updateNeighborhoodMemberRole(neighborhoodId, userId, newRole);
            setMembers((prev) => prev.map((m) => (m.userId === userId ? { ...m, neighborhoodRole: newRole } : m)));
            showSuccess('Rôle mis à jour avec succès !');
        } catch (err) {
            showError((err as ApiError).message || 'Erreur lors de la mise à jour du rôle');
        }
    };

    const handleStatusChange = async (userId: number, newStatus: UserStatus) => {
        try {
            await uc.updateNeighborhoodMemberStatus(neighborhoodId, userId, newStatus);
            setMembers((prev) => prev.map((m) => (m.userId === userId ? { ...m, status: newStatus } : m)));
            showSuccess('Statut mis à jour avec succès !');
        } catch (err) {
            showError((err as ApiError).message || 'Erreur lors de la mise à jour du statut');
        }
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
                        <InvitationDialog
                            isDialogOpen={isDialogOpen}
                            setIsDialogOpen={setIsDialogOpen}
                            uc={uc}
                            neighborhoodId={neighborhoodId}
                        />

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
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {current.map((member) => (
                            <TableRow key={member.userId} className="hover:bg-gray-50">
                                <TableCell className="px-4">
                                    <Checkbox
                                        checked={selectedIds.has(member.userId)}
                                        onCheckedChange={() => toggleSelect(member.userId)}
                                    />
                                </TableCell>
                                <TableCell>{member.lastName}</TableCell>
                                <TableCell>{member.firstName}</TableCell>
                                <TableCell>
                                    <select
                                        value={member.neighborhoodRole}
                                        onChange={(e) => handleRoleChange(member.userId, e.target.value as Roles)}
                                        className="border rounded p-1"
                                    >
                                        {Object.values(Roles).map(
                                            (r) =>
                                                r !== Roles.SUPER_ADMIN && (
                                                    <option key={r} value={r}>
                                                        {getRoleText(r)}
                                                    </option>
                                                )
                                        )}
                                    </select>
                                </TableCell>
                                <TableCell>
                                    <select
                                        value={member.status as UserStatus}
                                        onChange={(e) =>
                                            handleStatusChange(member.userId, e.target.value as UserStatus)
                                        }
                                        className="border rounded p-1"
                                    >
                                        {Object.values(UserStatus).map((s: UserStatus | string) => (
                                            <option key={s} value={s}>
                                                {getStatusText(s)}
                                            </option>
                                        ))}
                                    </select>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            goUserProfile(member.userId);
                                        }}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete([member.userId])}>
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
