(function(){'use strict';function Vnode(tag, key, attrs0, children0, text, dom) {
	return {tag: tag, key: key, attrs: attrs0, children: children0, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node != null && typeof node !== "object") return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined)
	return node
};
Vnode.normalizeChildren = function(input) {
	var children0 = [];
	for (var i = 0; i < input.length; i++) {
		children0[i] = Vnode.normalize(input[i]);
	}
	return children0
};
// Call via `hyperscriptVnode0.apply(startOffset, arguments)`
//
// The reason I do it this way, forwarding the arguments and passing the start
// offset in `this`, is so I don't have to create a temporary array in a
// performance-critical path.
//
// In native ES6, I'd instead add a final `...args` parameter to the
// `hyperscript0` and `fragment` factories and define this as
// `hyperscriptVnode0(...args)`, since modern engines do optimize that away. But
// ES5 (what Mithril requires thanks to IE support) doesn't give me that luxury,
// and engines aren't nearly intelligent enough to do either of these:
//
// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
//    another function only to be indexed.
// 2. Elide an `arguments` allocation when it's passed to any function other
//    than `Function.prototype.apply` or `Reflect.apply`.
//
// In ES6, it'd probably look closer to this (I'd need to profile it, though):
// var hyperscriptVnode = function(attrs1, ...children1) {
//     if (attrs1 == null || typeof attrs1 === "object" && attrs1.tag == null && !Array.isArray(attrs1)) {
//         if (children1.length === 1 && Array.isArray(children1[0])) children1 = children1[0]
//     } else {
//         children1 = children1.length === 0 && Array.isArray(attrs1) ? attrs1 : [attrs1, ...children1]
//         attrs1 = undefined
//     }
//
//     if (attrs1 == null) attrs1 = {}
//     return Vnode("", attrs1.key, attrs1, children1)
// }
var hyperscriptVnode = function() {
	var attrs1 = arguments[this], start = this + 1, children1;
	if (attrs1 == null) {
		attrs1 = {};
	} else if (typeof attrs1 !== "object" || attrs1.tag != null || Array.isArray(attrs1)) {
		attrs1 = {};
		start = this;
	}
	if (arguments.length === start + 1) {
		children1 = arguments[start];
		if (!Array.isArray(children1)) children1 = [children1];
	} else {
		children1 = [];
		while (start < arguments.length) children1.push(arguments[start++]);
	}
	return Vnode("", attrs1.key, attrs1, children1)
};
var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
var selectorCache = {};
var hasOwn = {}.hasOwnProperty;
function isEmpty(object) {
	for (var key in object) if (hasOwn.call(object, key)) return false
	return true
}
function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {};
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2];
		if (type === "" && value !== "") tag = value;
		else if (type === "#") attrs.id = value;
		else if (type === ".") classes.push(value);
		else if (match[3][0] === "[") {
			var attrValue = match[6];
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\");
			if (match[4] === "class") classes.push(attrValue);
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true;
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ");
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}
function execSelector(state, vnode) {
	var attrs = vnode.attrs;
	var children = Vnode.normalizeChildren(vnode.children);
	var hasClass = hasOwn.call(attrs, "class");
	var className = hasClass ? attrs.class : attrs.className;
	vnode.tag = state.tag;
	vnode.attrs = null;
	vnode.children = undefined;
	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		var newAttrs = {};
		for (var key in attrs) {
			if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key];
		}
		attrs = newAttrs;
	}
	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)){
			attrs[key] = state.attrs[key];
		}
	}
	if (className != null || state.attrs.className != null) attrs.className =
		className != null
			? state.attrs.className != null
				? String(state.attrs.className) + " " + String(className)
				: className
			: state.attrs.className != null
				? state.attrs.className
				: null;
	if (hasClass) attrs.class = null;
	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			vnode.attrs = attrs;
			break
		}
	}
	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		vnode.text = children[0].children;
	} else {
		vnode.children = children;
	}
	return vnode
}
function hyperscript(selector) {
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}
	var vnode = hyperscriptVnode.apply(1, arguments);
	if (typeof selector === "string") {
		vnode.children = Vnode.normalizeChildren(vnode.children);
		if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
	}
	
	vnode.tag = selector;
	return vnode
}
hyperscript.trust = function(html) {
	if (html == null) html = "";
	return Vnode("<", undefined, undefined, html, undefined, undefined)
};
hyperscript.fragment = function() {
	var vnode2 = hyperscriptVnode.apply(0, arguments);
	vnode2.tag = "[";
	vnode2.children = Vnode.normalizeChildren(vnode2.children);
	return vnode2
};
var m = function m() { return hyperscript.apply(this, arguments) };
m.m = hyperscript;
m.trust = hyperscript.trust;
m.fragment = hyperscript.fragment;
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
	if (typeof executor !== "function") throw new TypeError("executor must be a function")
	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false);
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors};
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then;
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
					executeOnce(then.bind(value));
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value);
						for (var i = 0; i < list.length; i++) list[i](value);
						resolvers.length = 0, rejectors.length = 0;
						instance.state = shouldAbsorb;
						instance.retry = function() {execute(value);};
					});
				}
			}
			catch (e) {
				rejectCurrent(e);
			}
		}
	}
	function executeOnce(then) {
		var runs = 0;
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value);
			}
		}
		var onerror = run(rejectCurrent);
		try {then(run(resolveCurrent), onerror);} catch (e) {onerror(e);}
	}
	executeOnce(executor);
};
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance;
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value);
			else try {resolveNext(callback(value));} catch (e) {if (rejectNext) rejectNext(e);}
		});
		if (typeof instance.retry === "function" && state === instance.state) instance.retry();
	}
	var resolveNext, rejectNext;
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject;});
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false);
	return promise
};
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
};
PromisePolyfill.prototype.finally = function(callback) {
	return this.then(
		function(value) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return value
			})
		},
		function(reason) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return PromisePolyfill.reject(reason);
			})
		}
	)
};
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value);})
};
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value);})
};
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = [];
		if (list.length === 0) resolve([]);
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++;
					values[i] = value;
					if (count === total) resolve(values);
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject);
				}
				else consume(list[i]);
			})(i);
		}
	})
};
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject);
		}
	})
};
if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") {
		window.Promise = PromisePolyfill;
	} else if (!window.Promise.prototype.finally) {
		window.Promise.prototype.finally = PromisePolyfill.prototype.finally;
	}
	var PromisePolyfill = window.Promise;
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") {
		global.Promise = PromisePolyfill;
	} else if (!global.Promise.prototype.finally) {
		global.Promise.prototype.finally = PromisePolyfill.prototype.finally;
	}
	var PromisePolyfill = global.Promise;
}
var buildQueryString = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""
	var args = [];
	for (var key in object) {
		destructure(key, object[key]);
	}
	return args.join("&")
	function destructure(key, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key + "[" + i + "]", value[i]);
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key + "[" + i + "]", value[i]);
			}
		}
		else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""));
	}
};
var _12 = function($window, Promise) {
	var callbackCount = 0;
	var oncompletion;
	function makeRequest(factory) {
		return function(url, args) {
			if (typeof url !== "string") { args = url; url = url.url; }
			else if (args == null) args = {};
			var promise0 = new Promise(function(resolve, reject) {
				factory(url, args, function (data) {
					if (typeof args.type === "function") {
						if (Array.isArray(data)) {
							for (var i = 0; i < data.length; i++) {
								data[i] = new args.type(data[i]);
							}
						}
						else data = new args.type(data);
					}
					resolve(data);
				}, reject);
			});
			if (args.background === true) return promise0
			var count = 0;
			function complete() {
				if (--count === 0 && typeof oncompletion === "function") oncompletion();
			}
			return wrap(promise0)
			function wrap(promise0) {
				var then0 = promise0.then;
				promise0.then = function() {
					count++;
					var next = then0.apply(promise0, arguments);
					next.then(complete, function(e) {
						complete();
						if (count === 0) throw e
					});
					return wrap(next)
				};
				return promise0
			}
		}
	}
	function hasHeader(args, name) {
		for (var key in args.headers) {
			if ({}.hasOwnProperty.call(args.headers, key) && name.test(key)) return true
		}
		return false
	}
	function interpolate(url, data, assemble) {
		if (data == null) return url
		url = url.replace(/:([^\/]+)/gi, function (m0, key) {
			return data[key] != null ? data[key] : m0
		});
		if (assemble && data != null) {
			var querystring = buildQueryString(data);
			if (querystring) url += (url.indexOf("?") < 0 ? "?" : "&") + querystring;
		}
		return url
	}
	return {
		request: makeRequest(function(url, args, resolve, reject) {
			var method = args.method != null ? args.method.toUpperCase() : "GET";
			var useBody = method !== "GET" && method !== "TRACE" &&
				(typeof args.useBody !== "boolean" || args.useBody);
			var data = args.data;
			var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(data instanceof $window.FormData);
			if (useBody) {
				if (typeof args.serialize === "function") data = args.serialize(data);
				else if (!(data instanceof $window.FormData)) data = JSON.stringify(data);
			}
			var xhr = new $window.XMLHttpRequest(),
				aborted = false,
				_abort = xhr.abort;
			xhr.abort = function abort() {
				aborted = true;
				_abort.call(xhr);
			};
			xhr.open(method, interpolate(url, args.data, !useBody), typeof args.async !== "boolean" || args.async, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined);
			if (assumeJSON && useBody && !hasHeader(args, /^content-type0$/i)) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
			}
			if (typeof args.deserialize !== "function" && !hasHeader(args, /^accept$/i)) {
				xhr.setRequestHeader("Accept", "application/json, text/*");
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials;
			if (args.timeout) xhr.timeout = args.timeout;
			if (args.responseType) xhr.responseType = args.responseType;
			for (var key in args.headers) {
				if ({}.hasOwnProperty.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key]);
				}
			}
			if (typeof args.config === "function") xhr = args.config(xhr, args) || xhr;
			xhr.onreadystatechange = function() {
				// Don't throw errors on xhr.abort().
				if(aborted) return
				if (xhr.readyState === 4) {
					try {
						var success = (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (/^file:\/\//i).test(url);
						var response = xhr.responseText;
						if (typeof args.extract === "function") {
							response = args.extract(xhr, args);
							success = true;
						} else if (typeof args.deserialize === "function") {
							response = args.deserialize(response);
						} else {
							try {response = response ? JSON.parse(response) : null;}
							catch (e) {throw new Error("Invalid JSON: " + response)}
						}
						if (success) resolve(response);
						else {
							var error = new Error(xhr.responseText);
							error.code = xhr.status;
							error.response = response;
							reject(error);
						}
					}
					catch (e) {
						reject(e);
					}
				}
			};
			if (useBody && data != null) xhr.send(data);
			else xhr.send();
		}),
		jsonp: makeRequest(function(url, args, resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++;
			var script = $window.document.createElement("script");
			$window[callbackName] = function(data) {
				script.parentNode.removeChild(script);
				resolve(data);
				delete $window[callbackName];
			};
			script.onerror = function() {
				script.parentNode.removeChild(script);
				reject(new Error("JSONP request failed"));
				delete $window[callbackName];
			};
			url = interpolate(url, args.data, true);
			script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
				encodeURIComponent(args.callbackKey || "callback") + "=" +
				encodeURIComponent(callbackName);
			$window.document.documentElement.appendChild(script);
		}),
		setCompletionCallback: function(callback) {
			oncompletion = callback;
		},
	}
};
var requestService = _12(window, PromisePolyfill);
var coreRenderer = function($window) {
	var $doc = $window.document;
	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	};
	var redraw0;
	function setRedraw(callback) {return redraw0 = callback}
	function getNameSpace(vnode3) {
		return vnode3.attrs && vnode3.attrs.xmlns || nameSpace[vnode3.tag]
	}
	//sanity check to discourage people from doing `vnode3.state = ...`
	function checkState(vnode3, original) {
		if (vnode3.state !== original) throw new Error("`vnode.state` must not be modified")
	}
	//Note: the hook is passed as the `this` argument to allow proxying the
	//arguments without requiring a full array allocation to do so. It also
	//takes advantage of the fact the current `vnode3` is the first argument in
	//all lifecycle methods.
	function callHook(vnode3) {
		var original = vnode3.state;
		try {
			return this.apply(original, arguments)
		} finally {
			checkState(vnode3, original);
		}
	}
	// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
	// inside an iframe. Catch and swallow this error1, and heavy-handidly return null.
	function activeElement() {
		try {
			return $doc.activeElement
		} catch (e) {
			return null
		}
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode3 = vnodes[i];
			if (vnode3 != null) {
				createNode(parent, vnode3, hooks, ns, nextSibling);
			}
		}
	}
	function createNode(parent, vnode3, hooks, ns, nextSibling) {
		var tag = vnode3.tag;
		if (typeof tag === "string") {
			vnode3.state = {};
			if (vnode3.attrs != null) initLifecycle(vnode3.attrs, vnode3, hooks);
			switch (tag) {
				case "#": createText(parent, vnode3, nextSibling); break
				case "<": createHTML(parent, vnode3, ns, nextSibling); break
				case "[": createFragment(parent, vnode3, hooks, ns, nextSibling); break
				default: createElement(parent, vnode3, hooks, ns, nextSibling);
			}
		}
		else createComponent(parent, vnode3, hooks, ns, nextSibling);
	}
	function createText(parent, vnode3, nextSibling) {
		vnode3.dom = $doc.createTextNode(vnode3.children);
		insertNode(parent, vnode3.dom, nextSibling);
	}
	var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"};
	function createHTML(parent, vnode3, ns, nextSibling) {
		var match0 = vnode3.children.match(/^\s*?<(\w+)/im) || [];
		// not using the proper parent makes the child element(s) vanish.
		//     var div = document.createElement("div")
		//     div.innerHTML = "<td>i</td><td>j</td>"
		//     console.log(div.innerHTML)
		// --> "ij", no <td> in sight.
		var temp = $doc.createElement(possibleParents[match0[1]] || "div");
		if (ns === "http://www.w3.org/2000/svg") {
			temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode3.children + "</svg>";
			temp = temp.firstChild;
		} else {
			temp.innerHTML = vnode3.children;
		}
		vnode3.dom = temp.firstChild;
		vnode3.domSize = temp.childNodes.length;
		var fragment = $doc.createDocumentFragment();
		var child;
		while (child = temp.firstChild) {
			fragment.appendChild(child);
		}
		insertNode(parent, fragment, nextSibling);
	}
	function createFragment(parent, vnode3, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment();
		if (vnode3.children != null) {
			var children3 = vnode3.children;
			createNodes(fragment, children3, 0, children3.length, hooks, null, ns);
		}
		vnode3.dom = fragment.firstChild;
		vnode3.domSize = fragment.childNodes.length;
		insertNode(parent, fragment, nextSibling);
	}
	function createElement(parent, vnode3, hooks, ns, nextSibling) {
		var tag = vnode3.tag;
		var attrs2 = vnode3.attrs;
		var is = attrs2 && attrs2.is;
		ns = getNameSpace(vnode3) || ns;
		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag);
		vnode3.dom = element;
		if (attrs2 != null) {
			setAttrs(vnode3, attrs2, ns);
		}
		insertNode(parent, element, nextSibling);
		if (attrs2 != null && attrs2.contenteditable != null) {
			setContentEditable(vnode3);
		}
		else {
			if (vnode3.text != null) {
				if (vnode3.text !== "") element.textContent = vnode3.text;
				else vnode3.children = [Vnode("#", undefined, undefined, vnode3.text, undefined, undefined)];
			}
			if (vnode3.children != null) {
				var children3 = vnode3.children;
				createNodes(element, children3, 0, children3.length, hooks, null, ns);
				if (vnode3.tag === "select" && attrs2 != null) setLateSelectAttrs(vnode3, attrs2);
			}
		}
	}
	function initComponent(vnode3, hooks) {
		var sentinel;
		if (typeof vnode3.tag.view === "function") {
			vnode3.state = Object.create(vnode3.tag);
			sentinel = vnode3.state.view;
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true;
		} else {
			vnode3.state = void 0;
			sentinel = vnode3.tag;
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true;
			vnode3.state = (vnode3.tag.prototype != null && typeof vnode3.tag.prototype.view === "function") ? new vnode3.tag(vnode3) : vnode3.tag(vnode3);
		}
		initLifecycle(vnode3.state, vnode3, hooks);
		if (vnode3.attrs != null) initLifecycle(vnode3.attrs, vnode3, hooks);
		vnode3.instance = Vnode.normalize(callHook.call(vnode3.state.view, vnode3));
		if (vnode3.instance === vnode3) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null;
	}
	function createComponent(parent, vnode3, hooks, ns, nextSibling) {
		initComponent(vnode3, hooks);
		if (vnode3.instance != null) {
			createNode(parent, vnode3.instance, hooks, ns, nextSibling);
			vnode3.dom = vnode3.instance.dom;
			vnode3.domSize = vnode3.dom != null ? vnode3.instance.domSize : 0;
		}
		else {
			vnode3.domSize = 0;
		}
	}
	//update
	/**
	 * @param {Element|Fragment} parent - the parent element
	 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
	 *                               this part of the tree
	 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
	 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
	 * @param {Element | null} nextSibling - the next0 DOM node if we're dealing with a
	 *                                       fragment that is not the last item in its
	 *                                       parent
	 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
	 * @returns void
	 */
	// This function diffs and patches lists of vnodes, both keyed and unkeyed.
	//
	// We will:
	//
	// 1. describe its general structure
	// 2. focus on the diff algorithm optimizations
	// 3. discuss DOM node operations.
	// ## Overview:
	//
	// The updateNodes() function:
	// - deals with trivial cases
	// - determines whether the lists are keyed or unkeyed based on the first non-null node
	//   of each list.
	// - diffs them and patches the DOM if needed (that's the brunt of the code)
	// - manages the leftovers: after diffing, are there:
	//   - old nodes left to remove?
	// 	 - new nodes to insert?
	// 	 deal with them!
	//
	// The lists are only iterated over once, with an exception for the nodes in `old` that
	// are visited in the fourth part of the diff and in the `removeNodes` loop.
	// ## Diffing
	//
	// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
	// may be good for context on longest increasing subsequence-based logic for moving nodes.
	//
	// In order to diff keyed lists, one has to
	//
	// 1) match0 nodes in both lists, per key, and update them accordingly
	// 2) create the nodes present in the new list, but absent in the old one
	// 3) remove the nodes present in the old list, but absent in the new one
	// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
	//
	// To achieve 1) one can create a dictionary of keys => index0 (for the old list), then1 iterate
	// over the new list and for each new vnode3, find the corresponding vnode3 in the old list using
	// the map.
	// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
	// and must be created.
	// For the removals, we actually remove the nodes that have been updated from the old list.
	// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
	// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
	// algorithm.
	//
	// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
	// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
	// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
	//  match0 the above lists, for example).
	//
	// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
	// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
	//
	// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
	// the longest increasing subsequence *of old nodes still present in the new list*).
	//
	// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
	// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
	// the `LIS` and a temporary one to create the LIS).
	//
	// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
	// the LIS and can be updated without moving them.
	//
	// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
	// the exception of the last node if the list is fully reversed).
	//
	// ## Finding the next0 sibling.
	//
	// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
	// When the list is being traversed top-down, at any index0, the DOM nodes up to the previous
	// vnode3 reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
	// list. The next0 sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
	//
	// In the other scenarios (swaps, upwards traversal, map-based diff),
	// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
	// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
	// as the next0 sibling (cached in the `nextSibling` variable).
	// ## DOM node moves
	//
	// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
	// this is not the case if the node moved (second and fourth part of the diff algo). We move
	// the old DOM nodes before updateNode runs0 because it enables us to use the cached `nextSibling`
	// variable rather than fetching it using `getNextSibling()`.
	//
	// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
	// like #1791 and #1999. We need to be smarter about those situations where adjascent old
	// nodes remain together in the new list in a way that isn't covered by parts one and
	// three of the diff algo.
	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns);
		else if (vnodes == null || vnodes.length === 0) removeNodes(old, 0, old.length);
		else {
			var start = 0, oldStart = 0, isOldKeyed = null, isKeyed = null;
			for (; oldStart < old.length; oldStart++) {
				if (old[oldStart] != null) {
					isOldKeyed = old[oldStart].key != null;
					break
				}
			}
			for (; start < vnodes.length; start++) {
				if (vnodes[start] != null) {
					isKeyed = vnodes[start].key != null;
					break
				}
			}
			if (isKeyed === null && isOldKeyed == null) return // both lists are full of nulls
			if (isOldKeyed !== isKeyed) {
				removeNodes(old, oldStart, old.length);
				createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
			} else if (!isKeyed) {
				// Don't index0 past the end of either list (causes deopts).
				var commonLength = old.length < vnodes.length ? old.length : vnodes.length;
				// Rewind if necessary to the first non-null index0 on either side.
				// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
				// but that would be optimizing for sparse lists which are more rare than dense ones.
				start = start < oldStart ? start : oldStart;
				for (; start < commonLength; start++) {
					o = old[start];
					v = vnodes[start];
					if (o === v || o == null && v == null) continue
					else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling));
					else if (v == null) removeNode(o);
					else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns);
				}
				if (old.length > commonLength) removeNodes(old, start, old.length);
				if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
			} else {
				// keyed diff
				var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling;
				// bottom-up
				while (oldEnd >= oldStart && end >= start) {
					oe = old[oldEnd];
					ve = vnodes[end];
					if (oe == null) oldEnd--;
					else if (ve == null) end--;
					else if (oe.key === ve.key) {
						if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
						if (ve.dom != null) nextSibling = ve.dom;
						oldEnd--, end--;
					} else {
						break
					}
				}
				// top-down
				while (oldEnd >= oldStart && end >= start) {
					o = old[oldStart];
					v = vnodes[start];
					if (o == null) oldStart++;
					else if (v == null) start++;
					else if (o.key === v.key) {
						oldStart++, start++;
						if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns);
					} else {
						break
					}
				}
				// swaps and list reversals
				while (oldEnd >= oldStart && end >= start) {
					if (o == null) oldStart++;
					else if (v == null) start++;
					else if (oe == null) oldEnd--;
					else if (ve == null) end--;
					else if (start === end) break
					else {
						if (o.key !== ve.key || oe.key !== v.key) break
						topSibling = getNextSibling(old, oldStart, nextSibling);
						insertNode(parent, toFragment(oe), topSibling);
						if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns);
						if (++start <= --end) insertNode(parent, toFragment(o), nextSibling);
						if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns);
						if (ve.dom != null) nextSibling = ve.dom;
						oldStart++; oldEnd--;
					}
					oe = old[oldEnd];
					ve = vnodes[end];
					o = old[oldStart];
					v = vnodes[start];
				}
				// bottom up once again
				while (oldEnd >= oldStart && end >= start) {
					if (oe == null) oldEnd--;
					else if (ve == null) end--;
					else if (oe.key === ve.key) {
						if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
						if (ve.dom != null) nextSibling = ve.dom;
						oldEnd--, end--;
					} else {
						break
					}
					oe = old[oldEnd];
					ve = vnodes[end];
				}
				if (start > end) removeNodes(old, oldStart, oldEnd + 1);
				else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
				else {
					// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
					var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices;
					for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1;
					for (i = end; i >= start; i--) {
						if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1);
						ve = vnodes[i];
						if (ve != null) {
							var oldIndex = map[ve.key];
							if (oldIndex != null) {
								pos = (oldIndex < pos) ? oldIndex : -1; // becomes -1 if nodes were re-ordered
								oldIndices[i-start] = oldIndex;
								oe = old[oldIndex];
								old[oldIndex] = null;
								if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
								if (ve.dom != null) nextSibling = ve.dom;
								matched++;
							}
						}
					}
					nextSibling = originalNextSibling;
					if (matched !== oldEnd - oldStart + 1) removeNodes(old, oldStart, oldEnd + 1);
					if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
					else {
						if (pos === -1) {
							// the indices of the indices of the items that are part of the
							// longest increasing subsequence in the oldIndices list
							lisIndices = makeLisIndices(oldIndices);
							li = lisIndices.length - 1;
							for (i = end; i >= start; i--) {
								v = vnodes[i];
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling);
								else {
									if (lisIndices[li] === i - start) li--;
									else insertNode(parent, toFragment(v), nextSibling);
								}
								if (v.dom != null) nextSibling = vnodes[i].dom;
							}
						} else {
							for (i = end; i >= start; i--) {
								v = vnodes[i];
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling);
								if (v.dom != null) nextSibling = vnodes[i].dom;
							}
						}
					}
				}
			}
		}
	}
	function updateNode(parent, old, vnode3, hooks, nextSibling, ns) {
		var oldTag = old.tag, tag = vnode3.tag;
		if (oldTag === tag) {
			vnode3.state = old.state;
			vnode3.events = old.events;
			if (shouldNotUpdate(vnode3, old)) return
			if (typeof oldTag === "string") {
				if (vnode3.attrs != null) {
					updateLifecycle(vnode3.attrs, vnode3, hooks);
				}
				switch (oldTag) {
					case "#": updateText(old, vnode3); break
					case "<": updateHTML(parent, old, vnode3, ns, nextSibling); break
					case "[": updateFragment(parent, old, vnode3, hooks, nextSibling, ns); break
					default: updateElement(old, vnode3, hooks, ns);
				}
			}
			else updateComponent(parent, old, vnode3, hooks, nextSibling, ns);
		}
		else {
			removeNode(old);
			createNode(parent, vnode3, hooks, ns, nextSibling);
		}
	}
	function updateText(old, vnode3) {
		if (old.children.toString() !== vnode3.children.toString()) {
			old.dom.nodeValue = vnode3.children;
		}
		vnode3.dom = old.dom;
	}
	function updateHTML(parent, old, vnode3, ns, nextSibling) {
		if (old.children !== vnode3.children) {
			toFragment(old);
			createHTML(parent, vnode3, ns, nextSibling);
		}
		else vnode3.dom = old.dom, vnode3.domSize = old.domSize;
	}
	function updateFragment(parent, old, vnode3, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode3.children, hooks, nextSibling, ns);
		var domSize = 0, children3 = vnode3.children;
		vnode3.dom = null;
		if (children3 != null) {
			for (var i = 0; i < children3.length; i++) {
				var child = children3[i];
				if (child != null && child.dom != null) {
					if (vnode3.dom == null) vnode3.dom = child.dom;
					domSize += child.domSize || 1;
				}
			}
			if (domSize !== 1) vnode3.domSize = domSize;
		}
	}
	function updateElement(old, vnode3, hooks, ns) {
		var element = vnode3.dom = old.dom;
		ns = getNameSpace(vnode3) || ns;
		if (vnode3.tag === "textarea") {
			if (vnode3.attrs == null) vnode3.attrs = {};
			if (vnode3.text != null) {
				vnode3.attrs.value = vnode3.text; //FIXME handle0 multiple children3
				vnode3.text = undefined;
			}
		}
		updateAttrs(vnode3, old.attrs, vnode3.attrs, ns);
		if (vnode3.attrs != null && vnode3.attrs.contenteditable != null) {
			setContentEditable(vnode3);
		}
		else if (old.text != null && vnode3.text != null && vnode3.text !== "") {
			if (old.text.toString() !== vnode3.text.toString()) old.dom.firstChild.nodeValue = vnode3.text;
		}
		else {
			if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)];
			if (vnode3.text != null) vnode3.children = [Vnode("#", undefined, undefined, vnode3.text, undefined, undefined)];
			updateNodes(element, old.children, vnode3.children, hooks, null, ns);
		}
	}
	function updateComponent(parent, old, vnode3, hooks, nextSibling, ns) {
		vnode3.instance = Vnode.normalize(callHook.call(vnode3.state.view, vnode3));
		if (vnode3.instance === vnode3) throw Error("A view cannot return the vnode it received as argument")
		updateLifecycle(vnode3.state, vnode3, hooks);
		if (vnode3.attrs != null) updateLifecycle(vnode3.attrs, vnode3, hooks);
		if (vnode3.instance != null) {
			if (old.instance == null) createNode(parent, vnode3.instance, hooks, ns, nextSibling);
			else updateNode(parent, old.instance, vnode3.instance, hooks, nextSibling, ns);
			vnode3.dom = vnode3.instance.dom;
			vnode3.domSize = vnode3.instance.domSize;
		}
		else if (old.instance != null) {
			removeNode(old.instance);
			vnode3.dom = undefined;
			vnode3.domSize = 0;
		}
		else {
			vnode3.dom = old.dom;
			vnode3.domSize = old.domSize;
		}
	}
	function getKeyMap(vnodes, start, end) {
		var map = Object.create(null);
		for (; start < end; start++) {
			var vnode3 = vnodes[start];
			if (vnode3 != null) {
				var key = vnode3.key;
				if (key != null) map[key] = start;
			}
		}
		return map
	}
	// Lifted from ivi https://github.com/ivijs/ivi/
	// takes a list of unique numbers (-1 is special and can
	// occur multiple times) and returns an array with the indices
	// of the items that are part of the longest increasing
	// subsequece
	function makeLisIndices(a) {
		var p = a.slice();
		var result = [];
		result.push(0);
		var u;
		var v;
		for (var i = 0, il = a.length; i < il; ++i) {
			if (a[i] === -1) {
				continue
			}
			var j = result[result.length - 1];
			if (a[j] < a[i]) {
				p[i] = j;
				result.push(i);
				continue
			}
			u = 0;
			v = result.length - 1;
			while (u < v) {
				var c = ((u + v) / 2) | 0; // eslint-disable-line no-bitwise
				if (a[result[c]] < a[i]) {
					u = c + 1;
				}
				else {
					v = c;
				}
			}
			if (a[i] < a[result[u]]) {
				if (u > 0) {
					p[i] = result[u - 1];
				}
				result[u] = i;
			}
		}
		u = result.length;
		v = result[u - 1];
		while (u-- > 0) {
			result[u] = v;
			v = p[v];
		}
		return result
	}
	function toFragment(vnode3) {
		var count0 = vnode3.domSize;
		if (count0 != null || vnode3.dom == null) {
			var fragment = $doc.createDocumentFragment();
			if (count0 > 0) {
				var dom = vnode3.dom;
				while (--count0) fragment.appendChild(dom.nextSibling);
				fragment.insertBefore(dom, fragment.firstChild);
			}
			return fragment
		}
		else return vnode3.dom
	}
	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}
	function insertNode(parent, dom, nextSibling) {
		if (nextSibling != null) parent.insertBefore(dom, nextSibling);
		else parent.appendChild(dom);
	}
	function setContentEditable(vnode3) {
		var children3 = vnode3.children;
		if (children3 != null && children3.length === 1 && children3[0].tag === "<") {
			var content = children3[0].children;
			if (vnode3.dom.innerHTML !== content) vnode3.dom.innerHTML = content;
		}
		else if (vnode3.text != null || children3 != null && children3.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
	}
	//remove
	function removeNodes(vnodes, start, end) {
		for (var i = start; i < end; i++) {
			var vnode3 = vnodes[i];
			if (vnode3 != null) removeNode(vnode3);
		}
	}
	function removeNode(vnode3) {
		var expected = 1, called = 0;
		var original = vnode3.state;
		if (typeof vnode3.tag !== "string" && typeof vnode3.state.onbeforeremove === "function") {
			var result = callHook.call(vnode3.state.onbeforeremove, vnode3);
			if (result != null && typeof result.then === "function") {
				expected++;
				result.then(continuation, continuation);
			}
		}
		if (vnode3.attrs && typeof vnode3.attrs.onbeforeremove === "function") {
			var result = callHook.call(vnode3.attrs.onbeforeremove, vnode3);
			if (result != null && typeof result.then === "function") {
				expected++;
				result.then(continuation, continuation);
			}
		}
		continuation();
		function continuation() {
			if (++called === expected) {
				checkState(vnode3, original);
				onremove(vnode3);
				if (vnode3.dom) {
					var parent = vnode3.dom.parentNode;
					var count0 = vnode3.domSize || 1;
					while (--count0) parent.removeChild(vnode3.dom.nextSibling);
					parent.removeChild(vnode3.dom);
				}
			}
		}
	}
	function onremove(vnode3) {
		if (typeof vnode3.tag !== "string" && typeof vnode3.state.onremove === "function") callHook.call(vnode3.state.onremove, vnode3);
		if (vnode3.attrs && typeof vnode3.attrs.onremove === "function") callHook.call(vnode3.attrs.onremove, vnode3);
		if (typeof vnode3.tag !== "string") {
			if (vnode3.instance != null) onremove(vnode3.instance);
		} else {
			var children3 = vnode3.children;
			if (Array.isArray(children3)) {
				for (var i = 0; i < children3.length; i++) {
					var child = children3[i];
					if (child != null) onremove(child);
				}
			}
		}
	}
	//attrs2
	function setAttrs(vnode3, attrs2, ns) {
		for (var key in attrs2) {
			setAttr(vnode3, key, null, attrs2[key], ns);
		}
	}
	function setAttr(vnode3, key, old, value, ns) {
		if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode3, key)) && typeof value !== "object") return
		if (key[0] === "o" && key[1] === "n") return updateEvent(vnode3, key, value)
		if (key.slice(0, 6) === "xlink:") vnode3.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value);
		else if (key === "style") updateStyle(vnode3.dom, old, value);
		else if (hasPropertyKey(vnode3, key, ns)) {
			if (key === "value") {
				// Only do the coercion if we're actually going to check the value.
				/* eslint-disable no-implicit-coercion */
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if ((vnode3.tag === "input" || vnode3.tag === "textarea") && vnode3.dom.value === "" + value && vnode3.dom === activeElement()) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode3.tag === "select" && old !== null && vnode3.dom.value === "" + value) return
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode3.tag === "option" && old !== null && vnode3.dom.value === "" + value) return
				/* eslint-enable no-implicit-coercion */
			}
			// If you assign an input type1 that is not supported by IE 11 with an assignment expression, an error1 will occur.
			if (vnode3.tag === "input" && key === "type") vnode3.dom.setAttribute(key, value);
			else vnode3.dom[key] = value;
		} else {
			if (typeof value === "boolean") {
				if (value) vnode3.dom.setAttribute(key, "");
				else vnode3.dom.removeAttribute(key);
			}
			else vnode3.dom.setAttribute(key === "className" ? "class" : key, value);
		}
	}
	function removeAttr(vnode3, key, old, ns) {
		if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
		if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) updateEvent(vnode3, key, undefined);
		else if (key === "style") updateStyle(vnode3.dom, old, null);
		else if (
			hasPropertyKey(vnode3, key, ns)
			&& key !== "className"
			&& !(key === "value" && (
				vnode3.tag === "option"
				|| vnode3.tag === "select" && vnode3.dom.selectedIndex === -1 && vnode3.dom === activeElement()
			))
			&& !(vnode3.tag === "input" && key === "type")
		) {
			vnode3.dom[key] = null;
		} else {
			var nsLastIndex = key.indexOf(":");
			if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1);
			if (old !== false) vnode3.dom.removeAttribute(key === "className" ? "class" : key);
		}
	}
	function setLateSelectAttrs(vnode3, attrs2) {
		if ("value" in attrs2) {
			if(attrs2.value === null) {
				if (vnode3.dom.selectedIndex !== -1) vnode3.dom.value = null;
			} else {
				var normalized = "" + attrs2.value; // eslint-disable-line no-implicit-coercion
				if (vnode3.dom.value !== normalized || vnode3.dom.selectedIndex === -1) {
					vnode3.dom.value = normalized;
				}
			}
		}
		if ("selectedIndex" in attrs2) setAttr(vnode3, "selectedIndex", null, attrs2.selectedIndex, undefined);
	}
	function updateAttrs(vnode3, old, attrs2, ns) {
		if (attrs2 != null) {
			for (var key in attrs2) {
				setAttr(vnode3, key, old && old[key], attrs2[key], ns);
			}
		}
		var val;
		if (old != null) {
			for (var key in old) {
				if (((val = old[key]) != null) && (attrs2 == null || attrs2[key] == null)) {
					removeAttr(vnode3, key, val, ns);
				}
			}
		}
	}
	function isFormAttribute(vnode3, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode3.dom === activeElement() || vnode3.tag === "option" && vnode3.dom.parentNode === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function hasPropertyKey(vnode3, key, ns) {
		// Filter out namespaced keys
		return ns === undefined && (
			// If it's a custom element, just keep it.
			vnode3.tag.indexOf("-") > -1 || vnode3.attrs != null && vnode3.attrs.is ||
			// If it's a normal element, let's try to avoid a few browser bugs.
			key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
			// Defer the property check until *after* we check everything.
		) && key in vnode3.dom
	}
	//style
	var uppercaseRegex = /[A-Z]/g;
	function toLowerCase(capital) { return "-" + capital.toLowerCase() }
	function normalizeKey(key) {
		return key[0] === "-" && key[1] === "-" ? key :
			key === "cssFloat" ? "float" :
				key.replace(uppercaseRegex, toLowerCase)
	}
	function updateStyle(element, old, style) {
		if (old === style) ; else if (style == null) {
			// New style is missing, just clear it.
			element.style.cssText = "";
		} else if (typeof style !== "object") {
			// New style is a string, let engine deal with patching.
			element.style.cssText = style;
		} else if (old == null || typeof old !== "object") {
			// `old` is missing or a string, `style` is an object.
			element.style.cssText = "";
			// Add new style properties
			for (var key in style) {
				var value = style[key];
				if (value != null) element.style.setProperty(normalizeKey(key), String(value));
			}
		} else {
			// Both old & new are (different) objects.
			// Update style properties that have changed
			for (var key in style) {
				var value = style[key];
				if (value != null && (value = String(value)) !== String(old[key])) {
					element.style.setProperty(normalizeKey(key), value);
				}
			}
			// Remove style properties that no longer exist
			for (var key in old) {
				if (old[key] != null && style[key] == null) {
					element.style.removeProperty(normalizeKey(key));
				}
			}
		}
	}
	// Here's an explanation of how this works:
	// 1. The event names are always (by design) prefixed by `on`.
	// 2. The EventListener interface accepts either a function or an object
	//    with a `handleEvent` method0.
	// 3. The object does not inherit from `Object.prototype`, to avoid
	//    any potential interference with that (e.g. setters).
	// 4. The event name is remapped to the handler0 before calling it.
	// 5. In function-based event handlers, `ev.target === this`. We replicate
	//    that below.
	// 6. In function-based event handlers, `return false` prevents the default
	//    action and stops event propagation. We replicate that below.
	function EventDict() {}
	EventDict.prototype = Object.create(null);
	EventDict.prototype.handleEvent = function (ev) {
		var handler0 = this["on" + ev.type];
		var result;
		if (typeof handler0 === "function") result = handler0.call(ev.currentTarget, ev);
		else if (typeof handler0.handleEvent === "function") handler0.handleEvent(ev);
		if (ev.redraw === false) ev.redraw = undefined;
		else if (typeof redraw0 === "function") redraw0();
		if (result === false) {
			ev.preventDefault();
			ev.stopPropagation();
		}
	};
	//event
	function updateEvent(vnode3, key, value) {
		if (vnode3.events != null) {
			if (vnode3.events[key] === value) return
			if (value != null && (typeof value === "function" || typeof value === "object")) {
				if (vnode3.events[key] == null) vnode3.dom.addEventListener(key.slice(2), vnode3.events, false);
				vnode3.events[key] = value;
			} else {
				if (vnode3.events[key] != null) vnode3.dom.removeEventListener(key.slice(2), vnode3.events, false);
				vnode3.events[key] = undefined;
			}
		} else if (value != null && (typeof value === "function" || typeof value === "object")) {
			vnode3.events = new EventDict();
			vnode3.dom.addEventListener(key.slice(2), vnode3.events, false);
			vnode3.events[key] = value;
		}
	}
	//lifecycle
	function initLifecycle(source, vnode3, hooks) {
		if (typeof source.oninit === "function") callHook.call(source.oninit, vnode3);
		if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode3));
	}
	function updateLifecycle(source, vnode3, hooks) {
		if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode3));
	}
	function shouldNotUpdate(vnode3, old) {
		do {
			if (vnode3.attrs != null && typeof vnode3.attrs.onbeforeupdate === "function") {
				var force = callHook.call(vnode3.attrs.onbeforeupdate, vnode3, old);
				if (force !== undefined && !force) break
			}
			if (typeof vnode3.tag !== "string" && typeof vnode3.state.onbeforeupdate === "function") {
				var force = callHook.call(vnode3.state.onbeforeupdate, vnode3, old);
				if (force !== undefined && !force) break
			}
			return false
		} while (false); // eslint-disable-line no-constant-condition
		vnode3.dom = old.dom;
		vnode3.domSize = old.domSize;
		vnode3.instance = old.instance;
		return true
	}
	function render(dom, vnodes) {
		if (!dom) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
		var hooks = [];
		var active = activeElement();
		var namespace = dom.namespaceURI;
		// First time rendering0 into a node clears it out
		if (dom.vnodes == null) dom.textContent = "";
		vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes]);
		updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace);
		dom.vnodes = vnodes;
		// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
		if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus();
		for (var i = 0; i < hooks.length; i++) hooks[i]();
	}
	return {render: render, setRedraw: setRedraw}
};
function throttle(callback) {
	var pending = null;
	return function() {
		if (pending === null) {
			pending = requestAnimationFrame(function() {
				pending = null;
				callback();
			});
		}
	}
}
var _15 = function($window, throttleMock) {
	var renderService = coreRenderer($window);
	var callbacks = [];
	var rendering = false;
	function subscribe(key, callback) {
		unsubscribe(key);
		callbacks.push(key, callback);
	}
	function unsubscribe(key) {
		var index = callbacks.indexOf(key);
		if (index > -1) callbacks.splice(index, 2);
	}
	function sync() {
		if (rendering) throw new Error("Nested m.redraw.sync() call")
		rendering = true;
		for (var i = 1; i < callbacks.length; i+=2) try {callbacks[i]();} catch (e) {if (typeof console !== "undefined") console.error(e);}
		rendering = false;
	}
	var redraw = (throttleMock || throttle)(sync);
	redraw.sync = sync;
	renderService.setRedraw(redraw);
	return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render}
};
var redrawService = _15(window);
requestService.setCompletionCallback(redrawService.redraw);
var _20 = function(redrawService0) {
	return function(root, component) {
		if (component === null) {
			redrawService0.render(root, []);
			redrawService0.unsubscribe(root);
			return
		}
		
		if (component.view == null && typeof component !== "function") throw new Error("m.mount(element, component) expects a component, not a vnode")
		
		var run0 = function() {
			redrawService0.render(root, Vnode(component));
		};
		redrawService0.subscribe(root, run0);
		run0();
	}
};
m.mount = _20(redrawService);
var Promise$1 = PromisePolyfill;
var parseQueryString = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1);
	var entries = string.split("&"), data2 = {}, counters = {};
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=");
		var key2 = decodeURIComponent(entry[0]);
		var value0 = entry.length === 2 ? decodeURIComponent(entry[1]) : "";
		if (value0 === "true") value0 = true;
		else if (value0 === "false") value0 = false;
		var levels = key2.split(/\]\[?|\[/);
		var cursor = data2;
		if (key2.indexOf("[") > -1) levels.pop();
		for (var j0 = 0; j0 < levels.length; j0++) {
			var level = levels[j0], nextLevel = levels[j0 + 1];
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
			var isValue = j0 === levels.length - 1;
			if (level === "") {
				var key2 = levels.slice(0, j0).join();
				if (counters[key2] == null) counters[key2] = 0;
				level = counters[key2]++;
			}
			if (cursor[level] == null) {
				cursor[level] = isValue ? value0 : isNumber ? [] : {};
			}
			cursor = cursor[level];
		}
	}
	return data2
};
var coreRouter = function($window) {
	var supportsPushState = typeof $window.history.pushState === "function";
	var callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout;
	function normalize(fragment0) {
		var data1 = $window.location[fragment0].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent);
		if (fragment0 === "pathname" && data1[0] !== "/") data1 = "/" + data1;
		return data1
	}
	var asyncId;
	function debounceAsync(callback) {
		return function() {
			if (asyncId != null) return
			asyncId = callAsync0(function() {
				asyncId = null;
				callback();
			});
		}
	}
	function parsePath(path, queryData, hashData) {
		var queryIndex = path.indexOf("?");
		var hashIndex = path.indexOf("#");
		var pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length;
		if (queryIndex > -1) {
			var queryEnd = hashIndex > -1 ? hashIndex : path.length;
			var queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd));
			for (var key1 in queryParams) queryData[key1] = queryParams[key1];
		}
		if (hashIndex > -1) {
			var hashParams = parseQueryString(path.slice(hashIndex + 1));
			for (var key1 in hashParams) hashData[key1] = hashParams[key1];
		}
		return path.slice(0, pathEnd)
	}
	var router = {prefix: "#!"};
	router.getPath = function() {
		var type2 = router.prefix.charAt(0);
		switch (type2) {
			case "#": return normalize("hash").slice(router.prefix.length)
			case "?": return normalize("search").slice(router.prefix.length) + normalize("hash")
			default: return normalize("pathname").slice(router.prefix.length) + normalize("search") + normalize("hash")
		}
	};
	router.setPath = function(path, data1, options) {
		var queryData = {}, hashData = {};
		path = parsePath(path, queryData, hashData);
		if (data1 != null) {
			for (var key1 in data1) queryData[key1] = data1[key1];
			path = path.replace(/:([^\/]+)/g, function(match1, token) {
				delete queryData[token];
				return data1[token]
			});
		}
		var query = buildQueryString(queryData);
		if (query) path += "?" + query;
		var hash = buildQueryString(hashData);
		if (hash) path += "#" + hash;
		if (supportsPushState) {
			var state = options ? options.state : null;
			var title = options ? options.title : null;
			$window.onpopstate();
			if (options && options.replace) $window.history.replaceState(state, title, router.prefix + path);
			else $window.history.pushState(state, title, router.prefix + path);
		}
		else $window.location.href = router.prefix + path;
	};
	router.defineRoutes = function(routes, resolve, reject) {
		function resolveRoute() {
			var path = router.getPath();
			var params = {};
			var pathname = parsePath(path, params, params);
			var state = $window.history.state;
			if (state != null) {
				for (var k in state) params[k] = state[k];
			}
			for (var route0 in routes) {
				var matcher = new RegExp("^" + route0.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");
				if (matcher.test(pathname)) {
					pathname.replace(matcher, function() {
						var keys = route0.match(/:[^\/]+/g) || [];
						var values = [].slice.call(arguments, 1, -2);
						for (var i = 0; i < keys.length; i++) {
							params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i]);
						}
						resolve(routes[route0], params, path, route0);
					});
					return
				}
			}
			reject(path, params);
		}
		if (supportsPushState) $window.onpopstate = debounceAsync(resolveRoute);
		else if (router.prefix.charAt(0) === "#") $window.onhashchange = resolveRoute;
		resolveRoute();
	};
	return router
};
var _24 = function($window, redrawService0) {
	var routeService = coreRouter($window);
	var identity = function(v0) {return v0};
	var render1, component, attrs3, currentPath, lastUpdate;
	var route = function(root, defaultRoute, routes) {
		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		function run1() {
			if (render1 != null) redrawService0.render(root, render1(Vnode(component, attrs3.key, attrs3)));
		}
		var redraw3 = function() {
			run1();
			redraw3 = redrawService0.redraw;
		};
		redrawService0.subscribe(root, run1);
		var bail = function(path) {
			if (path !== defaultRoute) routeService.setPath(defaultRoute, null, {replace: true});
			else throw new Error("Could not resolve default route " + defaultRoute)
		};
		routeService.defineRoutes(routes, function(payload, params, path) {
			var update = lastUpdate = function(routeResolver, comp) {
				if (update !== lastUpdate) return
				component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div";
				attrs3 = params, currentPath = path, lastUpdate = null;
				render1 = (routeResolver.render || identity).bind(routeResolver);
				redraw3();
			};
			if (payload.view || typeof payload === "function") update({}, payload);
			else {
				if (payload.onmatch) {
					Promise$1.resolve(payload.onmatch(params, path)).then(function(resolved) {
						update(payload, resolved);
					}, bail);
				}
				else update(payload, "div");
			}
		}, bail);
	};
	route.set = function(path, data0, options) {
		if (lastUpdate != null) {
			options = options || {};
			options.replace = true;
		}
		lastUpdate = null;
		routeService.setPath(path, data0, options);
	};
	route.get = function() {return currentPath};
	route.prefix = function(prefix) {routeService.prefix = prefix;};
	var link = function(options, vnode5) {
		vnode5.dom.setAttribute("href", routeService.prefix + vnode5.attrs.href);
		vnode5.dom.onclick = function(e) {
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return
			e.preventDefault();
			e.redraw = false;
			var href = this.getAttribute("href");
			if (href.indexOf(routeService.prefix) === 0) href = href.slice(routeService.prefix.length);
			route.set(href, undefined, options);
		};
	};
	route.link = function(args0) {
		if (args0.tag == null) return link.bind(link, args0)
		return link({}, args0)
	};
	route.param = function(key0) {
		if(typeof attrs3 !== "undefined" && typeof key0 !== "undefined") return attrs3[key0]
		return attrs3
	};
	return route
};
m.route = _24(window, redrawService);
var _31 = coreRenderer(window);
m.render = _31.render;
m.redraw = redrawService.redraw;
m.request = requestService.request;
m.jsonp = requestService.jsonp;
m.parseQueryString = parseQueryString;
m.buildQueryString = buildQueryString;
m.version = "2.0.0-rc.4";
m.vnode = Vnode;
m.PromisePolyfill = PromisePolyfill;class Component {
  constructor() {
    if (typeof this.view !== 'function') { throw new TypeError('children must override view()!'); }
  }
}const USER_STORAGE_KEY = 'user';
const DISPLAYNAME_STORAGE_KEY = 'displayname';
const DLIVE_BACKEND_URL = 'https://graphigo.prd.dlive.tv/';
const DLIVE_FRONTEND_URL = 'https://dlive.tv/';
const LOGIN_ROUTE = '/login';
const STREAMS_ROUTE = '/streams';
const ABOUT_ROUTE = '/about';
const UPDATE_USER_INFO_MESSAGE = 'UPDATE_USER_INFO';let user;

