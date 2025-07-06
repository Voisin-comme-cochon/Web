import { LoanModel, LoanStatus } from '@/domain/models/loan.model';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLoanStatus } from '@/presentation/hooks/useLoans';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LoanCardProps {
    loan: LoanModel;
    currentUserId: number;
    onReturn?: (id: number) => Promise<void>;
    returnLoading?: boolean;
    showActions?: boolean;
}

export default function LoanCard({
    loan,
    currentUserId,
    onReturn,
    returnLoading = false,
    showActions = true,
}: LoanCardProps) {
    const {
        getStatusLabel,
        getStatusColor,
        canReturnLoan,
        isLoanOverdue,
        getDaysUntilReturn,
        getDaysOverdue,
        formatLoanDuration,
    } = useLoanStatus();

    const { canReturn } = canReturnLoan(loan, currentUserId);
    const isOverdue = isLoanOverdue(loan);
    const daysUntilReturn = getDaysUntilReturn(loan);
    const daysOverdue = getDaysOverdue(loan);
    const isOwner = loan.item?.owner_id === currentUserId;
    const isBorrower = loan.borrower_id === currentUserId;

    const formatDate = (date: Date) => {
        return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
    };

    const getUrgencyInfo = () => {
        if (loan.status !== LoanStatus.ACTIVE) return null;

        if (isOverdue) {
            return {
                type: 'error',
                message: `En retard de ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}`,
                icon: 'warning',
            };
        } else if (daysUntilReturn <= 2) {
            return {
                type: 'warning',
                message:
                    daysUntilReturn === 0
                        ? "À rendre aujourd'hui"
                        : daysUntilReturn === 1
                          ? 'À rendre demain'
                          : `À rendre dans ${daysUntilReturn} jours`,
                icon: 'schedule',
            };
        }

        return null;
    };

    const urgencyInfo = getUrgencyInfo();

    return (
        <Card className={isOverdue ? 'border-red-200 bg-red-50' : ''}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">{loan.item?.name || 'Objet supprimé'}</h3>
                        {loan.item?.category && (
                            <Badge hover={false} variant="secondary" className="text-xs mt-1">
                                {loan.item.category}
                            </Badge>
                        )}
                    </div>
                    <Badge hover={false} className={`${getStatusColor(loan.status)} ml-2`}>
                        {getStatusLabel(loan.status)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Item image */}
                {loan.item?.image_url && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img src={loan.item.image_url} alt={loan.item.name} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* User info */}
                <div className="flex items-center gap-3">
                    {isBorrower ? (
                        loan.owner?.profileImageUrl ? (
                            <img
                                src={loan.owner.profileImageUrl}
                                alt={`${loan.owner.firstName} ${loan.owner.lastName}`}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-sm text-gray-600">person</span>
                            </div>
                        )
                    ) : loan.borrower?.profileImageUrl ? (
                        <img
                            src={loan.borrower.profileImageUrl}
                            alt={`${loan.borrower.firstName} ${loan.borrower.lastName}`}
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
                                ? loan.owner
                                    ? `${loan.owner.firstName} ${loan.owner.lastName}`
                                    : 'Propriétaire inconnu'
                                : loan.borrower
                                  ? `${loan.borrower.firstName} ${loan.borrower.lastName}`
                                  : 'Emprunteur inconnu'}
                        </p>
                        <p className="text-xs text-gray-600">{isBorrower ? 'Propriétaire' : 'Emprunteur'}</p>
                    </div>
                </div>

                {/* Urgency alert */}
                {urgencyInfo && (
                    <Alert variant={urgencyInfo.type === 'error' ? 'destructive' : 'default'}>
                        <span className="material-symbols-outlined text-sm">{urgencyInfo.icon}</span>
                        <AlertDescription>{urgencyInfo.message}</AlertDescription>
                    </Alert>
                )}

                {/* Date range */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-sm text-gray-600">calendar_today</span>
                        <span>
                            Du {formatDate(loan.start_date)} au {formatDate(loan.end_date)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>Durée : {formatLoanDuration(loan)}</span>
                    </div>
                </div>

                {/* Return date */}
                {loan.actual_return_date && (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>Rendu le {formatDate(loan.actual_return_date)}</span>
                    </div>
                )}

                {/* Created date */}
                <div className="text-xs text-gray-500">
                    Prêt créé le {format(new Date(loan.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </div>

                {/* Actions */}
                {showActions && canReturn && loan.status === LoanStatus.ACTIVE && onReturn && (
                    <div className="pt-2 border-t">
                        <Button size="sm" onClick={() => onReturn(loan.id)} disabled={returnLoading} className="w-full">
                            {returnLoading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-sm mr-2">refresh</span>
                                    Marquage en cours...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm mr-2">assignment_return</span>
                                    Marquer comme rendu
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
