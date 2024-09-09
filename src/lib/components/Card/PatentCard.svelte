<script lang="ts">
	import { darkTheme } from '$lib/stores/theme';

	// export let patentId: string;
	export let title: string;
	export let faculty: [];
	// export let year: string;
	export let student: [];
	export let certificate: string | null;
	export let authors: [];
	export let inventorsName: [];
	export let inventorsAddress: [];

	let theme: string = 'dark';

	export let faculty_image: [];
	export let student_image: [];

	$: darkTheme.subscribe((value) => {
		if (value) theme = 'dark';
		else theme = 'light';
	});
</script>

<div class={`mb-6 grid h-fit w-full scale-90 space-y-4 sm:space-y-10 ${theme}`}>
	<div class="dark:custom-shadow-black w-[95%] justify-self-center rounded-2xl border-2 border-blue-900 bg-card p-1 shadow-xl sm:w-[80%] sm:p-4">
		<p class="text-center text-xs font-bold text-black underline underline-offset-2 dark:text-yellow-300 sm:text-lg sm:font-semibold md:text-2xl md:underline-offset-4 lg:text-3xl">{title}</p>
		{#if certificate}
			<div class="my-5 grid w-full"><img src={certificate} class="w-[80%] justify-self-center rounded-sm sm:w-[30%]" alt="" /></div>
		{/if}
		{#if !certificate}
			<div class="grid grid-cols-10 py-2 md:p-6">
				<p class="sm:text-md col-span-3 self-center text-center text-xs text-black dark:text-white sm:col-span-2 md:text-lg lg:text-xl">Faculty</p>
				<p class="sm:text-md col-span-1 self-center text-center text-xs text-black dark:text-white md:text-lg lg:text-xl">:</p>
				<div class="col-span-6 flex justify-around sm:col-span-7 sm:space-x-4">
					{#each faculty_image as imf, index}
						<div class="grid w-[30%] justify-self-center">
							<img src={imf} class="h-[3rem] justify-self-center rounded-md sm:h-[5rem] md:h-[7rem] lg:h-[9rem]" alt="" />
							<div class="items-center justify-center"><p class="md:text-md text-center text-xs text-black dark:text-white sm:text-sm lg:text-lg">{faculty[index]}</p></div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
		{#if student.length != 0}
			<div class="grid grid-cols-10 py-2 md:p-6">
				<p class="sm:text-md col-span-3 self-center text-center text-xs text-black dark:text-white sm:col-span-2 md:text-lg lg:text-xl">Students</p>
				<p class="sm:text-md col-span-1 self-center text-center text-xs text-black dark:text-white md:text-lg lg:text-xl">:</p>
				<div class="col-span-6 flex justify-around sm:col-span-7 sm:space-x-4">
					{#each student_image as stud, index}
						<div class={`grid w-[30%] justify-self-center`}>
							<img src={stud} class="h-[3rem] justify-self-center rounded-md sm:h-[5rem] md:h-[7rem] lg:h-[9rem]" alt="" />
							<div class="items-center justify-center"><p class="md:text-md text-center text-xs text-black dark:text-white sm:text-sm lg:text-lg">{student[index]}</p></div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
		{#if inventorsName.length != 0}
			<div class="grid-cols-10 py-2 sm:grid md:p-6">
				<p class="sm:text-md col-span-3 self-center text-center text-xs text-black dark:text-white sm:col-span-2 md:text-lg lg:text-xl">In collaboration with</p>
				<p class="sm:text-md col-span-1 hidden self-center text-center text-xs text-black dark:text-white sm:block md:text-lg lg:text-xl">:</p>
				<div class="col-span-7">
					{#each inventorsName as inventor, index}
						<div class="grid grid-cols-3 space-y-1">
							<p class="md:text-md self-center text-xs text-black dark:text-white sm:text-sm lg:text-lg">{inventorsAddress[index]}</p>
							<p class="md:text-md self-center text-center text-xs text-black dark:text-white sm:text-sm lg:text-lg">-</p>
							<p class="md:text-md self-center text-xs text-black dark:text-white sm:text-sm lg:text-lg">{inventor}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}
		{#if authors.length != 0 && !certificate}
			<div class="grid grid-cols-10 py-2 md:p-6">
				<p class="sm:text-md col-span-3 self-center text-center text-xs text-black dark:text-white sm:col-span-2 md:text-lg lg:text-xl">Collaborated with</p>
				<p class="sm:text-md col-span-1 self-center text-center text-xs text-black dark:text-white md:text-lg lg:text-xl">:</p>
				<div class="col-span-6 grid sm:col-span-7">
					<p class="md:text-md self-center text-center text-xs text-black dark:text-white sm:text-sm lg:text-lg">{authors.join(', ')}</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	:root {
		--patent-dark-gradient: linear-gradient(19deg, #21d4fd 0%, #b721ff 100%);
		--patent-light-gradient: linear-gradient(180deg, #52acff 25%, #ffe32c 100%);
	}

	.dark {
		--patent-gradient: var(--patent-dark-gradient);
	}

	.light {
		--patent-gradient: var(--patent-light-gradient);
	}

	.patent-card {
		position: relative;
		background-color: transparent;
	}

	.patent-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
		border-radius: inherit;
		pointer-events: none;
		opacity: 0.2;
		background-image: var(--patent-gradient);
	}

	.patent-card > * {
		position: relative;
		z-index: 2;
	}
</style>
