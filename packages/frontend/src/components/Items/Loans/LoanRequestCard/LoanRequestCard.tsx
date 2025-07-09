import { LoanRequestModel, LoanRequestStatus } from '@/domain/models/loan-request.model';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLoanRequestStatus } from '@/presentation/hooks/useLoanRequests';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LoanRequestCardProps {
    loanRequest: LoanRequestModel;
    currentUserId: number;
    onAccept?: (id: number) => Promise<void>;
    onReject?: (id: number) => Promise<void>;
    onCancel?: (id: number) => Promise<void>;
    acceptLoading?: boolean;
    rejectLoading?: boolean;
    cancelLoading?: boolean;
    showActions?: boolean;
}

export default function LoanRequestCard({
    loanRequest,
    currentUserId,
    onAccept,
    onReject,
    onCancel,
    acceptLoading = false,
    rejectLoading = false,
    cancelLoading = false,
    showActions = true,
}: LoanRequestCardProps) {
    const { getStatusLabel, getStatusColor, canManageRequest } = useLoanRequestStatus();

    const { canManage, isOwner, isBorrower } = canManageRequest(loanRequest, currentUserId);
    const isPending = loanRequest.status === LoanRequestStatus.PENDING;

    const formatDate = (date: Date) => {
        return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
    };

    const getDurationText = () => {
        const start = new Date(loanRequest.start_date);
        const end = new Date(loanRequest.end_date);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return '1 jour';
        } else if (diffDays < 7) {
            return `${diffDays} jours`;
        } else {
            const weeks = Math.floor(diffDays / 7);
            const remainingDays = diffDays % 7;
            return remainingDays === 0
                ? `${weeks} semaine${weeks > 1 ? 's' : ''}`
                : `${weeks} semaine${weeks > 1 ? 's' : ''} et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">{loanRequest.item?.name || 'Objet supprimé'}</h3>
                        {loanRequest.item?.category && (
                            <Badge hover={false} variant="default" className="text-xs mt-1">
                                {loanRequest.item.category}
                            </Badge>
                        )}
                    </div>
                    <Badge hover={false} className={`${getStatusColor(loanRequest.status)} ml-2`}>
                        {getStatusLabel(loanRequest.status)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Item image */}
                {loanRequest.item?.image_url && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                            src={loanRequest.item.image_url}
                            alt={loanRequest.item.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* User info */}
                <div className="flex items-center gap-3">
                    {loanRequest.borrower?.profileImageUrl ? (
                        <img
                            src={loanRequest.borrower.profileImageUrl}
                            alt={`${loanRequest.borrower.firstName} ${loanRequest.borrower.lastName}`}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm text-gray-600">person</span>
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-sm">
                            {isBorrower
                                ? 'Votre demande'
                                : loanRequest.borrower
                                  ? `${loanRequest.borrower.firstName} ${loanRequest.borrower.lastName}`
                                  : 'Utilisateur inconnu'}
                        </p>
                        <p className="text-xs text-gray-600">{isBorrower ? 'Emprunteur' : 'Demandeur'}</p>
                    </div>
                </div>

                {/* Date range */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-sm text-gray-600">calendar_today</span>
                        <span>
                            Du {formatDate(loanRequest.start_date)} au {formatDate(loanRequest.end_date)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>Durée : {getDurationText()}</span>
                    </div>
                </div>

                {/* Message */}
                {loanRequest.message && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium mb-1">Message :</p>
                        <p className="text-sm text-gray-700">{loanRequest.message}</p>
                    </div>
                )}

                {/* Created date */}
                <div className="text-xs text-gray-500">
                    Demande créée le {format(new Date(loanRequest.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </div>

                {/* Actions */}
                {showActions && canManage && isPending && (
                    <div className="pt-2 border-t">
                        {isOwner && onAccept && onReject ? (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onReject(loanRequest.id)}
                                    disabled={rejectLoading || acceptLoading}
                                    className="flex-1"
                                >
                                    {rejectLoading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-sm mr-2">
                                                refresh
                                            </span>
                                            Rejet...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm mr-2">close</span>
                                            Rejeter
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => onAccept(loanRequest.id)}
                                    disabled={acceptLoading || rejectLoading}
                                    className="flex-1"
                                >
                                    {acceptLoading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-sm mr-2">
                                                refresh
                                            </span>
                                            Acceptation...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm mr-2">check</span>
                                            Accepter
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            isBorrower &&
                            onCancel && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onCancel(loanRequest.id)}
                                    disabled={cancelLoading}
                                    className="w-full"
                                >
                                    {cancelLoading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-sm mr-2">
                                                refresh
                                            </span>
                                            Annulation...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm mr-2">cancel</span>
                                            Annuler la demande
                                        </>
                                    )}
                                </Button>
                            )
                        )}
                    </div>
                )}

                {/* Status info for non-pending requests */}
                {!isPending && (
                    <Alert>
                        <AlertDescription className="text-sm">
                            {loanRequest.status === LoanRequestStatus.ACCEPTED &&
                                'Cette demande a été acceptée. Un prêt a été créé.'}
                            {loanRequest.status === LoanRequestStatus.REJECTED && 'Cette demande a été rejetée.'}
                            {loanRequest.status === LoanRequestStatus.CANCELLED && 'Cette demande a été annulée.'}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
