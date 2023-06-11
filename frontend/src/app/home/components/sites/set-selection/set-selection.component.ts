import {Component, EventEmitter, Input, OnInit, Output,} from '@angular/core';
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
import {Address} from "../../../../core/models/address";

type set = {
  cargo: Cargo,
  amount: number,
  trailer?: Trailer,
  truck?: Truck,
  driver?: Driver,
  pickup_address?: Address,
  drop_address?: Address,
};

@Component({
  selector: 'app-set-selection',
  templateUrl: './set-selection.component.html',
  styleUrls: ['./set-selection.component.css'],
})
export class SetSelectionComponent implements OnInit {
  @Input() cargo!: Map<Cargo, number>;
  @Input() startDate!: string;
  @Input() duration!: number;
  @Input() changePage!: (isNextPage: boolean) => number | undefined;
  @Input() addresses!: Array<Address>;
  @Output() setEmitter: EventEmitter<any> = new EventEmitter<any>();

  endDate = "";
  trucks = new Array<Truck>();
  trailers: Array<Trailer> | undefined;
  drivers = new Map<LicencesKey, Driver[]>();
  sets = new Array<set>();

  constructor(private driverService: DriverService, private trailerService: TrailerService,
              private truckService: TruckService, protected loaderService: LoaderService, protected modalService: ModalService) {
  }

  constructSets() {
    const driverObservables = new Array<Observable<Driver[]>>();

    for (let [cargo, amount] of this.cargo) {
      let trailers = this.trailers?.filter((t) => cargo.type?.getTrailers().includes(t)).sort();
      if (trailers != undefined) {
        let min = trailers.reduce((prev, current) => {
          return (prev > current.carrying_capacity) ? prev : current.carrying_capacity;
        }, 0);
        for (let j = 0; j < trailers.length; j++) {
          this.sets.push(
            {
              cargo: cargo,
              amount: (amount >= min) ? trailers[j].carrying_capacity : amount,
            }
          )
          amount -= trailers[j].carrying_capacity;
          if (amount <= 0) break;
        }
      }
    }

    const cargoCountMap: Map<Cargo, number> = this.sets.reduce((cargoMap, set) => {
      const count = cargoMap.get(set.cargo) || 0;
      cargoMap.set(set.cargo, count + 1);
      return cargoMap;
    }, new Map<Cargo, number>());

    for (let [cargo, amount] of cargoCountMap) {
      const driverObservable = this.driverService.getMatchingDrivers(this.startDate, this.endDate,
        (cargo.required_licence != Licences.NotRequired) ? cargo.required_licence : "", amount);
      driverObservables.push(driverObservable);
    }

    forkJoin([...driverObservables]).subscribe((v) => {
      let i = 0;
      this.cargo.forEach((a, index) => {
        this.drivers.set(index.required_licence, v[i++]!);
      });
    })
  }

  ngOnInit(): void {
    let end = new Date(new Date(this.startDate).getTime() + this.duration * 1000);
    this.endDate = end.toISOString();

    const truckObservable = this.truckService.getWithinDates(this.startDate, this.endDate);
    const trailerObservable = this.trailerService.getMatchingTrailers(this.startDate, this.endDate, this.cargo);

    forkJoin([truckObservable, trailerObservable])
      .subscribe(([trucks, trailers]) => {
        this.trucks = trucks;
        this.trailers = trailers;
        this.constructSets();
        this.loaderService.setLoading(false);
      });
  }

  sendDataToParent() {
    this.setEmitter.emit(this.sets);
  }
}
