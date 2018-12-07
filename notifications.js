/**
 * Default style for notifications container
 * @constant
 */
export const NotificationsStyle = `
	:host {
		font-family: sans-serif;
		width: var(--width, 15rem);
		display: block;

		position: fixed;
		top: 0rem;
		right: 0rem;

		padding: 0.5rem;
		box-sizing: border-box;

		overflow-x: visible;
		overflow-y: auto;
		max-height: 100%;
	}

	.notification {
		margin-bottom: 0.3rem;
		max-height: 10000px;
	}

	.notification.shrinked {
		max-height: 0;
		padding-top: 0;
		padding-bottom: 0;
		margin-bottom: 0;
		opacity:0;
	}

	.notification.transition {
		overflow: hidden;
		transition: opacity 0.3s ease-in-out,
			max-height 0.3s ease-in-out,
			margin 0.3s ease-in-out,
			padding 0.3s ease-in-out;
	}
`;

/**
 * Default style for notification
 * @constant
 */
export const NotificationStyle = `
	:host {
		--background-color: hsla(40, 40%, 95%, 0.9);
		--color: #222;
		background: var(--background-color);
		color: var(--color);
		padding: 0.5rem 1.5rem 0.5rem 0.8rem;
		box-shadow: 0 0 0.2rem 1px rgba(0, 0, 0, 0.2);
		display: block;
		position: relative;
		border-radius: 0.2rem;
		transition: background-color .3s, color .3s;

		display: grid;
		grid-template-columns: min-content 1fr;
		grid-template-areas:
			"icon title"
			"icon content";
	}

	:host([level="error"]) {
		--background-color: hsla(20, 80%, 55%, 0.9);
		--color: #fff;
	}

	:host([level="success"]) {
		--background-color: hsla(100, 50%, 65%, 0.9);
		--color: #fff;
	}

	:host([level="info"]) {
		--background-color: hsla(200, 80%, 85%, 0.9);
		--color: #222;
	}

	:host > .close {
		display: inline-block;
		cursor: default;
		position: absolute;
		top: -0.2rem;
		right: -0.2rem;
		line-height: 0.8rem;
		padding: 0.5rem;
		-moz-user-select: none;
		user-select: none;
	}

	:host([closeable="false"]) > .close {
		display: none;
	}

	:host > .title {
		font-weight: bold;
		margin-bottom: 0.5rem;
		grid-area: title;
	}

	:host > .content {
		grid-area: content;
	}

	:host > .icon-container {
		float: left;
		margin-right: 0.5rem;
		margin-left: -0.25rem;
		margin-bottom: 0.25rem;
		grid-area: icon;
	}

	:host > .icon-container:empty {
		display: none;
	}

	:host > .icon-container > .icon {
		max-width: 3rem;
		max-height: 3rem;
		object-fit: contain;
	}

	:host > .title:empty {
		display: none;
	}

	:host > .content {
		font-size: 90%;
	}

	:host > .clear {
		clear: both;
	}
`;

let notificationsStyleURL = null;
let notificationStyleURL = null;

/**
 * @enum {Symbol}
 */
export const NotificationLevel = {
	default: Symbol("default"),
	error: Symbol("error"),
	info: Symbol("info"),
	success: Symbol("success"),
};

/**
 * Class for handling different types of content
 */
export class Content {
	/**
	 *
	 * @param {string} content
	 * @param {string} [type="text/plain"]
	 * type of content, if set to "text/html" content
	 * will be set throught innerHTML property.
	 * all other types will be set through textContent property
	 */
	constructor(content, type = "text/plain") {
		this.content = content;
		this.type = type;
	}
}

const timeRef = Symbol();
const removeTimeout = Symbol();

/**
 * Notification WebComponent represents single item of {@link Notifications} component
 */
