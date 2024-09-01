export interface IMapper<TModel, TDto> {
  toDto(model: TModel, ...contexts: any[]): TDto;
  toDBModel(dto: TDto, ...contexts: any[]): TModel;
}
// export interface IContextualMapper<TModel, TDto, TContext = void> extends IMapper<TModel, TDto> {
//   toDtoWithContext(model: TModel): TDto;
//   toDBModelWithContext(dto: TDto, ...contexts: any[], create?: boolean): TModel;
// }
