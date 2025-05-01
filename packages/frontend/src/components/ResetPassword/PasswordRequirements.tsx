import { Check, X } from 'lucide-react';

type PasswordRequirementsProps = {
    hasMinLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
};

export default function PasswordRequirements({
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
}: PasswordRequirementsProps) {
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Exigences du mot de passe :</p>
            <ul className="space-y-1 text-sm">
                <RequirementItem fulfilled={hasMinLength} text="Au moins 8 caractères" />
                <RequirementItem fulfilled={hasUpperCase} text="Au moins une majuscule" />
                <RequirementItem fulfilled={hasLowerCase} text="Au moins une minuscule" />
                <RequirementItem fulfilled={hasNumber} text="Au moins un chiffre" />
            </ul>
        </div>
    );
}

function RequirementItem({ fulfilled, text }: { fulfilled: boolean; text: string }) {
    return (
        <li className="flex items-center">
            {fulfilled ? (
                <Check className="h-4 w-4 text-green-500 mr-2" />
            ) : (
                <X className="h-4 w-4 text-primary/40 mr-2" />
            )}
            <span className={fulfilled ? 'text-green-700' : 'text-primary/60'}>{text}</span>
        </li>
    );
}
