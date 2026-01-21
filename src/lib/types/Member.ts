export interface Member {
  id: string;
  name: string;
  post: string;
  image: string;
  year: string;
  quote?: string | null;
  instagram?: string;
  linkedin?: string;
  github?: string;
  order?: number;
}
