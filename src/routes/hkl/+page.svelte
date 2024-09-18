<script>
	import { darkTheme } from '$lib/stores/theme';
</script>

<div class="bg-[#d3ccff] dark:bg-[#08001f]">
	<div class="flex flex-col pb-0 sm:mx-16">
		<div class="flex justify-end">
			<div class="mx-4 flex w-screen flex-row items-stretch justify-start border-b-8 border-l-8 border-r-8 border-[#18005b] bg-[#eeeeee] dark:border-[#9f8ac2] dark:bg-[#170b3b] sm:m-auto sm:max-h-[90vh] sm:border-l-8 sm:border-r-8 sm:pt-4">
				<input type="button" class="w-8 bg-pink-300" on:click={() => darkTheme.toggle()} />
			</div>
		</div>
		<div class="h-auto w-full">
			<img src="/assets/logo/logo-cropped-lightMode.png" alt="" class="mx-auto my-[25px] w-[60vw] dark:hidden sm:mx-0 sm:my-20 sm:w-[360px]" />
			<img src="/assets/logo/logo-cropped-darkMode.png" alt="" class="mx-auto my-[25px] hidden w-[60vw] dark:flex sm:mx-0 sm:my-20 sm:w-[360px]" />
		</div>
		<div class="sm:w-full">
			<div class="mx-4 mb-5 flex flex-col items-stretch justify-start border-8 border-[#18005b] bg-[#eeeeee] px-10 dark:border-[#9f8ac2] dark:bg-[#170b3b] sm:m-auto sm:h-screen sm:max-h-[90vh] sm:border-x-8 sm:border-b-0 sm:border-t-8 sm:pr-0">
				<div>
					<h1 class="sm:text-10xl z-[10] mt-16 pb-1 pt-2 text-start font-koulen text-7xl text-[#18005b] dark:text-[#ddd7e7] sm:mt-0 sm:pb-[4px] sm:pl-[62px] sm:pt-24 sm:text-start sm:text-7xl md:text-7xl">Smart Nitte Hackathon</h1>

					<div class="h-[8px] bg-[#18005b] dark:bg-[#9f8ac2] sm:ml-16"></div>

					<div class="flex max-w-xl flex-col sm:mx-16">
						<input type="text" class="placeholder placeholder placeholder mt-4 bg-[#ddd7e7] py-4 pl-4 font-sans text-xl text-[#6d57ad] placeholder:font-koulen placeholder:text-2xl placeholder:text-[#6d57ad] active:outline-none dark:bg-[#453c62] dark:text-[#ddd7e7] dark:placeholder:text-[#ddd7e7]" style="height: 48px;" placeholder="Name of Leader" />
						<input type="text" class="placeholder placeholder placeholder mt-4 bg-[#ddd7e7] py-4 pl-4 font-sans text-xl text-[#6d57ad] placeholder:font-koulen placeholder:text-2xl placeholder:text-[#6d57ad] active:outline-none dark:bg-[#453c62] dark:text-[#ddd7e7] dark:placeholder:text-[#ddd7e7]" style="height: 48px;" placeholder="USN of Leader" />
						<input type="text" class="placeholder placeholder placeholder mt-4 bg-[#ddd7e7] py-4 pl-4 font-sans text-xl text-[#6d57ad] placeholder:font-koulen placeholder:text-2xl placeholder:text-[#6d57ad] active:outline-none dark:bg-[#453c62] dark:text-[#ddd7e7] dark:placeholder:text-[#ddd7e7]" style="height: 48px;" placeholder="Email of Leader" />
						<input type="text" class="placeholder placeholder placeholder mt-4 bg-[#ddd7e7] py-4 pl-4 font-sans text-xl text-[#6d57ad] placeholder:font-koulen placeholder:text-2xl placeholder:text-[#6d57ad] active:outline-none dark:bg-[#453c62] dark:text-[#ddd7e7] dark:placeholder:text-[#ddd7e7]" style="height: 48px;" placeholder="Phone of Leader" />
					</div>
					<div class="my-4 flex max-w-xl flex-row pb-20 sm:mx-16">
						<button type="button" class="duration-400 mr-1 h-12 w-16 bg-[#18005b] font-koulen text-4xl text-[#ddd7e7] hover:bg-[#6d57ad] active:bg-[#ddd7e7] active:text-[#08001f] dark:bg-[#ddd7e7] dark:text-[#08001f] dark:hover:bg-[#3c335f] dark:hover:text-[#ddd7e7] dark:active:bg-[#08001f]">&lt</button>

						<button type="button" class="duration-400 mr-4 h-12 w-16 bg-[#18005b] font-koulen text-4xl text-[#ddd7e7] hover:bg-[#6d57ad] active:bg-[#ddd7e7] active:text-[#08001f] dark:bg-[#ddd7e7] dark:text-[#08001f] dark:hover:bg-[#3c335f] dark:hover:text-[#ddd7e7] dark:active:bg-[#08001f]">&gt</button>

						<button type="button" class="duration-400 h-12 w-full bg-[#18005b] pl-4 text-start font-koulen text-2xl text-[#ddd7e7] hover:bg-[#6d57ad] active:bg-[#ddd7e7] active:text-[#08001f] dark:bg-[#ddd7e7] dark:text-[#08001f] dark:hover:bg-[#3c335f] dark:hover:text-[#ddd7e7] dark:active:bg-[#08001f]">Submit</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
