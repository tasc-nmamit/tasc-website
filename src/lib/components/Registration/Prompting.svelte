<script lang="ts">
	import { Input } from '$lib/components/ui/input';
</script>

<div class="pt-4">
	<h1 class="text-center text-5xl font-bold text-brand md:text-7xl">Prompting Unleashed</h1>
	<div class="mx-10 flex items-center justify-center py-10">
		<div class="w-full max-w-[100rem] space-y-6 rounded-xl bg-gray-300 p-6 dark:bg-muted-dark">
			<div class="flex flex-col items-center space-y-6 md:flex-row md:space-y-0">
				<div class="w-full md:w-1/2 md:pr-10">
					<img src="/Images/Events/Current.jpeg" alt="Banner" class="w-full rounded-xl" />
				</div>

				<div class="flex w-full flex-col justify-center space-y-6 md:max-w-7xl">
					<p class="text-md md:text-lg lg:text-xl">Join us for a groundbreaking AI-Prompted Creative Showdown, where human creativity collides with the power of artificial intelligence. In this exciting event we will test your ability to utilise and showcase the incredible potential of AI tools like ChatGPT, Mid-journey, and many more.</p>
					<div class="text-md space-y-2 md:text-lg lg:text-xl">
						<p>Number of Teammates: 2 or 3</p>
					</div>
					<div class="text-md space-y-2 md:text-lg lg:text-xl">
						<p>No Entry Fees!</p>
					</div>
					<div class="text-md space-y-2 md:text-lg lg:text-xl">
						<p>Prize Pool: Rs. 1000</p>
					</div>
					<p class="text-md md:text-lg lg:text-xl">To participate, simply fill out the form below and lets begin prompting!</p>
					<div class="text-md md:text-lg lg:text-xl">
						<p class="font-bold text-red-600">NOTE:</p>
						<ol>
							<li>1. Every team must have at-least 1 laptop. We will provide LAN cables as well as WiFi to connect into. We will help you out with any technical issues you face but we are not responsible for any of your issues.</li>
							<li>2. The team must have a ChatGPT as well as a HackerRank account.</li>
							<li>3. Spot registrations will be open during the event from 9:00 to 10:45. The first round will last around 15 to 20 minutes. You can try the first round anytime from 9:00 to 10:45 and then be on your way.</li>
							<li>4. The first round will consist of 3 stages - AI Hallucination (making ChatGPT hallucinate), Coding using AI and Trivia.</li>
							<li>6. Register here as individuals! Team name and details will be collected at the venue.</li>
							<li>7. Once you register, you will be added to a WhatsApp group where we will inform you the rules of the event and we will answer your queries.</li>
						</ol>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class=" space-y-6">
		<h3 class="text-center text-5xl text-brand">Register</h3>

		<div class=" mx-10 flex items-center justify-center py-10">
			<div class="w-full max-w-[100rem] space-y-6 rounded-xl bg-gray-300 p-6 dark:bg-muted-dark">
				<form action="https://docs.google.com/forms/d/e/1FAIpQLSc61bk2iQIM3443eiF2K9LwQj9Q48ZAIQGb-aUD_XI3PPWRfg/formResponse" method="POST" enctype="multipart/form-data">
					<div class="grid-column-1 grid w-full max-w-[100rem] space-y-6 text-black dark:text-white">
						<section class="space-y-4">
							<label for="name">Name*</label>
							<Input type="text" id="name" name="entry.1999725743" class=" bg-transparent font-semibold text-brand" required />
						</section>

						<section class="space-y-4">
							<label for="usn">USN*</label>
							<Input type="text" id="usn" name="entry.749749945" class=" bg-transparent font-semibold text-brand" required />
						</section>

						<section class="space-y-4">
							<label for="sem">Semester*</label>
							<div id="sem" class="w-full">
								<select name="entry.1446725480" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-semibold text-brand ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
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
							<Input type="text" id="ceid" name="entry.1860554933" class="bg-transparent font-semibold text-brand" required />
						</section>

						<section class="space-y-4">
							<label for="peid">Personal Email ID*</label>
							<Input type="text" id="peid" name="entry.2132466575" class="bg-transparent font-semibold text-brand" required />
						</section>

						<section class="space-y-4">
							<label for="pno">Phone Number*</label>
							<Input type="text" name="entry.1994672727" class="bg-transparent font-semibold text-brand" required />
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
