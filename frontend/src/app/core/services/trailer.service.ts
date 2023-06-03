import { Injectable } from '@angular/core';
import {GenericCrudService} from "./generic.service";
import {Trailer} from "../models/truck";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TrailerService  extends GenericCrudService<Trailer, string>{

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_DATABASE_API']}trailer`, Trailer);
  }

}
