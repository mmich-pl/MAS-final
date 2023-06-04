import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {Cargo} from "../../../../core/models/cargo";
import {Observable} from "rxjs";
import {CargoService} from "../../../../core/services/cargo.service";
import {SelectedCargoService} from "../../../../core/services/selected-cargo.service";

@Component({
  selector: 'app-load-section',
  templateUrl: './load-section.component.html',
  styleUrls: ['./load-section.component.css']
})
export class LoadSectionComponent implements OnInit {

  @Input() form!: FormGroup;
  @Input() formArray!: FormArray;
  cargo= new Array<Cargo>();
  selectedCargo = new Map<Cargo, number>();

  constructor(private cargoService: CargoService, private selectedCargoService: SelectedCargoService) {

  }

  ngOnInit(): void {
    this.cargoService.get().subscribe((t) => {
      console.log(t);
      this.cargo = t;
      console.log(this.cargo);
    });
    this.formArray?.valueChanges.subscribe(values => {
      console.log(values);
      this.selectedCargo.clear();
      const ctrl = <FormArray>this.formArray;
      ctrl.controls.forEach(x => {
        let cargo = x.get('cargo')?.value;
        let amount = x.get('amount')?.value;

        if (cargo != null && amount != null) {
          if (this.selectedCargo.has(cargo)) {
            this.selectedCargo.set(cargo, this.selectedCargo.get(cargo) + amount);
          } else {
            this.selectedCargo.set(cargo, amount);
          }
        }
      })
      console.log(`child: ${this.selectedCargo.size}`);
      this.selectedCargo.forEach((v,k)=>{console.log(k.name)});
      this.selectedCargoService.passMap(this.selectedCargo);
    });
  }

  add_new_row() {
    const cargo = new FormControl(null, Validators.required);
    const amount = new FormControl(null, Validators.required);
    let fg = new FormGroup({cargo: cargo, amount: amount});
    this.formArray.push(fg);
  }

  delete_row(index: number) {
    this.formArray.removeAt(index);
  }

  get getFormControls() {
    return this.form.get('load')?.value as FormArray;
  }

}
