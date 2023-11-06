<script lang="ts">
	export let theme: string | null;
	export let img: string | null;
</script>

<div class="gradient_border group relative aspect-video overflow-hidden rounded-md border">
	<div class="absolute inset-0 z-10 bg-zinc-950/70 transition-colors group-hover:bg-zinc-950/75" />
	<img src={`${img}`} alt={`${theme} image`} class="z-10 h-full w-full transform object-cover transition-all duration-500 ease-in-out" />
	<div class="absolute inset-0 z-20 flex flex-col items-center justify-center">
		<h1 class="px-5 text-center text-2xl font-bold text-white lg:text-3xl">
			{theme}
		</h1>
	</div>
</div>
