import { db } from '$lib/db/db';
import type PatentData from '$lib/types/PatentData';
import type { ServerLoad } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	let patents: PatentData[] = [];

	const patentSnapshot = await db.patents.findMany({
		include: { faculty: true, student: true },
		where: { year: params.year }
	});

	patentSnapshot.forEach((data) => {
		patents.push({
			title: data.title,
			faculty: data.faculty.map((f) => f.name),
			faculty_image: data.faculty.map((f) => [f.image]),
			student: data.student.map((f) => f.name),
			student_image: data.student.map((f) => [f.image]),
			certificate: data.certificate,
			authors: data.authors.map((f) => f),
			inventorsAddress: data.inventorsAddress.map((f) => f),
			inventorsName: data.inventorsName.map((f) => f)
		});
	});
	return { patents: patents };
}) satisfies ServerLoad;
