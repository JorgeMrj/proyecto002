import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Panaderia } from "./panaderia/panaderia";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Panaderia],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('proyecto002');
}
