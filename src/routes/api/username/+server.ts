import { db } from '$lib/db/db';

const allowedOrigins = ["https://tascnmamit.in", "http://localhost:5173"];

export async function GET({ url, cookies, request }) {
	const username = url.searchParams.get('name') || null;
	const sessionId = cookies.get('__Secure-authjs.session-token')
	const origin = request.headers.get('origin') ?? '';

	if (!sessionId) {
		return new Response(JSON.stringify({ error: 'Unauthorized: No session token provided' }), { status: 401 });
	}

	if (!allowedOrigins.includes(origin)) {
		return new Response(JSON.stringify({ error: 'Invalid origin' }), { status: 403 });
	}

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
	const origin = request.headers.get('origin') ?? '';
	const sessionId = cookies.get('__Secure-authjs.session-token')

	if (!sessionId) {
		return new Response(JSON.stringify({ error: 'Unauthorized: No session token provided' }), { status: 401 });
	}

	if (!allowedOrigins.includes(origin)) {
		return new Response(JSON.stringify({ error: 'Invalid origin' }), { status: 403 });
	}

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
	const origin = request.headers.get('origin') ?? '';
	const { id , ...updateData} = data

	if (!sessionId) {
		return new Response(JSON.stringify({ error: 'Unauthorized: No session token provided' }), { status: 401 });
	}

	if (!allowedOrigins.includes(origin)) {
		return new Response(JSON.stringify({ error: 'Invalid origin' }), { status: 403 });
	}

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
