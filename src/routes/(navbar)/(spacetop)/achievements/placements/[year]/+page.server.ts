import { db } from '$lib/db/db';
import type { ServerLoad } from "@sveltejs/kit"

export const load = (async ({ params }) => {

	// const placement = await db.year.findFirst({
	// 	where: {
	// 		year: params.year,
	// 	},
	// 	include: {
	// 		placements: {
	// 			include: {
	// 				student: {
	// 					select: { id: true, name: true }
	// 				},
	// 				offers: {
	// 					include: {
	// 						company: { select: { companyName: true } }
	// 					},
	// 				}
	// 			}
	// 		},
	// 		companies: { select: { companyName: true } }
	// 	}
	// })

	// console.log(placement);

	const placement = await db.year.findFirst({
		where: { year: params.year },
		include: {
			placements: {
				include: {
					student: {
						include: { name: true }
					},
					offers: {
						include: {
							company: true,
						}
					},
				}
			}
		}
	});

	let placements: Record<string, any[]> = {};

	placement?.placements.forEach(p => {
		p.offers.forEach(o => {
			const companyName = o.company.companyName;

			if (!placements[companyName])
				placements[companyName] = [];

			placements[companyName].push({
				studentId: p.student.id,
				studentName: p.student.name.displayName,
				studentImage: p.student.image,
				studentPackage: o.package
			});
		})
	})

	return {
		companies: placement?.companies,
		placements: placements
	}
}) satisfies ServerLoad;


