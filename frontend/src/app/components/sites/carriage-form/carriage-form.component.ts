import {Component, OnInit} from '@angular/core';
import {ClientService} from "../../../../services/client.service";
import {Client} from "../../../../shared/Client";

@Component({
  selector: 'app-carriage-form',
  templateUrl: './carriage-form.component.html',
  styleUrls: ['./carriage-form.component.css']
})
export class CarriageFormComponent implements OnInit {
  current_step = 1;
  max_step = 3
  last_page = false;

  clients_name_list: string[];

  constructor(private clientService: ClientService) {
    this.clients_name_list = [];
  }

  ngOnInit(): void {
    for (let [_, value] of this.clientService.getAll()) {
      this.clients_name_list.push(value.name)
    }

    console.log(Client.clients_extent);
  }


  change_page(isNextPage: boolean) {
    if (!isNextPage) {
      return this.current_step--;
    } else {
      if (this.current_step === 3) {
        return;
      }
      return this.current_step++;

    }
  }

}

