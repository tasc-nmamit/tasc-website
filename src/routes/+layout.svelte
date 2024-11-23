<script lang="ts">
	import { navigating } from '$app/stores';
	import DarkLoader from '$lib/loader/DarkLoader.svelte';
	import LightLoader from '$lib/loader/LightLoader.svelte';
	import { loading } from '$lib/stores/loading';
	import { darkTheme } from '$lib/stores/theme';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../app.css';
	import { setUser, user, userData, userProfileData, userLoaded } from '$lib/auth/stores';
	
	/* Retrive data loaded from server */
	export let data;

	/* Subscribe to stores in root layout */
	$darkTheme;
	$user;
	$userData;
	$userProfileData;
	$userLoaded;

	/* Set User when data is loaded*/
	setUser(data);
	
	$: $loading = !!$navigating;
</script>

{#if $loading}
	{#if $darkTheme}
		<DarkLoader />
	{:else}
		<LightLoader />
	{/if}
{:else}
	<slot />
{/if}
<div class="wrapper text-center font-medium leading-5"><SvelteToast options={{ intro: { y: -120 }, duration: 2500 }} /></div>

<style>
	:root {
		--toastWidth: 300px;
		--toastHeight: auto;
		--toastPadding: 0 0 0 0.5rem;
	}
	.wrapper {
		/* --toastWidth: 250px;
		--toastContainerTop: -33%;
		--toastContainerLeft: calc(25vw); */
		--toastContainerTop: 1rem;
		--toastContainerRight: auto;
		--toastContainerBottom: auto;
		--toastContainerLeft: calc(50vw - 8rem);
	}
</style>
