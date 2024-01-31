<script>
	export let loading = false;
	export let classes = '';
	export let style = '';
	export let color = 'currentColor';
	export let speed = 350;
</script>

{#if loading}
	<span class={classes} style="--speed:{speed}ms; color:{color}; {style}">
		<span class="a" style="--delay:0ms">•</span>
		<span class="b" style="--delay:{speed / 2}ms">•</span>
		<span class="c" style="--delay:{speed}ms">•</span>
	</span>
{:else}
	<slot />
{/if}

<style>
	.a {
		animation: blink var(--speed) infinite both alternate-reverse var(--delay);
	}
	.b {
		animation: blink var(--speed) infinite both alternate-reverse var(--delay);
	}
	.c {
		animation: blink var(--speed) infinite both alternate-reverse var(--delay);
	}

	@keyframes blink {
		0% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}
</style>
