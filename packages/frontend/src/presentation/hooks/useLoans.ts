import { useState, useEffect } from 'react';
import { LoanRepository } from '@/infrastructure/repositories/LoanRepository';
import { LoansUc } from '@/domain/use-cases/loansUc';
import { 
    LoanModel, 
    LoanStatus
} from '@/domain/models/loan.model';
import { toast } from '@/hooks/use-toast';

export const useLoans = () => {
    const [myLoans, setMyLoans] = useState<LoanModel[]>([]);
    const [lentItems, setLentItems] = useState<LoanModel[]>([]);
    const [overdueLoans, setOverdueLoans] = useState<LoanModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loansUc = new LoansUc(new LoanRepository());

    const fetchMyLoans = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await loansUc.getMyLoans();
            setMyLoans(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de vos emprunts';
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

    const fetchLentItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await loansUc.getLentItems();
            setLentItems(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de vos objets prêtés';
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

    const fetchOverdueLoans = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await loansUc.getOverdueLoans();
            setOverdueLoans(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des prêts en retard';
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

    const fetchAllLoans = async () => {
        await Promise.all([fetchMyLoans(), fetchLentItems(), fetchOverdueLoans()]);
    };

    useEffect(() => {
        fetchAllLoans();
    }, []);

    return {
        myLoans,
        lentItems,
        overdueLoans,
        loading,
        error,
        refetchMyLoans: fetchMyLoans,
        refetchLentItems: fetchLentItems,
        refetchOverdueLoans: fetchOverdueLoans,
        refetchAll: fetchAllLoans
    };
};

export const useLoan = (id?: number) => {
    const [loan, setLoan] = useState<LoanModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loansUc = new LoansUc(new LoanRepository());

    const fetchLoan = async (loanId: number) => {
        setLoading(true);
        setError(null);
        try {
            const result = await loansUc.getLoanById(loanId);
            setLoan(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du prêt';
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
            fetchLoan(id);
        }
    }, [id]);

    const refetch = () => {
        if (id) {
            fetchLoan(id);
        }
    };

    return {
        loan,
        loading,
        error,
        refetch
    };
};

export const useReturnLoan = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loansUc = new LoansUc(new LoanRepository());

    const returnLoan = async (id: number, currentUserId: number, returnDate?: Date): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await loansUc.returnLoan(id, currentUserId, returnDate);
            toast({
                title: 'Succès',
                description: 'Prêt marqué comme rendu avec succès'
            });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du retour du prêt';
            setError(errorMessage);
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive'
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        returnLoan,
        loading,
        error
    };
};

export const useLoanStatus = () => {
    const loansUc = new LoansUc(new LoanRepository());

    const getStatusLabel = (status: LoanStatus): string => {
        return loansUc.getLoanStatusLabel(status);
    };

    const getStatusColor = (status: LoanStatus): string => {
        return loansUc.getLoanStatusColor(status);
    };

    const canManageLoan = (loan: LoanModel, currentUserId: number) => {
        return loansUc.canManageLoan(loan, currentUserId);
    };

    const canReturnLoan = (loan: LoanModel, currentUserId: number) => {
        return loansUc.canReturnLoan(loan, currentUserId);
    };

    const isLoanOverdue = (loan: LoanModel): boolean => {
        return loansUc.isLoanOverdue(loan);
    };

    const getDaysUntilReturn = (loan: LoanModel): number => {
        return loansUc.getDaysUntilReturn(loan);
    };

    const getDaysOverdue = (loan: LoanModel): number => {
        return loansUc.getDaysOverdue(loan);
    };

    const formatLoanDuration = (loan: LoanModel): string => {
        return loansUc.formatLoanDuration(loan);
    };

    return {
        getStatusLabel,
        getStatusColor,
        canManageLoan,
        canReturnLoan,
        isLoanOverdue,
        getDaysUntilReturn,
        getDaysOverdue,
        formatLoanDuration
    };
};