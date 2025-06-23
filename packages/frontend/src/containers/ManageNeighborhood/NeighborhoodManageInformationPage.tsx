import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { Button } from '@/components/ui/button.tsx';
import { useState } from 'react';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';
import { useToast } from '@/presentation/hooks/useToast.ts';
import { ApiError } from '@/shared/errors/ApiError.ts';

export default function NeighborhoodManageInformationPage({
    uc,
    neighborhood,
}: {
    uc: HomeUc;
    neighborhood: FrontNeighborhood;
}) {
    const [isEditing, setEditing] = useState(false);
    const [name, setName] = useState(neighborhood?.name || '');
    const [editName, setEditName] = useState(neighborhood?.name || '');
    const [description, setDescription] = useState(neighborhood?.description || '');
    const [editDescription, setEditDescription] = useState(neighborhood?.description || '');
    const { showSuccess, showError } = useToast();

    const handleSubmit = async () => {
        try {
            await uc.updateNeighborhoodManage(editName, editDescription, neighborhood.id);
            setName(editName);
            setDescription(editDescription);
            setEditing(false);
            showSuccess('Informations du quartier mises à jour avec succès !');
        } catch (err) {
            showError(
                (err as ApiError)?.message ||
                    'Une erreur est survenue lors de la mise à jour des informations du quartier.'
            );
        }
    };

    return (
        <div>
            <div className={'flex justify-between items-center mb-6'}>
                <div className={'flex flex-col items-start'}>
                    <p className={'text-xl font-bold'}>Informations du quartier</p>
                    <p className={'text-xs'}>Modifiez le nom et la description de votre quartier</p>
                </div>
                <Button variant={'orange'} onClick={() => setEditing(!isEditing)}>
                    <span className="material-symbols-outlined">edit_square</span>
                    Modifier
                </Button>
            </div>
            {isEditing ? (
                <div className="flex flex-col space-y-4">
                    <input
                        type="text"
                        placeholder="Nom du quartier"
                        className="border p-2 rounded"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                    />
                    <textarea
                        placeholder="Description du quartier"
                        className="border p-2 rounded"
                        rows={4}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                    />
                    <div className={'flex gap-4 justify-end'}>
                        <Button variant={'outline'} onClick={() => setEditing(false)}>
                            Annuler
                        </Button>
                        <Button variant={'orange'} onClick={() => handleSubmit()}>
                            Enregistrer
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="p-4 border rounded">
                    <p className="text-lg font-semibold">{name}</p>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            )}
        </div>
    );
}
