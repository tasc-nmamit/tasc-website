import { db } from '$lib/db/db';

export async function GET({ url, cookies }) {
	const username = url.searchParams.get('name') || null;
	const sessionId = cookies.get('__Secure-authjs.session-token')

	if (username === null) {
		return new Response(JSON.stringify({ isExists: true }), { status: 200 });
	} else {
		const user = await db.user.findFirst({
			where: {
				username: username,
				sessions: {
					some: {
						sessionToken: sessionId
					}
				}
			}
		});

		if (user) {
			return new Response(JSON.stringify({ isExists: true, user: user }), { status: 200 });
		} else {
			return new Response(JSON.stringify({ isExists: false }), { status: 200 });
		}
	}
}

export async function POST({ request, url, cookies }) {
	const data = await request.json();
	const id = url.searchParams.get('id');
	const sessionId = cookies.get('__Secure-authjs.session-token')

	if (id && data) {
		const dbData = await db.user.update({
			where: {
				id: id,
				sessions: {
					some: {
						sessionToken: sessionId
					}
				}
			},
			data: {
				displayName: data.displayName,
				username: data.username,
				usn: data.usn,
				phone: data.phone,
				bio: `Hello! I am ${data.displayName}.`
			}
		});

		return new Response(JSON.stringify({ message: 'done', user: dbData }), { status: 200 });
	} else {
		return new Response(JSON.stringify({ message: 'Not Done', data: null }), { status: 200 });
	}
}

export async function PATCH({ request, cookies }) {
	const sessionId = cookies.get('__Secure-authjs.session-token')
	const data = await request.json();
	const { id , ...updateData} = data

	const dbData = await db.user.update({
		where: {
			id: id,
			sessions: {
				some: {
					sessionToken: sessionId
				}
			}
		},
		data: {
			...updateData
		}
	});

	if (dbData) {
		const links = await db.links.findUnique({ where: { userId: id } });
		return new Response(JSON.stringify({ message: 'Done', data: { session: { user: dbData }, links: links } }), { status: 200 });
	}else{
		return new Response(JSON.stringify({ message: 'Not Done', data: null }), { status: 200 });
	}
}
