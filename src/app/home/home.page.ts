
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonSpinner
} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    CommonModule,
    IonSpinner,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    ReactiveFormsModule
  ],
})
export class HomePage {
  private fb = inject(FormBuilder);

  public registroForm: FormGroup;
  public isSubmitting = signal<boolean>(false);
  public fechaMinima: string;
  public modoOscuro = signal<boolean>(false);

  public datosEnviados: {
    nombre: string;
    email: string;
    fecha: string;
  } | null = null;

  constructor() {
    const hoy = new Date();

    this.fechaMinima = `${hoy.getFullYear()}-${String(
      hoy.getMonth() + 1
    ).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    this.registroForm = this.fb.group({
      nombre: [
        '',
        [Validators.required, Validators.minLength(3)]
      ],
      email: [
        '',
        [Validators.required, Validators.email]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
        ]
      ],
      fecha: [
        '',
        [
          Validators.required,
          (control: any) =>
            control.value && control.value < this.fechaMinima
              ? { fechaAnterior: true }
              : null
        ]
      ]
    });
  }

  get f() {
    return this.registroForm.controls;
  }

  public async onSubmit(): Promise<void> {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formData = this.registroForm.getRawValue();

      this.datosEnviados = {
        nombre: formData.nombre,
        email: formData.email,
        fecha: formData.fecha
      };

      const passwordHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(formData.password)
      );

      const hash = Array.from(new Uint8Array(passwordHash))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

      console.log('Payload a enviar a la API REST:', {
        nombre: formData.nombre,
        email: formData.email,
        password: hash,
        fecha: formData.fecha
      });

      // Simulación de llamada asíncrona a un backend HTTP.
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Aquí se implementaría la llamada a la API REST.
      alert('El formulario se ha enviado correctamente.');
      this.registroForm.reset();
    } catch (error) {
      console.error('Error al persistir los datos', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public cambiarModoOscuro(): void {
    this.modoOscuro.update(valor => !valor);
    document.body.classList.toggle('dark', this.modoOscuro());
  }

  public descargarPDF(): void {
    if (!this.datosEnviados) {
      return;
    }

    const contenido = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Datos del registro</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
            }

            h1 {
              text-align: center;
            }

            p {
              font-size: 16px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <h1>Datos del registro</h1>
          <p><strong>Nombre:</strong> ${this.datosEnviados.nombre}</p>
          <p><strong>Correo electrónico:</strong> ${this.datosEnviados.email}</p>
          <p><strong>Fecha:</strong> ${this.datosEnviados.fecha}</p>
        </body>
      </html>
    `;

    const ventana = window.open('', '_blank');

    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      ventana.focus();
      ventana.print();
    }
  }
}
