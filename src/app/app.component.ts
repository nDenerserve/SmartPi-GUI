import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/services';
import { User } from '@app/models';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  nodelocation = window.location.protocol + '//' + window.location.hostname + ':1880';
  networklocation = window.location.protocol + '//' + window.location.hostname + ':8080';
  grafanalocation = window.location.protocol + '//' + window.location.hostname + ':3000';

  sidebarToggled = false;

  currentUser: User;


  title = 'smartpiGui';

  constructor(private authenticationService: AuthenticationService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  onSidebarCollapseClick(event) {
    this.sidebarToggled = !this.sidebarToggled;
  }

  login(userName: string, password: string) {
    this.authenticationService.login(userName, password);
  }

  logout() {
    this.currentUser = null;
    this.authenticationService.logout();
  }

}
