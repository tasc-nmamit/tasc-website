<script>
	const closeMenu = () => {
		// @ts-ignore
		document.getElementById('menuToggle').querySelector('input').checked = false;
	};
</script>

<div>
	<div class="fixed top-0 z-50 hidden w-full backdrop-blur-md md:grid">
		<div class="flex items-center justify-between md:px-20 lg:px-32">
			<a href="/">
				<img src="/TASCLogo.png" class="w-20" alt="logo" />
			</a>
			<ul class="flex flex-wrap items-center justify-between space-x-8 py-3 pb-5 font-jbBold tracking-wider md:text-lg">
				<div class="transition duration-300 hover:drop-shadow-[0_0_0.2rem_#d2b863]"><a href="#about" class="scroll-smooth underline-offset-8 transition duration-300 hover:drop-shadow-[0_0_0.2rem_#460a07]">About</a></div>
				<div class="transition duration-300 hover:drop-shadow-[0_0_0.2rem_#d2b863]"><a href="#timeline" class="scroll-smooth underline-offset-8 transition duration-300 hover:drop-shadow-[0_0_0.2rem_#460a07]">Timeline</a></div>
				<div class="transition duration-300 hover:drop-shadow-[0_0_0.2rem_#d2b863]"><a href="#themes" class="scroll-smooth underline-offset-8 transition duration-300 hover:drop-shadow-[0_0_0.2rem_#460a07]">Problem Statements</a></div>
				<div class="transition duration-300 hover:drop-shadow-[0_0_0.2rem_#d2b863]"><a href="#prizes" class="scroll-smooth underline-offset-8 transition duration-300 hover:drop-shadow-[0_0_0.2rem_#460a07]">Goodies</a></div>
			</ul>
		</div>
	</div>
	<div class="fixed z-50 grid w-full backdrop-blur-md md:hidden">
		<nav>
			<div id="menuToggle" class="px-10 pb-4 pt-6">
				<input type="checkbox" />
				<span></span>
				<span></span>
				<span></span>

				<ul id="menu">
					<a class="mb-10 mt-10 font-jbBold text-2xl" href="#home" on:click={closeMenu}> Home </a>
					<a class="mb-10 font-jbBold text-2xl" href="#about" on:click={closeMenu}> About </a>
					<a class="mb-10 font-jbBold text-2xl" href="#flowchart" on:click={closeMenu}> Timeline </a>
					<a class="mb-10 font-jbBold text-2xl" href="#themes" on:click={closeMenu}> Problem Statements </a>
					<a class="mb-10 font-jbBold text-2xl" href="#prizes" on:click={closeMenu}> Goodies </a>
				</ul>
			</div>
		</nav>
	</div>
</div>

<style>
	#menuToggle {
		display: block;
		z-index: 1;
		font-weight: bold;
		-webkit-user-select: none;
		user-select: none;
	}

	#menuToggle a {
		text-decoration: none;
		transition: color 0.3s ease;
	}

	#menuToggle a:hover {
		color: grey;
	}

	#menuToggle input {
		display: block;
		width: 40px;
		height: 32px;
		position: absolute;
		cursor: pointer;

		opacity: 0;
		z-index: 2;

		-webkit-touch-callout: none;
	}

	/*
  	* Just a quick hamburger
  	*/
	#menuToggle span {
		display: block;
		width: 33px;
		height: 4px;
		margin-bottom: 5px;
		position: relative;

		background: #d2b863;
		border-radius: 3px;

		z-index: 1;

		transform-origin: 4px 0px;

		transition:
			transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1),
			background 0.5s cubic-bezier(0.77, 0.2, 0.05, 1),
			opacity 0.55s ease;
	}

	#menuToggle span:first-child {
		transform-origin: 0% 0%;
	}

	#menuToggle span:nth-last-child(2) {
		transform-origin: 0% 100%;
	}

	/* 
	* Transform all the slices of hamburger
	* into a crossmark.
	*/
	#menuToggle input:checked ~ span {
		opacity: 1;
		transform: rotate(45deg) translate(-2px, -1px);
		background: #d2b863;
	}

	/*
	* But let's hide the middle one.
	*/
	#menuToggle input:checked ~ span:nth-last-child(3) {
		opacity: 0;
		transform: rotate(0deg) scale(0.2, 0.2);
	}

	/*
	* Ohyeah and the last one should go the other direction
	*/
	#menuToggle input:checked ~ span:nth-last-child(2) {
		transform: rotate(-45deg) translate(0, -1px);
	}

	#menu {
		display: flex;
		flex-direction: column;
		position: absolute;
		width: 100vw;
		padding-top: 5rem;
		padding-left: 2rem;
		z-index: 0;
		top: 0;
		left: 0;
		height: 100vh;
		list-style-type: none;
		-webkit-font-smoothing: antialiased;
		background: #0f0913;
		transform-origin: 0% 0%;
		transform: translate(-140%, 0);

		transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1);
	}

	#menuToggle input:checked ~ ul {
		transform: none;
	}
</style>
