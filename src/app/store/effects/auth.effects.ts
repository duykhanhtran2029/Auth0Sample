import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { authSignIn, authSignOut } from '../actions/auth.actions';

@Injectable()
export class AuthEffects {
    login$ = createEffect(
        () => this.actions$.pipe(
            ofType(authSignIn),
            tap((action) => {
                const url = action.payload || '/';
                this.authService.login(url);
            })
        ),
        { dispatch: false }
    );

    logout$ = createEffect(
        () => this.actions$.pipe(
            ofType(authSignOut),
            tap(() => {
                this.authService.logout();
            })
        ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private authService: AuthService
    ) { }
}
