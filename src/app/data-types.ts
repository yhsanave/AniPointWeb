export class Ballot {
  title: string = '';
  number: number = 0;
  dateString: string = new Date().toISOString().split('T')[0].replace(/-/g, '/'); // Jank gimmick to fix the javascript Date issue (initializing with - vs /)
  shows: Show[] = [];

  get date(): string {
    return this.dateString;
  }

  set date(x: string) {
    this.dateString = x.replace(/-/g, '/')
  }

  get exportShows(): ExportShow[] {
    return this.shows.map(s => s.export);
  }

  set exportShows(x) {}

  get exportCode() {
    return JSON.stringify({
      title: this.title,
      number: this.number,
      date: this.date,
      shows: [],
      exportShows: this.exportShows
    });
  }
}

export class KeiBallot {
  body: string;
  footer: string;
  ballot: Ballot;

  constructor(ballot: Ballot, body?: string, footer?: string) {
    this.ballot = ballot;
    this.body = body ?? '';
    this.footer = footer ?? '';
  }

  get header(): string {
    return this.ballot.title.concat(' ', this.dateString)
  }

  get shows(): string[] {
    return this.ballot.shows.map(s => s.titles.english ?? s.titles.romaji);
  }

  get exportCode() {
    return JSON.stringify(this, ['header', 'body', 'shows', 'footer']);
  }

  get dateString() {
    let date = new Date(this.ballot.date);
    return [
      (date.getMonth() + 1).toString(),
      date.getDate().toString(),
      date.getFullYear().toString()
    ].join('/');
  }
}

export class Show {
  // List Data
  episode: string;
  subbed: boolean;
  dubbed: boolean;
  gifPath: string = '';
  warnings = {'hasPrequel': false, 'episodeLength': false, 'shortDescription': false, 'missingFields': ['']}
  
  // Show Data
  id: number;
  titles: any;
  description: string = '';
  season: string;
  year: number;
  studio: string;
  director: string;
  source: string;
  genres: string[];
  duration: number;
  prequels: any;
  siteUrl: string;
  coverImage: string;

  constructor(data: any, options?: any) {
    this.episode = options.episode ?? '1';
    this.subbed = options.subbed ?? true;
    this.dubbed = options.dubbed ?? false;
    this.gifPath = options.gifPath ?? '';

    data = data.data.Media;
    this.id = data.id;
    this.titles = data.title; // {english?: string, romaji?: string, native?: string}
    this.season = data.season ?? '';
    this.year = data.seasonYear ?? 0;
    this.studio = data.studios.nodes[0] ? data.studios.nodes[0].name : '';
    this.director = data.staff.edges.some((staff: { role: string; }) => staff.role.toUpperCase() === 'DIRECTOR') ? data.staff.edges.filter((staff: { role: string; }) => staff.role.toUpperCase() === 'DIRECTOR')[0].node.name.full : '';
    this.source = data.source ?? '';
    this.genres = data.genres.slice(0, 3) ?? [];
    this.duration = data.duration ?? 0;
    this.siteUrl = data.siteUrl;
    this.coverImage = data.coverImage.extraLarge ?? '';
    this.prequels = data.relations.edges.filter((r: { relationType: string; }) => r.relationType.toUpperCase() === 'PREQUEL');

    // Break the description up by paragraphs and add them back in until it is a good length
    let descParts = data.description.replace('<br>\n', '<br>').replace('<br><br>', '<br>').split('<br>');
    this.description = descParts.shift();
    while (this.description.length < 200 && descParts.length) {
        this.description = this.description.concat(' ', descParts.shift());
    }

    this.resolveWarnings();
  }

  resolveWarnings(): void {
    // If episode length is non-standard
    this.warnings.episodeLength = this.duration < 20 || this.duration > 30;
    // If show has a prequel listed
    this.warnings.hasPrequel = this.prequels.length;
    // If description is short
    this.warnings.shortDescription = this.description.length < 200;
    // Get a list of the missing fields
    this.warnings.missingFields = this.resolveMissingFields();
  }
  
  resolveMissingFields(): string[] {
    var missingFields: string[] = []
    if (!this.description) missingFields.push('Description');
    if (!this.director) missingFields.push('Director');
    if (!this.studio) missingFields.push('Studio');
    if (!this.season) missingFields.push('Season');
    if (!this.year) missingFields.push('Year');
    if (!this.source) missingFields.push('Source');
    if (!this.genres) missingFields.push('Genres');
    if (!this.duration) missingFields.push('Duration');
    return missingFields;
  }

  get export(): ExportShow {
    return { id: this.id, episode: this.episode, subbed: this.subbed, dubbed: this.dubbed, gifPath: this.gifPath } as ExportShow;
  }

  // setGif(event: any) {
  //   let reader = new FileReader();
  //   reader.readAsDataURL(event.target.files[0]);
  //   reader.addEventListener('load', () => {
  //     if (typeof reader.result === 'string') this.gif = reader.result.slice(5);
  //   });
  // }
}

export interface ExportShow {
  id: number;
  episode: string;
  subbed: boolean;
  dubbed: boolean;
  gifPath: string;
}