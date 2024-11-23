<script lang="ts">
	import AboutSection from './AboutSection.svelte';
	import gsap from 'gsap';
	import { X } from 'lucide-svelte';

	export let data: any | null | undefined = null;

	let showContent: boolean = true;
	let dialog: HTMLDivElement;
	let content: HTMLDivElement;
	let close: HTMLButtonElement;

	const handleDialog = async () => {
		let offsetX: number = 0;
		let offsetY: number = 0;
		if(window.innerWidth >= 640) {
			offsetX = window.innerWidth * 0.75;
			offsetY = window.innerHeight * 0.85;
		} else {
			offsetX = 0;
			offsetY = -500;
		}

		if (showContent) {
			gsap.to(dialog, { scale: 0.3, duration: 0.4, translateX: `${offsetX/2}px`, translateY: `${offsetY/2}px`, });
			gsap.to(close, { scale: 0, duration: 0.4 });
			await gsap.to(content, { scale: 0, height: 0, duration: 0.4 });
			showContent = false;
		} else {
			gsap.to(dialog, { scale: 1, duration: 0.4, x: 0, y: 0 });
			gsap.to(close, { scale: 1, duration: 0.4 });
			await gsap.to(content, { scale: 1, height: 'auto', duration: 0.4 });
			showContent = true;
		}
	};
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com">
	<link href="https://fonts.googleapis.com/css2?family=Jockey+One&display=swap" rel="stylesheet">
</svelte:head>

