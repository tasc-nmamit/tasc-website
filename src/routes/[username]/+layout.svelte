<script>
	import AuthButton from '$lib/components/Auth/AuthButton.svelte';
	import ThemeToggle from '$lib/components/HeaderFooter/ThemeToggle.svelte';
	import Vectorall from '$lib/components/VectorBackground/vectorall.svelte';
</script>

<Vectorall />

<nav class="z-50 block h-20 w-full">
	<div class="flex h-full items-center justify-between px-10">
		<a href="/"><img src="/TASCLogo.png" alt="TASC logo" class="w-20 brightness-125 contrast-125" /></a>
		<!-- <AuthButton /> -->
		<ThemeToggle />
	</div>
</nav>

<slot />

