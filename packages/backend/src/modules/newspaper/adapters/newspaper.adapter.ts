import { Newspaper } from '../domain/newspaper.model';

export class NewspaperAdapter {
  static databaseToDomain(db: any): Newspaper {
    return {
      id: db._id?.toString?.() ?? db.id?.toString?.(), // Ajout de l'id
      userId: db.userId,
      neighborhoodId: db.neighborhoodId,
      content: db.content,
      profileImageUrl: db.profileImageUrl,
      title: db.title,
      tagIds: db.tagIds,
    };
  }

  static listDatabaseToDomain(dbs: any[]): Newspaper[] {
    return dbs.map(this.databaseToDomain);
  }
} 