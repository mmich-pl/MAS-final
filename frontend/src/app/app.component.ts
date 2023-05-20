import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Transport Company';
  isList: number = 0;
  isMenu: boolean = false;
  isSearch: boolean = false;
  constructor() {}
  ngOnInit(): void {}
}
