<script>
	import * as Accordion from '$lib/components/ui/accordion';
	import Card from './ThemeCards.svelte';
	//@ts-ignore
	import { concurrent } from 'svelte-typewriter';
	const themes = [
		{
			name: 'Healthcare',
			image: '/assets/theme/health.jpg'
		},
		{
			name: 'Education',
			image: '/assets/theme/edu.jpg'
		},
		{
			name: 'Finance',
			image: '/assets/theme/fin.jpg'
		},
		{
			name: 'Agriculture',
			image: '/assets/theme/agri.jpeg'
		}
	];
</script>

<div class="mb-20 px-10 md:px-20 lg:px-32">
	<h1 class="my-10 py-5 text-center font-jbExtrabold text-4xl md:py-10 md:text-5xl">
		<p use:concurrent={{ interval: 100 }}>Problem Statements</p>
	</h1>
	<div class="grid gap-10 md:grid-cols-2">
		{#each themes as theme}
			<Accordion.Root class="z-50">
				<Accordion.Item value={theme.name}>
					<Accordion.Trigger><div class="gradient_border group relative aspect-video h-full w-full overflow-hidden rounded-md border"><Card theme={theme.name} img={theme.image} /></div></Accordion.Trigger>
					<Accordion.Content>
						<h3 class="p-3 font-jbExtrabold text-3xl">Get better Health care system for everybody!</h3>
						<p class="font-jbRegular text-slate-400">Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi natus, animi incidunt accusamus eveniet nesciunt! Excepturi omnis numquam iusto architecto nihil voluptatum tempore ab magnam dignissimos, perspiciatis vel ad mollitia tempora similique adipisci ullam rem velit! Voluptas ad nisi repellendus quidem! Aspernatur, dolor? Reiciendis esse autem sapiente modi repudiandae eligendi?</p></Accordion.Content
					>
				</Accordion.Item>
			</Accordion.Root>
		{/each}
	</div>
</div>
