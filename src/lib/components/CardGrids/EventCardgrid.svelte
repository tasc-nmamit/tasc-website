<script lang="ts">
	import type EventData from '../types/EventData';

	const options: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	};

	export let events: EventData[];
</script>

<div class={`grid-container mx-20 gap-10 py-16 `}>
	{#each events as event}
		<div class="flex w-full flex-col">
			<div class="dark:custom-shadow-black flex-1 rounded-lg bg-muted-light px-5 py-8 shadow-xl dark:bg-muted-dark dark:drop-shadow-md">
				<div class="flex justify-center">
					{#if event.image}
						<img src={event?.image} alt={event.title} class="border border-muted-light object-cover dark:border-muted-dark" />
					{/if}
				</div>
				<h1 class="py-4 text-center text-2xl font-bold">{event.title}</h1>
				{#if event.date}
					<h2 class="text-xl">Date: {event.date.toDate().toLocaleDateString(undefined, options)}</h2>
				{/if}
				{#if event.time}
					<h2 class="text-xl">Time: {event.time}</h2>
				{/if}
				{#if event.venue}
					<h2 class="text-xl">Venue: {event?.venue}</h2>
				{/if}

				<div class="flex items-center justify-center pt-4">
					{#if event.registrationLink}
						<a href={event.registrationLink} target="_blank">
							<button class="rounded-xl bg-brand px-4 py-2 text-white duration-200 hover:scale-110"> Register Now </button>
						</a>
					{/if}
					<!-- <button class="rounded-xl bg-brand px-4 py-2 text-white">Registration Closed! Spot Registrations are Available</button> -->
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.grid-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
		justify-items: center;
		justify-content: end;
		align-content: end;
		row-gap: 4rem;
	}
</style>
