/*
---
description: Provides interface for moveable objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Moveable]
*/

LibCanvas.namespace('Behaviors').Moveable = atom.Class({
	moving : {
		interval : 0,
		speed : 0, // pixels per sec
		to : null
	},
	stopMoving : function () {
		this.moving.interval.stop();
		return this;
	},
	getCoords : function () {
		return this.shape.getCoords();
	},
	moveTo    : function (point, speed) {
		this.stopMoving();
		this.moving.speed = speed = (speed || this.moving.speed);
		if (!speed) {
			this.getShape().move(this.getCoords().diff(point));
			return this;
		}
		this.moving.interval = function () {
			var move = {}, pixelsPerFn = speed / 20;
			var diff = this.getCoords().diff(point);
			var distance = Math.hypotenuse(diff.x, diff.y);
			if (distance > pixelsPerFn) {
				move.x = diff.x * (pixelsPerFn / distance);
				move.y = diff.y * (pixelsPerFn / distance);
				this.getShape().move(move);
			} else {
				this.getShape().move(diff);
				this.stopMoving();
				this.bind('stopMove');
			}
		}.periodical(20, this);
		return this;
	}
});