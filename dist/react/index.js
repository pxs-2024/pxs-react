(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.React = {}));
})(this, (function (exports) { 'use strict';

	const supportSymbol = typeof Symbol === 'function' && Symbol.for;
	const REACT_ELEMENT_TYPE = supportSymbol
	    ? Symbol.for('react.element')
	    : 0xeac7;

	// ReactElement
	const ReactElement = function (type, key, ref, props) {
	    const element = {
	        $$typeof: REACT_ELEMENT_TYPE,
	        type,
	        key,
	        ref,
	        props,
	        __mark: 'pxs'
	    };
	    return element;
	};
	const jsxDEV = (type, config, key = null) => {
	    const props = {};
	    let ref = null;
	    for (const prop in config) {
	        const val = config[prop];
	        if (prop === 'ref') {
	            if (val !== undefined) {
	                ref = val;
	            }
	            continue;
	        }
	        if ({}.hasOwnProperty.call(config, prop)) {
	            props[prop] = val;
	        }
	    }
	    return ReactElement(type, key, ref, props);
	};

	const version = '0.0.0';
	// TODO 根据环境区分使用jsx/jsxDev
	const createElement = jsxDEV;

	exports.createElement = createElement;
	exports.version = version;

}));
