import { DataSource } from 'typeorm';
import { NeighborhoodUserRepository } from '../domain/neighborhood-user.abstract.repository';

export class NeighborhoodUserRepositoryImplementation implements NeighborhoodUserRepository {
    constructor(private readonly dataSource: DataSource) {}
}
