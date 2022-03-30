import { Component, OnInit, AfterViewInit, TemplateRef } from '@angular/core';
import { DataService } from './data.service';
import { Ballot, Show } from './data-types';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'anipoint-web';
  ballot: Ballot = new Ballot();
  searchResult?: any[];
  currentModal?: NgbModalRef;
  timeout: any = null;

  constructor(
    private dataService: DataService,
    private modalService: NgbModal
  ) { }

  ngAfterViewInit(): void {
    // this.addShow(1);
    // this.addShow(129190);
    // this.addShow(97709);
    // this.addShow(116589);
    // this.addShow(1575);
    // this.search('naruto');
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
    this.closeModal();
  }

  removeShow(id: number): void {
    this.ballot.shows = this.ballot.shows.filter(show => show.id !== id);
    this.closeModal();
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

  openModal(content: TemplateRef<any>, options?: any): void {
    options = options ?? { background: true };
    this.currentModal = this.modalService.open(content, options);
  }

  closeModal(): void {
    this.currentModal?.close();
  }

  search(query: string): void {
    this.dataService.getShows(query).subscribe({
      next: (data) => {
        this.searchResult = data.data.Page.media;
      },
      error: (e) => console.log(e)
    });
  }

  searchTimeout(event: any): void {
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(function () {
      if (event.keyCode != 13) {
        $this.search(event.target.value);
      }
    }, 500);
  }

  isDuplicateShow(id: number): boolean {
    return this.ballot.shows.some(s => s.id === id);
  }
}
