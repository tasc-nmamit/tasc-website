export interface Publication {
    name: string;
    designation: string;
    authors: string[];
    title: string;
    month_year: string;
    ranking: string;
    impact_factor: string;
    publisher: string;
    indexed: string;
    publisher_conference: string;
    journal: string;
    conference: string;
    link: string;
}

export interface PublicationDetails {
    year: string;
    publications: Publication[];
}

export interface Placement {
    id: string;
    name: string;
    offers: { company: string, package: string }[];
}

export interface PlacementOffer {
    company: string;
    package: string;
}

export interface PlacementDetails {
    year: string;
    placements: Placement[];
}

export interface Patent_backup {
    id: string;
    faculty: string[];
    students?: string[];
    authors?: string[];
    inventors?: { address: string, names: string[] }[];
    title: string;
}

export interface Patent {
    id:string;
    patentId: string;
    year:string;
    faculty: string[];
    students?: string[];
    authors?: string[];
    inventors?: { address: string, names: string[] }[];
    title: string;
    certificate:string;
}

export interface PatentDetails {
    year: string;
    patents: Patent[];
}