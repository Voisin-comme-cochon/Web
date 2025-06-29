import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmRemoveMemberDialogProps {
    open: boolean;
    memberName: string;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
}

export default function ConfirmRemoveMemberDialog({
    open,
    memberName,
    onConfirm,
    onOpenChange,
}: ConfirmRemoveMemberDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Retirer {memberName} du groupe&nbsp;?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est définitive et supprimera immédiatement ce membre du groupe.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
