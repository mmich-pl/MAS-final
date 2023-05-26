import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Client} from "../shared/Client";
import {GenericCrudService} from "./generic-crud.service";

@Injectable({
  providedIn: 'root'
})
export class ClientService extends GenericCrudService<Client, string>{

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_DATABASE_API']}client`, Client);
  }

}
