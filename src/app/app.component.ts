import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DataService } from './data.service';
import { Ballot, Show } from './data-types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'anipoint-web';
  ballot: Ballot = new Ballot();

  constructor(
    private dataService: DataService
  ) { }

  ngAfterViewInit(): void {
    this.addShow(1);
    this.addShow(129190);
    this.addShow(97709);
    this.addShow(116589);
    this.addShow(1575);
    console.log(this.ballot.shows);
  }

  addShow(id: number): void {
    if (!this.ballot.shows.some(show => show.id === id)) {
      this.dataService.getShowData(id).subscribe({
        next: (data) => {
          const show = new Show(data);
          this.ballot.shows.push(show);
        },
        error: (e) => console.log(e)
      });
    } else {
      console.log('Show already added'); // TODO: Pop up a warning
    }
  }

  removeShow(id: number): void {
    this.ballot.shows = this.ballot.shows.filter(show => show.id !== id);
  }

  getWarnings(show: Show): string[] {
    var warnings = [];
    if (show.warnings.episodeLength) warnings.push('Episodes are not standard length.');
    if (show.warnings.hasPrequel) warnings.push('Prequel listed, verify that the season is correct.');
    if (show.warnings.shortDescription) warnings.push('Description is short, you may need to add details.'); 
    if (show.warnings.missingFields.length) warnings.push('Show is missing the following fields: '.concat(show.warnings.missingFields.toString().replace(',', ', '), '.'));
    return warnings;
  }

  trackShows(index: number, show: Show) {
    return show ? show.id : undefined;
  }
}