class PopupHeading extends Component {

  constructor () {
    super ();
    user = JSON.parse (localStorage.getItem (USER_STORAGE_KEY));
  }

  logout () {
    localStorage.clear ();
    if (LOGIN_ROUTE === m.route.get ()) { return; }
  }

  computeCorrectHomeRoute () {
    if (localStorage.getItem (DISPLAYNAME_STORAGE_KEY)) {
      return STREAMS_ROUTE;
    }
    return LOGIN_ROUTE;
  }

  home () {
    m.route.set (this.computeCorrectHomeRoute ());
  }

  userDropdown (user) {
    return m ('user-dropdown', {class: 'self-center flex-none'}, [
      m ('div', {class: 'dropdown dropdown-right'}, [
        m ('a', {
          class: 'btn btn-link dropdown-toggle no-pad',
          tabindex: 0
        }, [
          m ('img', {class: 'avatar', src: user.avatar}),
          m ('i', {class: 'icon icon-caret'})
        ]),
        m ('ul', {class: 'menu'}, [
          m ('li', {class: 'displayname menu-item'}, user.displayname),
          m ('li', {
            class: 'menu-item',
          }, [
            m ('a', {
              class: 'relative block',
              href: ABOUT_ROUTE, 
              oncreate: m.route.link, 
              onupdate: m.route.link
            }, 
            chrome.i18n.getMessage ('about'))
          ]),
          m ('li', {
            class: 'menu-item',
            onclick: this.logout.bind (this)
          }, [
            m ('a', {
              class: 'relative block',
              href: LOGIN_ROUTE, 
              oncreate: m.route.link,
              onupdate: m.route.link
            }, 
            chrome.i18n.getMessage ('logout'))
          ])
        ])
      ])
    ]);
  }

