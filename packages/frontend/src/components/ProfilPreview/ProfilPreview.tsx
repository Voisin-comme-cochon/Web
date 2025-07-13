import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompleteUserModel } from '@/domain/models/complete-user.model.ts';

interface ProfilPreviewProps {
    user: CompleteUserModel;
}

const ProfilPreview: React.FC<ProfilPreviewProps> = ({ user }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
        {user.profileImageUrl ? (
            <img
                src={user.profileImageUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-48 object-cover rounded-t-lg"
            />
        ) : (
            <div className="w-full h-48 object-cover rounded-t-lg bg-gray-200 flex items-center justify-center">
                <span className={'material-symbols-outlined'}>no_photography</span>
            </div>
        )}
        <CardHeader className="flex flex-col items-start p-4">
            <CardTitle className="text-lg font-semibold">
                {user.firstName} {user.lastName}
            </CardTitle>
            {user.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {user.tags.map((tag) => (
                        <span
                            key={tag.id}
                            className="text-xs px-2 py-1 rounded"
                            style={{ backgroundColor: tag.color || '#ddd', color: '#fff' }}
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            )}
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
            <p className="text-sm text-muted-foreground line-clamp-1">{user.description}</p>
        </CardContent>
    </Card>
);

export default ProfilPreview;
