import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private http: HttpClient
  ) { }

  public getShowData(id: number): Observable<any> {
    let query = `query ($id: Int) {
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
          }
        }
        siteUrl
        coverImage {
          extraLarge
        }
      }
    }`;
    
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }
    
    let variables = {
      id: id
    };

    let body = JSON.stringify({
      query: query,
      variables: variables
    });

    return this.http.post('https://graphql.anilist.co', body, options);
  }

  public searchShows(search: string): Observable<any> {
    let query = `query ($search: String) {
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

    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }

    let variables = {
      search: search
    };

    let body = JSON.stringify({
      query: query,
      variables: variables
    });

    return this.http.post('https://graphql.anilist.co', body, options);
  }
}
