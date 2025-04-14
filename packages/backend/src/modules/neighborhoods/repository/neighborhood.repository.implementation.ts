import { DataSource } from 'typeorm';
import { NeighborhoodRepository } from '../domain/neighborhood.abstract.repository';

export class NeighborhoodRepositoryImplementation implements NeighborhoodRepository {
    constructor(private readonly dataSource: DataSource) {}
}
