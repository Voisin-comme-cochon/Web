import { Button } from '@/components/ui/button.tsx';
import { X, User } from 'lucide-react';

interface InviteListProps {
    emails: string[];
    removeEmail: (email: string) => void;
}

export function InviteList({ emails, removeEmail }: InviteListProps) {
    if (emails.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune invitation ajoutée pour le moment</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="text-sm text-gray-600 mb-3">
                {emails.length} invitation{emails.length > 1 ? 's' : ''} en attente
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {emails.map((email, index) => (
                    <div
                        key={email}
                        className="group flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 animate-in slide-in-from-left-2"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-orange-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEmail(email)}
                            className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
