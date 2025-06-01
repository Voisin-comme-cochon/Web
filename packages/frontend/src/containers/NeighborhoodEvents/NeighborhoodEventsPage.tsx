import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { UserModel } from '@/domain/models/user.model.ts';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { withHeaderData } from '@/containers/Wrapper/Wrapper.tsx';

function NeighborhoodEventsPage({ user, uc }: { user: UserModel; uc: HomeUc }) {
    return (
        <>
            <DashboardHeader />
            <p>Mes évènements</p>
        </>
    );
}

const NeighborhoodEventsPageWithHeader = withHeaderData(NeighborhoodEventsPage);
export default NeighborhoodEventsPageWithHeader;
