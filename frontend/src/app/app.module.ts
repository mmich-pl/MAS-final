import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatePickerComponent } from './home/components/partials/date-picker/date-picker.component';
import { MapComponent } from './home/components/partials/map/map.component';
import { StepperComponent } from './home/components/partials/stepper/stepper.component';
import { CarriageFormComponent } from './home/components/sites/carriage-form/carriage-form.component';
import { CarriageSummaryComponent } from './home/components/sites/carriage-summary/carriage-summary.component';
import {CommonModule} from "@angular/common";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AutocompleteLibModule} from "angular-ng-autocomplete";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { AddressFormGroupComponent } from './home/components/partials/address-form-group/address-form-group.component';
import { SpinnerComponent } from './home/components/partials/spinner/spinner.component';
import { ModalComponent } from './home/components/partials/modal/modal.component';
import {ErrorInterceptor} from "./core/interceptors/error.interceptor";
@NgModule({
  declarations: [
    AppComponent,
    DatePickerComponent,
    MapComponent,
    StepperComponent,
    CarriageFormComponent,
    CarriageSummaryComponent,
    AddressFormGroupComponent,
    SpinnerComponent,
    ModalComponent,
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
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
