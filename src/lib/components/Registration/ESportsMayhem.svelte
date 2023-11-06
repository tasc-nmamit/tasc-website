<script lang="ts">
	import { Input } from '$lib/components/ui/input';
</script>

<div class="pt-4">
	<h1 class="text-center text-5xl font-bold text-brand md:text-7xl">E-Sports Mayhem</h1>
	<div class="mx-10 flex items-center justify-center py-10">
		<div class="w-full max-w-[100rem] space-y-6 rounded-xl bg-gray-300 p-6 dark:bg-muted-dark">
			<div class="flex flex-col items-center space-y-6 md:flex-row md:space-y-0">
				<div class="w-full md:w-1/2 md:pr-10">
					<img src="/Images/Events/Current.png" alt="Banner" class="w-full rounded-xl" />
				</div>

				<div class="flex w-full flex-col justify-center space-y-6 md:max-w-7xl">
					<p class="text-md md:text-lg lg:text-xl">Dear Participants, introducing "E-SPORTS MAYHEM," an exciting esports event where you can flaunt your gaming skills in Valorant, BGMI (Battlegrounds Mobile India), and COD Mobile (Call of Duty Mobile)</p>
					<div class="text-md space-y-2 md:text-lg lg:text-xl">
						<p>Number of Teammates:</p>
						<ul>
							<li>Valorant: 5</li>
							<li>BGMI: 4</li>
							<li>COD Mobile: 5</li>
						</ul>
					</div>
					<div class="text-md space-y-2 md:text-lg lg:text-xl">
						<p>Entry fee per team:</p>
						<ul>
							<li>Valorant: 250 INR</li>
							<li>BGMI: 160 INR</li>
							<li>COD Mobile: 150 INR</li>
						</ul>
					</div>
					<p class="text-md md:text-lg lg:text-xl">To participate, simply fill out the form below and let the games begin! (TEAM LEADER ONLY)</p>
					<div class="text-md md:text-lg lg:text-xl">
						<p class="font-bold text-red-600">NOTE:</p>
						<p>1. Spot registrations will be open during the event.</p>
						<p>2. Entry fee will be collected at venue.</p>
						<p>3. Details of the teammates will also be collected there.</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class=" space-y-6">
		<h3 class="text-center text-5xl text-brand">Register</h3>

		<div class=" mx-10 flex items-center justify-center py-10">
			<div class="w-full max-w-[100rem] space-y-6 rounded-xl bg-gray-300 p-6 dark:bg-muted-dark">
				<form action="https://docs.google.com/forms/d/e/1FAIpQLSdB47YWfENsSlr6c-00g1OOjX9m25_6sXeiID9MmE2K4peOyg/formResponse" method="POST" enctype="multipart/form-data">
					<p class="pb-4 font-semibold text-red-600">Only team leader has to fill the form!</p>
					<div class="grid-column-1 grid w-full max-w-[100rem] space-y-6 text-black dark:text-white">
						<section class="space-y-4">
							<label for="name">Name*</label>
							<Input type="text" id="name" name="entry.1148244634" class=" bg-transparent font-semibold text-brand" required />
						</section>

						<section class="space-y-4">
							<label for="usn">USN*</label>
							<Input type="text" id="usn" name="entry.1585445463" class=" bg-transparent font-semibold text-brand" required />
						</section>

						<section class="space-y-4">
							<label for="sem">Semester*</label>
							<div id="sem" class="w-full">
								<select name="entry.277806095" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-semibold text-brand ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
									<option value="">Choose Semester</option>
									<option value="1">1</option>
									<option value="3">3</option>
									<option value="5">5</option>
									<option value="7">7</option>
								</select>
							</div>
						</section>

						<section class="space-y-4">
							<label for="ceid">College Email ID*</label>
							<Input type="text" id="ceid" name="entry.1208215970" class="bg-transparent font-semibold text-brand" required />
						</section>

						<section class="space-y-4">
							<label for="peid">Personal Email ID*</label>
							<Input type="text" id="peid" name="entry.975491952" class="bg-transparent font-semibold text-brand" required />
						</section>

						<section class="space-y-4">
							<label for="pno">Phone Number*</label>
							<Input type="text" name="entry.449953573" class="bg-transparent font-semibold text-brand" required />
						</section>

						<section class="space-y-4">
							<label for="event">Event*</label>
							<div id="event" class="w-full">
								<select name="entry.1222655786" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-semibold text-brand ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
									<option value="">Choose Event</option>
									<option value="CODM">Call of Duty Mobile</option>
									<option value="BGMI">BattleGrounds Mobile India</option>
									<option value="Valorant">Valorant</option>
								</select>
							</div>
						</section>

						<section class="space-y-4">
							<label for="team">Team name*</label>
							<Input id="team" type="text" name="entry.1257526011" placeholder="Team Name" class="bg-transparent font-semibold text-brand" required />
						</section>
					</div>

					<div class="flex w-full justify-center">
						<button type="submit" class="mt-6 rounded-xl bg-brand px-10 py-2 text-xl text-white duration-200 hover:scale-110 hover:shadow-lg hover:shadow-brand">Submit</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
