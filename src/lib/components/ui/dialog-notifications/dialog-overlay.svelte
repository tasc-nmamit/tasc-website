<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import { fade } from 'svelte/transition';

	type $$Props = DialogPrimitive.OverlayProps;

	let className: $$Props['class'] = undefined;
	export let transition: $$Props['transition'] = fade;
	export let transitionConfig: $$Props['transitionConfig'] = {
		duration: 150
	};
</script>

<DialogPrimitive.Overlay {transition} {transitionConfig} class={cn('fixed inset-0 z-50 self-center bg-background/80 backdrop-blur-lg')} {...$$restProps} />
