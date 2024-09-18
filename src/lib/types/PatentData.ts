export default interface PatentCardType {
	id: string;
	patentId: string;
	year: string;
	faculty: [];
	faculty_image: [];
	title: string;
	authors: [];
	student: [];
	student_name: [];
	student_image: [];
	inventorsName: [];
	inventorsAddress: [];
	certificate: string | null;
}
