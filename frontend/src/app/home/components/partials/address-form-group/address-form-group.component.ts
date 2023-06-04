import { Component ,OnInit, Input} from '@angular/core';
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-address-form-group',
  templateUrl: './address-form-group.component.html',
  styleUrls: ['./address-form-group.component.css']
})
export class AddressFormGroupComponent implements OnInit{
@Input() form!:FormGroup;
@Input() countries!:Array<string>;

  ngOnInit(): void {
  }
}
