import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {forkJoin, Observable, Subscription} from "rxjs";
import {Cargo} from "../../../../core/models/cargo";
import {Address} from "../../../../core/models/address";
import {Route, RouteDTO} from "../../../../core/models/route";
import {ClientService} from "../../../../core/services/client.service";
import {ModalService} from "../../../../core/services/modal.service";
import {MapGeocodesService, MapRoutingService} from "../../../../core/services/map.service";
import {Client, clientAddress, clientInfo} from "../../../../core/models/client";
import {SelectedCargoService} from "../../../../core/services/selected-cargo.service";
import {set, SetSelectionComponent} from "../set-selection/set-selection.component";
import {CarriageService} from "../../../../core/services/carriage.service";
import {Carriage} from "../../../../core/models/carriage";
import {BaseModel} from "../../../../core/models/base-model";
import {Router} from "@angular/router";


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

  constructor(private router: Router, private clientService: ClientService, private selectedCargoService: SelectedCargoService,
              private geocodesService: MapGeocodesService, private routeService: MapRoutingService,
              private modalService: ModalService, private carriageService: CarriageService) {
    this.clients_name = new Array<string>();
    this.cargo_row = new FormArray<any>([]);
    this.address_row = new FormArray<any>([]);

    this.client_section = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(10),
        Validators.pattern(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/),
      ]),
      tax_number: new FormControl(null, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]{10}$/)
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      phone: new FormControl(null, [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(12),
        Validators.pattern(/^(?:\+48|48)?\s?\d{3}[-\s]?\d{3}[-\s]?\d{3}$/)
      ])
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
      street: new FormControl(null, [Validators.required,
        Validators.pattern(/^[\p{Letter}\p{Mark}]+(\s[\p{Letter}\p{Mark}]+)*\s\d+(\/\d+)?$/u)]),
      city: new FormControl(null, [Validators.required]),
      postalCode: new FormControl(null, [Validators.required,
        Validators.pattern(/^(?:(\\d{2}-\\d{3})|(\\d{5})|(\\d{3}\\s?\\d{2}))$/)]),
      country: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit() {
    this.form.get("client_section")?.get("name")?.valueChanges.subscribe(client => {
      let c = this.clients.get(client);
      let setToObject = (obj: any, data: any, set_empty = false) => {
        Object.keys(obj).forEach(key => {
          if (key != "name") obj[key].setValue((set_empty) ? "" : data[key]);
        })
      };

      if (c != undefined) {
        setToObject(this.client_section.controls, c!);
        setToObject(this.client_address.controls, c!.address);
      } else {
        setToObject(this.client_section.controls, null, true);
        setToObject(this.client_address.controls, null, true);
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
      if (this.current_step === this.max_step) return;
      return this.current_step++;
    }
  }

  toggleTabs(tabNumber: number) {
    this.currentTab = tabNumber;
  }

  submitForm() {
    this.route?.subscribe(route => {
      let pickup_time = new Date(this.time_section.get("pickup_date")?.value);
      const [hour, minute] = this.time_section.get("time")?.value.split(':').map(Number);
      pickup_time.setUTCHours(hour, minute);
      let drop_time = new Date(new Date(pickup_time).getTime() + route!.duration * 1000);

      let client = Client.tax_numbers.get(this.client_section.get("tax_number")!.value);

      let carriage = new Carriage({
        client: client!,
        all_stops: [this.pickupAddress!, this.dropAddress!],
        pickup_time: pickup_time,
        drop_time: drop_time,
        pickup_address: this.pickupAddress!,
        drop_address: this.dropAddress!,
      });
      let sections = new Array<string[]>();

      this.sets.forEach(s => {
        sections.push(route.findSection(s.drop_address!, "drop").map(s => s.id));
      });

      carriage.all_stops.forEach(a => this.geocodesService.geocodesFromRaw(a.toJSON()));

      carriage.add_sets(this.sets, sections);
      this.carriageService.post(carriage).subscribe({
          next: (carriage) => {
            this.modalService.updateHeader("Successfully Created");
            this.modalService.updateContent("New carriage was created.")
          },
          error: (error) => {
            this.modalService.updateHeader("Error Occurred");
            this.modalService.updateContent(error.toString());
          }
        }
      )

      this.modalService.setVisibility(true);
      this.router.navigate(['']);
    });
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
    this.sets = data;
  }

  callSendDataToParent() {
    this.childComponent.sendDataToParent();
  }

  protected getClientOrCreate() {
    let client = Client.tax_numbers.get(this.client_section.get("tax_number")!.value);
    return (client) ? client : new Client(BaseModel.fromJSON(this.client_section.value, Client));
  }

  get email() {
    return this.client_section.get('email');
  }

  get name() {
    return this.client_section.get('name');
  }

  get tax_number() {
    return this.client_section.get('tax_number');
  }

  get phone() {
    return this.client_section.get('phone');
  }
}

