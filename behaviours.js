/**
 * Behaviour is just a wrapper for {@link Notification} that augments its behaviour
 */

/**
 * Closes Notification after mouseenter event
 *
 * @param {Notification} el
 * @param {number} [timeout]
 * @param {boolean} [immediate]
 */
export function closeAfterMouseEnter(el, timeout = 1000, immediate = false) {
	el.addEventListener("mouseenter", () => {
		el.time = null;
		setTimeout(() => {
			el.remove(immediate);
		}, timeout);
	});
	return el;
}

/**
 * Closes Notification after mouseleave event
 *
 * @param {Notification} el
 * @param {number} [timeout]
 * @param {boolean} [immediate]
 */
export function closeAfterMouseLeave(el, timeout = 1000, immediate = false) {
	el.addEventListener("mouseenter", function handler() {
		el.time = null;
		el.removeEventListener("mouseenter", handler);
	});
	el.addEventListener("mouseleave", () => {
		setTimeout(() => {
			el.remove(immediate);
		}, timeout);
	});
	return el;
}

/**
 * Close Notification on click anywhere in it
 *
 * @param {Notification} el
 * @param {boolean} [immediate]
 */
export function closeOnClick(el, immediate = false) {
	el.addEventListener("click", () => {
		el.remove(immediate);
	});
	return el;
}

/**
 * Ensures that timeout will start count
 * only after user hovered over notification
 *
 * @param {Notification} el
 */
export function ensureHover(el) {
	const time = el.time;
	if (!time) return;
	el.time = null;
	el.addEventListener("mouseleave", function handler() {
		el.time = time;
		el.removeEventListener("mouseleave", handler);
	});
	return el;
}
