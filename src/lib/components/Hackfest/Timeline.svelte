<script>
	//@ts-ignore
	import { concurrent } from 'svelte-typewriter';
</script>

<h1 class="my-10 text-center font-jbExtrabold text-4xl md:py-10 md:text-5xl lg:text-5xl">
	<p use:concurrent={{ interval: 100 }}>Timeline</p>
</h1>
<section class="timeline">
	<div class="timeline__block">
		<div class="timeline__midpoint"></div>
		<div class="timeline__content timeline__content--left">
			<h3 class="timeline__year font-jbBold">1989</h3>
			<div class="gradient_border mr-10 w-auto cursor-default bg-[#d1f2f9] bg-opacity-5 p-10 backdrop-blur-sm transition duration-300 md:hover:scale-[102%]">
				<h3 class="font-jbExtrabold text-xl text-[#fffba4] md:text-[24px]">Hackfest</h3>
				<ul class="mt-5 space-y-2">
					<li class="pb-1 font-jbRegular text-sm text-slate-400 md:text-[16px]">Hello World</li>
				</ul>
			</div>
		</div>
	</div>

	<div class="timeline__block">
		<div class="timeline__midpoint"></div>
		<div class="timeline__content timeline__content--right">
			<h3 class="timeline__year font-jbBold">1991</h3>
			<div class="gradient_border mr-10 w-auto cursor-default bg-[#d1f2f9] bg-opacity-5 p-10 backdrop-blur-sm transition duration-300 md:hover:scale-[102%]">
				<h3 class="font-jbExtrabold text-xl text-[#fffba4] md:text-[24px]">Hackfest</h3>
				<ul class="mt-5 space-y-2">
					<li class="pb-1 font-jbRegular text-sm text-slate-400 md:text-[16px]">Hello World</li>
				</ul>
			</div>
		</div>
	</div>
</section>

<style lang="scss">
	$primary-color: cadetblue;
	$matching-palette: honeydew;
	$tablet-width: 768px;
	$desktop-width: 1024px;
	@mixin tablet {
		@media (min-width: #{$tablet-width}) and (max-width: #{$desktop-width - 1px}) {
			@content;
		}
	}

	@mixin desktop {
		@media (min-width: #{$desktop-width}) {
			@content;
		}
	}

	.timeline {
		position: relative;
		margin-left: 15px;
		&:before {
			/* vertical line*/
			content: '';
			position: absolute;
			top: 10px;
			/* to align with midline*/
			left: 7px;
			width: 2px;
			height: 97%;
			background-color: #fffba4;
		}
	}
	.timeline__block {
		position: relative;
		margin-top: 42px;
		margin-bottom: 42px;
		padding-left: 15px;
		&:last-child {
			margin-bottom: 3em;
		}
		&:after {
			content: '';
			display: table;
			clear: both;
		}
	}

	.timeline__midpoint {
		position: absolute;
		top: 6px;
		left: 0;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: linear-gradient(to bottom, #fffba4, #f6ef70);
		&:before {
			content: '';
			position: absolute;
			top: 50%;
			left: 16px;
			width: 15px;
			border-top: 1px solid #c5e1ec;
		}
	}

	.timeline__content {
		position: relative;
		margin-left: 20px;
		p + p {
			padding-top: 0;
		}
		&:after {
			content: '';
			display: table;
			clear: both;
		}
	}

	.timeline__midpoint--highlight > .timeline__year {
		display: none;
	}

	.timeline__content .timeline__year {
		padding-top: 6px;
		color: $primary-color;
		text-align: left;
	}

	.timeline__midpoint--highlight .timeline__year {
		color: #fff;
		line-height: 4;
	}

	.timeline__year,
	.timeline__midpoint--highlight + .timeline__content {
		font-weight: 600;
	}
	/* timeline layout for desktop */

	@include desktop {
		section {
			padding: 0 250px;
		}
		.timeline {
			margin-left: 0;
			&:before {
				/* vertical line */
				left: 50%;
				margin-left: -1px;
			}
		}
		.timeline__midpoint {
			left: 50%;
			margin-left: -8px;
			&:before {
				width: 40px;
			}
			&:after {
				content: '';
				position: absolute;
				top: 50%;
				right: 16px;
				width: 40px;
				border-top: 1px solid #c5e1ec;
			}
		}
		.timeline__midpoint--highlight {
			top: 0;
			width: 76px;
			height: 76px;
			margin-left: -29px;
			margin-left: -38px;
			text-align: center;
			&.no-top-margin {
				margin-top: 0;
			}
			.timeline__year {
				display: block;
			}
		}
		.timeline__midpoint--highlight:before,
		.timeline__midpoint.timeline__midpoint--highlight:after {
			content: none;
		}
		.timeline__midpoint--highlight,
		.timeline__midpoint--highlight + .timeline__content {
			margin-top: 2em;
			margin-bottom: 2em;
		}
		.timeline__content {
			width: 50%;
			.timeline__year--mobile {
				display: none;
			}
		}
		.timeline__content--left {
			margin-left: -6%;
			.timeline__year {
				left: 128%;
			}
		}
		.timeline__year {
			position: absolute;
			width: 100%;
			margin-top: 0;
		}
		.timeline__text--left {
			padding-right: 25px;
			text-align: right;
		}
		.timeline__content--right {
			float: right;
			width: 53%;
			left: 11%;
			.timeline__year {
				right: 134%;
				text-align: right;
			}
			.timeline__text--right {
				margin-top: 0;
			}
		}
		.timeline__img {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
		}
		.timeline__content--left .timeline__img {
			left: 127%;
		}
		.timeline__content--right .timeline__img {
			right: 133.5%;
		}
	}
</style>
