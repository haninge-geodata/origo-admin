import { Repository } from "@/repositories/Repository";
import { RelationDto } from "@/shared/interfaces/dtos";

class RelationService {
  async findRelated(findIn: string, id: string, path: string): Promise<RelationDto[]> {
    const repository = new Repository<any>(findIn);
    if (!repository) throw new Error("Check findIn parameter, not found");

    const relatedDocuments = await repository.findRelated(id, path);
    const relationDtos = relatedDocuments.map((doc) => {
      return {
        id: doc._id.toString(),
        name: doc.name,
      } as RelationDto;
    });
    return relationDtos;
  }
}

export { RelationService };
