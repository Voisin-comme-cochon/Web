import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newspaper } from '../domain/newspaper.model';
import { NewspaperRepository } from '../domain/newspaper.abstract.repository';
import { NewspaperAdapter } from '../adapters/newspaper.adapter';

@Injectable()
export class NewspaperRepositoryImplementation implements NewspaperRepository {
  constructor(
    @InjectModel(Newspaper.name) private newspaperModel: Model<Newspaper>,
  ) {}

  async create(data: Partial<Newspaper>): Promise<Newspaper> {
    const created = await this.newspaperModel.create(data);
    return NewspaperAdapter.databaseToDomain(created);
  }

  async findAll(): Promise<Newspaper[]> {
    const found = await this.newspaperModel.find();
    return NewspaperAdapter.listDatabaseToDomain(found);
  }

  async findOne(id: string): Promise<Newspaper | null> {
    const found = await this.newspaperModel.findById(id);
    return found ? NewspaperAdapter.databaseToDomain(found) : null;
  }

  async findByUser(userId: string): Promise<Newspaper[]> {
    const found = await this.newspaperModel.find({ userId });
    return NewspaperAdapter.listDatabaseToDomain(found);
  }

  async findByNeighborhood(neighborhoodId: string): Promise<Newspaper[]> {
    const found = await this.newspaperModel.find({ neighborhoodId });
    return NewspaperAdapter.listDatabaseToDomain(found);
  }

  async update(id: string, data: Partial<Newspaper>): Promise<Newspaper | null> {
    const updated = await this.newspaperModel.findByIdAndUpdate(id, data, { new: true });
    return updated ? NewspaperAdapter.databaseToDomain(updated) : null;
  }

  async delete(id: string): Promise<Newspaper | null> {
    const deleted = await this.newspaperModel.findByIdAndDelete(id);
    return deleted ? NewspaperAdapter.databaseToDomain(deleted) : null;
  }
} 