import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-address-form-array',
  templateUrl: './address-form-array.component.html',
  styleUrls: ['./address-form-array.component.css']
})
export class AddressFormArrayComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() formArray!: FormArray;
  @Input() countries!: Array<string>;

  constructor() {
  }

  ngOnInit(): void {
  }

  addNewRow() {
    let street = new FormControl(null);
    let city = new FormControl(null);
    let postalCode = new FormControl(null);
    let country = new FormControl(null);
    let fg = new FormGroup({street, city, postalCode, country});
    this.formArray.push(fg);
  }

  deleteRow(index:number) {
    this.formArray.removeAt(index);
  }

}
