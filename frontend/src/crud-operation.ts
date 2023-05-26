import {Observable} from "rxjs";
import {ResourceModel} from "./shared/ResourceModel";

export interface CrudOperations<T extends ResourceModel<T>, ID> {
  create(t: Partial<T> & { toJson: () => T }): Observable<T>;
  getById(id : ID):Observable<T>;
  get():Observable<T[]>

}
