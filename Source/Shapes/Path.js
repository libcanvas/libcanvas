/*
---
description: Provides a user-defined path (similar to vector graphics) as canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Shape

provides: [LibCanvas.Shapes.Path]
*/

new function () {

var Point = LibCanvas.Point;

var Path = LibCanvas.namespace('Shapes').Path = atom.Class({
	// Extends: LibCanvas.Shape,
	// todo : refactoring
	set : function (builder) {
		this.builder = builder;
		builder.path = this;
		return this;
	},
	getBuffer : function () {
		if (!this.buffer) this.buffer = LibCanvas.Buffer(1, 1, true);
		return this.buffer;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		this.builder.parts.forEach(function (part) {
			ctx[part.method].apply(ctx, part.args);
		});
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	hasPoint : function (point) {
		var ctx = this.getBuffer().ctx;
		if (this.builder.changed) {
			this.builder.changed = false;
			this.processPath(ctx);
		}
		return ctx.isPointInPath(Point.from(arguments));
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	},
	move : function (distance) {
		var moved = [];
		var move = function (a) {
			if (!moved.contains(a)) {
				a.move(distance);
				moved.push(a);
			}
		};
		this.builder.parts.forEach(function (part) {
			var a = part.args[0];
			switch(part.method) {
				case 'moveTo':
				case 'lineTo':
					move(a);
					break;
				case 'bezierCurveTo':
					for (var prop in ['p1', 'p2', 'to'].toKeys()) move(prop);
					break;
				case 'arc':
					move(a.circle);
					break;
			}
		});
		return this;
	}
});

LibCanvas.namespace('Shapes.Path').Builder = atom.Class({
	Extends: LibCanvas.Shape,
	parts : [],
	changed : true,
	add : function (method, args) {
		this.changed = true;
		this.parts.push({
			method : method,
			args : args
		});
		return this;
	},
	pop : function () {
		this.changed = true;
		this.parts.pop();
		return this;
	},
	move : function () {
		return this.add('moveTo', [Point.from(arguments)]);
	},
	line : function () {
		return this.add('lineTo', [Point.from(arguments)]);
	},
	curve : function (p1, p2, to) {
		var args = Array.pickFrom(arguments);
		
		if (args.length >= 6) {
			return this.curve(
				[ args[0], args[1] ],
				[ args[2], args[3] ],
				[ args[4], args[5] ]
			);
		}
		if (args[0] != null) {
			args = {
				p1 : args[0],
				p2 : args[1],
				to : args[2]
			};
		}
		for (var i in args) args[i] = Point.from(args[i]);
		return this.add('bezierCurveTo', [args]);
	},
	arc : function (circle, angle, acw) {
		var a = Array.pickFrom(arguments);

		if (a.length >= 6) {
			return this.arc({
				circle : [ a[0], a[1], a[2] ],
				angle : [ a[3], a[4] ],
				acw : a[5]
			});
		}
		a.circle = LibCanvas.Shapes.Circle.from(a.circle);
		if (Array.isArray(a.angle)) {
			a.angle = {
				start : a.angle[0],
				end   : a.angle[1]
			};
		}
		a.acw = !!a.acw;
		return this.add('arc', [a]);
	},
	hasPoint : function () {
		var path = this.build();
		return path.hasPoint.apply(path, arguments);
	},
	string : function () {
		var string = '';
		this.parts.forEach(function (part) {
			var a = part.args[0];
			switch(part.method) {
				case 'moveTo':
					string += 'move,' + a.x.round(2) + ',' + a.y.round(2);
					break;
				case 'lineTo':
					string += 'line,' + a.x.round(2) + ',' + a.y.round(2);
					break;
				case 'bezierCurveTo':
					string += 'curve,';
					for (var prop in ['p1', 'p2', 'to'].toKeys()) {
						string += a[prop].x.round(2) + ',' + a[prop].y.round(2);
						if (prop != 'to') string += ',';
					}
					break;
				case 'arc':
					string += 'arc,';
					string += a.circle.center.x.round(2) + ',' + a.circle.center.y.round(2) + ',';
					string += a.circle.radius.round(2) + ',' + a.angle.start.round(2) + ',';
					string += a.angle.end.round(2) + ',' + (a.acw ? 1 : 0);
					break;
			}
			string += '/';
		}.context(this));
		return string;
	},
	parseString : function (string) {
		string.split('/').forEach(function (line) {
			if (line) {
				var parts  = line.split(',');
				var method = parts.shift();
				for (var i = parts.length; i--;) parts[i] *= 1;
				this[method].apply(this, parts);
			}
		}.context(this));
	},
	build : function () {
		if (arguments.length == 1) this.parseString(arguments[0]);
		if (!this.path) this.path = new LibCanvas.Shapes.Path(this);
		return this.path;
	}
});

}();