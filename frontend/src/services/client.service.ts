import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Client} from "../shared/Client";
import {environment} from "../environments/environment.development";
import {GenericCrudService} from "./generic-crud.service";

@Injectable({
  providedIn: 'root'
})
export class ClientService extends GenericCrudService<Client, string>{

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${environment.apiBaseURL}client`, Client);
  }

}
