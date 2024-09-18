<script lang="ts">
    import { page } from '$app/stores';
    let { faculties } = $page.data.body;//To get faculty data
	import PublicationCardGrid from '$lib/components/CardGrids/PublicationCardGrid.svelte';
    let year = $page.params.year;
</script>

<div class="w-full h-auto grid">
    <div class={'flex sm:w-[80%] w-[95%] justify-around justify-self-center py-8 font-bold overflow-x-auto'} data-sveltekit-reload>
        <a href="/achievements/publications/2021">
            <button class={`text-md sm:text-xl md:text-2xl ${year === '2021' ? 'underline underline-offset-4' : 'no-underline'}`}> 2021-22 </button>
        </a>
        <a href="/achievements/publications/2022">
            <button class={`text-md sm:text-xl md:text-2xl ${year === '2022' ? 'underline underline-offset-4' : 'no-underline'}`}> 2022-23 </button>
        </a>
        <a href="/achievements/publications/2023">
            <button class={`text-md sm:text-xl md:text-2xl ${year === '2023' ? 'underline underline-offset-4' : 'no-underline'}`}> 2023-24 </button>
        </a>
        <a href="/achievements/publications/2024">
            <button class={`text-md sm:text-xl md:text-2xl ${year === '2024' ? 'underline underline-offset-4' : 'no-underline'}`}> 2024-25 </button>
        </a>
        </div>
    <PublicationCardGrid faculties={faculties}/>

</div>