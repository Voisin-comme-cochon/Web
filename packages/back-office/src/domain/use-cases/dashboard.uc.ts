export class DashboardUseCase {
    constructor() {
    }

    public async getDashboardData(): Promise<any> {
        const response = await fetch(`${import.meta.env.VITE_VCC_API_URL}/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
        });

        if (!response.ok) throw new Error('Failed to fetch dashboard data');

        return await response.json();
    }
}