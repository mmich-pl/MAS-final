import {Component, Input, OnInit} from '@angular/core';
import {Address} from "../../../../core/models/address";
import {Route} from "../../../../core/models/route";
import {Client} from "../../../../core/models/client";
import {set} from "../set-selection/set-selection.component";

@Component({
  selector: 'app-submit-panel',
  templateUrl: './submit-panel.component.html',
  styleUrls: ['./submit-panel.component.css']
})
export class SubmitPanelComponent implements OnInit {
  @Input() pickupAddress!: Address;
  @Input() dropAddress!: Address;
  @Input() route!: Route;
  @Input() startDate!: string;
  @Input() endDate!: string;
  @Input() client!: Client;
  @Input() sets!: Array<set>;
  constructor() {
  }

  ngOnInit(): void {
    let end = new Date(new Date(this.startDate).getTime() + this.route!.duration * 1000);
    this.endDate = end.toISOString();


  }

  findInSets(address: Address, action: string): set[] {
    return this.sets.filter(s => (action === "drop") ? s.drop_address === address : s.pickup_address === address);
  }

  protected readonly Address = Address;

}
