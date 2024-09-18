export default interface EventData {
	id: string;
	title: string;
	image: string;
	date: Date;
	time: string | null;
	venue: string | null;
	description: string | null;
	guests: string[];
	reportLink: string | null;
}


