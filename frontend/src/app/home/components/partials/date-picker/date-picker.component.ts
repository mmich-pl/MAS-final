import {Component, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit {

  @Input() form!: FormGroup;

  MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  showDatepicker = false;
  datepickerValue!: string;
  month!: number;
  current_month!: number;
  year!: number;
  no_of_days = [] as number[];
  blankDays = [] as number[];

  constructor() {
  }

  ngOnInit(): void {
     this.initDate();
    this.getNoOfDays();
  }

  initDate() {
    let today = new Date();
    this.month = this.current_month = today.getMonth();
    this.year = today.getFullYear();
    this.datepickerValue = new Date(this.year, this.month, today.getDate()).toDateString();
  }

  isToday(date: any) {
    return new Date().toDateString() === new Date(this.year, this.month, date).toDateString();
  }

  alreadyPassed(date: any) {
    return  new Date(this.year, this.month, date) < new Date();
  }

  getDateValue(date: any) {
    let selectedDate = new Date(this.year, this.month, date);
    this.datepickerValue = selectedDate.toDateString();
    this.form.get('pickup_date')?.patchValue(this.datepickerValue);
    this.showDatepicker = false;
  }

  getNoOfDays() {
    let i;
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();

    // find where to start calendar day of week
    let dayOfWeek = new Date(this.year, this.month).getDay();
    let blankDaysArray = [];
    for (i = 1; i <= dayOfWeek; i++) {
      blankDaysArray.push(i);
    }

    let daysArray = [];
    for (i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }

    this.blankDays = blankDaysArray;
    this.no_of_days = daysArray;
  }

  trackByIdentity = (index: number, item: any) => item;

  get pickup_date(){
    return this.form.get("pickup_date");
  }

  get pickup_time(){
    return this.form.get("time");
  }
}
