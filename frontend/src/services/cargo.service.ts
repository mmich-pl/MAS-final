import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Cargo} from "../shared/Cargo";
import {GenericCrudService} from "./generic-crud.service";
import {Driver} from "../shared/Employee";

@Injectable({
  providedIn: 'root'
})
export class CargoService extends  GenericCrudService<Cargo,string>{

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_DATABASE_API']}cargo`, Cargo );
  }
}
