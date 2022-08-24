import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState } from '@auth0/auth0-angular';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, from, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, shareReplay, tap } from 'rxjs/operators';
import { setToken, writeAuthenticateStatus } from '../store/actions/auth.actions';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // Create an observable of Auth0 instance of client
    auth0Client$: Observable<Auth0Client>;
    isAuthenticated$: Observable<boolean>;
    handleRedirectCallback$: Observable<any>;
    getToken$: Observable<any>;
    private handleCallbackCompleteSubject$ = new BehaviorSubject<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/member-ordering
    handleCallbackComplete$ = this.handleCallbackCompleteSubject$.asObservable();

    constructor(
        private router: Router,
        private store: Store<AuthState>
    ) {
        // On initial load, check authentication state with authorization server
        // Set up local auth streams if user is already authenticated
        this.onInitService();
        this.localAuthSetup();
        this.handleAuthCallback();
    }

    // When calling, options can be passed if desired
    // https://auth0.github.io/auth0-spa-js/classes/auth0client.html#getuser

    onInitService(): void {
        // Create an observable of Auth0 instance of client
        this.auth0Client$ = (from(
            createAuth0Client({
                audience: 'http://localhost:6060',
                domain: 'dev-sample.eu.auth0.com',
                client_id: '7Vho6oFU3XguYTyEplZSk55i50DytXbj',
                redirect_uri: `${window.location.origin}`,
                response_type: 'code',
                useRefreshTokens: true,
                cacheLocation: 'localstorage'
            })
        ) as Observable<Auth0Client>).pipe(
            shareReplay(1), // Every subscription receives the same shared value
            catchError(err => throwError(err))
        );

        // Define observables for SDK methods that return promises by default
        // For each Auth0 SDK method, first ensure the client instance is ready
        // concatMap: Using the client instance, call SDK method; SDK returns a promise
        // from: Convert that resulting promise into an observable
        this.isAuthenticated$ = this.auth0Client$.pipe(
            concatMap((client: Auth0Client) => from(client.isAuthenticated())),
            tap((res: boolean) => this.store.dispatch(writeAuthenticateStatus({ payload: res })))
        );

        this.handleRedirectCallback$ = this.auth0Client$.pipe(
            concatMap((client: Auth0Client) => from(client.handleRedirectCallback()))
        );

        this.getToken$ = this.auth0Client$.pipe(
            concatMap((client: Auth0Client) => from(client.getTokenSilently())),
            tap((token: string) => {
                this.store.dispatch(setToken({ payload: token }));
                const decode = JSON.parse(window.atob(token.split('.')[1]));
                console.log(decode);
            },
            (error) => console.log('[Error]',error)
            )
        );
    }

    login(redirectPath: string = '/') {
        // ensure redirect path not in error path
        redirectPath = redirectPath.includes('/error') ? '' : redirectPath;
        // A desired redirect path can be passed to login method
        // (e.g., from a route guard)
        // Ensure Auth0 client instance exists
        this.auth0Client$.subscribe((client: Auth0Client) => {
            // Call method to log in
            client.loginWithRedirect({
                redirect_uri: `${window.location.origin}`,
                appState: { target: redirectPath }
            });
        });
    }

    logout() {
        // Ensure Auth0 client instance exists
        this.auth0Client$.subscribe((client: Auth0Client) => {
            // Call method to log out
            client.logout({
                client_id: '7Vho6oFU3XguYTyEplZSk55i50DytXbj',
                returnTo: `${window.location.origin}`
            });
        });
    }

    private localAuthSetup() {
        // This should only be called on app initialization
        // Set up local authentication streams
        const checkAuth$ = this.isAuthenticated$.pipe(
            concatMap((loggedIn: boolean) => {
                if (loggedIn) {
                    // If authenticated, get user and set in app
                    // NOTE: you could pass options here if needed
                    return combineLatest([
                        this.getToken$,
                        this.isAuthenticated$
                    ]);
                }
                // If not authenticated, return stream that emits 'false'
                return of(loggedIn);
            })
        );
        checkAuth$.subscribe();
    }

    private handleAuthCallback() {
        // Call when app reloads after user logs in with Auth0
        const params = window.location.search;
        const shouldIgnore = localStorage.getItem('SHOULD_IGNORE');
        if (!shouldIgnore && params && params.includes('code=') && params.includes('state=') && !params.includes('error=')) {
            let targetRoute: string; // Path to redirect to after login processsed
            const authComplete$ = this.handleRedirectCallback$.pipe(
                // Have client, now call method to handle auth callback redirect
                tap(cbRes => {
                    // Get and set target redirect route from callback results
                    targetRoute = cbRes.appState && cbRes.appState.target ? cbRes.appState.target : '/';
                    // Login by ticket, if you want to make sure it is the first time, you should disable the ticket after loged in
                    if (targetRoute !== '/' &&
                        targetRoute.includes('email=') && targetRoute.includes('message=') && targetRoute.includes('success=')) {
                        targetRoute = '/';
                    }
                }),
                concatMap(() =>
                    // Redirect callback complete; get user and login status
                    combineLatest([
                        this.getToken$,
                        this.isAuthenticated$
                    ])
                )
            );
            // Subscribe to authentication completion observable
            // Response will be an array of user and login status
            authComplete$.subscribe(([user, loggedIn]) => {
                // Redirect to target route after callback processing
                this.handleCallbackCompleteSubject$.next(true);
                this.router.navigateByUrl(this.cleanTargetRoute(targetRoute));
            });
        } else if (params.includes('error=unauthorized')) {
            this.logout();
        } else {
            this.handleCallbackCompleteSubject$.next(true);
        }
    }

    /**
     *
     * @param route targetRoute
     * @returns cleaned route that deleted `code` and `state`
     */
    private cleanTargetRoute(route: string): string {
        const splittedRoute = route.split('?');
        const params = new URLSearchParams(splittedRoute[1]);
        params.delete('code');
        params.delete('state');
        return params.toString() ? `${splittedRoute[0]}?${params.toString()}` : splittedRoute[0];
    }
}




