import { createAction, props } from '@ngrx/store';

export const authSignIn = createAction(
    '[Core-Auth] Login',
    props<{ payload: string }>()
);
export const authSignOut = createAction('[Auth] Logout');

export const writeAuthenticateStatus = createAction(
    '[Core-Auth] Write Authenticate Status',
    props<{ payload: boolean }>()
);

export const setToken = createAction(
    '[Core-Auth] Set token',
    props<{ payload: any }>()
);