  maybeUserDropdown (user) {
    if (!user) { return null; }
    return this.userDropdown (user);
  }

  view () {
    return m ('popup-heading', {class: 'relative flex space-between no-wrap'}, [
      m ('div', {class: 'self-center flex-none'}, [
        m ('img', {class: 'logo', src: '/images/icons/icon-48.png', onclick: this.home.bind (this)})
      ]),
      m ('div', {class: 'flex flex-1 justify-center'}, [
        m ('h4', {class: 'title self-center'}, chrome.i18n.getMessage('name'))
      ]),
      this.maybeUserDropdown (user)
    ]);
  }
}var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** Class to realize fetch interceptors */
var FetchInterceptor = function () {
  function FetchInterceptor() {
    var _this = this;

    _classCallCheck(this, FetchInterceptor);

    this.interceptors = [];

    this.fetch = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _this.interceptorWrapper.apply(_this, [fetch].concat(args));
    };
  }

  /**
   * add new interceptors
   * @param {(Object|Object[])} interceptors
   */


  _createClass(FetchInterceptor, [{
    key: 'addInterceptors',
    value: function addInterceptors(interceptors) {
      var _this2 = this;

      var removeIndex = [];

      if (Array.isArray(interceptors)) {
        interceptors.map(function (interceptor) {
          removeIndex.push(_this2.interceptors.length);
          return _this2.interceptors.push(interceptor);
        });
      } else if (interceptors instanceof Object) {
        removeIndex.push(this.interceptors.length);
        this.interceptors.push(interceptors);
      }

      this.updateInterceptors();

      return function () {
        return _this2.removeInterceptors(removeIndex);
      };
    }

    /**
     * remove interceptors by indexes
     * @param {number[]} indexes 
     */

  }, {
    key: 'removeInterceptors',
    value: function removeInterceptors(indexes) {
      var _this3 = this;

      if (Array.isArray(indexes)) {
        indexes.map(function (index) {
          return _this3.interceptors.splice(index, 1);
        });
        this.updateInterceptors();
      }
    }

    /**
     * @private
     */

  }, {
    key: 'updateInterceptors',
    value: function updateInterceptors() {
      this.reversedInterceptors = this.interceptors.reduce(function (array, interceptor) {
        return [interceptor].concat(array);
      }, []);
    }

    /**
     * remove all interceptors
     */

  }, {
    key: 'clearInterceptors',
    value: function clearInterceptors() {
      this.interceptors = [];

      this.updateInterceptors();
    }

    /**
     * @private
     */

  }, {
    key: 'interceptorWrapper',
    value: function interceptorWrapper(fetch) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var promise = Promise.resolve(args);

      this.reversedInterceptors.forEach(function (_ref) {
        var request = _ref.request,
            requestError = _ref.requestError;

        if (request || requestError) {
          promise = promise.then(function () {
            return request.apply(undefined, args);
          }, requestError);
        }
      });

      promise = promise.then(function () {
        return fetch.apply(undefined, args);
      });

      this.reversedInterceptors.forEach(function (_ref2) {
        var response = _ref2.response,
            responseError = _ref2.responseError;

        if (response || responseError) {
          promise = promise.then(response, responseError);
        }
      });

      return promise;
    }
  }]);

  return FetchInterceptor;
}();

