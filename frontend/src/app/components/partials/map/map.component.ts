import {Component, ViewChild, ElementRef, Input, SimpleChanges, EventEmitter, Output, OnInit} from '@angular/core';

import H from '@here/maps-api-for-javascript';
import onResize from 'simple-element-resize-detector';
import {MapRoutingService} from "../../../../services/map.service";
import {RouteDTO} from "../../../../shared/Route";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit{
  @Input() public zoom = 2;
  @Input() public lat = 0;
  @Input() public lng = 0;

  @Input() public  routeDTO!:RouteDTO;

  private readonly api_key = import.meta.env['NG_APP_API_KEY'];
  private map?: H.Map;

  @ViewChild('map') mapDiv?: ElementRef;
  linestring !:H.geo.LineString | H.geo.MultiLineString
  lineOptions!:H.map.Spatial.Options

  private timeoutHandle: any;
  @Output() notify = new EventEmitter();

  ngOnChanges(changes: SimpleChanges) {
    clearTimeout(this.timeoutHandle);
    this.timeoutHandle = setTimeout(() => {
      if (this.map) {
        if (changes['zoom'] !== undefined) {
          this.map.setZoom(changes['zoom'].currentValue);
        }
        if (changes['lat'] !== undefined) {
          this.map.setCenter({lat: changes['lat'].currentValue, lng: this.lng});
        }
        if (changes['lng'] !== undefined) {
          this.map.setCenter({lat: this.lat, lng: changes['lng'].currentValue});
        }
      }
    }, 100);
  }

  ngAfterViewInit(): void {
    if (!this.map && this.mapDiv) {
      const platform = new H.service.Platform({
        apikey: this.api_key
      });
      const layers = platform.createDefaultLayers();
      const map = new H.Map(
        this.mapDiv.nativeElement,
        (layers as any).vector.normal.map,
        {
          pixelRatio: window.devicePixelRatio,
          center: {lat: 0, lng: 0},
          zoom: 2,
        },
      );
      onResize(this.mapDiv.nativeElement, () => {
        map.getViewPort().resize();
      });
      map.addEventListener('mapviewchange', (ev: H.map.ChangeEvent) => {
        this.notify.emit(ev)
      });
      new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      let route =  new H.map.Polyline(this.linestring, this.lineOptions);
      map.addObject(route);
      this.map = map;
    }
  }
  constructor(private service : MapRoutingService) {
    this.zoom = 2;
    this.lat = 0;
    this.lng = 0;

    console.log(this.routeDTO);
    this.service.post(this.routeDTO).subscribe(val => {
      console.log(val);
      let linestrings = new Array<H.geo.LineString>()
      val.sections.forEach(s => linestrings.push(H.geo.LineString.fromFlexiblePolyline(s.polyline)))

      this.linestring = new H.geo.MultiLineString(linestrings);
      this.lineOptions =  { data: null, style: {strokeColor:'blue', lineWidth:3}}

      console.log(linestrings);
    });

  }
  ngOnInit(): void {


     }

}
