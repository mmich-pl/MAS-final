import {Injectable} from '@angular/core';
import {GenericCrudService} from "./generic.service";
import {Trailer} from "../models/truck";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Driver, Licences, LicencesKey} from "../models/employee";
import {map, Observable} from "rxjs";
import {Cargo} from "../models/cargo";

@Injectable({
  providedIn: 'root'
})
export class TrailerService extends GenericCrudService<Trailer, string> {

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_DATABASE_API']}trailer`, Trailer);
  }

  getMatchingTrailers(start: string, end: string, load: Map<Cargo, number>): Observable<Trailer[]> {
    const queryString = {
      params: new HttpParams()
        .set("pickup_date", start)
        .set("drop_date", end)
    };

    let body: { cargo_name: string, amount: number }[] = Array.from(load)
      .map(([cargo, amount]) => ({ cargo_name: cargo.name, amount: amount }));

    return this._http
      .post<any>(`${import.meta.env['NG_APP_DATABASE_API']}trailer/filter`, body, queryString)
      .pipe(map((result) => Trailer.arrayFromJSON(result)));
  }

}
