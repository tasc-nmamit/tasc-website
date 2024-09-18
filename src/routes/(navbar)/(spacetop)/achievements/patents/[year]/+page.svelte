<script lang="ts">
	import { page } from '$app/stores';
	import PatentCardGrid from '$lib/components/CardGrids/PatentCardGrid.svelte';

	export let data;

	let year = $page.params.year;
</script>

<div class="grid h-auto w-full">
	<div class={'flex w-[95%] justify-around justify-self-center overflow-x-auto py-8 font-bold sm:w-[80%]'} data-sveltekit-reload>
		<a href="/achievements/patents/2021">
			<button class={`text-md sm:text-xl md:text-2xl ${year === '2021' ? 'underline underline-offset-4' : 'no-underline'}`}> 2021-22 </button>
		</a>
		<a href="/achievements/patents/2022">
			<button class={`text-md sm:text-xl md:text-2xl ${year === '2022' ? 'underline underline-offset-4' : 'no-underline'}`}> 2022-23 </button>
		</a>
		<a href="/achievements/patents/2023">
			<button class={`text-md sm:text-xl md:text-2xl ${year === '2023' ? 'underline underline-offset-4' : 'no-underline'}`}> 2023-24 </button>
		</a>
		<a href="/achievements/patents/2024">
			<button class={`text-md sm:text-xl md:text-2xl ${year === '2024' ? 'underline underline-offset-4' : 'no-underline'}`}> 2024-25 </button>
		</a>
	</div>
	<PatentCardGrid patents={data.patents} />
</div>
