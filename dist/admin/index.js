"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const React = require("react");
const jsxRuntime = require("react/jsx-runtime");
const designSystem = require("@strapi/design-system");
const admin = require("@strapi/strapi/admin");
function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const React__namespace = /* @__PURE__ */ _interopNamespace(React);
const __variableDynamicImportRuntimeHelper = (glob, path, segs) => {
  const v = glob[path];
  if (v) {
    return typeof v === "function" ? v() : Promise.resolve(v);
  }
  return new Promise((_, reject) => {
    (typeof queueMicrotask === "function" ? queueMicrotask : setTimeout)(
      reject.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + path + (path.split("/").length !== segs ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
const PLUGIN_ID = "image-rotate";
const Initializer = ({ setPlugin }) => {
  const ref = React.useRef(setPlugin);
  React.useEffect(() => {
    ref.current(PLUGIN_ID);
  }, []);
  return null;
};
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function memoize(fn, options) {
  var cache = options && options.cache ? options.cache : cacheDefault;
  var serializer = options && options.serializer ? options.serializer : serializerDefault;
  var strategy = options && options.strategy ? options.strategy : strategyDefault;
  return strategy(fn, {
    cache,
    serializer
  });
}
function isPrimitive(value) {
  return value == null || typeof value === "number" || typeof value === "boolean";
}
function monadic(fn, cache, serializer, arg) {
  var cacheKey = isPrimitive(arg) ? arg : serializer(arg);
  var computedValue = cache.get(cacheKey);
  if (typeof computedValue === "undefined") {
    computedValue = fn.call(this, arg);
    cache.set(cacheKey, computedValue);
  }
  return computedValue;
}
function variadic(fn, cache, serializer) {
  var args = Array.prototype.slice.call(arguments, 3);
  var cacheKey = serializer(args);
  var computedValue = cache.get(cacheKey);
  if (typeof computedValue === "undefined") {
    computedValue = fn.apply(this, args);
    cache.set(cacheKey, computedValue);
  }
  return computedValue;
}
function assemble(fn, context, strategy, cache, serialize) {
  return strategy.bind(context, fn, cache, serialize);
}
function strategyDefault(fn, options) {
  var strategy = fn.length === 1 ? monadic : variadic;
  return assemble(fn, this, strategy, options.cache.create(), options.serializer);
}
function strategyVariadic(fn, options) {
  return assemble(fn, this, variadic, options.cache.create(), options.serializer);
}
var serializerDefault = function() {
  return JSON.stringify(arguments);
};
function ObjectWithoutPrototypeCache() {
  this.cache = /* @__PURE__ */ Object.create(null);
}
ObjectWithoutPrototypeCache.prototype.get = function(key) {
  return this.cache[key];
};
ObjectWithoutPrototypeCache.prototype.set = function(key, value) {
  this.cache[key] = value;
};
var cacheDefault = {
  create: function create() {
    return new ObjectWithoutPrototypeCache();
  }
};
var strategies = {
  variadic: strategyVariadic
};
function invariant(condition, message, Err) {
  if (Err === void 0) {
    Err = Error;
  }
  if (!condition) {
    throw new Err(message);
  }
}
memoize(function() {
  var _a;
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  return new ((_a = Intl.NumberFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
}, {
  strategy: strategies.variadic
});
memoize(function() {
  var _a;
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  return new ((_a = Intl.DateTimeFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
}, {
  strategy: strategies.variadic
});
memoize(function() {
  var _a;
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  return new ((_a = Intl.PluralRules).bind.apply(_a, __spreadArray([void 0], args, false)))();
}, {
  strategy: strategies.variadic
});
memoize(function() {
  var _a;
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  return new ((_a = Intl.Locale).bind.apply(_a, __spreadArray([void 0], args, false)))();
}, {
  strategy: strategies.variadic
});
memoize(function() {
  var _a;
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  return new ((_a = Intl.ListFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
}, {
  strategy: strategies.variadic
});
var defaultErrorHandler = function(error) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }
};
var defaultWarnHandler = function(warning) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(warning);
  }
};
var DEFAULT_INTL_CONFIG = {
  formats: {},
  messages: {},
  timeZone: void 0,
  defaultLocale: "en",
  defaultFormats: {},
  fallbackOnEmptyString: true,
  onError: defaultErrorHandler,
  onWarn: defaultWarnHandler
};
function invariantIntlContext(intl) {
  invariant(intl, "[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.");
}
__assign(__assign({}, DEFAULT_INTL_CONFIG), { textComponent: React__namespace.Fragment });
var reactIs = { exports: {} };
var reactIs_production_min = {};
/** @license React v16.13.1
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactIs_production_min;
function requireReactIs_production_min() {
  if (hasRequiredReactIs_production_min) return reactIs_production_min;
  hasRequiredReactIs_production_min = 1;
  var b = "function" === typeof Symbol && Symbol.for, c = b ? Symbol.for("react.element") : 60103, d = b ? Symbol.for("react.portal") : 60106, e = b ? Symbol.for("react.fragment") : 60107, f = b ? Symbol.for("react.strict_mode") : 60108, g = b ? Symbol.for("react.profiler") : 60114, h = b ? Symbol.for("react.provider") : 60109, k = b ? Symbol.for("react.context") : 60110, l = b ? Symbol.for("react.async_mode") : 60111, m = b ? Symbol.for("react.concurrent_mode") : 60111, n = b ? Symbol.for("react.forward_ref") : 60112, p = b ? Symbol.for("react.suspense") : 60113, q = b ? Symbol.for("react.suspense_list") : 60120, r = b ? Symbol.for("react.memo") : 60115, t = b ? Symbol.for("react.lazy") : 60116, v = b ? Symbol.for("react.block") : 60121, w = b ? Symbol.for("react.fundamental") : 60117, x = b ? Symbol.for("react.responder") : 60118, y = b ? Symbol.for("react.scope") : 60119;
  function z(a) {
    if ("object" === typeof a && null !== a) {
      var u = a.$$typeof;
      switch (u) {
        case c:
          switch (a = a.type, a) {
            case l:
            case m:
            case e:
            case g:
            case f:
            case p:
              return a;
            default:
              switch (a = a && a.$$typeof, a) {
                case k:
                case n:
                case t:
                case r:
                case h:
                  return a;
                default:
                  return u;
              }
          }
        case d:
          return u;
      }
    }
  }
  function A(a) {
    return z(a) === m;
  }
  reactIs_production_min.AsyncMode = l;
  reactIs_production_min.ConcurrentMode = m;
  reactIs_production_min.ContextConsumer = k;
  reactIs_production_min.ContextProvider = h;
  reactIs_production_min.Element = c;
  reactIs_production_min.ForwardRef = n;
  reactIs_production_min.Fragment = e;
  reactIs_production_min.Lazy = t;
  reactIs_production_min.Memo = r;
  reactIs_production_min.Portal = d;
  reactIs_production_min.Profiler = g;
  reactIs_production_min.StrictMode = f;
  reactIs_production_min.Suspense = p;
  reactIs_production_min.isAsyncMode = function(a) {
    return A(a) || z(a) === l;
  };
  reactIs_production_min.isConcurrentMode = A;
  reactIs_production_min.isContextConsumer = function(a) {
    return z(a) === k;
  };
  reactIs_production_min.isContextProvider = function(a) {
    return z(a) === h;
  };
  reactIs_production_min.isElement = function(a) {
    return "object" === typeof a && null !== a && a.$$typeof === c;
  };
  reactIs_production_min.isForwardRef = function(a) {
    return z(a) === n;
  };
  reactIs_production_min.isFragment = function(a) {
    return z(a) === e;
  };
  reactIs_production_min.isLazy = function(a) {
    return z(a) === t;
  };
  reactIs_production_min.isMemo = function(a) {
    return z(a) === r;
  };
  reactIs_production_min.isPortal = function(a) {
    return z(a) === d;
  };
  reactIs_production_min.isProfiler = function(a) {
    return z(a) === g;
  };
  reactIs_production_min.isStrictMode = function(a) {
    return z(a) === f;
  };
  reactIs_production_min.isSuspense = function(a) {
    return z(a) === p;
  };
  reactIs_production_min.isValidElementType = function(a) {
    return "string" === typeof a || "function" === typeof a || a === e || a === m || a === g || a === f || a === p || a === q || "object" === typeof a && null !== a && (a.$$typeof === t || a.$$typeof === r || a.$$typeof === h || a.$$typeof === k || a.$$typeof === n || a.$$typeof === w || a.$$typeof === x || a.$$typeof === y || a.$$typeof === v);
  };
  reactIs_production_min.typeOf = z;
  return reactIs_production_min;
}
var reactIs_development = {};
/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactIs_development;
function requireReactIs_development() {
  if (hasRequiredReactIs_development) return reactIs_development;
  hasRequiredReactIs_development = 1;
  if (process.env.NODE_ENV !== "production") {
    (function() {
      var hasSymbol = typeof Symbol === "function" && Symbol.for;
      var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for("react.element") : 60103;
      var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for("react.portal") : 60106;
      var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for("react.fragment") : 60107;
      var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for("react.strict_mode") : 60108;
      var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for("react.profiler") : 60114;
      var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for("react.provider") : 60109;
      var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for("react.context") : 60110;
      var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for("react.async_mode") : 60111;
      var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for("react.concurrent_mode") : 60111;
      var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for("react.forward_ref") : 60112;
      var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for("react.suspense") : 60113;
      var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for("react.suspense_list") : 60120;
      var REACT_MEMO_TYPE = hasSymbol ? Symbol.for("react.memo") : 60115;
      var REACT_LAZY_TYPE = hasSymbol ? Symbol.for("react.lazy") : 60116;
      var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for("react.block") : 60121;
      var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for("react.fundamental") : 60117;
      var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for("react.responder") : 60118;
      var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for("react.scope") : 60119;
      function isValidElementType(type) {
        return typeof type === "string" || typeof type === "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
        type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === "object" && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
      }
      function typeOf(object) {
        if (typeof object === "object" && object !== null) {
          var $$typeof = object.$$typeof;
          switch ($$typeof) {
            case REACT_ELEMENT_TYPE:
              var type = object.type;
              switch (type) {
                case REACT_ASYNC_MODE_TYPE:
                case REACT_CONCURRENT_MODE_TYPE:
                case REACT_FRAGMENT_TYPE:
                case REACT_PROFILER_TYPE:
                case REACT_STRICT_MODE_TYPE:
                case REACT_SUSPENSE_TYPE:
                  return type;
                default:
                  var $$typeofType = type && type.$$typeof;
                  switch ($$typeofType) {
                    case REACT_CONTEXT_TYPE:
                    case REACT_FORWARD_REF_TYPE:
                    case REACT_LAZY_TYPE:
                    case REACT_MEMO_TYPE:
                    case REACT_PROVIDER_TYPE:
                      return $$typeofType;
                    default:
                      return $$typeof;
                  }
              }
            case REACT_PORTAL_TYPE:
              return $$typeof;
          }
        }
        return void 0;
      }
      var AsyncMode = REACT_ASYNC_MODE_TYPE;
      var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
      var ContextConsumer = REACT_CONTEXT_TYPE;
      var ContextProvider = REACT_PROVIDER_TYPE;
      var Element = REACT_ELEMENT_TYPE;
      var ForwardRef = REACT_FORWARD_REF_TYPE;
      var Fragment = REACT_FRAGMENT_TYPE;
      var Lazy = REACT_LAZY_TYPE;
      var Memo = REACT_MEMO_TYPE;
      var Portal = REACT_PORTAL_TYPE;
      var Profiler = REACT_PROFILER_TYPE;
      var StrictMode = REACT_STRICT_MODE_TYPE;
      var Suspense = REACT_SUSPENSE_TYPE;
      var hasWarnedAboutDeprecatedIsAsyncMode = false;
      function isAsyncMode(object) {
        {
          if (!hasWarnedAboutDeprecatedIsAsyncMode) {
            hasWarnedAboutDeprecatedIsAsyncMode = true;
            console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.");
          }
        }
        return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
      }
      function isConcurrentMode(object) {
        return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
      }
      function isContextConsumer(object) {
        return typeOf(object) === REACT_CONTEXT_TYPE;
      }
      function isContextProvider(object) {
        return typeOf(object) === REACT_PROVIDER_TYPE;
      }
      function isElement(object) {
        return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function isForwardRef(object) {
        return typeOf(object) === REACT_FORWARD_REF_TYPE;
      }
      function isFragment(object) {
        return typeOf(object) === REACT_FRAGMENT_TYPE;
      }
      function isLazy(object) {
        return typeOf(object) === REACT_LAZY_TYPE;
      }
      function isMemo(object) {
        return typeOf(object) === REACT_MEMO_TYPE;
      }
      function isPortal(object) {
        return typeOf(object) === REACT_PORTAL_TYPE;
      }
      function isProfiler(object) {
        return typeOf(object) === REACT_PROFILER_TYPE;
      }
      function isStrictMode(object) {
        return typeOf(object) === REACT_STRICT_MODE_TYPE;
      }
      function isSuspense(object) {
        return typeOf(object) === REACT_SUSPENSE_TYPE;
      }
      reactIs_development.AsyncMode = AsyncMode;
      reactIs_development.ConcurrentMode = ConcurrentMode;
      reactIs_development.ContextConsumer = ContextConsumer;
      reactIs_development.ContextProvider = ContextProvider;
      reactIs_development.Element = Element;
      reactIs_development.ForwardRef = ForwardRef;
      reactIs_development.Fragment = Fragment;
      reactIs_development.Lazy = Lazy;
      reactIs_development.Memo = Memo;
      reactIs_development.Portal = Portal;
      reactIs_development.Profiler = Profiler;
      reactIs_development.StrictMode = StrictMode;
      reactIs_development.Suspense = Suspense;
      reactIs_development.isAsyncMode = isAsyncMode;
      reactIs_development.isConcurrentMode = isConcurrentMode;
      reactIs_development.isContextConsumer = isContextConsumer;
      reactIs_development.isContextProvider = isContextProvider;
      reactIs_development.isElement = isElement;
      reactIs_development.isForwardRef = isForwardRef;
      reactIs_development.isFragment = isFragment;
      reactIs_development.isLazy = isLazy;
      reactIs_development.isMemo = isMemo;
      reactIs_development.isPortal = isPortal;
      reactIs_development.isProfiler = isProfiler;
      reactIs_development.isStrictMode = isStrictMode;
      reactIs_development.isSuspense = isSuspense;
      reactIs_development.isValidElementType = isValidElementType;
      reactIs_development.typeOf = typeOf;
    })();
  }
  return reactIs_development;
}
var hasRequiredReactIs;
function requireReactIs() {
  if (hasRequiredReactIs) return reactIs.exports;
  hasRequiredReactIs = 1;
  if (process.env.NODE_ENV === "production") {
    reactIs.exports = requireReactIs_production_min();
  } else {
    reactIs.exports = requireReactIs_development();
  }
  return reactIs.exports;
}
var hoistNonReactStatics_cjs;
var hasRequiredHoistNonReactStatics_cjs;
function requireHoistNonReactStatics_cjs() {
  if (hasRequiredHoistNonReactStatics_cjs) return hoistNonReactStatics_cjs;
  hasRequiredHoistNonReactStatics_cjs = 1;
  var reactIs2 = requireReactIs();
  var REACT_STATICS = {
    childContextTypes: true,
    contextType: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    getDerivedStateFromError: true,
    getDerivedStateFromProps: true,
    mixins: true,
    propTypes: true,
    type: true
  };
  var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    callee: true,
    arguments: true,
    arity: true
  };
  var FORWARD_REF_STATICS = {
    "$$typeof": true,
    render: true,
    defaultProps: true,
    displayName: true,
    propTypes: true
  };
  var MEMO_STATICS = {
    "$$typeof": true,
    compare: true,
    defaultProps: true,
    displayName: true,
    propTypes: true,
    type: true
  };
  var TYPE_STATICS = {};
  TYPE_STATICS[reactIs2.ForwardRef] = FORWARD_REF_STATICS;
  TYPE_STATICS[reactIs2.Memo] = MEMO_STATICS;
  function getStatics(component) {
    if (reactIs2.isMemo(component)) {
      return MEMO_STATICS;
    }
    return TYPE_STATICS[component["$$typeof"]] || REACT_STATICS;
  }
  var defineProperty = Object.defineProperty;
  var getOwnPropertyNames = Object.getOwnPropertyNames;
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var getPrototypeOf = Object.getPrototypeOf;
  var objectPrototype = Object.prototype;
  function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
    if (typeof sourceComponent !== "string") {
      if (objectPrototype) {
        var inheritedComponent = getPrototypeOf(sourceComponent);
        if (inheritedComponent && inheritedComponent !== objectPrototype) {
          hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
        }
      }
      var keys = getOwnPropertyNames(sourceComponent);
      if (getOwnPropertySymbols) {
        keys = keys.concat(getOwnPropertySymbols(sourceComponent));
      }
      var targetStatics = getStatics(targetComponent);
      var sourceStatics = getStatics(sourceComponent);
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
          var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
          try {
            defineProperty(targetComponent, key, descriptor);
          } catch (e) {
          }
        }
      }
    }
    return targetComponent;
  }
  hoistNonReactStatics_cjs = hoistNonReactStatics;
  return hoistNonReactStatics_cjs;
}
requireHoistNonReactStatics_cjs();
var IntlContext = typeof window !== "undefined" && !window.__REACT_INTL_BYPASS_GLOBAL_CONTEXT__ ? window.__REACT_INTL_CONTEXT__ || (window.__REACT_INTL_CONTEXT__ = React__namespace.createContext(null)) : React__namespace.createContext(null);
IntlContext.Consumer;
IntlContext.Provider;
var Context = IntlContext;
function useIntl() {
  var intl = React__namespace.useContext(Context);
  invariantIntlContext(intl);
  return intl;
}
var DisplayName;
(function(DisplayName2) {
  DisplayName2["formatDate"] = "FormattedDate";
  DisplayName2["formatTime"] = "FormattedTime";
  DisplayName2["formatNumber"] = "FormattedNumber";
  DisplayName2["formatList"] = "FormattedList";
  DisplayName2["formatDisplayName"] = "FormattedDisplayName";
})(DisplayName || (DisplayName = {}));
var DisplayNameParts;
(function(DisplayNameParts2) {
  DisplayNameParts2["formatDate"] = "FormattedDateParts";
  DisplayNameParts2["formatTime"] = "FormattedTimeParts";
  DisplayNameParts2["formatNumber"] = "FormattedNumberParts";
  DisplayNameParts2["formatList"] = "FormattedListParts";
})(DisplayNameParts || (DisplayNameParts = {}));
function createFormattedDateTimePartsComponent(name) {
  var ComponentParts = function(props) {
    var intl = useIntl();
    var value = props.value, children = props.children, formatProps = __rest(props, ["value", "children"]);
    var date = typeof value === "string" ? new Date(value || 0) : value;
    var formattedParts = name === "formatDate" ? intl.formatDateToParts(date, formatProps) : intl.formatTimeToParts(date, formatProps);
    return children(formattedParts);
  };
  ComponentParts.displayName = DisplayNameParts[name];
  return ComponentParts;
}
function createFormattedComponent(name) {
  var Component = function(props) {
    var intl = useIntl();
    var value = props.value, children = props.children, formatProps = __rest(
      props,
      ["value", "children"]
    );
    var formattedValue = intl[name](value, formatProps);
    if (typeof children === "function") {
      return children(formattedValue);
    }
    var Text = intl.textComponent || React__namespace.Fragment;
    return React__namespace.createElement(Text, null, formattedValue);
  };
  Component.displayName = DisplayName[name];
  return Component;
}
createFormattedComponent("formatDate");
createFormattedComponent("formatTime");
createFormattedComponent("formatNumber");
createFormattedComponent("formatList");
createFormattedComponent("formatDisplayName");
createFormattedDateTimePartsComponent("formatDate");
createFormattedDateTimePartsComponent("formatTime");
const isRotatableImage = (file) => !!file && typeof file === "object" && typeof file.mime === "string" && file.mime.startsWith("image/") && file.mime !== "image/svg+xml" && file.mime !== "image/gif" && (typeof file.id === "number" || typeof file.id === "string") && !!file.url;
const collectImageFiles = (document) => {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  if (!document || typeof document !== "object") return out;
  for (const [field, value] of Object.entries(document)) {
    if (!value) continue;
    const items = Array.isArray(value) ? value : [value];
    for (const item of items) {
      if (isRotatableImage(item) && !seen.has(item.id)) {
        seen.add(item.id);
        out.push({ field, file: item });
      }
    }
  }
  return out;
};
const bustCache = (url, stamp) => {
  if (!url) return url;
  if (!stamp) return url;
  return `${url}${url.includes("?") ? "&" : "?"}v=${stamp}`;
};
const RotateRightIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, focusable: "false", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M21 12a9 9 0 1 1-2.64-6.36",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M21 3v5h-5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
] });
const RotateLeftIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, focusable: "false", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M3 12a9 9 0 1 0 2.64-6.36",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M3 3v5h5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
] });
const RotateActions = ({ fileId, onRotated, disabled = false }) => {
  const { post } = admin.useFetchClient();
  const { toggleNotification } = admin.useNotification();
  const { formatMessage } = useIntl();
  const [loading, setLoading] = React.useState(false);
  const rotate = async (degrees) => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      const { data } = await post(`/${PLUGIN_ID}/rotate/${fileId}`, { degrees });
      toggleNotification({
        type: "success",
        message: formatMessage({
          id: `${PLUGIN_ID}.notification.success`,
          defaultMessage: "Image rotated successfully."
        })
      });
      onRotated?.(data);
    } catch (err) {
      const message = err?.response?.data?.error?.message || formatMessage({
        id: `${PLUGIN_ID}.notification.error`,
        defaultMessage: "Failed to rotate the image."
      });
      toggleNotification({ type: "danger", message });
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { gap: 1, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      designSystem.IconButton,
      {
        onClick: () => rotate(-90),
        disabled: loading || disabled,
        label: formatMessage({
          id: `${PLUGIN_ID}.action.rotateLeft`,
          defaultMessage: "Rotate left 90°"
        }),
        children: /* @__PURE__ */ jsxRuntime.jsx(RotateLeftIcon, {})
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      designSystem.IconButton,
      {
        onClick: () => rotate(90),
        disabled: loading || disabled,
        label: formatMessage({
          id: `${PLUGIN_ID}.action.rotateRight`,
          defaultMessage: "Rotate right 90°"
        }),
        children: /* @__PURE__ */ jsxRuntime.jsx(RotateRightIcon, {})
      }
    )
  ] });
};
const RotateModal = ({ images }) => {
  const { formatMessage } = useIntl();
  const [overrides, setOverrides] = React.useState({});
  const handleRotated = (fileId, data) => {
    setOverrides((prev) => ({
      ...prev,
      [fileId]: {
        width: data?.width,
        height: data?.height,
        url: data?.url,
        formats: data?.formats,
        stamp: Date.now()
      }
    }));
  };
  if (!images.length) {
    return /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { textColor: "neutral600", children: formatMessage({
      id: `${PLUGIN_ID}.modal.empty`,
      defaultMessage: "This entry has no rotatable images."
    }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(designSystem.Flex, { direction: "column", alignItems: "stretch", gap: 4, children: images.map(({ field, file }) => {
    const o = overrides[file.id];
    const width = o?.width ?? file.width;
    const height = o?.height ?? file.height;
    const previewUrl = o?.url ?? file.formats?.thumbnail?.url ?? file.url;
    const src = bustCache(previewUrl, o?.stamp ?? file.updatedAt);
    return /* @__PURE__ */ jsxRuntime.jsxs(
      designSystem.Flex,
      {
        justifyContent: "space-between",
        alignItems: "center",
        gap: 4,
        hasRadius: true,
        padding: 3,
        background: "neutral100",
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { gap: 3, alignItems: "center", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              designSystem.Box,
              {
                tag: "img",
                src,
                alt: file.name,
                width: "56px",
                height: "56px",
                hasRadius: true,
                style: { objectFit: "cover", border: "1px solid rgba(0,0,0,0.1)" }
              },
              src
            ),
            /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { direction: "column", alignItems: "flex-start", gap: 1, children: [
              /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { fontWeight: "bold", ellipsis: true, children: file.name }),
              /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Typography, { variant: "pi", textColor: "neutral600", children: [
                field,
                width && height ? ` · ${width}×${height}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(RotateActions, { fileId: file.id, onRotated: (data) => handleRotated(file.id, data) })
        ]
      },
      `${field}-${file.id}`
    );
  }) });
};
const RotateDocumentAction = ({ document }) => {
  const { formatMessage } = useIntl();
  const images = collectImageFiles(document);
  if (!images.length) {
    return null;
  }
  return {
    label: formatMessage({
      id: `${PLUGIN_ID}.action.rotateImages`,
      defaultMessage: "Rotate images"
    }),
    icon: /* @__PURE__ */ jsxRuntime.jsx(RotateRightIcon, {}),
    position: ["panel"],
    dialog: {
      type: "modal",
      title: formatMessage({
        id: `${PLUGIN_ID}.modal.title`,
        defaultMessage: "Rotate images"
      }),
      content: /* @__PURE__ */ jsxRuntime.jsx(RotateModal, { images }),
      footer: ({ onClose }) => /* @__PURE__ */ jsxRuntime.jsx(designSystem.Button, { onClick: onClose, variant: "tertiary", children: formatMessage({ id: `${PLUGIN_ID}.modal.close`, defaultMessage: "Close" }) })
    }
  };
};
RotateDocumentAction.type = `${PLUGIN_ID}-rotate-images`;
const RotatePreviewActions = ({ asset }) => {
  if (!asset || !asset.id || asset.isLocal) return null;
  const mime = typeof asset.mime === "string" ? asset.mime.toLowerCase() : "";
  if (!mime.startsWith("image/") || mime === "image/svg+xml" || mime === "image/gif") {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(RotateActions, { fileId: asset.id, onRotated: () => window.location.reload() });
};
const prefixPluginTranslations = (translations, pluginId = PLUGIN_ID) => Object.keys(translations).reduce((acc, key) => {
  acc[`${pluginId}.${key}`] = translations[key];
  return acc;
}, {});
const index = {
  register(app) {
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID
    });
  },
  bootstrap(app) {
    const contentManager = app.getPlugin("content-manager");
    if (contentManager?.apis?.addDocumentAction) {
      contentManager.apis.addDocumentAction((actions) => [...actions, RotateDocumentAction]);
    }
    if (typeof window !== "undefined") {
      window.__strapiImageRotate = { PreviewActions: RotatePreviewActions };
    }
  },
  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "./translations/en.json": () => Promise.resolve().then(() => require("./en-vnDi9fbN.js")), "./translations/fr.json": () => Promise.resolve().then(() => require("./fr-CPlLjthQ.js")) }), `./translations/${locale}.json`, 3);
          return { data: prefixPluginTranslations(data, PLUGIN_ID), locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  }
};
exports.default = index;
