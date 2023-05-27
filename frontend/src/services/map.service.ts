import {Injectable} from '@angular/core';
import {GenericCrudService} from "./generic-crud.service";
import {HttpClient} from "@angular/common/http";
import {Address} from "../shared/Address";
import {Route, RouteDTO} from "../shared/Route";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MapGeocodesService extends GenericCrudService<Address, string> {

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_ROUTING_API']}geocoding`, Address);
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
      .post<RouteDTO>(`${import.meta.env['NG_APP_ROUTING_API']}route`, route.toJson())
      .pipe(map((result) => Route.fromJSON(result)));
  }

}
