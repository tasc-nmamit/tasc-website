<script lang="ts">
	import { userProfileData, user, setUser } from '$lib/auth/stores';
	import { exclaim, failure, success } from '../Toast/toast';
	import Button from '../ui/custom_button/button.svelte';
	import Input from '../ui/input/input.svelte';
	import Label from '../ui/label/label.svelte';

	let debounceTimer: NodeJS.Timeout;
    let username: string = '';
    let loading: boolean = false;
	let isAvailable: boolean = false;

	const reUsername = /^(?=[a-z0-9._]{3,16}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
	$: isValidUsername = username?.length > 2 && username.length < 16 && reUsername.test(username);
	$: isTouchedUsername = username.length >= 1;
	$: isTakenUsername = isValidUsername && !isAvailable && !loading;

	async function updateUsername(e: Event) {
		if (!isValidUsername) {
			exclaim('Please enter a valid phone number!');
			return;
		}

		const response = await fetch('/api/username', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: $user?.id,
				username: username
			})
		});
		const data = await response.json();

		if (data.data) {
			success('Updated Username successfully');
			username = '';
			setTimeout(() => { setUser(data.data) }, 3000)
		} else {
			failure('Failed to update Username');
		}
	}

    async function checkAvailability() {
		isAvailable = false;
		clearTimeout(debounceTimer);

		loading = true;

		if (!isTouchedUsername || !isValidUsername) {
			return;
		}

		// We are resetting the setTimeout using debounce such that this function only executes
		// when the user has stopped typing for a certain amount of time (500ms)
		// ps. this is to prevent unnecessary document reads in FireStore
		// without it, the function would run on every keypress
		debounceTimer = setTimeout(async () => {
			console.log('checking availability of', username);

			// const exists = await getDoc(ref).then((doc) => doc.exists());
			// Migration to AuthJS and Prisma
			const response = await fetch(`/api/username?name=${username}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();

			isAvailable = !data.isExists;
			loading = false;
		}, 500);
	}
</script>

<div>
	<h1 class="text-2xl font-medium">Update your Username</h1>
	<div class="w-full py-1">
		<Label class="text-base font-medium text-muted"><span>{$userProfileData?.username}</span></Label>
	</div>

	<div class="grid gap-1.5">
		<Input type="text" class="{!isValidUsername && isTouchedUsername ? 'bg-red-200 dark:bg-red-900' : ''} {isTakenUsername ? 'bg-yellow-200 dark:bg-yellow-700' : ''} {isAvailable && isValidUsername && !loading ? 'bg-green-300 dark:bg-green-800' : ''}" id="username" placeholder="Enter a username" bind:value={username} on:input={checkAvailability} required />
		<p class="mt-1 text-sm text-muted-foreground">Your username is public and is used to access your profile page.</p>

		{#if isTouchedUsername}
			<div class="mt-4">
				{#if loading}
					<p>Checking availability of @{username}...</p>
				{/if}

				{#if !isValidUsername && isTouchedUsername}
					<p class="mt-1 text-sm text-muted-foreground">Username must be 3-16 characters long and alphanumeric (small letters only)</p>
				{/if}

				{#if isValidUsername && !isAvailable && !loading}
					<p>
						@{username} is not available
					</p>
				{/if}

				{#if isValidUsername && isAvailable}
					<p class="text-green-500">@{username} is available</p>
				{/if}
			</div>
		{/if}
	</div>
	<Button class="mt-4 w-1/3 min-w-fit self-center border hover:bg-background" variant="ghost" on:click={updateUsername}>Update Username</Button>
</div>
