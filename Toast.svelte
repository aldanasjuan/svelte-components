<script context="module">
	import { flip } from 'svelte/animate';
	import { writable } from 'svelte/store';
	let stack = writable([]);

	export function notify(content, type = '', time = 3000, preventDuplicates = true) {
		const id = crypto.randomUUID();
		stack.update((s) => {
			if (preventDuplicates && s.find((toast) => toast.content == content && toast.type == type)) {
				// don't add dupes
				return s;
			}
			s.push({ content, type, time, id });
			return s;
		});
		setTimeout(() => {
			stack.update((s) => {
				return s.filter((toast) => toast.id != id);
			});
		}, time);
	}
</script>

<script>
	import { fade, fly } from 'svelte/transition';
	export let style = '';
	export let classes = '';
	export let gap = 20;
	export let color = 'green';
	export let warningColor = 'yellow';
	export let errorColor = 'red';
	export let atBottom = false;
	export let justify = 'end';
</script>

<div
	class="toasts"
	style="{atBottom
		? 'bottom:0'
		: 'top:0'}; --gap: {gap}px;--color: {color}; --warning-color: {warningColor}; --error-color: {errorColor}; --justify:{justify}"
>
	{#each $stack as toast (toast.id)}
		<div
			{style}
			class="{classes} toast {toast?.type || ''} "
			in:fly={{ x: 300 }}
			out:fade={{ duration: 200 }}
			animate:flip
		>
			<button class="contents" on:click={() => ($stack = $stack.filter((t) => t.id != toast.id))}>
				<div class="close">
					<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"
						><path
							d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
						/></svg
					>
				</div>
			</button>
			{@html toast.content}
		</div>
	{/each}
</div>

<style>
	.toasts {
		pointer-events: none;
		display: grid;
		grid-gap: var(--gap, 1rem);
		position: fixed;
		width: 100%;
		padding: var(--gap);
		z-index: var(--z-layer-toast);
		justify-items: var(--justify);
	}
	button.contents {
		display: contents;
		cursor: pointer;
		user-select: none;
	}
	.close {
		position: absolute;
		top: 0;
		right: 0;
		cursor: pointer;
		padding: 0.25rem;
		user-select: none;
	}
	.toast {
		pointer-events: all;
		position: relative;
		background-color: white;
		border-radius: 0.25rem;
		padding: 1.25rem 2rem 1.25rem 1.25rem;
		border-left: solid 2px var(--color);
		box-shadow: 0 0 3px #ccc;
		max-width: 20rem;
		font-size: 0.875rem;
	}
	.toast.warning {
		border-left: solid 2px var(--warning-color);
	}
	.toast.error {
		border-left: solid 2px var(--error-color);
	}
</style>
