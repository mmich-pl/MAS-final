import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
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
import {SelectedCargoService} from "../../../../core/services/selected-cargo.service";
import {set, SetSelectionComponent} from "../set-selection/set-selection.component";


@Component({
  selector: 'app-carriage-form',
  templateUrl: './carriage-form.component.html',
  styleUrls: ['./carriage-form.component.css'],
})
export class CarriageFormComponent implements OnInit, OnDestroy {
  current_step = 1;
  currentTab = 1;

  max_step = 5
  last_page = false;

  countries: string[] = ["Poland", "Germany", "Czech Republic"];
  clients: Map<string, Client>;

  selectedCargo = new Map<Cargo, number>();
  cargo_row: FormArray;
  address_row: FormArray;

  form: FormGroup;
  client_section: FormGroup;
  client_address: FormGroup;
  time_section: FormGroup;
  pickup_address_form: FormGroup;
  destination_address_form: FormGroup;
  clients_name: Array<string>;

  pickupAddress?: Address;
  dropAddress?: Address;
  allAddresses = new Array<Address>();
  route?: Observable<Route>;
  carriageStartTime = "";

  private selectedCargoSubscription?: Subscription;
  private eventSubscription?: Subscription;

  @ViewChild(SetSelectionComponent) childComponent!: SetSelectionComponent;
  sets!: Array<set>;

  getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName];
  }

  constructor(private clientService: ClientService, private selectedCargoService: SelectedCargoService,
              private geocodesService: MapGeocodesService, private routeService: MapRoutingService,
              private modalService: ModalService) {
    this.clients_name = new Array<string>();
    this.cargo_row = new FormArray<any>([]);
    this.address_row = new FormArray<any>([]);

    this.client_section = new FormGroup({
      name: new FormControl(null),
      tax_number: new FormControl(null),
      email: new FormControl(null),
      phone: new FormControl(null),
    });

    this.client_address = this.createAddressFormGroup();
    this.pickup_address_form = this.createAddressFormGroup();
    this.destination_address_form = this.createAddressFormGroup();

    this.time_section = new FormGroup({
      pickup_date: new FormControl(null),
      time: new FormControl(null),
    });

    this.form = new FormGroup({
      client_section: this.client_section,
      client_address: this.client_address,
      time_section: this.time_section,
      pickup_address: this.pickup_address_form,
      address_row: this.address_row,
      destination_address: this.destination_address_form,
      cargo_row: this.cargo_row,
    });
    this.clients = new Map<string, Client>();

    this.clientService.get().subscribe(r => {
      r.forEach(client => this.clients.set(client.name, client));
      this.clients_name = r.map(c => c.name)
    })
  }

  createAddressFormGroup(): FormGroup {
    return new FormGroup({
      street: new FormControl(null),
      city: new FormControl(null),
      postalCode: new FormControl(null),
      country: new FormControl(null),
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

    this.eventSubscription = this.modalService.eventEmitter.subscribe(() => {
      this.cargo_row.clear();
      this.selectedCargo.clear();
      this.change_page(false);
    });

    this.selectedCargoSubscription = this.selectedCargoService.map.subscribe(mapData => {
      this.selectedCargo = mapData;
    });
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

  toggleTabs(tabNumber: number) {
    this.currentTab = tabNumber;
  }

  submitForm() {
    console.log(this.form);
  }

  getRoute() {
    forkJoin([
      this.geocodesService.geocodesFromRaw(JSON.stringify(this.form.get('pickup_address')?.getRawValue())),
      this.geocodesService.geocodesFromRaw(JSON.stringify(this.form.get('destination_address')?.getRawValue())),
      ...this.address_row.getRawValue().map(address => this.geocodesService.geocodesFromRaw(JSON.stringify((address))))
    ]).subscribe(([pickupAddress, dropAddress, ...allGeocodedAddresses]) => {
      this.pickupAddress = pickupAddress;
      this.dropAddress = dropAddress;
      this.allAddresses = allGeocodedAddresses;

      let date = this.time_section.get('pickup_date')?.value;
      let time = this.time_section.get('time')?.value;
      this.carriageStartTime = new Date(`${date} ${time}`).toISOString();

      let routeRequest = new RouteDTO({
        origin: [this.pickupAddress.latitude!, this.pickupAddress.longitude!],
        destination: [this.dropAddress.latitude!, this.dropAddress.longitude!],
        departureTime: this.carriageStartTime,
      });

      if (allGeocodedAddresses.length > 0) {
        let via = new Array<[number, number]>();
        this.allAddresses.forEach(a => via.push([a.latitude!, a.longitude!]));
        routeRequest.via = via;
      }

      this.allAddresses.push(pickupAddress);
      this.allAddresses.push(dropAddress);

      this.route = this.routeService.post(routeRequest);
    });
  }

  ngOnDestroy() {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }

    if (this.selectedCargoSubscription) {
      this.selectedCargoSubscription.unsubscribe();
    }
  }

  handleSets(data: Array<set>) {
    let formData = this.form.value;
    console.log(formData);
    this.sets = data;
  }

  callSendDataToParent() {
    this.childComponent.sendDataToParent();
  }

    protected readonly Client = Client;
}

