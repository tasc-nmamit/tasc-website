<script>
	import AboutSection from '$lib/components/Hackathon/AboutSection.svelte';
	import DateComponent from '$lib/components/Hackathon/DateComponent.svelte';
	import Footer from '$lib/components/Hackathon/Footer.svelte';
	import Hero from '$lib/components/Hackathon/HeroSection.svelte';
	import Rewards from '$lib/components/Hackathon/Rewards.svelte';
	import Themes from '$lib/components/Hackathon/Themes.svelte';
	import TimelineBetter from '$lib/components/Hackathon/TimelineBetter.svelte';
	const images = [
		{
			src: '/assets/icons/13@1x.png',
			alt: 'logo',
			className: `w-60 sm:visible invisible pr-40 md:ml-0 ml-5 md:p-14 float mt-[45rem] absolute`
		},
		{
			src: '/assets/icons/04@1x.png',
			alt: 'logo',
			className: `w-60 pl-40 md:mr-0 mr-5 md:p-14 float1 absolute right-0 mt-[60rem]`
		},

		{
			src: '/assets/icons/13@1x.png',
			alt: 'logo',
			className: `visible sm:invisible w-60 pr-40 md:ml-0 ml-5 md:p-14 float2 absolute mt-[75rem]`
		},
		{
			src: '/assets/icons/12@1x.png',
			alt: 'logo',
			className: `w-60 pl-40 md:mr-0 mr-5 md:p-14 float1 absolute md:mt-[125rem] mt-[167rem] right-0`
		},
		{
			src: '/assets/icons/03@1x.png',
			alt: 'logo',
			className: `w-60 pr-40 md:ml-0 ml-5 md:p-14 float absolute md:mt-[180rem] mt-[200rem]`
		},
		{
			src: '/assets/icons/07@1x.png',
			alt: 'logo',
			className: `w-60 pl-40 md:mr-0 mr-5 md:p-14 float1 absolute mt-[245rem] md:mt-[213rem] right-0`
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

	<!-- <TextSlide /> -->
	<div id="about">
		<AboutSection />
	</div>

	<section id="timeline">
		<TimelineBetter />
	</section>
<!-- 
	<section id="themes">
		<Themes />
	</section> 
-->

	<section id="goodies">
		<Rewards />
		<!-- <Sponsors /> -->
	</section>
</main>
