import {Component, OnInit} from '@angular/core';
import {ClientService} from "../../../../services/client.service";
import {Client, clientAddress, clientInfo} from "../../../../shared/Client";
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {CargoService} from "../../../../services/cargo.service";
import {Cargo} from "../../../../shared/Cargo";
import {Router} from "@angular/router";

@Component({
  selector: 'app-carriage-form',
  templateUrl: './carriage-form.component.html',
  styleUrls: ['./carriage-form.component.css'],
})
export class CarriageFormComponent implements OnInit {
  current_step = 1;
  max_step = 5
  last_page = false;

  countries: string[] = ["Poland", "Germany", "Czech Republic"];
  cargo = new Array< Cargo>();
  selectedCargo = new Map< Cargo, number>();
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

  constructor( private clientService: ClientService, private cargoService: CargoService, private router: Router,) {

    this.clients_name = new Array<string>();

    this.client_address = new FormGroup({
      street: new FormControl(null),
      city: new FormControl(null),
      zipcode: new FormControl(null),
      country: new FormControl(null),
    })

    this.client_section = new FormGroup({
      name: new FormControl(null),
      tax_number: new FormControl(null),
      email: new FormControl(null ),
      phone: new FormControl(null),
    });

    this.pickup_address = new FormGroup({
      street: new FormControl(null),
      city: new FormControl(null),
      zipcode: new FormControl(null),
      country: new FormControl(null),
    })

    this.destination_address = new FormGroup({
      street: new FormControl(null),
      city: new FormControl(null),
      zipcode: new FormControl(null),
      country: new FormControl(null),
    })

    this.form = new FormGroup({
      client_section: this.client_section,
      client_address: this.client_address,
      pickup_address: this.pickup_address,
      destination_address: this.destination_address,
      cargo_row: this.cargo_row,
    })

    this.clientService.get().subscribe(r =>
      r.forEach(client => this.clients_name.push(client.name)))

    this.cargoService.get().subscribe((t) =>{
      console.log(t);
      this.cargo = Array.from(Cargo.cargo_extent.values());
    });
  }

  ngOnInit() {
    this.form.get("client_section")?.get("name")?.valueChanges.subscribe(client => {
      let c = Client.clients_extent.get(client);
      if (c != undefined) {
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

    this.form.get('cargo_row')?.valueChanges.subscribe(values => {
      this.selectedCargo.clear();
      const ctrl = <FormArray>this.form.controls['cargo_row'];
      ctrl.controls.forEach(x => {
        let cargo = x.get('cargo')?.value;
        let amount = x.get('amount')?.value;

        if (cargo!=null && amount!=null) {
          this.selectedCargo.set(cargo, amount);
        }
      })
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
      cargo: new FormControl(null),
      amount: new FormControl(null)
    })
  }

  change_page(isNextPage: boolean) {
    if (!isNextPage) {
      return this.current_step--;
    } else {
      if (this.current_step === this.max_step) {
        return;
      }
      return this.current_step++;

    }
  }

  submitForm(){
    console.log(this.form);
  }


}

