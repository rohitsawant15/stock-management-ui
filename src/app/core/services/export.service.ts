import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  private apiUrl = `${environment.apiUrl}/export`;

  constructor(private http: HttpClient) {}

  // GET /api/v1/export/products
  // Returns raw CSV string — NOT wrapped in ApiResponse
  // Backend sets Content-Disposition: attachment; filename=products.csv
  exportProducts(): Observable<string> {
    return this.http.get(`${this.apiUrl}/products`, {
      responseType: 'text'   // tell Angular to treat response as plain text not JSON
    });
  }

  // Helper: trigger browser download from a string
  // Called after exportProducts() succeeds
  downloadCsv(csvData: string, filename: string): void {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);   // create temp browser URL for the blob

    // Create a hidden anchor tag, click it, then remove it
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the object URL from memory
    URL.revokeObjectURL(url);
  }
}