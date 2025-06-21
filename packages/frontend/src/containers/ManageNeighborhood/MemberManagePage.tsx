import { useEffect, useMemo, useState } from 'react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Trash2 } from 'lucide-react';
import { NeighborhoodUserModel } from '@/domain/models/NeighborhoodUser.model.ts';

export default function MemberManagePage({ uc, neighborhoodId }: { uc: HomeUc; neighborhoodId: number }) {
    const [members, setMembers] = useState<NeighborhoodUserModel[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);

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
        // await uc.deleteMembers(neighborhoodId, ids);
        setMembers((prev) => prev.filter((m) => !ids.includes(m.id)));
        setSelectedIds((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => next.delete(id));
            return next;
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
                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={selectedIds.size === 0}
                        onClick={() => handleDelete(Array.from(selectedIds))}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer sélection
                    </Button>
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
                                <TableCell>{member.neighborhoodRole}</TableCell>
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
