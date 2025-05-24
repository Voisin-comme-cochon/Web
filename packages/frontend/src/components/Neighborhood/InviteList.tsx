import { Button } from '@/components/ui/button';

interface InviteListProps {
    emails: string[];
    removeEmail: (email: string) => void;
}

export function InviteList({ emails, removeEmail }: InviteListProps) {
    return (
        <div className="space-y-2 mb-4">
            {emails.map((email) => (
                <div key={email} className="flex items-center gap-2">
                    <input type="text" value={email} readOnly className="flex-1 border rounded px-2 py-1 bg-gray-50" />
                    <Button type="button" variant="orange" onClick={() => removeEmail(email)}>
                        🗑️
                    </Button>
                </div>
            ))}
        </div>
    );
}
