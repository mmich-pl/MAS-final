import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-carriage-form',
  templateUrl: './carriage-form.component.html',
  styleUrls: ['./carriage-form.component.css']
})
export class CarriageFormComponent implements OnInit {

  current_step = 1;
  max_step=3
  last_page = false;
  constructor() { }

  ngOnInit(): void {
  }


  change_page(isNextPage: boolean) {
    if (!isNextPage) {
      return this.current_step--;
    } else {
      if (this.current_step === 3) {
        return;
      }
      return this.current_step++;

    }
  }

}

