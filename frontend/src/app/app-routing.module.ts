import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TrucksetSetupComponent} from "./components/sites/truckset-setup/truckset-setup.component";
import {CarriageFormComponent} from "./components/sites/carriage-form/carriage-form.component";

const routes: Routes = [
  { path: '', component: CarriageFormComponent },
  { path: 'truckset', component: TrucksetSetupComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
