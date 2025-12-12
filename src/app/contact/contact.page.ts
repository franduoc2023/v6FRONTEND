// src/app/contact/contact.page.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonCard,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonTextarea,
  IonNote,
} from '@ionic/angular/standalone';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

// EmailJS (frontend)
import emailjs from '@emailjs/browser';

@Component({
  standalone: true,
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  imports: [
    CommonModule,
    RouterLink,
    IonCard,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonTextarea,
    IonNote,
    ReactiveFormsModule,
  ],
})
export class ContactPage {

   private readonly emailServiceId  = 'service_xxxxxx';   // SERVICE_ID
  private readonly emailTemplateId = 'template_yyyyyy';  // TEMPLATE_ID
  private readonly emailPublicKey  = 'YOUR_PUBLIC_KEY';  // PUBLIC_KEY

  contactForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: [''],
    message: ['', Validators.required],
  });

  isSending = false;
  sendOk = false;
  sendError = false;

  constructor(private fb: FormBuilder) {
     emailjs.init(this.emailPublicKey);
  }

   get fullNameControl() { return this.contactForm.get('fullName'); }
  get emailControl()    { return this.contactForm.get('email'); }
  get subjectControl()  { return this.contactForm.get('subject'); }
  get messageControl()  { return this.contactForm.get('message'); }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSending = true;
    this.sendOk = false;
    this.sendError = false;

    const { fullName, email, subject, message } = this.contactForm.value;

     const templateParams = {
      from_name:   fullName  ?? '',
      from_email:  email     ?? '',
      subject:     subject   ?? '',
      message:     message   ?? '',
    };

    emailjs
      .send(this.emailServiceId, this.emailTemplateId, templateParams)
      .then(() => {
        this.isSending = false;
        this.sendOk = true;
        this.sendError = false;
        this.contactForm.reset();
      })
      .catch((error) => {
 
      });
  }
}
