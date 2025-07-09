import { UserModel } from '@/domain/models/user.model';
import LoanCard from '@/components/Items/Loans/LoanCard/LoanCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LentItemsTabProps {
    user: UserModel;
    lentItems: any[];
    loading: boolean;
    error: string | null;
    onReturn: (id: number) => void;
    returnLoading: boolean;
}

export default function LentItemsTab({
    user,
    lentItems,
    loading,
    error,
    onReturn,
    returnLoading
}: LentItemsTabProps) {
    return (
        <>
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            ) : lentItems.length > 0 ? (
                <div className="space-y-4">
                    {lentItems.map((loan) => (
                        <LoanCard
                            key={loan.id}
                            loan={loan}
                            currentUserId={user.id}
                            onReturn={onReturn}
                            returnLoading={returnLoading}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-gray-400">handshake</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun objet prêté</h3>
                    <p className="text-gray-600">Vous n'avez actuellement aucun objet en cours de prêt.</p>
                </div>
            )}
        </>
    );
}