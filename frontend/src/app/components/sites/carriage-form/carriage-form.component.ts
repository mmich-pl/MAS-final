import {Component, OnInit} from '@angular/core';
import {ClientService} from "../../../../services/client.service";
import {Client, clientInfo} from "../../../../shared/Client";
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-carriage-form',
  templateUrl: './carriage-form.component.html',
  styleUrls: ['./carriage-form.component.css']
})
export class CarriageFormComponent implements OnInit {
  current_step = 1;
  max_step = 3
  last_page = false;

  countries: string[] = ["Poland", "Germany", "Czech Republic"];
  cargo_names: string[] = [];
  cargo_row = new FormArray([]);

  form: FormGroup;
  client_section: FormGroup;
  pickup_address: FormGroup;
  destination_address: FormGroup;

  clients_name: Array<string>;

  getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName];
  }

  constructor(private clientService: ClientService) {
    this.clients_name = new Array<string>();


    this.client_section = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(10),
        Validators.pattern("^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$"),
      ]),
      tax_number: new FormControl(null, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern('^[0-9]{10}$')
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      phone: new FormControl(null, [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(12),
        Validators.pattern('^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$')
      ])
    });

    this.pickup_address = new FormGroup({
      street: new FormControl(null, [Validators.required]),
      city: new FormControl(null, [Validators.required]),
      zipcode: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required]),
    })

    this.destination_address = new FormGroup({
      street: new FormControl(null, [Validators.required]),
      city: new FormControl(null, [Validators.required]),
      zipcode: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required]),
    })

    this.form = new FormGroup({
      client_section: this.client_section,
      pickup_address: this.pickup_address,
      destination_address: this.destination_address,

    })
  }

  async ngOnInit() {
    await this.clientService.getAll().subscribe(data => {
      data.forEach(item => {
        if (Client.clients_extent.has(item.id)) return;
        new Client(item.id, item.name, item.tax_number, item.phone, item.email);
        this.clients_name.push(item.name);
      });
    });

    this.form.get("client_section")?.get("name")?.valueChanges.subscribe(client => {
      let c = Client.clients_extent.get(client);
      if (c != undefined) {
        Object.keys(this.client_section.controls).forEach(key => {
          if (key != "name") {
            this.client_section.controls[key].setValue(this.getProperty(c!, key as keyof clientInfo));
          }
        });
      } else {
        Object.keys(this.client_section.controls).forEach(key => {
          if (key != "name") this.client_section.controls[key].setValue('');
        });
      }
    });
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

  submitForm() {

  }
}

