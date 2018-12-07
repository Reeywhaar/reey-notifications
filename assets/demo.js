import {
	Notifications,
	Notification,
	Content,
	NotificationLevel,
} from "../notifications.js";

import * as Behaviours from "../behaviours.js";

function getText() {
	return fetch("https://geek-jokes.sameerkumar.website/api").then(resp =>
		resp.json()
	);
}

function randomInt(max) {
	return Math.floor(Math.random() * max);
}

function randomBool(probability = 0.5) {
	return Math.random() <= probability;
}

function randomFromArray(arr) {
	return arr[randomInt(arr.length)];
}

function randomFromObject(obj) {
	return obj[randomFromArray(Object.keys(obj))];
}

const host = document.createElement("reey-notifications");
document.body.appendChild(host);
Notifications.register();

const register = `
	import {
		Notification,
		Notifications,
		NotificationLevel,
		Content,
	} from "./notifications.js";

	import * as Behaviours from "./behaviours.js";

	const host = document.createElement("reey-notifications");
	document.body.appendChild(host);
	Notifications.register();
`;

const examples = [
	{
		title: "Simple notification",
		description:
			"Content can be string, HTMLElement or instance of library's Content class",
		fn: async () => {
			host.add(
				Notification.create({
					content: new Content(
						await getText(), // get me some joke
						"text/html"
					),
				})
			);
		},
	},
	{
		title: "With title",
		description:
			"Title can be string, HTMLElement or instance of library's Content class",
		fn: async () => {
			host.add(
				Notification.create({
					title: "A title!",
					content: new Content(await getText(), "text/html"),
				})
			);
		},
	},
	{
		title: "Different levels",
		description:
			"Levels defined in library's NotificationLevel enum: default | error | info | success",
		fn: async () => {
			const level = randomFromObject(NotificationLevel);
			host.add(
				Notification.create({
					title: level.description,
					content: new Content(await getText(), "text/html"),
					level: level,
				})
			);
		},
	},
	{
		title: "With icon",
		description: "Icon can be url string, or HTMLImageElement",
		fn: async () => {
			host.add(
				Notification.create({
					icon: "assets/logo.svg",
					title: randomBool() ? "Hail Empire" : null,
					content: randomBool(0.8)
						? new Content(await getText(), "text/html")
						: null,
					level: randomFromObject(NotificationLevel),
				})
			);
		},
	},
	{
		title: "Set time",
		description: "Time can be number. Set to null to close manually",
		fn: async () => {
			host.add(
				Notification.create({
					time: randomBool() ? null : randomInt(2000, 10000),
					content: new Content(await getText(), "text/html"),
				})
			);
		},
	},
	{
		title: "Set closeable",
		description:
			"Closeable is bool, which defines if close button should be visible",
		fn: async () => {
			host.add(
				Notification.create({
					content: new Content(await getText(), "text/html"),
					closeable: randomBool(),
				})
			);
		},
	},
	{
		title: "Set with interactive content",
		description:
			"Create notification with closure which contains function to remove notification",
		fn: async () => {
			host.add(
				Notification.createInteractive(remove => {
					const content = document.createElement("div");
					content.textContent = "Click me to remove!";
					content.style.cursor = "pointer";
					content.addEventListener("click", () => {
						remove();
					});
					return {
						content: content,
						time: null,
						closeable: false,
					};
				})
			);
		},
	},
	{
		title: "Remove notifications with context",
		description: "Context can be of any type, String, Object, Symbol, etc",
		fn: async () => {
			host.add(
				Notification.create({
					content: "Delete me too",
					context: "delete-me",
					level: NotificationLevel.info,
					time: 15000,
				})
			);
			host.add(
				Notification.create({
					content: "Will be removed as well",
					context: "delete-me",
					level: NotificationLevel.info,
					time: 15000,
				})
			);
			host.add(
				Notification.create({
					content: "I don't wanna go!",
					time: 15000,
				})
			);
			host.add(
				Notification.create({
					content: "And this notification will be removed too",
					context: "delete-me",
					level: NotificationLevel.info,
					time: 15000,
				})
			);
			host.add(
				Notification.create({
					content: "I will not be removed",
					time: 15000,
				})
			);
			host.add(
				Notification.create({
					content: "This notification will be removed",
					context: "delete-me",
					level: NotificationLevel.info,
					time: 15000,
				})
			);
			setTimeout(() => {
				host.removeWithContext("delete-me");
			}, 5000);
		},
	},
	{
		title: "Content can be dynamically changed",
		description: "As well as title, icon, level",
		fn: async () => {
			const notification = Notification.create({
				content: "This is initial content",
				time: 10000,
			});
			host.add(notification);

			host.add(
				Notification.create({
					content: "This notification will not be changed",
					time: 10000,
				})
			);

			setTimeout(() => {
				notification.content = "Content changed!";
			}, 3000);
			setTimeout(() => {
				notification.content = new Content(
					"And now <b>level</b> changed!",
					"text/html"
				);
				notification.level = NotificationLevel.info;
			}, 6000);
			setTimeout(() => {
				notification.content = "And now icon!";
				notification.icon = "assets/logo.svg";
			}, 8000);
		},
	},
	{
		title: "Applying behaviour",
		description: "Behaviour is just wrapper function for the element",
		fn: async () => {
			const notification = Behaviours.closeAfterMouseLeave(
				Notification.create({
					content: "I will close after mouse leave or after 10 seconds",
					time: 10000,
				})
			);
			host.add(notification);

			const notification2 = Behaviours.ensureHover(
				Notification.create({
					content: "I will close after hover and then after 5 seconds",
					time: 5000,
				})
			);
			host.add(notification2);
		},
	},
];

