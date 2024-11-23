<script lang="ts">
	import type EventData from '$lib/types/EventData';
	import * as Accordion from '$lib/components/ui/accordion';
	import EventCardgridChild from '$lib/components/CardGrids/EventCardgridChild.svelte';

	export let eventType: string;
	export let events: EventData[];

	let openItem = 'item-1'; 
	let includedMonths = [1, 2, 3, 4, 5, 6];
    let yearRanges = [
        { start: 2024, end: 2025 },
        { start: 2023, end: 2024 },
        { start: 2022, end: 2023 }
    ];
</script>

<div class="lg:mx-20 my-10 sm:px-10 px-5">
	{#if eventType ==='previous'}
	<Accordion.Root value={openItem}>
		{#each yearRanges as {start,end},i}
		<Accordion.Item value={`item-${i+1}`} class="border-b-2">
			<Accordion.Trigger class="text-2xl sm:ml-10" on:click={()=>{
				scrollTo(0,0);}}>{start}-{end}</Accordion.Trigger>
			<Accordion.Content>
				<div class={`grid-container sm:mx-20 mx-5 gap-x-10 sm:gap-y-10`}>
					{#each events as event}
						{#if event.date && ((event.date.getFullYear() == start && !includedMonths.includes(event.date.getMonth())) || (event.date.getFullYear() == end && includedMonths.includes(event.date.getMonth())))}
							<EventCardgridChild {event} {eventType} />
						{/if}
					{/each}
				</div>
			</Accordion.Content>
		</Accordion.Item>
		{/each}
	</Accordion.Root>
	{:else}
		<div>
			<div class={` lg:mx-20 mx-5 gap-x-10 space-y-5 relative gap-10`}>
				{#each events as event}
						<EventCardgridChild {event} {eventType} />
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.grid-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
		justify-items: center;
		justify-content: center;
		align-content: end;
		/* row-gap: 4rem; */
	}
</style>
