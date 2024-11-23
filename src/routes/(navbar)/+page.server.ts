import { db } from '$lib/db/db';
import type { PageServerLoad } from './$types';

export const ssr = true;

export const load = (async () => {
	const upcoming = await db.event.findFirst({
        where: { category: 'UPCOMING', published: true },
    })

    console.log(upcoming);
	return {
		upcoming: upcoming
	};
}) satisfies PageServerLoad;
