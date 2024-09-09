<script lang="ts">
	import { gsap } from 'gsap';
	import { onMount, onDestroy } from 'svelte';
	import type { PlacementOffer } from '$lib/components/types/AchievementData';
	import { NAME_TO_IMAGE as images } from '$lib/data/Images';

	export let offers: Record<string, any[]>;
	export let companyNames: string[];

	onMount(() => {
		// Ensure that the code only runs in the browser
		if (typeof window !== 'undefined') {
			const containers = document.querySelectorAll('.carousel-container');

			containers.forEach((container) => {
				const inner = container.querySelector('.carousel-inner');
				if (!inner) return;

				const items = Array.from(inner.children) as HTMLElement[];
				const totalItems = items.length;

				// Get the current screen size
				const isSmallScreen = window.innerWidth < 640;

				// Disable animation if there are less than or equal to required items
				if ((isSmallScreen && totalItems === 1) || (!isSmallScreen && totalItems <= 2)) return;

				// Duplicate items for seamless looping
				for (let i = 0; i < totalItems; i++) {
					const clone = items[i].cloneNode(true) as HTMLElement;
					inner.appendChild(clone);
				}

				// Recalculate the total items after duplication
				const totalDuplicatedItems = inner.children.length;

				const tl = gsap.timeline({ repeat: -1, paused: true });
				tl.to(inner, {
					duration: totalDuplicatedItems * 4, // Adjust duration based on the number of duplicated items
					xPercent: -100 * totalDuplicatedItems / 2,
					ease: 'none',
					modifiers: {
						xPercent: gsap.utils.unitize(value => {
							return parseFloat(value) % (100 * totalDuplicatedItems / 2);
						})
					}
				});

				tl.play();

				container.addEventListener('mouseenter', () => {
					tl.pause();
				});

				container.addEventListener('mouseleave', () => {
					tl.resume();
				});
			});
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			const containers = document.querySelectorAll('.carousel-container');
			containers.forEach((container) => {
				const inner = container.querySelector('.carousel-inner');
				if (!inner) return;

				const items = inner.children;
				const totalItems = items.length;

				if (totalItems > 2) 
					gsap.killTweensOf(inner);
			});
		}
	});
</script>


<style>
	.carousel-container {
		overflow: hidden;
		position: relative;
	}
	.carousel-inner {
		display: flex;
	}
	.carousel-item {
		flex: 0 0 100%; /* Show one item at a time by default */
	}
	@media (min-width: 640px) { /* Tailwind's 'sm' breakpoint */
		.carousel-item {
			flex: 0 0 50%; /* Show two items at a time for 'sm' screens and above */
		}
	}

    .carousel-item img {
        margin-right: -5rem;
    }
</style>

<div class="flex flex-col sm:gap-0 gap-3 md:px-8 sm:px-5 px-0 h-full">
	{#each companyNames as company}
		<div class="grid grid-cols-4 sm:space-x-0 space-x-2 items-center">
			<div class="col-span-1 sm:h-[90%] sm:w-[85%] aspect-square object-cover justify-self-center">
				<img src={images.find(c => c.name === company)?.image || ''} alt="" class=" h-full w-full border border-black lg:rounded-xl md:rounded-lg sm:rounded-md rounded-sm">
			</div>
			<div class="col-span-3 carousel-container rounded-lg grid justify-around sm:justify-normal">
				<div class="carousel-inner self-center">
					{#each offers[company] as student}
						<div class="carousel-item grid">
							<div class="bg-card w-[95%] sm:h-full h-[90%] self-center object-contain sm:border-2 border border-[#d2b863] md:rounded-[17px] sm:rounded-[13px] rounded-[8px] grid grid-cols-5">
                                <div class="col-span-2 w-full h-full sm:aspect-[7/9] aspect-square relative">
                                    <img src="/user1.png" alt="" class=" object-fill sm:h-full h-[89.5%] w-full md:rounded-l-[15px] sm:rounded-l-[11px] rounded-l-[7px]">
                                    <div class="absolute inset-0 sm:ml-[75%] ml-[50%] sm:h-full h-[89.5%] bg-gradient-to-r from-transparent to-card"></div>
                                </div>
                                <div class="flex flex-col col-span-3 justify-around sm:h-full h-[90%]">
                                    <p class="lg:text-xl md:text-lg sm:text-md text-sm text-center md:font-bold sm:font-semibold">{student.studentName}</p>
							        <p class="lg:text-xl md:text-lg sm:text-md text-sm text-center md:font-bold sm:font-semibold">{student.studentPackage}</p>
                                </div>
                            </div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/each}
</div>