export class Notification extends HTMLElement {
	/**
	 * Should not be called directly just like any HTMLElement
	 */
	constructor() {
		super();
		this.elements = {
			root: this.attachShadow({ mode: "open" }),
			iconContainer: (() => {
				const el = document.createElement("div");
				el.classList.add("icon-container");
				return el;
			})(),
			title: (() => {
				const el = document.createElement("div");
				el.classList.add("title");
				return el;
			})(),
			content: (() => {
				const el = document.createElement("div");
				el.classList.add("content");
				return el;
			})(),
			clear: (() => {
				const el = document.createElement("div");
				el.classList.add("clear");
				return el;
			})(),
			close: (() => {
				const el = document.createElement("span");
				el.setAttribute("role", "button");
				el.innerText = "✖";
				el.classList.add("close");
				el.addEventListener("click", () => {
					this.remove();
				});
				return el;
			})(),
			style: (() => {
				const el = document.createElement("link");
				el.rel = "stylesheet";
				el.href = notificationStyleURL;
				return el;
			})(),
		};
		this.elements.root.appendChild(this.elements.style);
		this.elements.root.appendChild(this.elements.close);
		this.elements.root.appendChild(this.elements.iconContainer);
		this.elements.root.appendChild(this.elements.title);
		this.elements.root.appendChild(this.elements.content);
		this.elements.root.appendChild(this.elements.clear);
	}

	/**
	 * Setups connection logic.
	 * Emits "connected" event
	 */
	connectedCallback() {
		this.classList.add("shrinked");
		setTimeout(() => {
			this.classList.add("transition");
		}, 10);
		setTimeout(() => {
			this.classList.remove("shrinked");
		}, 200);
		this.addEventListener("transitionend", function handler() {
			this.classList.remove("transition");
			this.removeEventListener("transitionend", handler);
			this.time = this[timeRef];
		});
		const event = new Event("connected", {
			bubbles: false,
			cancelable: false,
			composed: true,
		});
		this.dispatchEvent(event);
	}

	/**
	 * Setups connection logic.
	 * Emits "disconnected" event
	 */
	disconnectedCallback() {
		const event = new Event("disconnected", {
			bubbles: false,
			cancelable: false,
			composed: true,
		});
		this.dispatchEvent(event);
	}

	/**
	 * Title of the notification. Set only
	 * @type {string|HTMLElement|Content}
	 */
	set title(title) {
		if (!title) {
			this.elements.title.textContent = "";
			return;
		}
		if (title instanceof HTMLElement) {
			this.elements.title.innerHTML = "";
			this.elements.title.appendChild(title);
		} else if (!(title instanceof Content)) {
			this.elements.title.textContent = title.toString();
		} else if (title.type === "text/html") {
			this.elements.title.innerHTML = title.content;
		} else {
			this.elements.title.textContent = title.content;
		}
	}

	/**
	 * Content of notification. Set only
	 * @type {string|HTMLElement|Content}
	 */
	set content(content) {
		if (!content) {
			this.elements.content.textContent = "";
			return;
		}
		if (content instanceof HTMLElement) {
			this.elements.content.innerHTML = "";
			this.elements.content.appendChild(content);
		} else if (!(content instanceof Content)) {
			this.elements.content.textContent = content.toString();
		} else if (content.type === "text/html") {
			this.elements.content.innerHTML = content.content;
		} else {
			this.elements.content.textContent = content.content;
		}
	}

	/**
	 * Notification's icon. Getter returns string
	 * @type {string|HTMLImageElement}
	 */
	get icon() {
		let el = this.elements.iconContainer.querySelector(".icon");
		if (el) return el.src;
		return null;
	}
	set icon(value) {
		if (!value) {
			this.elements.iconContainer.innerHTML = "";
			return;
		}
		if (value instanceof HTMLImageElement) {
			this.elements.iconContainer.innerHTML = "";
			this.elements.iconContainer.appendChild(value);
			return;
		}
		let el = this.elements.iconContainer.querySelector(".icon");
		if (!el) {
			el = document.createElement("img");
			el.classList.add("icon");
			this.elements.iconContainer.appendChild(el);
		}
		el.src = value;
	}

