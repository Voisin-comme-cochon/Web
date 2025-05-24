import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Mail } from 'lucide-react';

interface InviteFormProps {
    input: string;
    setInput: (val: string) => void;
    addEmail: () => void;
    error?: string | null;
}

export function InviteForm({ input, setInput, addEmail, error }: InviteFormProps) {
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEmail();
        }
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                    type="email"
                    placeholder="Entrez une adresse email"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`pl-10 pr-12 h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 ${
                        error ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'
                    }`}
                />
                <Button
                    type="button"
                    onClick={addEmail}
                    variant="orange"
                    size="sm"
                    className="absolute inset-y-0 right-0 m-1 px-3 rounded-md hover:scale-105 transition-transform duration-150"
                    disabled={!input.trim()}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
                    <div className="w-1 h-4 bg-red-500 rounded-full" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
