import { db } from "$lib/db/db";
import { ServerLoad } from "@sveltejs/kit";
import { user } from "$lib/auth/stores";

export const load = (async ({ params }) => {
    if(!user) {
        return { redirect: '/events/upcoming' };
    }

    const event = await db.event.findUnique({
        where: { id: params.eventId },
        include: { participants: true }
    })

    return { event: event };
}) satisfies ServerLoad;