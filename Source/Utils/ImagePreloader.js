/*
---
description: Provides images preloader

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.ImagePreloader]
*/

LibCanvas.namespace('Utils').ImagePreloader = atom.Class({
	count : {
		errors : 0,
		aborts : 0,
		loaded : 0
	},
	images : {},
	processed : 0,
	number: 0,
	initialize: function (images) {
		this.createImages(images);
		this.readyfuncs = [];
	},
	onProcessed : function (type) {
		this.count[type]++;
		this.processed++;
		if (this.isReady()) this.readyfuncs.invoke(this, this);
		return this;
	},
	getInfo : function () {
		var stat = "Images loaded: {loaded}; Errors: {errors}; Aborts: {aborts}"
			.substitute(this.count);
		var ready = this.isReady() ? "Image preloading has completed;\n" : '';
		return ready + stat;
	},
	getProgress : function () {
		return this.isReady() ? 1 : (this.processed / this.number).round(3);
	},
	isReady : function () {
		return (this.number == this.processed);
	},
	createEvent : function (type) {
		return this.onProcessed.context(this, [type]);
	},
	createImage : function (src, key) {
		this.number++;
		return this.images[key] = $('body').create('img', { src : src })
			.bind({
				load  : this.createEvent('loaded'),
				error : this.createEvent('errors'),
				abort : this.createEvent('aborts')
			});
	},
	createImages : function (images) {
		var imgs = {};
		for (var i in images) imgs[i] = this.createImage(imgs[i], i);
		return imgs;
	},
	ready : function (fn) {
		this.isReady() ? fn(this) : this.readyfuncs.push(fn);
		return this;
	}
});