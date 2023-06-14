import { Injectable } from '@angular/core';
import {GenericCrudService} from "./generic.service";
import {HttpClient} from "@angular/common/http";
import {Carriage} from "../models/carriage";

@Injectable({
  providedIn: 'root'
})
export class CarriageService extends GenericCrudService<Carriage, string>{

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_DATABASE_API']}carriage`, Carriage);
  }

}
