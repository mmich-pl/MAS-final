import {Component, Input, OnInit} from '@angular/core';
import {DriverService} from "../../../../services/driver.service";
import {TrailerService} from "../../../../services/trailer.service";
import {ActivatedRoute} from "@angular/router";
import {Cargo} from "../../../../shared/Cargo";
import {Driver} from "../../../../shared/Employee";
import {Trailer} from "../../../../shared/Truck";

@Component({
  selector: 'app-truckset-setup',
  templateUrl: './truckset-setup.component.html',
  styleUrls: ['./truckset-setup.component.css'],
})
export class TrucksetSetupComponent implements OnInit {

  @Input() cargo!: Map<Cargo, number>;
  trailers: Array<Trailer> | undefined;

  constructor(private route: ActivatedRoute, private driverService: DriverService, private trailerService: TrailerService) {
    this.trailerService.get().subscribe((t) => this.trailers=t);
  }

  getMatchingTrailer(cargo: Cargo): Trailer[]|undefined {
    return this.trailers?.filter((t)=> cargo.type?.getTrailers().includes(t))
  }


  ngOnInit(): void {
    console.log(this.cargo);
    // this.driverService.get().subscribe();


    // console.log(Driver.driver_extents);
    console.log(Trailer.trailer_extent);
  }

}
