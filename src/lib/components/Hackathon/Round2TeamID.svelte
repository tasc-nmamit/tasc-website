<script lang="ts">
	import type { TeamDataSNH2023 } from '$lib/types/TeamData';
	export let data: TeamDataSNH2023;
</script>

<div class="flex h-full min-h-screen w-full flex-col items-center justify-center space-y-6 pt-[8dvh]">
	<h2 class="pt-4 font-jbExtrabold text-3xl md:text-4xl">Your Team</h2>

	<div class="text-md mx-5 w-[23rem] cursor-default rounded-2xl border-[1px] border-[#d2b863] bg-gray-400 bg-opacity-5 px-5 py-2 backdrop-blur-sm transition duration-300 md:w-[35rem] md:p-10 md:text-2xl">
		<ul class="mt-5 space-y-2">
			<p class="font-jbRegular">Team Name: <span class="text-[#fffba4]">Team Name</span></p>
			<p class="flex items-center space-x-2 font-jbRegular">
				Team ID:
				<span class="pl-3 text-[#fffba4]">ID</span>
			</p>
			<h2 class="pt-4 font-jbExtrabold">Team Members</h2>
			<div class="flex flex-col space-y-2">
				<!-- {#each data.memberInfo as memberInfo}
						{#if memberInfo.id == data.leader} -->
				<div>
					<p class="mt-2 font-jbRegular text-[#fffba4]">👑 Member1</p>
					<p class="font-jbRegular text-[#fffba4]">☎️ 919191919191</p>
				</div>

				<!-- {:else} -->
				<div>
					<p class="font-jbRegular text-[#fffba4]">♟️ Member2</p>
					<p class="font-jbRegular text-[#fffba4]">☎️ 919191919191</p>
				</div>

				<div>
					<p class="font-jbRegular text-[#fffba4]">♟️ Member2</p>
					<p class="font-jbRegular text-[#fffba4]">☎️ 919191919191</p>
				</div>

				<!-- {/if}
					{/each} -->
			</div>

			<!-- {#if data.memberCount == 3} -->
			<p class="pt-2 font-semibold">Count : 3</p>
			<!-- {:else}
					<p>You need to add {3 - data.memberCount} more {data.memberCount == 2 ? 'member' : 'members'}</p>
				{/if} -->
		</ul>
	</div>
	<h2 class="pt-4 text-center font-jbExtrabold text-3xl md:text-4xl">Congrats For qualifying!🎉</h2>
	<p class="text-center font-jbRegular text-lg text-slate-400">Will be contacting you soon!</p>
</div>
