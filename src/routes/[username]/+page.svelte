<script lang="ts">
	import { backgroundColor } from '$lib/actions/style';
	import EditButton from '$lib/components/Auth/EditButton.svelte';
	import UserLink from '$lib/components/Profile/UserLink.svelte';
	import VectorBl from '$lib/components/VectorBackground/vectorBL.svelte';
	import Vectorall from '$lib/components/VectorBackground/vectorall.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { darkTheme } from '$lib/stores/theme';
	import type { PageData } from './$types';

	export let data: PageData & any;
</script>

<svelte:head>
	<title>@{data.username} | TASC</title>
	<meta name="description" content={data.bio ?? ""} />
</svelte:head>

<svelte:body
	use:backgroundColor={{
		color_light: data.lightTheme ?? '',
		color_dark: data.darkTheme ?? '',
		darkTheme: $darkTheme
	}}
/>


<div class="mx-2 flex flex-col items-center justify-center sm:my-6">
	<!-- <h1 class="mt-2 text-center text-3xl sm:text-4xl">Profile</h1> -->
	<div class="custom-shadow-black dark:custom-shadow-white flex h-auto w-full flex-col items-center gap-y-3 rounded-md border border-primary bg-primary bg-opacity-5 p-10 sm:w-3/4 md:w-[550px]">
		{#if data.image}
			<img src={data.image} alt="photoURL" class="aspect-square w-32 rounded-full object-cover sm:w-52" />
		{:else}
			<img src={'/fallback-image.jpg'} alt="photoURL" class="aspect-square w-32 rounded-full object-cover md:w-52" />
		{/if}
		<h1 class="text-center text-lg font-bold md:text-2xl">{data.displayName}</h1>
		<Separator class="h-[0.5px] w-2/3 bg-primary" />
		<p class="mb-2 text-center text-sm text-muted md:text-base">{data.bio ?? 'No bio yet'}</p>
		<EditButton currentUsername={data.username ?? null} />
	</div>
	<h1 class="mt-4 text-center text-3xl sm:text-4xl">My Links</h1>
	<div class="w-ful flex justify-center sm:w-3/4 md:w-[550px]">
		{#if data.links && data.links.length > 0}
			<ul class="flex list-none flex-wrap justify-center gap-4 sm:my-6">
				{#each data.links as item}
					<UserLink {...item} />
				{/each}
			</ul>
		{/if}
	</div>
</div>
{#if data.achievements && data.achievements.length > 0}
<div class="relative mx-2 flex flex-col items-center gap-2">
		<div class="absolute rotate-90 lg:-top-[19.35rem] -top-[19rem] left-[24.35rem]"><VectorBl /></div>
		<h1 class="my-4 text-center text-3xl sm:text-4xl">Achievements</h1>
		{#each data.achievements as achievement}
			<a href={data[achievement].certificateURL} target="_blank"><h2 class="hover:custom-drop-shadow-black hover:dark:custom-drop-shadow-white w-full text-center text-2xl text-muted duration-300 hover:text-primary">{data[achievement].certificateTitle}</h2> </a>
			<!-- Todo make animations pop up like on hover it shows! On Phone screen let this be default -->
			<div class="text-center text-muted">
				<p>Issue Date : {data[achievement].issueDate.toDate().toLocaleDateString()}</p>
				<p>Occasion : {data[achievement].occasion?.toUpperCase()}</p>
			</div>
			<Separator class="my-4 w-1/3"></Separator>
			{/each}
	</div>
{/if}


