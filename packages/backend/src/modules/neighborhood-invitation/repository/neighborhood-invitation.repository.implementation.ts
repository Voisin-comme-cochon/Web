import { DataSource } from 'typeorm';
import { NeighborhoodInvitationRepository } from '../domain/neighborhood-invitation.abstract.repository';

export class NeighborhoodInvitationRepositoryImplementation implements NeighborhoodInvitationRepository {
    constructor(private readonly dataSource: DataSource) {}
}
