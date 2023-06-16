import {Injectable} from '@angular/core';
import {GenericCrudService} from "./generic.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {Address} from "../models/address";
import {Route, RouteDTO} from "../models/route";
import {Driver, Licences} from "../models/employee";

@Injectable({
  providedIn: 'root'
})
export class MapGeocodesService extends GenericCrudService<Address, string> {

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_ROUTING_API']}geocodes`, Address);
  }

  public geocodesFromRaw(data: any): Observable<Address> {
    return this.httpclient.post<Address>(`${import.meta.env['NG_APP_ROUTING_API']}geocodes`, data)
      .pipe(map((result) => new Address(result)));
  }

  public getSaved(street: string): Observable<Address[]> {
    const queryString = {
      params: new HttpParams()
        .set("street", street.substring(0, street.indexOf(' ')))
    };

    return this._http
      .get<Address[]>(`${import.meta.env['NG_APP_ROUTING_API']}address`, queryString)
      .pipe(map((result) => result.map((i) => new Address(i))));
  }

}

@Injectable({
  providedIn: 'root'
})
export class MapRoutingService {

  constructor(private httpclient: HttpClient) {
  }

  public post(route: RouteDTO): Observable<Route> {
    return this.httpclient
      .post<Route>(`${import.meta.env['NG_APP_ROUTING_API']}route`, route.toJSON())
      .pipe(map((result) => Route.fromJSON(result)));
  }

}
