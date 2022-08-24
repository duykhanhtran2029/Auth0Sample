import { writeAuthenticateStatus, setToken } from '../actions/auth.actions';
import { createReducer, on, Action } from '@ngrx/store';
import { AuthState } from '../state/auth.state';

export const initialState: AuthState = {
    isAuthenticated: false,
    token: ''
};

const reducer = createReducer(
    initialState,
    on(writeAuthenticateStatus, (state, { payload }) => ({ ...state, isAuthenticated: payload })),
    on(setToken, (state, { payload }) => {
        console.log('[Reducer] - Setting Token', payload);
        return ({ ...state, token: payload });
    })
);

export function authReducer(state: AuthState | undefined, action: Action): AuthState {
    return reducer(state, action);
}
