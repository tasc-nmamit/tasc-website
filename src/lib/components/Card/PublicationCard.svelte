<script lang="ts">
	import { NAME_TO_IMAGE as images } from '$lib/data/Images';
	import * as Dialog from '$lib/components/ui/dialog-publications';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { onMount } from 'svelte';
	export let faculties;

	gsap.registerPlugin(ScrollTrigger);

	function title_details(key: string, value: string) {
		if (value === '') return '';
		let detail = `
            <div class="grid sm:grid-cols-8 grid-cols-9 items-center">
                <p class="sm:col-auto col-span-2">${key}</p>
                <p class="text-center">:</p>
                <p class="sm:col-span-6 col-span-5">${value}</p>
            </div>`;
		return detail;
	}

	onMount(() => {
		const items = document.querySelectorAll('.animate-item');
		items.forEach((item) => {
			gsap.fromTo(
				item,
				{ x: -200, opacity: 0 },
				{
					x: 0,
					opacity: 1,
					duration: 3,
					ease: 'power4.out',
					scrollTrigger: {
						trigger: item,
						start: 'top 90%', // Starts animation when the top of the element is at 80% of the viewport height
						end: 'bottom 60%', // Ends animation when the bottom of the element is at 70% of the viewport height
						scrub: true,
						toggleActions: 'play none none reverse',
						markers: false // Set to true to see markers for debugging
					}
				}
			);
		});
		const itemss = document.querySelectorAll('.animate-container');
		itemss.forEach((item) => {
			gsap.fromTo(
				item,
				{ opacity: 0, scale: 0.9 },
				{
					opacity: 1,
					duration: 1.5,
					scale: 1,
					ease: 'power4.out',
					scrollTrigger: {
						trigger: item,
						start: 'top 80%', // Starts animation when the top of the element is at 90% of the viewport height
						end: 'bottom 60%', // Ends animation when the bottom of the element is at 60% of the viewport height
						scrub: true,
						toggleActions: 'play none none reverse',
						markers: false // Set to true to see markers for debugging
					}
				}
			);
		});
	});
</script>

<div class="flex flex-col gap-6 px-4 sm:px-0 md:px-12 lg:px-24">
	{#each faculties as teacher}
		{#if teacher.publications.length > 0}
			<div class="animate-container flex grid-cols-10 flex-col justify-items-center gap-3 rounded-2xl border border-blue-500 bg-card p-2 opacity-0 sm:grid sm:gap-0 sm:p-3 md:p-4 lg:p-5">
				<div class="relative col-span-2 grid place-content-center justify-items-center transition duration-300 ease-in-out">
					<div class="image-container"><img src={images.find((n) => n.name === teacher.name)?.image || ''} alt="" class="aspect-[3/4] w-40 rounded-2xl sm:w-auto sm:object-cover" /></div>
					<!-- <div class="hover:dark:custom-drop-shadow-white hover:custom-drop-shadow-black absolute inset-0 grid items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100 dark:text-white">
						<p class="sm:text-md justify-self-center md:text-lg lg:text-xl">{teacher.name}</p>
						<p class="sm:text-md justify-self-center md:text-lg lg:text-xl">{teacher.designation}</p>
					</div> -->
				</div>
				<div class="col-span-8 flex flex-col gap-5 sm:w-[80%]">
					<h1 class="text-center text-3xl font-bold">{teacher.name}</h1>
					<span class={`${teacher.publications.length <= 3 ? 'mt-3' : 'mt-0'}`}></span>
					{#each teacher.publications as paper}
						<Dialog.Root>
							<Dialog.Trigger>
								<!-- <h1 class=" md:text-md text-center text-xs font-semibold hover:cursor-pointer hover:underline sm:text-sm lg:text-lg">{paper.title}</h1> -->
								<ul class="list-disc">
									<li class=" text-left hover:cursor-pointer hover:underline">{paper.title}</li>
								</ul>
							</Dialog.Trigger>
							<Dialog.Content>
								<div class="grid justify-around gap-6">
									{@html title_details('Title', `${paper.title} (<a href=${paper.link} class="text-blue-500 hover:underline">Read the full paper here</a>)`)}
									{@html title_details('Authors', paper.authors)}
									{@html title_details('Date of Publication', paper.publish_date)}
									{#if paper.journal !== ''}
										{@html title_details('Journal', `${paper.journal}${paper.ranking ? `(${paper.ranking})` : ''}`)}
									{:else if paper.ranking !== ''}
										{@html title_details('Journal Ranking', paper.ranking)}
									{/if}
									{@html title_details('Impact Factor', paper.impact_factor)}
									{@html title_details('Publisher', paper.publisher)}
									{@html title_details('Conference', paper.conference)}
									{@html title_details('Publisher', paper.publisher_conference)}
									{@html title_details('Indexing', `Indexed in ${paper.indexed}`)}
								</div>
							</Dialog.Content>
						</Dialog.Root>
					{/each}
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
	.image-container {
		opacity: 1;
		transition: opacity 0.3s ease-in-out;
	}

	.relative:hover .image-container {
		opacity: 0.5;
	}
</style>
