import {map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CrudOperations} from "../crud-operation";
import {ResourceModel} from "../shared/ResourceModel";


export class GenericCrudService<T extends ResourceModel<T>, ID> implements CrudOperations<T, ID>{
  constructor(
    protected _http: HttpClient,
    private apiUrl: string,
    private tConstructor: { new (m: Partial<T>, ...args: any[]): T },
  ) { }


  public get(): Observable<T[]> {
    return this._http
      .get<T[]>(`${this.apiUrl}`)
      .pipe(map((result) => result.map((i) => new this.tConstructor(i))));
  }

  public getById(id: ID): Observable<T> {
    return this._http
      .get<T>(`${this.apiUrl}/${id}`)
      .pipe(map((result) => new this.tConstructor(result)));
  }

  create(t: Partial<T> & { toJson: () => T }): Observable<T> {
    return this._http
      .post<T>(`${this.apiUrl}`, t.toJson())
      .pipe(map((result) => new this.tConstructor(result)));
  }
}
