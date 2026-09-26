export interface Event {
  id: string;
  slug?: string | null;
  title: string;
  image: string;
  date: Date;
  endDate?: Date | null;
  time?: string | null;
  type?: string | null;
  venue?: string | null;
  description?: string | null;
  brief?: string | null;
  minTeamSize?: number | null;
  maxTeamSize?: number | null;
  maxTeamCount?: number | null;
  guests?: string[];
  reportLink?: string | null;
  status?: string;
  published?: boolean;
  registrationsAvailable?: boolean;
  registrationStartTime?: Date | null;
}