	/**
	 * Registered time after which element will be removed
	 * @type {number}
	 */
	get time() {
		return this[timeRef];
	}

	set time(value) {
		this[timeRef] = value;
		if (this[removeTimeout]) clearInterval(this[removeTimeout]);
		if (!this.isConnected) return;
		if (this[timeRef]) {
			this[removeTimeout] = setTimeout(() => {
				this.remove();
			}, this[timeRef]);
		}
	}

	/**
	 * Level of notification. Defined in NotificationLevel
	 * @type {Symbol}
	 */
	get level() {
		NotificationLevel[this.getAttribute("level")] || NotificationLevel.default;
	}
	set level(value) {
		if (NotificationLevel[value.description]) {
			this.setAttribute("level", value.description);
		} else {
			throw new Error("Unknown level");
		}
	}

	/**
	 * Defines whether notification should show cross button
	 * @type {boolean}
	 */
	get closeable() {
		const attr = this.getAttribute("closeable");
		if (!attr || attr === "false" || attr === "no" || attr === "0")
			return false;
		return true;
	}
	set closeable(value) {
		this.setAttribute("closeable", value.toString());
	}

	/**
	 * Removes notification from DOM
	 * @param {boolean} immediate if true element will be removed without transition
	 */
	remove(immediate = false) {
		if (immediate) {
			super.remove();
			return;
		}

		this.classList.add("transition");
		setTimeout(() => {
			this.classList.add("shrinked");
		}, 10);
		this.addEventListener("transitionend", () => {
			super.remove();
		});
	}

	/**
	 * Creates notification
	 *
	 * @param {Object} data
	 * notification data
	 *
	 * @param {string|HTMLImageElement} [data.icon]
	 * icon url or element
	 *
	 * @param {string|HTMLElement|Content} [data.title]
	 * title of notification
	 *
	 * @param {string|HTMLElement|Content} [data.content]
	 * content of notification
	 *
	 * @param {number} [data.time]
	 * time after which notification will be closed.
	 * null if closeable manually, default is 7000
	 *
	 * @param {Symbol} [data.level]
	 * level of notification. Defined in NotificationLevel
	 *
	 * @param {boolean} [data.closeable]
	 * is notification closeable. Defines whether close icon will be shown
	 *
	 * @param {context} [data.context]
	 * context associated with notification.
	 * main usage is to remove all notifications with certain context.
	 */
	static create({
		icon = null,
		title = null,
		content = null,
		time = 7000,
		level = NotificationLevel.default,
		closeable = true,
		context = null,
	} = {}) {
		if (!registeredName)
			throw new Error(
				"Notifications Component is not registered, call Notifications.register first"
			);
		const el = document.createElement(registeredName + "__notification");

		el.icon = icon;
		el.title = title;
		el.content = content;
		el[timeRef] = time;
		el.level = level;
		el.closeable = closeable;
		el.context = context;

		return el;
	}

	/**
	 * Function that must return the same as input of {@link Notification.create}
	 *
	 * @callback CreateClosure
	 * @param {function} remove {@link Notification.remove}
	 */

	/**
	 * Creates Notification by evaluating closure with "remove" closure arg
	 *
	 * @param {CreateClosure} fn
	 */
	static createInteractive(fn) {
		const el = this.create();
		const obj = fn(el.remove.bind(el));
		for (let [target, source, def] of [
			["icon", "icon", null],
			["title", "title", null],
			["content", "content", null],
			[timeRef, "time", 7000],
			["level", "level", NotificationLevel.default],
			["closeable", "closeable", true],
			["context", "context", null],
		]) {
			el[target] = obj.hasOwnProperty(source) ? obj[source] : def;
		}
		return el;
	}
}

let registeredName = null;
let elMapRef = Symbol();

/**
 * Notifications WebComponent represents container for {@link Notification} component
 */
