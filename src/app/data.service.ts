import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Show } from './data-types';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private http: HttpClient
  ) { }

  public getShowData(id: number): Observable<any> {
    var query = `query ($id: Int){
      Media(type: ANIME, id: $id) {
          id
          title {
              english
              romaji
              native
          }
          description(asHtml: false)
          season
          seasonYear
          studios(isMain: true) {
              nodes {
                  name
              }
          }
          staff {
              edges {
                  role
                  node {
                      name {
                          full
                      }
                  }
              }
          }
          source
          genres
          duration
          relations {
          edges {
              relationType
              node {
                  id
                  title {
                      english
                  }
              }
          }
      }
      siteUrl
      coverImage{
          extraLarge
          color
      }
  }
  }`;
    
    var options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }
    
    var variables = {
      id: id
    };

    var body = JSON.stringify({
      query: query,
      variables: variables
    });

    return this.http.post('https://graphql.anilist.co', body, options);
  }

  public getShows(search: string): Observable<any> {
    var query = `query ($search: String) {
          Page(page: 1, perPage: 5) {
              media(type: ANIME, search: $search) {
              id
              title {
                  english
                  romaji
              }
              seasonYear
              coverImage {
                  large
              }
              siteUrl
          }
      }
    }`;

    var options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }

    var variables = {
      search: search
    };

    var body = JSON.stringify({
      query: query,
      variables: variables
    });

    return this.http.post('https://graphql.anilist.co', body, options);
  }
}
