<script lang="ts">
	import type EventData from '$lib/types/EventData';
	import * as Accordion from '$lib/components/ui/accordion';
	import EventCardgridChild from '$lib/components/CardGrids/EventCardgridChild.svelte';

	export let eventType: string;
	export let events: EventData[];
	let openItem = 'item-2'; 
	let includedMonths = [1, 2, 3, 4, 5, 6];
</script>

<div class="sm:mx-20 my-10 sm:px-10 px-5">
	{#if eventType ==='previous'}
	<Accordion.Root value={openItem}>
		<Accordion.Item value="item-2" class="border-b-2">
			<Accordion.Trigger class="text-2xl sm:ml-10">2023-24</Accordion.Trigger>
			<Accordion.Content>
				<div class={`grid-container sm:mx-20 mx-5 gap-x-10 sm:gap-y-10`}>
					{#each events as event}
						{#if event.date && ((event.date.getFullYear() == 2023 && !includedMonths.includes(event.date.getMonth())) || (event.date.getFullYear() == 2024 && includedMonths.includes(event.date.getMonth())))}
							<EventCardgridChild {event} {eventType} />
						{/if}
					{/each}
				</div>
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-3" class="border-b-2">
			<Accordion.Trigger class="text-2xl sm:ml-10" on:click={()=>{
				scrollTo(0,0);
			}}>2022-23</Accordion.Trigger>
			<Accordion.Content>
				<div class={`grid-container sm:mx-20 mx-5 gap-x-10  sm:gap-y-10`}>
					{#each events as event}
						{#if event.date && ((event.date.getFullYear() == 2022 && !includedMonths.includes(event.date.getMonth())) || (event.date.getFullYear() == 2023 && includedMonths.includes(event.date.getMonth())))}
							<EventCardgridChild {event} {eventType} />
						{/if}
					{/each}
				</div>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
	{:else}
		<div class={`gap-10 py-16 `}>
			<div class={`grid-container sm:mx-20 mx-5 gap-x-10  sm:gap-y-10`}>
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
