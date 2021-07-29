let ColorTree = null;
{
	function findLuminosity(code) {
		const luminance = (v) => {
			v = parseInt(v, 16);

			const srgba = v / 255;
			if (srgba <= 0.03928) {
				return srgba / 12.92;
			}
			return ((srgba + 0.055) / 1.055) ** 2.4;
		};

		const r = luminance(code.slice(1, 3));
		const g = luminance(code.slice(3, 5));
		const b = luminance(code.slice(5));

		return (r * 0.2126)
			+ (g * 0.7152)
			+ (b * 0.0722);
	}

	class Node {
		constructor(name, code, width) {
			this._name = name;
			this._code = code;
			this._luminosity = findLuminosity(code);
			this._el = document.createElement('div');
			this._el.classList.add('node');
			this._el.style.backgroundColor = code;
			this._el.style.width = `${width}%`;
			this._el.style.height = `${width}%`;

			// listeners
			this._clickListener = null;
			this._el.addEventListener('mouseover', this._mouseover.bind(this));
			this._el.addEventListener('mouseleave', this._mouseleave.bind(this));
		}

		destroy() {
			this._el.removeEventListener('mouseover', this._mouseover.bind(this));
			this._el.removeEventListener('mouseleave', this._mouseleave.bind(this));
			if (this._clickListener) {
				this._el.removeEventListener('click', this._clickListener);
			}
		}

		_mouseover() {
			console.log('on');
		}

		_mouseleave() {
			console.log('off');
		}

		set clickListener(cb) {
			this._clickListener = () => cb(this);
			this._el.addEventListener('click', this._clickListener);
		}

		get el() {
			return this._el;
		}

		get name() {
			return this._name;
		}

		get code() {
			return this._name;
		}

		get luminosity() {
			return this._name;
		}
	}

	ColorTree = class ColorTree {
		constructor(container) {
			const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
			svg.setAttribute('viewBox', '0 0 100 100');
			svg.setAttribute('preserveAspectRatio', 'none');
			svg.classList.add('branchbox');
			container.append(svg);
			this._container = container;
			this._branchbox = svg;
			this._treap = new PriorityTreap('min');
			this._boxWidth = 4;

			this._clickListener = null;
		}

		peek() {
			return this._treap.peek();
		}

		take() {
			const node = this._treap.take();
			if (node) {
				this._removeHtmlNode(node.display);
			}
			return node;
		}

		insert(name, code) {
			const div = new Node(name, code, this._boxWidth);
			div.clickListener = (node) => {
				if (this._clickListener) {
					this._clickListener(node);
				}
			};
			const luminosity = findLuminosity(code);
			this._treap.insert(name, luminosity, div);

			return this;
		}

		update(name, code) {
			const luminosity = findLuminosity(code);
			const node = this._treap.update(name, luminosity);
			if (node) {
				node.display.style.backgroundColor = code;
			}

			return this;
		}

		remove(name) {
			const node = this._treap.remove(name);
			if (node) {
				this._removeHtmlNode(node.display);
			}

			return node;
		}

		render() {
			// clear branches
			this._branchbox.innerHTML = '';

			// render tree top down
			const root = this.peek();
			if (!root) {
				return;
			}

			let level = 0;
			let levelItems = [root];
			let nextLevelItems = [];
			let slotIndex = 1;
			let gapPercent = 100;

			const levelHeight = (v) => ((v / this.height) * 100);

			while (levelItems.length || nextLevelItems.length) {
				if (!levelItems.length) {
					levelItems = nextLevelItems;
					nextLevelItems = [];
					slotIndex = 1;
					gapPercent = 100 / (levelItems.length);
					level += 1;
				}

				const item = levelItems.shift();
				const { left, right } = item;
				const itemLeft = (slotIndex * gapPercent) - (gapPercent / 2);

				item.display.el.style.top = `${levelHeight(level) + (levelHeight(1) / 2) - (this._boxWidth * 0.5)}%`;
				item.display.el.style.left = `${itemLeft - (this._boxWidth / 2)}%`;
				this._container.append(item.display.el);

				if (item.parent) {
					const parentLeft = parseFloat(item.parent.display.el.style.left, 10);

					const lineColor = item === item.parent.left ? 'red' : 'blue';
					const line = document.createElementNS('http://www.w3.org/2000/svg','line');
					line.setAttribute('x1', parentLeft + (this._boxWidth / 2));
					line.setAttribute('y1', levelHeight(level - 1) + (levelHeight(1) / 2));
					line.setAttribute('x2', itemLeft);
					line.setAttribute('y2', levelHeight(level) + (levelHeight(1) / 2));
					line.setAttribute('stroke', lineColor);
					line.setAttribute('stroke-linecap', 'round');
					this._branchbox.append(line);
				}

				if (left) {
					nextLevelItems.push(left);
				}
				if (right) {
					nextLevelItems.push(right);
				}

				// increment slot
				slotIndex += 1;
			}
		}

		_removeHtmlNode(node) {
			node.el.remove();
		}

		set clickListener(cb) {
			this._clickListener = cb;
		}

		get height() {
			return this._treap.height;
		}
	}
}
