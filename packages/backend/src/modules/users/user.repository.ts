
export class UserRepository {
    public getById(userId: number) {
        return {
            id: userId,
            fullName: 'John Doe',
        };
    }
}
