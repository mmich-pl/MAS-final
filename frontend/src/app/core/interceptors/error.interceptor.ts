import {Injectable} from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ModalService} from "../services/modal.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private modalService: ModalService) {
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 500) {
          this.modalService.updateHeader(error.statusText);
          this.modalService.updateContent(error.error)
          this.modalService.setVisibility(true);
        }
        return throwError(() => new Error(error.message));
      })
    );
  }
}