/**
 * GraphQL client with fetch api.
 * @extends FetchInterceptor
 */


var FetchQL = function (_FetchInterceptor) {
  _inherits(FetchQL, _FetchInterceptor);

  /**
   * Create a FetchQL instance.
   * @param {Object} options
   * @param {String} options.url - the server address of GraphQL
   * @param {(Object|Object[])=} options.interceptors
   * @param {{}=} options.headers - request headers
   * @param {FetchQL~requestQueueChanged=} options.onStart - callback function of a new request queue
   * @param {FetchQL~requestQueueChanged=} options.onEnd - callback function of request queue finished
   * @param {Boolean=} options.omitEmptyVariables - remove null props(null or '') from the variables
   * @param {Object=} options.requestOptions - addition options to fetch request(refer to fetch api)
   */
  function FetchQL(_ref3) {
    var url = _ref3.url,
        interceptors = _ref3.interceptors,
        headers = _ref3.headers,
        onStart = _ref3.onStart,
        onEnd = _ref3.onEnd,
        _ref3$omitEmptyVariab = _ref3.omitEmptyVariables,
        omitEmptyVariables = _ref3$omitEmptyVariab === undefined ? false : _ref3$omitEmptyVariab,
        _ref3$requestOptions = _ref3.requestOptions,
        requestOptions = _ref3$requestOptions === undefined ? {} : _ref3$requestOptions;

    _classCallCheck(this, FetchQL);

    var _this4 = _possibleConstructorReturn(this, (FetchQL.__proto__ || Object.getPrototypeOf(FetchQL)).call(this));

    _this4.requestObject = Object.assign({}, {
      method: 'POST',
      headers: Object.assign({}, {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }, headers),
      credentials: 'same-origin'
    }, requestOptions);

    _this4.url = url;

    _this4.omitEmptyVariables = omitEmptyVariables;

    // marker for request queue
    _this4.requestQueueLength = 0;

    // using for caching enums' type
    _this4.EnumMap = {};

    _this4.callbacks = {
      onStart: onStart,
      onEnd: onEnd
    };

    _this4.addInterceptors(interceptors);
    return _this4;
  }

  /**
   * operate a query
   * @param {Object} options
   * @param {String} options.operationName
   * @param {String} options.query
   * @param {Object=} options.variables
   * @param {Object=} options.opts - addition options(will not be passed to server)
   * @param {Boolean=} options.opts.omitEmptyVariables - remove null props(null or '') from the variables
   * @param {Object=} options.requestOptions - addition options to fetch request(refer to fetch api)
   * @returns {Promise}
   * @memberOf FetchQL
   */


  _createClass(FetchQL, [{
    key: 'query',
    value: function query(_ref4) {
      var _this5 = this;

      var operationName = _ref4.operationName,
          _query = _ref4.query,
          variables = _ref4.variables,
          _ref4$opts = _ref4.opts,
          opts = _ref4$opts === undefined ? {} : _ref4$opts,
          _ref4$requestOptions = _ref4.requestOptions,
          requestOptions = _ref4$requestOptions === undefined ? {} : _ref4$requestOptions;

      var options = Object.assign({}, this.requestObject, requestOptions);
      var vars = void 0;
      if (this.omitEmptyVariables || opts.omitEmptyVariables) {
        vars = this.doOmitEmptyVariables(variables);
      } else {
        vars = variables;
      }
      var body = {
        operationName: operationName,
        query: _query,
        variables: vars
      };
      options.body = JSON.stringify(body);

      this.onStart();

      return this.fetch(this.url, options).then(function (res) {
        if (res.ok) {
          return res.json();
        }
        // return an custom error stack if request error
        return {
          errors: [{
            message: res.statusText,
            stack: res
          }]
        };
      }).then(function (_ref5) {
        var data = _ref5.data,
            errors = _ref5.errors;
        return new Promise(function (resolve, reject) {
          _this5.onEnd();

          // if data in response is 'null'
          if (!data) {
            return reject(errors || [{}]);
          }
          // if all properties of data is 'null'
          var allDataKeyEmpty = Object.keys(data).every(function (key) {
            return !data[key];
          });
          if (allDataKeyEmpty) {
            return reject(errors);
          }
          return resolve({ data: data, errors: errors });
        });
      });
    }

    /**
     * get current server address
     * @returns {String}
     * @memberOf FetchQL
     */

  }, {
    key: 'getUrl',
    value: function getUrl() {
      return this.url;
    }

    /**
     * setting a new server address
     * @param {String} url
     * @memberOf FetchQL
     */

  }, {
    key: 'setUrl',
    value: function setUrl(url) {
      this.url = url;
    }

    /**
     * get information of enum type
     * @param {String[]} EnumNameList - array of enums' name
     * @returns {Promise}
     * @memberOf FetchQL
     */

  }, {
    key: 'getEnumTypes',
    value: function getEnumTypes(EnumNameList) {
      var _this6 = this;

      var fullData = {};

      // check cache status
      var unCachedEnumList = EnumNameList.filter(function (element) {
        if (_this6.EnumMap[element]) {
          // enum has been cached
          fullData[element] = _this6.EnumMap[element];
          return false;
        }
        return true;
      });

      // immediately return the data if all enums have been cached
      if (!unCachedEnumList.length) {
        return new Promise(function (resolve) {
          resolve({ data: fullData });
        });
      }

      // build query string for uncached enums
      var EnumTypeQuery = unCachedEnumList.map(function (type) {
        return type + ': __type(name: "' + type + '") {\n        ...EnumFragment\n      }';
      });

      var query = '\n      query {\n        ' + EnumTypeQuery.join('\n') + '\n      }\n      \n      fragment EnumFragment on __Type {\n        kind\n        description\n        enumValues {\n          name\n          description\n        }\n      }';

      var options = Object.assign({}, this.requestObject);
      options.body = JSON.stringify({ query: query });

      this.onStart();

      return this.fetch(this.url, options).then(function (res) {
        if (res.ok) {
          return res.json();
        }
        // return an custom error stack if request error
        return {
          errors: [{
            message: res.statusText,
            stack: res
          }]
        };
      }).then(function (_ref6) {
        var data = _ref6.data,
            errors = _ref6.errors;
        return new Promise(function (resolve, reject) {
          _this6.onEnd();

          // if data in response is 'null' and have any errors
          if (!data) {
            return reject(errors || [{ message: 'Do not get any data.' }]);
          }
          // if all properties of data is 'null'
          var allDataKeyEmpty = Object.keys(data).every(function (key) {
            return !data[key];
          });
          if (allDataKeyEmpty && errors && errors.length) {
            return reject(errors);
          }
          // merge enums' data
          var passData = Object.assign(fullData, data);
          // cache new enums' data
          Object.keys(data).map(function (key) {
            _this6.EnumMap[key] = data[key];
            return key;
          });
          return resolve({ data: passData, errors: errors });
        });
      });
    }

    /**
     * calling on a request starting
     * if the request belong to a new queue, call the 'onStart' method
     */

  }, {
    key: 'onStart',
    value: function onStart() {
      this.requestQueueLength++;
      if (this.requestQueueLength > 1 || !this.callbacks.onStart) {
        return;
      }
      this.callbacks.onStart(this.requestQueueLength);
    }

    /**
     * calling on a request ending
     * if current queue finished, calling the 'onEnd' method
     */

  }, {
    key: 'onEnd',
    value: function onEnd() {
      this.requestQueueLength--;
      if (this.requestQueueLength || !this.callbacks.onEnd) {
        return;
      }
      this.callbacks.onEnd(this.requestQueueLength);
    }

    /**
     * Callback of requests queue changes.(e.g. new queue or queue finished)
     * @callback FetchQL~requestQueueChanged
     * @param {number} queueLength - length of current request queue
     */

    /**
     * remove empty props(null or '') from object
     * @param {Object} input
     * @returns {Object}
     * @memberOf FetchQL
     * @private
     */

  }, {
    key: 'doOmitEmptyVariables',
    value: function doOmitEmptyVariables(input) {
      var _this7 = this;

      var nonEmptyObj = {};
      Object.keys(input).map(function (key) {
        var value = input[key];
        if (typeof value === 'string' && value.length === 0 || value === null || value === undefined) {
          return key;
        } else if (value instanceof Object) {
          nonEmptyObj[key] = _this7.doOmitEmptyVariables(value);
        } else {
          nonEmptyObj[key] = value;
        }
        return key;
      });
      return nonEmptyObj;
    }
  }]);

  return FetchQL;
}(FetchInterceptor);class Message {
  constructor (kind) {
    this.kind = kind;
  }
}

