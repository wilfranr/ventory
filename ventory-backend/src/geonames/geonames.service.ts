import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { AxiosResponse } from "axios";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class GeonamesService {
  private username: string;
  private baseUrl = "http://api.geonames.org/";

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.username = this.configService.get<string>("GEONAMES_USERNAME") ?? "";
    if (!this.username) {
      throw new Error(
        "GEONAMES_USERNAME no está configurado en las variables de entorno.",
      );
    }
  }

  getCountries(): Observable<any[]> {
    return this.httpService
      .get(`${this.baseUrl}countryInfoJSON?username=${this.username}`)
      .pipe(map((response: AxiosResponse) => response.data.geonames));
  }

  getDepartments(countryCode: string): Observable<any[]> {
    return this.httpService
      .get(
        `${this.baseUrl}childrenJSON?geonameId=${countryCode}&username=${this.username}`,
      )
      .pipe(map((response: AxiosResponse) => response.data.geonames));
  }

  getCities(departmentId: string): Observable<any[]> {
    return this.httpService
      .get(
        `${this.baseUrl}childrenJSON?geonameId=${departmentId}&username=${this.username}`,
      )
      .pipe(map((response: AxiosResponse) => response.data.geonames));
  }
}

