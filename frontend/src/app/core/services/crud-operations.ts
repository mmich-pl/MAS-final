import {Observable} from "rxjs";
import {BaseModel} from "../models/base-model";

export interface CrudOperations<T extends BaseModel<T>, ID> {
  create(t: Partial<T> & { toJSON: () => T }): Observable<T>;
  getById(id : ID):Observable<T>;
  get():Observable<T[]>
}
