import {Injectable} from '@angular/core';
import {GenericCrudService} from "./generic-crud.service";
import {HttpClient} from "@angular/common/http";
import {Driver} from 'src/shared/Employee';

@Injectable({
  providedIn: 'root'
})
export class DriverService extends  GenericCrudService<Driver,string>{

  constructor(private httpclient: HttpClient) {
    super(httpclient, `${import.meta.env['NG_APP_DATABASE_API']}driver`, Driver );
  }
}