class UpdateUserInfo extends Message {
  constructor () {
    super (UPDATE_USER_INFO_MESSAGE);
  }
}let users = [];

class PopupSearchResults extends Component {

  constructor (response) {
    super ();
    if (!response || !response.data) { users = []; return; } 
    users = response.data.search.users.list;
  }

  emptyState () {
    return [
      m ('div', {class: 'relative empty'}, [
        m ('div', {class: 'empty-icon'}, [
          m ('i', {class: 'icon icon-people'})
        ]),
        m ('p', {class: 'empty-title h5'}, chrome.i18n.getMessage('search_empty_title')),
        m ('p', {class: 'empty-subtitle'}, chrome.i18n.getMessage('search_empty_subtitle'))
      ])
    ];
  }

  selectUser(user) {
    localStorage.setItem (DISPLAYNAME_STORAGE_KEY, user.displayname);
    chrome.runtime.sendMessage(new UpdateUserInfo(), () => {
      m.route.set (STREAMS_ROUTE);
      m.redraw ();
    });
  }

  userList (users) {
    return users.map ((user) => {
      return m ('user', {
        class: 'tile tile-centered', 
        key: user.id,
        onclick: this.selectUser.bind (this, user)
      }, [
        m ('div', {class: 'tile-icon'}, [
          m ('img', {class: 'avatar centered', src: user.avatar}, [])
        ]),
        m ('div', {class: 'tile-content'}, [
          m ('div', {class: 'tile-title'}, user.displayname),
          m ('div', {class: 'tile-subtitle text-grey'}, [
            m ('i', {class: 'icon icon-people'}),
            m ('small', user.followers.totalCount)
          ])
        ])
      ]);
    });
  }