async function main() {
	const root = document.querySelector(".root");

	{
		const section = document.createElement("section");
		const demobutton = document.createElement("button");
		demobutton.textContent = "Show demo";
		demobutton.addEventListener("click", () => {
			[
				Notification.create({
					content: "Hello!",
					time: 3000,
				}),
				Notification.create({
					title: "Ola!",
					content: "Notification can have title!",
					time: 3000,
				}),
				Notification.create({
					title: "Success!",
					content: "Notification can have level",
					level: NotificationLevel.success,
					time: 3000,
				}),
				Notification.create({
					title: "Support troops!",
					content: "Notification can have icon",
					icon: "assets/logo.svg",
					time: 3000,
				}),
				(() => {
					const n = Notification.create({
						content: "Built with WebComponents",
						time: 12000,
					});
					n.addEventListener("connected", () => {
						setTimeout(() => {
							n.content = new Content(
								"Built with <b>WebComponents!</b>",
								"text/html"
							);
							n.level = NotificationLevel.info;
						}, 3000);
						setTimeout(() => {
							const ist = performance.now();
							const deadline = ist + 6000;
							n.style.display = "inline-block";
							const runner = st => {
								const i = st - ist;
								const size = 1 + i / 2000;
								n.style.transform = `scale(${size}) rotate(${Math.round(
									i / 100
								)}deg) translateX(${Math.round(i / 100)}px`;
								if (i < deadline) requestAnimationFrame(runner);
							};
							requestAnimationFrame(runner);
						}, 5000);
					});
					return n;
				})(),
				Notification.create({
					content: "Future",
					time: 3000,
				}),
				Notification.create({
					content: "Technologies",
					time: 3000,
				}),
				Notification.create({
					content: "Bullshit Elop",
					time: 3000,
				}),
			].forEach((x, i) => {
				setTimeout(() => {
					host.add(x, -1);
				}, (i + 0.2) * 1000);
			});
		});
		section.appendChild(demobutton);

		const h = document.createElement("h2");
		h.textContent = "How To";
		h.id = "how-to";
		section.appendChild(h);

		const p = document.createElement("p");
		p.textContent = "First register web component";
		section.appendChild(p);

		const code = document.createElement("code");
		code.innerHTML = register
			.replace(/^\t/gm, "")
			.replace(/\t/gm, "  ")
			.replace(/\n/g, "<br/>")
			.substr(5);
		section.appendChild(code);

		const p2 = document.createElement("p");
		p2.textContent = "Now we are ready to go";
		section.appendChild(p2);

		root.append(section);
	}

	{
		const examples = document.createElement("h2");
		examples.textContent = "Examples";
		examples.id = "examples";
		root.append(examples);
	}

	const examplesIndex = document.querySelector(".index__examples");
	for (let example of examples) {
		const slug = example.title.replace(/ /gm, "-").toLocaleLowerCase();
		const section = document.createElement("section");
		section.id = slug;

		const title = document.createElement("h3");
		title.textContent = example.title;
		section.appendChild(title);

		const description = document.createElement("p");
		description.textContent = example.description;
		section.appendChild(description);

		const button = document.createElement("button");
		button.addEventListener("click", example.fn);
		button.textContent = "show";
		button.classList.add("example-button");
		section.appendChild(button);

		const code = document.createElement("code");
		const lines = example.fn
			.toString()
			.replace(/^\t{3}/gm, "")
			.replace(/\t/gm, "  ")
			.split("\n");
		code.innerHTML = lines
			.filter((x, i) => {
				return i !== 0 && i !== lines.length - 1;
			})
			.join("<br/>");
		section.appendChild(code);

		const listItem = document.createElement("li");
		const listItemLink = document.createElement("a");
		listItemLink.href = "#" + slug;
		listItemLink.textContent = example.title;
		listItem.appendChild(listItemLink);

		examplesIndex.appendChild(listItem);

		root.appendChild(section);
	}
}

main().catch(e => {
	console.error(e);
});
