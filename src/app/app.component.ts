import { Component, OnInit, AfterViewInit, TemplateRef } from '@angular/core';
import { DataService } from './data.service';
import { Ballot, ExportShow, KeiBallot, Show } from './data-types';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PptxService } from './pptx.service';
import { ToastService } from './toasts.service';

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
  toImport: string = '';
  isExporting: boolean = false;
  keiBallot: KeiBallot = new KeiBallot(this.ballot);

  get importCode() {  
    return this.ballot.exportCode;
  }

  set importCode(data: string) {
    try {
      this.ballot = Object.assign(this.ballot, JSON.parse(data));
      try {
        this.importShows(JSON.parse(data).exportShows);
      } catch {
        this.toastService.show('Failed to add imported shows', { classname: 'bg-danger text-light' });
      }
      this.toastService.show('Imported successfully', { classname: 'bg-success text-light' });
    } catch {
      this.toastService.show('Invalid import code', { classname: 'bg-danger text-light' });
    }
  }

  constructor(
    private dataService: DataService,
    private modalService: NgbModal,
    private pptxService: PptxService,
    private toastService: ToastService
  ) { }

  addShow(id: number, importParams?: any): void {
    if (!this.ballot.shows.some(show => show.id === id)) {
      this.dataService.getShowData(id).subscribe({
        next: (data) => {
          const show = new Show(data, importParams ?? {});
          this.ballot.shows.push(show);
          this.toastService.show('Added '.concat(show.titles.english ?? show.titles.romaji, ' successfully'), { classname: 'bg-success text-light' });
        },
        error: () => this.toastService.show('Failed to get show data', {classname: 'bg-danger text-light'})
      });
    } else {
      this.toastService.show('Show already added', {classname: 'bg-danger text-light'});
    }
    this.closeModal();
  }

  removeShow(id: number): void {
    this.ballot.shows = this.ballot.shows.filter(show => show.id !== id);
    this.closeModal();
  }

  importShows(exportShows: ExportShow[]): void {
    exportShows.forEach(s => this.addShow(s.id, s));
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
    this.dataService.searchShows(query).subscribe({
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
      $this.search(event.target.value);
    }, 500);
  }

  isDuplicateShow(id: number): boolean {
    return this.ballot.shows.some(s => s.id === id);
  }

  export(): void {
    this.isExporting = true;
    this.pptxService.exportPresentation(this.ballot).then(() => this.isExporting = false);
  }

  importBallot(): void {
    this.importCode = this.toImport;
    this.toImport = '';
    this.closeModal();
  }

  showKeiBallotModal(template: TemplateRef<any>, options?: any): void {
    this.keiBallot.ballot = this.ballot;
    this.openModal(template, options ?? {});
  }
}
