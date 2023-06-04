import { Injectable } from '@angular/core';
import {GenericCrudService} from "./generic.service";
import {Trailer, Truck} from "../models/truck";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Cargo} from "../models/cargo";
import {map, Observable} from "rxjs";
import {Driver} from "../models/employee";

@Injectable({
  providedIn: 'root'
})
export class TruckService extends GenericCrudService<Truck, string> {

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_DATABASE_API']}truck`, Truck);
  }

  getWithinDates(start: string, end: string): Observable<Truck[]> {
    const queryString = {
      params: new HttpParams()
        .set("pickup_date", start)
        .set("drop_date", end)
    };

    return this._http
      .get<Truck[]>(`${import.meta.env['NG_APP_DATABASE_API']}truck`,  queryString)
      .pipe(map((result) => result.map((i) => new Truck(i))));
  }

}
