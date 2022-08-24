import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { interval, filter, tap, switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { selectToken } from 'src/app/store/selectors/auth.selector';
import { AuthState } from 'src/app/store/state/auth.state';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  @ViewChild('logs') logs!: ElementRef;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private store: Store<AuthState>
  ) {
  }

  message = 'No response';
  token = '';
  count = 1;


  ngOnInit(): void {
    this.store.select(selectToken).subscribe(token => this.token = token);
    interval(1000)
      .pipe(
        filter(tick => tick % 10 === 0))
      .subscribe(() => {
        this.getMessage();
      });
  }

  getMessage() {
    console.log('[API] Get Message ' + this.count++);
    this.message = 'No response';
    this.http.get<{ message: string }>('http://localhost:6060/api/messages/protected', { headers: new HttpHeaders({ 'Authorization': 'Bearer ' + this.token }) }).subscribe(res => this.message = res.message);
  }

}
