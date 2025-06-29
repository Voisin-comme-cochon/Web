import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';

export default function NeighborhoodManagePhotosPage({
    uc,
    neighborhood,
}: {
    uc: HomeUc;
    neighborhood: FrontNeighborhood;
}) {
    return (
        <div>
            <p>Photos</p>
        </div>
    );
}
