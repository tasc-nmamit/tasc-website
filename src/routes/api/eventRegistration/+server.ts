import { db } from '$lib/db/db';

export async function GET({ url }) {
    const eventId= url.searchParams.get('eventId') || '';
    const studentId = url.searchParams.get('studentId') || '';

    const registration = await db.team.findFirst({
        where: {
            eventId: eventId,
            user: {
                some: { id: studentId }
            }
        }
    })
    
    if (registration) {
        return new Response(JSON.stringify({ isExists: true, registration: registration }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ isExists: false }), { status: 200 });
    }
}

export async function POST({ request }) {
    const data = await request.json();

    if (data.userCreate) {
        const user = await db.user.update({
            where: { id: data.userId },
            data: {
                displayName: data.userName,
                phone: data.userPhone,
                usn: data.userUsn,
                username: data.userUsername,
                bio: `Hello! I'm ${data.userName}`,
            } 
        })
    }

    if(data.team === 'create'){
        const team = await db.team.create({
            data: {
                eventId: data.eventId,
                name: data.teamName,
                user: {
                    connect: { id: data.userId }
                }
            }
        });
        return new Response(JSON.stringify({ created: true, team, userCreate: data.userCreate }), { status: 201 });
    }else if(data.team === 'join'){
        const userCount = await db.user.count({
            where: {
                Team: { some: { id: data.teamId }}
            }
        })
        if(userCount < data.maxTeamSize){
            const team = await db.team.update({
                where: { id: data.teamId },
                data: {
                    user: { connect: { id: data.userId }}
                }
            })
            return new Response(JSON.stringify({ joined: true, team, userCreate: data.userCreate }), { status: 201 });
        }
        return new Response(JSON.stringify({ error: 'Team is full' }), { status: 201 });
    }else {
        const team = await db.team.create({
            data: {
                eventId: data.eventId,
                user: {
                    connect: { id: data.userId }
                }
            }
        })
        return new Response(JSON.stringify({ success: true, team, userCreate: data.userCreate }), { status: 201 });
    }
}