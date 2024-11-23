// import { db } from '$lib/firebase/firebase';
// import { collection, getDocs } from 'firebase/firestore';
import { db } from '$lib/db/db';
import type EventData from '$lib/types/EventData';
import { ServerLoad } from '@sveltejs/kit';
import { EventCategory } from '@prisma/client';

// @ts-ignore
export const load = (async ({ params }) => {
	const eventSnapshot = await db.event.groupBy({
		by: ['id', 'title', 'description','brief', 'date', 'endDate', 'time', 'image', 'reportLink', 'venue', 'category', 'type', 'guests', 'maxTeamSize', 'minTeamSize', 'maxTeams'],
		orderBy: { date: params.type === 'upcoming' ? 'asc' : 'desc' },
		where: { published: true, category: params.type?.toUpperCase() as EventCategory }
	})
	
	const events: EventData[] = [];

	eventSnapshot.forEach(event => {
		events.push({
			id: event.id,
			title: event.title,
			image: event.image,
			date: event.date,
			endDate: event.endDate,
			time: event.time,
			venue: event.venue,
			description: event.description,
			minTeamSize: event.minTeamSize,
			maxTeamSize: event.maxTeamSize,
			maxTeamCount: event.maxTeams,
			type: event.type,
			brief:event.brief,
			guests: event.guests,
			reportLink: event.reportLink
		});
	});
	return { events: events };
}) satisfies ServerLoad;
