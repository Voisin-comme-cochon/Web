import { useState } from 'react';
import { z } from 'zod';

const emailSchema = z.string().email('Email invalide');

export function useInviteList() {
    const [emails, setEmails] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const addEmail = () => {
        const result = emailSchema.safeParse(input);
        if (!result.success) {
            setError(result.error.errors[0].message);
            return;
        }
        if (emails.includes(input)) {
            setError('Cet email est déjà ajouté.');
            return;
        }
        setEmails([...emails, input]);
        setInput('');
        setError(null);
    };

    const removeEmail = (email: string) => {
        setEmails(emails.filter((e) => e !== email));
    };

    return {
        emails,
        input,
        setInput,
        addEmail,
        removeEmail,
        error,
    };
}
