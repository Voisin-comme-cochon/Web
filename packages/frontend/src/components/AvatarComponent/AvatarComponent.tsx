import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { UserModel } from '@/domain/models/user.model.ts';

export default function AvatarComponent({ user, className }: { user: UserModel | null; className?: string }) {
    return (
        <Avatar className={className}>
            <AvatarImage src={user?.profileImageUrl ?? ''} className="object-cover" />
            <AvatarFallback>
                {user?.firstName[0]}.{user?.lastName[0]}
            </AvatarFallback>
        </Avatar>
    );
}
