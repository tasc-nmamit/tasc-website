<script>
	import Card from './RewardsCard.svelte';
	//@ts-ignore
	import { concurrent } from 'svelte-typewriter';
	const images = [
		{
			src: '/assets/icons/08@1x.png',
			alt: 'logo',
			className: 'w-60 pr-40 md:ml-0 ml-5 md:p-14 float mt-[30rem] absolute'
		},
		{
			src: '/assets/icons/09@1x.png',
			alt: 'logo',
			className: 'w-60 pl-40 md:mr-0 mr-5 md:p-14 float1 absolute right-0 mt-[75rem]'
		},
		{
			src: '/assets/icons/02@1x.png',
			alt: 'logo',
			className: 'w-60 pr-40 md:ml-0 ml-5 md:p-14 float mt-[90rem] absolute'
		}
	];
</script>

<div>
	<div class="-z-20">
		{#each images as image}
			<img src={image.src} alt={image.alt} class={image.className} />
		{/each}
	</div>
	<div class="px-10 pb-5 md:mb-0 md:px-20 lg:px-32">
		<h1 class="my-10 text-center font-jbExtrabold text-4xl md:py-10 md:text-5xl lg:text-5xl">
			<p use:concurrent={{ interval: 100 }}>Rewards & Goodies</p>
		</h1>
		<div class="grid place-items-center items-center gap-5">
			<div class="mt-5 rounded-2xl bg-gray-600 from-[#ec4237] via-[#d2b863] to-[#33b6d8] p-0.5 font-jbMedium transition duration-300 hover:bg-gradient-to-tr hover:drop-shadow-[0_0_0.2rem_#d2b863] md:w-[35rem] lg:w-[45rem]">
				<div class="rounded-2xl bg-[#0f0913] underline-offset-8 transition duration-300 hover:drop-shadow-[0_0_0.2rem_#460a07]">
					<div class="flex flex-col items-center justify-center rounded-2xl bg-[#d1f2f9] bg-opacity-5 px-5 py-16 font-jbBold text-4xl backdrop-blur-sm sm:px-20">
						<div class="flex flex-col items-center justify-center md:flex-row">
							<div class="text-2xl text-[#fffba4] transition duration-300 lg:text-3xl">Total Expenses & Rewards</div>
						</div>
						<ul class="mt-5 w-fit text-3xl lg:text-4xl">₹ 2,00,000 +</ul>
					</div>
					<div class="flex flex-col items-center justify-center rounded-2xl bg-[#d1f2f9] bg-opacity-5 px-5 pb-16 font-jbBold text-4xl backdrop-blur-sm sm:px-20">
						<div class="flex flex-col items-center justify-center md:flex-row">
							<div class="text-2xl text-[#fffba4] transition duration-300 lg:text-3xl">Total Cash Prize Pool of</div>
						</div>
						<ul class="mt-5 w-fit text-3xl lg:text-4xl">₹ 30,000</ul>
					</div>
				</div>
			</div>
			<Card message="Overall Winner" prizes={['Cash Prize of 15,000 INR.', 'Goodies', 'Winner Certificate']} />
			<Card message="Second Place" prizes={['Cash Prize of 10,000 INR.', 'Goodies', 'Winner Certificate']} />
			<Card message="Third Place" prizes={['Cash Prize of 5,000 INR.', 'Goodies', 'Winner Certificate']} />
			<Card message="Participation Prizes" prizes={['Goodies', 'Participation Certificate']} />
			<div class="mt-5 rounded-2xl bg-gray-600 from-[#ec4237] via-[#d2b863] to-[#33b6d8] p-0.5 font-jbMedium transition duration-300 hover:bg-gradient-to-tr hover:drop-shadow-[0_0_0.2rem_#d2b863] md:w-[35rem] lg:w-[45rem]">
				<div class="rounded-2xl bg-[#0f0913] underline-offset-8 transition duration-300 hover:drop-shadow-[0_0_0.2rem_#460a07]">
					<div class="flex flex-col items-center justify-center rounded-2xl bg-[#d1f2f9] bg-opacity-5 px-5 py-16 font-jbBold text-4xl backdrop-blur-sm sm:px-20">
						<div class="flex flex-col items-center justify-center md:flex-row">
							<!-- <img class="mb-5 w-20 md:mb-0 md:pr-5" src={`/assets/prize/${img}`} alt="prize" /> -->
							<div class="text-2xl text-[#fffba4] transition duration-300 lg:text-3xl">Internship Opportunities</div>
						</div>
						<ul class="mt-5 w-fit text-center text-lg md:text-2xl">
							<li class="py-1">The leading team for each problem statement will have the opportunity to secure internships for all of its members from the participating companies.</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
