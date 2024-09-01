import { StyleSchemaDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";
const StyleService = new BaseApiService<StyleSchemaDto>("styles");
export { StyleService };
