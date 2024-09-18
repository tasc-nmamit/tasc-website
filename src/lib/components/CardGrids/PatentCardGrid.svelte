<script lang="ts">
	import type PatentData from '$lib/types/PatentData';
	import PatentCard from '../Card/PatentCard.svelte';
	export let patents: PatentData[];
</script>

<div class="py-0 sm:px-4 md:py-5">
	{#each patents as patent}
		<PatentCard {...patent} />
	{/each}
</div>
