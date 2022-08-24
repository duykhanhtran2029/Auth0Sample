import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { authSignIn } from '../store/actions/auth.actions';
import { AuthState } from '../store/state/auth.state';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private store: Store<AuthState>,
        private auth: AuthService
    ) { }

    waitForHandleAuthCallbackToComplete(): Observable<boolean> {
        return this.auth.handleCallbackComplete$.pipe(
            filter(complete => complete),
            take(1),
        );
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | UrlTree | boolean {
        return this.waitForHandleAuthCallbackToComplete().pipe(
            switchMap(() => this.auth.isAuthenticated$.pipe(
                    tap(loggedIn => {
                        if (!loggedIn) {
                            this.store.dispatch(authSignIn({ payload: state.url }));
                        }
                    }),
                )),
        );
    }
}
