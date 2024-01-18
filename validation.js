// @ts-nocheck
function passwordValidator({
	length = 8,
	lower = true,
	upper = true,
	num = true,
	symbol = false
} = {}) {
	return function (str) {
		if (typeof str != 'string') {
			return false;
		}
		let a = lower ? /[a-z]/g.test(str) : true;
		let b = upper ? /[A-Z]/g.test(str) : true;
		let c = num ? /[0-9]/g.test(str) : true;
		let d = symbol ? /[^a-zA-Z\d]/g.test(str) : true;
		let e = str.length >= length;
		return a && b && c && d && e;
	};
}

export const lower = (str) => {
	return /[a-z]/g.test(str);
};
export const upper = (str) => {
	return /[A-Z]/g.test(str);
};
export const num = (str) => {
	return /[0-9]/g.test(str);
};
export const symbol = (str) => {
	return /[^a-zA-Z\d]/g.test(str);
};

export const isValidPassword = passwordValidator();

export function isValidEmail(val) {
	if (typeof val !== 'string') return false;
	const reg =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return reg.test(String(val).toLowerCase());
}
