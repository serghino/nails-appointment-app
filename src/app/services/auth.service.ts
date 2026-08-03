import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

const TOKEN_STORAGE_KEY = 'admin_auth_token';

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl || '/api';

  private isBrowser = isPlatformBrowser(this.platformId);
  private tokenSignal = signal<string | null>(this.isBrowser ? localStorage.getItem(TOKEN_STORAGE_KEY) : null);

  /**
   * Attempt to log in with username/password and store the returned JWT
   */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password }).pipe(
      tap(response => this.setToken(response.token)),
      catchError(error => {
        return throwError(() => new Error(error.error?.error || 'Invalid credentials'));
      })
    );
  }

  logout(): void {
    this.setToken(null);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  isAuthenticated(): boolean {
    return !!this.tokenSignal();
  }

  private setToken(token: string | null): void {
    this.tokenSignal.set(token);
    if (!this.isBrowser) {
      return;
    }
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }
}
