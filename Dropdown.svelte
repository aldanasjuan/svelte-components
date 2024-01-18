<script>
	// Make sure the click handler that opens this calls e.stopPropagation or use like this on:click|stopPropagation.
	// This will prevent the window handler to close this when your button is clicked and causing the dropdown to never show.
	// Fixed position is used to avoid clipping when this is inside a node that has overflow:hidden.
	export let classes = '';
	export let style = '';
	export let offsetX = 0;
	export let offsetY = 0;
	export let show = false;
	export let autoFocus = false;

	function dropdownInit(node) {
		const rect = node.getBoundingClientRect();
		const moveUp = rect.bottom + 20 >= window.innerHeight;
		if (autoFocus) node.focus();
		trackParent();
		window.addEventListener('scroll', trackParent);
		function trackParent() {
			const parent = node.parentElement;
			if (!parent) return;
			if (!parent.style.position) {
				parent.style.position = 'relative';
			}
			const parentRect = parent.getBoundingClientRect();
			node.style.left = `${parentRect.left + offsetX}px`;
			if (moveUp) {
				node.style.top = `${parentRect.top - 10 - rect.height + offsetY}px`;
			} else {
				node.style.top = `${parentRect.bottom + 10 + offsetY}px`;
			}
		}
		return {
			destroy: () => {
				window.removeEventListener('scroll', trackParent);
			}
		};
	}
</script>

<svelte:window on:click={() => (show = false)} />

{#if show}
	<div
		class="dropdown {classes}"
		{style}
		use:dropdownInit
		on:click|stopPropagation
		on:keydown|stopPropagation
	>
		<slot />
	</div>
{/if}

<style>
	.dropdown {
		position: fixed;
		border-radius: 0.25rem;
		background-color: white;
		box-shadow: 0px 3px 6px #00000029;
		width: fit-content;
		overflow: auto;
		outline: none;
		z-index: var(--z-dropdown, 9999);
	}
</style>
