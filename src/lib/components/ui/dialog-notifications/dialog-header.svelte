<script lang="ts">
	import { cn } from "$lib/utils";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<div
	class={cn("flex flex-col space-y-1.5 text-center text-[5rem] font-extrabold", className)}
	{...$$restProps}
>
	<p class="text-transparent bg-gradient-to-r from-brand to-[#C850AF] w-fit bg-clip-text self-center">WHAT'S NEW</p>
</div>
