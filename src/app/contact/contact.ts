import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  submitMessage() {
    alert('訊息已送出！我們會盡快聯絡您。');
  }
}
