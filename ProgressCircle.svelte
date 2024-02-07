<script>
	export let progress = 10;
	export let style = '';
	export let classes = '';
	export let radius = 62.5;
	export let lineThickness = 2;
	export let lineLength = 8;
	export let lineCount = 55;
	export let inactiveColor = '#E6E4E0';
	export let startColor = '#AFE671';
	export let endColor = '#45E07B';

	const angleIncrement = (Math.PI * 2) / lineCount;
	const angleOffset = Math.PI * -0.5; // start at the top instead of the right
	const lines = Array(lineCount)
		.fill()
		.map((e, i) => {
			return {
				angle: angleOffset + angleIncrement * i,
				percent: remap(i, 0, lineCount - 1, 0, 100)
			};
		});
	function radToDeg(radians) {
		return radians * (180 / Math.PI);
	}
	function remap(value, fromLow, fromHigh, toLow, toHigh) {
		// First, map the value from the input range to a 0-1 range
		const normalized = (value - fromLow) / (fromHigh - fromLow);
		// Then, map the normalized value to the output range
		return toLow + normalized * (toHigh - toLow);
	}
	function expandHex(hex) {
		// Expand shorthand form (e.g., "#abc" to "#aabbcc")
		return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_, r, g, b) => {
			return '#' + r + r + g + g + b + b;
		});
	}

	function lerpColor(color1, color2, t) {
		// Expand shorthand hex colors to full format
		color1 = expandHex(color1);
		color2 = expandHex(color2);

		// Convert hex colors to RGB
		const r1 = parseInt(color1.substring(1, 3), 16);
		const g1 = parseInt(color1.substring(3, 5), 16);
		const b1 = parseInt(color1.substring(5, 7), 16);

		const r2 = parseInt(color2.substring(1, 3), 16);
		const g2 = parseInt(color2.substring(3, 5), 16);
		const b2 = parseInt(color2.substring(5, 7), 16);

		// Perform linear interpolation for each component (RGB)
		const r = Math.round(r1 + (r2 - r1) * t);
		const g = Math.round(g1 + (g2 - g1) * t);
		const b = Math.round(b1 + (b2 - b1) * t);

		// Convert interpolated RGB values back to hex
		const interpolatedColor = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

		return interpolatedColor;
	}
	function getFinalColor(percent) {
		const t = percent / 100;
		const start = lerpColor(startColor, endColor, t);
		const end = lerpColor(endColor, startColor, t);
		return lerpColor(start, end, t);
	}
	function transition(node, index) {
		const t = index / (lineCount - 1);
		setTimeout(
			() => {
				node.classList.add('show');
			},
			index * (t * 10) // 10 - t * 5
		);
	}
</script>

<div class="progress-circle {classes}" style="--size: {(radius * 2) / 16}rem; {style}">
	<div class="progress-content">
		<slot />
	</div>

	<div class="progress-lines">
		<svg
			width={radius * 2}
			height={radius * 2}
			viewBox="0 0 100 100"
			xmlns="http://www.w3.org/2000/svg"
		>
			{#each lines as line, i}
				<rect
					use:transition={i}
					class="line {line.percent}"
					x={50 + Math.cos(line.angle) * (50 - lineLength)}
					y={50 + Math.sin(line.angle) * (50 - lineLength)}
					width={lineLength}
					height={lineThickness}
					transform="rotate({radToDeg(line.angle)})"
					fill={line.percent <= progress ? getFinalColor(line.percent) : inactiveColor}
				/>
			{/each}
		</svg>

		<!-- {#each lines as line, i}
			<div
				class="line"
				style="width: {lineLength / 16}rem; height: {lineThickness /
					16}rem; transform: translate({Math.cos(line) * (radius - lineLength)}px, {Math.sin(line) *
					(radius - lineLength)}px) rotate({line}rad)"
			></div>
		{/each} -->
	</div>
</div>

<style>
	.progress-circle {
		position: relative;
		display: grid;
		place-items: center;
		width: var(--size);
		height: var(--size);
		grid-template-areas:
			'. . .'
			'. center .'
			'. . .';
	}
	.progress-content,
	.progress-lines {
		grid-area: center;
	}
	.progress-lines {
		display: grid;
		place-items: center;
	}
	.line {
		position: absolute;
		background-color: red;
	}
	svg {
		overflow: visible;
	}
	svg * {
		transform-origin: left;
		transform-box: fill-box;
	}
	rect {
		transition: all 200ms;
		opacity: 0;
	}
	rect.show {
		opacity: 1;
	}
</style>
