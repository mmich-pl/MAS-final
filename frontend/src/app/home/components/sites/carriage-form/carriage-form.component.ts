import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {forkJoin, Observable, Subscription, tap} from "rxjs";
import {Cargo} from "../../../../core/models/cargo";
import {Address} from "../../../../core/models/address";
import {Route, RouteDTO} from "../../../../core/models/route";
import {ClientService} from "../../../../core/services/client.service";
import {ModalService} from "../../../../core/services/modal.service";
import {CargoService} from "../../../../core/services/cargo.service";
import {MapRoutingService, MapGeocodesService} from "../../../../core/services/map.service";
import {Client, clientAddress, clientInfo} from "../../../../core/models/client";


@Component({
  selector: 'app-carriage-form',
  templateUrl: './carriage-form.component.html',
  styleUrls: ['./carriage-form.component.css'],
})
export class CarriageFormComponent implements OnInit, OnDestroy {
  current_step = 1;
  max_step = 5
  last_page = false;

  countries: string[] = ["Poland", "Germany", "Czech Republic"];
  cargo = new Array<Cargo>();
  clients: Map<string, Client>;

  selectedCargo = new Map<Cargo, number>();
  cargo_row = new FormArray([]);

  form: FormGroup;
  client_section: FormGroup;
  client_address: FormGroup;
  time_section: FormGroup;
  pickup_address_form: FormGroup;
  destination_address_form: FormGroup;
  clients_name: Array<string>;

  pickupAddress?: Address;
  dropAddress?: Address;
  route?: Observable<Route>;
  carriageStartTime = "";

  private eventSubscription?: Subscription;


  getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName];
  }

  constructor(private clientService: ClientService, private cargoService: CargoService,
              private geocodesService: MapGeocodesService, private routeService: MapRoutingService,
              private modalService: ModalService) {

    this.clients_name = new Array<string>();

    this.client_address = new FormGroup({
      street: new FormControl(null),
      city: new FormControl(null),
      postalCode: new FormControl(null),
      country: new FormControl(null),
    });

    this.client_section = new FormGroup({
      name: new FormControl(null),
      tax_number: new FormControl(null),
      email: new FormControl(null),
      phone: new FormControl(null),
    });

    this.pickup_address_form = new FormGroup({
      street: new FormControl(null),
      city: new FormControl(null),
      postalCode: new FormControl(null),
      country: new FormControl(null),
    });

    this.destination_address_form = new FormGroup({
      street: new FormControl(null),
      city: new FormControl(null),
      postalCode: new FormControl(null),
      country: new FormControl(null),
    });

    this.time_section = new FormGroup({
      pickup_date: new FormControl(null),
      time: new FormControl(null),
    });

    this.form = new FormGroup({
      client_section: this.client_section,
      client_address: this.client_address,
      time_section: this.time_section,
      pickup_address: this.pickup_address_form,
      destination_address: this.destination_address_form,
      cargo_row: this.cargo_row,
    });
    this.clients = new Map<string, Client>();

    this.clientService.get().subscribe(r => {
      r.forEach(client => this.clients.set(client.name, client));
      this.clients_name = r.map(c => c.name)
    })

    this.cargoService.get().subscribe((t) => {
      this.cargo = t;
    });
  }

  ngOnInit() {
    this.form.get("client_section")?.get("name")?.valueChanges.subscribe(client => {
      let c = this.clients.get(client);
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

        if (cargo != null && amount != null) {
          if (this.selectedCargo.has(cargo)) {
            this.selectedCargo.set(cargo, this.selectedCargo.get(cargo) + amount);
          } else {
            this.selectedCargo.set(cargo, amount);
          }
        }
      })
    });

    this.eventSubscription = this.modalService.eventEmitter.subscribe(() => {
      console.log("event caught in parent");
      this.cargo_row.clear();
      this.selectedCargo.clear();
      this.change_page(false);
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

  submitForm() {
    console.log(this.form);
  }

  getRoute() {
    // forkJoin([
    //   this.geocodesService.geocodesFromRaw(JSON.stringify(this.form.get('pickup_address')?.getRawValue())),
    //   this.geocodesService.geocodesFromRaw(JSON.stringify(this.form.get('destination_address')?.getRawValue()))
    // ]).subscribe(([pickupAddress, dropAddress]) => {
    //   this.pickupAddress = pickupAddress;
    //   this.dropAddress = dropAddress;
    //
    //   console.log(this.pickupAddress);
    //   console.log(this.dropAddress);
    //
    //   let date = this.time_section.get('pickup_date')?.value;
    //   let time = this.time_section.get('time')?.value;
    //   let pickup_date_time = new Date(`${date} ${time}`).toISOString();
    //
    //   let routeRequest = new RouteDTO({
    //     origin: [this.pickupAddress.latitude!, this.pickupAddress.longitude!],
    //     destination: [this.dropAddress.latitude!, this.dropAddress.longitude!],
    //     departureTime: pickup_date_time,
    //   });
    //
    //   console.log(routeRequest);
    //   this.routeService.post(routeRequest).subscribe(route => {
    //     console.log(route);
    //     this.route = route;
    //   })
    // });

    this.carriageStartTime = new Date("2023-05-31T18:20:00.000Z").toISOString()

    let routeRequest = new RouteDTO({
      origin: [50.42264, 14.91633],
      destination: [52.29238, 20.92725],
      departureTime: this.carriageStartTime,
    });

    this.route = this.routeService.post(routeRequest);
  }

  ngOnDestroy() {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }
}

