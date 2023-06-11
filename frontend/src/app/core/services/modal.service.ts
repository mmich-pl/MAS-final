import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private show: boolean = false;
  private headerSource = new BehaviorSubject<string>('Initial Header');
  currentHeader = this.headerSource.asObservable();
  private contentSource = new BehaviorSubject<string>('Initial Content');
  currentContent = this.contentSource.asObservable();
  eventEmitter = new EventEmitter<void>();

  constructor() {
  }

  setVisibility(visible: boolean) {
    this.show = visible;
  }

  getVisibility(): boolean {
    return this.show;
  }

  updateContent(newContent: string) {
    this.contentSource.next(newContent);
  }

  updateHeader(newHeader: string) {
    this.headerSource.next(newHeader);
  }

  emitEvent() {
    this.eventEmitter.emit();
  }
}