export class Notifications extends HTMLElement {
	/**
	 * Should not be called directly just like any HTMLElement
	 */
	constructor() {
		super();

		this.root = this.attachShadow({ mode: "open" });
		const style = document.createElement("link");
		style.rel = "stylesheet";
		style.href = notificationsStyleURL;
		this.root.appendChild(style);
		this[elMapRef] = new WeakSet();
	}

	/**
	 * Emits "conntected" event
	 */
	connectedCallback() {
		const event = new Event("connected", {
			bubbles: false,
			cancelable: false,
			composed: true,
		});
		this.dispatchEvent(event);
	}

	/**
	 * Emits "disconntected" event
	 */
	disconnectedCallback() {
		const event = new Event("disconnected", {
			bubbles: false,
			cancelable: false,
			composed: true,
		});
		this.dispatchEvent(event);
	}

	/**
	 * Returns list of current notifications, optionally matching context
	 *
	 * @param {any} [context] context of notification to match,
	 * if null, all notifications will be returned
	 *
	 * @returns {Notification[]}
	 */
	getNotifications(context = null) {
		const notifications = Array.from(
			this.root.querySelectorAll(":host > .notification")
		);
		if (context === null) return notifications;

		return notifications.filter(n => n.context === context);
	}

	/**
	 * Adds notification to container element
	 *
	 * @param {Notification} notification
	 * @param {number} [offset] offset. Negative offset will add notigication from the end:
	 * -1 makes notification last
	 */
	add(notification, offset = 0) {
		notification.classList.add("notification");
		if (offset === 0) {
			this.root.insertBefore(notification, this.root.firstElementChild || null);
		} else if (offset > 0) {
			const notifications = this.getNotifications();
			if (offset >= notifications.length) {
				this.root.appendChild(notification);
			} else {
				this.root.insertBefore(notification, notifications[offset]);
			}
		} else {
			const notifications = this.getNotifications();
			if (offset === -1) {
				this.root.appendChild(notification);
			} else if ((offset + 1) * -1 >= notifications.length) {
				this.root.insertBefore(
					notification,
					this.root.firstElementChild || null
				);
			} else {
				this.root.insertBefore(
					notification,
					notifications[notifications.length + (offset + 1)]
				);
			}
		}
		this[elMapRef].add(notification);
		return notification;
	}

	/**
	 * Removes notification from DOM
	 *
	 * @param {Notification} notification
	 * @param {boolean} immediate if true element will be removed without transition
	 */
	remove(notification, immediate = false) {
		if (this[elMapRef].has(notification)) {
			this[elMapRef].get(notification).remove(immediate);
		}
	}

	/**
	 * Removes all notifications with same context
	 *
	 * @param {any} context context of notification
	 * @param {boolean} immediate
	 */
	removeWithContext(context, immediate = false) {
		for (let node of this.root.childNodes) {
			if (
				node.nodeType === 1 &&
				node.matches(".notification") &&
				node.context === context
			) {
				node.remove(immediate);
			}
		}
	}

	/**
	 * Registers webcomponent
	 *
	 * @param {string} [name] name of the dom element, default: reey-notifications
	 * @param {string|URL} [notificationsStyle=NotificationsStyle] css string or link to css for notifications container
	 * @param {string|URL} [notificationStyle=NotificationStyle] css string or link to css for notification
	 */
	static register(
		name = "reey-notifications",
		notificationsStyle = NotificationsStyle,
		notificationStyle = NotificationStyle
	) {
		if (notificationsStyle instanceof URL) {
			notificationsStyleURL = notificationsStyle.toString();
		} else {
			const blob = new Blob([notificationsStyle]);
			const url = URL.createObjectURL(blob);
			notificationsStyleURL = url;
		}
		if (notificationStyle instanceof URL) {
			notificationStyleURL = notificationStyle.toString();
		} else {
			const blob = new Blob([notificationStyle]);
			const url = URL.createObjectURL(blob);
			notificationStyleURL = url;
		}
		registeredName = name;
		customElements.define(name, this);
		customElements.define(name + "__notification", Notification);
	}
}
