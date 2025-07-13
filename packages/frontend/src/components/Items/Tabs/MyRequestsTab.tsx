import { UserModel } from '@/domain/models/user.model';
import LoanRequestCard from '@/components/Items/Loans/LoanRequestCard/LoanRequestCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MyRequestsTabProps {
    user: UserModel;
    myRequests: any[];
    loading: boolean;
    error: string | null;
    onCancel: (id: number) => void;
    cancelLoading: boolean;
}

export default function MyRequestsTab({
    user,
    myRequests,
    loading,
    error,
    onCancel,
    cancelLoading
}: MyRequestsTabProps) {
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
            ) : myRequests.length > 0 ? (
                <div className="space-y-4">
                    {myRequests.map((request) => (
                        <LoanRequestCard
                            key={request.id}
                            loanRequest={request}
                            currentUserId={user.id}
                            onCancel={onCancel}
                            cancelLoading={cancelLoading}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-gray-400">send</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande envoyée</h3>
                    <p className="text-gray-600">Vous n'avez encore envoyé aucune demande d'emprunt.</p>
                </div>
            )}
        </>
    );
}