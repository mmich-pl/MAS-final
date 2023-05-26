import { Component } from '@angular/core';

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
  }

  zoom: number;
  lat: number;
  lng: number;

  handleMapChange(event: H.map.ChangeEvent) {
    if (event.newValue.lookAt) {
      const lookAt = event.newValue.lookAt;
      this.zoom = lookAt.zoom;
      this.lat = lookAt.position.lat;
      this.lng = lookAt.position.lng;
    }
  }
}
