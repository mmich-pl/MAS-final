import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {MapGeocodesService} from "../../../../core/services/map.service";
import {filter, Subscription, switchMap} from "rxjs";
import {Address} from "../../../../core/models/address";

@Component({
  selector: 'app-address-form-group',
  templateUrl: './address-form-group.component.html',
  styleUrls: ['./address-form-group.component.css']
})
export class AddressFormGroupComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() countries!: Array<string>;
  @Input() is_updatable: boolean = true;
  addresses = new Array<Address>();
  private subscription?: Subscription;

  constructor(private mapService: MapGeocodesService) {
  }

  ngOnInit() {
    let setToObject = (obj: any, data: any, set_empty = false) => {
      Object.keys(obj).forEach(key => {
        if (key != "street") obj[key].setValue((set_empty) ? "" : data[key]);
      })
    };

    if (this.is_updatable) {
      this.subscription = this.form.get("street")?.valueChanges.pipe(
        filter(inputValue => inputValue.length > 3),
        switchMap(inputValue => this.mapService.get([inputValue]))
      ).subscribe(addr => {
        this.addresses = addr;
        const selectedStreet = this.addresses.find(addr =>
          addr.street === this.form.get("street")?.value);
        (selectedStreet) ? setToObject(this.form.controls, selectedStreet!)
          : setToObject(this.form.controls, null, true);
      }, error => {
        console.error('Error caught in subscription:', error);
      })
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get street() {
    return this.form.get('street');
  }

  get city() {
    return this.form.get('city');
  }

  get postalCode() {
    return this.form.get('postalCode');
  }

  get country() {
    return this.form.get('country');
  }
}
