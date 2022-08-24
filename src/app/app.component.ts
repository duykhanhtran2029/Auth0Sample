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
export class AppComponent implements OnInit {
  time = 0;
  enable = true;
  constructor(
    private store: Store<AuthState>,
    private authService: AuthService) {}
  ngOnInit(): void {
    interval(1000)
      .pipe(
        tap(tick => this.time = tick),
        // check nearly expired
        filter(tick => this.enable && tick % 19 === 0),
        switchMap(() => this.authService.getToken$))
      .subscribe(() => {
        console.log('[Timer] - Get access token silently');
      });

      //TODO: track by expired time of access token ?
  }

  onLogout() {
    this.store.dispatch(authSignOut());
  }
}
