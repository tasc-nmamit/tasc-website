<script lang="ts">
	export let message: string;
	export let img: string;
	export let prizes: string[];
</script>

<div>
	<div class="mt-5 rounded-2xl bg-gray-600 from-[#ec4237] via-[#d2b863] to-[#33b6d8] p-0.5 font-jbMedium transition duration-300 hover:bg-gradient-to-tr hover:drop-shadow-[0_0_0.2rem_#d2b863] md:w-[35rem] lg:w-[45rem]">
		<div class="rounded-2xl bg-[#0f0913] underline-offset-8 transition duration-300 hover:drop-shadow-[0_0_0.2rem_#460a07]">
			<div class="flex flex-col items-center justify-center rounded-2xl bg-[#d1f2f9] bg-opacity-5 px-5 py-16 font-jbBold text-4xl backdrop-blur-sm sm:px-20">
				<div class="flex flex-col items-center justify-center md:flex-row">
					<img class="mb-5 w-20 md:mb-0 md:pr-5" src={`/assets/prize/${img}`} alt="prize" />
					<div class="text-2xl text-[#fffba4] transition duration-300 lg:text-3xl">
						{message}
					</div>
				</div>
				<ul class="mt-5 w-fit text-lg md:text-2xl">
					{#each prizes as prize}
						<li class="py-1">
							<span>&#8226;</span>
							{prize}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</div>
