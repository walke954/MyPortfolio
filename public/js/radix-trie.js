let RadixTrie = null;
{
	class Node {
		constructor(val, parent) {
			this._val = val;
			this._key = false;
			this._dict = {};
			this._parent = parent;
		}

		get string() {
			let string = '';
			let node = this;
			while (node.parent) {
				string = node.val + string;
				node = node.parent;
			}

			return string;
		}

		get parent() {
			return this._parent;
		}

		set key(bool) {
			this._key = bool;
		}

		get key() {
			return this._key;
		}

		get val() {
			return this._val;
		}

		get dict() {
			return this._dict;
		}
	}

	RadixTrie = class RadixTrie {
		constructor(items) {
			this._root = new Node('');
			items.forEach(key => this.add(key));
		}

		add(key) {
			let node = this._root;
			while (key.length) {
				const char = key.charAt(0);
				key = key.slice(1);
				if (!node.dict[char]) {
					node.dict[char] = new Node(char, node);
				}

				node = node.dict[char];
				if (!key.length) {
					node.key = true;
				}
			}

			return this;
		}

		remove(key) {
			let node = this._root;
			while (node && key.length) {
				const char = key.charAt(0);
				key = key.slice(1);

				node = node.dict[char];
			}

			if (node) {
				node.key = false;
			}
		}

		search(key, n = 1, maxUpSteps = 3) {
			const singleSearch = n === 1;

			// find target node
			let prevNode = this._root;
			let node = this._root;
			let curKey = key;
			while (curKey.length && node) {
				const char = curKey.charAt(0);
				curKey = curKey.slice(1);
				prevNode = node;
				node = node.dict[char];

				// if no corresponding node is found, check with opposite case
				if (!node) {
					const switchCase = char === char.toLowerCase()
						? char.toUpperCase()
						: char.toLowerCase();

					node = prevNode.dict[switchCase]
				}
			}

			if (!node && singleSearch) {
				return null;
			}

			// get last viable node, node will be undefined when no match
			// fix max up steps based on user input length
			node = node || prevNode;
			maxUpSteps -= key.length - node.string.length;

			// top down search
			const matches = [];
			const nodeList = [node];

			// use map to prevent repeating nodes
			const map = new Map();

			// loop through until there are no options or list has found what it needs
			while (maxUpSteps > 0 && n && nodeList.length) {
				while (n && nodeList.length) {
					const checkNode = nodeList.shift();

					if (map.has(checkNode)) {
						continue;
					}

					if (checkNode.key) {
						matches.push(checkNode.string);
						n -= 1;
					}

					// go down tree
					const checkNodes = Object.values(checkNode.dict);
					nodeList.push(...checkNodes);

					// add to map
					map.set(checkNode, 1);
				}

				// add parent
				if (node.parent) {
					node = node.parent;
					nodeList.push(node);
				}

				maxUpSteps -= 1;
			}

			return singleSearch ? matches[0] : matches;
		}

		get root() {
			return this._root;
		}
	}
}
