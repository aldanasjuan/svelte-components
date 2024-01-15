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
	let search = '';
	let showTip = false;
	let tipTimeout;
	const id = (Math.random() + Date.now()).toString(36);
	/**
	 * @type {any}
	 */
	export let value = null;
	/**
	 * @type {{ label: string, value: any } | null}
	 */
	let selected = options.find((v) => v.value == value) || null;

	function close() {
		$selectOpen = null;
		search = '';
		clearTimeout(tipTimeout);
		showTip = false;
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
			update: () => {
				trackParent();
			},
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
	function searchFocus(node) {
		node.focus();
	}
	function searchFilter(op, search = '') {
		if (!search) return true;

		let operator = '';
		let searchTerm = search;

		// Check for operators and adjust searchTerm accordingly
		if (search.startsWith('=')) {
			operator = '=';
			searchTerm = search.slice(1);
		} else if (search.startsWith('^')) {
			operator = '^';
			searchTerm = search.slice(1);
		} else if (search.startsWith('$')) {
			operator = '$';
			searchTerm = search.slice(1);
		} else if (search.startsWith('*')) {
			operator = '*';
			searchTerm = search.slice(1);
		} else if (search.startsWith('!')) {
			operator = '!';
			searchTerm = search.slice(1);
		} else if (search.startsWith('case:')) {
			operator = 'case:';
			searchTerm = search.slice(5);
		}

		const isCaseSensitive = operator === 'case:';

		// Construct regular expression based on operator and searchTerm
		let searchRegex;
		switch (operator) {
			case '=':
				searchRegex = new RegExp(`^${searchTerm}$`, isCaseSensitive ? '' : 'i');
				break;
			case '^':
				searchRegex = new RegExp(`^${searchTerm}`, isCaseSensitive ? '' : 'i');
				break;
			case '$':
				searchRegex = new RegExp(`${searchTerm}$`, isCaseSensitive ? '' : 'i');
				break;
			case '*':
				searchRegex = new RegExp(searchTerm, isCaseSensitive ? '' : 'i');
				break;
			case '!':
				searchRegex = new RegExp(`^(?!.*${searchTerm}).*$`, isCaseSensitive ? '' : 'i');
				break;
			case 'case:':
				searchRegex = new RegExp(`^${searchTerm}$`);
				break;
			default:
				searchRegex = new RegExp(searchTerm, isCaseSensitive ? '' : 'i');
		}

		return searchRegex.test(op.label) || searchRegex.test(op.value);
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
	on:mouseenter={() => {
		tipTimeout = setTimeout(() => {
			if ($selectOpen != id) {
				showTip = true;
			}
		}, 2000);
	}}
	on:mouseleave={() => {
		clearTimeout(tipTimeout);
		showTip = false;
	}}
>
	<button {disabled} class="contents placeholder">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<p
			class="value {labelClasses}"
			style={labelStyle}
			class:show={$selectOpen == id}
			class:empty={!selected?.label}
			on:click|stopPropagation={() => {
				if (disabled) return;
				showTip = false;
				$selectOpen = id;
			}}
			bind:clientWidth={parentWidth}
		>
			{#if $selectOpen == id}
				<input class="search" use:searchFocus bind:value={search} />
				<span
					class="arrow material-symbols-outlined"
					on:click|stopPropagation={() => {
						search = '';
						$selectOpen = null;
					}}
				>
					close
				</span>
			{:else}
				{selected?.label || placeholder}
				<span class="arrow material-symbols-outlined" class:open={$selectOpen == id}>
					expand_more
				</span>
			{/if}
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
			{#each options.filter((op) => searchFilter(op, search)) as option, i}
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
	<div class="tooltip" {style} use:dropdownInit={showTip} class:show={showTip}>
		<ol>
			<li>
				<strong>Exact Match (`=`):</strong><br />
				Use <code>=</code> as a prefix to find entries where the label or value is exactly equal to
				the specified term.<br />
				<em
					>Example: <code>=apple</code> will match entries where the label or value is exactly "apple."</em
				>
			</li>

			<li>
				<strong>Starts With (`^`):</strong><br />
				Use <code>^</code> as a prefix to find entries where the label or value starts with the
				specified term.<br />
				<em
					>Example: <code>^app</code> will match entries where the label or value starts with "app."</em
				>
			</li>

			<li>
				<strong>Ends With (`$`):</strong><br />
				Use <code>$</code> as a prefix to find entries where the label or value ends with the
				specified term.<br />
				<em
					>Example: <code>$le</code> will match entries where the label or value ends with "le."</em
				>
			</li>

			<li>
				<strong>Wildcard (`*`):</strong><br />
				Use <code>*</code> as a prefix or suffix to find entries where the label or value contains
				the specified term anywhere.<br />
				<em
					>Example: <code>*app*</code> will match entries where the label or value contains "app" anywhere.</em
				>
			</li>

			<li>
				<strong>Negation (`!`):</strong><br />
				Use <code>!</code> as a prefix to exclude entries where the label or value contains the
				specified term.<br />
				<em
					>Example: <code>!test</code> will exclude entries where the label or value contains "test."</em
				>
			</li>

			<li>
				<strong>Case-Sensitive (`case:`):</strong><br />
				Use <code>case:</code> as a prefix to perform a case-sensitive search.<br />
				<em
					>Example: <code>case:Apple</code> will match entries where the label or value is "Apple" with
					the exact case.</em
				>
			</li>
		</ol>
	</div>
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
	.search {
		border: none;
		box-shadow: none;
		width: 100%;
		height: 100%;
		padding: 0;
		font-family: inherit;
        outline: none;
	}
    .search:focus{
        outline: none;
    }
	.tooltip {
		padding: 0.5rem;
		position: fixed;
		z-index: 9999999999999;
		border-radius: 0.5rem;
		background-color: #333;
		color: white;
		font-size: 0.75rem;
		display: none;
		max-width: 30rem;
	}
	.tooltip.show {
		display: block;
	}
</style>
