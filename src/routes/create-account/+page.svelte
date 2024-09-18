<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthCheck from '$lib/components/Auth/AuthCheck.svelte';

	import { Button } from '$lib/components/ui/custom_button';
	import * as Card from '$lib/components/ui/card';

	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';

	import { user, userData, userProfileData } from '$lib/auth/stores';

	import { page } from '$app/stores';
	import { redirectTo } from '$lib/stores/redirect';
	// let redirect = $page.url.searchParams.get('redirect') ?? '';
	let redirect = $redirectTo ?? ""

	let name = '';
	let usn = '';
	let username = '';
	let phone = '';
	let loading = false;
	let isAvailable = false;

	const reUsername = /^(?=[a-z0-9._]{3,16}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
	const reName = /(^[a-zA-Z][a-zA-Z\s]{0,48}[a-zA-Z]$)/;
	const reUSN = /^[A-Z0-9]*$/;
	const rePhone = /^[0-9]{10}$/;

	$: isValidPhone = phone?.length === 10 && rePhone.test(phone);
	$: isTouchedPhone = phone.length >= 1;

	$: isValidName = name?.length > 4 && name.length < 48 && reName.test(name);
	$: isTouchedName = name.length >= 1;

	$: isValidUSN = usn?.length > 1 && usn.length < 15 && reUSN.test(usn);
	$: isTouchedUSN = usn.length >= 1;

	$: isValidUsername = username?.length > 2 && username.length < 16 && reUsername.test(username);
	$: isTouchedUsername = username.length >= 1;
	$: isTakenUsername = isValidUsername && !isAvailable && !loading;

	let debounceTimer: NodeJS.Timeout;

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

	async function createAccount() {
		if ((isValidName && isValidUSN && isValidUsername && isValidPhone) || ($userProfileData?.displayName && $userProfileData.usn && isValidUsername && $userProfileData.phone)) {
			console.log('confirming username', username);

			const response = await fetch(`/api/username?id=${$user?.id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					displayName: name || $userProfileData?.displayName,
					usn: usn || $userProfileData?.usn,
					username: username,
					phone: phone || $userProfileData?.phone
				})
			});
			const data = await response.json();

			user.set(data.user);

			username = '';
			isAvailable = false;
		} else {
			alert('Please enter valid details');
		}
	}
</script>

{#if $userData !== null}
	{#if redirect !== ''}
		{goto(redirect)}
	{:else}
		<!-- {goto('/' + $userData.username + '/edit')} -->
		{goto('/')}
	{/if}
{:else if $user}
	<div class="m-2 flex min-h-screen items-center justify-center">
		<Card.Root class="max-w-2xl">
			<Card.Header class="space-y-1">
				<Card.Title class="text-3xl">Enter your details</Card.Title>
				<h2 class="card-title">Welcome, {$user.name}</h2>
				<Card.Description>You have successfully signed in. Now you can enter your details. Make sure to enter all your details correctly. Some of these details like your name cannot be changed later unless you contact the admins.</Card.Description>
			</Card.Header>

			<form on:submit|preventDefault={createAccount}>
				<Card.Content>
					<div>
						<Label class="text-xl" for="name">Name</Label>
						{#if $userProfileData?.displayName}
							<p class="text-white bg-muted px-3 py-2 text-sm rounded-md">{$userProfileData?.displayName}</p>
						{:else}
							<Input type="text" id="name" placeholder="Enter your full name" bind:value={name} class={!isValidName && isTouchedName ? 'bg-red-200 dark:bg-red-900' : ''} required />
							<p class="mt-1 text-sm text-muted-foreground">This is the name that will appear on your certificates.</p>
							{#if isTouchedName && !isValidName}
								<div>
									<p>The name you have entered is invalid.</p>
									<p class="text-sm text-muted-foreground">Your name must begin with a Capital letter and shouldn't begin or end with a space.</p>
								</div>
							{/if}
						{/if}
					</div>

					<div class="mt-6">
						<Label class="text-xl" for="usn">USN</Label>
						{#if $userProfileData?.usn}
							<p class="text-white bg-muted px-3 py-2 text-sm rounded-md">{$userProfileData.usn}</p>
						{:else}
							<Input type="text" id="usn" placeholder="Enter your college USN" bind:value={usn} class={!isValidUSN && isTouchedUSN ? 'bg-red-200 dark:bg-red-900' : ''} required />
							{#if isTouchedUSN && !isValidUSN}
								<div class="mb-2">
									<p>USN should contain only numbers and CAPITAL letters.</p>
									<p class="text-sm text-muted-foreground">USN must be 2-14 characters long and alphanumeric (CAPITAL letters only)</p>
								</div>
							{/if}
						{/if}
					</div>

					<div class="mt-6">
						<Label for="username" class="mt-10 text-xl">Username</Label>
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

					<div class="mt-6">
						<Label for="whatsapp" class="mt-10 text-xl">Phone Number</Label>
						{#if $userProfileData?.phone}
							<p class="text-white bg-muted px-3 py-2 text-sm rounded-md">{$userProfileData.phone}</p>
						{:else}
							<Input type="text" class="{!isValidPhone && isTouchedPhone ? 'bg-red-200 dark:bg-red-900' : ''} {isValidPhone ? 'bg-green-300 dark:bg-green-800' : ''}" id="usn" placeholder="Enter your WhatsApp Phone Number" bind:value={phone} required />
							{#if isTouchedPhone && !isValidPhone}
								<div>
									<p>Write your number as 10 digits with no other characters</p>
								</div>
							{/if}
						{/if}

						<p class="mt-1 text-sm text-muted-foreground">We will use this number to contact you if necessary.</p>
						<p class="mt-1 text-sm text-muted-foreground">You can also change this number in your account settings.</p>
					</div>
				</Card.Content>

				<Card.Footer>
					<Button class="w-full" type="submit">Submit</Button>
				</Card.Footer>
			</form>
		</Card.Root>
	</div>
{/if}
