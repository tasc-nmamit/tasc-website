<script lang="ts">
	export let event;
	const options: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	};
</script>

<div class="flex w-full h-full flex-col">
	<div class="dark:custom-shadow-black bg-muted-light dark:bg-muted-dark flex-1 rounded-lg px-5 py-8 shadow-xl dark:drop-shadow-md m-auto">
		<div class="flex justify-center">
			{#if event.image}
				<img src={event?.image} alt={event.title} class="border-muted-light dark:border-muted-dark border object-cover m-auto" />
			{/if}
		</div>
		<h1 class="py-4 text-center text-2xl font-bold">{event.title}</h1>
		{#if event.date}
			<h2 class="text-center text-xl">Date: {event.date.toLocaleDateString(undefined, options)}</h2>
		{/if}
		{#if event.time}
			<h2 class="text-center text-xl">Time: {event.time}</h2>
		{/if}
		{#if event.venue}
			<h2 class="text-center text-xl">Venue: {event?.venue}</h2>
		{/if}

		<div class="flex items-center justify-center pt-4">
			<!-- {#if event.registrationLink}
                    <a href={event.registrationLink} target="_blank">
                        <button class="rounded-xl bg-brand px-4 py-2 text-white duration-200 hover:scale-110"> Register Now </button>
                    </a>
                {/if} -->
			<!-- <button class="rounded-xl bg-brand px-4 py-2 text-white">Registration Closed! Spot Registrations are Available</button> -->
		</div>
	</div>
</div>
