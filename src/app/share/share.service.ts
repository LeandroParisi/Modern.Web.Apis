import { Injectable } from '@angular/core';

export interface ShareObject {
  title: string;
  text: string;
  url?: string;
  files?: File[];
}

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  async shareItem(item: ShareObject): Promise<void> {
    try {
      await navigator.share(item);
    } catch (err) {
      alert('Share is not supported by your browser.');
      console.error(err.name, err.message);
    }
  }
}
