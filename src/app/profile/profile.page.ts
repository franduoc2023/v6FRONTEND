// src/app/profile/profile.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { AuthService } from '../auth/auth.service';
import {
  UserService,
  UserProfileDto,
  UpdateUserProfileRequest
} from '../services/user.service';

// Tipo para los datos que vienen del ID token de Azure B2C
type IdTokenProfile = {
  name?: string;
  email?: string;
  oid?: string;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ]
})
export class ProfilePage implements OnInit {

  private auth = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  // Perfil que viene del token (B2C)
  get idTokenProfile(): IdTokenProfile | null {
    return this.auth.userProfile as IdTokenProfile | null;
  }

  // Perfil de la app (User Service)
  backendProfile: UserProfileDto | null = null;

  // Formulario reactivo
  profileForm!: FormGroup;

  loading = false;
  saving = false;

  // Mensajes de feedback
  successMsg = '';
  errorMsg = '';

  ngOnInit(): void {
    // 1) Definir formulario reactivo con validaciones
    this.profileForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)
        ]
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)
        ]
      ],
      language: [
        'en-NZ',
        [Validators.required]
      ]
    });

    this.loadProfile();
  }

  // Atajo para el template (f.firstName, f.lastName...)
  // Lo tipamos como any para evitar el TS4111 en el HTML.
  get f(): any {
    return this.profileForm.controls;
  }

  loadProfile() {
    this.loading = true;

    this.userService.getMyProfile().subscribe({
      next: profile => {
        console.log('[ProfilePage] Perfil backend cargado:', profile);
        this.backendProfile = profile;

        const tokenProfile = this.idTokenProfile;

        const firstName =
          profile.firstName
          ?? (tokenProfile?.name ?? '')
          ?? '';

        const lastName =
          profile.lastName
          ?? '';

        const language =
          profile.language
          ?? 'en-NZ';

        // 2) Rellenar el formulario con datos actuales
        this.profileForm.patchValue({
          firstName,
          lastName,
          language
        });

        this.loading = false;
      },
      error: err => {
        console.error('[ProfilePage] Error cargando perfil backend', err);
        this.loading = false;
      }
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const dto = this.profileForm.value as UpdateUserProfileRequest;

    this.userService.updateMyProfile(dto).subscribe({
      next: updated => {
        this.backendProfile = updated;
        this.saving = false;

        this.successMsg = 'Profile updated successfully ✔';

        setTimeout(() => {
          this.successMsg = '';
        }, 3000);
      },
      error: err => {
        console.error('[ProfilePage] Error actualizando perfil', err);
        this.saving = false;

        this.errorMsg = 'Could not save your profile. Please try again.';

        setTimeout(() => {
          this.errorMsg = '';
        }, 4000);
      }
    });
  }
}
