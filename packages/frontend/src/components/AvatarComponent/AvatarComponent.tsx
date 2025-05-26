import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { UserModel } from '@/domain/models/user.model.ts';

export default function AvatarComponent({ user }: { user: UserModel | null }) {
    return (
        <Avatar>
            <AvatarImage src={user?.profileImageUrl ?? ''} />
            <AvatarFallback>
                {user?.firstName[0]}.{user?.lastName[0]}
            </AvatarFallback>
        </Avatar>
    );
}
