import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatePickerComponent } from './home/components/partials/date-picker/date-picker.component';
import { MapComponent } from './home/components/partials/map/map.component';
import { StepperComponent } from './home/components/partials/stepper/stepper.component';
import { CarriageFormComponent } from './home/components/sites/carriage-form/carriage-form.component';
import { TrucksetSetupComponent } from './home/components/sites/truckset-setup/truckset-setup.component';
import {CommonModule} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import {AutocompleteLibModule} from "angular-ng-autocomplete";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { AddressFormGroupComponent } from './home/components/partials/address-form-group/address-form-group.component';

@NgModule({
  declarations: [
    AppComponent,
    DatePickerComponent,
    MapComponent,
    StepperComponent,
    CarriageFormComponent,
    TrucksetSetupComponent,
    AddressFormGroupComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AutocompleteLibModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
