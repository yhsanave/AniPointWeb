import { Component, OnInit, TemplateRef } from '@angular/core';
import { ToastService } from '../toasts.service';

@Component({
  selector: 'app-toasts',
  templateUrl: './toasts.component.html',
  styleUrls: ['./toasts.component.scss']
})
export class AppToastsComponent {
  toastService: ToastService;
    
  constructor(toastService: ToastService) {
    this.toastService = toastService;
  }

  isTemplate(toast: any) { return toast.textOrTpl instanceof TemplateRef; }
}