  maybeShowUserList (users) {
    if (!users.length) { return this.emptyState (); }
    return this.userList (users);
  }

  maybeShowPagination () {
    return null;
  }

  view () {
    return m ('popup-search-results', [
      this.maybeShowUserList(users),
      this.maybeShowPagination()
    ]);
  }
}const DISPLAYNAME_DOM_ID = 'display-name';
const DLIVE_SEARCH_QUERY = `
query SearchPage($text: String!, $first: Int, $after: String) {
  search(text: $text) {
    users(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      list {
        displayname
        avatar
        id
        username
        displayname
        followers {
          totalCount
        }
      }
    }
  }
}`;

let displayname = '';
let first = 10;
let after = '';
let searchData = null;

class PopupLogin extends Component {

  oncreate(vnode) {
    if (!vnode) { return; }
    vnode.dom.querySelector('#' + DISPLAYNAME_DOM_ID).addEventListener('keypress', this.maybeSearch.bind (this, vnode));
  }

  maybeSearch (vnode, event) {
    if(event.keyCode !== 13) { return; }
    this.search (vnode);
  }

  buildDliveQuery () {
    return new FetchQL ({url: DLIVE_BACKEND_URL });
  }

  onUsersSearched (response) {
    searchData = response;
    m.redraw ();
  }

