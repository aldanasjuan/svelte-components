<script context="module">
	import { writable } from 'svelte/store';
	export const multipleSelectOpen = writable(null);
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
	export let openStyle = '';
	export let errorStyle = '';
	export let labelClasses = '';
	export let labelStyle = '';
	export let optionsClasses = '';
	export let optionsStyle = '';
	export let dropdownClasses = '';
	export let dropdownStyle = '';
	export let disabled = false;
	export let error = false;
	export let value = [];
	export let maxHeight = '15rem';
	export let useSelectAll = false;
	export let useTags = false;
	export let checkboxColor = 'black';
	export let activeCheckboxColor = checkboxColor;
	let parentWidth = 0;

	let elements = [];
	let internalSearch = '';
	let searchInterval;
	const id = (Math.random() + Date.now()).toString(36);

	function open() {
		if ($multipleSelectOpen != id) $multipleSelectOpen = id;
	}
	function close() {
		$multipleSelectOpen = null;
	}
	function toggle() {
		if ($multipleSelectOpen == id) {
			close();
		} else {
			open();
		}
	}
	function handleInput(option) {
		if (value.includes(option.value)) {
			value = value.filter((v) => v != option.value);
		} else {
			value = [...value, option.value];
		}
	}
	function selectAll() {
		if (value?.length === options?.length) {
			value = [];
		} else {
			value = options.map((v) => v.value);
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
	class:open={$multipleSelectOpen == id}
	class:disabled
	class="select {classes}"
	style="{style}; {$multipleSelectOpen == id && !disabled ? openStyle + ';' : ''} {error &&
	!disabled
		? errorStyle + ';'
		: ''}"
	on:click|stopPropagation
	on:keydown|stopPropagation
>
	<button {disabled} class="contents placeholder">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<p
			class="value {labelClasses}"
			class:empty={value?.length <= 0}
			style={labelStyle}
			class:show={$multipleSelectOpen == id}
			on:click|stopPropagation={toggle}
			bind:clientWidth={parentWidth}
		>
			{#if value?.length > 0}
				{#if useTags}
					<div class="tags">
						{#each value.map((v) => {
							const option = options.find((o) => o.value == v);
							return option?.tag || option?.label;
						}) as v}
							<span class="tag">
								{v.length > 30 ? v?.slice(0, 30) + '...' : v}
							</span>
						{/each}
					</div>
				{:else}
					{value?.length} selected
				{/if}
			{:else}
				{placeholder}
			{/if}
			<span class="arrow material-symbols-outlined" class:open={$multipleSelectOpen == id}>
				expand_more
			</span>
		</p>
	</button>
	{#if $multipleSelectOpen == id}
		<div
			class="dropdown {dropdownClasses}"
			style="{dropdownStyle}; max-width: {parentWidth}px;max-height: {maxHeight};"
			on:keydown={handleKeydown}
			use:dropdownInit
			tabindex="-1"
		>
			{#if useSelectAll}
				<button class="contents" on:click|stopPropagation={() => selectAll()}>
					<p class="option select-all {optionsClasses}" style={optionsStyle}>
						{#if value?.length == options.length}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="24"
								viewBox="0 -960 960 960"
								width="24"
								fill={checkboxColor}
								><path
									d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"
								/></svg
							>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="24"
								viewBox="0 -960 960 960"
								width="24"
								fill={activeCheckboxColor}
								><path
									d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"
								/></svg
							>
						{/if}
						Select all
					</p>
				</button>
			{/if}
			{#each options as option, i}
				<button class="contents" on:click|stopPropagation={() => handleInput(option)}>
					<p bind:this={elements[i]} class="option {optionsClasses}" style={optionsStyle}>
						{#if value.includes(option.value)}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="24"
								viewBox="0 -960 960 960"
								width="24"
								style="margin-right: 0.5rem"
								><path
									fill={checkboxColor}
									d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"
								/></svg
							>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="24"
								viewBox="0 -960 960 960"
								width="24"
								style="margin-right: 0.5rem"
								><path
									fill={activeCheckboxColor}
									d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"
								/></svg
							>
						{/if}
						{option.label}
					</p>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.select {
		width: 100%;
		position: relative;
		outline: none;
	}
	.select.disabled {
		color: #ccc;
		background-color: #eee;
	}
	.select-all {
		border-bottom: solid 1px #ddd;
	}

	.value {
		padding: 0.75rem 1rem;
		cursor: pointer;
		user-select: none;
		font-size: 0.875rem;
		font-weight: normal;
		display: flex;
		align-items: center;
		justify-content: start;
		gap: 0.5rem;
	}
	.value.empty {
		color: #333;
	}
	.placeholder:disabled .value {
		background-color: #ccc;
	}
	.dropdown {
		width: 100%;
		position: fixed;
		background-color: white;
		box-shadow: 0px 3px 6px #00000029;
		width: 100%;
		left: 0;
		z-index: 999;
		overflow: auto;
		outline: none;
		max-width: 15rem;
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
		background-color: #ddd;
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		grid-gap: 0.5rem;
	}
	.tag {
		font-size: 0.8rem;
		border-radius: 0.25rem;
		box-shadow: inset 0 0 0 1px #ccc;
		padding: 0.375rem;
		white-space: nowrap;
	}
	.arrow {
		color: var(--gray-neutral);
		font-size: 1.5rem;
		position: absolute;
		right: 0.5rem;
		transition: transform 200ms;
	}
	.arrow.open {
		transform: rotate(180deg);
	}
</style>
