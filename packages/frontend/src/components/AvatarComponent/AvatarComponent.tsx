import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { UserModel } from '@/domain/models/user.model.ts';

export default function AvatarComponent({ user, className }: { user: UserModel | null; className?: string }) {
    return (
        <Avatar>
            <AvatarImage src={user?.profileImageUrl ?? ''} className={`${className} object-cover`} />
            <AvatarFallback className={`${className}`}>
                {user?.firstName[0]}.{user?.lastName[0]}
            </AvatarFallback>
        </Avatar>
    );
}
