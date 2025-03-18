import { Request, Response } from "express";

class BaseController<T> {
  protected service: {
    find: (id: string) => Promise<T>;
    findAll: () => Promise<T[]>;
    create: (data: T) => Promise<T>;
    update: (id: string, data: T) => Promise<T>;
    delete: (id: string) => Promise<T>;
  };

  constructor(service: any) {
    this.service = service;
  }

  async getById(req: Request, res: Response) {
    try {
      const item = await this.service.find(req.params.id);
      res.status(200).json(item);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const items = await this.service.findAll();
      res.status(200).json(items);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await this.service.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const item = await this.service.update(req.params.id, req.body);
      res.status(200).json(item);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteById(req: Request, res: Response) {
    try {
      await this.service.delete(req.params.id);
      res.status(204).end();
    } catch (error) {
      this.handleError(res, error);
    }
  }
  protected handleError(res: Response, error: any) {
    if (error instanceof Error) {
      console.error(`[${Date.now()}] ${error}`);
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Ett oväntat fel inträffade" });
    }
  }
}

export { BaseController };
