import { db } from "$lib/db/db";

export const load = async ({ params }) => {
    const { year } = params;
    const faculties = await db.faculty.findMany({
        include: {
            publications: {
                where: { year: parseInt(year) },
                orderBy: { publish_date: "desc" },
                select: {
                    id: true,
                    title: true,
                    authors: true,
                    journal: true,
                    conference: true,
                    publish_date: true,
                    publisher: true,
                    link: true,
                    ranking : true,
                    impact_factor: true,
                    indexed : true,
                    publisher_conference : true,
                }
            }
        }
    });
    // console.log(faculties[0].publications);
    return { body: { faculties } };
};