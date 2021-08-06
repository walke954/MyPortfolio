let P_TREE = null;
let P_AUTOCOMPLETE = null;
let HTML_COLORS = null;

function initSplashImg() {
	const fixStyles = () => {
		const { scrollY, innerHeight } = window;

		let scrollRatio = scrollY / innerHeight;
		if (scrollRatio > 1) {
			scrollRatio = 1;
		}

		const elements = [
			{
				el: document.getElementById('myself'),
				style: {
					bottom: `${(10 * scrollRatio) + 3}vh`,
					right: `${6 * (1 - scrollRatio)}vh`
				}
			},
			{
				el: document.getElementById('hello'),
				style: {
					top: `${10 + (50 * scrollRatio)}vh`,
					left: `${14 * (1 - scrollRatio)}vh`
				}
			},
			{
				el: document.getElementById('splash'),
				style: {
					opacity: 1 - ((0 - scrollRatio) ** 2)
				}
			}
		];


		elements.forEach((item) => {
			const { el, style } = item;

			Object.entries(style).forEach((item) => {
				const [prop, val] = item;
				el.style[prop] = val;
			});
		});
	}

	fixStyles();
	document.addEventListener('scroll', fixStyles);
	document.addEventListener('resize', fixStyles);
}

async function initColors() {
	HTML_COLORS = await fetch('colors').then(r => r.json());
}

function initTree() {
	const el = document.getElementById('color-tree');
	P_TREE = new ColorTree(el);

	// default 20 random colors
	for (let i = 0; i < 30; i += 1) {
		const colors = Object.keys(HTML_COLORS);
		const name = colors[Math.floor(Math.random() * colors.length)];
		const value = HTML_COLORS[name];
		const insert = P_TREE.insert(name, value);
		if (insert) {
			P_AUTOCOMPLETE.remove(name);
		}
	}

	P_TREE.clickListener = (node) => {
		P_TREE.remove(node.name);
		P_AUTOCOMPLETE.insert(node.name);
		P_TREE.render();
	}
	P_TREE.render();
}

function initAutocomplete() {
	const el = document.getElementById('color-search');
	P_AUTOCOMPLETE = new Autocomplete(el, 'color-search', Object.keys(HTML_COLORS));
	P_AUTOCOMPLETE.slot = (item, key) => {
		const text = document.createElement('span');
		text.innerText = key;

		const colorbox = document.createElement('div');
		colorbox.style.backgroundColor = HTML_COLORS[key];
		colorbox.classList.add('colorbox');

		item.append(text);
		item.append(colorbox);
	}
}

function initSkillListeners() {
	const langs = ['Node.js', 'Javascript', 'HTML', 'CSS', 'Java', 'Python', 'Swift'];
	const frameworks = ['Express', 'Vue.js', 'React.js', 'React Native'];
	const more = ['Microsoft SQL', 'Mongo DB', 'Docker'];

	const types = document.querySelectorAll('#skills .skill-type > h3');
	const tagContainer = document.querySelector('#skills .tag-container');

	const createLabels = list => list.map((l, i) => `<div class="tag"><span>${l}</span></div>`).join('');
	
	types.forEach((el) => {
		el.addEventListener('click', (e) => {
			const { target } = e;
			types.forEach((t) => {
				if (t === target) {
					t.classList.add('selected');
				} else {
					t.classList.remove('selected');
				}
			});

			const { innerText } = target;
			switch (innerText) {
				case 'Languages':
					tagContainer.innerHTML = createLabels(langs);
					break;
				case 'Frameworks':
					tagContainer.innerHTML = createLabels(frameworks);
					break;
				case 'More':
					tagContainer.innerHTML = createLabels(more);
					break;
				default:
					// do nothing
			}
		});
	})
}

function initWorkListeners() {
	
}

async function main() {
	initSplashImg();
	initSkillListeners();
	initWorkListeners();
	await initColors();
	initAutocomplete();
	initTree();
}

main();
