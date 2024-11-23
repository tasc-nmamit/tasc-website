<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { setUser, user, userData, userProfileData } from '$lib/auth/stores';
	import { exclaim, failure, success } from '$lib/components/Toast/toast';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import QRCode from 'qrcode';
	export let data: any;
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';

	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import Button from '$lib/components/ui/button/button.svelte';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';

	let userInfo: { name: string | null; phone: string | null; usn: string | null; team: string | null; teamName: string | null; teamId: string | null; transactionId: string | null } = { name: null, phone: null, usn: null, team: null, teamName: null, teamId: null, transactionId: null };
	let teamDetails: { name: string; id: string } | null = null;
	let username = '';
	let qrCodeDataUrl = '';

	const reUsername = /^(?=[a-z0-9._]{3,16}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
	const reName = /(^[a-zA-Z][a-zA-Z\s]{0,48}[a-zA-Z]$)/;
	const reUSN = /^[A-Z0-9]*$/;
	const rePhone = /^[0-9]{10}$/;
	const reCUID = /^c[a-z0-9]{24}$/;
	const reId = /^[a-zA-Z0-9]+$/;
	
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

	$: isValidTransactionId = userInfo.transactionId && userInfo.transactionId.length >= 1 && reId.test(userInfo.transactionId);
	$: isTouchedTransactionId = userInfo.transactionId && userInfo.transactionId.length >= 1;

	$: isValidUsername = username?.length > 2 && username.length < 16 && reUsername.test(username);
	$: isTouchedUsername = username.length >= 1;
	$: isTakenUsername = isValidUsername && !isAvailable && !loading;

	// Reactive block to handle disabling button logic
	$: disabled = true;

	$:{
		const isFieldsPresent = (userInfo.name?.length ?? 0) > 0
			&& (userInfo.phone?.length ?? 0) > 0
			&& (userInfo.usn?.length ?? 0) > 0
			&& ($userData?.username === null ? ((username.length ?? 0) > 0): true);

		let isValidTeam = false;
		if(data.event.type === "TEAM"){
			if(userInfo.team === 'create'){
				isValidTeam = (userInfo.teamName?.length ?? 0) > 0
					&& isValidTeamName as boolean
					&& (data.event.entryFee ? (userInfo.transactionId?.length ?? 0) > 0 && isValidTransactionId as boolean : true);
			}else if(userInfo.team == 'join') {
				isValidTeam = (userInfo.teamId?.length ?? 0) > 0 && isValidTeamId as boolean;
			}
		} else if(data.event.type == "SOLO") 
			isValidTeam = true && (data.event.entryFee ? (userInfo.transactionId?.length ?? 0) > 0 && isValidTransactionId as boolean : true);;
		disabled =  !isFieldsPresent || !isValidTeam || !($userData?.username === null ? isTakenUsername : true);
	}
	
	let loading = false;
	let isAvailable = false;
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

	onMount(async () => {
		if (!$user) {
			await signIn('google');
			setUser({ session: data.session, links: data.links });
		} else {
			userInfo = { name: $user.displayName, phone: $user.phone, usn: $user.usn, team: '', teamName: '', teamId: '', transactionId: '' };
		}
		checkRegistration();

		if ($page.data.event.qr) {
			qrCodeDataUrl = await QRCode.toDataURL($page.data.event.qr);
		}
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

	async function createAccount() {
		if (isValidName && isValidUSN && isValidUsername && isValidPhone) {
			const response = await fetch(`/api/username?id=${$user?.id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					displayName: userInfo.name,
					usn: userInfo.usn,
					username: username,
					phone: userInfo.phone
				})
			});
			const data = await response.json();

			user.set(data.user);

			success('Account created successfully');
		} else {
			exclaim('Please enter valid details');
		}
	}

	const registerForEvent = async () => {
		if ($userData === null && userInfo.name && userInfo.phone && userInfo.usn) {
			await createAccount();
		}

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
					maxTeamSize: data.event.maxTeamSize,
					maxTeamCount: data.event.maxTeams,
					transactionId: userInfo.transactionId
				})
			});

			const res = await response.json();
			if (res.created) {
				success('Team created successfully');
				if (userInfo.teamName) teamDetails = { name: userInfo.teamName, id: res.team.id };
				setTimeout(() => {
					goto('/events/upcoming/');

					// disabled = false;
				}, 5000);
			} else if (res.joined) {
				success(`Joined team ${res.team.name} successfully`);
				setTimeout(() => {
					goto('/events/upcoming/');

					// disabled = false;
				}, 3000);
			} else if (res.success) {
				success(`Registered for ${data.event.title} successfully`);
				setTimeout(() => {
					goto('/events/upcoming/');

					// disabled = false;
				}, 3000);
			} else {
				exclaim(res.error);
				failure('Failed to register for the event');
				setTimeout(() => {
					goto('/events/upcoming/');

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


	// team select
	let open = false;
	let value = '';

	const options = [
		{
			value: 'create',
			label: 'Create Team'
		},
		{
			value: 'join',
			label: 'Join Team'
		}
	];

	$: selectedValue = options.find((f) => f.value === value)?.label ?? 'Select an option';
	$: {
		userInfo.team = options.find((f) => f.value === value)?.value ?? '';
	}
</script>

<!-- HTML template -->
<div class={`p-10 ${$page.data.session === null ? 'hidden' : 'block'}`}>
	<h1 class="mb-5 text-center text-4xl font-bold">{data.event.title}</h1>
	<div class="m-auto flex w-auto min-w-[250px] flex-col rounded-3xl border p-5 backdrop-blur-md dark:bg-transparent sm:min-w-[400px] md:min-w-[500px] md:max-w-[600px]">
		<Label for="name" class="text-xl">Name</Label>
		<Input type="text" name="name" placeholder="Name..." bind:value={userInfo.name} class={` ${!isValidName && isTouchedName ? 'bg-red-200 dark:bg-red-900' : ''}`} required />
		{#if isTouchedName && !isValidName}
			<div>
				<p>The name you have entered is invalid.</p>
				<p class="text-sm text-muted-foreground">Your name must begin with a Capital letter and shouldn't begin or end with a space.</p>
			</div>
		{/if}
		<br />
		<Label for="phone" class="text-xl">Phone number</Label>

		<Input type="text" name="phone" placeholder="Phone Number..." bind:value={userInfo.phone} class={!isValidPhone && isTouchedPhone ? 'bg-red-200 dark:bg-red-900' : ''} required />
		{#if isTouchedPhone && !isValidPhone}
			<div>
				<p>Write your number as 10 digits with no other characters</p>
			</div>
		{/if}
		<br />

		<!-- add username if new user -->
		{#if $userData === null || $userData?.username === null}
			<div class="mb-5">
				<Label for="username" class="text-xl">Username</Label>
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
		{/if}

		<Label for="usn" class="text-xl">USN</Label>
		<Input type="text" name="usn" placeholder="USN..." bind:value={userInfo.usn} class={!isValidUSN && isTouchedUSN ? 'bg-red-200 dark:bg-red-900' : ''} required />
		{#if isTouchedUSN && !isValidUSN}
			<div class="mb-2">
				<p>USN should contain only numbers and CAPITAL letters.</p>
				<p class="text-sm text-muted-foreground">USN must be 2-14 characters long and alphanumeric (CAPITAL letters only)</p>
			</div>
		{/if}
		{#if $page.data.event.entryFee && data.event.type === 'SOLO'}
			<div class="h-50 w-50 mx-auto my-5">
				<p class="text-center text-xl">Scan and pay the entry fee</p>
				<br />
				<div class="m-auto w-fit">
					<img src={qrCodeDataUrl} alt="QR Code" />
				</div>
				<br />
				<label for="transactionId">UPI Transaction ID</label>
				<Input type="text" name="transactionId" placeholder="UPI Transaction Id" bind:value={userInfo.transactionId} class={cn(`${!isValidTransactionId && isTouchedTransactionId ? 'bg-red-200 dark:bg-red-900' : ''}`, '')} required />
			</div>
		{/if}
		{#if data.event.type === 'TEAM'}
			<br />
			<label for="team" class="text-xl">Create or join a team</label>
			<Popover.Root bind:open>
				<Popover.Trigger asChild let:builder>
					<Button builders={[builder]} variant="outline" role="combobox" aria-expanded={open} class="w-[200px] justify-between dark:hover:bg-brand hover:bg-[rgb(234,172,255)]">
						{selectedValue}
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-[200px] p-0">
					<Command.Root>
						<Command.Group>
							{#each options as option}
								<Command.Item
									class="dark:aria-selected:bg-brand dark:hover:aria-selected:bg-brand aria-selected:bg-[rgb(234,172,255)] hover:aria-selected:bg-[rgb(234,172,255)]"
									value={option.value}
									onSelect={(currentValue) => {
										value = currentValue;
										open = false;
									}}
								>
									<!-- <Check class={cn('mr-2 h-4 w-4', value !== framework.value && 'text-transparent')} /> -->
									{option.label}
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>

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
				{#if $page.data.event.entryFee}
					<div class="h-50 w-50 mx-auto my-5">
						<p class="text-center text-xl">Scan and pay the entry fee</p>
						<br />
						<div class="m-auto w-fit">
							<img src={qrCodeDataUrl} alt="QR Code" />
						</div>
						<br />
						<label for="transactionId">UPI Transaction ID</label>
						<Input type="text" name="transactionId" placeholder="UPI Transaction Id" bind:value={userInfo.transactionId} class={cn(`${!isValidTransactionId && isTouchedTransactionId ? 'bg-red-200 dark:bg-red-900' : ''}`, '')} required />
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
				<div class="grid grid-cols-9 mb-2">
					<p class="md:text-xl sm:text-lg text-md self-center col-span-2">Team Name</p>
					<Input type="text" readonly value={teamDetails.name} class="col-span-6" />
				</div>
				<div class="grid grid-cols-9 col-span-2 mb-2">
					<p class="md:text-xl sm:text-lg text-md self-center col-span-2">Team ID</p>
					<Input type="text" readonly value={teamDetails.id} class="col-span-6" />
					<button on:click={copyToClipboard} class="justify-self-center self-center"
						><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="white" d="M15.24 2h-3.894c-1.764 0-3.162 0-4.255.148c-1.126.152-2.037.472-2.755 1.193c-.719.721-1.038 1.636-1.189 2.766C3 7.205 3 8.608 3 10.379v5.838c0 1.508.92 2.8 2.227 3.342c-.067-.91-.067-2.185-.067-3.247v-5.01c0-1.281 0-2.386.118-3.27c.127-.948.413-1.856 1.147-2.593s1.639-1.024 2.583-1.152c.88-.118 1.98-.118 3.257-.118h3.07c1.276 0 2.374 0 3.255.118A3.6 3.6 0 0 0 15.24 2" /><path fill="white" d="M6.6 11.397c0-2.726 0-4.089.844-4.936c.843-.847 2.2-.847 4.916-.847h2.88c2.715 0 4.073 0 4.917.847S21 8.671 21 11.397v4.82c0 2.726 0 4.089-.843 4.936c-.844.847-2.202.847-4.917.847h-2.88c-2.715 0-4.073 0-4.916-.847c-.844-.847-.844-2.21-.844-4.936z" /></svg></button
					>
					<!-- <button on:click={copyToClipboard} class=" ml-2 rounded-md bg-[rgb(240,240,240)] p-2 font-bold text-black">Copy</button> -->
				</div>
				<p>Ask your friends to join your team using this team id.</p>
				<p>You can also check the team details in the event details page.</p>
			{/if}
		{/if}

		{#if $user && !$userData}
			<p class="mt-4 p-2"><span class="text-lg font-bold">Note:</span> You didn't create an account yet. Changes made here will reflect in your profile</p>
		{/if}

		<Button disabled={disabled} on:click={registerForEvent} class={`m-auto mt-5 max-w-[100px] rounded-sm text-white bg-brand px-5 py-2 disabled:bg-[rgb(234,172,255)] ${disabled ? 'disabled:' : ''}`}>Register</Button>
	</div>
</div>
