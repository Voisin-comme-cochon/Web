import {NeighborhoodFrontRepository} from "@/infrastructure/repositories/NeighborhoodFrontRepository.ts";
import {MapBoxGeoJson} from "@/domain/models/MapBoxGeoJson.ts";
import {FrontNeighborhood} from "@/domain/models/FrontNeighborhood.ts";

export class GetAcceptedNeighborhoods {
    constructor(private neighborhoodRepository: NeighborhoodFrontRepository) {
    }

    async execute(): Promise<MapBoxGeoJson> {
        const neighborhoods = await this.neighborhoodRepository.getAcceptedNeighborhoods();
        return {
            type: 'FeatureCollection',
            features: neighborhoods.map((neighborhood: FrontNeighborhood) => ({
                type: 'Feature',
                geometry: neighborhood.geo,
                properties: {
                    id: neighborhood.id,
                    name: neighborhood.name,
                    description: neighborhood.description,
                    color: '#FF5733',
                },
            })),
        };
    }
}