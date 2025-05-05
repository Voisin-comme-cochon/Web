import { usePassword } from "@/presentation/hooks/usePassword.ts";
import { Input } from "@/components/ui/input.tsx";

type PasswordInputProps = {
    value: string
    onChangeCallback: (value: string) => void
    disabled?: boolean
}

export default function PasswordInput({ value, onChangeCallback, disabled }: PasswordInputProps) {
    const {
        showPassword,
        toggleShowPassword,
    } = usePassword();

    return (
        <div className="relative">
            <Input
                id="password"
                type={ showPassword ? "text" : "password" }
                placeholder="••••••••"
                value={ value }
                disabled={ disabled }
                onChange={ (e) => onChangeCallback(e.target.value) }
                className="pr-10"
            />
            <span
                onClick={ () => toggleShowPassword() }
                className="absolute right-3 top-1/4 cursor-pointer text-gray-600"
            >
                { showPassword ? (
                    <span className="material-symbols-outlined text-s">visibility</span>
                ) : (
                    <span className="material-symbols-outlined text-s">visibility_off</span>
                ) }
            </span>
        </div>
    );
}
