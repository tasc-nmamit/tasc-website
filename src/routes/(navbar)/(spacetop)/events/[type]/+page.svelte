<script lang="ts">
	import EventCardgrid from '$lib/components/CardGrids/EventCardgrid.svelte';
	import { page } from '$app/stores';
	import Prompting from '$lib/components/EventRegistrationOld/Prompting.svelte';
	let eventType = $page.params.type;

	import type { PageData } from './$types';
	export let data: PageData;
</script>

{#if eventType !== 'current'}
	<div class={`${eventType === 'upcoming' ? 'h-screen' : ''}`}>
		<div class={'flex w-full justify-center space-x-8 pt-16 font-bold md:space-x-16'}>
			<a href="/events/previous">
				<button class={`text-xl md:text-2xl ${eventType === 'previous' ? 'underline underline-offset-4' : 'no-underline'}`} on:click={() => (eventType = 'previous')}> Previous Events </button>
			</a>
			<a href="/events/upcoming">
				<button class={`text-xl md:text-2xl ${eventType === 'upcoming' ? 'underline underline-offset-4' : 'no-underline'}`} on:click={() => (eventType = 'upcoming')}> Upcoming Events </button>
			</a>
		</div>

		<!-- <p class="mt-3 text-center">(This page will soon be deprecated.)</p> -->

		<EventCardgrid events={data.events} eventType={eventType}/>
	</div>
{:else}
	<Prompting />
{/if}
