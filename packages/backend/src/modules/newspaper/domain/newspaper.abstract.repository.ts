import { Newspaper } from './newspaper.model';

export abstract class NewspaperRepository {
  abstract create(data: Partial<Newspaper>): Promise<Newspaper>;
  abstract findAll(): Promise<Newspaper[]>;
  abstract findOne(id: string): Promise<Newspaper | null>;
  abstract findByUser(userId: string): Promise<Newspaper[]>;
  abstract findByNeighborhood(neighborhoodId: string): Promise<Newspaper[]>;
  abstract update(id: string, data: Partial<Newspaper>): Promise<Newspaper | null>;
  abstract delete(id: string): Promise<Newspaper | null>;
} 