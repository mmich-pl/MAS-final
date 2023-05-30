import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CarriageFormComponent } from './components/sites/carriage-form/carriage-form.component';
import { StepperComponent } from './components/partials/stepper/stepper.component';
import { HttpClientModule } from '@angular/common/http';
import {AutocompleteLibModule} from "angular-ng-autocomplete";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { MapComponent } from './components/partials/map/map.component';
import {CommonModule} from "@angular/common";
import { TrucksetSetupComponent } from './components/sites/truckset-setup/truckset-setup.component';

@NgModule({
  declarations: [
    AppComponent,
    CarriageFormComponent,
    StepperComponent,
    MapComponent,
    TrucksetSetupComponent,
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
