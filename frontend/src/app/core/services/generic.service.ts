import { Injectable } from '@angular/core';
import {BaseModel} from "../models/base-model";
import {CrudOperations} from "./crud-operations";
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";

export class GenericCrudService<T extends BaseModel<T>, ID> implements CrudOperations<T, ID>{
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

  create(t: Partial<T> & { toJSON: () => T }): Observable<T> {
    return this._http
      .post<T>(`${this.apiUrl}`, t.toJSON())
      .pipe(map((result) => new this.tConstructor(result)));
  }
}
