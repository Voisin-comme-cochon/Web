import { useEffect, useMemo, useState } from 'react';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/presentation/hooks/useToast.ts';
import { ApiError } from '@/shared/errors/ApiError.ts';
import { EventManageModel } from '@/domain/models/EventManageModel.ts';
import TagComponent from '@/components/TagComponent/TagComponent.tsx';
import { Eye, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useAppNavigation } from '@/presentation/state/navigate.ts';

type Props = {
    uc: HomeUc;
    neighborhoodId: number;
};

export default function EventManagePage({ uc, neighborhoodId }: Props) {
    const [events, setEvents] = useState<EventManageModel[]>([]);
    const [search, setSearch] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { showError, showSuccess } = useToast();
    const { goEventDetail } = useAppNavigation();
    const itemsPerPage = 10;

    const handleDelete = async (eventIds: number[]) => {
        try {
            await Promise.all(
                eventIds.map((id) => uc.deleteEvent(id, "Évènement supprimé par l'administrateur du quartier"))
            );
            setEvents((prev) => prev.filter((e) => !eventIds.includes(e.id)));
            showSuccess('Évènement(s) supprimé(s) avec succès');
        } catch (err) {
            showError((err as ApiError).message || "Erreur lors de la suppression de l'évènement");
        }
    };

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await uc.getNeighborhoodManageEvents(neighborhoodId);
                setEvents(data);
            } catch (err) {
                showError((err as ApiError).message || 'Erreur lors du chargement des évènements');
            }
        }

        fetchEvents();
    }, []);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Paris',
        });

    const filtered = useMemo(
        () =>
            events.filter((e) =>
                `${e.name} ${e.tag.name} ${formatDate(e.dateStart)} ${formatDate(e.dateEnd)}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
            ),
        [events, search]
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
            return new Set(current.map((e) => e.id));
        });
    };

    return (
        <div className="flex justify-center items-center mb-12">
            <div className="w-full max-w-5xl bg-white border-t-4 border-orange rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <Input
                        placeholder="Rechercher évènement..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="max-w-xs"
                    />
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={selectedIds.size === 0}
                                className="flex items-center space-x-1"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Supprimer la sélection</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmation de suppression</DialogTitle>
                                <DialogDescription>
                                    Voulez-vous vraiment supprimer {selectedIds.size} évènement(s) ?
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        handleDelete(Array.from(selectedIds));
                                        setSelectedIds(new Set());
                                        setIsDeleteDialogOpen(false);
                                    }}
                                >
                                    Supprimer
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                            <TableHead>Tag</TableHead>
                            <TableHead>Inscrits</TableHead>
                            <TableHead>Date début</TableHead>
                            <TableHead>Date fin</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {current.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    Aucun évènement trouvé
                                </TableCell>
                            </TableRow>
                        )}
                        {current.map((event) => (
                            <TableRow key={event.id} className="hover:bg-gray-50">
                                <TableCell className="px-4">
                                    <Checkbox
                                        checked={selectedIds.has(event.id)}
                                        onCheckedChange={() => toggleSelect(event.id)}
                                    />
                                </TableCell>
                                <TableCell>{event.name}</TableCell>
                                <TableCell>
                                    <TagComponent tag={event.tag} />
                                </TableCell>
                                <TableCell>
                                    {event.registeredUsers} / {event.max}
                                </TableCell>
                                <TableCell>{formatDate(event.dateStart)}</TableCell>
                                <TableCell>{formatDate(event.dateEnd)}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            goEventDetail(event.id);
                                        }}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => toggleSelect(event.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Confirmer la suppression</DialogTitle>
                                                <DialogDescription>
                                                    Supprimer l'évènement “{event.name}” ?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Annuler</Button>
                                                </DialogClose>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => {
                                                        handleDelete([event.id]);
                                                        setSelectedIds((prev) => {
                                                            const nxt = new Set(prev);
                                                            nxt.delete(event.id);
                                                            return nxt;
                                                        });
                                                    }}
                                                >
                                                    Supprimer
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
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
