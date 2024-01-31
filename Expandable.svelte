<script>
	export let open = false;
</script>

<div class="expand-wrapper" class:open>
	<div class="expandable">
		<slot />
	</div>
</div>

<style>
	.expand-wrapper {
		display: grid;
		grid-template-rows: 0fr;
		overflow: hidden;
		transition: grid-template-rows 200ms;
	}
	.expand-wrapper.open {
		grid-template-rows: 1fr;
	}
	.expandable {
		min-height: 0;
	}
</style>
