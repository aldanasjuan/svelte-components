export class WebSocketClient {
	connected = false;
	url = '';
	retry = true;
	maxAttempts = 5;
	attempts = 5;
	attemptInterval = 5000;
	#timeout;
	conn;
	#listeners = [];
	#statusListeners = [];

	constructor({ url = '', retry = true, attempts = 5, attemptInterval = 5000 }) {
		Object.assign(this, { url, retry, attempts, attemptInterval, maxAttempts: attempts });

		this.connect();
	}

	connect() {
		if (this.conn) {
			this.conn.close();
			this.conn = null;
		}
		try {
			const socket = new WebSocket(this.url);
			socket.addEventListener('open', () => {
				console.log('created socket connection');
				clearTimeout(this.#timeout);
				this.conn = socket;
				this.connected = true;
				this.attempts = this.maxAttempts; //reset the attempts after a successful connection
				this.#statusListeners.forEach((func) => func(this.connected, this.attempts));
			});
			socket.addEventListener('message', (e) => this.handleMessage(e));
			socket.addEventListener('close', () => {
				console.log('socket connection closed');
				this.connected = false;
				this.#statusListeners.forEach((func) => func(this.connected, this.attempts));
				this.conn = null;
				clearTimeout(this.#timeout);
				if (this.attempts > 0 || this.attempts < 0) {
					// it will run when it's 1+ or -1 but never at zero. Meaning that if we set it to -1, it will attempt forever
					this.#timeout = setTimeout(() => this.connect(), this.attemptInterval);
					if (this.attempts > 0) {
						this.attempts -= 1;
					}
				}
			});
		} catch (error) {
			console.error(error);
			this.connected = false;
			this.#statusListeners.forEach((func) => func(this.connected, this.attempts));
			this.conn = null;
			clearTimeout(this.#timeout);
			if (this.attempts > 0 || this.attempts < 0) {
				// it will run when it's 1+ or -1 but never at zero. Meaning that if we set it to -1, it will attempt forever
				this.#timeout = setTimeout(() => this.connect(), this.attemptInterval);
				if (this.attempts > 0) {
					this.attempts -= 1;
				}
			}
		}
	}
	close() {
		if (this.conn) {
			this.conn.close();
			this.conn = null;
		}
	}
	handleMessage(e) {
		try {
			const { data, event } = JSON.parse(e.data);
			if (this.#listeners[event]) {
				this.#listeners[event].forEach((func) => func(data));
			}
		} catch (error) {
			console.error('error receiving message', error);
		}
	}
	send(event, data, token) {
		if (this.conn) {
			this.conn.send(JSON.stringify({ event, data, token }));
		}
	}
	addEventListener(event, func) {
		if (!this.#listeners[event]) {
			this.#listeners[event] = [];
		}
		if (typeof func == 'function') {
			const exists = this.#listeners[event].find((f) => f == func);
			if (!exists) {
				this.#listeners[event].push(func);
			}
		}
	}
	removeEventListener(event, func) {
		if (this.#listeners[event]) {
			this.#listeners[event] = this.#listeners[event].filter((f) => f != func);
		}
	}
	addStatusChangeListener(func) {
		if (typeof func == 'function') {
			const exists = this.#statusListeners.find((f) => f == func);
			if (!exists) {
				this.#statusListeners.push(func);
			}
		}
	}
	removeStatusChangeListener(func) {
		this.#statusListeners = this.#statusListeners.filter((f) => f != func);
	}
}
