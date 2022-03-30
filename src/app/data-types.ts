export class Ballot {
  title: string = "";
  number: number = 0;
  date: Date = new Date;
  shows: Show[] = [];
}

export class Show {
  // List Data
  episode: string = "1";
  subbed: boolean = true;
  dubbed: boolean = false;
  gif?: File;
  warnings = {'hasPrequel': false, 'episodeLength': false, 'shortDescription': false, 'missingFields': ['']}
  
  // Show Data
  id?: number;
  titles: any;
  description: string;
  season: string;
  year: number;
  studio: string;
  director: string;
  source: string;
  genres: string[];
  duration: number;
  relations: any;
  siteUrl: string;
  coverImage: string;
  color: string;

  constructor(data: any) {
    data = data.data.Media;
    this.id = data.id;
    this.titles = data.title; // {english: string, romaji: string, native: string}
    this.description = data.description ?? '';
    this.season = data.season ?? '';
    this.year = data.seasonYear ?? 0;
    this.studio = data.studios.nodes[0] ? data.studios.nodes[0].name : '';
    this.director = data.staff.edges.some((staff: { role: string; }) => staff.role.toUpperCase() === 'DIRECTOR') ? data.staff.edges.filter((staff: { role: string; }) => staff.role.toUpperCase() === 'DIRECTOR')[0].node.name.full : '';
    this.source = data.source ?? '';
    this.genres = data.genres.slice(0, 3) ?? [];
    this.duration = data.duration ?? 0;
    this.siteUrl = data.siteUrl;
    this.coverImage = data.coverImage.extraLarge ?? '';
    this.color = data.coverImage.color ?? '';
    this.relations = data.relations.edges;
    
    this.resolveWarnings();
  }

  resolveWarnings(): void {
    // If episode length is non-standard
    this.warnings.episodeLength = this.duration < 20 || this.duration > 30;
    // If show has a prequel listed
    this.warnings.hasPrequel = this.relations.some((r: { relationType: string; }) => r.relationType.toUpperCase() === 'PREQUEL');
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
}
