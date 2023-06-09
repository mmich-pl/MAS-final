import {Injectable} from '@angular/core';
import {GenericCrudService} from "./generic.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Carriage} from "../models/carriage";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CarriageService extends GenericCrudService<Carriage, string> {

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_DATABASE_API']}carriage`, Carriage);
  }

  public post(carriage: Carriage): Observable<Carriage> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
    return this.httpclient
      .post<Carriage>(`${import.meta.env['NG_APP_DATABASE_API']}carriage`, carriage.toJSON(), {headers:headers});
  }

}
