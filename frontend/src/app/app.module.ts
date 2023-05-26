import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CarriageFormComponent } from './components/sites/carriage-form/carriage-form.component';
import { StepperComponent } from './components/sites/stepper/stepper.component';
import { HttpClientModule } from '@angular/common/http';
import {AutocompleteLibModule} from "angular-ng-autocomplete";
import {ReactiveFormsModule} from "@angular/forms";
import { MapComponent } from './components/partials/map/map.component';

@NgModule({
  declarations: [
    AppComponent,
    CarriageFormComponent,
    StepperComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AutocompleteLibModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
