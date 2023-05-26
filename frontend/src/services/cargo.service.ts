import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Cargo} from "../shared/Cargo";

@Injectable({
  providedIn: 'root'
})
export class CargoService {
  constructor(private httpclient: HttpClient) {
  }

  getAll(): Observable<Cargo[]> {
    return this.httpclient.get<Cargo[]>(
      import.meta.env['NG_APP_DATABASE_API'] + 'cargo'
    );
  }
}
