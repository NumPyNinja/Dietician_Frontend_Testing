import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor() { }

  public getServerErrorMessage(error: HttpErrorResponse): string {
    debugger;
    switch (error.status) {    
      case 400: {
        let dieticianError = error.error;
        if (dieticianError.errorCode) {
          return dieticianError.errorMessage;
        } else
          if (dieticianError.success !== null && dieticianError.success === false) {
            return dieticianError.message
          }
          else {
            return `Bad Request: ${error.message}`;
          }
      }
      
      case 404: {
        return `Not Found: ${error.message}`;
      }
      case 403: {
        return `Access Denied: ${error.message}`;
      }
      case 500: {
        return `Internal Server Error: ${error.message}`;
      }
      default: {
        return error.error?.errorMessage || error.message || 'An unknown error occurred';
      }

    }
  }
}
