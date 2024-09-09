import { Repository } from "@/repositories/Repository";
import { DBFavouriteseMap, FavouritesModel } from "@/models/favourites.model";
import { FavouritesDto } from "@/shared/interfaces/dtos";
import FavouritesMapper from "@/mappers/favouritesMapMapper";
import { IMapper } from "@/interfaces";

class FavouritesService {
  private repository: Repository<DBFavouriteseMap>;
  private _mapper: IMapper<DBFavouriteseMap, FavouritesDto>;

  constructor() {
    this.repository = new Repository<DBFavouriteseMap>(FavouritesModel);
    this._mapper = new FavouritesMapper();
  }

  async find(id: string): Promise<FavouritesDto> {
    var response = await this.repository.find(id);
    return this._mapper.toDto(response);
  }

  //TODO: Change this when auth is implemented
  async getByUser(user: string): Promise<FavouritesDto[]> {
    var response = await this.repository.findByCriteria({ user: user });
    return response.map((item) => this._mapper.toDto(item));
  }

  async create(favourites: FavouritesDto): Promise<FavouritesDto> {
    var response = await this.repository.create(
      this._mapper.toDBModel(favourites)
    );
    return this._mapper.toDto(response);
  }

  async update(id: string, favourites: FavouritesDto): Promise<FavouritesDto> {
    if (id !== favourites.id)
      throw new Error("Id in body does not match id in url");
    var response = await this.repository.update(
      id,
      this._mapper.toDBModel(favourites)
    );
    return this._mapper.toDto(response);
  }

  async delete(id: string): Promise<FavouritesDto> {
    var response = await this.repository.delete(id);
    return this._mapper.toDto(response);
  }
}

export { FavouritesService };
