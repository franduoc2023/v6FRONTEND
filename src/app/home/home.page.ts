// src/app/home/home.page.ts
import {
  Component,
  inject,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgIf } from '@angular/common';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from '@ionic/angular/standalone';

import { AuthService } from '../auth/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    NgIf,
    RouterModule,
  ],
})
export class HomePage implements AfterViewInit {
  auth = inject(AuthService);

  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    const video = this.heroVideo?.nativeElement;
    if (video) {
      video.muted = true;  // por si acaso
      video.play().catch(err => {
        console.log('Autoplay bloqueado o falló:', err);
      });
    }}}



    