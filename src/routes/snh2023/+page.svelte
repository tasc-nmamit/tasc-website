<script>
	import AboutSection from '$lib/components/Hackfest/AboutSection.svelte';
	import DateComponent from '$lib/components/Hackfest/DateComponent.svelte';
	import Footer from '$lib/components/Hackfest/Footer.svelte';
	import Hero from '$lib/components/Hackfest/HeroSection.svelte';
<<<<<<< HEAD:src/routes/(hackathon)/hackathon/+page.svelte
	import Rewards from '$lib/components/Hackfest/Rewards.svelte';
	import Themes from '$lib/components/Hackfest/Themes.svelte';
	import { default as Timeline, default as TimelineBetter } from '$lib/components/Hackfest/Timeline.svelte';
=======
	import TimelineBetter from '$lib/components/Hackfest/TimelineBetter.svelte';
>>>>>>> 9beaaf6f671d5d1b29296e00f2134b6d6254dbab:src/routes/snh2023/+page.svelte
	const images = [
		{
			src: '/assets/icons/13@1x.png',
			alt: 'logo',
			className: `-z-50 w-60 sm:visible invisible pr-40 md:ml-0 ml-5 md:p-14 float mt-[45rem] absolute`
		},
		{
			src: '/assets/icons/04@1x.png',
			alt: 'logo',
			className: `-z-50 w-60 pl-40 md:mr-0 mr-5 md:p-14 float1 absolute right-0 mt-[60rem] `
		},
		{
			src: '/assets/icons/12@1x.png',
			alt: 'logo',
			className: `-z-50 w-60 pl-40 md:mr-0 mr-5 md:p-14 float1 absolute md:mt-[125rem] mt-[167rem] right-0 `
		},
		{
			src: '/assets/icons/07@1x.png',
			alt: 'logo',
			className: `-z-50 w-60 pl-40 md:mr-0 mr-5 md:p-14 float1 absolute mt-[245rem] md:mt-[213rem] right-0 `
		}
	];
</script>

<main class="min-h-screen text-white">
	<div class="-z-20">
		<!-- Floating Items -->
		{#each images as image}
			<img src={image.src} alt={image.alt} class={image.className} />
		{/each}
	</div>

	<section id="home">
		<Hero />
	</section>

	<section id="date">
		<DateComponent />
	</section>
<<<<<<< HEAD:src/routes/(hackathon)/hackathon/+page.svelte
=======

	<!-- <TextSlide /> -->
>>>>>>> 9beaaf6f671d5d1b29296e00f2134b6d6254dbab:src/routes/snh2023/+page.svelte
	<div id="about">
		<AboutSection />
	</div>

	<section id="timeline">
		<TimelineBetter />
	</section>

	<!-- <section id="themes">
		<Themes />
	</section>

	<section id="prizes">
		<Rewards />
<<<<<<< HEAD:src/routes/(hackathon)/hackathon/+page.svelte
	</section>
	<Footer />
=======
		<Sponsors />
		<Footer />
	</section> -->
>>>>>>> 9beaaf6f671d5d1b29296e00f2134b6d6254dbab:src/routes/snh2023/+page.svelte
</main>
