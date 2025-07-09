import { UserModel } from '@/domain/models/user.model';
import LoanRequestCard from '@/components/Items/Loans/LoanRequestCard/LoanRequestCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReceivedRequestsTabProps {
    user: UserModel;
    receivedRequests: any[];
    loading: boolean;
    error: string | null;
    onAccept: (id: number) => void;
    onReject: (id: number) => void;
    acceptLoading: boolean;
    rejectLoading: boolean;
}

export default function ReceivedRequestsTab({
    user,
    receivedRequests,
    loading,
    error,
    onAccept,
    onReject,
    acceptLoading,
    rejectLoading
}: ReceivedRequestsTabProps) {
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
            ) : receivedRequests.length > 0 ? (
                <div className="space-y-4">
                    {receivedRequests.map((request) => (
                        <LoanRequestCard
                            key={request.id}
                            loanRequest={request}
                            currentUserId={user.id}
                            onAccept={onAccept}
                            onReject={onReject}
                            acceptLoading={acceptLoading}
                            rejectLoading={rejectLoading}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-gray-400">inbox</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande reçue</h3>
                    <p className="text-gray-600">Vous n'avez reçu aucune demande pour vos objets.</p>
                </div>
            )}
        </>
    );
}