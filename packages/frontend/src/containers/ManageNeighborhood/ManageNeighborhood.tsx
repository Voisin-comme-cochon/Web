import { withHeaderData } from '@/containers/Wrapper/Wrapper.tsx';

function ManageNeighborhood() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold mb-4">Manage Neighborhood</h1>
            <p className="text-gray-600">This feature is under development.</p>
        </div>
    );
}

export default withHeaderData(ManageNeighborhood);
