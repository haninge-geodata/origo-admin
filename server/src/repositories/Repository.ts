import mongoose, { FilterQuery, UpdateQuery } from "mongoose";
import { IRepository } from "@/interfaces/repository.interface";

class Repository<T> implements IRepository<T> {
  private model: mongoose.Model<T>;

  constructor(modelOrName: mongoose.Model<T> | string) {
    if (typeof modelOrName === "string") {
      if (!mongoose.modelNames().includes(modelOrName)) {
        throw new Error(`No model found for name: ${modelOrName}`);
      }
      this.model = mongoose.model<T>(modelOrName);
    } else {
      this.model = modelOrName;
    }
  }

  async create(model: T): Promise<T> {
    const newDocument = new this.model(model);
    await newDocument.save();
    return newDocument;
  }

  async find(id: string): Promise<T> {
    const document = await this.model.findById(id).exec();
    if (!document) {
      throw new Error("Document not found");
    }
    return document;
  }

  async findByCriteria(criteria: FilterQuery<T>): Promise<T[]> {
    return this.model.find(criteria).exec();
  }

  async findAll(criteria: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(criteria).exec();
  }

  async findRelated(id: string, path: string): Promise<T[]> {
    const query: FilterQuery<T> = { [path]: id } as any;
    let mongooseQuery = this.model.find(query);
    return mongooseQuery.exec();
  }

  async query(
    criteria: FilterQuery<T>,
    sortOptions: { [key: string]: "asc" | "desc" | 1 | -1 } | null = null,
    limit: number | null = null
  ): Promise<T[]> {
    let query = this.model.find(criteria);

    if (sortOptions) {
      query = query.sort(sortOptions);
    }

    if (limit !== null) {
      query = query.limit(limit);
    }

    return query.exec();
  }

  async update(id: string, model: T): Promise<T> {
    const updateData: UpdateQuery<T> = model as UpdateQuery<T>;
    const updatedModel = await this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
    return updatedModel!;
  }

  async upsert(query: FilterQuery<T>, model: T, options?: object): Promise<T> {
    const updateData: UpdateQuery<T> = model as UpdateQuery<T>;
    updateData.$setOnInsert = { _id: updateData._id };
    delete updateData._id;
    const queryOptions = Object.assign(options || {}, { upsert: true, new: true });
    const updatedModel = await this.model.findOneAndUpdate(query, updateData, queryOptions).exec();
    return updatedModel!;
  }

  async delete(id: string): Promise<T> {
    const document = await this.model.findByIdAndDelete(id).exec();
    if (!document) {
      throw new Error("Document not found");
    }
    return document;
  }
}

export { Repository };
