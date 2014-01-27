;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * Node.JS module "Deep Extend"
 * @description Recursive object extending.
 * @version 0.2.6
 * @author Viacheslav Lotsmanov (unclechu) <lotsmanov89@gmail.com>
 * @license MIT
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Viacheslav Lotsmanov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Extening object that entered in first argument.
 * Returns extended object or false if have no target object or incorrect type.
 * If you wish to clone object, simply use that:
 *  deepExtend({}, yourObj_1, [yourObj_N]) - first arg is new empty object
 */
var deepExtend = module.exports = function (/*obj_1, [obj_2], [obj_N]*/) {
    if (arguments.length < 1 || typeof arguments[0] !== 'object') {
        return false;
    }

    if (arguments.length < 2) return arguments[0];

    var target = arguments[0];

    // convert arguments to array and cut off target object
    var args = Array.prototype.slice.call(arguments, 1);

    var key, val, src, clone;

    args.forEach(function (obj) {
        if (typeof obj !== 'object') return;

        for (key in obj) {
            if (obj[key] !== void 0) {
                src = target[key];
                val = obj[key];

                if (val === target) continue;

                if (typeof val !== 'object' || val === null) {
                    target[key] = val;
                    continue;
                }

                if (typeof src !== 'object') {
                    clone = (Array.isArray(val)) ? [] : {};
                    target[key] = deepExtend(clone, val);
                    continue;
                }

                if (Array.isArray(val)) {
                    clone = (Array.isArray(src)) ? src : [];
                } else {
                    clone = (!Array.isArray(src)) ? src : {};
                }

                target[key] = deepExtend(clone, val);
            }
        }
    });

    return target;
}

},{}],2:[function(require,module,exports){
'use strict';

module.exports = '_ee2_';

},{}],3:[function(require,module,exports){
'use strict';

var value = require('es5-ext/lib/Object/valid-value')
  , id    = require('./_id');

module.exports = function (emitter) {
	var type, data;

	value(emitter);

	if (arguments[1] != null) {
		type = arguments[1];
		data = emitter.hasOwnProperty(id) && emitter[id];
		if (!data) {
			return;
		}
		if (data.hasOwnProperty(type)) {
			delete data[type];
		}
	} else if (emitter.hasOwnProperty(id)) {
		delete emitter[id];
	}
};

},{"./_id":2,"es5-ext/lib/Object/valid-value":22}],4:[function(require,module,exports){
'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , callable = require('es5-ext/lib/Object/valid-callable')
  , id       = require('./_id')

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit
  , colId, methods, descriptors, base;

colId = id + 'l_';

on = function (type, listener) {
	var data;

	callable(listener);

	if (!this.hasOwnProperty(id)) {
		data = descriptor.value = {};
		defineProperty(this, id, descriptor);
		descriptor.value = null;
	} else {
		data = this[id];
	}
	if (!data.hasOwnProperty(type)) data[type] = listener;
	else if (data[type].hasOwnProperty(colId)) data[type].push(listener);
	else (data[type] = [data[type], listener])[colId] = true;

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once._listener = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!this.hasOwnProperty(id)) return this;
	data = this[id];
	if (!data.hasOwnProperty(type)) return this;
	listeners = data[type];

	if (listeners.hasOwnProperty(colId)) {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) || (candidate._listener === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) || (listeners._listener === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var data, i, l, listener, listeners, args;

	if (!this.hasOwnProperty(id)) return;
	data = this[id];
	if (!data.hasOwnProperty(type)) return;
	listeners = data[type];

	if (listeners.hasOwnProperty(colId)) {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) {
			args[i - 1] = arguments[i];
		}

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;

},{"./_id":2,"es5-ext/lib/Object/descriptor":14,"es5-ext/lib/Object/valid-callable":21}],5:[function(require,module,exports){
'use strict';

var ee = module.exports = require('./core');
ee.allOff = require('./all-off');
ee.pipe = require('./pipe');
ee.unify = require('./unify');

},{"./all-off":3,"./core":4,"./pipe":6,"./unify":7}],6:[function(require,module,exports){
'use strict';

var defineProperty = Object.defineProperty
  , copy           = require('es5-ext/lib/Array/prototype/copy')
  , remove         = require('es5-ext/lib/Array/prototype/remove')
  , d              = require('es5-ext/lib/Object/descriptor')
  , value          = require('es5-ext/lib/Object/valid-value')
  , emit           = require('./core').methods.emit

  , id = '- ee -'
  , pipeTag = '\u0001pipes';

module.exports = function (emitter1, emitter2) {
	var pipes, pipe;

	value(emitter1) && value(emitter2);
	if (!emitter1.emit) {
		throw new TypeError(emitter1 + ' is not emitter');
	}

	pipe = {
		close: function () {
			remove.call(pipes, emitter2);
		}
	};
	if (!emitter1.hasOwnProperty(id)) {
		defineProperty(emitter1, id, d({}));
	}
	if (emitter1[id][pipeTag]) {
		(pipes = emitter1[id][pipeTag]).push(emitter2);
		return pipe;
	}
	(pipes = emitter1[id][pipeTag] = [emitter2]).copy = copy;
	defineProperty(emitter1, 'emit', d(function () {
		var i, emitter, data = pipes.copy();
		emit.apply(this, arguments);
		for (i = 0; (emitter = data[i]); ++i) {
			emit.apply(emitter, arguments);
		}
	}));

	return pipe;
};

},{"./core":4,"es5-ext/lib/Array/prototype/copy":8,"es5-ext/lib/Array/prototype/remove":10,"es5-ext/lib/Object/descriptor":14,"es5-ext/lib/Object/valid-value":22}],7:[function(require,module,exports){
'use strict';

var forEach    = require('es5-ext/lib/Object/for-each')
  , validValue = require('es5-ext/lib/Object/valid-value')
  , id         = require('./_id')

  , push = Array.prototype.apply, defineProperty = Object.defineProperty
  , d = { configurable: true, enumerable: false, writable: true }
  , colId = id + 'l_';

module.exports = function (e1, e2) {
	var data;
	validValue(e1) && validValue(e2);
	if (!e1.hasOwnProperty(id)) {
		if (!e2.hasOwnProperty(id)) {
			d.value = {};
			defineProperty(e1, id, d);
			defineProperty(e2, id, d);
			d.value = null;
			return;
		}
		d.value = e2[id];
		defineProperty(e1, id, d);
		d.value = null;
		return;
	}
	data = d.value = e1[id];
	if (!e2.hasOwnProperty(id)) {
		defineProperty(e2, id, d);
		d.value = null;
		return;
	}
	if (data === e2[id]) return;
	forEach(e2[id], function (listener, name) {
		if (!data.hasOwnProperty(name)) {
			data[name] = listener;
			return;
		}
		if (data[name].hasOwnProperty(colId)) {
			if (listener.hasOwnProperty(colId)) push.apply(data[name], listener);
			else data[name].push(listener);
		} else if (listener.hasOwnProperty(colId)) {
			listener.unshift(data[name]);
			data[name] = listener;
		} else {
			(data[name] = [data[name], listener])[colId] = true;
		}
	});
	defineProperty(e2, id, d);
	d.value = null;
};

},{"./_id":2,"es5-ext/lib/Object/for-each":16,"es5-ext/lib/Object/valid-value":22}],8:[function(require,module,exports){
'use strict';

var slice = Array.prototype.slice;

module.exports = function () {
	return slice.call(this);
};

},{}],9:[function(require,module,exports){
'use strict';

var numIsNaN = require('../../Number/is-nan')
  , ois      = require('../../Object/is')
  , value    = require('../../Object/valid-value')

  , indexOf = Array.prototype.indexOf;

module.exports = function (searchElement/*, fromIndex*/) {
	var i;
	if (!numIsNaN(searchElement) && (searchElement !== 0)) {
		return indexOf.apply(this, arguments);
	}

	for (i = (arguments[1] >>> 0); i < (value(this).length >>> 0); ++i) {
		if (this.hasOwnProperty(i) && ois(searchElement, this[i])) {
			return i;
		}
	}
	return -1;
};

},{"../../Number/is-nan":11,"../../Object/is":19,"../../Object/valid-value":22}],10:[function(require,module,exports){
'use strict';

var indexOf = require('./e-index-of')

  , forEach = Array.prototype.forEach, splice = Array.prototype.splice;

module.exports = function (/*item*/) {
	forEach.call(arguments, function (item) {
		var index = indexOf.call(this, item);
		if (index !== -1) {
			splice.call(this, index, 1);
		}
	}, this);
};

},{"./e-index-of":9}],11:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	return (value !== value); //jslint: skip
};

},{}],12:[function(require,module,exports){
// Internal method, used by iteration functions.
// Calls a function for each key-value pair found in object
// Optionally takes compareFn to iterate object in specific order

'use strict';

var isCallable = require('./is-callable')
  , callable   = require('./valid-callable')
  , value      = require('./valid-value')

  , call = Function.prototype.call, keys = Object.keys;

module.exports = function (method) {
	return function (obj, cb/*, thisArg, compareFn*/) {
		var list, thisArg = arguments[2], compareFn = arguments[3];
		obj = Object(value(obj));
		callable(cb);

		list = keys(obj);
		if (compareFn) {
			list.sort(isCallable(compareFn) ? compareFn.bind(obj) : undefined);
		}
		return list[method](function (key, index) {
			return call.call(cb, thisArg, obj[key], key, obj, index);
		});
	};
};

},{"./is-callable":17,"./valid-callable":21,"./valid-value":22}],13:[function(require,module,exports){
'use strict';

var isPlainObject = require('./is-plain-object')
  , forEach       = require('./for-each')
  , extend        = require('./extend')
  , value         = require('./valid-value')

  , recursive;

recursive = function (to, from, cloned) {
	forEach(from, function (value, key) {
		var index;
		if (isPlainObject(value)) {
			if ((index = cloned[0].indexOf(value)) === -1) {
				cloned[0].push(value);
				cloned[1].push(to[key] = extend({}, value));
				recursive(to[key], value, cloned);
			} else {
				to[key] = cloned[1][index];
			}
		}
	}, from);
};

module.exports = function (obj/*, deep*/) {
	var copy;
	if ((copy = Object(value(obj))) === obj) {
		copy = extend({}, obj);
		if (arguments[1]) {
			recursive(copy, obj, [[obj], [copy]]);
		}
	}
	return copy;
};

},{"./extend":15,"./for-each":16,"./is-plain-object":18,"./valid-value":22}],14:[function(require,module,exports){
'use strict';

var isCallable = require('./is-callable')
  , callable   = require('./valid-callable')
  , validValue = require('./valid-value')
  , copy       = require('./copy')
  , map        = require('./map')
  , isString   = require('../String/is-string')
  , contains   = require('../String/prototype/contains')

  , bind = Function.prototype.bind
  , defineProperty = Object.defineProperty
  , d;

d = module.exports = function (dscr, value) {
	var c, e, w;
	if (arguments.length < 2) {
		value = dscr;
		dscr = null;
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	return { value: value, configurable: c, enumerable: e, writable: w };
};

d.gs = function (dscr, get, set) {
	var c, e;
	if (isCallable(dscr)) {
		set = (get == null) ? undefined : callable(get);
		get = dscr;
		dscr = null;
	} else {
		get = (get == null) ? undefined : callable(get);
		set = (set == null) ? undefined : callable(set);
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	return { get: get, set: set, configurable: c, enumerable: e };
};

d.binder = function self(name, dv) {
	var value, dgs;
	if (!isString(name)) {
		return map(name, function (dv, name) { return self(name, dv); });
	}
	value = validValue(dv) && callable(dv.value);
	dgs = copy(dv);
	delete dgs.writable;
	delete dgs.value;
	dgs.get = function () {
		dv.value = bind.call(value, this);
		defineProperty(this, name, dv);
		return this[name];
	};
	return dgs;
};

},{"../String/is-string":23,"../String/prototype/contains":24,"./copy":13,"./is-callable":17,"./map":20,"./valid-callable":21,"./valid-value":22}],15:[function(require,module,exports){
'use strict';

var value = require('./valid-value')

  , forEach = Array.prototype.forEach, slice = Array.prototype.slice
  , keys = Object.keys

  , extend;

extend = function (src) {
	keys(Object(src)).forEach(function (key) {
		this[key] = src[key];
	}, this);
};

module.exports = function (dest/*, …src*/) {
	forEach.call(arguments, value);
	slice.call(arguments, 1).forEach(extend, dest);
	return dest;
};

},{"./valid-value":22}],16:[function(require,module,exports){
'use strict';

module.exports = require('./_iterate')('forEach');

},{"./_iterate":12}],17:[function(require,module,exports){
// Inspired by: http://www.davidflanagan.com/2009/08/typeof-isfuncti.html

'use strict';

var forEach = Array.prototype.forEach.bind([]);

module.exports = function (obj) {
	var type;
	if (!obj) {
		return false;
	}
	type = typeof obj;
	if (type === 'function') {
		return true;
	}
	if (type !== 'object') {
		return false;
	}

	try {
		forEach(obj);
		return true;
	} catch (e) {
		if (e instanceof TypeError) {
			return false;
		}
		throw e;
	}
};

},{}],18:[function(require,module,exports){
'use strict';

var getPrototypeOf = Object.getPrototypeOf, prototype = Object.prototype
  , toString = prototype.toString

  , id = {}.toString();

module.exports = function (value) {
	var proto;
	if (!value || (typeof value !== 'object') || (toString.call(value) !== id)) {
		return false;
	}
	proto = getPrototypeOf(value);
	return (proto === prototype) || (getPrototypeOf(proto) === null);
};

},{}],19:[function(require,module,exports){
// Implementation credits go to:
// http://wiki.ecmascript.org/doku.php?id=harmony:egal

'use strict';

module.exports = function (x, y) {
	return (x === y) ?
			((x !== 0) || ((1 / x) === (1 / y))) :
			((x !== x) && (y !== y)); //jslint: skip
};

},{}],20:[function(require,module,exports){
'use strict';

var callable = require('./valid-callable')
  , forEach  = require('./for-each')

  , call = Function.prototype.call;

module.exports = function (obj, cb/*, thisArg*/) {
	var o = {}, thisArg = arguments[2];
	callable(cb);
	forEach(obj, function (value, key, obj, index) {
		o[key] = call.call(cb, thisArg, value, key, obj, index);
	});
	return o;
};

},{"./for-each":16,"./valid-callable":21}],21:[function(require,module,exports){
'use strict';

var isCallable = require('./is-callable');

module.exports = function (fn) {
	if (!isCallable(fn)) {
		throw new TypeError(fn + " is not a function");
	}
	return fn;
};

},{"./is-callable":17}],22:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) {
		throw new TypeError("Cannot use null or undefined");
	}
	return value;
};

},{}],23:[function(require,module,exports){
'use strict';

var toString = Object.prototype.toString

  , id = toString.call('');

module.exports = function (x) {
	return (typeof x === 'string') || (x && (typeof x === 'object') &&
		((x instanceof String) || (toString.call(x) === id))) || false;
};

},{}],24:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],25:[function(require,module,exports){

var requestAnimFrame = require('./utils/requestAnimFrame');

var Loop = function () {
  this.callbacks = [];
  this.playing = false;
  this.fps = 0;
  this.frame = 0;
};

Loop.prototype.play = function () {
  this.playing = true;
  this.next();
};

Loop.prototype.stop = function () {
  this.playing = false;
};

Loop.prototype.use = function (callback) {
  this.callbacks.push(callback);
};

Loop.prototype.next = function () {
  if (this.playing) {
    var self = this;

    this.getFPS();

    for (var i = 0; i < this.callbacks.length; i += 1) {
      this.callbacks[i]();
    }

    this.frame+= 1;

    requestAnimFrame(function () {
      self.next();
    });
  }
};

Loop.prototype.getFPS = function () {
  var delta;

  if (!this.lastUpdate) {
    this.lastUpdate = new Date().getTime();
  }

  delta = (new Date().getTime() - this.lastUpdate) / 1000;
  this.lastUpdate = new Date().getTime();
  this.fps = 1 / delta;
};

module.exports = Loop;

},{"./utils/requestAnimFrame":26}],26:[function(require,module,exports){

var polyfill = function (callback) {
  setTimeout(callback, 1000 / 60);
};

module.exports =
  (window) ? (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    polyfill
  ) : polyfill;

},{}],27:[function(require,module,exports){
/*
  Title: Geometry
  Tools for working with objects in a two-dimensional coordinate system.

  MIT-Style License
  Johan Nordberg <its@johan-nordberg.com>
*/

(function() {

function pick() {
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i] !== undefined) return arguments[i];
  }
};

function merge(o1, o2) {
  var key, rv = {};
  for (key in o1) rv[key] = o1[key];
  for (key in o2) rv[key] = o2[key];
  return rv;
};

/*
  Class: Size
  An object that contains width and height values

  Constructor: Size

  Arguments:

  width - *number* A width value.
  height - *number* A height value.

  You can also pass a object with width and height to the constructor.
*/
var Size = function(width, height) {
  this.width = parseFloat(pick(arguments[0].width, width));
  this.height = parseFloat(pick(arguments[0].height, height));
};

/*
  Method: Size.fromPoint

  *Classmethod* Creates a Size from a Point

  Arguments:

  point - Point to be converted to a Size
*/
Size.fromPoint = function(point) {
  return new Size({
    width: point.x,
    height: point.y
  });
};

/*
  Method: getMid

  Returns a <Point> representing the middle point of the size
*/
Size.prototype.getMid = function() {
  return new Point(this.width / 2, this.height / 2);
};

/*
  Method: standardize

  Returns:

  A <Size> with a positive width and height
*/
Size.prototype.standardize = function() {
  return new Size(Math.abs(this.width), Math.abs(this.height));
};

/*
  Method: aspectFit

  Scales size to the size given, keeping aspect ratio.

  Arguments:

  size       - (*<Size>*, required) maximum size to scale up to
  keepInside - (*boolean*, optional. defaults to true) if true size will be scaled to *maximum*
               the size given; otherwise it will be scaled to *at least* size given

  Returns:

  A <Size> scaled to the size given with aspect ratio intact.
*/
Size.prototype.aspectFit = function(size, keepInside) {
  if (keepInside === undefined) keepInside = true;
  var nw = size.height * this.width / this.height;
  var nh = size.width * this.height / this.width;
  if (keepInside ^ (nw >= size.width))
    return new Size(nw || 1, size.height);
  return new Size(size.width, nh || 1);
};

/*
  Method: scale

  Arguments:

  factor - (*float*, required) - factor to multiply size by

  Returns a <Size> scaled by *factor*
*/
Size.prototype.scale = function(factor) {
  return new Size(this.width * factor, this.height * factor);
};

/*
  Method: toStyles

  Returns an object with CSS styles defining the size.
*/
Size.prototype.toStyles = function() {
  return {
    'width': parseInt(this.width) + 'px',
    'height': parseInt(this.height) + 'px'
  };
};

/*
  Method: toString

  Returns string representation of point
*/
Size.prototype.toString = function() {
  return ['<Size width: ', this.width, ' height: ', this.height, '>'].join('');
};

/*
  Constant: Zero
  A zero <Size>
*/
Size.Zero = new Size(0, 0);

/*
  Class: Point
  Object that contains a point in a two-dimensional coordinate system.

  Constructor: Point

  Arguments:

  x - *number* The x-coordinate of the point.
  y - *number* The y-coordinate of the point.

  You can also pass a object with x and y coordinates to the constructor.
*/
var Point = function(x, y) {
  this.x = parseFloat(pick(arguments[0].x, x));
  this.y = parseFloat(pick(arguments[0].y, y));
};

/*
  Method: length

  Returns:

  Pythagorean length of point from origo
*/
Point.prototype.length = function() {
  return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
};

/*
  Method: distanceTo

  Returns:

  Distance between points
*/
Point.prototype.distanceTo = function(point) {
  var xd = point.x - this.x,
      yd = point.y - this.y;
  return Math.sqrt(xd * xd + yd * yd);
};

/*
  Method: addPoint

  Adds a point to this point.

  Arguments:

  point - Point to add.

  Returns:

  <Point> containing both points added together.
*/
Point.prototype.addPoint = function(point) {
  return new Point(this.x + point.x, this.y + point.y);
}

/*
  Method: substractPoint

  Substracts a point from this point.

  Arguments:

  point - Point to substract

  Returns:

  <Point> containing substracted point.
*/
Point.prototype.substractPoint = function(point) {
  return new Point(this.x - point.x, this.y - point.y);
};

/*
  Method: multiply

  Returns point multiplied by given factor.

  Arguments:

  factor - Factor to multiply by
*/
Point.prototype.multiply = function(factor) {
  return new Point(this.x * factor, this.y * factor);
};

/*
  Method: dot

  Returns dot product of *this* and *point*

*/
Point.prototype.dot = function(point) {
  return this.x * point.x + this.y * point.y;
};

/*
  Method: normalize

  Returns normalized point

*/
Point.prototype.normalize = function() {
 return this.multiply(1 / this.length());
};

/*
  Method: angle

  Returns angle in radians to *point*

*/
Point.prototype.angle = function(point) {
  return (Math.PI * 1.5 + Math.atan2(point.y - this.y, point.x - this.x)) % (Math.PI * 2);
};

/*
  Method: toStyles

  Returns an object with CSS styles defining the size.
*/
Point.prototype.toStyles = function() {
  return {
    'left': parseInt(this.x) + 'px',
    'top': parseInt(this.y) + 'px'
  };
};

/*
  Method: toString

  Returns string representation of point
*/
Point.prototype.toString = function() {
  return ['<Point x: ', this.x, ' y: ', this.y, '>'].join('');
};

/*
  Constant: Zero
  A zero <Point>
*/
Point.Zero = new Point(0, 0);

/*
  Class: Rect
  An object that contains the location and dimensions of a rectangle.

  Constructor: Rect

  Arguments:

  origin - A <Point> object that specifies the coordinates of the
           rectangle's origin. The origin is located in the upper-left
           of the rectangle.

  size -   A <Size> object that specifies the
           height and width of the rectangle

  You can also pass a hash to the constructor.

  > var rect = new Rect({
  >   'origin': {'x': 42, 'y': 42},
  >   'size': {'width': 320, 'height': 480},
  > });
*/
var Rect = function(origin, size) {
  if (arguments.length == 1 && typeof arguments[0] == 'object') {
    this.origin = new Point(arguments[0].origin);
    this.size = new Size(arguments[0].size);
  } else {
    this.origin = origin;
    this.size = size;
  }
};

/*
  Method: Rect.fromPoints

  *Classmethod* Creates a Rect from two points

  Arguments:

  point1 - Point defining upper left corner of rectangle
  point2 - Point defnining lower right corner of rectangle
*/
Rect.fromPoints = function(point1, point2) {
  return new Rect({
    origin: point1,
    size: Size.fromPoint(point2.substractPoint(point1))
  });
};

/*
  Method: standardize

  Returns a rectangle with a positive width and height

  Returns:

  A <Rect> that represents the source rectangle, but with positive width
  and height values.
*/
Rect.prototype.standardize = function() {
  var x = this.origin.x, y = this.origin.y,
      width = this.size.width, height = this.size.height;
  if (this.origin.x > this.origin.x + this.size.width) {
    x = this.origin.x + this.size.width;
    width = Math.abs(this.size.width);
  }
  if (this.origin.y > this.origin.y + this.size.height) {
    y = this.origin.y + this.size.height;
    height = Math.abs(this.size.height);
  }
  return new Rect(new Point(x, y), new Size(width, height));
};

/*
  Method: inset

  Returns a rectangle that is smaller or larger than the source rectangle, with the same center point.

  Arguments:

  delta - (*<Point>*, required) The xy-coordinate value to use for adjusting the source rectangle.

  Returns:

  A <Rect> inset by the x,y values given. Rect will be outset if the xy-coorinates are negative.

*/
Rect.prototype.inset = function(delta) {
  var origin = this.origin.addPoint(delta);
  var size = new Size(this.size.width - delta.x * 2, this.size.height - delta.y * 2);
  return new Rect(origin, size);
};

/*
  Method: containsPoint

  Returns whether a rectangle contains a specified point.

  Arguments:

  point - The <Point> to examine.

  Returns:

  true if the rectangle is not null or empty and the point is
  located within the rectangle; otherwise, false.
*/
Rect.prototype.containsPoint = function(point) {
  return (
    this.origin.x <= point.x && this.origin.y <= point.y &&
    this.origin.x + this.size.width >= point.x &&
    this.origin.y + this.size.height >= point.y
  );
}

/*
  Method: containsRect

  Returns whether a rectangle contains a specified rectangle.

  Arguments:

  rect - The <Rect> to examine.

  Returns:

  true if the rectangle is not null or empty and the other rectangle is
  located within the rectangle; otherwise, false.
*/
Rect.prototype.containsRect = function(rect) {
  var p1 = rect.origin, p2 = rect.getMax();
  return (this.containsPoint(p1) && this.containsPoint(p2));
};

/*
  Method: intersectsRect

  Returns whether two rectangles intersect.

  Arguments:

  rect - The <Rect> to examine.

  Returns:

  true if the two specified rectangles intersect; otherwise, false.
*/
Rect.prototype.intersectsRect = function(rect) {
  var a1 = this.origin, a2 = this.getMax();
  var b1 = rect.origin, b2 = rect.getMax();
  return !(a1.x > b2.x || a2.x < b1.x ||
           a1.y > b2.y || a2.y < b1.y);
};

/*
  Method: getMax

  Returns the point that establishes the bottom right corner of a rectangle.
*/
Rect.prototype.getMax = function() {
  return new Point(this.origin.x + this.size.width,
                   this.origin.y + this.size.height);
};

/*
  Method: getMid

  Returns the point that establishes the center of a rectangle.
*/
Rect.prototype.getMid = function() {
  return new Point(this.origin.x + (this.size.width / 2),
                        this.origin.y + (this.size.height / 2));
};

/*
  Method: setMid

  Arguments:

  midpoint - <Point> defining the new midpoint of the rect

  Returns a new <Rect> with the same size centered at the point given
*/
Rect.prototype.setMid = function(midpoint) {
  var origin = new Point(
    midpoint.x - (this.size.width / 2),
    midpoint.y - (this.size.height / 2)
  );
  return new Rect(origin, this.size);
};

/*
  Method: toStyles

  Returns an object with CSS styles defining the size.
*/
Rect.prototype.toStyles = function() {
  return merge(this.origin.toStyles(), this.size.toStyles());
};

/*
  Method: toString

  Returns string representation of the rectangle
*/
Rect.prototype.toString = function() {
  return ['<Rect origin: ', this.origin.toString(),
          ' size: ', this.size.toString(), '>'].join('');
};

/*
  Packaging

  Uses commonjs's export or require.js's define, otherwise just appends to
  the root object
*/
var geometry = {
  'Size': Size,
  'Point': Point,
  'Rect': Rect
};

if (typeof define == 'function') {
  define(function() { return geometry; });
} else {
  for (var key in geometry) {
    this[key] = geometry[key];
  }
}

}).apply((typeof exports != 'undefined') ? exports : this);

},{}],28:[function(require,module,exports){
// Source: http://jsfiddle.net/vWx8V/
// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

var has = ({}).hasOwnProperty

/**
 * Conenience method returns corresponding value for given keyName or keyCode.
 *
 * @param {Mixed} keyCode {Number} or keyName {String}
 * @return {Mixed}
 * @api public
 */

exports = module.exports = function(searchInput) {
  // Keyboard Events
  if (searchInput && 'object' === typeof searchInput) {
    var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode
    if (hasKeyCode) searchInput = hasKeyCode
  }

  // Numbers
  if ('number' === typeof searchInput) return names[searchInput]

  // Everything else (cast to string)
  var search = String(searchInput)

  // check codes
  var foundNamedKey = codes[search.toLowerCase()]
  if (foundNamedKey) return foundNamedKey

  // check aliases
  var foundNamedKey = aliases[search.toLowerCase()]
  if (foundNamedKey) return foundNamedKey

  // weird character?
  if (search.length === 1) return search.charCodeAt(0)

  return undefined
}

/**
 * Get by name
 *
 *   exports.code['enter'] // => 13
 */

var codes = exports.code = exports.codes = {
  'backspace': 8,
  'tab': 9,
  'enter': 13,
  'shift': 16,
  'ctrl': 17,
  'alt': 18,
  'pause/break': 19,
  'caps lock': 20,
  'esc': 27,
  'space': 32,
  'page up': 33,
  'page down': 34,
  'end': 35,
  'home': 36,
  'left': 37,
  'up': 38,
  'right': 39,
  'down': 40,
  'insert': 45,
  'delete': 46,
  'windows': 91,
  'right click': 93,
  'numpad *': 106,
  'numpad +': 107,
  'numpad -': 109,
  'numpad .': 110,
  'numpad /': 111,
  'num lock': 144,
  'scroll lock': 145,
  'my computer': 182,
  'my calculator': 183,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  "'": 222
}

// Helper aliases

var aliases = exports.aliases = {
  'ctl': 17,
  'pause': 19,
  'break': 19,
  'caps': 20,
  'escape': 27,
  'pgup': 33,
  'pgdn': 33,
  'ins': 45,
  'del': 46,
  'spc': 32
}


/*!
 * Programatically add the following
 */

// lower case chars
for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32

// numbers
for (var i = 48; i < 58; i++) codes[i - 48] = i

// function keys
for (i = 1; i < 13; i++) codes['f'+i] = i + 111

// numpad keys
for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96

/**
 * Get by code
 *
 *   exports.name[13] // => 'Enter'
 */

var names = exports.names = exports.title = {} // title for backward compat

// Create reverse mapping
for (i in codes) names[codes[i]] = i

// Add aliases
for (var alias in aliases) {
  codes[alias] = aliases[alias]
}

},{}],29:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function InteractionData(){this.global=new Point,this.local=new Point,this.target=null,this.originalEvent=null}function InteractionManager(a){this.stage=a,this.mouse=new InteractionData,this.touchs={},this.tempPoint=new Point,this.mouseoverEnabled=!0,this.pool=[],this.interactiveItems=[],this.interactionDOMElement=null,this.last=0}var globals=require("./core/globals"),Point=require("./geom/Point"),Sprite=require("./display/Sprite"),platform=require("./platform");InteractionData.prototype.getLocalPosition=function(a){var b=a.worldTransform,c=this.global,d=b[0],e=b[1],f=b[2],g=b[3],h=b[4],i=b[5],j=1/(d*h+e*-g);return new Point(h*j*c.x+-e*j*c.y+(i*e-f*h)*j,d*j*c.y+-g*j*c.x+(-i*d+f*g)*j)};var proto=InteractionManager.prototype;proto.handleEvent=function(a){switch(a.type){case"mousedown":this.onMouseDown(a);break;case"mousemove":this.onMouseMove(a);break;case"mouseup":this.onMouseUp(a);break;case"mouseout":this.onMouseOut(a);break;case"touchstart":this.onTouchStart(a);break;case"touchmove":this.onTouchMove(a);break;case"touchend":this.onTouchEnd(a)}},proto.collectInteractiveSprite=function(a,b){for(var c=a.children,d=c.length-1;d>=0;d--){var e=c[d];e.interactive?(b.interactiveChildren=!0,this.interactiveItems.push(e),e.children.length>0&&this.collectInteractiveSprite(e,e)):(e.__iParent=null,e.children.length>0&&this.collectInteractiveSprite(e,b))}},proto.setTarget=function(a){a?null===this.interactionDOMElement&&this.setTargetDomElement(a.view):null!==this.target&&platform.window.removeEventListener("mouseup",this,!0),platform.window.addEventListener("mouseup",this,!0),this.target=a},proto.setTargetDomElement=function(a){null!==this.interactionDOMElement&&(this.interactionDOMElement.style["-ms-content-zooming"]="",this.interactionDOMElement.style["-ms-touch-action"]="",this.interactionDOMElement.removeEventListener("mousemove",this,!0),this.interactionDOMElement.removeEventListener("mousedown",this,!0),this.interactionDOMElement.removeEventListener("mouseout",this,!0),this.interactionDOMElement.removeEventListener("touchstart",this,!0),this.interactionDOMElement.removeEventListener("touchend",this,!0),this.interactionDOMElement.removeEventListener("touchmove",this,!0));var b=platform.navigator;b&&b.msPointerEnabled&&(a.style["-ms-content-zooming"]="none",a.style["-ms-touch-action"]="none"),a.addEventListener("mousemove",this,!0),a.addEventListener("mousedown",this,!0),a.addEventListener("mouseout",this,!0),a.addEventListener("touchstart",this,!0),a.addEventListener("touchend",this,!0),a.addEventListener("touchmove",this,!0),this.interactionDOMElement=a},proto.update=function(){if(this.target){var a=Date.now(),b=a-this.last;if(b=30*b/1e3,!(1>b)){this.last=a;var c,d;if(this.dirty){for(this.dirty=!1,c=0,d=this.interactiveItems.length;d>c;c++)this.interactiveItems[c].interactiveChildren=!1;this.interactiveItems=[],this.stage.interactive&&this.interactiveItems.push(this.stage),this.collectInteractiveSprite(this.stage,this.stage)}{this.interactiveItems.length}for(this.interactionDOMElement.style.cursor="default",c=0,d=this.interactiveItems.length;d>c;c++){var e=this.interactiveItems[c];(e.mouseover||e.mouseout||e.buttonMode)&&(e.__hit=this.hitTest(e,this.mouse),this.mouse.target=e,e.__hit?(e.buttonMode&&(this.interactionDOMElement.style.cursor="pointer"),e.__isOver||(e.mouseover&&e.mouseover(this.mouse),e.__isOver=!0)):e.__isOver&&(e.mouseout&&e.mouseout(this.mouse),e.__isOver=!1))}}}},proto.onMouseMove=function(a){this.mouse.originalEvent=a;var b=this.interactionDOMElement.getBoundingClientRect();this.mouse.global.x=(a.clientX-b.left)*(this.target.width/b.width),this.mouse.global.y=(a.clientY-b.top)*(this.target.height/b.height);for(var c=0,d=this.interactiveItems.length;d>c;c++){var e=this.interactiveItems[c];e.mousemove&&e.mousemove(this.mouse)}},proto.onMouseDown=function(a){this.mouse.originalEvent=a;for(var b=(this.stage,!1),c=0,d=this.interactiveItems.length;d>c;c++){var e=this.interactiveItems[c];if((e.mousedown||e.click)&&(e.__mouseIsDown=!0,b=e.__hit=this.hitTest(e,this.mouse),e.__hit&&(e.mousedown&&e.mousedown(this.mouse),e.__isDown=!0,!e.interactiveChildren)))break}},proto.onMouseOut=function(){this.interactiveItems.length;this.interactionDOMElement.style.cursor="default";for(var a=0,b=this.interactiveItems.length;b>a;a++){var c=this.interactiveItems[a];c.__isOver&&(this.mouse.target=c,c.mouseout&&c.mouseout(this.mouse),c.__isOver=!1)}},proto.onMouseUp=function(a){this.mouse.originalEvent=a;for(var b=!1,c=0,d=this.interactiveItems.length;d>c;c++){var e=this.interactiveItems[c];(e.mouseup||e.mouseupoutside||e.click)&&(e.__hit=this.hitTest(e,this.mouse),e.__hit&&!b?(e.mouseup&&e.mouseup(this.mouse),e.__isDown&&e.click&&e.click(this.mouse),e.interactiveChildren||(b=!0)):e.__isDown&&e.mouseupoutside&&e.mouseupoutside(this.mouse),e.__isDown=!1)}},proto.hitTest=function(a,b){var c=b.global;if(a.vcount!==globals.visibleCount)return!1;var d=a instanceof Sprite,e=a.worldTransform,f=e[0],g=e[1],h=e[2],i=e[3],j=e[4],k=e[5],l=1/(f*j+g*-i),m=j*l*c.x+-g*l*c.y+(k*g-h*j)*l,n=f*l*c.y+-i*l*c.x+(-k*f+h*i)*l;if(b.target=a,a.hitArea&&a.hitArea.contains)return a.hitArea.contains(m,n)?(b.target=a,!0):!1;if(d){var o,p=a.texture.frame.width,q=a.texture.frame.height,r=-p*a.anchor.x;if(m>r&&r+p>m&&(o=-q*a.anchor.y,n>o&&o+q>n))return b.target=a,!0}for(var s=0,t=a.children.length;t>s;s++){var u=a.children[s],v=this.hitTest(u,b);if(v)return b.target=a,!0}return!1},proto.onTouchMove=function(a){var b,c,d,e,f,g,h,i=this.interactionDOMElement.getBoundingClientRect(),j=a.changedTouches;for(b=0,c=j.length;c>b;b++)for(d=j[b],e=this.touchs[d.identifier],e.originalEvent=a,e.global.x=(d.clientX-i.left)*(this.target.width/i.width),e.global.y=(d.clientY-i.top)*(this.target.height/i.height),f=0,g=this.interactiveItems.length;g>f;f++)h=this.interactiveItems[b],h.touchmove&&h.touchmove(e)},proto.onTouchStart=function(a){for(var b=this.interactionDOMElement.getBoundingClientRect(),c=a.changedTouches,d=0,e=c.length;e>d;d++){var f=c[d],g=this.pool.pop();g||(g=new InteractionData),g.originalEvent=a,this.touchs[f.identifier]=g,g.global.x=(f.clientX-b.left)*(this.target.width/b.width),g.global.y=(f.clientY-b.top)*(this.target.height/b.height);for(var h=0,i=this.interactiveItems.length;i>h;h++){var j=this.interactiveItems[h];if((j.touchstart||j.tap)&&(j.__hit=this.hitTest(j,g),j.__hit&&(j.touchstart&&j.touchstart(g),j.__isDown=!0,j.__touchData=g,!j.interactiveChildren)))break}}},proto.onTouchEnd=function(a){for(var b=this.interactionDOMElement.getBoundingClientRect(),c=a.changedTouches,d=0,e=c.length;e>d;d++){var f=c[d],g=this.touchs[f.identifier],h=!1;g.global.x=(f.clientX-b.left)*(this.target.width/b.width),g.global.y=(f.clientY-b.top)*(this.target.height/b.height);for(var i=0,j=this.interactiveItems.length;j>i;i++){var k=this.interactiveItems[i],l=k.__touchData;k.__hit=this.hitTest(k,g),l==g&&(g.originalEvent=a,(k.touchend||k.tap)&&(k.__hit&&!h?(k.touchend&&k.touchend(g),k.__isDown&&k.tap&&k.tap(g),k.interactiveChildren||(h=!0)):k.__isDown&&k.touchendoutside&&k.touchendoutside(g),k.__isDown=!1),k.__touchData=null)}this.pool.push(g),this.touchs[f.identifier]=null}},module.exports=InteractionManager;
},{"./core/globals":30,"./display/Sprite":34,"./geom/Point":46,"./platform":57}],30:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";module.exports={gl:null,shaderProgram:null,primitiveProgram:null,stripShaderProgram:null,texturesToUpdate:[],texturesToDestroy:[],visibleCount:0};
},{}],31:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
function DisplayObject(){this.last=this,this.first=this,this.position=new Point,this.scale=new Point(1,1),this.pivot=new Point(0,0),this.rotation=0,this.alpha=1,this.visible=!0,this.hitArea=null,this.buttonMode=!1,this.renderable=!1,this.parent=null,this.stage=null,this.worldAlpha=1,this._interactive=!1,this.worldTransform=mat3.create(),this.localTransform=mat3.create(),this.color=[],this.dynamic=!0,this._sr=0,this._cr=1}var globals=require("../core/globals"),mat3=require("../geom/matrix").mat3,FilterBlock=require("../filters/FilterBlock"),Point=require("../geom/Point"),proto=DisplayObject.prototype;Object.defineProperty(proto,"interactive",{get:function(){return this._interactive},set:function(a){this._interactive=a,this.stage&&(this.stage.dirty=!0)}}),Object.defineProperty(proto,"mask",{get:function(){return this._mask},set:function(a){this._mask=a,a?this.addFilter(a):this.removeFilter()}}),proto.setInteractive=function(a){this.interactive=a},proto.addFilter=function(a){if(!this.filter){this.filter=!0;var b=new FilterBlock,c=new FilterBlock;b.mask=a,c.mask=a,b.first=b.last=this,c.first=c.last=this,b.open=!0;var d,e,f,g;d=e=b,g=this.first._iPrev,g?(f=g._iNext,d._iPrev=g,g._iNext=d):f=this,f&&(f._iPrev=e,e._iNext=f),d=c,e=c,f=null,g=null,g=this.last,f=g._iNext,f&&(f._iPrev=e,e._iNext=f),d._iPrev=g,g._iNext=d;for(var h=this,i=this.last;h;)h.last==i&&(h.last=c),h=h.parent;this.first=b,this.__renderGroup&&this.__renderGroup.addFilterBlocks(b,c),a.renderable=!1}},proto.removeFilter=function(){if(this.filter){this.filter=!1;var a=this.first,b=a._iNext,c=a._iPrev;b&&(b._iPrev=c),c&&(c._iNext=b),this.first=a._iNext;var d=this.last;b=d._iNext,c=d._iPrev,b&&(b._iPrev=c),c._iNext=b;for(var e=d._iPrev,f=this;f.last==d&&(f.last=e,f=f.parent););var g=a.mask;g.renderable=!0,this.__renderGroup&&this.__renderGroup.removeFilterBlocks(a,d)}},proto.updateTransform=function(){this.rotation!==this.rotationCache&&(this.rotationCache=this.rotation,this._sr=Math.sin(this.rotation),this._cr=Math.cos(this.rotation));var a=this.localTransform,b=this.parent.worldTransform,c=this.worldTransform;a[0]=this._cr*this.scale.x,a[1]=-this._sr*this.scale.y,a[3]=this._sr*this.scale.x,a[4]=this._cr*this.scale.y;var d=this.pivot.x,e=this.pivot.y,f=a[0],g=a[1],h=this.position.x-a[0]*d-e*a[1],i=a[3],j=a[4],k=this.position.y-a[4]*e-d*a[3],l=b[0],m=b[1],n=b[2],o=b[3],p=b[4],q=b[5];a[2]=h,a[5]=k,c[0]=l*f+m*i,c[1]=l*g+m*j,c[2]=l*h+m*k+n,c[3]=o*f+p*i,c[4]=o*g+p*j,c[5]=o*h+p*k+q,this.worldAlpha=this.alpha*this.parent.worldAlpha,this.vcount=globals.visibleCount},module.exports=DisplayObject;
},{"../core/globals":30,"../filters/FilterBlock":43,"../geom/Point":46,"../geom/matrix":49}],32:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function DisplayObjectContainer(){DisplayObject.call(this),this.children=[]}var DisplayObject=require("./DisplayObject"),proto=DisplayObjectContainer.prototype=Object.create(DisplayObject.prototype,{constructor:{value:DisplayObjectContainer}});proto.addChild=function(a){if(a.parent&&a.parent.removeChild(a),a.parent=this,this.children.push(a),this.stage){var b=a;do b.interactive&&(this.stage.dirty=!0),b.stage=this.stage,b=b._iNext;while(b)}var c,d,e=a.first,f=a.last;d=this.filter?this.last._iPrev:this.last,c=d._iNext;for(var g=this,h=d;g;)g.last==h&&(g.last=a.last),g=g.parent;c&&(c._iPrev=f,f._iNext=c),e._iPrev=d,d._iNext=e,this.__renderGroup&&(a.__renderGroup&&a.__renderGroup.removeDisplayObjectAndChildren(a),this.__renderGroup.addDisplayObjectAndChildren(a))},proto.addChildAt=function(a,b){if(!(b>=0&&b<=this.children.length))throw new Error(a+" The index "+b+" supplied is out of bounds "+this.children.length);if(a.parent&&a.parent.removeChild(a),a.parent=this,this.stage){var c=a;do c.interactive&&(this.stage.dirty=!0),c.stage=this.stage,c=c._iNext;while(c)}var d,e,f=a.first,g=a.last;if(b===this.children.length){e=this.last;for(var h=this,i=this.last;h;)h.last==i&&(h.last=a.last),h=h.parent}else e=b?this.children[b-1].last:this;d=e._iNext,d&&(d._iPrev=g,g._iNext=d),f._iPrev=e,e._iNext=f,this.children.splice(b,0,a),this.__renderGroup&&(a.__renderGroup&&a.__renderGroup.removeDisplayObjectAndChildren(a),this.__renderGroup.addDisplayObjectAndChildren(a))},proto.swapChildren=function(){},proto.getChildAt=function(a){if(a>=0&&a<this.children.length)return this.children[a];throw new RangeError("The supplied index is out of bounds")},proto.removeChild=function(a){var b=this.children.indexOf(a);if(-1===b)throw new Error(a+" The supplied DisplayObject must be a child of the caller "+this);var c=a.first,d=a.last,e=d._iNext,f=c._iPrev;if(e&&(e._iPrev=f),f._iNext=e,this.last==d)for(var g=c._iPrev,h=this;h.last==d.last&&(h.last=g,h=h.parent););if(d._iNext=null,c._iPrev=null,this.stage){var i=a;do i.interactive&&(this.stage.dirty=!0),i.stage=null,i=i._iNext;while(i)}a.__renderGroup&&a.__renderGroup.removeDisplayObjectAndChildren(a),a.parent=void 0,this.children.splice(b,1)},proto.updateTransform=function(){if(this.visible){DisplayObject.prototype.updateTransform.call(this);for(var a=0,b=this.children.length;b>a;a++)this.children[a].updateTransform()}},module.exports=DisplayObjectContainer;
},{"./DisplayObject":31}],33:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function MovieClip(a){Sprite.call(this,a[0]),this.textures=a,this.animationSpeed=1,this.loop=!0,this.onComplete=null,this.currentFrame=0,this.playing=!1}var Sprite=require("./Sprite"),proto=MovieClip.prototype=Object.create(Sprite.prototype,{constructor:{value:MovieClip}});Object.defineProperty(proto,"totalFrames",{get:function(){return this.textures.length}}),proto.stop=function(){this.playing=!1},proto.play=function(){this.playing=!0},proto.gotoAndStop=function(a){this.playing=!1,this.currentFrame=a;var b=this.currentFrame+.5|0;this.setTexture(this.textures[b%this.textures.length])},proto.gotoAndPlay=function(a){this.currentFrame=a,this.playing=!0},proto.updateTransform=function(){if(Sprite.prototype.updateTransform.call(this),this.playing){this.currentFrame+=this.animationSpeed;var a=this.currentFrame+.5|0;this.loop||a<this.textures.length?this.setTexture(this.textures[a%this.textures.length]):a>=this.textures.length&&(this.gotoAndStop(this.textures.length-1),this.onComplete&&this.onComplete())}},module.exports=MovieClip;
},{"./Sprite":34}],34:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Sprite(a){if(DisplayObjectContainer.call(this),this.anchor=new Point,this.texture=a,this.blendMode=blendModes.NORMAL,this._width=0,this._height=0,a.baseTexture.hasLoaded)this.updateFrame=!0;else{var b=this;this.texture.addEventListener("update",function(){b.onTextureUpdate()})}this.renderable=!0}var blendModes=require("./blendModes"),DisplayObjectContainer=require("./DisplayObjectContainer"),Point=require("../geom/Point"),Texture=require("../textures/Texture"),proto=Sprite.prototype=Object.create(DisplayObjectContainer.prototype,{constructor:{value:Sprite}});Object.defineProperty(proto,"width",{get:function(){return this.scale.x*this.texture.frame.width},set:function(a){this.scale.x=a/this.texture.frame.width,this._width=a}}),Object.defineProperty(proto,"height",{get:function(){return this.scale.y*this.texture.frame.height},set:function(a){this.scale.y=a/this.texture.frame.height,this._height=a}}),proto.setTexture=function(a){this.texture.baseTexture!=a.baseTexture?(this.textureChange=!0,this.texture=a,this.__renderGroup&&this.__renderGroup.updateTexture(this)):this.texture=a,this.updateFrame=!0},proto.onTextureUpdate=function(){this._width&&(this.scale.x=this._width/this.texture.frame.width),this._height&&(this.scale.y=this._height/this.texture.frame.height),this.updateFrame=!0},Sprite.fromImage=function(a){var b=Texture.fromImage(a);return new Sprite(b)},Sprite.fromFrame=function(a){var b=Texture.cache[a];if(!b)throw new Error("The frameId '"+a+"' does not exist in the texture cache"+this);return new Sprite(b)},module.exports=Sprite;
},{"../geom/Point":46,"../textures/Texture":70,"./DisplayObjectContainer":32,"./blendModes":36}],35:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Stage(a){DisplayObjectContainer.call(this),this.worldTransform=mat3.create(),this.interactive=!0,this.interactionManager=new InteractionManager(this),this.dirty=!0,this.__childrenAdded=[],this.__childrenRemoved=[],this.stage=this,this.stage.hitArea=new Rectangle(0,0,1e5,1e5),this.setBackgroundColor(a),this.worldVisible=!0}var globals=require("../core/globals"),mat3=require("../geom/matrix").mat3,hex2rgb=require("../utils/color").hex2rgb,DisplayObjectContainer=require("./DisplayObjectContainer"),InteractionManager=require("../InteractionManager"),Rectangle=require("../geom/Rectangle"),proto=Stage.prototype=Object.create(DisplayObjectContainer.prototype,{constructor:{value:Stage}});proto.setInteractionDelegate=function(a){this.interactionManager.setTargetDomElement(a)},proto.updateTransform=function(){this.worldAlpha=1,this.vcount=globals.visibleCount;for(var a=0,b=this.children.length;b>a;a++)this.children[a].updateTransform();this.dirty&&(this.dirty=!1,this.interactionManager.dirty=!0),this.interactive&&this.interactionManager.update()},proto.setBackgroundColor=function(a){this.backgroundColor=a||0,this.backgroundColorSplit=hex2rgb(this.backgroundColor);var b=this.backgroundColor.toString(16);b="000000".substr(0,6-b.length)+b,this.backgroundColorString="#"+b},proto.getMousePosition=function(){return this.interactionManager.mouse.global},module.exports=Stage;
},{"../InteractionManager":29,"../core/globals":30,"../geom/Rectangle":48,"../geom/matrix":49,"../utils/color":73,"./DisplayObjectContainer":32}],36:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";module.exports={NORMAL:0,SCREEN:1};
},{}],37:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function EventTarget(){var a={};this.addEventListener=this.on=function(b,c){void 0===a[b]&&(a[b]=[]),-1===a[b].indexOf(c)&&a[b].push(c)},this.dispatchEvent=this.emit=function(b){if(a[b.type]&&a[b.type].length)for(var c=0,d=a[b.type].length;d>c;c++)a[b.type][c](b)},this.removeEventListener=this.off=function(b,c){var d=a[b].indexOf(c);-1!==d&&a[b].splice(d,1)}}module.exports=EventTarget;
},{}],38:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function CustomRenderable(){DisplayObject.call(this)}var DisplayObject=require("../display/DisplayObject"),proto=CustomRenderable.prototype=Object.create(DisplayObject.prototype,{constructor:{value:CustomRenderable}});proto.renderCanvas=function(){},proto.initWebGL=function(){},proto.renderWebGL=function(){},module.exports=CustomRenderable;
},{"../display/DisplayObject":31}],39:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Rope(a,b){Strip.call(this,a),this.points=b;try{this.verticies=new Float32Array(4*b.length),this.uvs=new Float32Array(4*b.length),this.colors=new Float32Array(2*b.length),this.indices=new Uint16Array(2*b.length)}catch(c){this.verticies=[],this.uvs=[],this.colors=[],this.indices=[]}this.refresh()}var Strip=require("./Strip"),DisplayObjectContainer=require("../display/DisplayObjectContainer"),proto=Rope.prototype=Object.create(Strip.prototype,{constructor:{value:Rope}});proto.refresh=function(){var a=this.points;if(!(a.length<1)){var b=this.uvs,c=this.indices,d=this.colors,e=a[0];this.count-=.2,b[0]=0,b[1]=1,b[2]=0,b[3]=1,d[0]=1,d[1]=1,c[0]=0,c[1]=1;for(var f,g,h,i=a.length,j=1;i>j;j++)f=a[j],g=4*j,h=j/(i-1),j%2?(b[g]=h,b[g+1]=0,b[g+2]=h,b[g+3]=1):(b[g]=h,b[g+1]=0,b[g+2]=h,b[g+3]=1),g=2*j,d[g]=1,d[g+1]=1,g=2*j,c[g]=g,c[g+1]=g+1,e=f}},proto.updateTransform=function(){var a=this.points;if(!(a.length<1)){var b,c=a[0],d={x:0,y:0};this.count-=.2;var e=this.verticies;e[0]=c.x+d.x,e[1]=c.y+d.y,e[2]=c.x-d.x,e[3]=c.y-d.y;for(var f,g,h,i,j,k=a.length,l=1;k>l;l++)f=a[l],g=4*l,b=l<a.length-1?a[l+1]:f,d.y=-(b.x-c.x),d.x=b.y-c.y,h=10*(1-l/(k-1)),h>1&&(h=1),i=Math.sqrt(d.x*d.x+d.y*d.y),j=this.texture.height/2,d.x/=i,d.y/=i,d.x*=j,d.y*=j,e[g]=f.x+d.x,e[g+1]=f.y+d.y,e[g+2]=f.x-d.x,e[g+3]=f.y-d.y,c=f;DisplayObjectContainer.prototype.updateTransform.call(this)}},proto.setTexture=function(a){this.texture=a,this.updateFrame=!0},module.exports=Rope;
},{"../display/DisplayObjectContainer":32,"./Strip":41}],40:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Spine(a){if(DisplayObjectContainer.call(this),this.spineData=Spine.animCache[a],!this.spineData)throw new Error("Spine data must be preloaded using SpineLoader or AssetLoader: "+a);this.skeleton=new spine.Skeleton(this.spineData),this.skeleton.updateWorldTransform(),this.stateData=new spine.AnimationStateData(this.spineData),this.state=new spine.AnimationState(this.stateData),this.slotContainers=[];for(var b=0,c=this.skeleton.drawOrder.length;c>b;b++){var d=this.skeleton.drawOrder[b],e=d.attachment,f=new DisplayObjectContainer;if(this.slotContainers.push(f),this.addChild(f),e instanceof spine.RegionAttachment){var g=e.rendererObject.name,h=this.createSprite(d,e.rendererObject);d.currentSprite=h,d.currentSpriteName=g,f.addChild(h)}}}var spine=require("../utils/spine"),DisplayObjectContainer=require("../display/DisplayObjectContainer"),Sprite=require("../display/Sprite"),Texture=require("../textures/Texture"),proto=Spine.prototype=Object.create(DisplayObjectContainer.prototype,{constructor:{value:Spine}});proto.updateTransform=function(){this.lastTime=this.lastTime||Date.now();var a=.001*(Date.now()-this.lastTime);this.lastTime=Date.now(),this.state.update(a),this.state.apply(this.skeleton),this.skeleton.updateWorldTransform();for(var b=this.skeleton.drawOrder,c=0,d=b.length;d>c;c++){var e=b[c],f=e.attachment,g=this.slotContainers[c];if(f instanceof spine.RegionAttachment){if(f.rendererObject&&(!e.currentSpriteName||e.currentSpriteName!=f.name)){var h=f.rendererObject.name;if(void 0!==e.currentSprite&&(e.currentSprite.visible=!1),e.sprites=e.sprites||{},void 0!==e.sprites[h])e.sprites[h].visible=!0;else{var i=this.createSprite(e,f.rendererObject);g.addChild(i)}e.currentSprite=e.sprites[h],e.currentSpriteName=h}g.visible=!0;var j=e.bone;g.position.x=j.worldX+f.x*j.m00+f.y*j.m01,g.position.y=j.worldY+f.x*j.m10+f.y*j.m11,g.scale.x=j.worldScaleX,g.scale.y=j.worldScaleY,g.rotation=-(e.bone.worldRotation*Math.PI/180)}else g.visible=!1}DisplayObjectContainer.prototype.updateTransform.call(this)},proto.createSprite=function(a,b){var c=Texture.cache[b.name]?b.name:b.name+".png",d=new Sprite(Texture.fromFrame(c));return d.scale=b.scale,d.rotation=b.rotation,d.anchor.x=d.anchor.y=.5,a.sprites=a.sprites||{},a.sprites[b.name]=d,d},Spine.animCache={},module.exports=Spine;
},{"../display/DisplayObjectContainer":32,"../display/Sprite":34,"../textures/Texture":70,"../utils/spine":74}],41:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Strip(a,b,c){DisplayObjectContainer.call(this),this.texture=a,this.blendMode=blendModes.NORMAL;try{this.uvs=new Float32Array([0,1,1,1,1,0,0,1]),this.verticies=new Float32Array([0,0,0,0,0,0,0,0,0]),this.colors=new Float32Array([1,1,1,1]),this.indices=new Uint16Array([0,1,2,3])}catch(d){this.uvs=[0,1,1,1,1,0,0,1],this.verticies=[0,0,0,0,0,0,0,0,0],this.colors=[1,1,1,1],this.indices=[0,1,2,3]}if(this.width=b,this.height=c,a.baseTexture.hasLoaded)this.width=this.texture.frame.width,this.height=this.texture.frame.height,this.updateFrame=!0;else{var e=this;this.texture.addEventListener("update",function(){e.onTextureUpdate()})}this.renderable=!0}var blendModes=require("../display/blendModes"),DisplayObjectContainer=require("../display/DisplayObjectContainer"),proto=Strip.prototype=Object.create(DisplayObjectContainer.prototype,{constructor:{value:Strip}});proto.setTexture=function(a){this.texture=a,this.width=a.frame.width,this.height=a.frame.height,this.updateFrame=!0},proto.onTextureUpdate=function(){this.updateFrame=!0},module.exports=Strip;
},{"../display/DisplayObjectContainer":32,"../display/blendModes":36}],42:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function TilingSprite(a,b,c){DisplayObjectContainer.call(this),this.texture=a,this.width=b,this.height=c,this.tileScale=new Point(1,1),this.tilePosition=new Point(0,0),this.renderable=!0,this.blendMode=blendModes.NORMAL}var blendModes=require("../display/blendModes"),DisplayObjectContainer=require("../display/DisplayObjectContainer"),Point=require("../geom/Point"),proto=TilingSprite.prototype=Object.create(DisplayObjectContainer.prototype,{constructor:{value:TilingSprite}});proto.setTexture=function(a){this.texture=a,this.updateFrame=!0},proto.onTextureUpdate=function(){this.updateFrame=!0},module.exports=TilingSprite;
},{"../display/DisplayObjectContainer":32,"../display/blendModes":36,"../geom/Point":46}],43:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function FilterBlock(a){this.graphics=a,this.visible=!0,this.renderable=!0}module.exports=FilterBlock;
},{}],44:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Circle(a,b,c){this.x=a||0,this.y=b||0,this.radius=c||0}var proto=Circle.prototype;proto.clone=function(){return new Circle(this.x,this.y,this.radius)},proto.contains=function(a,b){if(this.radius<=0)return!1;var c=this.x-a,d=this.y-b,e=this.radius*this.radius;return c*=c,d*=d,e>=c+d},module.exports=Circle;
},{}],45:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Ellipse(a,b,c,d){this.x=a||0,this.y=b||0,this.width=c||0,this.height=d||0}var Rectangle=require("./Rectangle"),proto=Ellipse.prototype;proto.clone=function(){return new Ellipse(this.x,this.y,this.width,this.height)},proto.contains=function(a,b){if(this.width<=0||this.height<=0)return!1;var c=(a-this.x)/this.width-.5,d=(b-this.y)/this.height-.5;return c*=c,d*=d,.25>c+d},proto.getBounds=function(){return new Rectangle(this.x,this.y,this.width,this.height)},module.exports=Ellipse;
},{"./Rectangle":48}],46:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Point(a,b){this.x=a||0,this.y=b||0}Point.prototype.clone=function(){return new Point(this.x,this.y)},module.exports=Point;
},{}],47:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Polygon(a){if(a instanceof Array||(a=Array.prototype.slice.call(arguments)),"number"==typeof a[0]){for(var b=[],c=0,d=a.length;d>c;c+=2)b.push(new Point(a[c],a[c+1]));a=b}this.points=a}var Point=require("./Point"),proto=Polygon.prototype;proto.clone=function(){for(var a=[],b=0;b<this.points.length;b++)a.push(this.points[b].clone());return new Polygon(a)},proto.contains=function(a,b){for(var c=!1,d=0,e=this.points.length-1;d<this.points.length;e=d++){var f=this.points[d].x,g=this.points[d].y,h=this.points[e].x,i=this.points[e].y,j=g>b!=i>b&&(h-f)*(b-g)/(i-g)+f>a;j&&(c=!c)}return c},module.exports=Polygon;
},{"./Point":46}],48:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Rectangle(a,b,c,d){this.x=a||0,this.y=b||0,this.width=c||0,this.height=d||0}var proto=Rectangle.prototype;proto.clone=function(){return new Rectangle(this.x,this.y,this.width,this.height)},proto.contains=function(a,b){if(this.width<=0||this.height<=0)return!1;var c=this.x;if(a>=c&&a<=c+this.width){var d=this.y;if(b>=d&&b<=d+this.height)return!0}return!1},module.exports=Rectangle;
},{}],49:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";var Matrix=exports.Matrix="undefined"!=typeof Float32Array?Float32Array:Array,mat3=exports.mat3={},mat4=exports.mat4={};mat3.create=function(){var a=new Matrix(9);return a[0]=1,a[1]=0,a[2]=0,a[3]=0,a[4]=1,a[5]=0,a[6]=0,a[7]=0,a[8]=1,a},mat3.identity=function(a){return a[0]=1,a[1]=0,a[2]=0,a[3]=0,a[4]=1,a[5]=0,a[6]=0,a[7]=0,a[8]=1,a},mat4.create=function(){var a=new Matrix(16);return a[0]=1,a[1]=0,a[2]=0,a[3]=0,a[4]=0,a[5]=1,a[6]=0,a[7]=0,a[8]=0,a[9]=0,a[10]=1,a[11]=0,a[12]=0,a[13]=0,a[14]=0,a[15]=1,a},mat3.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],f=a[2],g=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],m=b[0],n=b[1],o=b[2],p=b[3],q=b[4],r=b[5],s=b[6],t=b[7],u=b[8];return c[0]=m*d+n*g+o*j,c[1]=m*e+n*h+o*k,c[2]=m*f+n*i+o*l,c[3]=p*d+q*g+r*j,c[4]=p*e+q*h+r*k,c[5]=p*f+q*i+r*l,c[6]=s*d+t*g+u*j,c[7]=s*e+t*h+u*k,c[8]=s*f+t*i+u*l,c},mat3.clone=function(a){var b=new Matrix(9);return b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3],b[4]=a[4],b[5]=a[5],b[6]=a[6],b[7]=a[7],b[8]=a[8],b},mat3.transpose=function(a,b){if(!b||a===b){var c=a[1],d=a[2],e=a[5];return a[1]=a[3],a[2]=a[6],a[3]=c,a[5]=a[7],a[6]=d,a[7]=e,a}return b[0]=a[0],b[1]=a[3],b[2]=a[6],b[3]=a[1],b[4]=a[4],b[5]=a[7],b[6]=a[2],b[7]=a[5],b[8]=a[8],b},mat3.toMat4=function(a,b){return b||(b=mat4.create()),b[15]=1,b[14]=0,b[13]=0,b[12]=0,b[11]=0,b[10]=a[8],b[9]=a[7],b[8]=a[6],b[7]=0,b[6]=a[5],b[5]=a[4],b[4]=a[3],b[3]=0,b[2]=a[2],b[1]=a[1],b[0]=a[0],b},mat4.create=function(){var a=new Matrix(16);return a[0]=1,a[1]=0,a[2]=0,a[3]=0,a[4]=0,a[5]=1,a[6]=0,a[7]=0,a[8]=0,a[9]=0,a[10]=1,a[11]=0,a[12]=0,a[13]=0,a[14]=0,a[15]=1,a},mat4.transpose=function(a,b){if(!b||a===b){var c=a[1],d=a[2],e=a[3],f=a[6],g=a[7],h=a[11];return a[1]=a[4],a[2]=a[8],a[3]=a[12],a[4]=c,a[6]=a[9],a[7]=a[13],a[8]=d,a[9]=f,a[11]=a[14],a[12]=e,a[13]=g,a[14]=h,a}return b[0]=a[0],b[1]=a[4],b[2]=a[8],b[3]=a[12],b[4]=a[1],b[5]=a[5],b[6]=a[9],b[7]=a[13],b[8]=a[2],b[9]=a[6],b[10]=a[10],b[11]=a[14],b[12]=a[3],b[13]=a[7],b[14]=a[11],b[15]=a[15],b},mat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],f=a[2],g=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],m=a[9],n=a[10],o=a[11],p=a[12],q=a[13],r=a[14],s=a[15],t=b[0],u=b[1],v=b[2],w=b[3];return c[0]=t*d+u*h+v*l+w*p,c[1]=t*e+u*i+v*m+w*q,c[2]=t*f+u*j+v*n+w*r,c[3]=t*g+u*k+v*o+w*s,t=b[4],u=b[5],v=b[6],w=b[7],c[4]=t*d+u*h+v*l+w*p,c[5]=t*e+u*i+v*m+w*q,c[6]=t*f+u*j+v*n+w*r,c[7]=t*g+u*k+v*o+w*s,t=b[8],u=b[9],v=b[10],w=b[11],c[8]=t*d+u*h+v*l+w*p,c[9]=t*e+u*i+v*m+w*q,c[10]=t*f+u*j+v*n+w*r,c[11]=t*g+u*k+v*o+w*s,t=b[12],u=b[13],v=b[14],w=b[15],c[12]=t*d+u*h+v*l+w*p,c[13]=t*e+u*i+v*m+w*q,c[14]=t*f+u*j+v*n+w*r,c[15]=t*g+u*k+v*o+w*s,c};
},{}],50:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";var platform=require("./platform"),globals=require("./core/globals"),shaders=require("./renderers/webgl/shaders"),matrix=require("./geom/matrix"),pixi=module.exports=Object.create(globals);pixi.Point=require("./geom/Point"),pixi.Rectangle=require("./geom/Rectangle"),pixi.Polygon=require("./geom/Polygon"),pixi.Circle=require("./geom/Circle"),pixi.Ellipse=require("./geom/Ellipse"),pixi.Matrix=matrix.Matrix,pixi.mat3=matrix.mat3,pixi.mat4=matrix.mat4,pixi.blendModes=require("./display/blendModes"),pixi.DisplayObject=require("./display/DisplayObject"),pixi.DisplayObjectContainer=require("./display/DisplayObjectContainer"),pixi.Sprite=require("./display/Sprite"),pixi.MovieClip=require("./display/MovieClip"),pixi.FilterBlock=require("./filters/FilterBlock"),pixi.Text=require("./text/Text"),pixi.BitmapText=require("./text/BitmapText"),pixi.InteractionManager=require("./InteractionManager"),pixi.Stage=require("./display/Stage"),pixi.EventTarget=require("./events/EventTarget"),pixi.autoDetectRenderer=require("./utils/autoDetectRenderer"),pixi.PolyK=require("./utils/Polyk"),pixi.WebGLGraphics=require("./renderers/webgl/graphics"),pixi.WebGLRenderer=require("./renderers/webgl/WebGLRenderer"),pixi.WebGLBatch=require("./renderers/webgl/WebGLBatch"),pixi.WebGLRenderGroup=require("./renderers/webgl/WebGLRenderGroup"),pixi.CanvasRenderer=require("./renderers/canvas/CanvasRenderer"),pixi.CanvasGraphics=require("./renderers/canvas/graphics"),pixi.Graphics=require("./primitives/Graphics"),pixi.Strip=require("./extras/Strip"),pixi.Rope=require("./extras/Rope"),pixi.TilingSprite=require("./extras/TilingSprite"),pixi.Spine=require("./extras/Spine"),pixi.CustomRenderable=require("./extras/CustomRenderable"),pixi.BaseTexture=require("./textures/BaseTexture"),pixi.Texture=require("./textures/Texture"),pixi.RenderTexture=require("./textures/RenderTexture"),pixi.AssetLoader=require("./loaders/AssetLoader"),pixi.JsonLoader=require("./loaders/JsonLoader"),pixi.SpriteSheetLoader=require("./loaders/SpriteSheetLoader"),pixi.ImageLoader=require("./loaders/ImageLoader"),pixi.BitmapFontLoader=require("./loaders/BitmapFontLoader"),pixi.SpineLoader=require("./loaders/SpineLoader"),pixi.initPrimitiveShader=shaders.initPrimitiveShader,pixi.initDefaultShader=shaders.initDefaultShader,pixi.initDefaultStripShader=shaders.initDefaultStripShader,pixi.activateDefaultShader=shaders.activateDefaultShader,pixi.activatePrimitiveShader=shaders.activatePrimitiveShader,pixi.runList=function(a){platform.console.log(">>>>>>>>>"),platform.console.log("_");var b=0,c=a.first;for(platform.console.log(c);c._iNext;)if(b++,c=c._iNext,platform.console.log(c),b>100){platform.console.log("BREAK");break}};
},{"./InteractionManager":29,"./core/globals":30,"./display/DisplayObject":31,"./display/DisplayObjectContainer":32,"./display/MovieClip":33,"./display/Sprite":34,"./display/Stage":35,"./display/blendModes":36,"./events/EventTarget":37,"./extras/CustomRenderable":38,"./extras/Rope":39,"./extras/Spine":40,"./extras/Strip":41,"./extras/TilingSprite":42,"./filters/FilterBlock":43,"./geom/Circle":44,"./geom/Ellipse":45,"./geom/Point":46,"./geom/Polygon":47,"./geom/Rectangle":48,"./geom/matrix":49,"./loaders/AssetLoader":51,"./loaders/BitmapFontLoader":52,"./loaders/ImageLoader":53,"./loaders/JsonLoader":54,"./loaders/SpineLoader":55,"./loaders/SpriteSheetLoader":56,"./platform":57,"./primitives/Graphics":58,"./renderers/canvas/CanvasRenderer":59,"./renderers/canvas/graphics":60,"./renderers/webgl/WebGLBatch":61,"./renderers/webgl/WebGLRenderGroup":62,"./renderers/webgl/WebGLRenderer":63,"./renderers/webgl/graphics":64,"./renderers/webgl/shaders":65,"./text/BitmapText":66,"./text/Text":67,"./textures/BaseTexture":68,"./textures/RenderTexture":69,"./textures/Texture":70,"./utils/Polyk":71,"./utils/autoDetectRenderer":72}],51:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function AssetLoader(a,b){EventTarget.call(this),this.assetURLs=a,this.crossorigin=b}var EventTarget=require("../events/EventTarget"),loadersByType={},proto=AssetLoader.prototype;proto.load=function(){function a(){b.onAssetLoaded()}var b=this;this.loadCount=this.assetURLs.length;for(var c=0,d=this.assetURLs.length;d>c;c++){var e=this.assetURLs[c],f=e.split(".").pop().toLowerCase(),g=loadersByType[f];if(!g)throw new Error(f+" is an unsupported file type");var h=new g(e,this.crossorigin);h.addEventListener("loaded",a),h.load()}},proto.onAssetLoaded=function(){this.loadCount--,this.dispatchEvent({type:"onProgress",content:this}),this.onProgress&&this.onProgress(),this.loadCount||(this.dispatchEvent({type:"onComplete",content:this}),this.onComplete&&this.onComplete())},AssetLoader.registerLoaderType=function(a,b){loadersByType[a]=b},module.exports=AssetLoader;
},{"../events/EventTarget":37}],52:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function BitmapFontLoader(a,b){EventTarget.call(this),this.url=a,this.crossorigin=b,this.baseUrl=a.replace(/[^\/]*$/,""),this.loaded=!1,this.texture=null}var AssetLoader=require("./AssetLoader"),ImageLoader=require("./ImageLoader"),Rectangle=require("../geom/Rectangle"),EventTarget=require("../events/EventTarget"),BitmapText=require("../text/BitmapText"),Texture=require("../textures/Texture"),platform=require("../platform"),proto=BitmapFontLoader.prototype;proto.handleEvent=function(a){switch(a.type){case"load":this.onXMLLoaded();break;default:this.onError()}},proto.load=function(){this.request=platform.createRequest(),this.request.addEventListener("load",this),this.request.addEventListener("error",this),this.request.open("GET",this.url,!0),this.request.overrideMimeType&&this.request.overrideMimeType("application/xml"),this.request.send(null)},proto.onXMLLoaded=function(){var a=this.baseUrl+this.request.responseXML.getElementsByTagName("page")[0].attributes.getNamedItem("file").nodeValue,b=new ImageLoader(a,this.crossorigin);this.texture=b.texture.baseTexture;var c={},d=this.request.responseXML.getElementsByTagName("info")[0],e=this.request.responseXML.getElementsByTagName("common")[0];c.font=d.attributes.getNamedItem("face").nodeValue,c.size=parseInt(d.attributes.getNamedItem("size").nodeValue,10),c.lineHeight=parseInt(e.attributes.getNamedItem("lineHeight").nodeValue,10),c.chars={};for(var f=this.request.responseXML.getElementsByTagName("char"),g=0;g<f.length;g++){var h=parseInt(f[g].attributes.getNamedItem("id").nodeValue,10),i=new Rectangle(parseInt(f[g].attributes.getNamedItem("x").nodeValue,10),parseInt(f[g].attributes.getNamedItem("y").nodeValue,10),parseInt(f[g].attributes.getNamedItem("width").nodeValue,10),parseInt(f[g].attributes.getNamedItem("height").nodeValue,10));c.chars[h]={xOffset:parseInt(f[g].attributes.getNamedItem("xoffset").nodeValue,10),yOffset:parseInt(f[g].attributes.getNamedItem("yoffset").nodeValue,10),xAdvance:parseInt(f[g].attributes.getNamedItem("xadvance").nodeValue,10),kerning:{},texture:Texture.cache[h]=new Texture(this.texture,i)}}var j=this.request.responseXML.getElementsByTagName("kerning");for(g=0;g<j.length;g++){var k=parseInt(j[g].attributes.getNamedItem("first").nodeValue,10),l=parseInt(j[g].attributes.getNamedItem("second").nodeValue,10),m=parseInt(j[g].attributes.getNamedItem("amount").nodeValue,10);c.chars[l].kerning[k]=m}BitmapText.fonts[c.font]=c;var n=this;b.addEventListener("loaded",function(){n.onLoaded()}),b.load()},proto.onLoaded=function(){this.loaded=!0,this.dispatchEvent({type:"loaded",content:this})},proto.onError=function(){this.dispatchEvent({type:"error",content:this})},AssetLoader.registerLoaderType("xml",BitmapFontLoader),AssetLoader.registerLoaderType("fnt",BitmapFontLoader),module.exports=BitmapFontLoader;
},{"../events/EventTarget":37,"../geom/Rectangle":48,"../platform":57,"../text/BitmapText":66,"../textures/Texture":70,"./AssetLoader":51,"./ImageLoader":53}],53:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function ImageLoader(a,b){EventTarget.call(this),this.texture=Texture.fromImage(a,b),this.frames=[]}var AssetLoader=require("./AssetLoader"),EventTarget=require("../events/EventTarget"),Texture=require("../textures/Texture"),proto=ImageLoader.prototype;proto.load=function(){if(this.texture.baseTexture.hasLoaded)this.onLoaded();else{var a=this;this.texture.baseTexture.addEventListener("loaded",function(){a.onLoaded()})}},proto.onLoaded=function(){this.dispatchEvent({type:"loaded",content:this})},proto.loadFramedSpriteSheet=function(a,b,c){this.frames=[];for(var d=Math.floor(this.texture.width/a),e=Math.floor(this.texture.height/b),f=0,g=0;e>g;g++)for(var h=0;d>h;h++,f++){var i=new Texture(this.texture,{x:h*a,y:g*b,width:a,height:b});this.frames.push(i),c&&(Texture.cache[c+"-"+f]=i)}if(this.texture.baseTexture.hasLoaded)this.onLoaded();else{var j=this;this.texture.baseTexture.addEventListener("loaded",function(){j.onLoaded()})}},AssetLoader.registerLoaderType("jpg",ImageLoader),AssetLoader.registerLoaderType("jpeg",ImageLoader),AssetLoader.registerLoaderType("png",ImageLoader),AssetLoader.registerLoaderType("gif",ImageLoader),module.exports=ImageLoader;
},{"../events/EventTarget":37,"../textures/Texture":70,"./AssetLoader":51}],54:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function JsonLoader(a,b){EventTarget.call(this),this.url=a,this.crossorigin=b,this.baseUrl=a.replace(/[^\/]*$/,""),this.loaded=!1}var AssetLoader=require("./AssetLoader"),ImageLoader=require("./ImageLoader"),EventTarget=require("../events/EventTarget"),Texture=require("../textures/Texture"),Spine=require("../extras/Spine"),SkeletonJson=require("../utils/spine").SkeletonJson,platform=require("../platform"),proto=JsonLoader.prototype;proto.handleEvent=function(a){switch(a.type){case"load":this.onJSONLoaded();break;default:this.onError()}},proto.load=function(){this.request=platform.createRequest(),this.request.addEventListener("load",this),this.request.addEventListener("error",this),this.request.open("GET",this.url,!0),this.request.overrideMimeType&&this.request.overrideMimeType("application/json"),this.request.send(null)},proto.onJSONLoaded=function(){if(this.json=JSON.parse(this.request.responseText),this.json.frames){var a=this,b=this.baseUrl+this.json.meta.image,c=new ImageLoader(b,this.crossorigin),d=this.json.frames;this.texture=c.texture.baseTexture,c.addEventListener("loaded",function(){a.onLoaded()});for(var e in d){var f=d[e].frame;f&&(Texture.cache[e]=new Texture(this.texture,{x:f.x,y:f.y,width:f.w,height:f.h}),d[e].trimmed&&(Texture.cache[e].realSize=d[e].spriteSourceSize,Texture.cache[e].trim.x=0))}c.load()}else if(this.json.bones){var g=new SkeletonJson,h=g.readSkeletonData(this.json);Spine.animCache[this.url]=h,this.onLoaded()}else this.onLoaded()},proto.onLoaded=function(){this.loaded=!0,this.dispatchEvent({type:"loaded",content:this})},proto.onError=function(){this.dispatchEvent({type:"error",content:this})},AssetLoader.registerLoaderType("json",JsonLoader),module.exports=JsonLoader;
},{"../events/EventTarget":37,"../extras/Spine":40,"../platform":57,"../textures/Texture":70,"../utils/spine":74,"./AssetLoader":51,"./ImageLoader":53}],55:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function SpineLoader(a,b){EventTarget.call(this),this.url=a,this.crossorigin=b,this.loaded=!1}var AssetLoader=require("./AssetLoader"),JsonLoader=require("./JsonLoader"),EventTarget=require("../events/EventTarget"),Spine=require("../extras/Spine"),SkeletonJson=require("../utils/spine").SkeletonJson,proto=SpineLoader.prototype;proto.load=function(){var a=this,b=new JsonLoader(this.url,this.crossorigin);b.addEventListener("loaded",function(b){a.json=b.content.json,a.onJSONLoaded()}),b.load()},proto.onJSONLoaded=function(){var a=new SkeletonJson,b=a.readSkeletonData(this.json);Spine.animCache[this.url]=b,this.onLoaded()},proto.onLoaded=function(){this.loaded=!0,this.dispatchEvent({type:"loaded",content:this})},AssetLoader.registerLoaderType("anim",SpineLoader),module.exports=SpineLoader;
},{"../events/EventTarget":37,"../extras/Spine":40,"../utils/spine":74,"./AssetLoader":51,"./JsonLoader":54}],56:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function SpriteSheetLoader(a,b){EventTarget.call(this),this.url=a,this.crossorigin=b,this.baseUrl=a.replace(/[^\/]*$/,""),this.texture=null,this.frames={}}var JsonLoader=require("./JsonLoader"),ImageLoader=require("./ImageLoader"),EventTarget=require("../events/EventTarget"),Texture=require("../textures/Texture"),proto=SpriteSheetLoader.prototype;proto.load=function(){var a=this,b=new JsonLoader(this.url,this.crossorigin);b.addEventListener("loaded",function(b){a.json=b.content.json,a.onJSONLoaded()}),b.load()},proto.onJSONLoaded=function(){var a=this,b=this.baseUrl+this.json.meta.image,c=new ImageLoader(b,this.crossorigin),d=this.json.frames;this.texture=c.texture.baseTexture,c.addEventListener("loaded",function(){a.onLoaded()});for(var e in d){var f=d[e].frame;f&&(Texture.cache[e]=new Texture(this.texture,{x:f.x,y:f.y,width:f.w,height:f.h}),d[e].trimmed&&(Texture.cache[e].realSize=d[e].spriteSourceSize,Texture.cache[e].trim.x=0))}c.load()},proto.onLoaded=function(){this.dispatchEvent({type:"loaded",content:this})},module.exports=SpriteSheetLoader;
},{"../events/EventTarget":37,"../textures/Texture":70,"./ImageLoader":53,"./JsonLoader":54}],57:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
module.exports={console:global.console,document:global.document,location:global.location,navigator:global.navigator,window:global.window,createCanvas:function(){return global.document.createElement("canvas")},createImage:function(){return new global.Image},createRequest:function(){return new global.XMLHttpRequest}};
},{}],58:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Graphics(){DisplayObjectContainer.call(this),this.renderable=!0,this.fillAlpha=1,this.lineWidth=0,this.lineColor="black",this.graphicsData=[],this.currentPath={points:[]}}var DisplayObjectContainer=require("../display/DisplayObjectContainer"),proto=Graphics.prototype=Object.create(DisplayObjectContainer.prototype,{constructor:{value:Graphics}});proto.lineStyle=function(a,b,c){this.currentPath.points.length||this.graphicsData.pop(),this.lineWidth=a||0,this.lineColor=b||0,this.lineAlpha=arguments.length<3?1:c,this.currentPath={lineWidth:this.lineWidth,lineColor:this.lineColor,lineAlpha:this.lineAlpha,fillColor:this.fillColor,fillAlpha:this.fillAlpha,fill:this.filling,points:[],type:Graphics.POLY},this.graphicsData.push(this.currentPath)},proto.moveTo=function(a,b){this.currentPath.points.length||this.graphicsData.pop(),this.currentPath=this.currentPath={lineWidth:this.lineWidth,lineColor:this.lineColor,lineAlpha:this.lineAlpha,fillColor:this.fillColor,fillAlpha:this.fillAlpha,fill:this.filling,points:[],type:Graphics.POLY},this.currentPath.points.push(a,b),this.graphicsData.push(this.currentPath)},proto.lineTo=function(a,b){this.currentPath.points.push(a,b),this.dirty=!0},proto.beginFill=function(a,b){this.filling=!0,this.fillColor=a||0,this.fillAlpha=arguments.length<2?1:b},proto.endFill=function(){this.filling=!1,this.fillColor=null,this.fillAlpha=1},proto.drawRect=function(a,b,c,d){this.currentPath.points.length||this.graphicsData.pop(),this.currentPath={lineWidth:this.lineWidth,lineColor:this.lineColor,lineAlpha:this.lineAlpha,fillColor:this.fillColor,fillAlpha:this.fillAlpha,fill:this.filling,points:[a,b,c,d],type:Graphics.RECT},this.graphicsData.push(this.currentPath),this.dirty=!0},proto.drawCircle=function(a,b,c){this.currentPath.points.length||this.graphicsData.pop(),this.currentPath={lineWidth:this.lineWidth,lineColor:this.lineColor,lineAlpha:this.lineAlpha,fillColor:this.fillColor,fillAlpha:this.fillAlpha,fill:this.filling,points:[a,b,c,c],type:Graphics.CIRC},this.graphicsData.push(this.currentPath),this.dirty=!0},proto.drawElipse=function(a,b,c,d){this.currentPath.points.length||this.graphicsData.pop(),this.currentPath={lineWidth:this.lineWidth,lineColor:this.lineColor,lineAlpha:this.lineAlpha,fillColor:this.fillColor,fillAlpha:this.fillAlpha,fill:this.filling,points:[a,b,c,d],type:Graphics.ELIP},this.graphicsData.push(this.currentPath),this.dirty=!0},proto.clear=function(){this.lineWidth=0,this.filling=!1,this.dirty=!0,this.clearDirty=!0,this.graphicsData=[]},Graphics.POLY=0,Graphics.RECT=1,Graphics.CIRC=2,Graphics.ELIP=3,module.exports=Graphics;
},{"../display/DisplayObjectContainer":32}],59:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function CanvasRenderer(a,b,c,d){this.transparent=d,this.width=a||800,this.height=b||600,this.view=c||platform.createCanvas(),this.context=this.view.getContext("2d"),this.refresh=!0,this.view.width=this.width,this.view.height=this.height,this.count=0}var platform=require("../../platform"),globals=require("../../core/globals"),canvasGraphics=require("./graphics"),Texture=require("../../textures/Texture"),DisplayObject=require("../../display/DisplayObject"),Sprite=require("../../display/Sprite"),TilingSprite=require("../../extras/TilingSprite"),Strip=require("../../extras/Strip"),CustomRenderable=require("../../extras/CustomRenderable"),Graphics=require("../../primitives/Graphics"),FilterBlock=require("../../filters/FilterBlock"),proto=CanvasRenderer.prototype;proto.render=function(a){globals.texturesToUpdate=[],globals.texturesToDestroy=[],globals.visibleCount++,a.updateTransform(),this.view.style.backgroundColor==a.backgroundColorString||this.transparent||(this.view.style.backgroundColor=a.backgroundColorString),this.context.setTransform(1,0,0,1,0,0),this.context.clearRect(0,0,this.width,this.height),this.renderDisplayObject(a),a.interactive&&(a._interactiveEventsAdded||(a._interactiveEventsAdded=!0,a.interactionManager.setTarget(this))),Texture.frameUpdates.length>0&&(Texture.frameUpdates=[])},proto.resize=function(a,b){this.width=a,this.height=b,this.view.width=a,this.view.height=b},proto.renderDisplayObject=function(a){var b,c=this.context;c.globalCompositeOperation="source-over";var d=a.last._iNext;a=a.first;do if(b=a.worldTransform,a.visible)if(a.renderable){if(a instanceof Sprite){var e=a.texture.frame;e&&e.width&&e.height&&(c.globalAlpha=a.worldAlpha,c.setTransform(b[0],b[3],b[1],b[4],b[2],b[5]),c.drawImage(a.texture.baseTexture.source,e.x,e.y,e.width,e.height,a.anchor.x*-e.width,a.anchor.y*-e.height,e.width,e.height))}else if(a instanceof Strip)c.setTransform(b[0],b[3],b[1],b[4],b[2],b[5]),this.renderStrip(a);else if(a instanceof TilingSprite)c.setTransform(b[0],b[3],b[1],b[4],b[2],b[5]),this.renderTilingSprite(a);else if(a instanceof CustomRenderable)a.renderCanvas(this);else if(a instanceof Graphics)c.setTransform(b[0],b[3],b[1],b[4],b[2],b[5]),canvasGraphics.renderGraphics(a,c);else if(a instanceof FilterBlock)if(a.open){c.save();var f=a.mask.alpha,g=a.mask.worldTransform;c.setTransform(g[0],g[3],g[1],g[4],g[2],g[5]),a.mask.worldAlpha=.5,c.worldAlpha=0,canvasGraphics.renderGraphicsMask(a.mask,c),c.clip(),a.mask.worldAlpha=f}else c.restore();a=a._iNext}else a=a._iNext;else a=a.last._iNext;while(a!=d)},proto.renderStripFlat=function(a){var b=this.context,c=a.verticies,d=(a.uvs,c.length/2);this.count++,b.beginPath();for(var e=1;d-2>e;e++){var f=2*e,g=c[f],h=c[f+2],i=c[f+4],j=c[f+1],k=c[f+3],l=c[f+5];b.moveTo(g,j),b.lineTo(h,k),b.lineTo(i,l)}b.fillStyle="#FF0000",b.fill(),b.closePath()},proto.renderTilingSprite=function(a){var b=this.context;b.globalAlpha=a.worldAlpha,a.__tilePattern||(a.__tilePattern=b.createPattern(a.texture.baseTexture.source,"repeat")),b.beginPath();var c=a.tilePosition,d=a.tileScale;b.scale(d.x,d.y),b.translate(c.x,c.y),b.fillStyle=a.__tilePattern,b.fillRect(-c.x,-c.y,a.width/d.x,a.height/d.y),b.scale(1/d.x,1/d.y),b.translate(-c.x,-c.y),b.closePath()},proto.renderStrip=function(a){var b=this.context,c=a.verticies,d=a.uvs,e=c.length/2;this.count++;for(var f=1;e-2>f;f++){var g=2*f,h=c[g],i=c[g+2],j=c[g+4],k=c[g+1],l=c[g+3],m=c[g+5],n=d[g]*a.texture.width,o=d[g+2]*a.texture.width,p=d[g+4]*a.texture.width,q=d[g+1]*a.texture.height,r=d[g+3]*a.texture.height,s=d[g+5]*a.texture.height;b.save(),b.beginPath(),b.moveTo(h,k),b.lineTo(i,l),b.lineTo(j,m),b.closePath(),b.clip();var t=n*r+q*p+o*s-r*p-q*o-n*s,u=h*r+q*j+i*s-r*j-q*i-h*s,v=n*i+h*p+o*j-i*p-h*o-n*j,w=n*r*j+q*i*p+h*o*s-h*r*p-q*o*j-n*i*s,x=k*r+q*m+l*s-r*m-q*l-k*s,y=n*l+k*p+o*m-l*p-k*o-n*m,z=n*r*m+q*l*p+k*o*s-k*r*p-q*o*m-n*l*s;b.transform(u/t,x/t,v/t,y/t,w/t,z/t),b.drawImage(a.texture.baseTexture.source,0,0),b.restore()}},module.exports=CanvasRenderer;
},{"../../core/globals":30,"../../display/DisplayObject":31,"../../display/Sprite":34,"../../extras/CustomRenderable":38,"../../extras/Strip":41,"../../extras/TilingSprite":42,"../../filters/FilterBlock":43,"../../platform":57,"../../primitives/Graphics":58,"../../textures/Texture":70,"./graphics":60}],60:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";var platform=require("../../platform"),Graphics=require("../../primitives/Graphics");exports.renderGraphics=function(a,b){for(var c,d,e,f,g,h=a.worldAlpha,i=0,j=a.graphicsData.length;j>i;i++)if(c=a.graphicsData[i],d=c.points,e=b.strokeStyle="#"+("00000"+(0|c.lineColor).toString(16)).substr(-6),b.lineWidth=c.lineWidth,c.type==Graphics.POLY){for(b.beginPath(),b.moveTo(d[0],d[1]),f=1,g=d.length/2;g>f;f++)b.lineTo(d[2*f],d[2*f+1]);d[0]==d[d.length-2]&&d[1]==d[d.length-1]&&b.closePath(),c.fill&&(b.globalAlpha=c.fillAlpha*h,b.fillStyle=e="#"+("00000"+(0|c.fillColor).toString(16)).substr(-6),b.fill()),c.lineWidth&&(b.globalAlpha=c.lineAlpha*h,b.stroke())}else if(c.type==Graphics.RECT)(c.fillColor||0===c.fillColor)&&(b.globalAlpha=c.fillAlpha*h,b.fillStyle=e="#"+("00000"+(0|c.fillColor).toString(16)).substr(-6),b.fillRect(d[0],d[1],d[2],d[3])),c.lineWidth&&(b.globalAlpha=c.lineAlpha*h,b.strokeRect(d[0],d[1],d[2],d[3]));else if(c.type==Graphics.CIRC)b.beginPath(),b.arc(d[0],d[1],d[2],0,2*Math.PI),b.closePath(),c.fill&&(b.globalAlpha=c.fillAlpha*h,b.fillStyle=e="#"+("00000"+(0|c.fillColor).toString(16)).substr(-6),b.fill()),c.lineWidth&&(b.globalAlpha=c.lineAlpha*h,b.stroke());else if(c.type==Graphics.ELIP){var k=c.points,l=2*k[2],m=2*k[3],n=k[0]-l/2,o=k[1]-m/2;b.beginPath();var p=.5522848,q=l/2*p,r=m/2*p,s=n+l,t=o+m,u=n+l/2,v=o+m/2;b.moveTo(n,v),b.bezierCurveTo(n,v-r,u-q,o,u,o),b.bezierCurveTo(u+q,o,s,v-r,s,v),b.bezierCurveTo(s,v+r,u+q,t,u,t),b.bezierCurveTo(u-q,t,n,v+r,n,v),b.closePath(),c.fill&&(b.globalAlpha=c.fillAlpha*h,b.fillStyle=e="#"+("00000"+(0|c.fillColor).toString(16)).substr(-6),b.fill()),c.lineWidth&&(b.globalAlpha=c.lineAlpha*h,b.stroke())}},exports.renderGraphicsMask=function(a,b){var c=(a.worldAlpha,a.graphicsData.length);c>1&&(c=1,platform.console.warn("Pixi.js warning: masks in canvas can only mask using the first path in the graphics object"));for(var d=0;1>d;d++){var e=a.graphicsData[d],f=e.points;if(e.type==Graphics.POLY){b.beginPath(),b.moveTo(f[0],f[1]);for(var g=1;g<f.length/2;g++)b.lineTo(f[2*g],f[2*g+1]);f[0]==f[f.length-2]&&f[1]==f[f.length-1]&&b.closePath()}else if(e.type==Graphics.RECT)b.beginPath(),b.rect(f[0],f[1],f[2],f[3]),b.closePath();else if(e.type==Graphics.CIRC)b.beginPath(),b.arc(f[0],f[1],f[2],0,2*Math.PI),b.closePath();else if(e.type==Graphics.ELIP){var h=e.points,i=2*h[2],j=2*h[3],k=h[0]-i/2,l=h[1]-j/2;b.beginPath();var m=.5522848,n=i/2*m,o=j/2*m,p=k+i,q=l+j,r=k+i/2,s=l+j/2;b.moveTo(k,s),b.bezierCurveTo(k,s-o,r-n,l,r,l),b.bezierCurveTo(r+n,l,p,s-o,p,s),b.bezierCurveTo(p,s+o,r+n,q,r,q),b.bezierCurveTo(r-n,q,k,s+o,k,s),b.closePath()}}};
},{"../../platform":57,"../../primitives/Graphics":58}],61:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function WebGLBatch(a){this.gl=a,this.size=0,this.vertexBuffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),this.uvBuffer=a.createBuffer(),this.colorBuffer=a.createBuffer(),this.blendMode=blendModes.NORMAL,this.dynamicSize=1}var globals=require("../../core/globals"),blendModes=require("../../display/blendModes"),proto=WebGLBatch.prototype;proto.clean=function(){this.verticies=[],this.uvs=[],this.indices=[],this.colors=[],this.dynamicSize=1,this.texture=null,this.size=0,this.head=null,this.tail=null},proto.restoreLostContext=function(a){this.gl=a,this.vertexBuffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),this.uvBuffer=a.createBuffer(),this.colorBuffer=a.createBuffer()},proto.init=function(a){a.batch=this,this.dirty=!0,this.blendMode=a.blendMode,this.texture=a.texture.baseTexture,this.head=a,this.tail=a,this.size=1,this.growBatch()},proto.insertBefore=function(a,b){this.size++,a.batch=this,this.dirty=!0;var c=b.__prev;b.__prev=a,a.__next=b,c?(a.__prev=c,c.__next=a):this.head=a},proto.insertAfter=function(a,b){this.size++,a.batch=this,this.dirty=!0;var c=b.__next;b.__next=a,a.__prev=b,c?(a.__next=c,c.__prev=a):this.tail=a},proto.remove=function(a){return this.size--,this.size?(a.__prev?a.__prev.__next=a.__next:(this.head=a.__next,this.head.__prev=null),a.__next?a.__next.__prev=a.__prev:(this.tail=a.__prev,this.tail.__next=null),a.batch=null,a.__next=null,a.__prev=null,this.dirty=!0,void 0):(a.batch=null,a.__prev=null,a.__next=null,void 0)},proto.split=function(a){this.dirty=!0;var b=new WebGLBatch(this.gl);b.init(a),b.texture=this.texture,b.tail=this.tail,this.tail=a.__prev,this.tail.__next=null,a.__prev=null;for(var c=0;a;)c++,a.batch=b,a=a.__next;return b.size=c,this.size-=c,b},proto.merge=function(a){this.dirty=!0,this.tail.__next=a.head,a.head.__prev=this.tail,this.size+=a.size,this.tail=a.tail;for(var b=a.head;b;)b.batch=this,b=b.__next},proto.growBatch=function(){var a=this.gl;this.dynamicSize=1==this.size?1:1.5*this.size,this.verticies=new Float32Array(8*this.dynamicSize),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bufferData(a.ARRAY_BUFFER,this.verticies,a.DYNAMIC_DRAW),this.uvs=new Float32Array(8*this.dynamicSize),a.bindBuffer(a.ARRAY_BUFFER,this.uvBuffer),a.bufferData(a.ARRAY_BUFFER,this.uvs,a.DYNAMIC_DRAW),this.dirtyUVS=!0,this.colors=new Float32Array(4*this.dynamicSize),a.bindBuffer(a.ARRAY_BUFFER,this.colorBuffer),a.bufferData(a.ARRAY_BUFFER,this.colors,a.DYNAMIC_DRAW),this.dirtyColors=!0,this.indices=new Uint16Array(6*this.dynamicSize);for(var b=0,c=this.indices.length/6;c>b;b++){var d=6*b,e=4*b;this.indices[d+0]=e+0,this.indices[d+1]=e+1,this.indices[d+2]=e+2,this.indices[d+3]=e+0,this.indices[d+4]=e+2,this.indices[d+5]=e+3}a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,this.indices,a.STATIC_DRAW)},proto.refresh=function(){this.gl;this.dynamicSize<this.size&&this.growBatch();for(var a,b,c=0,d=this.head;d;){a=8*c;var e=d.texture,f=e.frame,g=e.baseTexture.width,h=e.baseTexture.height;this.uvs[a+0]=f.x/g,this.uvs[a+1]=f.y/h,this.uvs[a+2]=(f.x+f.width)/g,this.uvs[a+3]=f.y/h,this.uvs[a+4]=(f.x+f.width)/g,this.uvs[a+5]=(f.y+f.height)/h,this.uvs[a+6]=f.x/g,this.uvs[a+7]=(f.y+f.height)/h,d.updateFrame=!1,b=4*c,this.colors[b]=this.colors[b+1]=this.colors[b+2]=this.colors[b+3]=d.worldAlpha,d=d.__next,c++}this.dirtyUVS=!0,this.dirtyColors=!0},proto.update=function(){for(var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q=(this.gl,0),r=this.head;r;){if(r.vcount===globals.visibleCount){if(b=r.texture.frame.width,c=r.texture.frame.height,d=r.anchor.x,e=r.anchor.y,f=b*(1-d),g=b*-d,h=c*(1-e),i=c*-e,j=8*q,a=r.worldTransform,k=a[0],l=a[3],m=a[1],n=a[4],o=a[2],p=a[5],this.verticies[j+0]=k*g+m*i+o,this.verticies[j+1]=n*i+l*g+p,this.verticies[j+2]=k*f+m*i+o,this.verticies[j+3]=n*i+l*f+p,this.verticies[j+4]=k*f+m*h+o,this.verticies[j+5]=n*h+l*f+p,this.verticies[j+6]=k*g+m*h+o,this.verticies[j+7]=n*h+l*g+p,r.updateFrame||r.texture.updateFrame){this.dirtyUVS=!0;var s=r.texture,t=s.frame,u=s.baseTexture.width,v=s.baseTexture.height;this.uvs[j+0]=t.x/u,this.uvs[j+1]=t.y/v,this.uvs[j+2]=(t.x+t.width)/u,this.uvs[j+3]=t.y/v,this.uvs[j+4]=(t.x+t.width)/u,this.uvs[j+5]=(t.y+t.height)/v,this.uvs[j+6]=t.x/u,this.uvs[j+7]=(t.y+t.height)/v,r.updateFrame=!1}if(r.cacheAlpha!=r.worldAlpha){r.cacheAlpha=r.worldAlpha;var w=4*q;this.colors[w]=this.colors[w+1]=this.colors[w+2]=this.colors[w+3]=r.worldAlpha,this.dirtyColors=!0}}else j=8*q,this.verticies[j+0]=0,this.verticies[j+1]=0,this.verticies[j+2]=0,this.verticies[j+3]=0,this.verticies[j+4]=0,this.verticies[j+5]=0,this.verticies[j+6]=0,this.verticies[j+7]=0;q++,r=r.__next}},proto.render=function(a,b){if(a=a||0,arguments.length<2&&(b=this.size),this.dirty&&(this.refresh(),this.dirty=!1),this.size){this.update();var c=this.gl,d=globals.shaderProgram;c.useProgram(d),c.bindBuffer(c.ARRAY_BUFFER,this.vertexBuffer),c.bufferSubData(c.ARRAY_BUFFER,0,this.verticies),c.vertexAttribPointer(d.vertexPositionAttribute,2,c.FLOAT,!1,0,0),c.bindBuffer(c.ARRAY_BUFFER,this.uvBuffer),this.dirtyUVS&&(this.dirtyUVS=!1,c.bufferSubData(c.ARRAY_BUFFER,0,this.uvs)),c.vertexAttribPointer(d.textureCoordAttribute,2,c.FLOAT,!1,0,0),c.activeTexture(c.TEXTURE0),c.bindTexture(c.TEXTURE_2D,this.texture._glTexture),c.bindBuffer(c.ARRAY_BUFFER,this.colorBuffer),this.dirtyColors&&(this.dirtyColors=!1,c.bufferSubData(c.ARRAY_BUFFER,0,this.colors)),c.vertexAttribPointer(d.colorAttribute,1,c.FLOAT,!1,0,0),c.bindBuffer(c.ELEMENT_ARRAY_BUFFER,this.indexBuffer);var e=b-a;c.drawElements(c.TRIANGLES,6*e,c.UNSIGNED_SHORT,2*a*6)}};var batches=[];WebGLBatch.restoreBatches=function(a){for(var b=0,c=batches.length;c>b;b++)batches[b].restoreLostContext(a)},WebGLBatch.getBatch=function(){return batches.length?batches.pop():new WebGLBatch(globals.gl)},WebGLBatch.returnBatch=function(a){a.clean(),batches.push(a)},module.exports=WebGLBatch;
},{"../../core/globals":30,"../../display/blendModes":36}],62:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function WebGLRenderGroup(a){this.gl=a,this.root=null,this.batchs=[],this.toRemove=[]}var globals=require("../../core/globals"),webglGraphics=require("./graphics"),WebGLBatch=require("./WebGLBatch"),mat3=require("../../geom/matrix").mat3,TilingSprite=require("../../extras/TilingSprite"),Strip=require("../../extras/Strip"),Graphics=require("../../primitives/Graphics"),FilterBlock=require("../../filters/FilterBlock"),Sprite=require("../../display/Sprite"),CustomRenderable=require("../../extras/CustomRenderable"),proto=WebGLRenderGroup.prototype;proto.setRenderable=function(a){this.root&&this.removeDisplayObjectAndChildren(this.root),a.worldVisible=a.visible,this.root=a,this.addDisplayObjectAndChildren(a)},proto.render=function(a){var b=this.gl;WebGLRenderGroup.updateTextures(b),b.uniform2f(globals.shaderProgram.projectionVector,a.x,a.y),b.blendFunc(b.ONE,b.ONE_MINUS_SRC_ALPHA);for(var c,d=0;d<this.batchs.length;d++)if(c=this.batchs[d],c instanceof WebGLBatch)this.batchs[d].render();else{var e=c.vcount===globals.visibleCount;c instanceof TilingSprite?e&&this.renderTilingSprite(c,a):c instanceof Strip?e&&this.renderStrip(c,a):c instanceof Graphics?e&&c.renderable&&webglGraphics.renderGraphics(c,a):c instanceof FilterBlock&&(c.open?(b.enable(b.STENCIL_TEST),b.colorMask(!1,!1,!1,!1),b.stencilFunc(b.ALWAYS,1,255),b.stencilOp(b.KEEP,b.KEEP,b.REPLACE),webglGraphics.renderGraphics(c.mask,a),b.colorMask(!0,!0,!0,!0),b.stencilFunc(b.NOTEQUAL,0,255),b.stencilOp(b.KEEP,b.KEEP,b.KEEP)):b.disable(b.STENCIL_TEST))}},proto.handleFilter=function(){},proto.renderSpecific=function(a,b){var c=this.gl;WebGLRenderGroup.updateTextures(c),c.uniform2f(globals.shaderProgram.projectionVector,b.x,b.y);for(var d,e,f,g,h,i,j=a.first;j._iNext&&(j=j._iNext,!j.renderable||!j.__renderGroup););var k=j.batch;if(j instanceof Sprite)if(k=j.batch,h=k.head,i=h,h==j)d=0;else for(d=1;h.__next!=j;)d++,h=h.__next;else k=j;for(var l,m=a,n=a;n.children.length>0;)n=n.children[n.children.length-1],n.renderable&&(m=n);if(m instanceof Sprite)if(l=m.batch,h=l.head,h==m)f=0;else for(f=1;h.__next!=m;)f++,h=h.__next;else l=m;if(k==l)return k instanceof WebGLBatch?k.render(d,f+1):this.renderSpecial(k,b),void 0;e=this.batchs.indexOf(k),g=this.batchs.indexOf(l),k instanceof WebGLBatch?k.render(d):this.renderSpecial(k,b);for(var o,p=e+1;g>p;p++)o=this.batchs[p],o instanceof WebGLBatch?this.batchs[p].render():this.renderSpecial(o,b);l instanceof WebGLBatch?l.render(0,f+1):this.renderSpecial(l,b)},proto.renderSpecial=function(a,b){var c=a.vcount===globals.visibleCount;if(a instanceof TilingSprite)c&&this.renderTilingSprite(a,b);else if(a instanceof Strip)c&&this.renderStrip(a,b);else if(a instanceof CustomRenderable)c&&a.renderWebGL(this,b);else if(a instanceof Graphics)c&&a.renderable&&webglGraphics.renderGraphics(a,b);else if(a instanceof FilterBlock){var d=this.gl;a.open?(d.enable(d.STENCIL_TEST),d.colorMask(!1,!1,!1,!1),d.stencilFunc(d.ALWAYS,1,255),d.stencilOp(d.KEEP,d.KEEP,d.REPLACE),webglGraphics.renderGraphics(a.mask,b),d.colorMask(!0,!0,!0,!0),d.stencilFunc(d.NOTEQUAL,0,255),d.stencilOp(d.KEEP,d.KEEP,d.KEEP)):d.disable(d.STENCIL_TEST)}},proto.updateTexture=function(a){this.removeObject(a);for(var b=a.first;b!=this.root&&(b=b._iPrev,!b.renderable||!b.__renderGroup););for(var c=a.last;c._iNext&&(c=c._iNext,!c.renderable||!c.__renderGroup););this.insertObject(a,b,c)},proto.addFilterBlocks=function(a,b){a.__renderGroup=this,b.__renderGroup=this;for(var c=a;c!=this.root&&(c=c._iPrev,!c.renderable||!c.__renderGroup););this.insertAfter(a,c);for(var d=b;d!=this.root&&(d=d._iPrev,!d.renderable||!d.__renderGroup););this.insertAfter(b,d)},proto.removeFilterBlocks=function(a,b){this.removeObject(a),this.removeObject(b)},proto.addDisplayObjectAndChildren=function(a){a.__renderGroup&&a.__renderGroup.removeDisplayObjectAndChildren(a);for(var b=a.first;b!=this.root.first&&(b=b._iPrev,!b.renderable||!b.__renderGroup););for(var c=a.last;c._iNext&&(c=c._iNext,!c.renderable||!c.__renderGroup););var d=a.first,e=a.last._iNext;do d.__renderGroup=this,d.renderable&&(this.insertObject(d,b,c),b=d),d=d._iNext;while(d!=e)},proto.removeDisplayObjectAndChildren=function(a){if(a.__renderGroup==this){{a.last}do a.__renderGroup=null,a.renderable&&this.removeObject(a),a=a._iNext;while(a)}},proto.insertObject=function(a,b,c){var d,e,f=b,g=c;if(a instanceof Sprite){var h,i;if(f instanceof Sprite){if(h=f.batch,h&&h.texture==a.texture.baseTexture&&h.blendMode==a.blendMode)return h.insertAfter(a,f),void 0}else h=f;if(g)if(g instanceof Sprite){if(i=g.batch){if(i.texture==a.texture.baseTexture&&i.blendMode==a.blendMode)return i.insertBefore(a,g),void 0;if(i==h){var j=h.split(g);return d=WebGLBatch.getBatch(),e=this.batchs.indexOf(h),d.init(a),this.batchs.splice(e+1,0,d,j),void 0}}}else i=g;return d=WebGLBatch.getBatch(),d.init(a),h?(e=this.batchs.indexOf(h),this.batchs.splice(e+1,0,d)):this.batchs.push(d),void 0}a instanceof TilingSprite?this.initTilingSprite(a):a instanceof Strip&&this.initStrip(a),this.insertAfter(a,f)},proto.insertAfter=function(a,b){var c,d,e;b instanceof Sprite?(c=b.batch,c?c.tail==b?(e=this.batchs.indexOf(c),this.batchs.splice(e+1,0,a)):(d=c.split(b.__next),e=this.batchs.indexOf(c),this.batchs.splice(e+1,0,a,d)):this.batchs.push(a)):(e=this.batchs.indexOf(b),this.batchs.splice(e+1,0,a))},proto.removeObject=function(a){var b,c;if(a instanceof Sprite){var d=a.batch;if(!d)return;d.remove(a),d.size||(b=d)}else b=a;if(b){if(c=this.batchs.indexOf(b),-1===c)return;if(0===c||c===this.batchs.length-1)return this.batchs.splice(c,1),b instanceof WebGLBatch&&WebGLBatch.returnBatch(b),void 0;if(this.batchs[c-1]instanceof WebGLBatch&&this.batchs[c+1]instanceof WebGLBatch&&this.batchs[c-1].texture==this.batchs[c+1].texture&&this.batchs[c-1].blendMode==this.batchs[c+1].blendMode)return this.batchs[c-1].merge(this.batchs[c+1]),b instanceof WebGLBatch&&WebGLBatch.returnBatch(b),WebGLBatch.returnBatch(this.batchs[c+1]),this.batchs.splice(c,2),void 0;this.batchs.splice(c,1),b instanceof WebGLBatch&&WebGLBatch.returnBatch(b)}},proto.initTilingSprite=function(a){var b=this.gl;a.verticies=new Float32Array([0,0,a.width,0,a.width,a.height,0,a.height]),a.uvs=new Float32Array([0,0,1,0,1,1,0,1]),a.colors=new Float32Array([1,1,1,1]),a.indices=new Uint16Array([0,1,3,2]),a._vertexBuffer=b.createBuffer(),a._indexBuffer=b.createBuffer(),a._uvBuffer=b.createBuffer(),a._colorBuffer=b.createBuffer(),b.bindBuffer(b.ARRAY_BUFFER,a._vertexBuffer),b.bufferData(b.ARRAY_BUFFER,a.verticies,b.STATIC_DRAW),b.bindBuffer(b.ARRAY_BUFFER,a._uvBuffer),b.bufferData(b.ARRAY_BUFFER,a.uvs,b.DYNAMIC_DRAW),b.bindBuffer(b.ARRAY_BUFFER,a._colorBuffer),b.bufferData(b.ARRAY_BUFFER,a.colors,b.STATIC_DRAW),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,a._indexBuffer),b.bufferData(b.ELEMENT_ARRAY_BUFFER,a.indices,b.STATIC_DRAW),a.texture.baseTexture._glTexture?(b.bindTexture(b.TEXTURE_2D,a.texture.baseTexture._glTexture),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,b.REPEAT),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.REPEAT),a.texture.baseTexture._powerOf2=!0):a.texture.baseTexture._powerOf2=!0},proto.renderStrip=function(a,b){var c=this.gl,d=globals.shaderProgram;c.useProgram(globals.stripShaderProgram);var e=mat3.clone(a.worldTransform);mat3.transpose(e),c.uniformMatrix3fv(globals.stripShaderProgram.translationMatrix,!1,e),c.uniform2f(globals.stripShaderProgram.projectionVector,b.x,b.y),c.uniform1f(globals.stripShaderProgram.alpha,a.worldAlpha),a.dirty?(a.dirty=!1,c.bindBuffer(c.ARRAY_BUFFER,a._vertexBuffer),c.bufferData(c.ARRAY_BUFFER,a.verticies,c.STATIC_DRAW),c.vertexAttribPointer(d.vertexPositionAttribute,2,c.FLOAT,!1,0,0),c.bindBuffer(c.ARRAY_BUFFER,a._uvBuffer),c.bufferData(c.ARRAY_BUFFER,a.uvs,c.STATIC_DRAW),c.vertexAttribPointer(d.textureCoordAttribute,2,c.FLOAT,!1,0,0),c.activeTexture(c.TEXTURE0),c.bindTexture(c.TEXTURE_2D,a.texture.baseTexture._glTexture),c.bindBuffer(c.ARRAY_BUFFER,a._colorBuffer),c.bufferData(c.ARRAY_BUFFER,a.colors,c.STATIC_DRAW),c.vertexAttribPointer(d.colorAttribute,1,c.FLOAT,!1,0,0),c.bindBuffer(c.ELEMENT_ARRAY_BUFFER,a._indexBuffer),c.bufferData(c.ELEMENT_ARRAY_BUFFER,a.indices,c.STATIC_DRAW)):(c.bindBuffer(c.ARRAY_BUFFER,a._vertexBuffer),c.bufferSubData(c.ARRAY_BUFFER,0,a.verticies),c.vertexAttribPointer(d.vertexPositionAttribute,2,c.FLOAT,!1,0,0),c.bindBuffer(c.ARRAY_BUFFER,a._uvBuffer),c.vertexAttribPointer(d.textureCoordAttribute,2,c.FLOAT,!1,0,0),c.activeTexture(c.TEXTURE0),c.bindTexture(c.TEXTURE_2D,a.texture.baseTexture._glTexture),c.bindBuffer(c.ARRAY_BUFFER,a._colorBuffer),c.vertexAttribPointer(d.colorAttribute,1,c.FLOAT,!1,0,0),c.bindBuffer(c.ELEMENT_ARRAY_BUFFER,a._indexBuffer)),c.drawElements(c.TRIANGLE_STRIP,a.indices.length,c.UNSIGNED_SHORT,0),c.useProgram(globals.shaderProgram)},proto.renderTilingSprite=function(a,b){var c=this.gl,d=(globals.shaderProgram,a.tilePosition),e=a.tileScale,f=d.x/a.texture.baseTexture.width,g=d.y/a.texture.baseTexture.height,h=a.width/a.texture.baseTexture.width/e.x,i=a.height/a.texture.baseTexture.height/e.y;a.uvs[0]=0-f,a.uvs[1]=0-g,a.uvs[2]=1*h-f,a.uvs[3]=0-g,a.uvs[4]=1*h-f,a.uvs[5]=1*i-g,a.uvs[6]=0-f,a.uvs[7]=1*i-g,c.bindBuffer(c.ARRAY_BUFFER,a._uvBuffer),c.bufferSubData(c.ARRAY_BUFFER,0,a.uvs),this.renderStrip(a,b)},proto.initStrip=function(a){{var b=this.gl;this.shaderProgram}a._vertexBuffer=b.createBuffer(),a._indexBuffer=b.createBuffer(),a._uvBuffer=b.createBuffer(),a._colorBuffer=b.createBuffer(),b.bindBuffer(b.ARRAY_BUFFER,a._vertexBuffer),b.bufferData(b.ARRAY_BUFFER,a.verticies,b.DYNAMIC_DRAW),b.bindBuffer(b.ARRAY_BUFFER,a._uvBuffer),b.bufferData(b.ARRAY_BUFFER,a.uvs,b.STATIC_DRAW),b.bindBuffer(b.ARRAY_BUFFER,a._colorBuffer),b.bufferData(b.ARRAY_BUFFER,a.colors,b.STATIC_DRAW),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,a._indexBuffer),b.bufferData(b.ELEMENT_ARRAY_BUFFER,a.indices,b.STATIC_DRAW)},WebGLRenderGroup.updateTexture=function(a,b){b._glTexture||(b._glTexture=a.createTexture()),b.hasLoaded&&(a.bindTexture(a.TEXTURE_2D,b._glTexture),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,b.source),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR),b._powerOf2?(a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.REPEAT),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.REPEAT)):(a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE)),a.bindTexture(a.TEXTURE_2D,null))},WebGLRenderGroup.destroyTexture=function(a,b){b._glTexture&&(b._glTexture=a.createTexture(),a.deleteTexture(a.TEXTURE_2D,b._glTexture))},WebGLRenderGroup.updateTextures=function(a){for(var b=0,c=globals.texturesToUpdate.length;c>b;b++)WebGLRenderGroup.updateTexture(a,globals.texturesToUpdate[b]);for(b=0,c=globals.texturesToDestroy.length;c>b;b++)WebGLRenderGroup.destroyTexture(a,globals.texturesToDestroy[b]);globals.texturesToUpdate=[],globals.texturesToDestroy=[]},module.exports=WebGLRenderGroup;
},{"../../core/globals":30,"../../display/Sprite":34,"../../extras/CustomRenderable":38,"../../extras/Strip":41,"../../extras/TilingSprite":42,"../../filters/FilterBlock":43,"../../geom/matrix":49,"../../primitives/Graphics":58,"./WebGLBatch":61,"./graphics":64}],63:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function WebGLRenderer(a,b,c,d,e){var f;this.transparent=!!d,this.width=a||800,this.height=b||600,this.view=c||platform.createCanvas(),this.view.width=this.width,this.view.height=this.height;var g=this;this.view.addEventListener("webglcontextlost",function(a){g.handleContextLost(a)},!1),this.view.addEventListener("webglcontextrestored",function(a){g.handleContextRestored(a)},!1),this.batchs=[];try{f=globals.gl=this.gl=this.view.getContext("experimental-webgl",{alpha:this.transparent,antialias:!!e,premultipliedAlpha:!1,stencil:!0})}catch(h){throw new Error(" This browser does not support webGL. Try using the canvas renderer"+this)}shaders.initPrimitiveShader(),shaders.initDefaultShader(),shaders.initDefaultStripShader(),shaders.activateDefaultShader(),this.batch=new WebGLBatch(f),f.disable(f.DEPTH_TEST),f.disable(f.CULL_FACE),f.enable(f.BLEND),f.colorMask(!0,!0,!0,this.transparent),this.projection=new Point(400,300),this.resize(this.width,this.height),this.contextLost=!1,this.stageRenderGroup=new WebGLRenderGroup(this.gl)}var platform=require("../../platform"),globals=require("../../core/globals"),shaders=require("./shaders"),WebGLBatch=require("./WebGLBatch"),WebGLRenderGroup=require("./WebGLRenderGroup"),Point=require("../../geom/Point"),Texture=require("../../textures/Texture"),proto=WebGLRenderer.prototype;proto.render=function(a){if(!this.contextLost){this.__stage!==a&&(this.__stage=a,this.stageRenderGroup.setRenderable(a));var b=this.gl;if(WebGLRenderGroup.updateTextures(b),globals.visibleCount++,a.updateTransform(),b.colorMask(!0,!0,!0,this.transparent),b.viewport(0,0,this.width,this.height),b.bindFramebuffer(b.FRAMEBUFFER,null),b.clearColor(a.backgroundColorSplit[0],a.backgroundColorSplit[1],a.backgroundColorSplit[2],!this.transparent),b.clear(b.COLOR_BUFFER_BIT),this.stageRenderGroup.render(this.projection),a.interactive&&(a._interactiveEventsAdded||(a._interactiveEventsAdded=!0,a.interactionManager.setTarget(this))),Texture.frameUpdates.length>0){for(var c=0,d=Texture.frameUpdates.length;d>c;c++)Texture.frameUpdates[c].updateFrame=!1;Texture.frameUpdates=[]}}},proto.resize=function(a,b){this.width=a,this.height=b,this.view.width=a,this.view.height=b,this.gl.viewport(0,0,this.width,this.height),this.projection.x=this.width/2,this.projection.y=this.height/2},proto.handleContextLost=function(a){a.preventDefault(),this.contextLost=!0},proto.handleContextRestored=function(){var a=this.gl=this.view.getContext("experimental-webgl",{alpha:!0});this.initShaders();for(var b in Texture.cache){var c=Texture.cache[b].baseTexture;c._glTexture=null,WebGLRenderGroup.updateTexture(a,c)}for(var d=0,e=this.batchs.length;e>d;d++)this.batchs[d].restoreLostContext(a),this.batchs[d].dirty=!0;WebGLBatch.restoreBatches(this.gl),this.contextLost=!1},module.exports=WebGLRenderer;
},{"../../core/globals":30,"../../geom/Point":46,"../../platform":57,"../../textures/Texture":70,"./WebGLBatch":61,"./WebGLRenderGroup":62,"./shaders":65}],64:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";var shaders=require("./shaders"),globals=require("../../core/globals"),mat3=require("../../geom/matrix").mat3,hex2rgb=require("../../utils/color").hex2rgb,triangulate=require("../../utils/Polyk").triangulate,Point=require("../../geom/Point"),Graphics=require("../../primitives/Graphics");exports.renderGraphics=function(a,b){var c=globals.gl;a._webGL||(a._webGL={points:[],indices:[],lastIndex:0,buffer:c.createBuffer(),indexBuffer:c.createBuffer()}),a.dirty&&(a.dirty=!1,a.clearDirty&&(a.clearDirty=!1,a._webGL.lastIndex=0,a._webGL.points=[],a._webGL.indices=[]),exports.updateGraphics(a)),shaders.activatePrimitiveShader();var d=mat3.clone(a.worldTransform);mat3.transpose(d),c.blendFunc(c.ONE,c.ONE_MINUS_SRC_ALPHA),c.uniformMatrix3fv(globals.primitiveProgram.translationMatrix,!1,d),c.uniform2f(globals.primitiveProgram.projectionVector,b.x,b.y),c.uniform1f(globals.primitiveProgram.alpha,a.worldAlpha),c.bindBuffer(c.ARRAY_BUFFER,a._webGL.buffer),c.vertexAttribPointer(globals.shaderProgram.vertexPositionAttribute,2,c.FLOAT,!1,0,0),c.vertexAttribPointer(globals.primitiveProgram.vertexPositionAttribute,2,c.FLOAT,!1,24,0),c.vertexAttribPointer(globals.primitiveProgram.colorAttribute,4,c.FLOAT,!1,24,8),c.bindBuffer(c.ELEMENT_ARRAY_BUFFER,a._webGL.indexBuffer),c.drawElements(c.TRIANGLE_STRIP,a._webGL.indices.length,c.UNSIGNED_SHORT,0),shaders.activateDefaultShader()},exports.updateGraphics=function(a){for(var b=a._webGL.lastIndex;b<a.graphicsData.length;b++){var c=a.graphicsData[b];c.type==Graphics.POLY?(c.fill&&c.points.length>3&&exports.buildPoly(c,a._webGL),c.lineWidth>0&&exports.buildLine(c,a._webGL)):c.type==Graphics.RECT?exports.buildRectangle(c,a._webGL):(c.type==Graphics.CIRC||c.type==Graphics.ELIP)&&exports.buildCircle(c,a._webGL)}a._webGL.lastIndex=a.graphicsData.length;var d=globals.gl;a._webGL.glPoints=new Float32Array(a._webGL.points),d.bindBuffer(d.ARRAY_BUFFER,a._webGL.buffer),d.bufferData(d.ARRAY_BUFFER,a._webGL.glPoints,d.STATIC_DRAW),a._webGL.glIndicies=new Uint16Array(a._webGL.indices),d.bindBuffer(d.ELEMENT_ARRAY_BUFFER,a._webGL.indexBuffer),d.bufferData(d.ELEMENT_ARRAY_BUFFER,a._webGL.glIndicies,d.STATIC_DRAW)},exports.buildRectangle=function(a,b){var c=a.points,d=c[0],e=c[1],f=c[2],g=c[3];if(a.fill){var h=hex2rgb(a.fillColor),i=a.fillAlpha,j=h[0]*i,k=h[1]*i,l=h[2]*i,m=b.points,n=b.indices,o=m.length/6;m.push(d,e),m.push(j,k,l,i),m.push(d+f,e),m.push(j,k,l,i),m.push(d,e+g),m.push(j,k,l,i),m.push(d+f,e+g),m.push(j,k,l,i),n.push(o,o,o+1,o+2,o+3,o+3)}a.lineWidth&&(a.points=[d,e,d+f,e,d+f,e+g,d,e+g,d,e],exports.buildLine(a,b))},exports.buildCircle=function(a,b){var c,d=a.points,e=d[0],f=d[1],g=d[2],h=d[3],i=40,j=2*Math.PI/i;if(a.fill){var k=hex2rgb(a.fillColor),l=a.fillAlpha,m=k[0]*l,n=k[1]*l,o=k[2]*l,p=b.points,q=b.indices,r=p.length/6;for(q.push(r),c=0;i+1>c;c++)p.push(e,f,m,n,o,l),p.push(e+Math.sin(j*c)*g,f+Math.cos(j*c)*h,m,n,o,l),q.push(r++,r++);q.push(r-1)}if(a.lineWidth){for(a.points=[],c=0;i+1>c;c++)a.points.push(e+Math.sin(j*c)*g,f+Math.cos(j*c)*h);exports.buildLine(a,b)}},exports.buildLine=function(a,b){var c=a.points;if(0!==c.length){var d=new Point(c[0],c[1]),e=new Point(c[c.length-2],c[c.length-1]);if(d.x==e.x&&d.y==e.y){c.pop(),c.pop(),e=new Point(c[c.length-2],c[c.length-1]);var f=e.x+.5*(d.x-e.x),g=e.y+.5*(d.y-e.y);c.unshift(f,g),c.push(f,g)}var h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E=b.points,F=b.indices,G=c.length/2,H=c.length,I=E.length/6,J=a.lineWidth/2,K=hex2rgb(a.lineColor),L=a.lineAlpha,M=K[0]*L,N=K[1]*L,O=K[2]*L;h=c[0],i=c[1],j=c[2],k=c[3],n=-(i-k),o=h-j,B=Math.sqrt(n*n+o*o),n/=B,o/=B,n*=J,o*=J,E.push(h-n,i-o,M,N,O,L),E.push(h+n,i+o,M,N,O,L);for(var P=1;G-1>P;P++)h=c[2*(P-1)],i=c[2*(P-1)+1],j=c[2*P],k=c[2*P+1],l=c[2*(P+1)],m=c[2*(P+1)+1],n=-(i-k),o=h-j,B=Math.sqrt(n*n+o*o),n/=B,o/=B,n*=J,o*=J,p=-(k-m),q=j-l,B=Math.sqrt(p*p+q*q),p/=B,q/=B,p*=J,q*=J,t=-o+i-(-o+k),u=-n+j-(-n+h),v=(-n+h)*(-o+k)-(-n+j)*(-o+i),w=-q+m-(-q+k),x=-p+j-(-p+l),y=(-p+l)*(-q+k)-(-p+j)*(-q+m),z=t*x-w*u,0===z&&(z+=1),C=(u*y-x*v)/z,D=(w*v-t*y)/z,A=(C-j)*(C-j)+(D-k)+(D-k),A>19600?(r=n-p,s=o-q,B=Math.sqrt(r*r+s*s),r/=B,s/=B,r*=J,s*=J,E.push(j-r,k-s),E.push(M,N,O,L),E.push(j+r,k+s),E.push(M,N,O,L),E.push(j-r,k-s),E.push(M,N,O,L),H++):(E.push(C,D),E.push(M,N,O,L),E.push(j-(C-j),k-(D-k)),E.push(M,N,O,L));for(h=c[2*(G-2)],i=c[2*(G-2)+1],j=c[2*(G-1)],k=c[2*(G-1)+1],n=-(i-k),o=h-j,B=Math.sqrt(n*n+o*o),n/=B,o/=B,n*=J,o*=J,E.push(j-n,k-o),E.push(M,N,O,L),E.push(j+n,k+o),E.push(M,N,O,L),F.push(I),P=0;H>P;P++)F.push(I++);F.push(I-1)}},exports.buildPoly=function(a,b){var c=a.points;if(!(c.length<6)){for(var d=b.points,e=b.indices,f=triangulate(c),g=d.length/6,h=0,i=f.length;i>h;h+=3)e.push(f[h]+g),e.push(f[h]+g),e.push(f[h+1]+g),e.push(f[h+2]+g),e.push(f[h+2]+g);var j=hex2rgb(a.fillColor),k=a.fillAlpha,l=j[0]*k,m=j[1]*k,n=j[2]*k;for(h=0,i=c.length/2;i>h;h++)d.push(c[2*h],c[2*h+1],l,m,n,k)}};
},{"../../core/globals":30,"../../geom/Point":46,"../../geom/matrix":49,"../../primitives/Graphics":58,"../../utils/Polyk":71,"../../utils/color":73,"./shaders":65}],65:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function compileShader(a,b,c){var d=a.createShader(c);return a.shaderSource(d,b),a.compileShader(d),a.getShaderParameter(d,a.COMPILE_STATUS)?d:(platform.console.error(a.getShaderInfoLog(d)),null)}function compileProgram(a,b){var c=globals.gl,d=compileShader(c,b,c.FRAGMENT_SHADER),e=compileShader(c,a,c.VERTEX_SHADER),f=c.createProgram();return c.attachShader(f,e),c.attachShader(f,d),c.linkProgram(f),c.getProgramParameter(f,c.LINK_STATUS)||platform.console.error("Could not initialise shaders"),f}var platform=require("../../platform"),globals=require("../../core/globals"),shaderFragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying float vColor;","uniform sampler2D uSampler;","void main(void) {","gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));","gl_FragColor = gl_FragColor * vColor;","}"].join("\n"),shaderVertexSrc=["attribute vec2 aVertexPosition;","attribute vec2 aTextureCoord;","attribute float aColor;","uniform vec2 projectionVector;","varying vec2 vTextureCoord;","varying float vColor;","void main(void) {","gl_Position = vec4( aVertexPosition.x / projectionVector.x -1.0, aVertexPosition.y / -projectionVector.y + 1.0 , 0.0, 1.0);","vTextureCoord = aTextureCoord;","vColor = aColor;","}"].join("\n"),stripShaderFragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying float vColor;","uniform float alpha;","uniform sampler2D uSampler;","void main(void) {","gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));","gl_FragColor = gl_FragColor * alpha;","}"].join("\n"),stripShaderVertexSrc=["attribute vec2 aVertexPosition;","attribute vec2 aTextureCoord;","attribute float aColor;","uniform mat3 translationMatrix;","uniform vec2 projectionVector;","varying vec2 vTextureCoord;","varying float vColor;","void main(void) {","vec3 v = translationMatrix * vec3(aVertexPosition, 1.0);","gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);","vTextureCoord = aTextureCoord;","vColor = aColor;","}"].join("\n"),primitiveShaderFragmentSrc=["precision mediump float;","varying vec4 vColor;","void main(void) {","gl_FragColor = vColor;","}"].join("\n"),primitiveShaderVertexSrc=["attribute vec2 aVertexPosition;","attribute vec4 aColor;","uniform mat3 translationMatrix;","uniform vec2 projectionVector;","uniform float alpha;","varying vec4 vColor;","void main(void) {","vec3 v = translationMatrix * vec3(aVertexPosition, 1.0);","gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);","vColor = aColor  * alpha;","}"].join("\n");exports.initDefaultShader=function(){var a=globals.gl,b=compileProgram(shaderVertexSrc,shaderFragmentSrc);a.useProgram(b),b.vertexPositionAttribute=a.getAttribLocation(b,"aVertexPosition"),b.projectionVector=a.getUniformLocation(b,"projectionVector"),b.textureCoordAttribute=a.getAttribLocation(b,"aTextureCoord"),b.colorAttribute=a.getAttribLocation(b,"aColor"),b.samplerUniform=a.getUniformLocation(b,"uSampler"),globals.shaderProgram=b},exports.initPrimitiveShader=function(){var a=globals.gl,b=compileProgram(primitiveShaderVertexSrc,primitiveShaderFragmentSrc);a.useProgram(b),b.vertexPositionAttribute=a.getAttribLocation(b,"aVertexPosition"),b.colorAttribute=a.getAttribLocation(b,"aColor"),b.projectionVector=a.getUniformLocation(b,"projectionVector"),b.translationMatrix=a.getUniformLocation(b,"translationMatrix"),b.alpha=a.getUniformLocation(b,"alpha"),globals.primitiveProgram=b},exports.initDefaultStripShader=function(){var a=globals.gl,b=compileProgram(stripShaderVertexSrc,stripShaderFragmentSrc);a.useProgram(b),b.vertexPositionAttribute=a.getAttribLocation(b,"aVertexPosition"),b.projectionVector=a.getUniformLocation(b,"projectionVector"),b.textureCoordAttribute=a.getAttribLocation(b,"aTextureCoord"),b.translationMatrix=a.getUniformLocation(b,"translationMatrix"),b.alpha=a.getUniformLocation(b,"alpha"),b.colorAttribute=a.getAttribLocation(b,"aColor"),b.projectionVector=a.getUniformLocation(b,"projectionVector"),b.samplerUniform=a.getUniformLocation(b,"uSampler"),globals.stripShaderProgram=b},exports.activateDefaultShader=function(){var a=globals.gl,b=globals.shaderProgram;a.useProgram(b),a.enableVertexAttribArray(b.vertexPositionAttribute),a.enableVertexAttribArray(b.textureCoordAttribute),a.enableVertexAttribArray(b.colorAttribute)},exports.activatePrimitiveShader=function(){var a=globals.gl;a.disableVertexAttribArray(globals.shaderProgram.textureCoordAttribute),a.disableVertexAttribArray(globals.shaderProgram.colorAttribute),a.useProgram(globals.primitiveProgram),a.enableVertexAttribArray(globals.primitiveProgram.vertexPositionAttribute),a.enableVertexAttribArray(globals.primitiveProgram.colorAttribute)};
},{"../../core/globals":30,"../../platform":57}],66:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function BitmapText(a,b){DisplayObjectContainer.call(this),this.setText(a),this.setStyle(b),this.updateText(),this.dirty=!1}var DisplayObjectContainer=require("../display/DisplayObjectContainer"),Sprite=require("../display/Sprite"),Point=require("../geom/Point"),proto=BitmapText.prototype=Object.create(DisplayObjectContainer.prototype,{constructor:{value:BitmapText}});proto.setText=function(a){this.text=a||" ",this.dirty=!0},proto.setStyle=function(a){a=a||{},a.align=a.align||"left",this.style=a;var b=a.font.split(" ");this.fontName=b[b.length-1],this.fontSize=b.length>=2?parseInt(b[b.length-2],10):BitmapText.fonts[this.fontName].size,this.dirty=!0},proto.updateText=function(){for(var a=BitmapText.fonts[this.fontName],b=new Point,c=null,d=[],e=0,f=[],g=0,h=this.fontSize/a.size,i=0;i<this.text.length;i++){var j=this.text.charCodeAt(i);if(/(?:\r\n|\r|\n)/.test(this.text.charAt(i)))f.push(b.x),e=Math.max(e,b.x),g++,b.x=0,b.y+=a.lineHeight,c=null;else{var k=a.chars[j];k&&(c&&k[c]&&(b.x+=k.kerning[c]),d.push({texture:k.texture,line:g,charCode:j,position:new Point(b.x+k.xOffset,b.y+k.yOffset)}),b.x+=k.xAdvance,c=j)}}f.push(b.x),e=Math.max(e,b.x);var l=[];for(i=0;g>=i;i++){var m=0;"right"==this.style.align?m=e-f[i]:"center"==this.style.align&&(m=(e-f[i])/2),l.push(m)}for(i=0;i<d.length;i++){var n=new Sprite(d[i].texture);n.position.x=(d[i].position.x+l[d[i].line])*h,n.position.y=d[i].position.y*h,n.scale.x=n.scale.y=h,this.addChild(n)}this.width=b.x*h,this.height=(b.y+a.lineHeight)*h},proto.updateTransform=function(){if(this.dirty){for(;this.children.length>0;)this.removeChild(this.getChildAt(0));this.updateText(),this.dirty=!1}DisplayObjectContainer.prototype.updateTransform.call(this)},BitmapText.fonts={},module.exports=BitmapText;
},{"../display/DisplayObjectContainer":32,"../display/Sprite":34,"../geom/Point":46}],67:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Text(a,b){this.canvas=platform.createCanvas(),this.context=this.canvas.getContext("2d"),Sprite.call(this,Texture.fromCanvas(this.canvas)),this.setText(a),this.setStyle(b),this.updateText(),this.dirty=!1}var platform=require("../platform"),globals=require("../core/globals"),Point=require("../geom/Point"),Sprite=require("../display/Sprite"),Texture=require("../textures/Texture"),proto=Text.prototype=Object.create(Sprite.prototype,{constructor:{value:Text}});proto.setStyle=function(a){a=a||{},a.font=a.font||"bold 20pt Arial",a.fill=a.fill||"black",a.align=a.align||"left",a.stroke=a.stroke||"black",a.strokeThickness=a.strokeThickness||0,a.wordWrap=a.wordWrap||!1,a.wordWrapWidth=a.wordWrapWidth||100,this.style=a,this.dirty=!0},proto.setText=function(a){this.text=a.toString()||" ",this.dirty=!0},proto.updateText=function(){this.context.font=this.style.font;var a=this.text;this.style.wordWrap&&(a=this.wordWrap(this.text));for(var b=a.split(/(?:\r\n|\r|\n)/),c=[],d=0,e=0;e<b.length;e++){var f=this.context.measureText(b[e]).width;c[e]=f,d=Math.max(d,f)}this.canvas.width=d+this.style.strokeThickness;var g=this.determineFontHeight("font: "+this.style.font+";")+this.style.strokeThickness;for(this.canvas.height=g*b.length,this.context.fillStyle=this.style.fill,this.context.font=this.style.font,this.context.strokeStyle=this.style.stroke,this.context.lineWidth=this.style.strokeThickness,this.context.textBaseline="top",e=0;e<b.length;e++){var h=new Point(this.style.strokeThickness/2,this.style.strokeThickness/2+e*g);"right"==this.style.align?h.x+=d-c[e]:"center"==this.style.align&&(h.x+=(d-c[e])/2),this.style.stroke&&this.style.strokeThickness&&this.context.strokeText(b[e],h.x,h.y),this.style.fill&&this.context.fillText(b[e],h.x,h.y)}this.updateTexture()},proto.updateTexture=function(){this.texture.baseTexture.width=this.canvas.width,this.texture.baseTexture.height=this.canvas.height,this.texture.frame.width=this.canvas.width,this.texture.frame.height=this.canvas.height,this._width=this.canvas.width,this._height=this.canvas.height,globals.texturesToUpdate.push(this.texture.baseTexture)},proto.updateTransform=function(){this.dirty&&(this.updateText(),this.dirty=!1),Sprite.prototype.updateTransform.call(this)},proto.determineFontHeight=function(a){var b=Text.heightCache[a];if(!b){var c=platform.document.getElementsByTagName("body")[0],d=platform.document.createElement("div"),e=platform.document.createTextNode("M");d.appendChild(e),d.setAttribute("style",a+";position:absolute;top:0;left:0"),c.appendChild(d),b=d.offsetHeight,Text.heightCache[a]=b,c.removeChild(d)}return b},proto.wordWrap=function(a){function b(a,c,d,e,f){var g=Math.floor((e-d)/2)+d;return g==d?1:a.measureText(c.substring(0,g)).width<=f?a.measureText(c.substring(0,g+1)).width>f?g:b(a,c,g,e,f):b(a,c,d,g,f)}function c(a,d,e){if(a.measureText(d).width<=e||d.length<1)return d;var f=b(a,d,0,d.length,e);return d.substring(0,f)+"\n"+c(a,d.substring(f),e)}for(var d="",e=a.split("\n"),f=0;f<e.length;f++)d+=c(this.context,e[f],this.style.wordWrapWidth)+"\n";return d},proto.destroy=function(a){a&&this.texture.destroy()},Text.heightCache={},module.exports=Text;
},{"../core/globals":30,"../display/Sprite":34,"../geom/Point":46,"../platform":57,"../textures/Texture":70}],68:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function BaseTexture(a){if(EventTarget.call(this),this.width=100,this.height=100,this.hasLoaded=!1,this.source=a,a){if("complete"in this.source)if(this.source.complete)this.hasLoaded=!0,this.width=this.source.width,this.height=this.source.height,globals.texturesToUpdate.push(this);else{var b=this;this.source.onload=function(){b.hasLoaded=!0,b.width=b.source.width,b.height=b.source.height,globals.texturesToUpdate.push(b),b.dispatchEvent({type:"loaded",content:b})}}else this.hasLoaded=!0,this.width=this.source.width,this.height=this.source.height,globals.texturesToUpdate.push(this);this._powerOf2=!1}}var platform=require("../platform"),globals=require("../core/globals"),EventTarget=require("../events/EventTarget"),baseTextureCache={},proto=BaseTexture.prototype;proto.destroy=function(){this.source.src&&(this.source.src=null),this.source=null,globals.texturesToDestroy.push(this)},BaseTexture.fromImage=function(a,b){var c=baseTextureCache[a];if(!c){var d=new platform.createImage;b&&(d.crossOrigin=""),d.src=a,c=new BaseTexture(d),baseTextureCache[a]=c}return c},module.exports=BaseTexture;
},{"../core/globals":30,"../events/EventTarget":37,"../platform":57}],69:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function RenderTexture(a,b){EventTarget.call(this),this.width=a||100,this.height=b||100,this.identityMatrix=mat3.create(),this.frame=new Rectangle(0,0,this.width,this.height),globals.gl?this.initWebGL():this.initCanvas()}var globals=require("../core/globals"),mat3=require("../geom/matrix").mat3,Texture=require("./Texture"),BaseTexture=require("./BaseTexture"),Point=require("../geom/Point"),Rectangle=require("../geom/Rectangle"),EventTarget=require("../events/EventTarget"),CanvasRenderer=require("../renderers/canvas/CanvasRenderer"),WebGLRenderGroup=require("../renderers/webgl/WebGLRenderGroup"),proto=RenderTexture.prototype=Object.create(Texture.prototype,{constructor:{value:RenderTexture}});proto.initWebGL=function(){var a=globals.gl;this.glFramebuffer=a.createFramebuffer(),a.bindFramebuffer(a.FRAMEBUFFER,this.glFramebuffer),this.glFramebuffer.width=this.width,this.glFramebuffer.height=this.height,this.baseTexture=new BaseTexture,this.baseTexture.width=this.width,this.baseTexture.height=this.height,this.baseTexture._glTexture=a.createTexture(),a.bindTexture(a.TEXTURE_2D,this.baseTexture._glTexture),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,this.width,this.height,0,a.RGBA,a.UNSIGNED_BYTE,null),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),this.baseTexture.isRender=!0,a.bindFramebuffer(a.FRAMEBUFFER,this.glFramebuffer),a.framebufferTexture2D(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,this.baseTexture._glTexture,0),this.projection=new Point(this.width/2,this.height/2),this.render=this.renderWebGL},proto.resize=function(a,b){if(this.width=a,this.height=b,globals.gl){this.projection.x=this.width/2,this.projection.y=this.height/2;var c=globals.gl;c.bindTexture(c.TEXTURE_2D,this.baseTexture._glTexture),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,this.width,this.height,0,c.RGBA,c.UNSIGNED_BYTE,null)}else this.frame.width=this.width,this.frame.height=this.height,this.renderer.resize(this.width,this.height)},proto.initCanvas=function(){this.renderer=new CanvasRenderer(this.width,this.height,null,0),this.baseTexture=new BaseTexture(this.renderer.view),this.frame=new Rectangle(0,0,this.width,this.height),this.render=this.renderCanvas},proto.renderWebGL=function(a,b,c){var d=globals.gl;d.colorMask(!0,!0,!0,!0),d.viewport(0,0,this.width,this.height),d.bindFramebuffer(d.FRAMEBUFFER,this.glFramebuffer),c&&(d.clearColor(0,0,0,0),d.clear(d.COLOR_BUFFER_BIT));var e=a.children,f=a.worldTransform;a.worldTransform=mat3.create(),a.worldTransform[4]=-1,a.worldTransform[5]=2*this.projection.y,b&&(a.worldTransform[2]=b.x,a.worldTransform[5]-=b.y),globals.visibleCount++,a.vcount=globals.visibleCount;for(var g=0,h=e.length;h>g;g++)e[g].updateTransform();var i=a.__renderGroup;i?a==i.root?i.render(this.projection):i.renderSpecific(a,this.projection):(this.renderGroup||(this.renderGroup=new WebGLRenderGroup(d)),this.renderGroup.setRenderable(a),this.renderGroup.render(this.projection)),a.worldTransform=f},proto.renderCanvas=function(a,b,c){var d=a.children;a.worldTransform=mat3.create(),b&&(a.worldTransform[2]=b.x,a.worldTransform[5]=b.y);for(var e=0,f=d.length;f>e;e++)d[e].updateTransform();c&&this.renderer.context.clearRect(0,0,this.width,this.height),this.renderer.renderDisplayObject(a),this.renderer.context.setTransform(1,0,0,1,0,0)},module.exports=RenderTexture;
},{"../core/globals":30,"../events/EventTarget":37,"../geom/Point":46,"../geom/Rectangle":48,"../geom/matrix":49,"../renderers/canvas/CanvasRenderer":59,"../renderers/webgl/WebGLRenderGroup":62,"./BaseTexture":68,"./Texture":70}],70:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function Texture(a,b){if(EventTarget.call(this),b||(this.noFrame=!0,b=new Rectangle(0,0,1,1)),a instanceof Texture&&(a=a.baseTexture),this.baseTexture=a,this.frame=b,this.trim=new Point,this.scope=this,a.hasLoaded)this.noFrame&&(b=new Rectangle(0,0,a.width,a.height)),this.setFrame(b);else{var c=this;a.addEventListener("loaded",function(){c.onBaseTextureLoaded()})}}var BaseTexture=require("./BaseTexture"),Point=require("../geom/Point"),Rectangle=require("../geom/Rectangle"),EventTarget=require("../events/EventTarget"),proto=Texture.prototype;proto.onBaseTextureLoaded=function(){var a=this.baseTexture;a.removeEventListener("loaded",this.onLoaded),this.noFrame&&(this.frame=new Rectangle(0,0,a.width,a.height)),this.noFrame=!1,this.width=this.frame.width,this.height=this.frame.height,this.scope.dispatchEvent({type:"update",content:this})},proto.destroy=function(a){a&&this.baseTexture.destroy()},proto.setFrame=function(a){if(this.frame=a,this.width=a.width,this.height=a.height,a.x+a.width>this.baseTexture.width||a.y+a.height>this.baseTexture.height)throw new Error("Texture Error: frame does not fit inside the base Texture dimensions "+this);this.updateFrame=!0,Texture.frameUpdates.push(this)},Texture.fromImage=function(a,b){var c=Texture.cache[a];return c||(c=new Texture(BaseTexture.fromImage(a,b)),Texture.cache[a]=c),c},Texture.fromFrame=function(a){var b=Texture.cache[a];if(!b)throw new Error("The frameId '"+a+"' does not exist in the texture cache "+this);return b},Texture.fromCanvas=function(a){var b=new BaseTexture(a);return new Texture(b)},Texture.addTextureToCache=function(a,b){Texture.cache[b]=a},Texture.removeTextureFromCache=function(a){var b=Texture.cache[a];return Texture.cache[a]=null,b},Texture.cache={},Texture.frameUpdates=[],module.exports=Texture;
},{"../events/EventTarget":37,"../geom/Point":46,"../geom/Rectangle":48,"./BaseTexture":68}],71:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";function pointInTriangle(a,b,c,d,e,f,g,h){var i=g-c,j=h-d,k=e-c,l=f-d,m=a-c,n=b-d,o=i*i+j*j,p=i*k+j*l,q=i*m+j*n,r=k*k+l*l,s=k*m+l*n,t=1/(o*r-p*p),u=(r*q-p*s)*t,v=(o*s-p*q)*t;return u>=0&&v>=0&&1>u+v}function convex(a,b,c,d,e,f,g){return(b-d)*(e-c)+(c-a)*(f-d)>=0==g}var platform=require("../platform");exports.triangulate=function(a){var b=!0,c=a.length>>1;if(3>c)return[];for(var d=[],e=[],f=0;c>f;f++)e.push(f);f=0;for(var g=c;g>3;){var h=e[(f+0)%g],i=e[(f+1)%g],j=e[(f+2)%g],k=a[2*h],l=a[2*h+1],m=a[2*i],n=a[2*i+1],o=a[2*j],p=a[2*j+1],q=!1;if(convex(k,l,m,n,o,p,b)){q=!0;for(var r=0;g>r;r++){var s=e[r];if(s!=h&&s!=i&&s!=j&&pointInTriangle(a[2*s],a[2*s+1],k,l,m,n,o,p)){q=!1;break}}}if(q)d.push(h,i,j),e.splice((f+1)%g,1),g--,f=0;else if(f++>3*g){if(!b)return platform.console.warn("PIXI Warning: shape too complex to fill"),[];for(d=[],e=[],f=0;c>f;f++)e.push(f);f=0,g=c,b=!1}}return d.push(e[0],e[1],e[2]),d};
},{"../platform":57}],72:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";var platform=require("../platform"),CanvasRenderer=require("../renderers/canvas/CanvasRenderer"),WebGLRenderer=require("../renderers/webgl/WebGLRenderer");module.exports=function(a,b,c,d,e){a||(a=800),b||(b=600);var f=function(){try{var a=platform.createCanvas();return!!platform.window.WebGLRenderingContext&&(a.getContext("webgl")||a.getContext("experimental-webgl"))}catch(b){return!1}}();return f?new WebGLRenderer(a,b,c,d,e):new CanvasRenderer(a,b,c,d)};
},{"../platform":57,"../renderers/canvas/CanvasRenderer":59,"../renderers/webgl/WebGLRenderer":63}],73:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";exports.hex2rgb=function(a){return[(a>>16&255)/255,(a>>8&255)/255,(255&a)/255]};
},{}],74:[function(require,module,exports){
/**
 * pixi 0.1.2
 * http://drkibitz.github.io/node-pixi/
 * Copyright (c) 2013 Dr. Kibitz, http://drkibitz.com
 * Super fast 2D rendering engine for browserify, that uses WebGL with a context 2d fallback.
 * built: Sat Dec 21 2013 22:57:53 GMT-0800 (PST)
 *
 * Pixi.js - v1.3.0
 * Copyright (c) 2012, Mat Groves
 */
"use strict";var spine=module.exports={};spine.BoneData=function(a,b){this.name=a,this.parent=b},spine.BoneData.prototype={length:0,x:0,y:0,rotation:0,scaleX:1,scaleY:1},spine.SlotData=function(a,b){this.name=a,this.boneData=b},spine.SlotData.prototype={r:1,g:1,b:1,a:1,attachmentName:null},spine.Bone=function(a,b){this.data=a,this.parent=b,this.setToSetupPose()},spine.Bone.yDown=!1,spine.Bone.prototype={x:0,y:0,rotation:0,scaleX:1,scaleY:1,m00:0,m01:0,worldX:0,m10:0,m11:0,worldY:0,worldRotation:0,worldScaleX:1,worldScaleY:1,updateWorldTransform:function(a,b){var c=this.parent;null!=c?(this.worldX=this.x*c.m00+this.y*c.m01+c.worldX,this.worldY=this.x*c.m10+this.y*c.m11+c.worldY,this.worldScaleX=c.worldScaleX*this.scaleX,this.worldScaleY=c.worldScaleY*this.scaleY,this.worldRotation=c.worldRotation+this.rotation):(this.worldX=this.x,this.worldY=this.y,this.worldScaleX=this.scaleX,this.worldScaleY=this.scaleY,this.worldRotation=this.rotation);var d=this.worldRotation*Math.PI/180,e=Math.cos(d),f=Math.sin(d);this.m00=e*this.worldScaleX,this.m10=f*this.worldScaleX,this.m01=-f*this.worldScaleY,this.m11=e*this.worldScaleY,a&&(this.m00=-this.m00,this.m01=-this.m01),b&&(this.m10=-this.m10,this.m11=-this.m11),spine.Bone.yDown&&(this.m10=-this.m10,this.m11=-this.m11)},setToSetupPose:function(){var a=this.data;this.x=a.x,this.y=a.y,this.rotation=a.rotation,this.scaleX=a.scaleX,this.scaleY=a.scaleY}},spine.Slot=function(a,b,c){this.data=a,this.skeleton=b,this.bone=c,this.setToSetupPose()},spine.Slot.prototype={r:1,g:1,b:1,a:1,_attachmentTime:0,attachment:null,setAttachment:function(a){this.attachment=a,this._attachmentTime=this.skeleton.time},setAttachmentTime:function(a){this._attachmentTime=this.skeleton.time-a},getAttachmentTime:function(){return this.skeleton.time-this._attachmentTime},setToSetupPose:function(){var a=this.data;this.r=a.r,this.g=a.g,this.b=a.b,this.a=a.a;for(var b=this.skeleton.data.slots,c=0,d=b.length;d>c;c++)if(b[c]==a){this.setAttachment(a.attachmentName?this.skeleton.getAttachmentBySlotIndex(c,a.attachmentName):null);break}}},spine.Skin=function(a){this.name=a,this.attachments={}},spine.Skin.prototype={addAttachment:function(a,b,c){this.attachments[a+":"+b]=c},getAttachment:function(a,b){return this.attachments[a+":"+b]},_attachAll:function(a,b){for(var c in b.attachments){var d=c.indexOf(":"),e=parseInt(c.substring(0,d),10),f=c.substring(d+1),g=a.slots[e];if(g.attachment&&g.attachment.name==f){var h=this.getAttachment(e,f);h&&g.setAttachment(h)}}}},spine.Animation=function(a,b,c){this.name=a,this.timelines=b,this.duration=c},spine.Animation.prototype={apply:function(a,b,c){c&&this.duration&&(b%=this.duration);for(var d=this.timelines,e=0,f=d.length;f>e;e++)d[e].apply(a,b,1)},mix:function(a,b,c,d){c&&this.duration&&(b%=this.duration);for(var e=this.timelines,f=0,g=e.length;g>f;f++)e[f].apply(a,b,d)}},spine.binarySearch=function(a,b,c){var d=0,e=Math.floor(a.length/c)-2;if(!e)return c;for(var f=e>>>1;;){if(a[(f+1)*c]<=b?d=f+1:e=f,d==e)return(d+1)*c;f=d+e>>>1}},spine.linearSearch=function(a,b,c){for(var d=0,e=a.length-c;e>=d;d+=c)if(a[d]>b)return d;return-1},spine.Curves=function(a){this.curves=[],this.curves.length=6*(a-1)},spine.Curves.prototype={setLinear:function(a){this.curves[6*a]=0},setStepped:function(a){this.curves[6*a]=-1},setCurve:function(a,b,c,d,e){var f=.1,g=f*f,h=g*f,i=3*f,j=3*g,k=6*g,l=6*h,m=2*-b+d,n=2*-c+e,o=3*(b-d)+1,p=3*(c-e)+1,q=6*a,r=this.curves;r[q]=b*i+m*j+o*h,r[q+1]=c*i+n*j+p*h,r[q+2]=m*k+o*l,r[q+3]=n*k+p*l,r[q+4]=o*l,r[q+5]=p*l},getCurvePercent:function(a,b){b=0>b?0:b>1?1:b;var c=6*a,d=this.curves,e=d[c];if(!e)return b;if(-1==e)return 0;for(var f=d[c+1],g=d[c+2],h=d[c+3],i=d[c+4],j=d[c+5],k=e,l=f,m=8;;){if(k>=b){var n=k-e,o=l-f;return o+(l-o)*(b-n)/(k-n)}if(!m)break;m--,e+=g,f+=h,g+=i,h+=j,k+=e,l+=f}return l+(1-l)*(b-k)/(1-k)}},spine.RotateTimeline=function(a){this.curves=new spine.Curves(a),this.frames=[],this.frames.length=2*a},spine.RotateTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/2},setFrame:function(a,b,c){a*=2,this.frames[a]=b,this.frames[a+1]=c},apply:function(a,b,c){var d,e=this.frames;if(!(b<e[0])){var f=a.bones[this.boneIndex];if(b>=e[e.length-2]){for(d=f.data.rotation+e[e.length-1]-f.rotation;d>180;)d-=360;for(;-180>d;)d+=360;return f.rotation+=d*c,void 0}var g=spine.binarySearch(e,b,2),h=e[g-1],i=e[g],j=1-(b-i)/(e[g-2]-i);for(j=this.curves.getCurvePercent(g/2-1,j),d=e[g+1]-h;d>180;)d-=360;for(;-180>d;)d+=360;for(d=f.data.rotation+(h+d*j)-f.rotation;d>180;)d-=360;for(;-180>d;)d+=360;f.rotation+=d*c}}},spine.TranslateTimeline=function(a){this.curves=new spine.Curves(a),this.frames=[],this.frames.length=3*a},spine.TranslateTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/3},setFrame:function(a,b,c,d){a*=3,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d},apply:function(a,b,c){var d=this.frames;if(!(b<d[0])){var e=a.bones[this.boneIndex];if(b>=d[d.length-3])return e.x+=(e.data.x+d[d.length-2]-e.x)*c,e.y+=(e.data.y+d[d.length-1]-e.y)*c,void 0;var f=spine.binarySearch(d,b,3),g=d[f-2],h=d[f-1],i=d[f],j=1-(b-i)/(d[f+-3]-i);j=this.curves.getCurvePercent(f/3-1,j),e.x+=(e.data.x+g+(d[f+1]-g)*j-e.x)*c,e.y+=(e.data.y+h+(d[f+2]-h)*j-e.y)*c}}},spine.ScaleTimeline=function(a){this.curves=new spine.Curves(a),this.frames=[],this.frames.length=3*a},spine.ScaleTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/3},setFrame:function(a,b,c,d){a*=3,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d},apply:function(a,b,c){var d=this.frames;if(!(b<d[0])){var e=a.bones[this.boneIndex];if(b>=d[d.length-3])return e.scaleX+=(e.data.scaleX-1+d[d.length-2]-e.scaleX)*c,e.scaleY+=(e.data.scaleY-1+d[d.length-1]-e.scaleY)*c,void 0;var f=spine.binarySearch(d,b,3),g=d[f-2],h=d[f-1],i=d[f],j=1-(b-i)/(d[f+-3]-i);j=this.curves.getCurvePercent(f/3-1,j),e.scaleX+=(e.data.scaleX-1+g+(d[f+1]-g)*j-e.scaleX)*c,e.scaleY+=(e.data.scaleY-1+h+(d[f+2]-h)*j-e.scaleY)*c}}},spine.ColorTimeline=function(a){this.curves=new spine.Curves(a),this.frames=[],this.frames.length=5*a},spine.ColorTimeline.prototype={slotIndex:0,getFrameCount:function(){return this.frames.length/2},setFrame:function(a,b,c,d,e,f){a*=5,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d,this.frames[a+3]=e,this.frames[a+4]=f},apply:function(a,b,c){var d=this.frames;if(!(b<d[0])){var e=a.slots[this.slotIndex];if(b>=d[d.length-5]){var f=d.length-1;return e.r=d[f-3],e.g=d[f-2],e.b=d[f-1],e.a=d[f],void 0}var g=spine.binarySearch(d,b,5),h=d[g-4],i=d[g-3],j=d[g-2],k=d[g-1],l=d[g],m=1-(b-l)/(d[g-5]-l);m=this.curves.getCurvePercent(g/5-1,m);var n=h+(d[g+1]-h)*m,o=i+(d[g+2]-i)*m,p=j+(d[g+3]-j)*m,q=k+(d[g+4]-k)*m;1>c?(e.r+=(n-e.r)*c,e.g+=(o-e.g)*c,e.b+=(p-e.b)*c,e.a+=(q-e.a)*c):(e.r=n,e.g=o,e.b=p,e.a=q)}}},spine.AttachmentTimeline=function(a){this.curves=new spine.Curves(a),this.frames=[],this.frames.length=a,this.attachmentNames=[],this.attachmentNames.length=a},spine.AttachmentTimeline.prototype={slotIndex:0,getFrameCount:function(){return this.frames.length},setFrame:function(a,b,c){this.frames[a]=b,this.attachmentNames[a]=c},apply:function(a,b){var c=this.frames;if(!(b<c[0])){var d;d=b>=c[c.length-1]?c.length-1:spine.binarySearch(c,b,1)-1;var e=this.attachmentNames[d];a.slots[this.slotIndex].setAttachment(e?a.getAttachmentBySlotIndex(this.slotIndex,e):null)}}},spine.SkeletonData=function(){this.bones=[],this.slots=[],this.skins=[],this.animations=[]},spine.SkeletonData.prototype={defaultSkin:null,findBone:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},findBoneIndex:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].name==a)return c;return-1},findSlot:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},findSlotIndex:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].name==a)return c;return-1},findSkin:function(a){for(var b=this.skins,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},findAnimation:function(a){for(var b=this.animations,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null}},spine.Skeleton=function(a){this.data=a,this.bones=[];for(var b=0,c=a.bones.length;c>b;b++){var d=a.bones[b],e=d.parent?this.bones[a.bones.indexOf(d.parent)]:null;this.bones.push(new spine.Bone(d,e))}for(this.slots=[],this.drawOrder=[],b=0,c=a.slots.length;c>b;b++){var f=a.slots[b],g=this.bones[a.bones.indexOf(f.boneData)],h=new spine.Slot(f,this,g);this.slots.push(h),this.drawOrder.push(h)}},spine.Skeleton.prototype={x:0,y:0,skin:null,r:1,g:1,b:1,a:1,time:0,flipX:!1,flipY:!1,updateWorldTransform:function(){for(var a=this.flipX,b=this.flipY,c=this.bones,d=0,e=c.length;e>d;d++)c[d].updateWorldTransform(a,b)},setToSetupPose:function(){this.setBonesToSetupPose(),this.setSlotsToSetupPose()},setBonesToSetupPose:function(){for(var a=this.bones,b=0,c=a.length;c>b;b++)a[b].setToSetupPose()},setSlotsToSetupPose:function(){for(var a=this.slots,b=0,c=a.length;c>b;b++)a[b].setToSetupPose(b)},getRootBone:function(){return this.bones.length?this.bones[0]:null},findBone:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return b[c];return null},findBoneIndex:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return c;return-1},findSlot:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return b[c];return null},findSlotIndex:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return c;return-1},setSkinByName:function(a){var b=this.data.findSkin(a);if(!b)throw"Skin not found: "+a;this.setSkin(b)},setSkin:function(a){this.skin&&a&&a._attachAll(this,this.skin),this.skin=a},getAttachmentBySlotName:function(a,b){return this.getAttachmentBySlotIndex(this.data.findSlotIndex(a),b)},getAttachmentBySlotIndex:function(a,b){if(this.skin){var c=this.skin.getAttachment(a,b);if(c)return c}return this.data.defaultSkin?this.data.defaultSkin.getAttachment(a,b):null},setAttachment:function(a,b){for(var c=this.slots,d=0,e=c.size;e>d;d++){var f=c[d];if(f.data.name==a){var g=null;if(b&&(g=this.getAttachment(d,b),null==g))throw"Attachment not found: "+b+", for slot: "+a;return f.setAttachment(g),void 0}}throw"Slot not found: "+a},update:function(a){this.time+=a}},spine.AttachmentType={region:0},spine.RegionAttachment=function(){this.offset=[],this.offset.length=8,this.uvs=[],this.uvs.length=8},spine.RegionAttachment.prototype={x:0,y:0,rotation:0,scaleX:1,scaleY:1,width:0,height:0,rendererObject:null,regionOffsetX:0,regionOffsetY:0,regionWidth:0,regionHeight:0,regionOriginalWidth:0,regionOriginalHeight:0,setUVs:function(a,b,c,d,e){var f=this.uvs;e?(f[2]=a,f[3]=d,f[4]=a,f[5]=b,f[6]=c,f[7]=b,f[0]=c,f[1]=d):(f[0]=a,f[1]=d,f[2]=a,f[3]=b,f[4]=c,f[5]=b,f[6]=c,f[7]=d)},updateOffset:function(){var a=this.width/this.regionOriginalWidth*this.scaleX,b=this.height/this.regionOriginalHeight*this.scaleY,c=-this.width/2*this.scaleX+this.regionOffsetX*a,d=-this.height/2*this.scaleY+this.regionOffsetY*b,e=c+this.regionWidth*a,f=d+this.regionHeight*b,g=this.rotation*Math.PI/180,h=Math.cos(g),i=Math.sin(g),j=c*h+this.x,k=c*i,l=d*h+this.y,m=d*i,n=e*h+this.x,o=e*i,p=f*h+this.y,q=f*i,r=this.offset;r[0]=j-m,r[1]=l+k,r[2]=j-q,r[3]=p+k,r[4]=n-q,r[5]=p+o,r[6]=n-m,r[7]=l+o},computeVertices:function(a,b,c,d){a+=c.worldX,b+=c.worldY;var e=c.m00,f=c.m01,g=c.m10,h=c.m11,i=this.offset;d[0]=i[0]*e+i[1]*f+a,d[1]=i[0]*g+i[1]*h+b,d[2]=i[2]*e+i[3]*f+a,d[3]=i[2]*g+i[3]*h+b,d[4]=i[4]*e+i[5]*f+a,d[5]=i[4]*g+i[5]*h+b,d[6]=i[6]*e+i[7]*f+a,d[7]=i[6]*g+i[7]*h+b}},spine.AnimationStateData=function(a){this.skeletonData=a,this.animationToMixTime={}},spine.AnimationStateData.prototype={defaultMix:0,setMixByName:function(a,b,c){var d=this.skeletonData.findAnimation(a);if(!d)throw"Animation not found: "+a;var e=this.skeletonData.findAnimation(b);if(!e)throw"Animation not found: "+b;this.setMix(d,e,c)},setMix:function(a,b,c){this.animationToMixTime[a.name+":"+b.name]=c},getMix:function(a,b){var c=this.animationToMixTime[a.name+":"+b.name];return c?c:this.defaultMix}},spine.AnimationState=function(a){this.data=a,this.queue=[]},spine.AnimationState.prototype={current:null,previous:null,currentTime:0,previousTime:0,currentLoop:!1,previousLoop:!1,mixTime:0,mixDuration:0,update:function(a){if(this.currentTime+=a,this.previousTime+=a,this.mixTime+=a,this.queue.length>0){var b=this.queue[0];this.currentTime>=b.delay&&(this._setAnimation(b.animation,b.loop),this.queue.shift())}},apply:function(a){if(this.current)if(this.previous){this.previous.apply(a,this.previousTime,this.previousLoop);var b=this.mixTime/this.mixDuration;b>=1&&(b=1,this.previous=null),this.current.mix(a,this.currentTime,this.currentLoop,b)}else this.current.apply(a,this.currentTime,this.currentLoop)},clearAnimation:function(){this.previous=null,this.current=null,this.queue.length=0},_setAnimation:function(a,b){this.previous=null,a&&this.current&&(this.mixDuration=this.data.getMix(this.current,a),this.mixDuration>0&&(this.mixTime=0,this.previous=this.current,this.previousTime=this.currentTime,this.previousLoop=this.currentLoop)),this.current=a,this.currentLoop=b,this.currentTime=0},setAnimationByName:function(a,b){var c=this.data.skeletonData.findAnimation(a);if(!c)throw"Animation not found: "+a;this.setAnimation(c,b)},setAnimation:function(a,b){this.queue.length=0,this._setAnimation(a,b)},addAnimationByName:function(a,b,c){var d=this.data.skeletonData.findAnimation(a);if(!d)throw"Animation not found: "+a;this.addAnimation(d,b,c)},addAnimation:function(a,b,c){var d={};if(d.animation=a,d.loop=b,!c||0>=c){var e=this.queue.length?this.queue[this.queue.length-1].animation:this.current;c=null!=e?e.duration-this.data.getMix(e,a)+(c||0):0}d.delay=c,this.queue.push(d)},isComplete:function(){return!this.current||this.currentTime>=this.current.duration}},spine.SkeletonJson=function(a){this.attachmentLoader=a},spine.SkeletonJson.prototype={scale:1,readSkeletonData:function(a){for(var b,c=new spine.SkeletonData,d=a.bones,e=0,f=d.length;f>e;e++){var g=d[e],h=null;if(g.parent&&(h=c.findBone(g.parent),!h))throw"Parent bone not found: "+g.parent;b=new spine.BoneData(g.name,h),b.length=(g.length||0)*this.scale,b.x=(g.x||0)*this.scale,b.y=(g.y||0)*this.scale,b.rotation=g.rotation||0,b.scaleX=g.scaleX||1,b.scaleY=g.scaleY||1,c.bones.push(b)}var i=a.slots;for(e=0,f=i.length;f>e;e++){var j=i[e];if(b=c.findBone(j.bone),!b)throw"Slot bone not found: "+j.bone;var k=new spine.SlotData(j.name,b),l=j.color;l&&(k.r=spine.SkeletonJson.toColor(l,0),k.g=spine.SkeletonJson.toColor(l,1),k.b=spine.SkeletonJson.toColor(l,2),k.a=spine.SkeletonJson.toColor(l,3)),k.attachmentName=j.attachment,c.slots.push(k)}var m=a.skins;for(var n in m)if(m.hasOwnProperty(n)){var o=m[n],p=new spine.Skin(n);for(var q in o)if(o.hasOwnProperty(q)){var r=c.findSlotIndex(q),s=o[q];for(var t in s)if(s.hasOwnProperty(t)){var u=this.readAttachment(p,t,s[t]);null!=u&&p.addAttachment(r,t,u)}}c.skins.push(p),"default"==p.name&&(c.defaultSkin=p)}var v=a.animations;for(var w in v)v.hasOwnProperty(w)&&this.readAnimation(w,v[w],c);return c},readAttachment:function(a,b,c){b=c.name||b;var d=spine.AttachmentType[c.type||"region"];if(d==spine.AttachmentType.region){var e=new spine.RegionAttachment;return e.x=(c.x||0)*this.scale,e.y=(c.y||0)*this.scale,e.scaleX=c.scaleX||1,e.scaleY=c.scaleY||1,e.rotation=c.rotation||0,e.width=(c.width||32)*this.scale,e.height=(c.height||32)*this.scale,e.updateOffset(),e.rendererObject={},e.rendererObject.name=b,e.rendererObject.scale={},e.rendererObject.scale.x=e.scaleX,e.rendererObject.scale.y=e.scaleY,e.rendererObject.rotation=-e.rotation*Math.PI/180,e}throw"Unknown attachment type: "+d},readAnimation:function(a,b,c){var d,e,f,g,h,i,j,k=[],l=0,m=b.bones;for(var n in m)if(m.hasOwnProperty(n)){var o=c.findBoneIndex(n);if(-1==o)throw"Bone not found: "+n;var p=m[n];for(f in p)if(p.hasOwnProperty(f))if(h=p[f],"rotate"==f){for(e=new spine.RotateTimeline(h.length),e.boneIndex=o,d=0,i=0,j=h.length;j>i;i++)g=h[i],e.setFrame(d,g.time,g.angle),spine.SkeletonJson.readCurve(e,d,g),d++;k.push(e),l=Math.max(l,e.frames[2*e.getFrameCount()-2])}else{if("translate"!=f&&"scale"!=f)throw"Invalid timeline type for a bone: "+f+" ("+n+")";var q=1;for("scale"==f?e=new spine.ScaleTimeline(h.length):(e=new spine.TranslateTimeline(h.length),q=this.scale),e.boneIndex=o,d=0,i=0,j=h.length;j>i;i++){g=h[i];var r=(g.x||0)*q,s=(g.y||0)*q;e.setFrame(d,g.time,r,s),spine.SkeletonJson.readCurve(e,d,g),d++}k.push(e),l=Math.max(l,e.frames[3*e.getFrameCount()-3])}}var t=b.slots;for(var u in t)if(t.hasOwnProperty(u)){var v=t[u],w=c.findSlotIndex(u);for(f in v)if(v.hasOwnProperty(f))if(h=v[f],"color"==f){for(e=new spine.ColorTimeline(h.length),e.slotIndex=w,d=0,i=0,j=h.length;j>i;i++){g=h[i];var x=g.color,y=spine.SkeletonJson.toColor(x,0),z=spine.SkeletonJson.toColor(x,1),A=spine.SkeletonJson.toColor(x,2),B=spine.SkeletonJson.toColor(x,3);e.setFrame(d,g.time,y,z,A,B),spine.SkeletonJson.readCurve(e,d,g),d++}k.push(e),l=Math.max(l,e.frames[5*e.getFrameCount()-5])}else{if("attachment"!=f)throw"Invalid timeline type for a slot: "+f+" ("+u+")";for(e=new spine.AttachmentTimeline(h.length),e.slotIndex=w,d=0,i=0,j=h.length;j>i;i++)g=h[i],e.setFrame(d++,g.time,g.name);k.push(e),l=Math.max(l,e.frames[e.getFrameCount()-1])}}c.animations.push(new spine.Animation(a,k,l))}},spine.SkeletonJson.readCurve=function(a,b,c){var d=c.curve;d&&("stepped"==d?a.curves.setStepped(b):d instanceof Array&&a.curves.setCurve(b,d[0],d[1],d[2],d[3]))},spine.SkeletonJson.toColor=function(a,b){if(8!=a.length)throw"Color hexidecimal length must be 8, recieved: "+a;return parseInt(a.substring(2*b,2),16)/255},spine.Atlas=function(a,b){this.textureLoader=b,this.pages=[],this.regions=[];var c=new spine.AtlasReader(a),d=[];d.length=4;for(var e=null;;){var f=c.readLine();if(null==f)break;if(f=c.trim(f),f.length)if(e){var g=new spine.AtlasRegion;g.name=f,g.page=e,g.rotate="true"==c.readValue(),c.readTuple(d);var h=parseInt(d[0],10),i=parseInt(d[1],10);c.readTuple(d);var j=parseInt(d[0],10),k=parseInt(d[1],10);g.u=h/e.width,g.v=i/e.height,g.rotate?(g.u2=(h+k)/e.width,g.v2=(i+j)/e.height):(g.u2=(h+j)/e.width,g.v2=(i+k)/e.height),g.x=h,g.y=i,g.width=Math.abs(j),g.height=Math.abs(k),4==c.readTuple(d)&&(g.splits=[parseInt(d[0],10),parseInt(d[1],10),parseInt(d[2],10),parseInt(d[3],10)],4==c.readTuple(d)&&(g.pads=[parseInt(d[0],10),parseInt(d[1],10),parseInt(d[2],10),parseInt(d[3],10)],c.readTuple(d))),g.originalWidth=parseInt(d[0],10),g.originalHeight=parseInt(d[1],10),c.readTuple(d),g.offsetX=parseInt(d[0],10),g.offsetY=parseInt(d[1],10),g.index=parseInt(c.readValue(),10),this.regions.push(g)}else{e=new spine.AtlasPage,e.name=f,e.format=spine.Atlas.Format[c.readValue()],c.readTuple(d),e.minFilter=spine.Atlas.TextureFilter[d[0]],e.magFilter=spine.Atlas.TextureFilter[d[1]];var l=c.readValue();e.uWrap=spine.Atlas.TextureWrap.clampToEdge,e.vWrap=spine.Atlas.TextureWrap.clampToEdge,"x"==l?e.uWrap=spine.Atlas.TextureWrap.repeat:"y"==l?e.vWrap=spine.Atlas.TextureWrap.repeat:"xy"==l&&(e.uWrap=e.vWrap=spine.Atlas.TextureWrap.repeat),b.load(e,f),this.pages.push(e)}else e=null}},spine.Atlas.prototype={findRegion:function(a){for(var b=this.regions,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},dispose:function(){for(var a=this.pages,b=0,c=a.length;c>b;b++)this.textureLoader.unload(a[b].rendererObject)},updateUVs:function(a){for(var b=this.regions,c=0,d=b.length;d>c;c++){var e=b[c];e.page==a&&(e.u=e.x/a.width,e.v=e.y/a.height,e.rotate?(e.u2=(e.x+e.height)/a.width,e.v2=(e.y+e.width)/a.height):(e.u2=(e.x+e.width)/a.width,e.v2=(e.y+e.height)/a.height))}}},spine.Atlas.Format={alpha:0,intensity:1,luminanceAlpha:2,rgb565:3,rgba4444:4,rgb888:5,rgba8888:6},spine.Atlas.TextureFilter={nearest:0,linear:1,mipMap:2,mipMapNearestNearest:3,mipMapLinearNearest:4,mipMapNearestLinear:5,mipMapLinearLinear:6},spine.Atlas.TextureWrap={mirroredRepeat:0,clampToEdge:1,repeat:2},spine.AtlasPage=function(){},spine.AtlasPage.prototype={name:null,format:null,minFilter:null,magFilter:null,uWrap:null,vWrap:null,rendererObject:null,width:0,height:0},spine.AtlasRegion=function(){},spine.AtlasRegion.prototype={page:null,name:null,x:0,y:0,width:0,height:0,u:0,v:0,u2:0,v2:0,offsetX:0,offsetY:0,originalWidth:0,originalHeight:0,index:0,rotate:!1,splits:null,pads:null},spine.AtlasReader=function(a){this.lines=a.split(/\r\n|\r|\n/)},spine.AtlasReader.prototype={index:0,trim:function(a){return a.replace(/^\s+|\s+$/g,"")},readLine:function(){return this.index>=this.lines.length?null:this.lines[this.index++]},readValue:function(){var a=this.readLine(),b=a.indexOf(":");if(-1==b)throw"Invalid line: "+a;return this.trim(a.substring(b+1))},readTuple:function(a){var b=this.readLine(),c=b.indexOf(":");if(-1==c)throw"Invalid line: "+b;for(var d=0,e=c+1;3>d;d++){var f=b.indexOf(",",e);if(-1==f){if(!d)throw"Invalid line: "+b;break}a[d]=this.trim(b.substr(e,f-e)),e=f+1}return a[d]=this.trim(b.substring(e)),d+1}},spine.AtlasAttachmentLoader=function(a){this.atlas=a},spine.AtlasAttachmentLoader.prototype={newAttachment:function(a,b,c){switch(b){case spine.AttachmentType.region:var d=this.atlas.findRegion(c);if(!d)throw"Region not found in atlas: "+c+" ("+b+")";var e=new spine.RegionAttachment(c);return e.rendererObject=d,e.setUVs(d.u,d.v,d.u2,d.v2,d.rotate),e.regionOffsetX=d.offsetX,e.regionOffsetY=d.offsetY,e.regionWidth=d.width,e.regionHeight=d.height,e.regionOriginalWidth=d.originalWidth,e.regionOriginalHeight=d.originalHeight,e}throw"Unknown attachment type: "+b}},spine.Bone.yDown=!0;
},{}],75:[function(require,module,exports){

var pixi = require('pixi'),
    config = require('./config'),
    parseOctal = require('./utils').parseOctal,
    Arena;

Arena = function (game) {
    this.game = game;
    this.linesColor = config.LINES_COLOR;

    this.drawLines();
    this.bind();
};

Arena.prototype.bind = function () {
    var self = this;

    this.game.on('resize', function () {
        self.resize();
    });

    this.game.on('setLinesColor', function (color) {
        self.setLinesColor(color);
    });
};

Arena.prototype.setLinesColor = function (color) {
    this.linesColor = parseOctal(color);
    this.updateLines();
};

Arena.prototype.getLinePositions = function () {
    return [
        config.LINES_DISTANCE,
        this.game.renderer.width / 2,
        this.game.renderer.width - config.LINES_DISTANCE
    ];
};

Arena.prototype.drawLines = function () {
    var positions = this.getLinePositions();

    this.lines = [];

    for (var i = 0; i < positions.length; i += 1) {
        this.lines[i] = new pixi.Graphics();
        this.game.stage.addChild(this.lines[i]);
    }
};

Arena.prototype.updateLines = function () {
    var positions = this.getLinePositions();

    for (var i = 0; i < positions.length; i += 1) {
        this.lines[i].clear();
        this.lines[i].beginFill(this.linesColor, 1);
        this.lines[i].drawRect(0, 0, 1, this.game.renderer.height);
        this.lines[i].endFill();
        this.lines[i].position.x = positions[i];
    }
};

Arena.prototype.resize = function () {
    this.updateLines();
};

module.exports = Arena;

},{"./config":84,"./utils":86,"pixi":50}],76:[function(require,module,exports){
 
var pixi = require('pixi'),
    geometry = require('geometry'),
    config = require('./config'),
    parseOctal = require('./utils').parseOctal,
    Ball;

Ball = function (game, options) {
    if (!options) {
        options = {};
    }

    this.game =  game;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.size = options.size || config.BALL_SIZE;
    this.setSpeed(options.speed || config.BALL_SPEED);
    this.setVelocity(options.velocity || [config.BALL_SPEED, config.BALL_SPEED]);
    this.lastUpdate = new Date().getTime();
    this.removed = false;
    this.color = parseOctal(options.color) || config.BALL_COLOR;

    this.graphics = new pixi.Graphics();

    if (options.image) {
        this.setImage(options.image);
    }

    this.render();
    this.bind();
};

Ball.prototype.bind = function () {
    var self = this;

    this.game.on('update', function () {
        if (!self.removed) {
            self.update();
        }
    });

    this.game.on('resize', function () {
        if (!self.removed) {
            self.updatePosition();
        }
    });

    this.game.on('setBallColor', function (color) {
        if (!self.removed) {
            self.setColor(color);
        }
    });

    this.game.on('setBallImage', function (image) {
        if (!self.removed) {
            self.setImage(image);
        }
    });

    this.game.on('setBallSize', function (size) {
        if (!self.removed) {
            self.setSize(size);
        }
    });

    this.game.on('setBallSpeed', function (speed) {
        if (!self.removed) {
            self.setSpeed(speed);
        }
    });

    this.game.on('setBallVelocity', function (velocity) {
        if(!self.removed) {
            self.setVelocity(velocity);
        }
    });

    this.game.on('resume', function () {
        if (!self.removed) {
            self.lastUpdate = new Date().getTime();
        }
    });
};

Ball.prototype.render = function () {
    if (this.sprite) {
        this.graphics.removeChild(this.sprite);
    }

    if (this.image) {
        this.sprite = pixi.Sprite.fromImage(this.image);
        this.graphics.addChild(this.sprite);
        this.sprite.width = this.size * 2;
        this.sprite.position.x = - this.size;
        this.sprite.position.y = - this.size;
        this.sprite.height = this.size * 2;
    } else {
        this.graphics = new pixi.Graphics();
        this.graphics.beginFill(this.color, 1);
        this.graphics.drawCircle(0, 0, this.size);
        this.graphics.endFill();
    }

    this.game.stage.addChild(this.graphics);

    this.updatePosition();
};

Ball.prototype.refresh = function () {
    this.render();
};

Ball.prototype.updatePosition = function () {
    var elapsed = new Date().getTime() - this.lastUpdate;

    this.x += (elapsed / 50) * this.velocity.x;
    this.y += (elapsed / 50) * this.velocity.y;

    this.graphics.position.x = this.game.renderer.width / 2 + this.x;
    this.graphics.position.y = this.game.renderer.height / 2 + this.y;
};

Ball.prototype.update = function () {
    if (!this.removed) {
        this.updatePosition();
        this.lastUpdate = new Date().getTime();
        this.checkCollisions();
    }
};

Ball.prototype.getBoundingBox = function () {
    return new geometry.Rect(
        {
            x: this.game.renderer.width / 2 + this.x - this.size,
            y: this.game.renderer.height / 2 + this.y - this.size
        },
        {
            width: this.size * 2,
            height: this.size * 2
        }
    );
};

Ball.prototype.checkCollisions = function () {
    if (this.checkWallsCollision()) {
        return true;
    }

    for (var key in this.game.players) {
        if (this.game.players.hasOwnProperty(key)) {
            if (this.checkPlayerCollision(this.game.players[key])) {
                return true;
            }
        }
    }

    return false;
};

Ball.prototype.checkWallsCollision = function () {
    var BB = this.getBoundingBox();

    if (BB.origin.y < 0) {
        this.bounce(0, 1);
    } else if (BB.getMax().y > this.game.renderer.height) {
        this.bounce(0, -1);
    } else if (BB.origin.x < config.LINES_DISTANCE) {
        this.game.players.b.addPoint();
        this.game.restart(true, 1);
    } else if (BB.origin.x > this.game.renderer.width - config.LINES_DISTANCE) {
        this.game.players.a.addPoint();
        this.game.restart(true, 0);
    } else {
        return false;
    }

    return true;
};

Ball.prototype.checkPlayerCollision = function (player) {
    var BB = this.getBoundingBox(),
        targetBB = player.getBoundingBox();

    if (BB.intersectsRect(targetBB)) {

        player.emit('bounce', [ this ]);
        this.game.emit('hit', this);

        if (player.side === 'left') {
            this.bounce(1, 0);
            // Move ball away from paddle so in the incidence that the ball changes size, 
            // the ball doesn't stay in contact with the paddle
            this.x += this.size;
        } else {
            this.bounce(-1, 0);
            // Move ball away from paddle so in the incidence that the ball changes size, 
            // the ball doesn't stay in contact with the paddle
            this.x -= (this.size / 2 + 1);
        }

        return true;
    }
};

Ball.prototype.remove = function () {
    if (this.sprite) {
        this.graphics.removeChild(this.sprite);
    }

    this.graphics.clear();
    this.removed = true;
};

Ball.prototype.bounce = function (multiplyX, multiplyY) {
    this.game.emit('bounce', this, multiplyX, multiplyY);

    if (multiplyX) {
        this.velocity.x = Math.abs(this.velocity.x) * multiplyX;
    }
    if (multiplyY) {
        this.velocity.y = Math.abs(this.velocity.y) * multiplyY;
    }
};

Ball.prototype.setColor = function (color) {
    this.color = parseOctal(color);
    this.refresh();
};

Ball.prototype.setImage = function (image) {
    this.image = image;
    this.refresh();
};

Ball.prototype.setSize = function (size) {
    this.size = size;
    this.refresh();
};

Ball.prototype.setVelocity = function (velocity) {
    this.velocity = {
        x: velocity[0],
        y: velocity[1]
    };
};

Ball.prototype.setSpeed = function (speed) {
    this.speed = speed;

    this.velocity = {
        x: speed,
        y: speed
    };
};

Ball.prototype.rebound = function (dir) {
    this.x = 0;
    this.velocity.x = -this.velocity.x * (dir ? 1 : -1);
};

module.exports = Ball;

},{"./config":84,"./utils":86,"geometry":27,"pixi":50}],77:[function(require,module,exports){

var keycode = require('keycode'),
    Keyboard;

function normaliseControls (controls) {
    var out = {},
        val;

    for (var key in controls) {
        val = controls[key];

        if (typeof val === 'object') {
            out[key] = val;
        } else {
            out[key] = [ val ];
        }
    }

    return out;
}

Keyboard = function (controls) {
    this.pressed = {};
    this.controls = {};
    this.addControls(controls);
    this.bind();
};

Keyboard.prototype.addControls = function (controls) {
    var hasControl, key;

    controls = normaliseControls(controls);

    for (key in controls) {
        if (this.controls.hasOwnProperty(key) && this.controls[key]) {
            this.controls[key] = this.controls[key].concat(controls[key]);
        } else {
            this.controls[key] = controls[key];
        }
    }

    for (key in this.controls) {
        hasControl = this.pressed.hasOwnProperty(key);
        if (this.controls.hasOwnProperty(key) && !hasControl) {
            this.pressed[key] = false;
        }
    }
};

Keyboard.prototype.bind = function () {
    var self = this;

    document.addEventListener('keydown', function (e) {
        self.setKeyState(keycode(e.keyCode), true);
    }, false);

    document.addEventListener('keyup', function (e) {
        self.setKeyState(keycode(e.keyCode), false);
    }, false);

};

Keyboard.prototype.setKeyState = function (keyName, state) {
    var found, i;

    for (var key in this.controls) {
        if (this.controls.hasOwnProperty(key) && this.controls[key]) {
            found = false;

            for (i = 0; i < this.controls[key].length; i += 1) {
                if (this.controls[key][i] === keyName) {
                    found = true;
                }
            }

            if (found) {
                this.pressed[key] = state;
            }
        }
    }
};

module.exports = Keyboard;

},{"keycode":28}],78:[function(require,module,exports){

var config = require('./config'),
    extend = require('deep-extend'),
    pixi = require('pixi'),
    MessageScreen;

MessageScreen = function (game) {
    this.message = this.message || '';
    this.game = game;
    this.drawMessage();
    this.bind();
};

MessageScreen.prototype.bind = function () {
    var self = this;

    this.game.on('setTextStyle', function (color) {
        self.setTextStyle(color);
    });

    this.game.on('resize', function () {
        self.resize();
    });
};

MessageScreen.prototype.drawMessage = function () {
    this.startMsg = new pixi.Text(this.message, config.TEXT_STYLE);

    this.hide();
    this.game.stage.addChild(this.startMsg);
};

MessageScreen.prototype.setMessage = function (message) {
    this.startMsg.setText(message);
};

MessageScreen.prototype.setTextStyle = function (style) {
    style = extend(config.TEXT_STYLE, style);
    this.startMsg.setStyle(style);
};

MessageScreen.prototype.resize = function () {
    this.startMsg.position = {
        x: this.game.renderer.width / 2,
        y: this.game.renderer.height / 2
    };
    this.startMsg.anchor = { x: 0.5, y: 0.5 };
};

MessageScreen.prototype.hide = function () {
    this.visible = false;
    this.startMsg.visible = false;
    this.game.refresh();
};

MessageScreen.prototype.show = function () {
    this.visible = true;
    this.startMsg.visible = true;
    this.game.refresh();
};


module.exports = MessageScreen;

},{"./config":84,"deep-extend":1,"pixi":50}],79:[function(require,module,exports){

var MessageScreen = require('./MessageScreen'),
    PauseScreen,

PauseScreen = function () {
    this.message = 'PAUSED';
    MessageScreen.apply(this, arguments);
};

PauseScreen.prototype = Object.create(MessageScreen.prototype);

PauseScreen.prototype.bind = function () {
    var self = this;

    MessageScreen.prototype.bind.apply(this, arguments);

    this.game.on('pause', function () {
        self.show();
    });

    this.game.on('resume', function () {
        self.hide();
    });

    this.game.on('reset', function () {
        self.hide();
    });
};

module.exports = PauseScreen;

},{"./MessageScreen":78}],80:[function(require,module,exports){

var pixi = require('pixi'),
    config = require('./config'),
    Keyboard = require('./Keyboard'),
    ScoreDisplay = require('./ScoreDisplay'),
    geometry = require('geometry'),
    EventEmitter = require('event-emitter'),
    parseOctal = require('./utils').parseOctal,
    defaults = {
        barHeight: 100,
        controls: {
            'up': null,
            'down': null
        },
        speed: 300
    },
    Player;

Player = function (game, options) {
    EventEmitter.apply(this);

    this.game = game;
    this.side = options.side;
    this.width = config.BARS_WIDTH;
    this.height = options.height || defaults.barHeight;
    this.speed = options.speed || defaults.speed;
    this.lastUpdate = new Date().getTime();
    this.keyboard = new Keyboard(options.controls || defaults.controls);
    this.y = 0;
    this.score = 0;
    this.scoreDisplay = new ScoreDisplay(this);
    this.color = config.PLAYER_COLOR;

    if (options.side !== 'left' && options.side !== 'right') {
        this.side = 'left';
    }

    this.graphics = new pixi.Graphics();
    this.game.stage.addChild(this.graphics);

    this.render();
    this.bind();
    this.updatePosition();
};

Player.prototype = new EventEmitter();

Player.prototype.addControls = function (controls) {
    this.keyboard.addControls(controls);
};

Player.prototype.bind = function () {
    var self = this;

    this.game.on('update', function () {
        self.update();
    });

    this.game.on('resize', function () {
        self.resize();
    });

    this.game.on('reset', function () {
        self.reset();
    });

    this.game.on('restart', function () {
        self.restart();
    });
};

Player.prototype.render = function () {
    this.graphics.beginFill(this.color);
    this.graphics.drawRect(0, 0, this.width, this.height);
    this.graphics.endFill();
};

Player.prototype.update = function () {
    this.graphics.position.y = this.screenY();

    if (this.keyboard.pressed.up) {
        this.move(-1);
    }

    if (this.keyboard.pressed.down) {
        this.move(1);
    }

    this.lastUpdate = new Date().getTime();
};

Player.prototype.move = function (direction) {
    var elapsed = new Date().getTime() - this.lastUpdate || 1000 / 60,
        distance = (elapsed / 1000) * this.speed,
        stageHeight = this.game.renderer.height,
        newY;

    newY = this.y + distance * direction;

    if (newY > stageHeight / 2 - this.height / 2) {
        newY = stageHeight / 2 - this.height / 2;
    } else if (newY < -stageHeight / 2 + this.height / 2) {
        newY = -stageHeight / 2 + this.height / 2;
    }

    this.y = newY;
    this.lastFrameLength = elapsed;
};

Player.prototype.screenX = function () {
    var stageWidth = this.game.renderer.width,
        spacing = config.LINES_DISTANCE + config.PLAYER_MARGIN;

    if (this.side === 'left') {
        return spacing;
    } else {
        return stageWidth - spacing - this.width;
    }
};

Player.prototype.screenY = function () {
    return this.y + this.game.renderer.height / 2 - this.height / 2;
};

Player.prototype.updatePosition = function () {
    this.graphics.position.x = this.screenX();
    this.graphics.position.y = this.screenY();
    this.scoreDisplay.updatePosition();
};

Player.prototype.resize = function () {
    this.updatePosition();
    this.scoreDisplay.resize();
};

Player.prototype.getBoundingBox = function () {
    return new geometry.Rect(
        { x: this.screenX(), y: this.screenY() },
        { width: this.width, height: this.height }
    );
};

Player.prototype.restart = function () {
    this.y = 0;
    this.update();
};

Player.prototype.reset = function () {
    this.score = 0;
    this.restart();
    this.scoreDisplay.update();
};

Player.prototype.addPoint = function () {
    this.score += 1;
    this.emit('point', this.score);
    this.game.emit('point', this);
};

Player.prototype.refresh = function () {
    this.graphics.clear();
    this.render();
};

Player.prototype.setHeight = function (height) {
    this.height = height;
    this.refresh();
};

Player.prototype.setColor = function (color) {
    this.color = parseOctal(color);
    this.refresh();
    this.game.updateIfStill();
};

Player.prototype.setSpeed = function (speed) {
    this.speed = speed;
};

Player.prototype.setY = function (y) {
    this.y = y;
};

module.exports = Player;

},{"./Keyboard":77,"./ScoreDisplay":82,"./config":84,"./utils":86,"event-emitter":5,"geometry":27,"pixi":50}],81:[function(require,module,exports){

var pixi = require('pixi'),
    Loop = require('game-loop'),
    Player = require('./Player'),
    Ball = require('./Ball'),
    Arena = require('./Arena'),
    StartScreen = require('./StartScreen'),
    PauseScreen = require('./PauseScreen'),
    MessageScreen = require('./MessageScreen'),
    EventEmitter = require('event-emitter'),
    parseOctal = require('./utils').parseOctal,
    config = require('./config'),
    extend = require('deep-extend'),
    keycode = require('keycode'),
    ballDefaults = {
        color: config.BALL_COLOR,
        image: null,
        size: config.BALL_SIZE,
        speed: config.BALL_SPEED,
        velocity: [ config.BALL_SPEED, config.BALL_SPEED ]
    },
    Pong;

Pong = function (wrapper) {
    EventEmitter.apply(this);

    this.wrapper = wrapper;
    this.stage = new pixi.Stage(config.BG_COLOR);
    this.renderer = pixi.autoDetectRenderer();
    this.loop = new Loop();
    this.balls = [];
    this.arena = new Arena(this);
    this.startScreen = new StartScreen(this);
    this.pauseScreen = new PauseScreen(this);
    this.endScreen = new MessageScreen(this);
    this.hits = 0;
    this.totalHits = 0;
    this.bounces = 0;
    this.totalBounces = 0;
    this.ballSettings = extend({}, ballDefaults);
    this.started = false;

    this.players = {
        a: new Player(this, { side: 'left' }),
        b: new Player(this, { side: 'right' })
    };

    this.resize();
    this.bind();
    this.startScreen.show();
    this.endScreen.hide();
    this.update();

    wrapper.appendChild(this.renderer.view);
};

Pong.prototype = new EventEmitter();

Pong.prototype.bind = function () {
    var self = this;

    this.loop.use(function () {
        self.update();
    });

    this.on('bounce', function () {
        self.bounces += 1;
        self.totalBounces += 1;
    });

    this.on('hit', function () {
        self.hits += 1;
        self.totalHits += 1;
    });

    document.addEventListener('keydown', function (e) {
        var key = keycode(e.keyCode);

        if (key === 'p') {
            self.togglePause();
        } else if (key === 'esc' || key === 'r') {
            self.reset();
            self.endScreen.hide();
        } else if (key === 'enter' && self.won) {
            self.reset();
            self.won = false;
            self.loop.play();
            self.endScreen.hide();
            self.start();
        }
    });
};

Pong.prototype.addBall = function () {
    var ball = new Ball(this, {
        color: this.ballSettings.color,
        image: this.ballSettings.image,
        size: this.ballSettings.size,
        speed: this.ballSettings.speed,
        velocity: this.ballSettings.velocity
    });

    this.balls.push(ball);
    return ball;
};

Pong.prototype.start = function () {
    this.addBall();
    this.loop.play();
    this.started = true;
    this.emit('start', this);
};

Pong.prototype.pause = function () {
    if (this.started) {
        this.emit('pause', this);
        this.loop.stop();
    }
};

Pong.prototype.resume = function () {
    if (this.started) {
        this.emit('resume', this);
        this.loop.play();
    }
};

Pong.prototype.togglePause = function () {
    if (!this.loop.playing) {
        this.resume();
    } else {
        this.pause();
    }
};

Pong.prototype.update = function () {
    if (this.started) {
        this.emit('beforeupdate', this);
        this.refresh();
        this.emit('update', this);
    }
};

Pong.prototype.refresh = function () {
    this.renderer.render(this.stage);
};

Pong.prototype.updateIfStill = function () {
    if (!this.loop.playing) {
        this.refresh();
    }
};

Pong.prototype.resize = function () {
    var width = this.wrapper.clientWidth,
        height = this.wrapper.clientHeight;

    this.updateBackgroundSize();
    this.renderer.resize(width, height);
    this.emit('resize', width, height, this);
    this.renderer.render(this.stage);
};

Pong.prototype.updateBackgroundSize = function () {
    if (this.backgroundImage) {
        this.backgroundImage.width = this.renderer.width;
        this.backgroundImage.height = this.renderer.height;
    }
};

Pong.prototype.restart = function (addBall, dir) {
    var ball;

    this.hits = 0;
    this.bounces = 0;

    this.resetBalls();

    if (addBall) {
        ball = this.addBall();
        ball.rebound(dir || 0);
    }

    this.emit('restart', this);
    this.refresh();
};

Pong.prototype.reset = function () {
    this.totalHits = 0;
    this.totalBounces = 0;
    this.restart(false);
    this.pause();
    this.emit('reset', this);
    this.started = false;
    this.refresh();
};

Pong.prototype.resetBalls = function () {
    for (var i = 0; i < this.balls.length; i += 1) {
        this.balls[i].remove();
    }

    this.balls = [];
};

Pong.prototype.setBackgroundColor = function (color) {
    if (this.renderer instanceof pixi.CanvasRenderer) {
        color = color.split('#')[1];
    } else {
        color = parseOctal(color);
    }

    this.stage.setBackgroundColor(color);
    this.updateIfStill();
};

Pong.prototype.setBackgroundImage = function (image) {
    if (this.backgroundImage) {
        this.stage.removeChild(this.backgroundImage);
    }

    this.backgroundImage = pixi.Sprite.fromImage(image);
    this.updateBackgroundSize();
    this.stage.addChildAt(this.backgroundImage, 0);
    var self = this;

    var preload = new Image();
    preload.src = image;

    this.backgroundImage.texture.baseTexture.on('loaded', function () {
        self.refresh();
    });
};

Pong.prototype.setLinesColor = function (color) {
    this.emit('setLinesColor', color);
    this.updateIfStill();
};

Pong.prototype.setTextStyle = function (style) {
    this.emit('setTextStyle', style);
    this.updateIfStill();
};

Pong.prototype.setBallColor = function (color) {
    this.ballSettings.color = color;
    this.emit('setBallColor', color);
};

Pong.prototype.setBallImage = function (image) {
    this.ballSettings.image = image;
    this.emit('setBallImage', image);
};

Pong.prototype.setBallSize = function (size) {
    this.ballSettings.size = size;
    this.emit('setBallSize', size);
};

Pong.prototype.setBallSpeed = function (speed) {
    this.ballSettings.speed = speed;
    this.emit('setBallSpeed', speed);
};

Pong.prototype.setBallVelocity = function (velocity) {
    this.ballSettings.velocity = velocity;
    this.emit('setBallVelocity', velocity);
};

Pong.prototype.win = function (message) {
    this.loop.stop();
    this.endScreen.setMessage(message);
    this.endScreen.show();
    this.won = true;
};

module.exports = Pong;

},{"./Arena":75,"./Ball":76,"./MessageScreen":78,"./PauseScreen":79,"./Player":80,"./StartScreen":83,"./config":84,"./utils":86,"deep-extend":1,"event-emitter":5,"game-loop":25,"keycode":28,"pixi":50}],82:[function(require,module,exports){

var pixi = require('pixi'),
    config = require('./config'),
    extend = require('deep-extend'),
    ScoreDisplay;

ScoreDisplay = function (player) {
    this.player = player;
    this.render();
    this.bind();
};

ScoreDisplay.prototype.bind = function () {
    var self = this;

    this.player.on('point', function () {
        self.update();
    });

    this.player.game.on('setTextStyle', function (color) {
        self.setTextStyle(color);
    });
};

ScoreDisplay.prototype.setTextStyle = function (style) {
    style = extend(config.TEXT_STYLE, style);
    this.text.setStyle(style);
};

ScoreDisplay.prototype.render = function () {
    this.text = new pixi.Text(this.player.score + '', config.TEXT_STYLE);

    if (this.player.side === 'left') {
        this.text.anchor.x = 1;
    } else {
        this.text.anchor.x = 0;
    }

    this.text.position.y = config.SCORES_MARGIN.y;
    this.player.game.stage.addChild(this.text);
};

ScoreDisplay.prototype.updatePosition = function () {
    var renderer = this.player.game.renderer;

    if (this.player.side === 'left') {
        this.text.position.x = renderer.width / 2 - config.SCORES_MARGIN.x;
    } else {
        this.text.position.x = renderer.width / 2 + config.SCORES_MARGIN.x;
    }
};

ScoreDisplay.prototype.update = function () {
    this.text.setText(this.player.score + '');
};

ScoreDisplay.prototype.resize = function () {
    this.updatePosition();
};

module.exports = ScoreDisplay;

},{"./config":84,"deep-extend":1,"pixi":50}],83:[function(require,module,exports){

var keycode = require('keycode'),
    MessageScreen = require('./MessageScreen'),
    StartScreen,

StartScreen = function () {
    this.message = 'PRESS ENTER';
    MessageScreen.apply(this, arguments);
};

StartScreen.prototype = Object.create(MessageScreen.prototype);

StartScreen.prototype.bind = function () {
    var self = this;

    MessageScreen.prototype.bind.apply(this, arguments);

    this.game.on('start', function () {
        self.hide();
    });

    this.game.on('reset', function () {
        self.show();
    });

    document.addEventListener('keydown', function (e) {
        var key = keycode(e.keyCode);

        if (key === 'enter') {
            if (!self.game.loop.playing) {
                self.game.start();
            }
        }
    });
};

module.exports = StartScreen;

},{"./MessageScreen":78,"keycode":28}],84:[function(require,module,exports){

module.exports = {
	BG_COLOR: 0x222222,
	BARS_WIDTH: 15,
	LINES_DISTANCE: 20,
	PLAYER_MARGIN: 10,
	PLAYER_COLOR: 0xEEEEEE,
	SCORES_MARGIN: { x: 30, y: 30 },
	TEXT_STYLE: {
        font: '60px Helvetica, Arial, sans-serif',
        fill: '#eee',
        align: 'center'
    },
    LINES_COLOR: 0xEEEEEE,
    BALL_COLOR: 0xEEEEEE,
    BALL_SIZE: 10,
    BALL_SPEED: 15
};
},{}],85:[function(require,module,exports){

window.Pong = require('./Pong');

},{"./Pong":81}],86:[function(require,module,exports){

module.exports = {

    parseOctal: function (color) {
        if (typeof color === 'string') {
            color = '0x' + color.substr(1);
        }
        return color;
    }

};
},{}]},{},[85])
;