  buildQuerySearchUsers (displayname) {
    if (!displayname) { return; }
    return this.buildDliveQuery ().query ({
      operationName: 'SearchPage',
      variables: {
        text: displayname,
        first: first,
        after: after
      },
      query: DLIVE_SEARCH_QUERY
    });
  }
  
  search (vnode) {
    if (!vnode) { return; }
    let input = vnode.dom.querySelector ('#' + DISPLAYNAME_DOM_ID);
    displayname = input.value;
    if (!displayname) { return; }
    this.buildQuerySearchUsers (displayname).then (this.onUsersSearched);
  }

  computeSearchIconClass (searchData, displayName) {
    if (displayName && !searchData) { return 'form-icon loading'; }
    return 'form-icon icon icon-search';
  }

  maybeDisplaySearchResults (searchData) {
    if (!searchData) { return null; }
    return m (new PopupSearchResults (searchData));
  }

  view (vnode) {
    return m ('popup-login', {class: 'relative form-group'}, [
      m ('div', {class: 'has-icon-right'}, [
        m ('input', {
          id: DISPLAYNAME_DOM_ID,
          class: 'form-input',
          type: 'text',
          placeholder: chrome.i18n.getMessage('login_placeholder'),
          value: this.displayname,
          autofocus: true
        }),
        m ('i', {
          class: this.computeSearchIconClass (searchData, displayname),
          onclick: this.search.bind (this, vnode)
        })
      ]),
      this.maybeDisplaySearchResults (searchData)
    ]);
  }
}class PopupStreams extends Component {
  emptyState () {
    return [
      m ('div', {class: 'relative empty'}, [
        m ('div', {class: 'empty-icon'}, [
          m ('i', {class: 'icon icon-bookmark'})
        ]),
        m ('p', {class: 'empty-title h5'}, chrome.i18n.getMessage('streams_empty_title')),
        m ('p', {class: 'empty-subtitle'}, chrome.i18n.getMessage('streams_empty_subtitle'))
      ])
    ];
  }

  computeStreamLink (user) {
    return DLIVE_FRONTEND_URL + user.displayname;
  }

  followingList (following) {
    return following.map ((user) => {
      return m ('a', {
        href: this.computeStreamLink(user), 
        target:'_blank', 
        rel:'noopener noreferrer'
      }, [
        m ('stream', {class: 'tile tile-centered'}, [
          m ('div', {class: 'tile-icon'}, [
            m ('img', {class: 'thumbnail centered', src: user.livestream.thumbnailUrl}, [])
          ]),
          m ('div', {class: 'tile-content'}, [
            m ('div', {class: 'tile-title'}, [
              m ('div', {class: 'stream-user'}, user.displayname),
              m ('i', {class: 'icon icon-people'}),
              m ('small', user.livestream.watchingCount)
            ]),
            m ('div', {class: 'tile-subtitle text-grey'}, [
              m ('div', {class: 'stream-title'}, user.livestream.title),
              m ('div', {class: 'stream-cateogry'}, user.livestream.category.title)
            ])
          ])
        ])
      ]);
    });
  }

  maybeShowFollowingList (following) {
    if (!following || !following.length) { return this.emptyState (); }
    return this.followingList (following);
  }

  getFollowingWithLivestreams () {
    let user = localStorage.getItem(USER_STORAGE_KEY);
    if (!user) { return []; }
    user = JSON.parse (user);
    return user.following.list.filter ((following) => {
      return following.livestream !== null;
    }).map((following) => {
      return following;
    });
  }

  view () {
    return m ('popup-streams', {class: 'relative'}, [
      this.maybeShowFollowingList (this.getFollowingWithLivestreams ())
    ]);
  }
}class DonationAddress {
  constructor (name, address, image) {
    this.name = name;
    this.address = address;
    this.image = image;
  }
}const DONATION_ADDRESSES = [
  new DonationAddress (
    chrome.i18n.getMessage('eth'),
    '0x7D2749fE22B21667Ae0f90B070Bcd82C7f5b6bcc',
    '/images/about/eth.png'),
  new DonationAddress (
    chrome.i18n.getMessage('bch'),
    '14J9Wp3MWetHZLCjcHTL7v8Vcqc4KANi3C',
    '/images/about/bch.png'),
  new DonationAddress (
    chrome.i18n.getMessage('dash'),
    'XfFa5Mxr21KTRJuyhzxVwrhjPyLCeDfQ3d',
    '/images/about/dash.png'),
  new DonationAddress (
    chrome.i18n.getMessage('zec'),
    't1e9P7x62cZ4TTt9pBVJcaQ5HBbnuCg5iwH',
    '/images/about/zec.png')
];

