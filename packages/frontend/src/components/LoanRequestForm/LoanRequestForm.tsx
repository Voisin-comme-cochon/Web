import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateLoanRequestRequest } from '@/domain/models/loan-request.model';
import { ItemModel } from '@/domain/models/item.model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<{
        start_date: string;
        end_date: string;
        message?: string;
    }>();

    const startDate = watch('start_date');
    const endDate = watch('end_date');

    const validateDates = () => {
        if (!startDate || !endDate) return true;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (start < now) {
            return 'La date de début ne peut pas être dans le passé';
        }

        if (end <= start) {
            return 'La date de fin doit être postérieure à la date de début';
        }

        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 30) {
            return 'La durée d\'emprunt ne peut pas dépasser 30 jours';
        }

        return true;
    };

    const getDurationText = () => {
        if (!startDate || !endDate) return '';
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '1 jour';
        } else if (diffDays < 7) {
            return `${diffDays} jours`;
        } else {
            const weeks = Math.floor(diffDays / 7);
            const remainingDays = diffDays % 7;
            return remainingDays === 0 ? 
                `${weeks} semaine${weeks > 1 ? 's' : ''}` : 
                `${weeks} semaine${weeks > 1 ? 's' : ''} et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
        }
    };

    const handleFormSubmit = async (data: { start_date: string; end_date: string; message?: string }) => {
        const dateValidation = validateDates();
        if (dateValidation !== true) {
            return;
        }

        const submitData: CreateLoanRequestRequest = {
            item_id: item.id,
            start_date: new Date(data.start_date),
            end_date: new Date(data.end_date),
            message: data.message
        };

        await onSubmit(submitData);
    };

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getMinEndDate = () => {
        if (!startDate) return getTomorrowDate();
        const start = new Date(startDate);
        start.setDate(start.getDate() + 1);
        return start.toISOString().split('T')[0];
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="material-symbols-outlined">calendar_today</span>
                    Demander à emprunter : {item.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
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

                    {/* Date range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Date de début *</Label>
                            <Input
                                id="start_date"
                                type="date"
                                min={getTomorrowDate()}
                                {...register('start_date', {
                                    required: 'La date de début est requise'
                                })}
                            />
                            {errors.start_date && (
                                <p className="text-sm text-red-600">{errors.start_date.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_date">Date de fin *</Label>
                            <Input
                                id="end_date"
                                type="date"
                                min={getMinEndDate()}
                                {...register('end_date', {
                                    required: 'La date de fin est requise',
                                    validate: validateDates
                                })}
                            />
                            {errors.end_date && (
                                <p className="text-sm text-red-600">
                                    {typeof errors.end_date.message === 'string' 
                                        ? errors.end_date.message 
                                        : 'Date de fin invalide'
                                    }
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Duration display */}
                    {getDurationText() && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <span className="material-symbols-outlined text-sm mr-1">schedule</span>
                                Durée : {getDurationText()}
                            </p>
                        </div>
                    )}

                    {/* Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Message (optionnel)</Label>
                        <Textarea
                            id="message"
                            {...register('message')}
                            placeholder="Expliquez pourquoi vous souhaitez emprunter cet objet, comment vous comptez l'utiliser..."
                            rows={4}
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
                            disabled={loading}
                            className="flex-1"
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
            </CardContent>
        </Card>
    );
}