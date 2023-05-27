import { Component } from '@angular/core';
import {RouteDTO} from "../shared/Route";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Transport Company';
  isList: number = 0;
  isMenu: boolean = false;
  isSearch: boolean = false;
  ngOnInit(): void {}

  constructor() {
    this.zoom = 2;
    this.lat = 0;
    this.lng = 0;
    this.route =new RouteDTO({"origin":[50.1120758,8.6833919],
      "destination":[52.5309975,13.3846178]});
    console.log(this.route);
  }

  zoom: number;
  lat: number;
  lng: number;

  route!:RouteDTO;
  handleMapChange(event: H.map.ChangeEvent) {
    if (event.newValue.lookAt) {
      const lookAt = event.newValue.lookAt;
      this.zoom = lookAt.zoom;
      this.lat = lookAt.position.lat;
      this.lng = lookAt.position.lng;
    }
  }
}
