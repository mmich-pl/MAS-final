import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CarriageFormComponent} from "./home/components/sites/carriage-form/carriage-form.component";

const routes: Routes = [
  { path: '', component: CarriageFormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
