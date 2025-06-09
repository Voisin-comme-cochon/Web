import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { withHeaderData } from '@/containers/Wrapper/Wrapper.tsx';
import { UserModel } from '@/domain/models/user.model.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';

function NeighborhoodJournalPage({ user, uc }: { user: UserModel; uc: HomeUc }) {
    return (
        <>
            <DashboardHeader />
            <p>Mon journal</p>
        </>
    );
}

const NeighborhoodJournalPageWithHeader = withHeaderData(NeighborhoodJournalPage);
export default NeighborhoodJournalPageWithHeader;