<main class="min-h-[100dvh] overflow-x-hidden">
	<div class="top-64 hidden min-h-screen w-[100vw] items-center justify-center md:flex">
		<div class="z-30 flex translate-y-[-10%] flex-col items-center md:flex-row-reverse">
			<img src="/CenterGraphic.png" alt="Center Graphic" class=" brightness-90 md:scale-75 lg:scale-90" />
			<div class="z-50 flex flex-col md:pl-6">
				<div class="istok_web bg-gradient-to-r from-brand to-[#C850AF] to-[22%] bg-clip-text md:text-6xl lg:text-[5rem]">
					<p class="text-transparent">Turing</p>
					<p class="text-transparent">Artificial Intelligence</p>
					<p class="text-transparent">Students</p>
					<p class="text-transparent">Committee</p>
				</div>
				<div>
					<p class=" text-xl">Browse for glimpses of our 24 hour hackathon!</p>
					<div class="pt-4">
						<a href="/snh2023">
							<button class="rounded-full bg-accent px-4 py-2 font-semibold duration-300 hover:scale-105">Hackathon</button>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="absolute bottom-36 hidden w-full justify-center text-center md:flex">
		<p class="text-xl">Welcome to the official website of TASC,<br /><span class="font-bold text-brand dark:text-primary">Department of Artificial Intelligence and Machine Learning</span></p>
	</div>

	<div class="absolute bottom-10 hidden w-full animate-bounce items-center justify-center bg-transparent md:flex">
		<a href="/#about">
			<svg width="50" height="50" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg" class="hidden dark:block">
				<path d="M65.2726 18.5L69.375 22.1445L37 55.5L4.625 22.1445L8.72738 18.5L37 47.6283L65.2726 18.5Z" fill="white" />
			</svg>
			<svg width="50" height="50" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg" class="block dark:hidden">
				<path d="M65.2726 18.5L69.375 22.1445L37 55.5L4.625 22.1445L8.72738 18.5L37 47.6283L65.2726 18.5Z" fill="black" />
			</svg>
		</a>
	</div>

	<div class="flex min-h-[100dvh] flex-grow flex-col md:hidden">
		<div class="z-0 flex flex-col">
			<div class="flex w-full translate-y-[-10%] flex-col items-center px-2">
				<img src="/CenterGraphic.png" alt="Center Graphic" class="translate-y-[10dvh] scale-50 brightness-90 md:translate-y-[12dvh]" />
				<div class="z-50 flex w-full flex-col items-center justify-center bg-gradient-to-r from-brand to-[#C850AF] to-[20%] bg-clip-text md:ml-16 md:py-10">
					<div class="istok_web mt-10 pl-[5vw] text-left text-5xl sm:mt-4 sm:text-5xl">
						<p class="text-transparent">Turing</p>
						<p class="text-transparent">Artificial Intelligence</p>
						<p class="text-transparent">Students</p>
						<p class="text-transparent">Committee</p>
					</div>
					<div>
						<p class="pt-6 text-center text-lg">Browse for glimpses of our 24 hour hackathon!</p>
						<div class="flex w-full justify-center pt-4">
							<a href="/snh2023">
								<button class="rounded-full bg-accent px-4 py-2 font-semibold">Hackathon</button>
							</a>
						</div>
					</div>
				</div>
			</div>

			<div class="flex w-full justify-center px-2">
				<p class="text-center text-sm">Welcome to the official website of TASC,<br /> <span class="font-bold">Department of Artificial Intelligence and Machine Learning</span></p>
			</div>

			<div class="mt-6 flex w-full animate-bounce justify-center">
				<a href="/#about">
					<svg width="30" height="30" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg" class="hidden dark:block">
						<path d="M65.2726 18.5L69.375 22.1445L37 55.5L4.625 22.1445L8.72738 18.5L37 47.6283L65.2726 18.5Z" fill="white" />
					</svg>
					<svg width="30" height="30" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg" class="block dark:hidden">
						<path d="M65.2726 18.5L69.375 22.1445L37 55.5L4.625 22.1445L8.72738 18.5L37 47.6283L65.2726 18.5Z" fill="black" />
					</svg>
				</a>
			</div>
		</div>
	</div>

	{#if data.upcoming}
		<div 
			class={`hideScrollbar fixed left-[50%] top-[50%] z-50 grid max-h-[80dvh] w-[80%] translate-x-[-50%] translate-y-[-50%] overflow-y-hidden rounded-3xl dark:bg-[#2f3e41] bg-[#fde6d1] sm:bg-opacity-90 py-4 shadow-lg md:max-w-[60rem] md:p-6 p-2 font-jockey backdrop-blur-md 
				${showContent ? 'cursor-auto' : 'cursor-pointer'}`} 
			bind:this={dialog}
			on:click={() => !showContent && handleDialog()}
			on:keydown={(e) => e.key === 'Enter' && !showContent && handleDialog()}
			role="button"
			tabindex="0"
		>
			<div class="flex justify-self-center text-center lg:text-[6rem] md:text-[5rem] sm:text-[4rem] text-[3rem] w-fit">
				<p class="text-transparent bg-gradient-to-r from-brand to-[#C850AF] bg-clip-text tracking-normal">WHAT'S NEW</p>
			</div>
			<div bind:this={content}>
				<div class="flex flex-col items-center lg:text-[2.5rem] text-[1.8rem] sm:space-y-6 space-y-2">
					<p class="text-center sm:font-normal font-thin">{data.upcoming.notification}</p>
					<div class="flex gap-4">
						<a href="/events/upcoming">
							<button class="rounded-xl bg-accent px-4 py-2 tracking-wide">KNOW MORE</button>
						</a>
					</div>
				</div>
			</div>
			<button
				class="absolute sm:right-6 sm:top-6 top-3 right-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer"
				on:click={() => handleDialog()}
				bind:this={close}
			>
				<X stroke-linecap="square" class="sm:h-8 h-5 sm:w-8 w-5 stroke-2 sm:stroke-[4]" />
			</button>
		</div>
	{/if}

	<section id="about" class="flex max-w-[100vw] py-10">
		<AboutSection />
	</section>
</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Istok+Web:wght@700&display=swap');
	.istok_web {
		font-family: 'Istok Web', sans-serif;
		font-weight: 700;
	}
</style>
