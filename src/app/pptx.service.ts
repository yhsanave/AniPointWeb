import { Injectable } from '@angular/core';
import pptxgen from 'pptxgenjs';
import { Ballot, Show } from './data-types';

@Injectable({
  providedIn: 'root'
})
export class PptxService {
  shadowProp: pptxgen.ShadowProps = { type: 'outer', angle: 45, blur: 3, offset: 3, opacity: .5 };

  exportPresentation(ballot: Ballot): Promise<string>{
    let pres = new pptxgen();
    pres.layout = 'LAYOUT_WIDE';
    pres.author = 'AniPoint';
    pres.title = ballot.title;
    pres.subject = 'Anime';

    this.createTitleSlide(ballot, pres);
    this.createBallotSlide(ballot, pres);
    ballot.shows.forEach(show => this.createShowSlide(show, pres));
    this.createBallotSlide(ballot, pres);

    return pres.writeFile({ fileName: ballot.number.toString().concat(' - ', ballot.title, '.pptx') });
  }

  createTitleSlide(ballot: Ballot, pres: pptxgen): void {
    let slide = pres.addSlide();

    slide.addText(ballot.title, { x: 1.67, y: 2.72, h: 1.2, w: 10, fontFace: 'Britannic Bold', fontSize: 66, align: 'center', shadow: { type: 'outer', angle: 45, blur: 3, offset: 3, opacity: .5 } });
    slide.addText(new Date(ballot.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'}).concat('\nMeeting #', ballot.number.toString()), { x: 1.67, y: 3.86, h: 1.2, w: 10, fontFace: 'Impact', fontSize: 32, align: 'center', shadow: { type: 'outer', angle: 45, blur: 3, offset: 3, opacity: .5 } });
    slide.addNotes(ballot.exportCode);
  }

  createBallotSlide(ballot: Ballot, pres: pptxgen): void {
    let slide = pres.addSlide();

    slide.addText('On the Ballot', { x: 4.68, y: .4, h: .84, w: 3.97, fontFace: 'Britannic Bold', fontSize: 44, align: 'center', shadow: { type: 'outer', angle: 45, blur: 3, offset: 3, opacity: .5 } });

    const leftBallot = ballot.shows.slice(0, ballot.shows.length / 2);
    const rightBallot = ballot.shows.slice(ballot.shows.length / 2, ballot.shows.length);

    let leftBallotText = '';
    let rightBallotText = '';

    leftBallot.forEach(show => leftBallotText = leftBallotText.concat(show.titles.english ?? show.titles.romaji, '\n'));
    rightBallot.forEach(show => rightBallotText = rightBallotText.concat(show.titles.english ?? show.titles.romaji, '\n'));

    slide.addText(leftBallotText, { x: .85, y: 1.8, h: 4.5, w: 5.5, fontFace: 'Impact', fontSize: 24, align: 'right', valign: 'top', shadow: { type: 'outer', angle: 45, blur: 3, offset: 3, opacity: .5 } });
    slide.addText(rightBallotText, { x: 7, y: 1.8, h: 4.5, w: 5.5, fontFace: 'Impact', fontSize: 24, align: 'left', valign: 'top', shadow: { type: 'outer', angle: 45, blur: 3, offset: 3, opacity: .5 } });
  }

  createShowSlide(show: Show, pres: pptxgen): void {
    let slide = pres.addSlide();

    slide.addText(show.titles.english ?? show.titles.romaji, { x: .34, y: .19, h: .8, w: 12.64, fontFace: 'Britannic Bold', fontSize: 44, align: 'left', valign: 'top', shadow: { type: 'outer', angle: 45, blur: 3, offset: 3, opacity: .5 } });
    slide.addText(show.titles.native, { x: .34, y: .82, h: .44, w: 6.95, fontFace: 'Yu Gothic', fontSize: 20, bold: true, align: 'left', valign: 'top' });
    slide.addText(show.description, { x: .34, y: 1.36, h: 5.87, w: 6.33, fontFace: 'Segoe UI Semibold', fontSize: 20, align: 'left', valign: 'top' });
    slide.addImage({ path: (show.gifPath ? show.gifPath : './assets/default.gif'), x: 7.6, y: 1.1, h: 2.75, w: 4.84, sizing: { type: 'contain', h: 2.75, w: 4.84 } });
    slide.addText(this.getInfoBoxText(show), { shape: pres.ShapeType.rect, fill: { color: 'ffffff', transparency: 50 }, line: { color: '000000', width: 3 }, x: 7.6, y: 4.57, h: 2.1, w: 4.84, fontFace: 'Segoe UI Semibold', fontSize: 20, align: 'left', valign: 'top' });
  }

  getInfoBoxText(show: Show): string {
    const episode = 'Episode: '.concat(show.episode, show.subbed ? show.dubbed ? ' (Sub/Dub)' : ' (Subbed)' : show.dubbed ? ' (Dubbed)' : ''); // Episode: 1 (Subbed)
    const premier = 'Premiered: '.concat(show.year ? ((show.season?.charAt(0).concat(show.season.slice(1).toLowerCase(), ' ') ?? '').concat(show.year.toString())) : 'Unknown'); // Premiered: Spring 2020
    const source = 'Source: '.concat(show.source ? show.source.trim().toLowerCase().replace('_', ' ').replace(/\w\S*/g, (w: string) => (w.replace(/^\w/, (c) => c.toUpperCase()))) : 'Unknown'); // Source: Original
    const studio = 'Studio: '.concat(show.studio ?? 'Unknown'); // Studio: Trigger
    const director = 'Director: '.concat(show.director ?? 'Unknown'); // Director: Kunihiko Ikuhara
    const genres = 'Genres: '.concat(show.genres.toString().replace(/,/g, ', ')); // Genres: Action, Adventure, Drama

    return episode.concat('\n', premier, '\n', source, '\n', studio, '\n', director, '\n', genres, '\n');
  }
}
