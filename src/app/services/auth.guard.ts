import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '@app/services';

import { User } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  currentUser: User;

  constructor(private authenticationService: AuthenticationService, public router: Router) {

    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);

   }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (!this.currentUser) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
