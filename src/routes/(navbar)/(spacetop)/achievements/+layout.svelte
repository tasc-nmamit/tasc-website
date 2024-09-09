<script lang="ts">
	import { page } from '$app/stores';

	let currentRoute: string;

	$: currentRoute = $page.url.pathname;
</script>

<div id="achievements" class="grid h-full w-full">
	<div class="flex w-[50%] flex-col justify-around justify-items-center space-y-3 justify-self-center bg-card sm:my-5 sm:w-[80%] sm:flex-row sm:scale-90 sm:space-y-0">
		<a href="/achievements/publications/2024" class="sm:w-[32%]">
			<div class={`h-full rounded-lg border py-0 text-center text-lg hover:bg-slate-900 hover:text-white dark:hover:bg-[#dfdee3] dark:hover:text-black sm:py-2 sm:text-xl md:py-4 md:text-2xl lg:py-6 lg:text-3xl ${currentRoute.includes('/achievements/publications') ? 'bg-slate-900 text-white dark:bg-[#dfdee3] dark:text-black' : 'bg-[#dfdee3] dark:bg-slate-900'}`}>Publications</div>
		</a>
		<a href="/achievements/patents/2024" class="sm:w-[32%]">
			<div class={`h-full rounded-lg border py-0 text-center text-lg hover:bg-slate-900 hover:text-white dark:hover:bg-[#dfdee3] dark:hover:text-black sm:py-2 sm:text-xl md:py-4 md:text-2xl lg:py-6 lg:text-3xl ${currentRoute.includes('/achievements/patents') ? 'bg-slate-900 text-white dark:bg-[#dfdee3] dark:text-black' : 'bg-[#dfdee3] dark:bg-slate-900'}`}>Patents</div>
		</a>
		<a href="/achievements/placements/2024" class="sm:w-[32%]">
			<div class={`h-full rounded-lg border py-0 text-center text-lg hover:bg-slate-900 hover:text-white dark:hover:bg-[#dfdee3] dark:hover:text-black sm:py-2 sm:text-xl md:py-4 md:text-2xl lg:py-6 lg:text-3xl ${currentRoute.includes('/achievements/placements') ? 'bg-slate-900 text-white dark:bg-[#dfdee3] dark:text-black' : 'bg-[#dfdee3] dark:bg-slate-900'}`}>Placements</div>
		</a>
	</div>
	<slot />
</div>