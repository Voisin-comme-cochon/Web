import { ItemModel, ItemAvailabilityStatus } from '@/domain/models/item.model';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppNavigation } from '@/presentation/state/navigate';

interface ItemCardProps {
    item: ItemModel;
    currentUserId?: number;
    onItemClick?: (item: ItemModel) => void;
}

export default function ItemCard({ item, currentUserId, onItemClick }: ItemCardProps) {
    const { goItemDetails } = useAppNavigation();

    const getItemStatus = () => {
        if (!item.availabilities || item.availabilities.length === 0) {
            return { status: 'Pas de disponibilité', color: 'bg-gray-100 text-gray-800' };
        }

        const now = new Date();
        const activeAvailabilities = item.availabilities.filter((a) => a.start_date <= now && a.end_date >= now);

        if (activeAvailabilities.length === 0) {
            return { status: 'Non disponible', color: 'bg-red-100 text-red-800' };
        }

        const availableCount = activeAvailabilities.filter((a) => a.status === ItemAvailabilityStatus.AVAILABLE).length;

        if (availableCount === activeAvailabilities.length) {
            return { status: 'Disponible', color: 'bg-green-100 text-green-800' };
        } else if (availableCount > 0) {
            return { status: 'Partiellement disponible', color: 'bg-yellow-100 text-yellow-800' };
        } else {
            return { status: 'Occupé', color: 'bg-orange-100 text-orange-800' };
        }
    };

    const handleClick = () => {
        if (onItemClick) {
            onItemClick(item);
        } else {
            goItemDetails(item.id);
        }
    };

    const { status, color } = getItemStatus();
    const isOwner = currentUserId === item.owner_id;

    return (
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={handleClick}>
            <CardContent className="p-4">
                <div className="aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-gray-400">inventory_2</span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
                        {isOwner && (
                            <Badge hover={false} variant="outline" className="text-xs">
                                Votre objet
                            </Badge>
                        )}
                    </div>

                    {item.description && <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>}

                    {item.category && (
                        <Badge hover={false} variant="secondary" className="text-xs">
                            {item.category}
                        </Badge>
                    )}

                    <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${color}`} hover={false}>
                            {status}
                        </Badge>

                        {item.owner && (
                            <div className="flex items-center gap-2">
                                {item.owner.profileImageUrl ? (
                                    <img
                                        src={item.owner.profileImageUrl}
                                        alt={`${item.owner.firstName} ${item.owner.lastName}`}
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm text-gray-600">person</span>
                                    </div>
                                )}
                                <span className="text-xs text-gray-600">
                                    {item.owner.firstName} {item.owner.lastName.charAt(0)}.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    variant={isOwner ? 'outline' : 'default'}
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClick();
                    }}
                >
                    {isOwner ? (
                        <>
                            <span className="material-symbols-outlined text-sm mr-2">edit</span>
                            Gérer
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm mr-2">visibility</span>
                            Voir détails
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
