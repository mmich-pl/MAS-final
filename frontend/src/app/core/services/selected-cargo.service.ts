import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Cargo} from "../models/cargo";

@Injectable({
  providedIn: 'root'
})
export class SelectedCargoService {
  private _mapSource = new Subject<Map<Cargo, number>>();
  map = this._mapSource.asObservable();

  passMap(mapData: Map<Cargo, number>) {
    this._mapSource.next(mapData);
  }
}
