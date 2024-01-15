<script context="module">
	import { writable } from 'svelte/store';
	export const selectOpen = writable(null);
</script>

<script>
	// @ts-nocheck
	/**
	 * @type {{label: string, value: any}[]}
	 */
	export let options = [];
	export let placeholder = 'Select';
	export let classes = '';
	export let style = '';
	export let labelClasses = '';
	export let labelStyle = '';
	export let optionsClasses = '';
	export let optionsStyle = '';
	export let dropdownClasses = '';
	export let dropdownStyle = '';
	export let disabled = false;
	export let error = false;
	export let maxHeight = '12.5rem';
	let elements = [];
	let parentWidth = 0;
	let internalSearch = '';
	let searchInterval;

	const id = (Math.random() + Date.now()).toString(36);
	/**
	 * @type {any}
	 */
	export let value = null;
	/**
	 * @type {{ label: string, value: any } | null}
	 */
	let selected = options.find((v) => v.value == value) || null;

	function open() {
		if ($selectOpen != id) $selectOpen = id;
	}
	function close() {
		$selectOpen = null;
	}

	function toggle() {
		if ($selectOpen == id) {
			close();
		} else {
			open();
		}
	}
	function handleKeydown(e) {
		if (e.key.length == 1) {
			internalSearch += e.key;
			focusElement(internalSearch);
			clearInterval(searchInterval);
			searchInterval = setTimeout(() => {
				internalSearch = '';
			}, 1000);
		}
	}
	function dropdownInit(node) {
		const rect = node.getBoundingClientRect();
		const moveUp = rect.bottom + 20 >= window.innerHeight;
		node.focus();
		trackParent();
		window.addEventListener('scroll', trackParent);
		function trackParent() {
			const parent = node.parentElement;
			if (!parent) return;
			const parentRect = parent.getBoundingClientRect();
			node.style.left = `${parentRect.left}px`;
			if (moveUp) {
				node.style.top = `${parentRect.top - 10 - rect.height}px`;
			} else {
				node.style.top = `${parentRect.bottom + 10}px`;
			}
		}

		return {
			destroy: () => {
				internalSearch = '';
				window.removeEventListener('scroll', trackParent);
			}
		};
	}
	function focusElement(text) {
		const element = options.findIndex((option) => {
			return (
				option.value.toLowerCase().startsWith(text.toLowerCase()) ||
				option.label.toLowerCase().startsWith(text.toLowerCase())
			);
		});
		if (element >= 0) {
			if (elements[element] && elements[element].scrollIntoView) {
				elements[element].scrollIntoView();
			}
		}
	}
</script>

<svelte:window on:click={close} />

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
	tabindex="0"
	class:error
	class:open={$selectOpen == id}
	class="select {classes}"
	class:disabled
	{style}
	on:click|stopPropagation
	on:keydown|stopPropagation
>
	<button {disabled} class="contents placeholder">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<p
			class="value {labelClasses}"
			style={labelStyle}
			class:show={$selectOpen == id}
			class:empty={!selected?.label}
			bind:clientWidth={parentWidth}
			on:click|stopPropagation={() => {
				if (!disabled) toggle();
			}}
		>
			{selected?.label || placeholder}
			<span class="arrow material-symbols-outlined" class:open={$selectOpen == id}>
				expand_more
			</span>
		</p>
	</button>
	{#if $selectOpen == id}
		<div
			class="dropdown {dropdownClasses}"
			style="{dropdownStyle}; max-width: {parentWidth}px;max-height: {maxHeight};"
			on:keydown={handleKeydown}
			use:dropdownInit
			tabindex="-1"
		>
			<slot name="dropdownPre" {close} />
			{#each options as option, i}
				<button
					class="contents"
					on:click|stopPropagation={() => {
						selected = option;
						value = option.value;
						close();
					}}
				>
					<p
						bind:this={elements[i]}
						class="option {optionsClasses}"
						style={optionsStyle}
						class:selected={option?.value == value}
					>
						{option.label}
					</p>
				</button>
			{/each}
			<slot name="dropdownPost" {close} />
		</div>
	{/if}
</div>

<style>
	.select {
		width: 100%;
		position: relative;
		box-shadow: inset 0 0 0 1px #ccc;
		border-radius: 0.25rem;
		outline: none;
		transition: box-shadow 200ms;
		font-weight: 300;
		color: #777;
	}
	.select.disabled {
		color: #ccc;
		background-color: #eee;
	}
	.select:not(.disabled):focus,
	.select:not(.disabled).open {
		box-shadow: inset 0 0 0 2px #999;
	}
	.select.error {
		box-shadow: inset 0 0 0 1px red;
	}
	.value {
		height: 2.5rem;
		padding: 0.75rem 1rem;
		cursor: pointer;
		user-select: none;
		font-size: 0.875rem;
		font-weight: normal;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.value.empty {
		color: #777;
	}
	.placeholder:disabled .value {
		background-color: var(--gray-3, #333);
	}
	.dropdown {
		position: fixed;
		background-color: white;
		box-shadow: 0px 3px 6px #00000029;
		width: 100%;
		left: 0;
		z-index: 999;
		overflow: auto;
		outline: none;
		z-index: 99999999999999;
		border-radius: 0.25rem;
	}
	.option {
		cursor: pointer;
		user-select: none;
		padding: 0.75rem;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		justify-content: start;
	}
	button:disabled {
		color: black;
	}
	.option:hover {
		background-color: #f3f3f3;
	}
	.option.selected {
		font-weight: 600;
	}
	.arrow {
		color: #777;
		font-size: 1.5rem;
		position: absolute;
		right: 0.5rem;
		transition: transform 200ms;
	}
	.arrow.open {
		transform: rotate(180deg);
	}
</style>
