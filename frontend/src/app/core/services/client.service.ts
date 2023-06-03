import { Injectable } from '@angular/core';
import {GenericCrudService} from "./generic.service";
import {Client} from "../models/client";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ClientService extends GenericCrudService<Client, string>{

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_DATABASE_API']}client`, Client);
  }

}
