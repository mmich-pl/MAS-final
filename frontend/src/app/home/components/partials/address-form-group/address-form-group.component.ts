import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {MapGeocodesService} from "../../../../core/services/map.service";
import {distinctUntilChanged, filter, Subscription, switchMap} from "rxjs";
import {Address} from "../../../../core/models/address";
import {clientAddress} from "../../../../core/models/client";

@Component({
  selector: 'app-address-form-group',
  templateUrl: './address-form-group.component.html',
  styleUrls: ['./address-form-group.component.css']
})
export class AddressFormGroupComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() countries!: Array<string>;
  addresses = new Array<Address>();
  private subscription?: Subscription;

  constructor(private mapService: MapGeocodesService) {
  }

  getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName];
  }

  ngOnInit() {
    this.subscription = this.form.get("street")?.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter(inputValue => inputValue.length > 3),
        switchMap(inputValue => this.mapService.getSaved(inputValue))
      )
      .subscribe(addr => {
        this.addresses = addr;
        const selectedStreet = this.addresses.find(addr => addr.street === this.form.get("street")?.value);
        if (selectedStreet) {
          Object.keys(this.form.controls).forEach(key => {
            if (key != "street") this.form.controls[key].setValue(this.getProperty(selectedStreet!, key as keyof clientAddress));
          });
        } else {
          Object.keys(this.form.controls).forEach(key => {
            if (key != "street") this.form.controls[key].setValue('');
          });
        }
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
