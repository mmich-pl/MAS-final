import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatePickerComponent } from './home/components/partials/date-picker/date-picker.component';
import { MapComponent } from './home/components/partials/map/map.component';
import { StepperComponent } from './home/components/partials/stepper/stepper.component';
import { CarriageFormComponent } from './home/components/sites/carriage-form/carriage-form.component';
import { SetSelectionComponent } from './home/components/sites/set-selection/set-selection.component';
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AutocompleteLibModule} from "angular-ng-autocomplete";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { AddressFormGroupComponent } from './home/components/partials/address-form-group/address-form-group.component';
import { SpinnerComponent } from './home/components/partials/spinner/spinner.component';
import { ModalComponent } from './home/components/partials/modal/modal.component';
import {ErrorInterceptor} from "./core/interceptors/error.interceptor";
import { LoadSectionComponent } from './home/components/partials/load-section/load-section.component';
import { AddressFormArrayComponent } from './home/components/partials/address-form-array/address-form-array.component';
import { SubmitPanelComponent } from './home/components/sites/submit-panel/submit-panel.component';
import { HeaderComponent } from './home/components/partials/navigation/header/header.component';
import { SidebarComponent } from './home/components/partials/navigation/sidebar/sidebar.component';
import { MainComponent } from './home/components/sites/main/main.component';
@NgModule({
  declarations: [
    AppComponent,
    DatePickerComponent,
    MapComponent,
    StepperComponent,
    CarriageFormComponent,
    SetSelectionComponent,
    AddressFormGroupComponent,
    SpinnerComponent,
    ModalComponent,
    LoadSectionComponent,
    AddressFormArrayComponent,
    SubmitPanelComponent,
    HeaderComponent,
    SidebarComponent,
    MainComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AutocompleteLibModule,
    ReactiveFormsModule,
    FormsModule,
    NgOptimizedImage,
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
