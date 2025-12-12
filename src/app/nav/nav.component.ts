import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  imports: [IonicModule, RouterModule, NgIf, RouterLink],
})
export class NavComponent {

  auth = inject(AuthService);

  showMenu = false;

  // Abre y cierra el menú al hacer click
  toggleMenu(event: MouseEvent) {
    event.stopPropagation(); // evita que cierre inmediatamente
    this.showMenu = !this.showMenu;
  }

  // Se ejecuta cuando el mouse sale del recuadro
  onMouseLeaveMenu() {
    this.showMenu = false;
  }

}
