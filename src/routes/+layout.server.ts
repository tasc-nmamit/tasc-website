import { db } from "$lib/db/db";

export const load = async (event:any) => {
	const session = await event.locals.auth();
	let links: any;
	
	if(session)
		links = await db.links.findUnique({ where: { userId: session.user.id } });

	return {
		session,
		links
	};
};
