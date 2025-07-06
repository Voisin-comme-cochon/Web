import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateLoanRequestRequest } from '@/domain/models/loan-request.model';
import { ItemModel } from '@/domain/models/item.model';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SlotSelector from '@/components/Items/Availability/SlotSelector/SlotSelector';
import { useItemAvailabilities } from '@/presentation/hooks/useItems';
import { validateSlotSelection } from '@/utils/slot-validation.utils';
import { format } from 'date-fns';

interface LoanRequestFormProps {
    item: ItemModel;
    onSubmit: (data: CreateLoanRequestRequest) => Promise<void>;
    loading?: boolean;
    error?: string | null;
    onCancel?: () => void;
}

export default function LoanRequestForm({ 
    item, 
    onSubmit, 
    loading = false, 
    error,
    onCancel 
}: LoanRequestFormProps) {
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [isSlotValid, setIsSlotValid] = useState(false);
    const [validationError, setValidationError] = useState<string>('');
    const [isSubmittingManually, setIsSubmittingManually] = useState(false);

    const { availabilities } = useItemAvailabilities(item.id);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<{
        message?: string;
    }>();



    const handleFormSubmit = async (data: { message?: string }) => {
        // Empêcher la soumission automatique
        if (!isSubmittingManually) {
            return;
        }
        
        setValidationError('');
        
        if (!selectedStartDate || !selectedEndDate) {
            setValidationError('Veuillez sélectionner une période');
            return;
        }

        // Validation côté client
        const validationResult = validateSlotSelection(selectedStartDate, selectedEndDate, availabilities, {
            minDuration: 1,
            maxDuration: 30
        });
        
        if (validationResult) {
            setValidationError(validationResult);
            return;
        }

        const submitData: CreateLoanRequestRequest = {
            item_id: item.id,
            start_date: selectedStartDate,
            end_date: selectedEndDate,
            message: data.message
        };

        try {
            await onSubmit(submitData);
        } catch (err) {
            // L'erreur sera gérée par le parent
        } finally {
            setIsSubmittingManually(false);
        }
    };

    const handleSlotSelectionChange = (startDate: Date | null, endDate: Date | null, isValid: boolean) => {
        setSelectedStartDate(startDate);
        setSelectedEndDate(endDate);
        setIsSlotValid(false); // Ne jamais marquer comme "valide" automatiquement
        setValidationError(''); // Réinitialiser l'erreur de validation quand on change la sélection
    };



    return (
        <form 
            onSubmit={handleSubmit(handleFormSubmit)} 
            className="space-y-6"
            onKeyDown={(e) => {
                // Empêcher la soumission automatique sur Entrée
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
            }}
        >
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {validationError && (
                <Alert variant="destructive">
                    <AlertDescription>{validationError}</AlertDescription>
                </Alert>
            )}

            {/* Owner info */}
            {item.owner && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.owner.profileImageUrl ? (
                        <img
                            src={item.owner.profileImageUrl}
                            alt={`${item.owner.firstName} ${item.owner.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-600">person</span>
                        </div>
                    )}
                    <div>
                        <p className="font-medium">
                            {item.owner.firstName} {item.owner.lastName}
                        </p>
                        <p className="text-sm text-gray-600">Propriétaire</p>
                    </div>
                </div>
            )}

            {/* Calendrier interactif */}
            <SlotSelector
                availabilities={availabilities}
                onSelectionChange={handleSlotSelectionChange}
                minDuration={1}
                maxDuration={30}
            />

            {/* Message */}
            <div className="space-y-2">
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea
                    id="message"
                    {...register('message')}
                    placeholder="Expliquez pourquoi vous souhaitez emprunter cet objet, comment vous comptez l'utiliser..."
                    rows={4}
                    onKeyDown={(e) => {
                        // Empêcher la soumission sur Entrée dans le textarea
                        if (e.key === 'Enter') {
                            e.stopPropagation();
                            // Permettre le saut de ligne normal dans le textarea
                        }
                    }}
                />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1"
                    >
                        Annuler
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={loading || !selectedStartDate || !selectedEndDate}
                    className="flex-1"
                    onClick={(e) => {
                        setIsSubmittingManually(true);
                        // Le formulaire sera soumis automatiquement grâce au type="submit"
                    }}
                >
                    {loading ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-sm mr-2">
                                refresh
                            </span>
                            Envoi en cours...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm mr-2">
                                send
                            </span>
                            Envoyer la demande
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}