/*
---
description: A keyboard control abstraction class

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Mouse]
*/

(function () {

var Keyboard = LibCanvas.Keyboard = atom.Class({
	Static: {
		keyCodes : {
			// Alphabet
			a:65, b:66, c:67, d:68, e:69,
			f:70, g:71, h:72, i:73, j:74,
			k:75, l:76, m:77, n:78, o:79,
			p:80, q:81, r:82, s:83, t:84,
			u:85, v:86, w:87, x:88, y:89, z:90,
			// Numbers
			n0:48, n1:49, n2:50, n3:51, n4:52,
			n5:53, n6:54, n7:55, n8:56, n9:57,
			// Controls
			tab:  9, enter:13, shift:16, backspace:8,
			ctrl:17, alt  :18, esc  :27, space    :32,
			menu:93, pause:19, cmd  :91,
			insert  :45, home:36, pageup  :33,
			'delete':46, end :35, pagedown:34,
			// F*
			f1:112, f2:113, f3:114, f4 :115, f5 :116, f6 :117,
			f7:118, f8:119, f9:120, f10:121, f11:122, f12:123,
			// numpad
			np0: 96, np1: 97, np2: 98, np3: 99, np4:100,
			np5:101, np6:102, np7:103, np8:104, np9:105,
			npslash:11,npstar:106,nphyphen:109,npplus:107,npdot:110,
			// Lock
			capslock:20, numlock:144, scrolllock:145,

			// Symbols
			equals: 61, hyphen   :109, coma  :188, dot:190,
			gravis:192, backslash:220, sbopen:219, sbclose:221,
			slash :191, semicolon: 59, apostrophe : 222,

			// Arrows
			aleft:37, aup:38, aright:39, adown:40
		},
		keyStates: {},
		keyState: function (keyName) {
			return this.keyStates[this.keyName(keyName)];
		},
		keyName: function (code) {
			return (typeof code == 'string') ? code : this.key(code);
		},
		key: function (code) {
			if ('keyCode' in code) return this.codeNames[code.keyCode];
			return this[typeof code == 'number' ? 'codeNames' : 'keyCodes'][code] || null;
		}
	},
	initialize : function (libcanvas, preventDefault) {
		this.libcanvas  = libcanvas;
		this.preventDefault = preventDefault; 
		this.bindings = {};
	},
	setEvents: function () {
		var win = atom(window).bind({
			keydown: this.keyEvent(true),
			keyup:   this.keyEvent(false)
		});

		this.preventDefault && win.bind({
			keypress : function (e) {
				return !this.prevent(this.self.key(e));
			}.context(this)
		});
	},
	getBinding: function (keyName, createIfNull) {
		var bindings = this.bindinds;
		if (!keyName in bindings && createIfNull) {
			bindings[keyName] = [];
		}
		return bindings[keyName] || null;
	},
	keyEvent: function (setTo) {
		return function (e) {
			var b, key = this.self.key(e);
			this.self.keyStates[key] = setTo;
			if (setTo && (b = this.getBinding(key))) b.invoke(this.libcanvas, e, key);
			return !this.prevent(key);
		}.context(this);
	},
	prevent : function (key) {
		var pD = this.preventDefault;
		return pD && (!Array.isArray(pD) || pD.contains(key));
	},
	keyState : function (keyName) {
		return this.self.keyState(keyName);
	},
	bind : function (keyName, fn) {
		if (arguments.length == 1) {
			for (var i in keyName) this.bind(i, keyName[i]);
			return this;
		}
		this.getBinding(keyName, true).push(fn);
		return this;
	},
	unbind : function (key, fn) {
		this.bindings[key].erase(fn);
		return this;
	}
});

Keyboard.extend({ codeNames: Object.invert(Keyboard.keyCodes) });

})();
