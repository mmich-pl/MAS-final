import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CarriageFormComponent } from './components/sites/carriage-form/carriage-form.component';
import { StepperComponent } from './components/sites/stepper/stepper.component';

@NgModule({
  declarations: [
    AppComponent,
    CarriageFormComponent,
    StepperComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
