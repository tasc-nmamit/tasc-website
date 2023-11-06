<script>
	const githubLink = 'https://github.com/tasc-nmamit';
	const linkedinLink = 'https://linkedin.com/company/tasc';
	const instagramLink = 'https://www.instagram.com/tasc_nmamit';
	import { GithubIcon, InstagramIcon, LinkedinIcon } from 'lucide-svelte';
</script>

<div class="bg-slate-900 font-jbRegular uppercase">
	<footer class="body-font tracking-wider">
		<div class="container mx-auto flex flex-col flex-wrap md:flex-row md:flex-nowrap md:items-center lg:items-start">
			<div class="mx-6 mb-6 mt-10 flex flex-grow md:mt-0 md:pl-20">
				<div class="w-full p-4 px-4 md:w-1/2 lg:w-1/2">
					<div class="flex flex-col text-white">
						<div class="flex flex-col gap-4 text-white">
							<div class="flex gap-4">
								<GithubIcon />
								<a href={githubLink} target="_blank">GitHub</a>
							</div>
							<div class="flex gap-4">
								<LinkedinIcon />
								<a href={linkedinLink} target="_blank">LinkedIn</a>
							</div>
							<div class="flex gap-4">
								<InstagramIcon />
								<a href={instagramLink} target="_blank">Instagram</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="mx-10 flex-shrink-0 text-white md:w-1/3">
				<p class="pt-4 font-jbBold">TASC</p>
				<p class="pt-3 font-jbBold">Department of AIML</p>
				<p class="pt-2">NMAMIT of Technology, Nitte ,Karkala</p>
				<a href="mailto:tasc@nmamit.in" target="_blank">tasc_aiml@nmamit.in</a>
			</div>
		</div>
		<div class="text-white">
			<p class="px-5 py-5 text-center">
				TASC © {new Date().getFullYear()}
			</p>
		</div>
	</footer>
</div>
