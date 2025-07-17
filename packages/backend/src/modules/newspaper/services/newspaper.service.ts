import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newspaper } from '../domain/newspaper.model';
import { CochonError } from '../../../utils/CochonError';

@Injectable()
export class NewspaperService {
  constructor(@InjectModel(Newspaper.name) private newspaperModel: Model<Newspaper>) {}

  async create(userId: string, neighborhoodId: string, content: any) {
    try {
      return await this.newspaperModel.create({ userId, neighborhoodId, content });
    } catch (error) {
      throw new CochonError('NEWSPAPER_CREATE_ERROR', 'Erreur lors de la création du journal.', 500, { error });
    }
  }

  async findAll() {
    try {
      return await this.newspaperModel.find();
    } catch (error) {
      throw new CochonError('NEWSPAPER_FINDALL_ERROR', 'Erreur lors de la récupération des journaux.', 500, { error });
    }
  }

  async findOne(id: string) {
    const newspaper = await this.newspaperModel.findById(id);
    if (!newspaper) {
      throw new CochonError('NEWSPAPER_NOT_FOUND', 'Journal non trouvé.', 404, { id });
    }
    return newspaper;
  }

  async findByUser(userId: string) {
    try {
      return await this.newspaperModel.find({ userId });
    } catch (error) {
      throw new CochonError('NEWSPAPER_FIND_BY_USER_ERROR', 'Erreur lors de la récupération des journaux par utilisateur.', 500, { userId, error });
    }
  }

  async findByNeighborhood(neighborhoodId: string) {
    try {
      return await this.newspaperModel.find({ neighborhoodId });
    } catch (error) {
      throw new CochonError('NEWSPAPER_FIND_BY_NEIGHBORHOOD_ERROR', 'Erreur lors de la récupération des journaux par quartier.', 500, { neighborhoodId, error });
    }
  }

  async update(id: string, content: any) {
    const updated = await this.newspaperModel.findByIdAndUpdate(id, { content }, { new: true });
    if (!updated) {
      throw new CochonError('NEWSPAPER_UPDATE_NOT_FOUND', 'Journal à mettre à jour non trouvé.', 404, { id });
    }
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.newspaperModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new CochonError('NEWSPAPER_DELETE_NOT_FOUND', 'Journal à supprimer non trouvé.', 404, { id });
    }
    return deleted;
  }
} 