class PopupAbout extends Component {
  
  donationAddressList (addresses) {
    return addresses.map ((item, index) => {
      return m ('div', {class: 'accordion'}, [
        m ('input', {type: 'checkbox', id: 'accordion-' + index, name: 'accordion-checkbox', hidden: true}),
        m ('label', {class: 'accordion-header', for: 'accordion-' + index}, [
          m ('i', {class: 'icon icon-arrow-right mr-1'}),
          m ('span', item.name)
        ]),
        m ('div', {class: 'accordion-body'}, [
          m ('p', item.address),
          m ('img', {class: 'donation-image', src: item.image})
        ])
      ]);
    });
  }

  view () {
    return m ('popup-about', {class: 'relative'}, [
      m ('a', {
        class: 'relative block flex row',
        href: 'https://github.com/MichaelAllenHardeman/dlive-companion',
        target:'_blank', 
        rel:'noopener noreferrer'
      }, [
        m ('img', {src: '/images/about/GitHub-Mark-Light-32px.png', class: 'github-logo'}),
        m ('span', {class: 'self-center flex-auto'}, 'DLive Companion')
      ]),
      m ('div', {class: 'about'}, [
        m ('span', chrome.i18n.getMessage('about_description'))
      ]),
      this.donationAddressList (DONATION_ADDRESSES)
    ]);
  }
}const ROUTE_DOM_ID = 'routes';

class PopupBody extends Component {
  computeDefaultRoute () {
    if (localStorage.getItem (DISPLAYNAME_STORAGE_KEY)) {
      return STREAMS_ROUTE;
    }
    return LOGIN_ROUTE;
  }

  oncreate (vnode) {
    m.route.mode = 'hash';
    const routes = {};
    routes [LOGIN_ROUTE] = new PopupLogin ();
    routes [STREAMS_ROUTE] = new PopupStreams ();
    routes [ABOUT_ROUTE] = new PopupAbout ();
    m.route (vnode.dom.querySelector ('#' + ROUTE_DOM_ID), this.computeDefaultRoute (), routes);
  }

  view () {
    return m ('popup-body', {class: 'relative'}, [
      m ('div', {id: ROUTE_DOM_ID})
    ]);
  }
}class PopupMain extends Component {
  constructor () {
    super ();
    chrome.runtime.sendMessage(new UpdateUserInfo(), () => {
      m.redraw ();
    });
  }

  view () {
    return m ('popup-main', {class: 'relative block'}, [
      m (new PopupHeading ()),
      m (new PopupBody ())
    ]);
  }
}m.mount (document.body, new PopupMain ());}());