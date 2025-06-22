import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { FrontNeighborhood } from '@/domain/models/FrontNeighborhood.ts';

export default function NeighborhoodManageInvitationsPage({
    uc,
    neighborhood,
}: {
    uc: HomeUc;
    neighborhood: FrontNeighborhood;
}) {
    return (
        <div>
            <p>Invitations</p>
        </div>
    );
}
