import {usePassword} from "@/presentation/hooks/usePassword.ts";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";

type PasswordInputProps = {
    value: string
    onChangeCallback: (value: string) => void
}

export default function PasswordInput({value, onChangeCallback}: PasswordInputProps) {
    const {
        showPassword,
        toggleShowPassword,
    } = usePassword();

    return (
        <div className="relative">
            <Label htmlFor="password" className={"font-bold"}>Mot de passe</Label>
            <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={value}
                onChange={(e) => onChangeCallback(e.target.value)}
                className="pr-10"
            />
            <span
                onClick={() => toggleShowPassword()}
                className="absolute right-3 top-1/2 cursor-pointer text-gray-600"
            >
                {showPassword ? (
                    <span className="material-symbols-outlined text-s">visibility</span>
                ) : (
                    <span className="material-symbols-outlined text-s">visibility_off</span>
                )}
            </span>
        </div>
    );
}
