import {Injectable} from '@angular/core';
import {GenericCrudService} from "./generic-crud.service";
import {HttpClient} from "@angular/common/http";
import {Trailer} from "../shared/Truck";

@Injectable({
  providedIn: 'root'
})
export class TrailerService  extends GenericCrudService<Trailer, string>{

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_DATABASE_API']}trailer`, Trailer);
  }

}
