import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface InviteFormProps {
    input: string;
    setInput: (val: string) => void;
    addEmail: () => void;
    error?: string | null;
}

export function InviteForm({ input, setInput, addEmail, error }: InviteFormProps) {
    return (
        <div className="flex items-center gap-2 mb-2">
            <Input
                type="email"
                placeholder="mail@mail.com"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
            />
            <Button type="button" onClick={addEmail} variant="orange">
                +
            </Button>
            {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
        </div>
    );
}
