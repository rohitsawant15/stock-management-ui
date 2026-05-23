import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,           // this component manages itself — no NgModule needed
  imports: [RouterOutlet],    // standalone components import what they need directly
  template: `<router-outlet></router-outlet>`
})
export class App {
  title = 'stock-management-ui';
}