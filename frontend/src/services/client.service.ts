import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Client} from "../shared/Client";
import {environment} from "../environments/environment.development";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private httpclient: HttpClient) {
  }

  getAll(): Observable<Client[]> {
    return this.httpclient.get<Client[]>(
      environment.apiBaseURL + 'client'
    );
  }
}
