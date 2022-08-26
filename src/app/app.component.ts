import { Component, OnInit } from '@angular/core';
import { AuthState } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { filter, interval, switchMap, tap } from 'rxjs';
import { AuthService } from './services/auth.service';
import { authSignOut } from './store/actions/auth.actions';
import { selectIsAuthenticated } from './store/selectors/auth.selector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  time = 0;
  enable = true;
  constructor(
    private store: Store<AuthState>) {}

  onLogout() {
    this.store.dispatch(authSignOut());
  }

}
