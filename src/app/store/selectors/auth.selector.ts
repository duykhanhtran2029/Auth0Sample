import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../state/auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('Auth');

export const selectIsAuthenticated = createSelector(
    selectAuthState,
    (state) => state.isAuthenticated
);

export const selectToken = createSelector(
    selectAuthState,
    (state) => state.token
);
