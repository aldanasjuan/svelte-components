export function formatDate(date) {
	return new Date(date).toLocaleString('en-US', { dateStyle: 'medium' });
}
export function getTimeAgo(timestamp) {
	const now = Date.now(); // Current timestamp in milliseconds
	const millisecondsAgo = now - timestamp;

	if (millisecondsAgo < 1000) {
		return 'just now';
	} else if (millisecondsAgo < 60000) {
		const secondsAgo = Math.floor(millisecondsAgo / 1000);
		return secondsAgo + (secondsAgo === 1 ? ' second ago' : ' seconds ago');
	} else if (millisecondsAgo < 3600000) {
		const minutesAgo = Math.floor(millisecondsAgo / 60000);
		return minutesAgo + (minutesAgo === 1 ? ' minute ago' : ' minutes ago');
	} else if (millisecondsAgo < 86400000) {
		const hoursAgo = Math.floor(millisecondsAgo / 3600000);
		return hoursAgo + (hoursAgo === 1 ? ' hour ago' : ' hours ago');
	} else {
		const daysAgo = Math.floor(millisecondsAgo / 86400000);
		return daysAgo + (daysAgo === 1 ? ' day ago' : ' days ago');
	}
}
export function addCommas(num, addDecimals = true) {
	if (typeof num != 'number') {
		return num;
	}

	let split = addDecimals ? num.toFixed(2).split('.') : num.toString().split('.');
	let str = '';
	let decimal = '';
	if (split.length == 2) {
		const aprox = num.toFixed(2).split('.');
		str = aprox[0];
		if (aprox[1]) {
			decimal = '.' + aprox[1];
		}
	} else {
		str = num.toString();
	}
	return (
		str
			.split('')
			.reverse()
			.reduce((acc, value, i, original) => {
				let isThird = (i + 1) % 3 == 0;
				if (isThird && i !== original.length - 1) {
					return [',', value, ...acc];
				}
				return [value, ...acc];
			}, [])
			.join('') + decimal
	);
}

export function clamp(v, min, max) {
	return Math.min(Math.max(v, min), max);
}

//returns a number between 0 and 100, based on the distance of the cursor in relation to the first and second date. If start is march 1 and end is march 30, when the cursor is march 15, it should return 50 (or so).
export function getPercentBetweenDates(start, end, cursor = Date.now()) {
	const range = end - start;
	const curr = end - cursor
	const progress = (1 - curr / range) * 100;
	return clamp(progress, 0, 100).toFixed(0);
}