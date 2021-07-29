class Autocomplete {
	constructor(el, name, items) {
		el.classList.add('autocomplete');
		this._container = el;

		// attach components
		const input = document.createElement('input');
		input.setAttribute('type', 'text');
		input.setAttribute('name', name);
		el.append(input);
		this._input = input;

		const list = document.createElement('div');
		list.classList.add('list');
		list.classList.add('no-display');
		el.append(list);

		this._list = list;

		// add listeners
		input.addEventListener('focus', this._onfocus.bind(this));
		input.addEventListener('blur', this._onblur.bind(this));
		input.addEventListener('input', this._oninput.bind(this));
		input.addEventListener('keydown', this._onkeydown.bind(this));
		list.addEventListener('mousedown', this._onclick.bind(this));
		list.addEventListener('transitionend', this._ontransitionend.bind(this));

		// state
		this._value = '';
		this._empty = true;
		this._focus = false;
		this._loadstate = 'idle';
		this._selected = 0;
		this._items = []; // search results
		this._radixTrie = new RadixTrie(items);
		this._slot = null; // callback that determines how to fill each item slot
		this._emptyText = null;
	}

	remove(key) {
		this._radixTrie.remove(key);
	}

	insert(key) {
		this._radixTrie.add(key);
	}

	destroy() {
		this._input.removeEventListener('focus', this._onfocus.bind(this));
		this._input.removeEventListener('blur', this._onblur.bind(this));
		this._input.removeEventListener('input', this._oninput.bind(this));
		this._input.removeEventListener('keydown', this._onkeydown.bind(this));
		this._list.addEventListener('mousedown', this._onclick.bind(this));
		this._list.removeEventListener('transitionend', this._ontransitionend.bind(this));
	}

	_close() {
		this._loadstate = 'closing';
		this._focus = false;
		this._list.classList.add('no-display');
	}

	_open() {
		this._list.classList.remove('no-display');
		this._loadstate = 'opening';
		this._focus = true;
	}

	_updateItems() {
		this._list.innerHTML = '';

		if (this._items.length && this._focus) {
			this._list.classList.remove('no-display');
		} else {
			this._list.classList.add('no-display');
		}

		this._items.forEach((key, i) => {
			const item = document.createElement('div');
			item.classList.add('list-item');

			if (i === 0) {
				this._selected = 0;
				item.classList.add('selected');
			}

			if (!this._slot) {
				const text = document.createElement('span');
				text.innerText = key;
				item.append(text);
			} else {
				this._slot(item, key);
			}
			this._list.append(item);
		});
	}

	_addEmptyMsg() {
		this._list.innerHTML = '';

		const msg = document.createElement('span');
		msg.innerText = this._emptyText || 'Type to find item...';
		this._list.append(msg);
	}

	_change() {
		// set empty
		if (this._empty && this._value !== '') {
			this._empty = false;
		} else if (!this._empty && this._value === '') {
			this._empty = true;
		}

		const totalItems = 10;
		const distance = this._value.length > 2 ? 2 : this._value.length;
		this._items = this._radixTrie.search(this._value, totalItems, distance);

		// update autocomplete
		if (this._empty) {
			this._addEmptyMsg();
		} else {
			this._updateItems();
		}
	}

	_ontransitionend(e) {
		if (this._loadstate === 'closing') {
			this._list.classList.add('no-display');
		}

		this._loadstate = 'idle';
	}

	_onkeydown(e) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			const children = [...this._list.children];
			children[this._selected].classList.toggle('selected');

			if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (this._items.length && this._selected === this._items.length - 1) {
					this._selected = 0;
				} else {
					this._selected += 1;
				}
			} else {
				e.preventDefault();
				if (this._items.length && this._selected === 0) {
					this._selected = this._items.length - 1;
				} else {
					this._selected -= 1;
				}
			}

			const item = children[this._selected];
			item.classList.toggle('selected');

			const top = item.offsetTop;
			const { scrollTop, offsetHeight } = this._list;
			const scrollBottom = scrollTop + offsetHeight - item.offsetHeight;
			if (top < scrollTop) {
				this._list.scrollTo(0, top);
			} else if (top > scrollBottom) {
				this._list.scrollTo(0, top - offsetHeight + item.offsetHeight);
			}
		} else if (e.key === 'Enter' && this._items.length) {
			this._value = this._items[this._selected];
			this._input.value = this._value;
			this._close();
		}
	}

	_onclick(e) {
		e.preventDefault();
		e.stopPropagation();
		const children = [...this._list.children];
		for (let i = 0; i < children.length; i += 1) {
			if (children[i] === e.target || children[i].contains(e.target)) {
				this._value = this._items[i];
				this._input.value = this._value;
				break;
			}
		}
		this._close();
		this._input.focus();
	}

	_oninput(v) {
		this._value = this._input.value;
		if (!this._focus) {
			this._open();
		}
		this._change();
	}

	_onfocus() {
		this._open();
		this._change();
	}

	_onblur() {
		this._close();
		this._change();
	}

	set slot(v) {
		this._slot = v;
	}

	set emptyText(v) {
		this._emptyText = v;
	}
}
