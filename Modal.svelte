<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let autoClose = false;
	export let open = false;
	export let style = '';
	export let hoist = true; //appends itself to the html body instead of staying as a child of whatever parent created it.
	export let classes = '';

	function handleClose() {
		if (autoClose) {
			close();
		}
	}
	function close() {
		dispatch('close');
		open = false;
	}

	function setHoist(node) {
		if (hoist) {
			document.body.appendChild(node);
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="backdrop" on:click={handleClose} use:setHoist>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="container {classes}" {style} on:click>
			<div class="close" on:click={close}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="24"
					><path
						fill="black"
						d="m12.45 37.65-2.1-2.1L21.9 24 10.35 12.45l2.1-2.1L24 21.9l11.55-11.55 2.1 2.1L26.1 24l11.55 11.55-2.1 2.1L24 26.1Z"
					/></svg
				>
			</div>
			<slot />
		</div>
	</div>
{/if}


<style>
	.backdrop {
		z-index: var(--z-modal, 9999);
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: var(--screen-height, 100vh);
		background-color: rgba(0, 0, 0, 0.2);
		display: grid;
		place-items: center;
		padding: 1rem;
	}
	.container {
		position: relative;
		padding: 3.5rem;
		box-shadow: 0 0 0.1875rem #ccc;
		width: 100%;
		background-color: white;
		max-height: 80%;
		border-radius: 0.4375rem;
		overflow: auto;
		box-shadow: 0 0 0.1875rem #ccc;
		animation: popup 175ms 1 ease-in-out;
	}
	.close {
		line-height: 0;
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		cursor: pointer;
		user-select: none;
	}
	@keyframes popup {
		0% {
			transform: scale(0);
		}
		80% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}
	@media screen and (max-width: 980px) {
		.container{
			padding: 2rem 1rem;
			max-height: 90vh;
		}
	}
</style>
