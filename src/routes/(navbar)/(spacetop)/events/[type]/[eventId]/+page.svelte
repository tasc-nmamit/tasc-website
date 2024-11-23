<script lang="ts">
	import { page } from '$app/stores';
	import { exclaim, failure, success } from '$lib/components/Toast/toast';
	import { onMount } from 'svelte';
	import { MapPin, CalendarCheck2, Ticket, Crown } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { marked } from 'marked';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';

	export let data: any;

	const event = data.event;
	const userId = data.session?.user?.id;
	const team = data.teams ?? null;
	const teamMembers = team?.user ?? null;
	const leaderId = team?.leaderId ?? null;
	let isLeader = false;

	onMount(async () => {
		if (leaderId == userId) {
			isLeader = true;
		}
	});

	function formatDate(startDateString: Date, endDateString: Date | null | undefined) {
		if(endDateString) {
			const startDate = new Date(startDateString);
			const endDate = new Date(endDateString);

			return `${startDate.toLocaleDateString('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric'
			})} -<br/> ${endDate.toLocaleDateString('en-US', {
				weekday: 'short',
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			})}`;
		}else {
			const startDate = new Date(startDateString);

			return startDate.toLocaleDateString('en-US', {
				weekday: 'short',
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				exclaim('Copied to clipboard');
			})
			.catch((err) => {
				console.error('Failed to copy: ', err);
			});
	}
	const deleteTeamMember = async (choice: string, id?: string) => {
		const response = await fetch('/api/eventRegistration', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				teamId: team.id,
				userId: id ?? null,
				choice: choice
			})
		});
		const res = await response.json();
		if (res.success) {
			if (res.choice === 'leave')
				exclaim('You have left the team');
			else if (res.choice === 'remove')
				exclaim('Member removed successfully');
			else if (res.choice === 'delete')
				exclaim('Team deleted successfully');
			window.location.reload();
		}
	};

	const confirmTeam = async () => {
		const response = await fetch('/api/eventRegistration', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				teamId: team.id,
				minTeamSize: event.minTeamSize
			})
		});
		const res = await response.json();
		if (res.success) {
			success('Team confirmed successfully');
			window.location.reload();
		} else {
			exclaim(res.error);
			failure('Failed to confirm team');
		}
	};
</script>

<!-- And in the upcoming page or the event slug page, the team members display, team leader highlight delete members, leave button etc -->

