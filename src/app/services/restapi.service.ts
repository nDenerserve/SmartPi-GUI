import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { environment } from '@environments/environment';

import { Momentary, Momentarydata } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class RestapiService {

  constructor(private http: HttpClient) { }


  private extractMomentaryData(res: Response) {

    let dat = new Momentary(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [], '', '', '', '');
    let obj: Momentarydata = JSON.parse(JSON.stringify(res));

    for (const i of obj.datasets[0].phases) {

      for (const j of i.values) {
        if ((j.type === 'power') && (i.phase <= 3)) {
          dat.powerTotal = dat.powerTotal + j.data;
          dat['power' + i.phase] = j.data;
        } else if (i.phase <= 3) {
          dat[j.type + i.phase] = j.data;
        } else if ((j.type === 'current') && (i.phase === 4)) {
          dat['current' + i.phase] = j.data;
        }

        if ((j.type === 'voltage') && (i.phase <= 3)) {
          dat.maxGUIPower = dat.maxGUIPower + i.maxguicurrent * j.data;
        }
      }
      dat.maxGUICurrent[i.phase-1] = i.maxguicurrent;


    }
    return dat;
  }


  momentaryValues(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/all/all/now`).pipe(
      map(this.extractMomentaryData));
  }

}
