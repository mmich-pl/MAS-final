import {Component, Input, OnInit} from '@angular/core';
import {Cargo} from "../../../../core/models/cargo";
import {Route} from "../../../../core/models/route";
import {Trailer} from "../../../../core/models/truck";
import {Driver, LicencesKey} from "../../../../core/models/employee";
import {DriverService} from "../../../../core/services/driver.service";
import {TrailerService} from "../../../../core/services/trailer.service";


@Component({
  selector: 'app-truckset-setup',
  templateUrl: './truckset-setup.component.html',
  styleUrls: ['./truckset-setup.component.css'],
})
export class TrucksetSetupComponent implements OnInit {

  @Input() cargo!: Map<Cargo, number>;
  @Input() route: Route | null = null;
  @Input() startDate!: string;
  trailers: Array<Trailer> | undefined;
  drivers = new Map<LicencesKey, Driver[]>();

  constructor(private driverService: DriverService, private trailerService: TrailerService) {
    this.trailerService.get().subscribe((t) => this.trailers = t);
  }

  getMatchingTrailer(cargo: Cargo): Trailer[] | undefined {
    return this.trailers?.filter((t) => cargo.type?.getTrailers().includes(t))
  }

  ngOnInit(): void {
    let endDate = new Date(new Date(this.startDate).getTime() + this.route!.duration * 1000);
    this.cargo.forEach((value, key) => {
      this.driverService.getMatchingDrivers(this.startDate, endDate.toISOString(), key.required_licence).subscribe((a) => {
        this.drivers.set(key.required_licence!, a);
        console.log(this.drivers);
        console.log(this.drivers.get(key.required_licence!));
      })
    })
  }

}
