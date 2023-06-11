import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css']
})
export class StepperComponent {
  @Input() currentStep!: number;

  steps :  Map<number, string> = new Map([[1, "Client Data"], [2, "Address"], [3, "Load"], [4, "Set"], [5,"Summary"]]);

  ngOnInit(): void {}
}
