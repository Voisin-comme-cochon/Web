import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { withNeighborhoodLayout } from '@/containers/Wrapper/NeighborhoodWrapper';
import { UserModel } from '@/domain/models/user.model.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';

function NeighborhoodJournalPage({ user, neighborhoodId, uc }: { user: UserModel; neighborhoodId: string; uc: HomeUc }) {
    return (
        <>
            <DashboardHeader />
            <p>Mon journal</p>
        </>
    );
}

export default withNeighborhoodLayout(NeighborhoodJournalPage);
