import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment.development";
import {Cargo} from "../shared/Cargo";

@Injectable({
  providedIn: 'root'
})
export class CargoService {
  constructor(private httpclient: HttpClient) {
  }

  getAll(): Observable<Cargo[]> {
    return this.httpclient.get<Cargo[]>(
      environment.apiBaseURL + 'cargo'
    );
  }
}
