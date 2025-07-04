import { useState, useEffect } from 'react';
import { LoanRequestRepository } from '@/infrastructure/repositories/LoanRequestRepository';
import { LoanRequestsUc } from '@/domain/use-cases/loanRequestsUc';
import { 
    LoanRequestModel, 
    CreateLoanRequestRequest, 
    LoanRequestStatus
} from '@/domain/models/loan-request.model';
import { toast } from '@/hooks/use-toast';

export const useLoanRequests = () => {
    const [myRequests, setMyRequests] = useState<LoanRequestModel[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<LoanRequestModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loanRequestsUc = new LoanRequestsUc(new LoanRequestRepository());

    const fetchMyRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await loanRequestsUc.getMyLoanRequests();
            setMyRequests(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de vos demandes';
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchReceivedRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await loanRequestsUc.getReceivedLoanRequests();
            setReceivedRequests(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des demandes reçues';
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchAllRequests = async () => {
        await Promise.all([fetchMyRequests(), fetchReceivedRequests()]);
    };

    useEffect(() => {
        fetchAllRequests();
    }, []);

    return {
        myRequests,
        receivedRequests,
        loading,
        error,
        refetchMyRequests: fetchMyRequests,
        refetchReceivedRequests: fetchReceivedRequests,
        refetchAll: fetchAllRequests
    };
};

export const useLoanRequest = (id?: number) => {
    const [loanRequest, setLoanRequest] = useState<LoanRequestModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loanRequestsUc = new LoanRequestsUc(new LoanRequestRepository());

    const fetchLoanRequest = async (requestId: number) => {
        setLoading(true);
        setError(null);
        try {
            const result = await loanRequestsUc.getLoanRequestById(requestId);
            setLoanRequest(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de la demande';
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchLoanRequest(id);
        }
    }, [id]);

    const refetch = () => {
        if (id) {
            fetchLoanRequest(id);
        }
    };

    return {
        loanRequest,
        loading,
        error,
        refetch
    };
};

export const useCreateLoanRequest = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loanRequestsUc = new LoanRequestsUc(new LoanRequestRepository());

    const createLoanRequest = async (request: CreateLoanRequestRequest): Promise<LoanRequestModel | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await loanRequestsUc.createLoanRequest(request);
            toast({
                title: 'Succès',
                description: 'Demande d\'emprunt envoyée avec succès'
            });
            return result;
        } catch (err: any) {
            // Extraire le message d'erreur du backend
            let errorMessage = 'Erreur lors de l\'envoi de la demande';
            
            if (err?.response?.data?.message) {
                // Message personnalisé du backend
                const backendMessage = err.response.data.message;
                switch (err.response.data.code) {
                    case 'item_not_available':
                        errorMessage = 'Cet objet n\'est pas disponible pour les dates demandées. Veuillez vérifier les disponibilités et choisir d\'autres dates.';
                        break;
                    case 'invalid_dates':
                        errorMessage = 'Les dates sélectionnées ne sont pas valides. La date de fin doit être postérieure à la date de début.';
                        break;
                    case 'item_not_found':
                        errorMessage = 'L\'objet demandé n\'existe plus.';
                        break;
                    case 'forbidden':
                        errorMessage = 'Vous ne pouvez pas emprunter votre propre objet.';
                        break;
                    default:
                        errorMessage = backendMessage || errorMessage;
                }
            } else if (err?.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive'
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        createLoanRequest,
        loading,
        error
    };
};

export const useLoanRequestActions = () => {
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loanRequestsUc = new LoanRequestsUc(new LoanRequestRepository());

    const acceptLoanRequest = async (id: number, currentUserId: number): Promise<boolean> => {
        setAcceptLoading(true);
        setError(null);
        try {
            await loanRequestsUc.acceptLoanRequest(id, currentUserId);
            toast({
                title: 'Succès',
                description: 'Demande d\'emprunt acceptée'
            });
            return true;
        } catch (err: any) {
            let errorMessage = 'Erreur lors de l\'acceptation de la demande';
            
            if (err?.response?.data?.message) {
                const backendMessage = err.response.data.message;
                switch (err.response.data.code) {
                    case 'loan_request_not_found':
                        errorMessage = 'La demande d\'emprunt n\'existe plus.';
                        break;
                    case 'forbidden':
                        errorMessage = 'Vous n\'avez pas l\'autorisation d\'accepter cette demande.';
                        break;
                    case 'invalid_status':
                        errorMessage = 'Cette demande ne peut plus être acceptée.';
                        break;
                    default:
                        errorMessage = backendMessage || errorMessage;
                }
            } else if (err?.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive'
            });
            return false;
        } finally {
            setAcceptLoading(false);
        }
    };

    const rejectLoanRequest = async (id: number, currentUserId: number): Promise<boolean> => {
        setRejectLoading(true);
        setError(null);
        try {
            await loanRequestsUc.rejectLoanRequest(id, currentUserId);
            toast({
                title: 'Demande rejetée',
                description: 'La demande d\'emprunt a été rejetée'
            });
            return true;
        } catch (err: any) {
            let errorMessage = 'Erreur lors du rejet de la demande';
            
            if (err?.response?.data?.message) {
                const backendMessage = err.response.data.message;
                switch (err.response.data.code) {
                    case 'loan_request_not_found':
                        errorMessage = 'La demande d\'emprunt n\'existe plus.';
                        break;
                    case 'forbidden':
                        errorMessage = 'Vous n\'avez pas l\'autorisation de rejeter cette demande.';
                        break;
                    case 'invalid_status':
                        errorMessage = 'Cette demande ne peut plus être rejetée.';
                        break;
                    default:
                        errorMessage = backendMessage || errorMessage;
                }
            } else if (err?.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive'
            });
            return false;
        } finally {
            setRejectLoading(false);
        }
    };

    const cancelLoanRequest = async (id: number, currentUserId: number): Promise<boolean> => {
        setCancelLoading(true);
        setError(null);
        try {
            await loanRequestsUc.cancelLoanRequest(id, currentUserId);
            toast({
                title: 'Demande annulée',
                description: 'Votre demande d\'emprunt a été annulée'
            });
            return true;
        } catch (err: any) {
            let errorMessage = 'Erreur lors de l\'annulation de la demande';
            
            if (err?.response?.data?.message) {
                const backendMessage = err.response.data.message;
                switch (err.response.data.code) {
                    case 'loan_request_not_found':
                        errorMessage = 'La demande d\'emprunt n\'existe plus.';
                        break;
                    case 'forbidden':
                        errorMessage = 'Vous n\'avez pas l\'autorisation d\'annuler cette demande.';
                        break;
                    case 'invalid_status':
                        errorMessage = 'Cette demande ne peut plus être annulée.';
                        break;
                    default:
                        errorMessage = backendMessage || errorMessage;
                }
            } else if (err?.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive'
            });
            return false;
        } finally {
            setCancelLoading(false);
        }
    };

    return {
        acceptLoanRequest,
        rejectLoanRequest,
        cancelLoanRequest,
        acceptLoading,
        rejectLoading,
        cancelLoading,
        error
    };
};

export const useLoanRequestStatus = () => {
    const loanRequestsUc = new LoanRequestsUc(new LoanRequestRepository());

    const getStatusLabel = (status: LoanRequestStatus): string => {
        return loanRequestsUc.getLoanRequestStatusLabel(status);
    };

    const getStatusColor = (status: LoanRequestStatus): string => {
        return loanRequestsUc.getLoanRequestStatusColor(status);
    };

    const canManageRequest = (loanRequest: LoanRequestModel, currentUserId: number) => {
        return loanRequestsUc.canManageLoanRequest(loanRequest, currentUserId);
    };

    return {
        getStatusLabel,
        getStatusColor,
        canManageRequest
    };
};