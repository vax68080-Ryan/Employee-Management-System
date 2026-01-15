import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string, term: string): SafeHtml {
    const raw = (text ?? '').toString();
    const q = (term ?? '').trim();
    if (!q) return raw;

    // escape HTML to avoid XSS
    const escaped = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    // escape regex
    const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escapedQ, 'gi');

    const highlighted = escaped.replace(re, (m) => `<mark>${m}</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
