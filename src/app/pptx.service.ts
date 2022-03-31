import { Injectable } from '@angular/core';
import pptxgen from 'pptxgenjs';
import { Ballot, Show } from './data-types';

@Injectable({
  providedIn: 'root'
})
export class PptxService {
  titleMasterProps: pptxgen.SlideMasterProps = {
    title: 'Title',
    objects: [
      {
        placeholder: {
          options: { name: 'title', type: 'title', x: 1.67, y: 2.72, h: 1.2, w: 10 },
          text: 'Meeting Title Placeholder'
        }
      },
      {
        placeholder: {
          options: { name: 'subtitle', type: 'body', x: 1.67, y: 3.86, h: 1.2, w: 10 },
          text: 'Meeting Info Placeholder'
        }
      }
    ]
  };
  
  ballotMasterProps: pptxgen.SlideMasterProps = {
    title: 'Ballot',
    objects: [
      { text: { text: 'On the Ballot', options: { x: 4.68, y: .4, h: .84, w: 3.97 } } },
      {
        placeholder: {
          options: { name: 'leftBallot', type: 'body', x: .85, y: 1.8, h: 4.5, w: 5.5 },
          text: 'Left Ballot Placeholder'
        }
      },
      {
        placeholder: {
          options: { name: 'rightBallot', type: 'body', x: 7, y: 1.8, h: 4.5, w: 5.5 },
          text: 'Right Ballot Placeholder'
        }
      }
    ]
  }

  showMasterProps: pptxgen.SlideMasterProps = {
    title: 'Show',
    objects: [
      {
        placeholder: {
          options: { name: 'englishTitle', type: 'title', x: .34, y: .19, h: .8, w: 12.64 },
          text: 'English Title Placeholder'
        }
      },
      {
        placeholder: {
          options: { name: 'japaneseTitle', type: 'body', x: .34, y: .82, h: .44, w: 6.95 },
          text: 'Japanese Title Placeholder'
        }
      },
      {
        placeholder: {
          options: { name: 'description', type: 'body', x: .34, y: 1.36, h: 5.87, w: 6.33 },
          text: 'Description Placeholder'
        }
      },
      {
        placeholder: {
          options: { name: 'gif', type: 'pic', x: 7.6, y: 1.1, h: 2.75, w: 4.84 },
          text: 'GIF Placeholder'
        }
      },
      {
        placeholder: {
          options: { name: 'infoBox', type: 'body', x: 7.6, y: 4.57, h: 2.1, w: 4.84 },
          text: 'Info Box Placeholder'
        }
      }
    ]
  }

  public totalSlides: number = 3;
  public finishedSlides: number = 0;
  
  constructor() { }

  exportPresentation(ballot: Ballot): void{
    this.totalSlides = 3 + ballot.shows.length;
    this.finishedSlides = 0;

    let pres = new pptxgen();
    pres.layout = 'LAYOUT_WIDE';
    pres.author = 'AniPoint';

    pres.defineSlideMaster(this.titleMasterProps);
    pres.defineSlideMaster(this.ballotMasterProps);
    pres.defineSlideMaster(this.showMasterProps);

    this.createTitleSlide(ballot, pres);
    this.createBallotSlide(ballot, pres);
    ballot.shows.forEach(show => this.createShowSlide(show, pres));

    pres.writeFile({ fileName: ballot.number.toString().concat(' - ', ballot.title, '.pptx') });
  }

  createTitleSlide(ballot: Ballot, pres: pptxgen): void {
    let slide = pres.addSlide({masterName: 'Title'});

    slide.addText(ballot.title, { placeholder: 'title' });
    slide.addText(new Date(ballot.date).toDateString().concat('\nMeeting #', ballot.number.toString()), { placeholder: 'subtitle' });
    slide.addNotes(JSON.stringify(ballot));

    this.finishedSlides++;
  }

  createBallotSlide(ballot: Ballot, pres: pptxgen): void {
    let slide = pres.addSlide({ masterName: 'Ballot' });

    const leftBallot = ballot.shows.slice(0, ballot.shows.length / 2);
    const rightBallot = ballot.shows.slice(ballot.shows.length / 2, ballot.shows.length);

    let leftBallotText = '';
    let rightBallotText = '';

    leftBallot.forEach(show => leftBallotText = leftBallotText.concat(show.titles.english ?? show.titles.romaji, '\n'));
    rightBallot.forEach(show => rightBallotText = rightBallotText.concat(show.titles.english ?? show.titles.romaji, '\n'));

    slide.addText(leftBallotText, { placeholder: 'leftBallot' });
    slide.addText(rightBallotText, { placeholder: 'rightBallot' });
    
    this.finishedSlides++;
  }

  createShowSlide(show: Show, pres: pptxgen): void {
    let slide = pres.addSlide({ masterName: 'Show' });

    slide.addText(show.titles.english ?? show.titles.romaji, { placeholder: 'englishTitle' });
    slide.addText(show.titles.native, { placeholder: 'japaneseTitle' });
    slide.addText(show.description, { placeholder: 'description' });
    slide.addImage({ path: (show.gifPath), placeholder: 'gif' });
    slide.addText(this.getInfoBoxText(show), { placeholder: 'infoBox' });

    this.finishedSlides++;
  }

  getInfoBoxText(show: Show): string {
    const episode = 'Episode: '.concat(show.episode, show.subbed ? show.dubbed ? '(Sub/Dub)' : '(Subbed)' : show.dubbed ? '(Dubbed)' : ''); // Episode: 1 (Subbed)
    const premier = 'Premiered: '.concat(show.year ? ((show.season?.charAt(0).concat(show.season.slice(1).toLowerCase(), ' ') ?? '').concat(show.year.toString())) : 'Unknown'); // Premiered: Spring 2020
    const source = 'Source: '.concat(show.source ? show.source.trim().toLowerCase().replace('_', ' ').replace(/\w\S*/g, (w: string) => (w.replace(/^\w/, (c) => c.toUpperCase()))) : 'Unknown'); // Source: Original
    const studio = 'Studio: '.concat(show.studio ?? 'Unknown'); // Studio: Trigger
    const director = 'Director: '.concat(show.director ?? 'Unknown'); // Director: Kunihiko Ikuhara
    const genres = 'Genres: '.concat(show.genres.toString().replace(/,/g, ', ')); // Genres: Action, Adventure, Drama

    return episode.concat('\n', premier, '\n', source, '\n', studio, '\n', director, '\n', genres, '\n');
  }
}
