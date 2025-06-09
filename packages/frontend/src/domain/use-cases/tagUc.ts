import { TagRepository } from '@/infrastructure/repositories/TagRepository.ts';
import { TagModel } from '@/domain/models/tag.model.ts';

export class TagUc {
    constructor(private tagRepository: TagRepository) {}

    async getTags(): Promise<TagModel[]> {
        try {
            return await this.tagRepository.getTags();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Une erreur est survenue lors de la récupération des tags');
        }
    }
}
