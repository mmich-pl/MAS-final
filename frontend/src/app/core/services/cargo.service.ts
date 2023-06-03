import { Injectable } from '@angular/core';
import {GenericCrudService} from "./generic.service";
import {HttpClient} from "@angular/common/http";
import {Cargo} from "../models/cargo";

@Injectable({
  providedIn: 'root'
})
export class CargoService extends  GenericCrudService<Cargo,string>{

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_DATABASE_API']}cargo`, Cargo );
  }
}
