import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FloatLabelType } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { AutenticacionService } from 'src/app/servicios/auth/autenticacion.service';
import { TokenStorageService } from 'src/app/servicios/auth/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  formGroup?: FormGroup;
  floatLabelControl = new FormControl('auto' as FloatLabelType);
  errorSesion: boolean = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AutenticacionService,
    private readonly tokenService: TokenStorageService,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.configurarFormulario();
  }

  login() {
    if (this.formGroup) {
      if (this.formGroup.valid) {
        // Iniciar sesión con credenciales
        const correo = this.formGroup.get('correo')?.value;
        const clave = this.formGroup.get('constrasena')?.value;
        this.authService.login(correo, clave).subscribe({
          next: data => {
            // Guardar Token
            this.tokenService.guardarToken(data.access_token);
            this.errorSesion = false;

            const toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1000,
              timerProgressBar: false,
              didDestroy: () => {
                this.ingresarAlAplicativo();
              }
            })
            
            toast.fire({
              icon: 'success',
              title: '¡Ha iniciado sesión!'
            });
          },
          error: err => {
            this.errorSesion = true;

            const toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: false,
            })
            
            toast.fire({
              icon: 'error',
              title: 'Error en el inicio de sesión',
            });
          }
        });
      }
    }
    
  }

  ingresarAlAplicativo() {
    this.router.navigate(['/spa']);
  }

  configurarFormulario() {
    this.formGroup = this.formBuilder.group({
      correo: new FormControl(
        {
          value: '',
          disabled: false
        },
        [
          Validators.required,
          Validators.email,
          Validators.pattern('([a-z]{2,})\.([a-z0-9]{2,})@epn\.edu\.ec')
        ]
      ),
      constrasena: new FormControl(
        {
          value: '',
          disabled: false
        },
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$')
        ]
      )
    });

    const cambio$ = this.formGroup.valueChanges;
    cambio$.subscribe({
      next: (valor) => {
        if (this.formGroup) {
          if (this.formGroup.valid) {
            console.log("VALIDO")
          } else {
            console.log("INVALIDO");
          }
        }
      }
    })
  }

  getFloatLabelValue(): FloatLabelType {
    return this.floatLabelControl.value || 'auto';
  }

}
