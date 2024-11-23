<script lang="ts">
	import { goto } from '$app/navigation';
	import { user } from '$lib/auth/stores';
	import { Crown } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { exclaim, failure, success } from '$lib/components/Toast/toast';
	import Button from '../ui/button/button.svelte';
	import VectorEvent from '$lib/components/VectorBackground/vectorevent.svelte';

	export let event: any;
	export let eventType: string;

	let registered: boolean = false;
	let team: any;
	let teamMembers: any;

	onMount(async () => {
		if (eventType === 'upcoming' && $user) {
			const response = await fetch(`/api/eventRegistration?eventId=${event.id}&studentId=${$user.id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			team = data.registration;
			teamMembers = data.registration.user

			registered = data.isExists;
		}
	});

	function formatDate(startDateString: Date, endDateString: Date | null | undefined) {
		if(endDateString) {
			const startDate = new Date(startDateString);
			const endDate = new Date(endDateString);

			return `${startDate.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric'
			})} - ${endDate.toLocaleDateString('en-US', {
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

{#if eventType === 'upcoming'}
	<div class="flex h-full w-full flex-col relative backdrop-blur-xl dark:border border-purple-950 rounded-xl">
		<VectorEvent />
		<div class="dark:custom-shadow-black bg-muted-light dark:bg-muted-dark m-auto w-full rounded-2xl bg-opacity-10 dark:bg-opacity-30 px-5 py-6 shadow-xl dark:drop-shadow-md md:grid grid-cols-5">
			<div class="self-center col-span-2">
				{#if event.image}
					<img src={event?.image} alt={event.title} class="" />
				{/if}
			</div>
			<div class="w-full sm:px-10 h-[80%] col-span-3 flex-wrap">
				<h1 class="mb-5 text-center lg:text-5xl md:text-4xl text-3xl font-bold text-brand dark:text-purple-600">{event.title}</h1>
				<div class="m-auto lg:text-2xl md:text-xl bg-card dark:bg-opacity-50 bg-opacity-70 rounded-xl md:p-5 p-2 h-full justify-around grid lg:w-[90%] gap-y-4 backdrop-blur-lg">
					<p class="lg:text-2xl md:text-xl text-lg text-center">{event.brief}</p>
					<div class="w-full grid justify-around lg:text-2xl md:text-xl text-lg">
						{#if event.date}
							<div class="grid grid-cols-5">
								<p>Date</p>
								<p class="text-center">:</p>
								<p class="col-span-3">{formatDate(event.date, event.endDate)}</p>
							</div>
						{/if}
						{#if event.time}
							<div class="grid grid-cols-5">
								<p>Time</p>
								<p class="text-center">:</p>
								<p class="col-span-3">{event.time}</p>
							</div>
						{/if}
						{#if event.venue}
							<div class="grid grid-cols-5">
								<p>Venue</p>
								<p class="text-center">:</p>
								<p class="col-span-3">{event?.venue}</p>
							</div>
						{/if}
					</div>
					<div class={`${(registered && event.type === 'SOLO' ? 'flex-col' : '')} justify-evenly space-x-2 flex w-full`}>
						<button class={`rounded-lg bg-brand px-3 py-2 lg:text-2xl md:text-xl sm:text-lg text-md text-white duration-200 hover:scale-110 ${(registered && event.type === 'SOLO' ? 'self-center' : 'self-end')}`} on:click={()=>goto(`/events/upcoming/${event.id}`)}>View Details</button>
						{#if registered}
							{#if event.type === 'TEAM' && team}
								<Dialog.Root>
									<Dialog.Trigger class="self-end">
										<button class="rounded-lg bg-brand px-3 py-2 lg:text-2xl md:text-xl sm:text-lg text-md text-white duration-200 hover:scale-110 self-end">Team Details</button>
									</Dialog.Trigger>
									<Dialog.Content class="max-w-[80%]">
										<div class={`h-5 w-5 ${team.isConfirmed ? 'bg-green-600' : 'bg-red-600'} absolute rounded-full top-4 left-4`}></div>
										<Dialog.Title class="text-center text-3xl text-bold">Team Details</Dialog.Title>
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
													<img src={teamMembers.find(member => member.id === team.leaderId)?.image} alt="profile-img" class="my-auto sm:h-12 h-9 sm:w-12 w-9 rounded-full col-span-1 justify-self-center" />
													<p class="col-span-3 sm:text-xl text-lg self-center">{teamMembers.find(member => member.id === team.leaderId)?.displayName}</p>
													<Crown class="stroke-yellow-500 self-center justify-self-center" size="40" />
												</div>
												{#each teamMembers as member}
													{#if member.id !== team.leaderId}
														<div class="grid grid-cols-5 pb-2 w-full">
															<img src={member.image} alt="profile-img" class="my-auto sm:h-12 h-9 sm:w-12 w-9 rounded-full col-span-1 justify-self-center" />
															<p class="col-span-3 sm:text-xl text-lg self-center">{member.displayName}</p>
															{#if !team.isConfirmed && $user?.id === team.leaderId}
																<Button class="bg-red-600 text-white sm:text-lg text-sm hover:text-black" on:click={() => deleteTeamMember('remove', member?.id)}>Remove</Button>
															{/if}
														</div>
													{/if}
												{/each}
											</div>
										</div>
										{#if !team.isConfirmed && $user?.id === team.leaderId}
											<div class="flex justify-evenly w-full py-5">
												<Button class="bg-red-500 text-white sm:text-xl text-md sm:w-[20%] hover:text-black" on:click={() => deleteTeamMember('delete')}>Leave team</Button>
												<Button class="bg-green-500 text-white sm:text-xl text-md sm:w-[20%] hover:text-black" on:click={() => confirmTeam()}>Confirm team</Button>
											</div>
										{/if}
										{#if !team.isConfirmed && !$user?.id === team.leaderId}
											<div class="flex justify-evenly w-full py-5">
												<Button class="bg-red-500 text-white sm:text-lg text-sm sm:w-[20%] hover:text-black" on:click={() => deleteTeamMember('leave', $user?.id)}>Leave team</Button>
											</div>
										{/if}
									</Dialog.Content>
								</Dialog.Root>
							{:else if event.type === 'SOLO'}
								<p class="mt-3 text-center lg:text-2xl md:text-xl text-lg dark:text-green-400 text-green-600">You have already registered for the event</p>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="flex h-full w-full flex-col">
		<div class="dark:custom-shadow-black bg-muted-light dark:bg-muted-dark m-auto flex-1 rounded-lg px-5 py-8 shadow-xl dark:drop-shadow-md">
			<div class="flex justify-center">
				{#if event.image}
					<img src={event?.image} alt={event.title} class="border-muted-light dark:border-muted-dark m-auto border object-cover" />
				{/if}
			</div>
			<h1 class="py-4 text-center text-2xl font-bold">{event.title}</h1>
			{#if event.date}
				<h2 class="text-center text-xl">Date: {formatDate(event.date, event.endDate)}</h2>
			{/if}
			{#if event.time}
				<h2 class="text-center text-xl">Time: {event.time}</h2>
			{/if}
			{#if event.venue}
				<h2 class="text-center text-xl">Venue: {event?.venue}</h2>
			{/if}

			<div class="flex items-center justify-center pt-4">
				<!-- {#if event.registrationLink}
						<a href={event.registrationLink} target="_blank">
							<button class="rounded-xl bg-brand px-4 py-2 text-white duration-200 hover:scale-110"> Register Now </button>
						</a>
					{/if} -->
				<!-- <button class="rounded-xl bg-brand px-4 py-2 text-white">Registration Closed! Spot Registrations are Available</button> -->
			</div>
		</div>
	</div>
{/if}

<style>
	.gradient-text {
		background: linear-gradient(180deg, #ffffff, rgb(130, 131, 137));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
</style>