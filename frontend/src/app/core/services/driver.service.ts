import {Injectable} from '@angular/core';
import {GenericCrudService} from "./generic.service";
import {Driver, Licences, LicencesKey} from "../models/employee";
import {HttpClient, HttpParams} from "@angular/common/http";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DriverService extends GenericCrudService<Driver, string> {

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_DATABASE_API']}driver`, Driver);
  }

  getMatchingDrivers(start: string, end: string, licence: string): Observable<Driver[]> {
    const queryString = {
      params: new HttpParams()
        .set("pickup_date", start)
        .set("drop_date", end)
    };

    if (licence !== Licences.NotRequired) {
      queryString.params = queryString.params.set("licence", licence);
    }

    return this._http
      .get<Driver[]>(`${import.meta.env['NG_APP_DATABASE_API']}driver`, queryString)
      .pipe(map((result) => result.map((i) => new Driver(i))));
  }

}
