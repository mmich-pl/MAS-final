import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Client} from "../shared/Client";
import {environment} from "../environments/environment.development";

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private httpclient: HttpClient) {
  }

  getAll(): Map<string, Client> {
    let response =  this.httpclient.get<Client[]>(
      environment.apiBaseURL+'client'
    )

    response.subscribe(data => {
      data.forEach(item => {
        if (Client.clients_extent.has(item.id)) return;
        new Client(item.id, item.name, item.tax_number,  item.phone,item.email);
      });
    });
    return Client.clients_extent;
  }
}
