<script lang="ts">
	import { failure, success } from '$lib/components/Toast/toast';
	import { storage } from '$lib/firebase/firebase';
	import LoadingSVG from '$lib/loader/rolling.svg';
	import { cn } from '$lib/utils';
	import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
	import { userProfileData, user, setUser } from '$lib/auth/stores';
	import * as Dialog from '$lib/components/ui/dialog-publications';

	let previewURL: string;
	let uploading = false;

	async function upload(e: any) {
		uploading = true;
		const file = e.target.files[0];
		const maxSize = 1024 * 512;
		if (file.size > maxSize) {
			// alert('The file is too large. Please upload a file smaller than 512kB.');
			failure('The file is too large. Please upload a file smaller than 512kB.');
			uploading = false;
			return;
		} else {
			previewURL = URL.createObjectURL(file);
			const storageRef = ref(storage, `profile/${$user?.id}/profile.png`);
			const result = await uploadBytes(storageRef, file);

			const url = await getDownloadURL(result.ref);

			const response = await fetch('/api/username', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: $user?.id,
					image: url
				})
			});
			const data = await response.json();

			if (data.data) {
				success('Your profile photo has been updated!');
			} else {
				failure('Failed to update profile photo');
			}
			uploading = false;
		}
	}
</script>

<form class="w-full lg:min-h-[228px]">
	<Dialog.Root>
		<Dialog.Trigger>
			<div class="relative">
				<img src={previewURL ?? $userProfileData?.photoURL ?? '/user.png'} alt="photoURL" class="mx-auto aspect-square h-56 w-56 rounded-3xl border border-primary object-cover" />
				<div class="absolute -right-2 -bottom-2 dark:bg-slate-600 bg-slate-400 p-2 rounded-full">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil size-5">
						<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path>
					</svg>
				</div>
			</div>
		</Dialog.Trigger>
		<Dialog.Content class="lg:w-[35%] md:w-[45%] sm:w-[55%] w-[65%]">
			<h1 class="pt-4 text-2xl font-medium">Change your Profile Photo</h1>

			<p class="mb-2 dark:text-muted">Choose a new photo to change your profile picture</p>

			<div class="mx-auto flex w-full items-center justify-center">
				<label for="dropzone-file" class="flex cursor-pointer items-center justify-center gap-2 rounded-lg">
					<svg class="h-8 w-8 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
					</svg>
					<p class="mb-2 mt-2 text-sm text-muted-foreground">Click to upload</p>
				</label>
				<input name="photoURL" id="dropzone-file" type="file" class="hidden" accept="image/png, image/jpeg, image/gif, image/webp" on:change={upload} />
			</div>

			<p class="mt-2 animate-pulse font-medium text-red-500 hover:animate-none">Max file size limit 500kB</p>
		</Dialog.Content>
	</Dialog.Root>
	<!-- <h1 class="pt-4 text-2xl font-medium">Change your Profile Photo</h1>

	<p class="mb-2 dark:text-muted">Choose a new photo to change your profile picture</p>

	<div class="mx-auto flex w-full items-center justify-center">
		<label for="dropzone-file" class="flex cursor-pointer items-center justify-center gap-2 rounded-lg">
			<svg class="h-8 w-8 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
				<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
			</svg>
			<p class="mb-2 mt-2 text-sm text-muted-foreground">Click to upload</p>
		</label>
		<input name="photoURL" id="dropzone-file" type="file" class="hidden" accept="image/png, image/jpeg, image/gif, image/webp" on:change={upload} />
	</div>

	<p class="mt-2 animate-pulse font-medium text-red-500 hover:animate-none">Max file size limit 500kB</p> -->
	{#if uploading}
		<p>Uploading...</p>
		<div class="mx-auto flex w-full justify-center"><img src={LoadingSVG} alt="spin" class="w-16" /></div>
		<!-- <Progress value={33} /> -->
	{/if}
</form>
