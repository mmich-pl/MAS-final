import {Component, Output, Input, OnInit, EventEmitter, OnDestroy} from '@angular/core';
import {ModalService} from "../../../../core/services/modal.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnDestroy {
  content = "";
  header = "";
  private contentSubscription?: Subscription;
  private headerSubscription?: Subscription;

  @Output() closeMeEvent = new EventEmitter();


  constructor(protected modalService: ModalService) {
  }

  ngOnInit(): void {
    this.contentSubscription = this.modalService.currentContent.subscribe(
      (newContent) => {
        this.content = newContent;
      }
    );

    this.headerSubscription = this.modalService.currentHeader.subscribe(
      (newHeader) => {
        this.header = newHeader;
      }
    );
  }

  ngOnDestroy() {
    if (this.contentSubscription && this.headerSubscription) {
      this.contentSubscription.unsubscribe();
      this.headerSubscription.unsubscribe();
    }
  }

}
