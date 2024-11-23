import { success } from '$lib/components/Toast/toast.js';
import { db } from '$lib/db/db';

export async function GET({ url, cookies }) {
    const eventId= url.searchParams.get('eventId') || '';
    const studentId = url.searchParams.get('studentId') || '';
    const sessionId = cookies.get('__Secure-authjs.session-token');

    const registration = await db.team.findFirst({
        where: {
            eventId: eventId,
            user: {
                some: { 
                    id: studentId,
                    sessions: {
                        some: {
                            sessionToken: sessionId
                        }
                    }
                },
            }
        },
        include: { user: true }
    })
    
    if (registration) {
        return new Response(JSON.stringify({ isExists: true, registration: registration }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ isExists: false }), { status: 200 });
    }
}

export async function POST({ request, cookies }) {
    const data = await request.json();
    const sessionId = cookies.get('__Secure-authjs.session-token');

    if (data.userCreate) {
        await db.user.update({
            where: { 
                id: data.userId,
                sessions: {
                    some: {
                        sessionToken: sessionId
                    }
                }
            },
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
        const teamCount = await db.team.count({ where: { eventId: data.eventId } });
        if(teamCount >= data.maxTeamCount) return new Response(JSON.stringify({ error: 'Max team limit reached' }), { status: 201 });
        const team = await db.team.create({
            data: {
                eventId: data.eventId,
                name: data.teamName,
                leaderId:data.userId,
                transactionId:data.transactionId,
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
        const teamCount = await db.team.count({ where: { eventId: data.eventId } });
        if(teamCount >= data.maxTeamCount) return new Response(JSON.stringify({ error: 'Max participant limit reached' }), { status: 201 });
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

export async function DELETE({request}){
    const data=await request.json()
    
    if(data.choice === 'remove' || data.choice === 'leave') {
        const deleteMember = await db.team.update({
            where: {
                id: data.teamId
            },
            data: {
                user: {
                    disconnect: { id: data.userId }
                }
            }
        })
        return new Response(JSON.stringify({ success: true, deleteMember, choice: data.choice }),{status:201})
    } else if(data.choice === 'delete') {
        const deleteTeam = await db.team.delete({
            where: {
                id: data.teamId
            }
        })
        return new Response(JSON.stringify({ success: true, deleteTeam, choice: data.choice }),{status:201})
    }
}

export async function PATCH({request}){
    const data=await request.json()

    const teamMemberCount = await db.user.count({ where: { Team: { some: { id: data.teamId } } } });

    if(teamMemberCount < data.minTeamSize) return new Response(JSON.stringify({ error: 'Team is not full' }), { status: 201 });

    const updateTeam = await db.team.update({
        where: {
            id: data.teamId,
        },
        data: {
            isConfirmed: true
        }
    })
    return new Response(JSON.stringify({ success: true, updateTeam }),{status:201})
}