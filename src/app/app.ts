import { Component } from '@angular/core';

// Root component, declared in AppModule (NgModule architecture, not standalone).
@Component({
  selector: 'app-root',
  standalone: false,
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
