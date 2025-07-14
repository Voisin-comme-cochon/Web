import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { withHeaderData } from '@/containers/Wrapper/Wrapper.tsx';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { useParams } from 'react-router-dom';
import { CompleteUserModel } from '@/domain/models/complete-user.model.ts';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

function ProfilPage({ uc }: { uc: HomeUc }) {
    const [user, setUser] = useState<CompleteUserModel | null>(null);
    const { userId } = useParams<{ userId: string }>();

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const response = await uc.getCompleteUserById(userId);
                setUser(response);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'utilisateur :", error);
            }
        };

        fetchUser();
    }, [userId, uc]);

    if (!userId) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card>
                    <CardContent>
                        <CardDescription className="text-red-600">Aucun utilisateur trouvé.</CardDescription>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card className={'h-16 flex items-center justify-center'}>
                    <CardContent>
                        <CardDescription>Chargement...</CardDescription>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            <DashboardHeader />
            <div className="container mx-auto py-10">
                <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <Avatar className="w-24 h-24">
                            {user.profileImageUrl ? (
                                <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                            ) : (
                                <AvatarFallback>
                                    {user.firstName.charAt(0)}
                                    {user.lastName.charAt(0)}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <CardTitle className="mt-4 text-3xl">
                            {user.firstName} {user.lastName}
                        </CardTitle>
                        <CardDescription>Profil n° {user.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">Contact</h3>
                            <p>Téléphone: {user.phone}</p>
                            <p>Email: {user.email}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">Adresse</h3>
                            <p>{user.address}</p>
                        </div>
                        {user.description && (
                            <div>
                                <h3 className="text-lg font-medium">À propos</h3>
                                <p>{user.description}</p>
                            </div>
                        )}
                        {user.tags.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium">Tags</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {user.tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="secondary"
                                            className="px-4 py-1"
                                            style={{ backgroundColor: tag.color, color: '#ffffff' }}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default withHeaderData(ProfilPage);
