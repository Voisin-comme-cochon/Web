import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newspaper } from '../domain/newspaper.model';
import { CochonError } from '../../../utils/CochonError';
import { ObjectStorageService } from '../../objectStorage/services/objectStorage.service';
import { UsersService } from '../../users/services/users.service';
import { NeighborhoodService } from '../../neighborhoods/services/neighborhood.service';
import { TagsService } from '../../tags/services/tags.service';
import { BucketType } from '../../objectStorage/domain/bucket-type.enum';
import { NewspaperRepository } from '../domain/newspaper.abstract.repository';
import { NewspaperRepositoryImplementation } from '../repository/newspaper.repository.implementation';

@Injectable()
export class NewspaperService {
  constructor(
    private readonly newspaperRepository: NewspaperRepositoryImplementation,
    private readonly objectStorageService: ObjectStorageService,
    private readonly usersService: UsersService,
    private readonly neighborhoodService: NeighborhoodService,
    private readonly tagsService: TagsService,
  ) {}

  async create(data: {
    userId: number;
    neighborhoodId: number;
    content: any;
    profileImageUrl?: string;
    title?: string;
    tagId?: number;
    profileImage?: Express.Multer.File;
  }) {
    const { userId, neighborhoodId, content, profileImageUrl, title, tagId, profileImage } = data;
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new CochonError('user_not_found', 'User not found', 404);
    if (!user.newsletter) throw new CochonError('user_no_newsletter', 'User must be reporter to write a newspaper', 403);
    const neighborhood = await this.neighborhoodService.getNeighborhoodById(neighborhoodId);
    if (!neighborhood) throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
    if (tagId) {
      await this.tagsService.getTagById(tagId); // throw si pas trouvé
    }
    // Upload image si présente
    let finalProfileImageUrl = profileImageUrl;
    if (profileImage) {
      const fileName = await this.objectStorageService.uploadFile(
        profileImage.buffer,
        profileImage.originalname,
        BucketType.NEWSPAPER_IMAGES
      );
      finalProfileImageUrl = await this.objectStorageService.getFileLink(fileName, BucketType.NEWSPAPER_IMAGES);
    }
    try {
      return await this.newspaperRepository.create({
        userId: String(userId),
        neighborhoodId: String(neighborhoodId),
        content,
        profileImageUrl: finalProfileImageUrl,
        title,
        tagIds: tagId !== undefined ? [tagId] : undefined,
      });
    } catch (error) {
      throw new CochonError('NEWSPAPER_CREATE_ERROR', 'Erreur lors de la création du journal.', 500, { error });
    }
  }

  async findAll() {
    try {
      return await this.newspaperRepository.findAll();
    } catch (error) {
      throw new CochonError('NEWSPAPER_FINDALL_ERROR', 'Erreur lors de la récupération des journaux.', 500, { error });
    }
  }

  async findOne(id: string) {
    const newspaper = await this.newspaperRepository.findOne(id);
    if (!newspaper) {
      throw new CochonError('NEWSPAPER_NOT_FOUND', 'Journal non trouvé.', 404, { id });
    }
    return newspaper;
  }

  async findByUser(userId: string) {
    try {
      return await this.newspaperRepository.findByUser(userId);
    } catch (error) {
      throw new CochonError('NEWSPAPER_FIND_BY_USER_ERROR', 'Erreur lors de la récupération des journaux par utilisateur.', 500, { userId, error });
    }
  }

  async findByNeighborhood(neighborhoodId: string) {
    try {
      return await this.newspaperRepository.findByNeighborhood(neighborhoodId);
    } catch (error) {
      throw new CochonError('NEWSPAPER_FIND_BY_NEIGHBORHOOD_ERROR', 'Erreur lors de la récupération des journaux par quartier.', 500, { neighborhoodId, error });
    }
  }

  async update(id: string, data: Partial<{
    content?: any;
    profileImageUrl?: string;
    title?: string;
    tagId?: number;
    profileImage?: Express.Multer.File;
    userId?: number;
    neighborhoodId?: number;
  }>) {
    // Récupération du journal existant
    const existing = await this.newspaperRepository.findOne(id);
    if (!existing) {
      throw new CochonError('NEWSPAPER_UPDATE_NOT_FOUND', 'Journal à mettre à jour non trouvé.', 404, { id });
    }
    // Vérification user
    const userIdToCheck = data.userId ?? existing.userId;
    if (userIdToCheck) {
      const user = await this.usersService.getUserById(Number(userIdToCheck));
      if (!user) throw new CochonError('user_not_found', 'User not found', 404);
      if (!user.newsletter) throw new CochonError('user_no_newsletter', 'User must be subscribed to the newsletter to update a newspaper', 403);
    }
    // Vérification neighborhood
    const neighborhoodIdToCheck = data.neighborhoodId ?? existing.neighborhoodId;
    if (neighborhoodIdToCheck) {
      const neighborhood = await this.neighborhoodService.getNeighborhoodById(Number(neighborhoodIdToCheck));
      if (!neighborhood) throw new CochonError('neighborhood_not_found', 'Neighborhood not found', 404);
    }
    // Vérification tag
    if (data.tagId) {
      await this.tagsService.getTagById(data.tagId); // throw si pas trouvé
    }
    // Upload image si présente
    let finalProfileImageUrl = data.profileImageUrl ?? existing.profileImageUrl;
    if (data.profileImage) {
      const fileName = await this.objectStorageService.uploadFile(
        data.profileImage.buffer,
        data.profileImage.originalname,
        BucketType.NEWSPAPER_IMAGES
      );
      finalProfileImageUrl = await this.objectStorageService.getFileLink(fileName, BucketType.NEWSPAPER_IMAGES);
    }
    const updateData = {
      ...data,
      profileImageUrl: finalProfileImageUrl,
    };
    delete updateData.profileImage;
    const updated = await this.newspaperRepository.update(id, {
      ...updateData,
      userId: updateData.userId !== undefined ? String(updateData.userId) : undefined,
      neighborhoodId: updateData.neighborhoodId !== undefined ? String(updateData.neighborhoodId) : undefined,
      tagIds: updateData.tagId !== undefined ? [updateData.tagId] : undefined,
    });
    if (!updated) {
      throw new CochonError('NEWSPAPER_UPDATE_NOT_FOUND', 'Journal à mettre à jour non trouvé.', 404, { id });
    }
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.newspaperRepository.delete(id);
    if (!deleted) {
      throw new CochonError('NEWSPAPER_DELETE_NOT_FOUND', 'Journal à supprimer non trouvé.', 404, { id });
    }
    return deleted;
  }
} 