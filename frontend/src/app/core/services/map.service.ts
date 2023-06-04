import { Injectable } from '@angular/core';
import {GenericCrudService} from "./generic.service";
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {Address} from "../models/address";
import {Route, RouteDTO} from "../models/route";

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

}

@Injectable({
  providedIn: 'root'
})
export class MapRoutingService {

  constructor(private httpclient: HttpClient) {
  }

  public post(route: RouteDTO): Observable<Route> {

    console.log(route.toJson());

    return this.httpclient
      .post<Route>(`${import.meta.env['NG_APP_ROUTING_API']}route`, route.toJson())
      .pipe(map((result) => Route.fromJSON(result)));
  }

}
