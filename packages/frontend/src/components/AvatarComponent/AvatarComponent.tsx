import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { User } from 'lucide-react';
import { userCache } from '@/utils/userCache';

interface AvatarComponentProps {
    userId?: number;
    image?: string;
    className?: string;
}

export default function AvatarComponent({ userId, image, className }: AvatarComponentProps) {
    // Priorité : image fournie > cache > fallback
    let finalImage = image;
    
    if (!finalImage && userId) {
        const cachedUser = userCache.get(userId);
        finalImage = cachedUser?.profileImageUrl;
    }
    
    return (
        <Avatar className={className}>
            <AvatarImage src={finalImage ?? ''} className="object-cover" />
            <AvatarFallback>
                <User className="w-6 h-6" />
            </AvatarFallback>
        </Avatar>
    );
}
