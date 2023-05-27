import {Component, OnInit} from '@angular/core';
import {ClientService} from "../../../../services/client.service";
import {Client, clientAddress, clientInfo} from "../../../../shared/Client";
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {CargoService} from "../../../../services/cargo.service";
import {Cargo} from "../../../../shared/Cargo";
import {DriverService} from "../../../../services/driver.service";
import {Driver} from "../../../../shared/Employee";
import {TrailerService} from "../../../../services/trailer.service";
import {Trailer} from "../../../../shared/Truck";

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
  cargo = new Map<string, Cargo>();
  cargo_row = new FormArray([]);

  form: FormGroup;
  client_section: FormGroup;
  client_address: FormGroup;
  pickup_address: FormGroup;
  destination_address: FormGroup;

  clients_name: Array<string>;

  getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName];
  }

  constructor(private clientService: ClientService, private cargoService: CargoService,
  private driverService: DriverService, private trailerService: TrailerService) {
    this.clients_name = new Array<string>();

    this.client_address = new FormGroup({
      street: new FormControl(null, [Validators.required]),
      city: new FormControl(null, [Validators.required]),
      zipcode: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required]),
    })

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
      ]),
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
      client_address : this.client_address,
      pickup_address: this.pickup_address,
      destination_address: this.destination_address,
      cargo_row: this.cargo_row,
    })
  }

  ngOnInit() {
    this.clientService.get().subscribe(r =>
      r.forEach(client => this.clients_name.push(client.name)))

    this.cargoService.getAll().subscribe(data => {
      data.forEach(item => {
        if (Cargo.cargo_extent.has(item.id))
          return;
        new Cargo(item.id, item.name, item.type, item.unit, item.required_licences);
        this.cargo = Cargo.cargo_extent;
      });
    });

    this.form.get("client_section")?.get("name")?.valueChanges.subscribe(client => {
      let c = Client.clients_extent.get(client);
      if (c != undefined) {
        console.log(c.address);
        Object.keys(this.client_section.controls).forEach(key => {
          if (key != "name") {
            this.client_section.controls[key].setValue(this.getProperty(c!, key as keyof clientInfo));
          }
        });
        Object.keys(this.client_address.controls).forEach(key => {
          this.client_address.controls[key].setValue(this.getProperty(c!.address, key as keyof clientAddress));
        });
      } else {
        Object.keys(this.client_section.controls).forEach(key => {
          if (key != "name") this.client_section.controls[key].setValue('');
        });
        Object.keys(this.client_address.controls).forEach(key => {
          this.client_address.controls[key].setValue('');
        });
      }
    });
  }

  add_new_row() {
    const cargo = new FormControl(null, Validators.required);
    const amount = new FormControl(null, Validators.required);
    let fg = new FormGroup({cargo: cargo, amount: amount});
    let cargo_row = this.form.get('cargo_row') as FormArray;
    cargo_row.push(fg);
  }


  delete_row(index: number) {
    this.cargo_row.removeAt(index);
  }

  get getFormControls() {
    return this.form.get('load')?.value as FormArray;
  }

  initiateForm(): FormGroup {
    return new FormGroup({
      cargo: new FormControl(null, [Validators.required]),
      amount: new FormControl(null, [Validators.required])
    })
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
    this.driverService.get().subscribe();
    this.trailerService.get().subscribe();

    console.log(Driver.driver_extents);
    console.log(Trailer.trailer_extent);

  }
}

