import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserInfo } from '../shared/user-info';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-admin',

  template: `
    <div *ngIf="loaded; else loading" [class.container]="user && user.admin">
      <app-login *ngIf="!user; else showAdmin"></app-login>
      <ng-template #showAdmin>
        <div class="main" *ngIf="user!.admin; else unauthorized">
          <mat-toolbar color="primary">
            <img
              class="logo"
              src="./assets/azure.svg"
              alt="Azure Logo"
              routerLink="/admin"
              routerLinkActive
              [routerLinkActiveOptions]="{
                matrixParams: 'ignored',
                paths: 'exact',
                queryParams: 'ignored',
                fragment: 'exact'
              }"
              #routerLink="routerLinkActive"
            />
            <span class="hide-xs">Azure Check-In</span>
            <span class="spacer"></span>
            <mat-slide-toggle
              *ngIf="routerLink.isActive"
              matTooltip="Show archived events"
              [checked]="archived"
              (change)="toggleArchived()"
            >
              <span class="hide-xs">Archived</span>
            </mat-slide-toggle>
            <button *ngIf="routerLink.isActive" mat-flat-button routerLink="/admin/new" matTooltip="Create event">
              <mat-icon aria-hidden="true">add</mat-icon>
              <span class="hide-sm">Create event</span>
            </button>
            <app-logout *ngIf="user" redirectUrl="/admin" inline="true"></app-logout>
          </mat-toolbar>
          <router-outlet></router-outlet>
        </div>
        <ng-template #unauthorized>
          <app-logout redirectUrl="/admin"></app-logout>
          <app-unauthorized></app-unauthorized>
        </ng-template>
      </ng-template>
      <app-version></app-version>
    </div>
    <ng-template #loading>
      <mat-progress-bar class="progress" mode="indeterminate"> </mat-progress-bar>
    </ng-template>
  `,
  styles: [
    `
      $primary: #039be5;

      :host {
        display: flex;
        height: 100%;
        justify-content: center;
        align-items: center;
        background: #999;
        background-image: radial-gradient(circle at center, #999 0%, #444 100%);
        overflow: auto;
      }
      .container {
        width: 100%;
        height: 100%;
      }
      .main {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
      }
      .progress {
        margin: 40px;
      }
      .mat-toolbar {
        background: linear-gradient(to right, lighten($primary, 10%), $primary);

        .mat-flat-button {
          margin: 0 10px;
        }
      }
      .logo {
        height: 40px;
        width: 40px;
        flex-shrink: 0;
        object-fit: cover;
        filter: drop-shadow(0 0 20px #fff);
        margin: 0 1em 0 0.5em;
      }
      .mat-slide-toggle {
        font-size: 14px;
        font-weight: 400;
        margin: 0 1em;
      }

      @media screen and (min-width: 768px) {
        .main {
          padding: 20px 20px 42px 20px;
        }
      }
    `,
  ],
})
export class AdminComponent implements OnInit {
  loaded = false;
  archived = false;
  user: UserInfo | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.queryParams.pipe().subscribe((params) => {
      this.archived = params.archived === 'true';
    });

    this.loaded = false;

    try {
      this.user = await this.userService.getUserInfo();
    } catch (error) {
      console.error('Error:', error);
      this.snackBar.open(`Error: ${error && error.message}`);
    }

    this.loaded = true;
  }

  toggleArchived(): void {
    this.archived = !this.archived;
    this.router.navigate(['/admin'], this.archived ? { queryParams: { archived: true } } : {});
  }
}
