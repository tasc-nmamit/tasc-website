<script lang="ts">
	import { page } from '$app/stores';
	import { backgroundColor } from '$lib/actions/style';
	import UpdateBio from '$lib/components/Profile/UpdateBio.svelte';
	import UpdateCollege from '$lib/components/Profile/UpdateCollege.svelte';
	import UpdateColor from '$lib/components/Profile/UpdateColor.svelte';
	import UpdateLinks from '$lib/components/Profile/UpdateLinks.svelte';
	import UpdatePhone from '$lib/components/Profile/UpdatePhone.svelte';
	import UpdatePhoto from '$lib/components/Profile/UpdatePhoto.svelte';
	import Vectorall from '$lib/components/VectorBackground/vectorall.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { userData, userProfileData } from '$lib/auth/stores';
	import { darkTheme } from '$lib/stores/theme';
	import UpdataUsername from '$lib/components/Profile/UpdataUsername.svelte';
</script>

<svelte:body
	use:backgroundColor={{
		color_light: $userProfileData?.lightTheme ?? '',
		color_dark: $userProfileData?.darkTheme ?? '',
		darkTheme: $darkTheme
	}}
/>

{#if $userData?.username == $page.params.username}
	<section class="relative mt-4 flex w-full justify-center px-2 sm:px-0">
		<div class="custom-shadow-black dark:custom-shadow-white mx-auto flex flex-1 flex-col gap-x-8 rounded-2xl border border-primary bg-card bg-opacity-80 p-10 text-center md:mx-4 md:max-w-6xl lg:flex-row">
			<div class="flex flex-col lg:w-1/2">
				<UpdatePhoto />
				<Separator class="my-4 bg-slate-500 dark:bg-muted" />
				<UpdataUsername />
				<Separator class="my-4 bg-slate-500 dark:bg-muted" />
				<UpdatePhone />
			</div>
			<div class="mt-4 flex flex-col md:mt-0 lg:w-1/2">
				<UpdateBio />
				<Separator class="my-4 bg-slate-500 dark:bg-muted" />
				<UpdateLinks />
			</div>
			<div class="mt-4 flex flex-col md:mt-0 lg:w-1/2">
				<UpdateColor />
				<Separator class="my-4 bg-slate-500 dark:bg-muted" />
				<UpdateCollege />
			</div>
		</div>

		<!-- <div>
			<h1 class="text-2xl">Update your College/Institution</h1>
			<UpdateCollege />
		</div>

		<div>
			<h1 class="text-2xl">Pick profile page background-color</h1>
			<div class="mt-4">
				<UpdateColor />
			</div>
		</div> -->
	</section>
	<div class="lg:hidden flex -mt-[58.5rem]"><Vectorall /></div>
{:else}
	You aren't authorized to edit this profile
{/if}
