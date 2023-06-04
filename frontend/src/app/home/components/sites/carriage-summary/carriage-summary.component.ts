import {Component, Input, OnInit,} from '@angular/core';
import {Cargo} from "../../../../core/models/cargo";
import {Route} from "../../../../core/models/route";
import {Trailer, Truck} from "../../../../core/models/truck";
import {Driver, Licences, LicencesKey} from "../../../../core/models/employee";
import {DriverService} from "../../../../core/services/driver.service";
import {TrailerService} from "../../../../core/services/trailer.service";
import {TruckService} from "../../../../core/services/truck.service";
import {forkJoin, Observable} from "rxjs";
import {LoaderService} from "../../../../core/services/loader.service";
import {ModalService} from "../../../../core/services/modal.service";


type set = { cargo: Cargo, amount: number, trailer: Trailer, truck: Truck, driver: Driver };

@Component({
  selector: 'app-carriage-summary',
  templateUrl: './carriage-summary.component.html',
  styleUrls: ['./carriage-summary.component.css'],
})
export class CarriageSummaryComponent implements OnInit {
  @Input() cargo!: Map<Cargo, number>;
  @Input() route!: Route;
  @Input() startDate!: string;
  @Input() changePage!: (isNextPage: boolean) => number | undefined;
  endDate = "";
  trucks = new Array<Truck>();
  trailers: Array<Trailer> | undefined;
  drivers = new Map<LicencesKey, Driver[]>();
  sets = new Array<set>();

  constructor(private driverService: DriverService, private trailerService: TrailerService,
              private truckService: TruckService, protected loaderService: LoaderService, protected modalService: ModalService) {
  }

  constructSets() {

    let i = 0;
    for (let [cargo, amount] of this.cargo) {
      let trailers = this.trailers?.filter((t) => cargo.type?.getTrailers().includes(t))
      let drivers = this.drivers.get(cargo.required_licence);
      if (trailers != undefined && drivers != null) {
        let min = trailers.reduce((prev, current) => {
          return (prev > current.carrying_capacity) ? prev : current.carrying_capacity;
        }, 0);

        for (let j = 0; j < trailers.length; j++) {
          this.sets.push(
            {
              cargo: cargo,
              amount: (amount > min) ? trailers[j].carrying_capacity : amount,
              trailer: trailers[j],
              truck: this.trucks[i],
              driver: drivers[j]
            }
          )
          amount -= trailers[j].carrying_capacity;
          i += (j + 1);
        }
      }
    }
  }


  ngOnInit(): void {
    this.endDate = new Date(new Date(this.startDate).getTime() + this.route!.duration * 1000).toISOString();

    const truckObservable = this.truckService.getWithinDates(this.startDate, this.endDate);
    const trailerObservable = this.trailerService.getMatchingTrailers(this.startDate, this.endDate, this.cargo);
    const driverObservables = new Array<Observable<Driver[]>>();

    this.cargo.forEach((value, key) => {
      console.log(value, key, key.required_licence);
      const driverObservable = this.driverService.getMatchingDrivers(this.startDate, this.endDate,
        (key.required_licence === Licences.NotRequired) ? "" : key.required_licence);
      driverObservables.push(driverObservable);
    });

    forkJoin([truckObservable, trailerObservable, ...driverObservables,])
      .subscribe(([trucks, trailers, ...drivers]) => {
        this.trucks = trucks;
        this.trailers = trailers;
        let i = 0;
        this.cargo.forEach((a, index) => {
          this.drivers.set(index.required_licence, drivers[i]!);
        });
        this.constructSets();
        this.loaderService.setLoading(false);
      });

  }
}
