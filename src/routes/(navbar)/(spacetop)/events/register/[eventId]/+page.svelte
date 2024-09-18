<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { setUser, user, userProfileData } from '$lib/auth/stores';
	import { exclaim, failure, success } from '$lib/components/Toast/toast';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	export let data: any;

	let userInfo: { name: string | null; phone: string | null; usn: string | null; team: string | null; teamName: string | null; teamId: string | null } = { name: null, phone: null, usn: null, team: null, teamName: null, teamId: null };
	let teamDetails: { name: string; id: string } | null = null;
	let disabled: boolean = true;

	const reName = /(^[a-zA-Z][a-zA-Z\s]{0,48}[a-zA-Z]$)/;
	const reUSN = /^[A-Z0-9]*$/;
	const rePhone = /^[0-9]{10}$/;
	const reCUID = /^c[a-z0-9]{24}$/;

	$: isValidPhone = userInfo.phone && userInfo.phone?.length === 10 && rePhone.test(userInfo.phone);
	$: isTouchedPhone = userInfo.phone && userInfo.phone.length >= 1;

	$: isValidName = userInfo.name && userInfo.name?.length > 4 && userInfo.name.length < 48 && reName.test(userInfo.name);
	$: isTouchedName = userInfo.name && userInfo.name.length >= 1;

	$: isValidTeamName = userInfo.teamName && userInfo.teamName?.length > 4 && userInfo.teamName.length < 48 && reName.test(userInfo.teamName);
	$: isTouchedTeamName = userInfo.teamName && userInfo.teamName.length >= 1;

	$: isValidUSN = userInfo.usn && userInfo.usn?.length > 1 && userInfo.usn.length < 15 && reUSN.test(userInfo.usn);
	$: isTouchedUSN = userInfo.usn && userInfo.usn.length >= 1;

	$: isValidTeamId = userInfo.teamId && reCUID.test(userInfo.teamId);
	$: isTouchedTeamId = userInfo.teamId && userInfo.teamId.length >= 1;

	onMount(async () => {
		if (!$user) {
			await signIn('google');
			setUser({ session: data.session, links: data.links });
		} else {
			userInfo = { name: $user.displayName, phone: $user.phone, usn: $user.usn, team: '', teamName: '', teamId: '' };
		}
		checkRegistration();
	});

	const checkRegistration = async () => {
		if ($user) {
			const response = await fetch(`/api/eventRegistration?eventId=${data.event.id}&studentId=${$user.id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const res = await response.json();
			if (res.isExists) {
				exclaim('You have already registered for the event');
				setTimeout(() => goto('/events/upcoming'), 3000);
			}
		}
	};

	const registerForEvent = async () => {
		disabled = true;
		if ($user) {
			const response = await fetch('/api/eventRegistration', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					eventId: data.event.id,
					userCreate: $user.displayName && $user.phone && $user.usn ? false : true,
					userId: $user.id,
					userName: userInfo.name,
					userPhone: userInfo.phone,
					userUsn: userInfo.usn,
					userUsername: $user.email.split('@')[0],
					team: userInfo.team,
					teamName: userInfo.teamName,
					teamId: userInfo.teamId,
					maxTeamSize: data.event.maxTeamSize
				})
			});

			const res = await response.json();
			if (res.created) {
				success('Team created successfully');
				if (userInfo.teamName) teamDetails = { name: userInfo.teamName, id: res.team.id };
			} else if (res.joined) {
				success(`Joined team ${res.team.name} successfully`);
				setTimeout(() => {
					goto('/events/upcoming');

					// disabled = false;
				}, 3000);
			} else if (res.success) {
				success(`Registered for ${data.event.title} successfully`);
				setTimeout(() => {
					goto('/events/upcoming');

					// disabled = false;
				}, 3000);
			} else {
				exclaim(res.error);
				failure('Failed to register for the event');
				setTimeout(() => {
					goto('/events/upcoming');

					// disabled = false;
				}, 3000);
			}

			if (res.userCreate) setTimeout(() => user.set({ ...$user, displayName: userInfo.name, phone: userInfo.phone, usn: userInfo.usn, username: $user.email.split('@')[0] }), 3000);
		}
	};

	// Clipboard action
	const copyToClipboard = () => {
		if (teamDetails) {
			navigator.clipboard
				.writeText(teamDetails.id)
				.then(() => {
					exclaim('Team ID copied to clipboard');
					goto('/events/upcoming');
				})
				.catch(() => {
					failure('Failed to copy Team ID to clipboard');
				});
		}
	};

	// Reactive block to handle disabling button logic
	$: disabled = !(userInfo.name && userInfo.phone && userInfo.usn) || (data.event.type === 'TEAM' && ((userInfo.team === 'create' && !userInfo.teamName) || (userInfo.team === 'join' && !userInfo.teamId) || !userInfo.team));
</script>

<!-- HTML template -->
<div class="p-10">
	<h1 class="mb-5 text-center text-4xl font-bold">{data.event.title}</h1>
	<div class="m-auto flex min-w-[250px] w-auto flex-col rounded-3xl border p-5 backdrop-blur-md dark:bg-transparent sm:min-w-[400px] md:min-w-[500px] md:max-w-[600px]">
		<Label for="name" class="text-xl">Name</Label>
		{#if $userProfileData?.displayName}
			<p class="rounded-md bg-muted px-3 py-2 text-sm text-white">{$userProfileData?.displayName}</p>
		{:else}
			<Input type="text" name="name" placeholder="Name..." bind:value={userInfo.name} class={` ${!isValidName && isTouchedName ? 'bg-red-200 dark:bg-red-900' : ''}`} required />
			{#if isTouchedName && !isValidName}
				<div>
					<p>The name you have entered is invalid.</p>
					<p class="text-sm text-muted-foreground">Your name must begin with a Capital letter and shouldn't begin or end with a space.</p>
				</div>
			{/if}
		{/if}
		<br />
		<Label for="phone" class="text-xl">Phone number</Label>
		{#if $userProfileData?.phone}
			<p class="rounded-md bg-muted px-3 py-2 text-sm text-white">{$userProfileData?.phone}</p>
		{:else}
			<Input type="text" name="phone" placeholder="Phone Number..." bind:value={userInfo.phone} class={!isValidPhone && isTouchedPhone ? 'bg-red-200 dark:bg-red-900' : ''} required />
			{#if isTouchedPhone && !isValidPhone}
				<div>
					<p>Write your number as 10 digits with no other characters</p>
				</div>
			{/if}
		{/if}
		<br />
		<Label for="usn" class="text-xl">USN</Label>
		{#if $userProfileData?.usn}
			<p class="rounded-md bg-muted px-3 py-2 text-sm text-white">{$userProfileData.usn}</p>
		{:else}
			<Input type="text" name="usn" placeholder="USN..." bind:value={userInfo.usn} class={!isValidUSN && isTouchedUSN ? 'bg-red-200 dark:bg-red-900' : ''} required />
			{#if isTouchedUSN && !isValidUSN}
				<div class="mb-2">
					<p>USN should contain only numbers and CAPITAL letters.</p>
					<p class="text-sm text-muted-foreground">USN must be 2-14 characters long and alphanumeric (CAPITAL letters only)</p>
				</div>
			{/if}
		{/if}

		{#if data.event.type === 'TEAM'}
			<br />
			<label for="team" class="text-xl">Create or join a team</label>
			<select name="team" bind:value={userInfo.team} class="w-fit rounded-lg border p-2 dark:bg-transparent dark:text-white">
				<option value="" disabled class="text-black">Choose an option</option>
				<option value="create" class="text-black">Create Team</option>
				<option value="join" class="text-black">Join Team</option>
			</select>

			{#if userInfo.team === 'create'}
				<br />
				<label for="teamName" class="text-xl">Team Name</label>
				<Input type="text" name="teamName" placeholder="Team Name..." bind:value={userInfo.teamName} class={`dark:bg-tranparent bg-white text-black dark:bg-opacity-0 dark:text-white ${!isValidTeamName && isTouchedTeamName ? 'bg-red-200 dark:bg-red-900' : ''}`} required />
				{#if isTouchedTeamName && !isValidTeamName}
					<div>
						<p>The team name you have entered is invalid.</p>
						<p class="text-sm text-muted-foreground">Your team name must begin with a Capital letter, must contain atleast 5 characters and shouldn't begin or end with a space.</p>
					</div>
				{/if}
			{:else if userInfo.team === 'join'}
				<br />
				<label for="teamId" class="text-xl">Team ID</label>
				<Input type="text" name="teamId" placeholder="Team ID..." bind:value={userInfo.teamId} class={!isValidTeamId && isTouchedTeamId ? 'bg-red-200 dark:bg-red-900' : ''} required />
				{#if isTouchedTeamId && !isValidTeamId}
					<div class="mb-2">
						<p>Team ID should start with a lowercase 'c' and contain only lowercase letters and numbers.</p>
						<p class="text-sm text-muted-foreground">Team ID must be exactly 25 characters long, starting with 'c'.</p>
					</div>
				{/if}
			{/if}

			{#if teamDetails}
				<br />
				<p class="text-xl">Team Name: {teamDetails.name}</p>
				<div class="flex flex-row flex-nowrap">
					<p class="text-nowrap text-xl">Team ID:</p>
					<Input type="text" readonly value={teamDetails.id} />
					<button on:click={copyToClipboard} class="ml-2"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="white" d="M15.24 2h-3.894c-1.764 0-3.162 0-4.255.148c-1.126.152-2.037.472-2.755 1.193c-.719.721-1.038 1.636-1.189 2.766C3 7.205 3 8.608 3 10.379v5.838c0 1.508.92 2.8 2.227 3.342c-.067-.91-.067-2.185-.067-3.247v-5.01c0-1.281 0-2.386.118-3.27c.127-.948.413-1.856 1.147-2.593s1.639-1.024 2.583-1.152c.88-.118 1.98-.118 3.257-.118h3.07c1.276 0 2.374 0 3.255.118A3.6 3.6 0 0 0 15.24 2" /><path fill="white" d="M6.6 11.397c0-2.726 0-4.089.844-4.936c.843-.847 2.2-.847 4.916-.847h2.88c2.715 0 4.073 0 4.917.847S21 8.671 21 11.397v4.82c0 2.726 0 4.089-.843 4.936c-.844.847-2.202.847-4.917.847h-2.88c-2.715 0-4.073 0-4.916-.847c-.844-.847-.844-2.21-.844-4.936z" /></svg></button>
					<!-- <button on:click={copyToClipboard} class=" ml-2 rounded-md bg-[rgb(240,240,240)] p-2 font-bold text-black">Copy</button> -->
				</div>
				<p>Ask your friends to join your team using this team id</p>
			{/if}
		{/if}

		<button {disabled} on:click={registerForEvent} class={`m-auto mt-5 max-w-[100px] rounded-sm bg-[rgb(207,85,247)] px-5 py-2 disabled:bg-[rgb(234,172,255)] ${disabled ? 'disabled:' : ''}`}>Register</button>
	</div>
</div>
