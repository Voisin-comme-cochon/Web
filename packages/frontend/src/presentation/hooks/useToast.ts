import { toast } from '@/hooks/use-toast';

export const useToast = () => {
    const showSuccess = (title: string, description?: string) => {
        toast({
            title,
            description,
            duration: 4000,
            className:
                'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
        });
    };

    const showError = (title: string, description?: string) => {
        toast({
            title,
            description,
            duration: 6000,
            variant: 'destructive',
        });
    };

    const showWarning = (title: string, description?: string) => {
        toast({
            title,
            description,
            duration: 5000,
            className:
                'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100',
        });
    };

    const showInfo = (title: string, description?: string) => {
        toast({
            title,
            description,
            duration: 4000,
            className:
                'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
        });
    };

    return { showSuccess, showError, showWarning, showInfo };
};