<div class="grid-cols-9 p-3 sm:p-10 lg:grid">
	<div class="custom-padding col-span-4 h-full p-10 lg:p-16 place-content-center flex backdrop-blur-sm">
		<img src={event.image} alt="" class="h-full rounded-xl object-contain " />
	</div>
	<div class="col-span-5 lg:pt-10 lg:pr-10 backdrop-blur-sm">
		<p class="text-6xl font-bold max-lg:text-center max-sm:text-4xl">{event.title}</p>

		<br />
		<div class="flex flex-col justify-center lg:justify-evenly gap-2 px-8 sm:flex-row sm:p-0 md:flex-row">
			{#if event.venue}
				<div class={`event-details-light event-details-dark backdrop-blur-[3px] flex ${event.entryFee ? 'basis-1/3' : 'basis-2/5'} flex-nowrap items-center justify-evenly gap-4 rounded-lg border-2 border-slate-500 p-2 py-4 text-xl font-semibold transition-all duration-500`}>
					<MapPin class="dark:stroke-red-700 stroke-red-500" size="30" />
					<p class="text-center">{event.venue}</p>
				</div>
			{/if}

			{#if event.entryFee}
				<div class="event-details-light event-details-dark flex backdrop-blur-[3px] basis-1/3 flex-nowrap items-center justify-evenly gap-4 rounded-lg border-2 border-slate-500 p-2 py-4 text-xl font-semibold transition-all duration-500">
					<Ticket class="dark:stroke-green-700 stroke-green-400" size="30" />
					<p class="text-center">{event.entryFee}</p>
				</div>
			{/if}

			{#if event.date}
				<div class={`event-details-light event-details-dark backdrop-blur-[3px] flex ${event.entryFee ? 'basis-1/3' : 'basis-2/5'} flex-nowrap items-center justify-evenly gap-4 rounded-lg border-2 border-slate-500 p-2 py-4 text-xl font-semibold transition-all duration-500`}>
					<CalendarCheck2 class="dark:stroke-blue-700 stroke-blue-500" size="30" />
					<div>
						<p>{@html marked(formatDate(event.date, event.endDate))}</p>
						<p>{event.time}</p>
					</div>
				</div>
			{/if}
		</div>

		<br />

		<div class="w-full p-4 lg:max-h-[25rem] lg:overflow-y-auto text-xl description-text">
			{@html marked(event.description)}
		</div>
		<br />
		
		{#if $page.data.event.registrationsAvailable === true}
		<div class="lg:mt-10 flex justify-around">
			{#if team && event.type === 'TEAM'}
				<Dialog.Root>
					<Dialog.Trigger>
						<div class="rounded-xl bg-brand px-5 py-3 text-2xl text-white duration-200 hover:scale-110 max-sm:text-xl self-center">Team Details</div>
					</Dialog.Trigger>
					<Dialog.Content class="max-w-[80%]">
						<div class={`h-5 w-5 ${team.isConfirmed ? 'bg-green-600' : 'bg-red-600'} absolute rounded-full top-4 left-4`}></div>
						<Dialog.Title class="text-3xl text-center text-bold">Team Details</Dialog.Title>
						<div class="lg:grid lg:grid-cols-9">
							<div class="col-span-4 lg:border-r-4 sm:p-5 justify-evenly flex flex-col w-full">
								<div class="w-full">
									<p class="sm:text-2xl text-xl font-semibold">Team Name</p>
									<p class="sm:text-2xl text-xl ">{team.name}</p>
								</div>
								<br />
								<div class="w-full">
									<p class="sm:text-2xl text-xl font-semibold">Team ID</p>
									<div class="sm:text-2xl text-xl flex justify-between">
										<p>{team.id}</p>
										<button on:click={() => copyToClipboard(team.id)}
											><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" class=" stroke-black"><path fill="white" d="M15.24 2h-3.894c-1.764 0-3.162 0-4.255.148c-1.126.152-2.037.472-2.755 1.193c-.719.721-1.038 1.636-1.189 2.766C3 7.205 3 8.608 3 10.379v5.838c0 1.508.92 2.8 2.227 3.342c-.067-.91-.067-2.185-.067-3.247v-5.01c0-1.281 0-2.386.118-3.27c.127-.948.413-1.856 1.147-2.593s1.639-1.024 2.583-1.152c.88-.118 1.98-.118 3.257-.118h3.07c1.276 0 2.374 0 3.255.118A3.6 3.6 0 0 0 15.24 2" /><path fill="white" d="M6.6 11.397c0-2.726 0-4.089.844-4.936c.843-.847 2.2-.847 4.916-.847h2.88c2.715 0 4.073 0 4.917.847S21 8.671 21 11.397v4.82c0 2.726 0 4.089-.843 4.936c-.844.847-2.202.847-4.917.847h-2.88c-2.715 0-4.073 0-4.916-.847c-.844-.847-.844-2.21-.844-4.936z" /></svg></button
										>
									</div>
								</div>
								<br />
							</div>
							<div class="col-span-5 sm:p-5 w-full">
								<p class="sm:text-2xl text-xl font-semibold pb-5">Team Members</p>
								<div class="grid grid-cols-5 pb-2">
									<img src={teamMembers.find(member => member.id === leaderId)?.image} alt="profile-img" class="my-auto sm:h-12 h-9 sm:w-12 w-9 rounded-full col-span-1 justify-self-center" />
									<p class="col-span-3 sm:text-xl text-lg self-center">{teamMembers.find(member => member.id === leaderId)?.displayName}</p>
									<Crown class="stroke-yellow-500 self-center justify-self-center" size="40" />
								</div>
								{#each teamMembers as member}
									{#if member.id !== leaderId}
										<div class="grid grid-cols-5 pb-2 w-full">
											<img src={member.image} alt="profile-img" class="my-auto sm:h-12 h-9 sm:w-12 w-9 rounded-full col-span-1 justify-self-center" />
											<p class="col-span-3 sm:text-xl text-lg self-center">{member.displayName}</p>
											{#if !team.isConfirmed && isLeader}
												<Button class="bg-red-600 text-white sm:text-lg text-sm hover:text-black" on:click={() => deleteTeamMember('remove', member?.id)}>Remove</Button>
											{/if}
										</div>
									{/if}
								{/each}
							</div>
						</div>
						{#if !team.isConfirmed && isLeader}
							<div class="flex justify-evenly w-full py-5">
								<Button class="bg-red-500 text-white sm:text-xl text-md sm:w-[20%] hover:text-black" on:click={() => deleteTeamMember('delete')}>Leave team</Button>
								<Button class="bg-green-500 text-white sm:text-xl text-md sm:w-[20%] hover:text-black" on:click={() => confirmTeam()}>Confirm team</Button>
							</div>
						{/if}
						{#if !team.isConfirmed && !isLeader}
							<div class="flex justify-evenly w-full py-5">
								<Button class="bg-red-500 text-white sm:text-lg text-sm sm:w-[20%] hover:text-black" on:click={() => deleteTeamMember('leave', userId)}>Leave team</Button>
							</div>
						{/if}
					</Dialog.Content>
				</Dialog.Root>
			{:else if team && event.type === 'SOLO'}
				<p class="text-center lg:text-2xl md:text-xl text-lg dark:text-green-400 text-green-600">You have already registered for the event</p>
			{:else}
				<button class="rounded-xl bg-brand px-5 py-3 text-2xl text-white duration-200 hover:scale-110 max-sm:text-xl" on:click={() => goto(`/events/upcoming/${event.id}/register`)}> Register Now </button>
			{/if}
		</div>
		{/if}
	</div>
</div>

<style>
	.custom-padding {
		@media (min-width: 1024px) and (max-width: 1350px) {
			padding-top: 120px;
			padding-bottom: 120px;
			padding-left: 30px;
			padding-right: 30px;
		}
	}

	.event-details-light {
		@apply bg-slate-200 bg-opacity-50;
	}

	.event-details-light:hover {
		@apply bg-opacity-100 bg-slate-400 text-white scale-105;
	}

	.event-details-dark:is(.dark *) {
		@apply bg-slate-700 bg-opacity-50;
	}

	.event-details-dark:hover:is(.dark *) {
		@apply bg-slate-200 bg-opacity-100 text-black scale-105;
	}
</style>
