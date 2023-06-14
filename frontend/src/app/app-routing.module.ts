import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CarriageFormComponent} from "./home/components/sites/carriage-form/carriage-form.component";
import {MainComponent} from "./home/components/sites/main/main.component";

const routes: Routes = [
  { path: '', component: MainComponent },
  {path:'carriage/add', component:CarriageFormComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
