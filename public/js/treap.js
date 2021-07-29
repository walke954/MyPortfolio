let PriorityTreap = null;
{
	class Node {
		constructor(key, priority, display = {}, parent = null) {
			this.key = key;
			this.priority = priority;
			this.display = display;

			this.parent = parent;
			this.left = null;
			this.right = null;
		}
	}

	PriorityTreap = class PriorityTreap {
		constructor(type) {
			if (type !== 'min' && type !== 'max') {
				throw new Error(`type must be 'min' or 'max'`);
			}
			this._type = type;

			this._root = null;
			this._size = 0;
		}

		peek() {
			return this._root;
		}

		take() {
			if (!this._root) {
				return null;
			}
			return this.remove(this._root.key);
		}

		insert(key, priority, display) {
			let newNode = null;
			if (!this._root) {
				newNode = new Node(key, priority, display);
				this._root = newNode;
				this._size += 1;
				return newNode;
			}

			// binary search insert
			let node = this._root;
			while (true) {
				if (node.key === key) {
					break; // duplicate found
				} else if (node.key > key) {
					if (node.left) {
						node = node.left;
					} else {
						newNode = new Node(key, priority, display, node);
						node.left = newNode;
						break;
					}
				} else {
					if (node.right) {
						node = node.right;
					} else {
						newNode = new Node(key, priority, display, node);
						node.right = newNode;
						break;
					}
				}
			}

			if (newNode) {
				this._size += 1;
				this._adjustNode(newNode);
			}

			return newNode;
		}

		remove(key) {
			const node = this.search(key);
			if (!node) {
				return null;
			}

			while (true) {
				const { left, right } = node;
				let higherPriorityChild = null;

				// find the higher priority child to rotate with
				if (left && right) {
					let leftOverRight = false;
					if (this._type === 'min') {
						leftOverRight = left.priority < right.priority;
					} else {
						leftOverRight = left.priority > right.priority;
					}
					higherPriorityChild = leftOverRight ? left : right;
				} else if (left) {
					higherPriorityChild = left;
				} else if (right) {
					higherPriorityChild = right;
				}
				
				if (higherPriorityChild) {
					if (node.right === higherPriorityChild) {
						this._rotateLeft(node);
					} else {
						this._rotateRight(node);
					}
				} else {
					// no change made
					break;
				}
			}

			// remove node from tree
			const { parent } = node;
			if (parent) {
				if (parent.left === node) {
					parent.left = null;
				} else {
					parent.right = null;
				}
				node.parent = null;
			} else {
				this._root = null;
			}

			this._size -= 1;
			
			return node;
		}

		update(key, priority) {
			const node = this.search(key);
			if (!node) {
				return null;
			}

			node.priority = priority;
			this._adjustNode(node);

			return node;
		}

		search(key) {
			// binary search insert
			let node = this._root;
			while (node && key !== node.key) {
				if (node.key >= key) {
					node = node.left;
				} else {
					node = node.right;
				}
			}

			return node;
		}

		_rotateLeft(node) {
			const { parent, left, right, key } = node;
			if (!right) {
				return;
			}

			if (parent) {
				if (parent.left === node) {
					// node is on parent's left
					parent.left = right;
				} else {
					// node is on parent's right
					parent.right = right;
				}
			} else {
				this._root = right;
			}
			right.parent = parent;

			const temp = right.left;
			right.left = node;
			node.parent = right;

			node.right = temp;
			if (temp) {
				temp.parent = node;
			}
		}

		_rotateRight(node) {
			const { parent, left, right, key } = node;
			if (!left) {
				return;
			}

			if (parent) {
				if (parent.left === node) {
					// node is on parent's left
					parent.left = left;
				} else {
					// node is on parent's right
					parent.right = left;
				}
			} else {
				this._root = left;
			}
			left.parent = parent;

			const temp = left.right;
			left.right = node;
			node.parent = left;

			node.left = temp;
			if (temp) {
				temp.parent = node;
			}
		}

		_adjustNode(node) {
			while (true) {
				const { parent, left, right } = node;
				let higherPriorityChild = null;
				let higherPriorityThanChild = false;
				let higherPriorityThanParent = false;
				let higherPriorityThanSelf = false;

				// find the higher priority child to rotate with
				if (left && right) {
					let leftOverRight = false;
					if (this._type === 'min') {
						leftOverRight = left.priority < right.priority;
					} else {
						leftOverRight = left.priority > right.priority;
					}
					higherPriorityChild = leftOverRight ? left : right;
				} else if (left) {
					higherPriorityChild = left;
				} else if (right) {
					higherPriorityChild = right;
				}

				// should new node rotate with child?
				if (higherPriorityChild) {
					higherPriorityThanChild = this._type === 'min'
						? higherPriorityChild.priority < node.priority
						: higherPriorityChild.priority > node.priority;
					higherPriorityThanSelf = this._type === 'min'
						? higherPriorityChild.priority < node.priority
						: higherPriorityChild.priority > node.priority;
				}

				// should new node rotate with parent?
				if (parent) {
					higherPriorityThanParent = this._type === 'min'
						? node.priority < parent.priority
						: node.priority > parent.priority;
				}

				// rotations...
				if (parent && higherPriorityThanParent) {
					if (parent.right === node) {
						this._rotateLeft(parent);
					} else {
						this._rotateRight(parent);
					}
				} else if (higherPriorityChild && higherPriorityThanSelf) {
					if (node.right === higherPriorityChild) {
						this._rotateLeft(node);
					} else {
						this._rotateRight(node);
					}
				} else {
					// no change made
					break;
				}
			}
		}

		get min() {
			if (!this._root) {
				return null;
			}

			let node = this._root;
			while (node.left) {
				node = node.left;
			}

			return node;
		}

		get max() {
			if (!this._root) {
				return null;
			}

			let node = this._root;
			while (node.right) {
				node = node.right;
			}

			return node;
		}

		get height() {
			if (!this._root) {
				return 0;
			}

			let h = 1;
			let currentLevel = [this._root];
			let nextLevel = [];
			while (currentLevel.length || nextLevel.length) {
				// increment height, go to next level
				if (!currentLevel.length) {
					currentLevel = nextLevel;
					nextLevel = [];
					h += 1;
				}

				const { left, right } = currentLevel.shift();
				if (left) {
					nextLevel.push(left);
				}
				if (right) {
					nextLevel.push(right);
				}
			}

			return h;
		}

		get size() {
			return this._size;
		}
	}
}
