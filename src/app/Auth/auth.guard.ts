import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate , Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "./auth.service";
import { Observable, map, take } from 'rxjs';


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }
    
    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        console.log('test: In AuthGuard')
        return this.authService.isLoggedIn.pipe(
          take(1),
          map((isLoggedIn: boolean) => {
            if (!isLoggedIn) {
              this.router.navigate(['/login']);
              return false;
            }
            return true;
          })
        );
      }
}