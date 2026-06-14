var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/aws-crt/dist/common/promise.js
var require_promise = __commonJS({
  "node_modules/aws-crt/dist/common/promise.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.newLiftedPromise = exports2.makeSelfCleaningPromise = void 0;
    function makeSelfCleaningPromise(promise, cleaner) {
      if (!cleaner) {
        return promise;
      }
      return promise.finally(() => {
        cleaner();
      });
    }
    exports2.makeSelfCleaningPromise = makeSelfCleaningPromise;
    function newLiftedPromise(promiseBody) {
      let localResolve = void 0;
      let localReject = void 0;
      let promise = new Promise((resolve, reject) => {
        localResolve = resolve;
        localReject = reject;
      });
      if (!localResolve || !localReject) {
        throw new Error("Failed to bind resolve and reject when making lifted promise");
      }
      if (promiseBody) {
        promiseBody(localResolve, localReject);
      }
      return {
        promise,
        resolve: localResolve,
        reject: localReject
      };
    }
    exports2.newLiftedPromise = newLiftedPromise;
  }
});

// node_modules/aws-crt/dist/common/cancel.js
var require_cancel = __commonJS({
  "node_modules/aws-crt/dist/common/cancel.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.newCancellablePromiseFromNextEvent = exports2.CancelController = exports2.EVENT_NAME = void 0;
    var events_1 = require("events");
    var promise = __importStar(require_promise());
    exports2.EVENT_NAME = "cancelled";
    var CancelController = class {
      constructor(options) {
        this.cancelled = false;
        if (options && options.emitterFactory) {
          this.emitter = options.emitterFactory();
        } else {
          this.emitter = new events_1.EventEmitter();
        }
      }
      /**
       * Cancels all asynchronous operations associated with this controller
       */
      cancel() {
        if (!this.cancelled) {
          this.cancelled = true;
          this.emitter.emit(exports2.EVENT_NAME);
          this.emitter.removeAllListeners(exports2.EVENT_NAME);
        }
      }
      /**
       * Checks whether or not the controller is in the cancelled state
       */
      hasBeenCancelled() {
        return this.cancelled;
      }
      /**
       * Registers a callback to be notified when cancel() is invoked externally.  In general, the callback
       * will cancel an asynchronous operation by rejecting the associated promise.
       *
       * IMPORTANT: The listener is invoked synchronously if the controller has already been cancelled.
       *
       * @param listener - function to invoke on cancel; invoked synchronously if the controller has been cancelled
       *
       * @return undefined if the controller has already been cancelled, otherwise a function object whose invocation
       * will remove the listener from the controller's event emitter.
       *
       */
      addListener(listener) {
        if (this.cancelled) {
          listener();
          return void 0;
        }
        this.emitter.on(exports2.EVENT_NAME, listener);
        return () => {
          this.emitter.removeListener(exports2.EVENT_NAME, listener);
        };
      }
    };
    exports2.CancelController = CancelController;
    function newCancellablePromiseFromNextEvent(config) {
      let onEvent = void 0;
      let cancelRemoveListener = void 0;
      let liftedPromise = promise.newLiftedPromise();
      onEvent = (eventData) => {
        try {
          if (config.eventDataTransformer) {
            liftedPromise.resolve(config.eventDataTransformer(eventData));
          } else {
            liftedPromise.resolve(eventData);
          }
        } catch (err) {
          liftedPromise.reject(err);
        }
      };
      config.emitter.addListener(config.eventName, onEvent);
      if (config.cancelController) {
        cancelRemoveListener = config.cancelController.addListener(() => {
          liftedPromise.reject(config.cancelMessage);
        });
      }
      return promise.makeSelfCleaningPromise(liftedPromise.promise, () => {
        if (onEvent) {
          config.emitter.removeListener(config.eventName, onEvent);
        }
        if (cancelRemoveListener) {
          cancelRemoveListener();
        }
      });
    }
    exports2.newCancellablePromiseFromNextEvent = newCancellablePromiseFromNextEvent;
  }
});

// node_modules/aws-crt/package.json
var require_package = __commonJS({
  "node_modules/aws-crt/package.json"(exports2, module2) {
    module2.exports = {
      name: "aws-crt",
      version: "1.32.1",
      description: "NodeJS/browser bindings to the aws-c-* libraries",
      homepage: "https://github.com/awslabs/aws-crt-nodejs",
      repository: {
        type: "git",
        url: "git+https://github.com/awslabs/aws-crt-nodejs.git"
      },
      contributors: [
        "AWS Common Runtime Team <aws-sdk-common-runtime@amazon.com>"
      ],
      license: "Apache-2.0",
      main: "./dist/index.js",
      browser: "./dist.browser/browser.js",
      types: "./dist/index.d.ts",
      scripts: {
        tsc: "node ./scripts/tsc.js",
        test: "npm run test:native",
        "test:node": "npm run test:native",
        "test:native": "npx jest --runInBand --verbose --config test/native/jest.config.js --forceExit",
        "test:browser": "npx jest --runInBand --verbose --config test/browser/jest.config.js --forceExit",
        "test:browser:ci": "npm run install:puppeteer && npm run test:browser",
        "install:puppeteer": "npm install --save-dev jest-puppeteer puppeteer @types/puppeteer",
        prepare: "node ./scripts/tsc.js && node ./scripts/install.js",
        install: "node ./scripts/install.js"
      },
      overrides: {
        axios: "^1.12.2"
      },
      devDependencies: {
        "@types/crypto-js": "^3.1.43",
        "@types/jest": "^27.0.1",
        "@types/node": "^14.18.63",
        "@types/prettier": "2.6.0",
        "@types/puppeteer": "^5.4.7",
        "@types/uuid": "^10.0.0",
        "@types/ws": "^7.4.7",
        "aws-sdk": "^2.1537.0",
        "cmake-js": "^7.3.0",
        "https-proxy-agent": "^5.0.1",
        jest: "^27.2.1",
        "jest-puppeteer": "^5.0.4",
        "jest-runtime": "^27.2.1",
        puppeteer: "^3.3.0",
        tar: "^7.5.4",
        "ts-jest": "^27.0.5",
        typedoc: "^0.24.8",
        "typedoc-plugin-merge-modules": "^5.1.0",
        typescript: "^4.9.5",
        uuid: "^10.0.0",
        yargs: "^17.2.1"
      },
      dependencies: {
        "@aws-sdk/util-utf8-browser": "^3.259.0",
        "@httptoolkit/websocket-stream": "^6.0.1",
        axios: "^1.12.2",
        buffer: "^6.0.3",
        "crypto-js": "^4.2.0",
        mqtt: "^4.3.8",
        process: "^0.11.10"
      }
    };
  }
});

// node_modules/aws-crt/dist/common/platform.js
var require_platform = __commonJS({
  "node_modules/aws-crt/dist/common/platform.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.crt_version = exports2.package_info = exports2.is_browser = exports2.is_nodejs = void 0;
    function is_nodejs() {
      return typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node !== "undefined";
    }
    exports2.is_nodejs = is_nodejs;
    function is_browser() {
      return !is_nodejs();
    }
    exports2.is_browser = is_browser;
    function package_info() {
      try {
        const pkg = require_package();
        return pkg;
      } catch (err) {
        return {
          name: "aws-crt-nodejs",
          version: "UNKNOWN"
        };
      }
    }
    exports2.package_info = package_info;
    function crt_version() {
      const pkg = package_info();
      return pkg.version;
    }
    exports2.crt_version = crt_version;
  }
});

// node_modules/aws-crt/dist/common/resource_safety.js
var require_resource_safety = __commonJS({
  "node_modules/aws-crt/dist/common/resource_safety.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.using = void 0;
    function using(resource, func) {
      return __awaiter(this, void 0, void 0, function* () {
        try {
          yield func(resource);
        } finally {
          resource.close();
        }
      });
    }
    exports2.using = using;
  }
});

// node_modules/aws-crt/dist/native/binding.js
var require_binding = __commonJS({
  "node_modules/aws-crt/dist/native/binding.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.cRuntime = exports2.CRuntimeType = void 0;
    var path = __importStar(require("path"));
    var os_1 = require("os");
    var fs_1 = require("fs");
    var process_1 = require("process");
    var child_process_1 = __importDefault(require("child_process"));
    var CRuntimeType = Object.freeze({
      NON_LINUX: "cruntime",
      MUSL: "musl",
      GLIBC: "glibc"
    });
    exports2.CRuntimeType = CRuntimeType;
    function getCRuntime() {
      if ((0, os_1.platform)() !== "linux") {
        return CRuntimeType.NON_LINUX;
      }
      try {
        const spawnedProcess = child_process_1.default.spawnSync("ldd", ["--version"], { encoding: "utf8" });
        const output = spawnedProcess.stdout + spawnedProcess.stderr;
        if (output.includes(CRuntimeType.MUSL)) {
          return CRuntimeType.MUSL;
        } else {
          return CRuntimeType.GLIBC;
        }
      } catch (error) {
        return CRuntimeType.GLIBC;
      }
    }
    var upgrade_string = "Please upgrade to node >=10.16.0, or use the provided browser implementation.";
    if ("napi" in process_1.versions) {
      const napi_version = parseInt(process_1.versions["napi"]);
      if (napi_version < 4) {
        throw new Error("The AWS CRT native implementation requires that NAPI version 4 be present. " + upgrade_string);
      }
    } else {
      throw new Error("The current runtime is not reporting an NAPI version. " + upgrade_string);
    }
    var cRuntime = getCRuntime();
    exports2.cRuntime = cRuntime;
    var binary_name = "aws-crt-nodejs";
    var platformDir = `${os_1.platform}-${os_1.arch}-${cRuntime}`;
    var source_root = path.resolve(__dirname, "..", "..");
    var dist = path.join(source_root, "dist");
    if ((0, fs_1.existsSync)(dist)) {
      source_root = dist;
    }
    var bin_path = path.resolve(source_root, "bin");
    var search_paths = [
      path.join(bin_path, platformDir, binary_name) + ".node"
    ];
    var relative_path = process.env.AWS_CRT_NODEJS_BINARY_RELATIVE_PATH;
    if (relative_path) {
      let final_path = path.resolve(__dirname, ...relative_path.split(path.sep));
      search_paths.push(final_path);
    }
    if (process.env.AWS_CRT_NODEJS_BINARY_ABSOLUTE_PATH) {
      search_paths.push(process.env.AWS_CRT_NODEJS_BINARY_ABSOLUTE_PATH);
    }
    var binding;
    for (const path2 of search_paths) {
      if ((0, fs_1.existsSync)(path2)) {
        binding = require(path2);
        break;
      }
    }
    if (binding == void 0) {
      throw new Error("AWS CRT binary not present in any of the following locations:\n	" + search_paths.join("\n	"));
    }
    var binding_1 = __importDefault(require_binding());
    if (process.versions.hasOwnProperty("electron")) {
      process.on("exit", function() {
        binding_1.default.disable_threadsafe_function();
      });
    }
    exports2.default = binding;
  }
});

// node_modules/aws-crt/dist/native/error.js
var require_error = __commonJS({
  "node_modules/aws-crt/dist/native/error.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CrtError = void 0;
    var binding_1 = __importDefault(require_binding());
    var CrtError = class extends Error {
      /** @var error - The original error. Most often an error_code, but possibly some other context */
      constructor(error) {
        super(extract_message(error));
        this.error = error;
        this.error_code = extract_code(error);
        this.error_name = extract_name(error);
      }
    };
    exports2.CrtError = CrtError;
    function extract_message(error) {
      if (typeof error === "number") {
        return binding_1.default.error_code_to_string(error);
      } else if (error instanceof CrtError) {
        return error.message;
      }
      return error.toString();
    }
    function extract_code(error) {
      if (typeof error === "number") {
        return error;
      } else if (error instanceof CrtError) {
        return error.error_code;
      }
      return void 0;
    }
    function extract_name(error) {
      if (typeof error === "number") {
        return binding_1.default.error_code_to_name(error);
      } else if (error instanceof CrtError) {
        return error.error_name;
      }
      return void 0;
    }
  }
});

// node_modules/aws-crt/dist/native/native_resource.js
var require_native_resource = __commonJS({
  "node_modules/aws-crt/dist/native/native_resource.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NativeResourceMixin = exports2.NativeResource = void 0;
    var NativeResource = class {
      constructor(handle) {
        this.handle = handle;
      }
      /** @internal */
      native_handle() {
        return this.handle;
      }
    };
    exports2.NativeResource = NativeResource;
    function NativeResourceMixin(Base) {
      return class extends Base {
        /** @internal */
        constructor(...args) {
          const handle = args.shift();
          super(...args);
          this._handle = handle;
        }
        /** @internal */
        _super(handle) {
          this._handle = handle;
        }
        /** @internal */
        native_handle() {
          return this._handle;
        }
      };
    }
    exports2.NativeResourceMixin = NativeResourceMixin;
  }
});

// node_modules/aws-crt/dist/common/io.js
var require_io = __commonJS({
  "node_modules/aws-crt/dist/common/io.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.logTrace = exports2.logDebug = exports2.logInfo = exports2.logWarn = exports2.logError = exports2.logFatal = exports2.setLogLevel = exports2.LogLevel = exports2.SocketDomain = exports2.SocketType = exports2.TlsVersion = void 0;
    var TlsVersion;
    (function(TlsVersion2) {
      TlsVersion2[TlsVersion2["SSLv3"] = 0] = "SSLv3";
      TlsVersion2[TlsVersion2["TLSv1"] = 1] = "TLSv1";
      TlsVersion2[TlsVersion2["TLSv1_1"] = 2] = "TLSv1_1";
      TlsVersion2[TlsVersion2["TLSv1_2"] = 3] = "TLSv1_2";
      TlsVersion2[TlsVersion2["TLSv1_3"] = 4] = "TLSv1_3";
      TlsVersion2[TlsVersion2["Default"] = 128] = "Default";
    })(TlsVersion = exports2.TlsVersion || (exports2.TlsVersion = {}));
    var SocketType;
    (function(SocketType2) {
      SocketType2[SocketType2["STREAM"] = 0] = "STREAM";
      SocketType2[SocketType2["DGRAM"] = 1] = "DGRAM";
    })(SocketType = exports2.SocketType || (exports2.SocketType = {}));
    var SocketDomain;
    (function(SocketDomain2) {
      SocketDomain2[SocketDomain2["IPV4"] = 0] = "IPV4";
      SocketDomain2[SocketDomain2["IPV6"] = 1] = "IPV6";
      SocketDomain2[SocketDomain2["LOCAL"] = 2] = "LOCAL";
    })(SocketDomain = exports2.SocketDomain || (exports2.SocketDomain = {}));
    var LogLevel;
    (function(LogLevel2) {
      LogLevel2[LogLevel2["NONE"] = 0] = "NONE";
      LogLevel2[LogLevel2["FATAL"] = 1] = "FATAL";
      LogLevel2[LogLevel2["ERROR"] = 2] = "ERROR";
      LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
      LogLevel2[LogLevel2["INFO"] = 4] = "INFO";
      LogLevel2[LogLevel2["DEBUG"] = 5] = "DEBUG";
      LogLevel2[LogLevel2["TRACE"] = 6] = "TRACE";
    })(LogLevel = exports2.LogLevel || (exports2.LogLevel = {}));
    var logLevel = LogLevel.NONE;
    function setLogLevel(level) {
      logLevel = level;
    }
    exports2.setLogLevel = setLogLevel;
    function logFatal(subject, logLine) {
      if (logLevel < LogLevel.FATAL) {
        return;
      }
      let currentTime = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`[FATAL] [${currentTime}] [${subject}] - ${logLine}`);
    }
    exports2.logFatal = logFatal;
    function logError(subject, logLine) {
      if (logLevel < LogLevel.ERROR) {
        return;
      }
      let currentTime = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`[ERROR] [${currentTime}] [${subject}] - ${logLine}`);
    }
    exports2.logError = logError;
    function logWarn(subject, logLine) {
      if (logLevel < LogLevel.WARN) {
        return;
      }
      let currentTime = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`[WARN] [${currentTime}] [${subject}] - ${logLine}`);
    }
    exports2.logWarn = logWarn;
    function logInfo(subject, logLine) {
      if (logLevel < LogLevel.INFO) {
        return;
      }
      let currentTime = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`[INFO] [${currentTime}] [${subject}] - ${logLine}`);
    }
    exports2.logInfo = logInfo;
    function logDebug(subject, logLine) {
      if (logLevel < LogLevel.DEBUG) {
        return;
      }
      let currentTime = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`[DEBUG] [${currentTime}] [${subject}] - ${logLine}`);
    }
    exports2.logDebug = logDebug;
    function logTrace(subject, logLine) {
      if (logLevel < LogLevel.TRACE) {
        return;
      }
      let currentTime = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`[TRACE] [${currentTime}] [${subject}] - ${logLine}`);
    }
    exports2.logTrace = logTrace;
  }
});

// node_modules/aws-crt/dist/native/io.js
var require_io2 = __commonJS({
  "node_modules/aws-crt/dist/native/io.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Pkcs11Lib = exports2.TlsConnectionOptions = exports2.ServerTlsContext = exports2.ClientTlsContext = exports2.TlsContext = exports2.TlsContextOptions = exports2.tls_cipher_preference_is_supported = exports2.TlsCipherPreference = exports2.SocketOptions = exports2.ClientBootstrap = exports2.InputStream = exports2.is_alpn_available = exports2.enable_logging = exports2.error_code_to_name = exports2.error_code_to_string = exports2.SocketDomain = exports2.SocketType = exports2.TlsVersion = exports2.LogLevel = exports2.setLogLevel = void 0;
    var binding_1 = __importDefault(require_binding());
    var native_resource_1 = require_native_resource();
    var io_1 = require_io();
    var io_2 = require_io();
    Object.defineProperty(exports2, "setLogLevel", { enumerable: true, get: function() {
      return io_2.setLogLevel;
    } });
    Object.defineProperty(exports2, "LogLevel", { enumerable: true, get: function() {
      return io_2.LogLevel;
    } });
    Object.defineProperty(exports2, "TlsVersion", { enumerable: true, get: function() {
      return io_2.TlsVersion;
    } });
    Object.defineProperty(exports2, "SocketType", { enumerable: true, get: function() {
      return io_2.SocketType;
    } });
    Object.defineProperty(exports2, "SocketDomain", { enumerable: true, get: function() {
      return io_2.SocketDomain;
    } });
    var error_1 = require_error();
    function error_code_to_string(error_code) {
      return binding_1.default.error_code_to_string(error_code);
    }
    exports2.error_code_to_string = error_code_to_string;
    function error_code_to_name(error_code) {
      return binding_1.default.error_code_to_name(error_code);
    }
    exports2.error_code_to_name = error_code_to_name;
    function enable_logging(level) {
      binding_1.default.io_logging_enable(level);
      (0, io_1.setLogLevel)(level);
    }
    exports2.enable_logging = enable_logging;
    function is_alpn_available() {
      return binding_1.default.is_alpn_available();
    }
    exports2.is_alpn_available = is_alpn_available;
    var InputStream = class extends native_resource_1.NativeResource {
      constructor(source) {
        super(binding_1.default.io_input_stream_new(16 * 1024));
        this.source = source;
        this.source.on("data", (data) => {
          data = Buffer.isBuffer(data) ? data : Buffer.from(data.toString());
          binding_1.default.io_input_stream_append(this.native_handle(), data);
        });
        this.source.on("end", () => {
          binding_1.default.io_input_stream_append(this.native_handle(), void 0);
        });
      }
    };
    exports2.InputStream = InputStream;
    var ClientBootstrap = class extends native_resource_1.NativeResource {
      constructor() {
        super(binding_1.default.io_client_bootstrap_new());
      }
    };
    exports2.ClientBootstrap = ClientBootstrap;
    var SocketOptions = class extends native_resource_1.NativeResource {
      constructor(type = io_1.SocketType.STREAM, domain = io_1.SocketDomain.IPV6, connect_timeout_ms = 5e3, keepalive = false, keep_alive_interval_sec = 0, keep_alive_timeout_sec = 0, keep_alive_max_failed_probes = 0) {
        super(binding_1.default.io_socket_options_new(type, domain, connect_timeout_ms, keep_alive_interval_sec, keep_alive_timeout_sec, keep_alive_max_failed_probes, keepalive));
      }
    };
    exports2.SocketOptions = SocketOptions;
    var TlsCipherPreference;
    (function(TlsCipherPreference2) {
      TlsCipherPreference2[TlsCipherPreference2["Default"] = 0] = "Default";
      TlsCipherPreference2[TlsCipherPreference2["PQ_TLSv1_0_2021_05"] = 6] = "PQ_TLSv1_0_2021_05";
      TlsCipherPreference2[TlsCipherPreference2["PQ_Default"] = 8] = "PQ_Default";
      TlsCipherPreference2[TlsCipherPreference2["TLSv1_2_2025_07"] = 9] = "TLSv1_2_2025_07";
    })(TlsCipherPreference = exports2.TlsCipherPreference || (exports2.TlsCipherPreference = {}));
    function tls_cipher_preference_is_supported(tls_cipher_preference) {
      return binding_1.default.io_tls_cipher_preference_is_supported(tls_cipher_preference);
    }
    exports2.tls_cipher_preference_is_supported = tls_cipher_preference_is_supported;
    var TlsContextOptions = class _TlsContextOptions {
      constructor() {
        this.min_tls_version = io_1.TlsVersion.Default;
        this.alpn_list = [];
        this.verify_peer = true;
      }
      /**
       * Overrides the default system trust store.
       * @param ca_dirpath - Only used on Unix-style systems where all trust anchors are
       * stored in a directory (e.g. /etc/ssl/certs).
       * @param ca_filepath - Single file containing all trust CAs, in PEM format
       */
      override_default_trust_store_from_path(ca_dirpath, ca_filepath) {
        this.ca_dirpath = ca_dirpath;
        this.ca_filepath = ca_filepath;
      }
      /**
       * Overrides the default system trust store.
       * @param certificate_authority - String containing all trust CAs, in PEM format
       */
      override_default_trust_store(certificate_authority) {
        this.certificate_authority = certificate_authority;
      }
      /**
       * Create options configured for mutual TLS in client mode,
       * with client certificate and private key provided as in-memory strings.
       * @param certificate - Client certificate file contents, in PEM format
       * @param private_key - Client private key file contents, in PEM format
       *
       * @returns newly configured TlsContextOptions object
       */
      static create_client_with_mtls(certificate, private_key) {
        let opt = new _TlsContextOptions();
        opt.certificate = certificate;
        opt.private_key = private_key;
        opt.verify_peer = true;
        return opt;
      }
      /**
       * Create options configured for mutual TLS in client mode,
       * with client certificate and private key provided via filepath.
       * @param certificate_filepath - Path to client certificate, in PEM format
       * @param private_key_filepath - Path to private key, in PEM format
       *
       * @returns newly configured TlsContextOptions object
       */
      static create_client_with_mtls_from_path(certificate_filepath, private_key_filepath) {
        let opt = new _TlsContextOptions();
        opt.certificate_filepath = certificate_filepath;
        opt.private_key_filepath = private_key_filepath;
        opt.verify_peer = true;
        return opt;
      }
      /**
       * Create options for mutual TLS in client mode,
       * with client certificate and private key bundled in a single PKCS#12 file.
       * @param pkcs12_filepath - Path to PKCS#12 file containing client certificate and private key.
       * @param pkcs12_password - PKCS#12 password
       *
       * @returns newly configured TlsContextOptions object
      */
      static create_client_with_mtls_pkcs12_from_path(pkcs12_filepath, pkcs12_password) {
        let opt = new _TlsContextOptions();
        opt.pkcs12_filepath = pkcs12_filepath;
        opt.pkcs12_password = pkcs12_password;
        opt.verify_peer = true;
        return opt;
      }
      /**
       * @deprecated Renamed [[create_client_with_mtls_pkcs12_from_path]]
       */
      static create_client_with_mtls_pkcs_from_path(pkcs12_filepath, pkcs12_password) {
        return this.create_client_with_mtls_pkcs12_from_path(pkcs12_filepath, pkcs12_password);
      }
      /**
       * Create options configured for mutual TLS in client mode,
       * using a PKCS#11 library for private key operations.
       *
       * NOTE: This configuration only works on Unix devices.
       *
       * @param options - PKCS#11 options
       *
       * @returns newly configured TlsContextOptions object
       */
      static create_client_with_mtls_pkcs11(options) {
        let opt = new _TlsContextOptions();
        opt.pkcs11_options = options;
        opt.verify_peer = true;
        return opt;
      }
      /**
       * Create options configured for mutual TLS in client mode,
       * using a certificate in a Windows certificate store.
       *
       * NOTE: Windows only.
       *
       * @param certificate_path - Path to certificate in a Windows certificate store.
       *      The path must use backslashes and end with the certificate's thumbprint.
       *      Example: `CurrentUser\MY\A11F8A9B5DF5B98BA3508FBCA575D09570E0D2C6`
       */
      static create_client_with_mtls_windows_cert_store_path(certificate_path) {
        let opt = new _TlsContextOptions();
        opt.windows_cert_store_path = certificate_path;
        opt.verify_peer = true;
        return opt;
      }
      /**
       * Creates TLS context with peer verification disabled, along with a certificate and private key
       * @param certificate_filepath - Path to certificate, in PEM format
       * @param private_key_filepath - Path to private key, in PEM format
       *
       * @returns newly configured TlsContextOptions object
       */
      static create_server_with_mtls_from_path(certificate_filepath, private_key_filepath) {
        let opt = new _TlsContextOptions();
        opt.certificate_filepath = certificate_filepath;
        opt.private_key_filepath = private_key_filepath;
        opt.verify_peer = false;
        return opt;
      }
      /**
       * Creates TLS context with peer verification disabled, along with a certificate and private key
       * in PKCS#12 format
       * @param pkcs12_filepath - Path to certificate, in PKCS#12 format
       * @param pkcs12_password - PKCS#12 Password
       *
       * @returns newly configured TlsContextOptions object
       */
      static create_server_with_mtls_pkcs_from_path(pkcs12_filepath, pkcs12_password) {
        let opt = new _TlsContextOptions();
        opt.pkcs12_filepath = pkcs12_filepath;
        opt.pkcs12_password = pkcs12_password;
        opt.verify_peer = false;
        return opt;
      }
    };
    exports2.TlsContextOptions = TlsContextOptions;
    var TlsContext = class extends native_resource_1.NativeResource {
      constructor(ctx_opt) {
        if (ctx_opt == null || ctx_opt == void 0) {
          throw new error_1.CrtError("TlsContext constructor: ctx_opt not defined");
        }
        super(binding_1.default.io_tls_ctx_new(ctx_opt.min_tls_version, ctx_opt.ca_filepath, ctx_opt.ca_dirpath, ctx_opt.certificate_authority, ctx_opt.alpn_list && ctx_opt.alpn_list.length > 0 ? ctx_opt.alpn_list.join(";") : void 0, ctx_opt.certificate_filepath, ctx_opt.certificate, ctx_opt.private_key_filepath, ctx_opt.private_key, ctx_opt.pkcs12_filepath, ctx_opt.pkcs12_password, ctx_opt.pkcs11_options, ctx_opt.windows_cert_store_path, ctx_opt.tls_cipher_preference, ctx_opt.verify_peer));
      }
    };
    exports2.TlsContext = TlsContext;
    var ClientTlsContext = class extends TlsContext {
      constructor(ctx_opt) {
        if (!ctx_opt) {
          ctx_opt = new TlsContextOptions();
          ctx_opt.verify_peer = true;
        }
        super(ctx_opt);
      }
    };
    exports2.ClientTlsContext = ClientTlsContext;
    var ServerTlsContext = class extends TlsContext {
      constructor(ctx_opt) {
        if (!ctx_opt) {
          ctx_opt = new TlsContextOptions();
          ctx_opt.verify_peer = false;
        }
        super(ctx_opt);
      }
    };
    exports2.ServerTlsContext = ServerTlsContext;
    var TlsConnectionOptions = class extends native_resource_1.NativeResource {
      constructor(tls_ctx, server_name, alpn_list = []) {
        if (tls_ctx == null || tls_ctx == void 0) {
          throw new error_1.CrtError("TlsConnectionOptions constructor: tls_ctx not defined");
        }
        super(binding_1.default.io_tls_connection_options_new(tls_ctx.native_handle(), server_name, alpn_list && alpn_list.length > 0 ? alpn_list.join(";") : void 0));
        this.tls_ctx = tls_ctx;
        this.server_name = server_name;
        this.alpn_list = alpn_list;
      }
    };
    exports2.TlsConnectionOptions = TlsConnectionOptions;
    var Pkcs11Lib = class _Pkcs11Lib extends native_resource_1.NativeResource {
      /**
       * @param path - Path to PKCS#11 library.
       * @param behavior - Specifies how `C_Initialize()` and `C_Finalize()`
       *                   will be called on the PKCS#11 library.
       */
      constructor(path, behavior = _Pkcs11Lib.InitializeFinalizeBehavior.DEFAULT) {
        super(binding_1.default.io_pkcs11_lib_new(path, behavior));
      }
      /**
       * Release the PKCS#11 library immediately, without waiting for the GC.
       */
      close() {
        binding_1.default.io_pkcs11_lib_close(this.native_handle());
      }
    };
    exports2.Pkcs11Lib = Pkcs11Lib;
    (function(Pkcs11Lib2) {
      let InitializeFinalizeBehavior;
      (function(InitializeFinalizeBehavior2) {
        InitializeFinalizeBehavior2[InitializeFinalizeBehavior2["DEFAULT"] = 0] = "DEFAULT";
        InitializeFinalizeBehavior2[InitializeFinalizeBehavior2["OMIT"] = 1] = "OMIT";
        InitializeFinalizeBehavior2[InitializeFinalizeBehavior2["STRICT"] = 2] = "STRICT";
      })(InitializeFinalizeBehavior = Pkcs11Lib2.InitializeFinalizeBehavior || (Pkcs11Lib2.InitializeFinalizeBehavior = {}));
    })(Pkcs11Lib = exports2.Pkcs11Lib || (exports2.Pkcs11Lib = {}));
  }
});

// node_modules/aws-crt/dist/native/auth.js
var require_auth = __commonJS({
  "node_modules/aws-crt/dist/native/auth.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.aws_verify_sigv4a_signing = exports2.aws_sign_request = exports2.AwsSignedBodyHeaderType = exports2.AwsSignedBodyValue = exports2.AwsSignatureType = exports2.AwsSigningAlgorithm = exports2.AwsCredentialsProvider = void 0;
    var binding_1 = __importDefault(require_binding());
    var error_1 = require_error();
    var io_1 = require_io2();
    var AwsCredentialsProvider = class extends binding_1.default.AwsCredentialsProvider {
      /**
       * Creates a new default credentials provider to be used internally for AWS credentials resolution:
       *
       *   The CRT's default provider chain currently sources in this order:
       *
       *     1. Environment
       *     2. Profile
       *     3. (conditional, off by default) ECS
       *     4. (conditional, on by default) EC2 Instance Metadata
       *
       * @param bootstrap (optional) client bootstrap to be used to establish any required network connections
       *
       * @returns a new credentials provider using default credentials resolution rules
       */
      static newDefault(bootstrap = void 0) {
        return super.newDefault(bootstrap != null ? bootstrap.native_handle() : null);
      }
      /**
       * Creates a new credentials provider that returns a fixed set of credentials.
       *
       * @param access_key access key to use in the static credentials
       * @param secret_key secret key to use in the static credentials
       * @param session_token (optional) session token to use in the static credentials
       *
       * @returns a new credentials provider that will return a fixed set of AWS credentials
       */
      static newStatic(access_key, secret_key, session_token) {
        return super.newStatic(access_key, secret_key, session_token);
      }
      /**
       * Creates a new credentials provider that sources credentials from the AWS Cognito Identity service via the
       * GetCredentialsForIdentity http API.
       *
       * @param config provider configuration necessary to make GetCredentialsForIdentity web requests
       *
       * @returns a new credentials provider that returns credentials sourced from the AWS Cognito Identity service
       */
      static newCognito(config) {
        if (config == null || config == void 0) {
          throw new error_1.CrtError("AwsCredentialsProvider newCognito: Cognito config not defined");
        }
        return super.newCognito(config, config.tlsContext != null ? config.tlsContext.native_handle() : new io_1.ClientTlsContext().native_handle(), config.bootstrap != null ? config.bootstrap.native_handle() : null, config.httpProxyOptions ? config.httpProxyOptions.create_native_handle() : null);
      }
      /**
       * Creates a new credentials provider that sources credentials from the the X509 service on AWS IoT Core.
       *
       * @param config provider configuration necessary to source credentials via X509
       *
       * @returns a new credentials provider that returns credentials sourced from the AWS X509 service
       */
      static newX509(config) {
        if (config == null || config == void 0) {
          throw new error_1.CrtError("AwsCredentialsProvider newX509: X509 config not defined");
        }
        return super.newX509(config, config.tlsContext.native_handle(), config.httpProxyOptions ? config.httpProxyOptions.create_native_handle() : null);
      }
    };
    exports2.AwsCredentialsProvider = AwsCredentialsProvider;
    var AwsSigningAlgorithm;
    (function(AwsSigningAlgorithm2) {
      AwsSigningAlgorithm2[AwsSigningAlgorithm2["SigV4"] = 0] = "SigV4";
      AwsSigningAlgorithm2[AwsSigningAlgorithm2["SigV4Asymmetric"] = 1] = "SigV4Asymmetric";
    })(AwsSigningAlgorithm = exports2.AwsSigningAlgorithm || (exports2.AwsSigningAlgorithm = {}));
    var AwsSignatureType;
    (function(AwsSignatureType2) {
      AwsSignatureType2[AwsSignatureType2["HttpRequestViaHeaders"] = 0] = "HttpRequestViaHeaders";
      AwsSignatureType2[AwsSignatureType2["HttpRequestViaQueryParams"] = 1] = "HttpRequestViaQueryParams";
      AwsSignatureType2[AwsSignatureType2["HttpRequestChunk"] = 2] = "HttpRequestChunk";
      AwsSignatureType2[AwsSignatureType2["HttpRequestEvent"] = 3] = "HttpRequestEvent";
    })(AwsSignatureType = exports2.AwsSignatureType || (exports2.AwsSignatureType = {}));
    var AwsSignedBodyValue;
    (function(AwsSignedBodyValue2) {
      AwsSignedBodyValue2["EmptySha256"] = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      AwsSignedBodyValue2["UnsignedPayload"] = "UNSIGNED-PAYLOAD";
      AwsSignedBodyValue2["StreamingAws4HmacSha256Payload"] = "STREAMING-AWS4-HMAC-SHA256-PAYLOAD";
      AwsSignedBodyValue2["StreamingAws4HmacSha256Events"] = "STREAMING-AWS4-HMAC-SHA256-EVENTS";
    })(AwsSignedBodyValue = exports2.AwsSignedBodyValue || (exports2.AwsSignedBodyValue = {}));
    var AwsSignedBodyHeaderType;
    (function(AwsSignedBodyHeaderType2) {
      AwsSignedBodyHeaderType2[AwsSignedBodyHeaderType2["None"] = 0] = "None";
      AwsSignedBodyHeaderType2[AwsSignedBodyHeaderType2["XAmzContentSha256"] = 1] = "XAmzContentSha256";
    })(AwsSignedBodyHeaderType = exports2.AwsSignedBodyHeaderType || (exports2.AwsSignedBodyHeaderType = {}));
    function aws_sign_request(request, config) {
      return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
          try {
            binding_1.default.aws_sign_request(request, config, (error_code) => {
              if (error_code == 0) {
                resolve(request);
              } else {
                reject(new error_1.CrtError(error_code));
              }
            });
          } catch (error) {
            reject(error);
          }
        });
      });
    }
    exports2.aws_sign_request = aws_sign_request;
    function aws_verify_sigv4a_signing(request, config, expected_canonical_request, signature, ecc_key_pub_x, ecc_key_pub_y) {
      return binding_1.default.aws_verify_sigv4a_signing(request, config, expected_canonical_request, signature, ecc_key_pub_x, ecc_key_pub_y);
    }
    exports2.aws_verify_sigv4a_signing = aws_verify_sigv4a_signing;
  }
});

// node_modules/aws-crt/dist/native/checksums.js
var require_checksums = __commonJS({
  "node_modules/aws-crt/dist/native/checksums.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.crc64nvme = exports2.crc32c = exports2.crc32 = void 0;
    var binding_1 = __importDefault(require_binding());
    function crc32(data, previous) {
      return binding_1.default.checksums_crc32(data, previous);
    }
    exports2.crc32 = crc32;
    function crc32c(data, previous) {
      return binding_1.default.checksums_crc32c(data, previous);
    }
    exports2.crc32c = crc32c;
    function crc64nvme(data, previous) {
      return binding_1.default.checksums_crc64nvme(data, previous);
    }
    exports2.crc64nvme = crc64nvme;
  }
});

// node_modules/aws-crt/dist/native/crt.js
var require_crt = __commonJS({
  "node_modules/aws-crt/dist/native/crt.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.native_memory_dump = exports2.native_memory = void 0;
    var binding_1 = __importDefault(require_binding());
    function native_memory() {
      return binding_1.default.native_memory();
    }
    exports2.native_memory = native_memory;
    function native_memory_dump() {
      return binding_1.default.native_memory_dump();
    }
    exports2.native_memory_dump = native_memory_dump;
  }
});

// node_modules/aws-crt/dist/native/crypto.js
var require_crypto = __commonJS({
  "node_modules/aws-crt/dist/native/crypto.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.hmac_sha256 = exports2.Sha256Hmac = exports2.hash_sha1 = exports2.Sha1Hash = exports2.hash_sha256 = exports2.Sha256Hash = exports2.hash_md5 = exports2.Md5Hash = void 0;
    var binding_1 = __importDefault(require_binding());
    var native_resource_1 = require_native_resource();
    var Hash = class extends native_resource_1.NativeResource {
      /**
       * Hash additional data.
       * @param data Additional data to hash
       */
      update(data) {
        binding_1.default.hash_update(this.native_handle(), data);
      }
      /**
       * Completes the hash computation and returns the final hash digest.
       *
       * @param truncate_to The maximum number of bytes to receive. Leave as undefined or 0 to receive the entire digest.
       */
      finalize(truncate_to) {
        return binding_1.default.hash_digest(this.native_handle(), truncate_to);
      }
      constructor(hash_handle) {
        super(hash_handle);
      }
    };
    var Md5Hash = class extends Hash {
      constructor() {
        super(binding_1.default.hash_md5_new());
      }
    };
    exports2.Md5Hash = Md5Hash;
    function hash_md5(data, truncate_to) {
      return binding_1.default.hash_md5_compute(data, truncate_to);
    }
    exports2.hash_md5 = hash_md5;
    var Sha256Hash = class extends Hash {
      constructor() {
        super(binding_1.default.hash_sha256_new());
      }
    };
    exports2.Sha256Hash = Sha256Hash;
    function hash_sha256(data, truncate_to) {
      return binding_1.default.hash_sha256_compute(data, truncate_to);
    }
    exports2.hash_sha256 = hash_sha256;
    var Sha1Hash = class extends Hash {
      constructor() {
        super(binding_1.default.hash_sha1_new());
      }
    };
    exports2.Sha1Hash = Sha1Hash;
    function hash_sha1(data, truncate_to) {
      return binding_1.default.hash_sha1_compute(data, truncate_to);
    }
    exports2.hash_sha1 = hash_sha1;
    var Hmac = class extends native_resource_1.NativeResource {
      /**
       * Hash additional data.
       *
       * @param data additional data to hash
       */
      update(data) {
        binding_1.default.hmac_update(this.native_handle(), data);
      }
      /**
       * Completes the hash computation and returns the final hmac digest.
       *
       * @param truncate_to The maximum number of bytes to receive. Leave as undefined or 0 to receive the entire digest.
       */
      finalize(truncate_to) {
        return binding_1.default.hmac_digest(this.native_handle(), truncate_to);
      }
      constructor(hash_handle) {
        super(hash_handle);
      }
    };
    var Sha256Hmac = class extends Hmac {
      constructor(secret) {
        super(binding_1.default.hmac_sha256_new(secret));
      }
    };
    exports2.Sha256Hmac = Sha256Hmac;
    function hmac_sha256(secret, data, truncate_to) {
      return binding_1.default.hmac_sha256_compute(secret, data, truncate_to);
    }
    exports2.hmac_sha256 = hmac_sha256;
  }
});

// node_modules/aws-crt/dist/common/event.js
var require_event = __commonJS({
  "node_modules/aws-crt/dist/common/event.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BufferedEventEmitter = void 0;
    var events_1 = require("events");
    var BufferedEvent = class _BufferedEvent {
      constructor(event, args) {
        this.event = event;
        this.args = args;
      }
      static newWithEmissionCallback(key, callback, args) {
        let bufferedEvent = new _BufferedEvent(key, args);
        bufferedEvent.callback = callback;
        return bufferedEvent;
      }
    };
    var BufferedEventEmitter = class extends events_1.EventEmitter {
      constructor() {
        super();
        this.corked = false;
      }
      /**
       * Forces all written events to be buffered in memory. The buffered data will be
       * flushed when {@link BufferedEventEmitter.uncork} is called.
       */
      cork() {
        this.corked = true;
      }
      /**
       * Flushes all data buffered since {@link BufferedEventEmitter.cork} was called.
       *
       * NOTE: It is HIGHLY recommended that uncorking should always be done via
       * ``` process.nextTick```, not during the ```EventEmitter.on()``` call.
       */
      uncork() {
        this.corked = false;
        while (this.eventQueue) {
          const event = this.eventQueue;
          super.emit(event.event, ...event.args);
          if (event.callback) {
            event.callback();
          }
          this.eventQueue = this.eventQueue.next;
        }
      }
      /**
       * Synchronously calls each of the listeners registered for the event key supplied
       * in registration order. If the {@link BufferedEventEmitter} is currently corked,
       * the event will be buffered until {@link BufferedEventEmitter.uncork} is called.
       * @param event The name of the event
       * @param args Event payload
       */
      emit(event, ...args) {
        if (this.corked) {
          let last = this.lastQueuedEvent;
          this.lastQueuedEvent = new BufferedEvent(event, args);
          if (last) {
            last.next = this.lastQueuedEvent;
          } else {
            this.eventQueue = this.lastQueuedEvent;
          }
          return this.listeners(event).length > 0;
        }
        return super.emit(event, ...args);
      }
      emitWithCallback(event, emissionCallback, ...args) {
        if (this.corked) {
          let last = this.lastQueuedEvent;
          this.lastQueuedEvent = BufferedEvent.newWithEmissionCallback(event, emissionCallback, args);
          if (last) {
            last.next = this.lastQueuedEvent;
          } else {
            this.eventQueue = this.lastQueuedEvent;
          }
          return this.listeners(event).length > 0;
        }
        let result = super.emit(event, ...args);
        emissionCallback();
        return result;
      }
    };
    exports2.BufferedEventEmitter = BufferedEventEmitter;
  }
});

// node_modules/aws-crt/dist/native/eventstream_utils.js
var require_eventstream_utils = __commonJS({
  "node_modules/aws-crt/dist/native/eventstream_utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.unmarshalInt64BigintFromBuffer = exports2.marshalInt64BigintAsBuffer = exports2.MIN_INT64 = exports2.MAX_INT64 = exports2.MIN_INT32 = exports2.MAX_INT32 = exports2.MIN_INT16 = exports2.MAX_INT16 = exports2.MIN_INT8 = exports2.MAX_INT8 = void 0;
    var error_1 = require_error();
    exports2.MAX_INT8 = 127;
    exports2.MIN_INT8 = -128;
    exports2.MAX_INT16 = 32767;
    exports2.MIN_INT16 = -32768;
    exports2.MAX_INT32 = 2147483647;
    exports2.MIN_INT32 = -2147483648;
    exports2.MAX_INT64 = BigInt("9223372036854775807");
    exports2.MIN_INT64 = BigInt("-9223372036854775808");
    var MAX_UINT8_AS_BIGINT = BigInt("256");
    function marshalInt64BigintAsBuffer(value) {
      if (value < exports2.MIN_INT64 || value > exports2.MAX_INT64) {
        throw new error_1.CrtError("marshalInt64BigintAsBuffer expects a value that can fit in 8 bytes");
      }
      let buffer = new Uint8Array(8);
      if (value < 0) {
        value = -value - BigInt(1);
        for (let i = 0; i < 8; ++i) {
          buffer[i] = 255 - Number(value % MAX_UINT8_AS_BIGINT);
          value /= MAX_UINT8_AS_BIGINT;
        }
      } else {
        for (let i = 0; i < 8; ++i) {
          buffer[i] = Number(value % MAX_UINT8_AS_BIGINT);
          value /= MAX_UINT8_AS_BIGINT;
        }
      }
      return buffer;
    }
    exports2.marshalInt64BigintAsBuffer = marshalInt64BigintAsBuffer;
    function unmarshalInt64BigintFromBuffer(buffer) {
      let value = BigInt(0);
      let byteView = new Uint8Array(buffer);
      if (byteView.length != 8) {
        throw new error_1.CrtError("unmarshalInt64BigintFromBuffer expects a byte buffer of length 8");
      }
      let shift = BigInt(1);
      let isNegative = (byteView[7] & 128) != 0;
      if (isNegative) {
        for (let i = 0; i < byteView.length; ++i) {
          let byteValue = BigInt(255 - byteView[i]);
          value += byteValue * shift;
          shift *= MAX_UINT8_AS_BIGINT;
        }
        value += BigInt(1);
        value = -value;
      } else {
        for (let i = 0; i < byteView.length; ++i) {
          let byteValue = BigInt(byteView[i]);
          value += byteValue * shift;
          shift *= MAX_UINT8_AS_BIGINT;
        }
      }
      return value;
    }
    exports2.unmarshalInt64BigintFromBuffer = unmarshalInt64BigintFromBuffer;
  }
});

// node_modules/aws-crt/dist/native/eventstream.js
var require_eventstream = __commonJS({
  "node_modules/aws-crt/dist/native/eventstream.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ClientStream = exports2.ClientConnection = exports2.MessageType = exports2.MessageFlags = exports2.Header = exports2.HeaderType = void 0;
    var native_resource_1 = require_native_resource();
    var event_1 = require_event();
    var error_1 = require_error();
    var io = __importStar(require_io2());
    var eventstream_utils = __importStar(require_eventstream_utils());
    var promise = __importStar(require_promise());
    var binding_1 = __importDefault(require_binding());
    var HeaderType;
    (function(HeaderType2) {
      HeaderType2[HeaderType2["BooleanTrue"] = 0] = "BooleanTrue";
      HeaderType2[HeaderType2["BooleanFalse"] = 1] = "BooleanFalse";
      HeaderType2[HeaderType2["Byte"] = 2] = "Byte";
      HeaderType2[HeaderType2["Int16"] = 3] = "Int16";
      HeaderType2[HeaderType2["Int32"] = 4] = "Int32";
      HeaderType2[HeaderType2["Int64"] = 5] = "Int64";
      HeaderType2[HeaderType2["ByteBuffer"] = 6] = "ByteBuffer";
      HeaderType2[HeaderType2["String"] = 7] = "String";
      HeaderType2[HeaderType2["Timestamp"] = 8] = "Timestamp";
      HeaderType2[HeaderType2["UUID"] = 9] = "UUID";
    })(HeaderType = exports2.HeaderType || (exports2.HeaderType = {}));
    var AWS_MAXIMUM_EVENT_STREAM_HEADER_NAME_LENGTH = 127;
    var Header = class _Header {
      /** @internal */
      constructor(name, type, value) {
        this.name = name;
        this.type = type;
        this.value = value;
      }
      static validateHeaderName(name) {
        if (name.length == 0 || name.length > AWS_MAXIMUM_EVENT_STREAM_HEADER_NAME_LENGTH) {
          throw new error_1.CrtError(`Event stream header name (${name}) is not valid`);
        }
      }
      /**
       * Create a new boolean-valued message header
       *
       * @param name name of the header
       * @param value value of the header
       */
      static newBoolean(name, value) {
        _Header.validateHeaderName(name);
        if (value) {
          return new _Header(name, HeaderType.BooleanTrue);
        } else {
          return new _Header(name, HeaderType.BooleanFalse);
        }
      }
      /**
       * Create a new byte-valued message header
       *
       * @param name name of the header
       * @param value value of the header
       */
      static newByte(name, value) {
        _Header.validateHeaderName(name);
        if (value >= eventstream_utils.MIN_INT8 && value <= eventstream_utils.MAX_INT8 && Number.isSafeInteger(value)) {
          return new _Header(name, HeaderType.Byte, value);
        }
        throw new error_1.CrtError(`Illegal value for eventstream byte-valued header: ${value}`);
      }
      /**
       * Create a new 16-bit-integer-valued message header
       *
       * @param name name of the header
       * @param value value of the header
       */
      static newInt16(name, value) {
        _Header.validateHeaderName(name);
        if (value >= eventstream_utils.MIN_INT16 && value <= eventstream_utils.MAX_INT16 && Number.isSafeInteger(value)) {
          return new _Header(name, HeaderType.Int16, value);
        }
        throw new error_1.CrtError(`Illegal value for eventstream int16-valued header: ${value}`);
      }
      /**
       * Create a new 32-bit-integer-valued message header
       *
       * @param name name of the header
       * @param value value of the header
       */
      static newInt32(name, value) {
        _Header.validateHeaderName(name);
        if (value >= eventstream_utils.MIN_INT32 && value <= eventstream_utils.MAX_INT32 && Number.isSafeInteger(value)) {
          return new _Header(name, HeaderType.Int32, value);
        }
        throw new error_1.CrtError(`Illegal value for eventstream int32-valued header: ${value}`);
      }
      /**
       * Create a new 64-bit-integer-valued message header.  number cannot represent a full 64-bit integer range but
       * its usage is so common that this exists for convenience.  Internally, we always track 64 bit integers as
       * bigints.
       *
       * @param name name of the header
       * @param value value of the header
       */
      static newInt64FromNumber(name, value) {
        _Header.validateHeaderName(name);
        if (Number.isSafeInteger(value)) {
          return new _Header(name, HeaderType.Int64, eventstream_utils.marshalInt64BigintAsBuffer(BigInt(value)));
        }
        throw new error_1.CrtError(`Illegal value for eventstream int64-valued header: ${value}`);
      }
      /**
       * Create a new 64-bit-integer-valued message header from a big integer.
       *
       * @param name name of the header
       * @param value value of the header
       */
      static newInt64FromBigint(name, value) {
        _Header.validateHeaderName(name);
        if (value >= eventstream_utils.MIN_INT64 && value <= eventstream_utils.MAX_INT64) {
          return new _Header(name, HeaderType.Int64, eventstream_utils.marshalInt64BigintAsBuffer(value));
        }
        throw new error_1.CrtError(`Illegal value for eventstream int64-valued header: ${value}`);
      }
      /**
       * Create a new byte-buffer-valued message header
       *
       * @param name name of the header
       * @param value value of the header
       */
      static newByteBuffer(name, value) {
        _Header.validateHeaderName(name);
        return new _Header(name, HeaderType.ByteBuffer, value);
      }
      /**
       * Create a new string-valued message header
       *
       * @param name name of the header
       * @param value value of the header
       */
      static newString(name, value) {
        _Header.validateHeaderName(name);
        return new _Header(name, HeaderType.String, value);
      }
      /**
       * Create a new timestamp-valued message header from an integral value in seconds since epoch.
       *
       * @param name name of the header
       * @param value value of the header
       */
      static newTimeStampFromSecondsSinceEpoch(name, secondsSinceEpoch) {
        _Header.validateHeaderName(name);
        if (Number.isSafeInteger(secondsSinceEpoch) && secondsSinceEpoch >= 0) {
          return new _Header(name, HeaderType.Timestamp, secondsSinceEpoch);
        }
        throw new error_1.CrtError(`Illegal value for eventstream timestamp-valued header: ${secondsSinceEpoch}`);
      }
      /**
       * Create a new timestamp-valued message header from a date.
       *
       * @param name name of the header
       * @param value value of the header
       */
      static newTimeStampFromDate(name, date) {
        _Header.validateHeaderName(name);
        const secondsSinceEpoch = date.getTime();
        if (Number.isSafeInteger(secondsSinceEpoch)) {
          return new _Header(name, HeaderType.Timestamp, secondsSinceEpoch);
        }
        throw new error_1.CrtError(`Illegal value for eventstream timestamp-valued header: ${date}`);
      }
      /**
       * Create a new UUID-valued message header.
       * WIP
       *
       * @param name name of the header
       * @param value value of the header
       */
      static newUUID(name, value) {
        _Header.validateHeaderName(name);
        if (value.byteLength == 16) {
          return new _Header(name, HeaderType.UUID, value);
        }
        throw new error_1.CrtError(`Illegal value for eventstream uuid-valued header: ${value}`);
      }
      toValue(type) {
        if (type != this.type) {
          throw new error_1.CrtError(`Header of type (${this.type}) cannot be converted to type (${type})`);
        }
        return this.value;
      }
      /**
       * All conversion functions require the header's type to be appropriately matching.  There are no error-prone
       * flexible conversion helpers.
       */
      /**
       * Returns a boolean header's value.
       */
      asBoolean() {
        switch (this.type) {
          case HeaderType.BooleanFalse:
            return false;
          case HeaderType.BooleanTrue:
            return true;
          default:
            throw new error_1.CrtError(`Header of type (${this.type}) cannot be converted to type (boolean)`);
        }
      }
      /**
       * Returns a byte header's value.
       */
      asByte() {
        return this.toValue(HeaderType.Byte);
      }
      /**
       * Returns a 16-bit integer header's value.
       */
      asInt16() {
        return this.toValue(HeaderType.Int16);
      }
      /**
       * Returns a 32-bit integer header's value.
       */
      asInt32() {
        return this.toValue(HeaderType.Int32);
      }
      /**
       * Returns a 64-bit integer header's value.
       */
      asInt64() {
        return eventstream_utils.unmarshalInt64BigintFromBuffer(this.toValue(HeaderType.Int64));
      }
      /**
       * Returns a byte buffer header's value.
       */
      asByteBuffer() {
        return this.toValue(HeaderType.ByteBuffer);
      }
      /**
       * Returns a string header's value.
       */
      asString() {
        return this.toValue(HeaderType.String);
      }
      /**
       * Returns a timestamp header's value (as seconds since epoch).
       */
      asTimestamp() {
        return this.toValue(HeaderType.Timestamp);
      }
      /**
       * Returns a UUID header's value.
       */
      asUUID() {
        return this.toValue(HeaderType.UUID);
      }
    };
    exports2.Header = Header;
    var MessageFlags;
    (function(MessageFlags2) {
      MessageFlags2[MessageFlags2["None"] = 0] = "None";
      MessageFlags2[MessageFlags2["ConnectionAccepted"] = 1] = "ConnectionAccepted";
      MessageFlags2[MessageFlags2["TerminateStream"] = 2] = "TerminateStream";
    })(MessageFlags = exports2.MessageFlags || (exports2.MessageFlags = {}));
    var MessageType;
    (function(MessageType2) {
      MessageType2[MessageType2["ApplicationMessage"] = 0] = "ApplicationMessage";
      MessageType2[MessageType2["ApplicationError"] = 1] = "ApplicationError";
      MessageType2[MessageType2["Ping"] = 2] = "Ping";
      MessageType2[MessageType2["PingResponse"] = 3] = "PingResponse";
      MessageType2[MessageType2["Connect"] = 4] = "Connect";
      MessageType2[MessageType2["ConnectAck"] = 5] = "ConnectAck";
      MessageType2[MessageType2["ProtocolError"] = 6] = "ProtocolError";
      MessageType2[MessageType2["InternalError"] = 7] = "InternalError";
    })(MessageType = exports2.MessageType || (exports2.MessageType = {}));
    function mapPodHeadersToJSHeaders(headers) {
      return Array.from(headers, (header) => {
        return new Header(header.name, header.type, header.value);
      });
    }
    function mapPodMessageToJSMessage(message) {
      let jsMessage = {
        type: message.type,
        flags: message.flags,
        payload: message.payload
      };
      if (message.headers) {
        jsMessage.headers = mapPodHeadersToJSHeaders(message.headers);
      }
      return jsMessage;
    }
    var ClientConnectionState;
    (function(ClientConnectionState2) {
      ClientConnectionState2[ClientConnectionState2["None"] = 0] = "None";
      ClientConnectionState2[ClientConnectionState2["Connecting"] = 1] = "Connecting";
      ClientConnectionState2[ClientConnectionState2["Connected"] = 2] = "Connected";
      ClientConnectionState2[ClientConnectionState2["Disconnected"] = 3] = "Disconnected";
      ClientConnectionState2[ClientConnectionState2["Closed"] = 4] = "Closed";
    })(ClientConnectionState || (ClientConnectionState = {}));
    var ClientConnection = class _ClientConnection extends (0, native_resource_1.NativeResourceMixin)(event_1.BufferedEventEmitter) {
      /**
       * Configures and creates a new ClientConnection instance
       *
       * @param config configuration options for the event stream connection
       */
      constructor(config) {
        if (config === void 0) {
          throw new error_1.CrtError("Invalid configuration passed to eventstream ClientConnection constructor");
        }
        super();
        this.state = ClientConnectionState.None;
        this._super(binding_1.default.event_stream_client_connection_new(this, config, (connection2, errorCode) => {
          _ClientConnection._s_on_disconnect(connection2, errorCode);
        }, (connection2, message) => {
          _ClientConnection._s_on_protocol_message(connection2, message);
        }, config.socketOptions ? config.socketOptions.native_handle() : null, config.tlsCtx ? config.tlsCtx.native_handle() : null));
      }
      /**
       * Shuts down the connection (if active) and begins the process to release native resources associated with it by
       * having the native binding release the only reference to the extern object representing the connection.  Once
       * close() has been called, no more events will be emitted and all public API invocations will trigger an exception.
       *
       * Ultimately, the native resources will not be released until the connection has fully shut down and that
       * shutdown event has reached the libuv event loop.
       *
       * This function **must** be called for every ClientConnection instance or native resources will leak.
       */
      close() {
        if (this.state != ClientConnectionState.Closed) {
          this.state = ClientConnectionState.Closed;
          binding_1.default.event_stream_client_connection_close(this.native_handle());
        }
      }
      /**
       * Attempts to open a network connection to the configured remote endpoint.  Returned promise will be fulfilled if
       * the transport-level connection is successfully established, and rejected otherwise.
       *
       * connect() may only be called once.
       */
      connect(options) {
        return __awaiter(this, void 0, void 0, function* () {
          let cleanupCancelListener = void 0;
          let connectPromise = new Promise((resolve, reject) => {
            if (!options) {
              reject(new error_1.CrtError("Invalid options passed to event stream ClientConnection.connect"));
              return;
            }
            if (this.state != ClientConnectionState.None) {
              reject(new error_1.CrtError(`Event stream connection in a state (${this.state}) where connect() is not allowed.`));
              return;
            }
            this.state = ClientConnectionState.Connecting;
            if (options.cancelController) {
              let cancel = () => {
                reject(new error_1.CrtError(`Event stream connection connect() cancelled by external request.`));
                setImmediate(() => {
                  this.close();
                });
              };
              cleanupCancelListener = options.cancelController.addListener(cancel);
              if (!cleanupCancelListener) {
                return;
              }
            }
            function curriedPromiseCallback(connection2, errorCode) {
              return _ClientConnection._s_on_connection_setup(resolve, reject, connection2, errorCode);
            }
            try {
              binding_1.default.event_stream_client_connection_connect(this.native_handle(), curriedPromiseCallback);
            } catch (e) {
              this.state = ClientConnectionState.Disconnected;
              reject(e);
            }
          });
          return promise.makeSelfCleaningPromise(connectPromise, cleanupCancelListener);
        });
      }
      /**
       * Attempts to send an event stream protocol message over an open connection.
       *
       * @param options configuration -- including the message itself -- for sending a protocol message
       *
       * Returns a promise that will be fulfilled when the message is successfully flushed to the wire, and rejected if
       * an error occurs prior to that point.
       */
      sendProtocolMessage(options) {
        return __awaiter(this, void 0, void 0, function* () {
          let cleanupCancelListener = void 0;
          let sendProtocolMessagePromise = new Promise((resolve, reject) => {
            try {
              let curriedPromiseCallback = function(errorCode) {
                return _ClientConnection._s_on_connection_send_protocol_message_completion(resolve, reject, errorCode);
              };
              if (!options) {
                reject(new error_1.CrtError("Invalid options passed to event stream ClientConnection.sendProtocolMessage"));
                return;
              }
              if (!this.isConnected()) {
                reject(new error_1.CrtError(`Event stream connection in a state (${this.state}) where sending protocol messages is not allowed.`));
                return;
              }
              if (options.cancelController) {
                let cancel = () => {
                  reject(new error_1.CrtError(`Event stream connection sendProtocolMessage() cancelled by external request.`));
                  setImmediate(() => {
                    this.close();
                  });
                };
                cleanupCancelListener = options.cancelController.addListener(cancel);
                if (!cleanupCancelListener) {
                  return;
                }
              }
              binding_1.default.event_stream_client_connection_send_protocol_message(this.native_handle(), options, curriedPromiseCallback);
            } catch (e) {
              reject(e);
            }
          });
          return promise.makeSelfCleaningPromise(sendProtocolMessagePromise, cleanupCancelListener);
        });
      }
      /**
       * Returns true if the connection is currently open and ready-to-use, false otherwise.
       *
       * Internal note: Our notion of "connected" is intentionally not an invocation of
       * aws_event_stream_rpc_client_connection_is_open() (whose status is an out-of-sync race condition vs. our
       * well-defined client state)
       */
      isConnected() {
        return this.state == ClientConnectionState.Connected;
      }
      /**
       * Creates a new stream within the connection.
       */
      newStream() {
        if (!this.isConnected()) {
          throw new error_1.CrtError(`Event stream connection in a state (${this.state}) where creating new streams is forbidden.`);
        }
        return new ClientStream(this);
      }
      on(event, listener) {
        super.on(event, listener);
        return this;
      }
      static _s_on_connection_setup(resolve, reject, connection2, errorCode) {
        if (errorCode == 0 && connection2.state == ClientConnectionState.Connecting) {
          connection2.state = ClientConnectionState.Connected;
          resolve();
        } else {
          if (connection2.state != ClientConnectionState.Closed) {
            connection2.state = ClientConnectionState.Disconnected;
          }
          reject(io.error_code_to_string(errorCode));
        }
      }
      static _s_on_disconnect(connection2, errorCode) {
        if (connection2.state != ClientConnectionState.Closed) {
          connection2.state = ClientConnectionState.Disconnected;
        }
        process.nextTick(() => {
          connection2.emit("disconnection", { errorCode });
        });
      }
      static _s_on_protocol_message(connection2, message) {
        process.nextTick(() => {
          connection2.emit("protocolMessage", { message: mapPodMessageToJSMessage(message) });
        });
      }
      static _s_on_connection_send_protocol_message_completion(resolve, reject, errorCode) {
        if (errorCode == 0) {
          resolve();
        } else {
          reject(io.error_code_to_string(errorCode));
        }
      }
    };
    exports2.ClientConnection = ClientConnection;
    ClientConnection.DISCONNECTION = "disconnection";
    ClientConnection.PROTOCOL_MESSAGE = "protocolMessage";
    var ClientStreamState;
    (function(ClientStreamState2) {
      ClientStreamState2[ClientStreamState2["None"] = 0] = "None";
      ClientStreamState2[ClientStreamState2["Activating"] = 1] = "Activating";
      ClientStreamState2[ClientStreamState2["Activated"] = 2] = "Activated";
      ClientStreamState2[ClientStreamState2["Ended"] = 3] = "Ended";
      ClientStreamState2[ClientStreamState2["Closed"] = 4] = "Closed";
    })(ClientStreamState || (ClientStreamState = {}));
    var ClientStream = class _ClientStream extends (0, native_resource_1.NativeResourceMixin)(event_1.BufferedEventEmitter) {
      constructor(connection2) {
        super();
        this._super(binding_1.default.event_stream_client_stream_new(this, connection2.native_handle(), (stream) => {
          _ClientStream._s_on_stream_ended(stream);
        }, (stream, message) => {
          _ClientStream._s_on_stream_message(stream, message);
        }));
        this.state = ClientStreamState.None;
      }
      /**
       * Shuts down the stream (if active) and begins the process to release native resources associated with it by
       * having the native binding release the only reference to the extern object representing the stream.  Once
       * close() has been called, no more events will be emitted and all public API invocations will trigger an exception.
       *
       * Ultimately, the native resources will not be released until the native stream has fully shut down and that
       * shutdown event has reached the libuv event loop.
       *
       * This function **must** be called for every ClientStream instance or native resources will leak.
       */
      close() {
        if (this.state != ClientStreamState.Closed) {
          this.state = ClientStreamState.Closed;
          binding_1.default.event_stream_client_stream_close(this.native_handle());
        }
      }
      /**
       * Activates the stream, allowing it to start sending and receiving messages.  The promise completes when
       * the activation message has been written to the wire.
       *
       * activate() may only be called once.
       *
       * @param options -- configuration data for stream activation, including operation name and initial message
       */
      activate(options) {
        return __awaiter(this, void 0, void 0, function* () {
          let cleanupCancelListener = void 0;
          let activatePromise = new Promise((resolve, reject) => {
            try {
              let curriedPromiseCallback = function(stream, errorCode) {
                return _ClientStream._s_on_stream_activated(resolve, reject, stream, errorCode);
              };
              if (this.state != ClientStreamState.None) {
                reject(new error_1.CrtError(`Event stream in a state (${this.state}) where activation is not allowed.`));
                return;
              }
              if (options === void 0) {
                this.state = ClientStreamState.Ended;
                reject(new error_1.CrtError("Invalid options passed to ClientStream.activate"));
                return;
              }
              this.state = ClientStreamState.Activating;
              if (options.cancelController) {
                let cancel = () => {
                  reject(new error_1.CrtError(`Event stream activate() cancelled by external request.`));
                  setImmediate(() => {
                    this.close();
                  });
                };
                cleanupCancelListener = options.cancelController.addListener(cancel);
                if (!cleanupCancelListener) {
                  return;
                }
              }
              binding_1.default.event_stream_client_stream_activate(this.native_handle(), options, curriedPromiseCallback);
            } catch (e) {
              this.state = ClientStreamState.Ended;
              reject(e);
            }
          });
          return promise.makeSelfCleaningPromise(activatePromise, cleanupCancelListener);
        });
      }
      /**
       * Attempts to send an event stream message.
       *
       * @param options configuration -- including the message itself -- for sending a message
       *
       * Returns a promise that will be fulfilled when the message is successfully flushed to the wire, and rejected if
       * an error occurs prior to that point.
       */
      sendMessage(options) {
        return __awaiter(this, void 0, void 0, function* () {
          let cleanupCancelListener = void 0;
          let sendMessagePromise = new Promise((resolve, reject) => {
            try {
              let curriedPromiseCallback = function(errorCode) {
                return _ClientStream._s_on_stream_send_message_completion(resolve, reject, errorCode);
              };
              if (!options) {
                reject(new error_1.CrtError("Invalid options passed to ClientStream.sendMessage"));
                return;
              }
              if (this.state != ClientStreamState.Activated) {
                reject(new error_1.CrtError(`Event stream in a state (${this.state}) where sending messages is not allowed.`));
                return;
              }
              if (options.cancelController) {
                let cancel = () => {
                  reject(new error_1.CrtError(`Event stream sendMessage() cancelled by external request.`));
                  setImmediate(() => {
                    this.close();
                  });
                };
                cleanupCancelListener = options.cancelController.addListener(cancel);
                if (!cleanupCancelListener) {
                  return;
                }
              }
              binding_1.default.event_stream_client_stream_send_message(this.native_handle(), options, curriedPromiseCallback);
            } catch (e) {
              reject(e);
            }
          });
          return promise.makeSelfCleaningPromise(sendMessagePromise, cleanupCancelListener);
        });
      }
      /**
       * Returns true if the stream is currently active and ready-to-use, false otherwise.
       */
      isActive() {
        return this.state == ClientStreamState.Activated;
      }
      on(event, listener) {
        super.on(event, listener);
        return this;
      }
      static _s_on_stream_activated(resolve, reject, stream, errorCode) {
        if (errorCode == 0 && stream.state == ClientStreamState.Activating) {
          stream.state = ClientStreamState.Activated;
          resolve();
        } else {
          if (stream.state != ClientStreamState.Closed) {
            stream.state = ClientStreamState.Ended;
          }
          reject(io.error_code_to_string(errorCode));
        }
      }
      static _s_on_stream_send_message_completion(resolve, reject, errorCode) {
        if (errorCode == 0) {
          resolve();
        } else {
          reject(io.error_code_to_string(errorCode));
        }
      }
      static _s_on_stream_ended(stream) {
        process.nextTick(() => {
          stream.emit(_ClientStream.ENDED, {});
        });
      }
      static _s_on_stream_message(stream, message) {
        process.nextTick(() => {
          stream.emit(_ClientStream.MESSAGE, { message: mapPodMessageToJSMessage(message) });
        });
      }
    };
    exports2.ClientStream = ClientStream;
    ClientStream.ENDED = "ended";
    ClientStream.MESSAGE = "message";
  }
});

// node_modules/aws-crt/dist/common/http.js
var require_http = __commonJS({
  "node_modules/aws-crt/dist/common/http.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CommonHttpProxyOptions = exports2.HttpProxyAuthenticationType = exports2.HttpVersion = void 0;
    var HttpVersion;
    (function(HttpVersion2) {
      HttpVersion2[HttpVersion2["Unknown"] = 0] = "Unknown";
      HttpVersion2[HttpVersion2["Http1_0"] = 1] = "Http1_0";
      HttpVersion2[HttpVersion2["Http1_1"] = 2] = "Http1_1";
      HttpVersion2[HttpVersion2["Http2"] = 3] = "Http2";
    })(HttpVersion = exports2.HttpVersion || (exports2.HttpVersion = {}));
    var HttpProxyAuthenticationType;
    (function(HttpProxyAuthenticationType2) {
      HttpProxyAuthenticationType2[HttpProxyAuthenticationType2["None"] = 0] = "None";
      HttpProxyAuthenticationType2[HttpProxyAuthenticationType2["Basic"] = 1] = "Basic";
    })(HttpProxyAuthenticationType = exports2.HttpProxyAuthenticationType || (exports2.HttpProxyAuthenticationType = {}));
    var CommonHttpProxyOptions = class {
      /**
       *
       * @param host_name endpoint of the proxy to use
       * @param port port of proxy to use
       * @param auth_method type of authentication to use with the proxy
       * @param auth_username (basic authentication only) proxy username
       * @param auth_password (basic authentication only) password associated with the username
       */
      constructor(host_name, port, auth_method = HttpProxyAuthenticationType.None, auth_username, auth_password) {
        this.host_name = host_name;
        this.port = port;
        this.auth_method = auth_method;
        this.auth_username = auth_username;
        this.auth_password = auth_password;
      }
    };
    exports2.CommonHttpProxyOptions = CommonHttpProxyOptions;
  }
});

// node_modules/aws-crt/dist/native/http.js
var require_http2 = __commonJS({
  "node_modules/aws-crt/dist/native/http.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.HttpClientConnectionManager = exports2.HttpClientStream = exports2.HttpStream = exports2.HttpClientConnection = exports2.HttpProxyOptions = exports2.HttpProxyConnectionType = exports2.HttpConnection = exports2.HttpRequest = exports2.HttpHeaders = exports2.HttpProxyAuthenticationType = void 0;
    var binding_1 = __importDefault(require_binding());
    var native_resource_1 = require_native_resource();
    var error_1 = require_error();
    var http_1 = require_http();
    var http_2 = require_http();
    Object.defineProperty(exports2, "HttpProxyAuthenticationType", { enumerable: true, get: function() {
      return http_2.HttpProxyAuthenticationType;
    } });
    var event_1 = require_event();
    exports2.HttpHeaders = binding_1.default.HttpHeaders;
    var nativeHttpRequest = binding_1.default.HttpRequest;
    var HttpRequest = class extends nativeHttpRequest {
      constructor(method, path, headers, body) {
        super(method, path, headers, body === null || body === void 0 ? void 0 : body.native_handle());
      }
    };
    exports2.HttpRequest = HttpRequest;
    var HttpConnection = class extends (0, native_resource_1.NativeResourceMixin)(event_1.BufferedEventEmitter) {
      constructor(native_handle) {
        super();
        this._super(native_handle);
      }
      /**
       * Close the connection.
       * Shutdown is asynchronous. This call has no effect if the connection is already
       * closing.
       */
      close() {
        binding_1.default.http_connection_close(this.native_handle());
      }
      // Overridden to allow uncorking on ready
      on(event, listener) {
        super.on(event, listener);
        if (event == "connect") {
          process.nextTick(() => {
            this.uncork();
          });
        }
        return this;
      }
    };
    exports2.HttpConnection = HttpConnection;
    HttpConnection.CONNECT = "connect";
    HttpConnection.ERROR = "error";
    HttpConnection.CLOSE = "close";
    var HttpProxyConnectionType;
    (function(HttpProxyConnectionType2) {
      HttpProxyConnectionType2[HttpProxyConnectionType2["Legacy"] = 0] = "Legacy";
      HttpProxyConnectionType2[HttpProxyConnectionType2["Forwarding"] = 1] = "Forwarding";
      HttpProxyConnectionType2[HttpProxyConnectionType2["Tunneling"] = 2] = "Tunneling";
    })(HttpProxyConnectionType = exports2.HttpProxyConnectionType || (exports2.HttpProxyConnectionType = {}));
    var HttpProxyOptions = class extends http_1.CommonHttpProxyOptions {
      /**
       *
       * @param host_name Name of the proxy server to connect through
       * @param port Port number of the proxy server to connect through
       * @param auth_method Type of proxy authentication to use. Default is {@link HttpProxyAuthenticationType.None}
       * @param auth_username Username to use when `auth_type` is {@link HttpProxyAuthenticationType.Basic}
       * @param auth_password Password to use when `auth_type` is {@link HttpProxyAuthenticationType.Basic}
       * @param tls_opts Optional TLS connection options for the connection to the proxy host.
       *                 Must be distinct from the {@link TlsConnectionOptions} provided to
       *                 the HTTP connection
       * @param connection_type Optional Type of connection to make.  If not specified,
       *                 {@link HttpProxyConnectionType.Legacy} will be used.
       */
      constructor(host_name, port, auth_method = http_1.HttpProxyAuthenticationType.None, auth_username, auth_password, tls_opts, connection_type) {
        super(host_name, port, auth_method, auth_username, auth_password);
        this.tls_opts = tls_opts;
        this.connection_type = connection_type;
      }
      /** @internal */
      create_native_handle() {
        return binding_1.default.http_proxy_options_new(this.host_name, this.port, this.auth_method, this.auth_username, this.auth_password, this.tls_opts ? this.tls_opts.native_handle() : void 0, this.connection_type ? this.connection_type : HttpProxyConnectionType.Legacy);
      }
    };
    exports2.HttpProxyOptions = HttpProxyOptions;
    var HttpClientConnection = class extends HttpConnection {
      _on_setup(native_handle, error_code) {
        if (error_code) {
          this.emit("error", new error_1.CrtError(error_code));
          return;
        }
        this.emit("connect");
      }
      _on_shutdown(native_handle, error_code) {
        if (error_code) {
          this.emit("error", new error_1.CrtError(error_code));
          return;
        }
        this.emit("close");
      }
      /** Asynchronously establish a new HttpClientConnection.
       * @param bootstrap Client bootstrap to use when initiating socket connection.  Leave undefined to use the
       *          default system-wide bootstrap (recommended).
       * @param host_name Host to connect to
       * @param port Port to connect to on host
       * @param socket_options Socket options
       * @param tls_opts Optional TLS connection options
       * @param proxy_options Optional proxy options
      */
      constructor(bootstrap, host_name, port, socket_options, tls_opts, proxy_options, handle) {
        if (socket_options == null || socket_options == void 0) {
          throw new error_1.CrtError("HttpClientConnection constructor: socket_options not defined");
        }
        super(handle ? handle : binding_1.default.http_connection_new(bootstrap != null ? bootstrap.native_handle() : null, (handle2, error_code) => {
          this._on_setup(handle2, error_code);
        }, (handle2, error_code) => {
          this._on_shutdown(handle2, error_code);
        }, host_name, port, socket_options.native_handle(), tls_opts ? tls_opts.native_handle() : void 0, proxy_options ? proxy_options.create_native_handle() : void 0));
        this.bootstrap = bootstrap;
        this.socket_options = socket_options;
        this.tls_opts = tls_opts;
      }
      /**
       * Create {@link HttpClientStream} to carry out the request/response exchange.
       *
       * NOTE: The stream sends no data until :meth:`HttpClientStream.activate()`
       * is called. Call {@link HttpStream.activate} when you're ready for
       * callbacks and events to fire.
       * @param request - The HttpRequest to attempt on this connection
       * @returns A new stream that will deliver events for the request
       */
      request(request) {
        let stream;
        const on_response_impl = (status_code, headers) => {
          stream._on_response(status_code, headers);
        };
        const on_body_impl = (data) => {
          stream._on_body(data);
        };
        const on_complete_impl = (error_code) => {
          stream._on_complete(error_code);
        };
        const native_handle = binding_1.default.http_stream_new(this.native_handle(), request, on_complete_impl, on_response_impl, on_body_impl);
        return stream = new HttpClientStream(native_handle, this, request);
      }
    };
    exports2.HttpClientConnection = HttpClientConnection;
    var HttpStream = class extends (0, native_resource_1.NativeResourceMixin)(event_1.BufferedEventEmitter) {
      constructor(native_handle, connection2) {
        super();
        this.connection = connection2;
        this._super(native_handle);
        this.cork();
      }
      /**
       * Begin sending the request.
       *
       * The stream does nothing until this is called. Call activate() when you
       * are ready for its callbacks and events to fire.
       */
      activate() {
        binding_1.default.http_stream_activate(this.native_handle());
      }
      /**
       * Closes and ends all communication on this stream. Called automatically after the 'end'
       * event is delivered. Calling this manually is only necessary if you wish to terminate
       * communication mid-request/response.
       */
      close() {
        binding_1.default.http_stream_close(this.native_handle());
      }
      /** @internal */
      _on_body(data) {
        this.emit("data", data);
      }
      /** @internal */
      _on_complete(error_code) {
        if (error_code) {
          this.emit("error", new error_1.CrtError(error_code));
          this.close();
          return;
        }
        this.on("end", () => {
          this.close();
        });
        this.emit("end");
      }
    };
    exports2.HttpStream = HttpStream;
    var HttpClientStream = class extends HttpStream {
      constructor(native_handle, connection2, request) {
        super(native_handle, connection2);
        this.request = request;
      }
      /**
       * HTTP status code returned from the server.
       * @return Either the status code, or undefined if the server response has not arrived yet.
       */
      status_code() {
        return this.response_status_code;
      }
      // Overridden to allow uncorking on ready and response
      on(event, listener) {
        super.on(event, listener);
        if (event == "response") {
          process.nextTick(() => {
            this.uncork();
          });
        }
        return this;
      }
      /** @internal */
      _on_response(status_code, header_array) {
        this.response_status_code = status_code;
        let headers = new exports2.HttpHeaders(header_array);
        this.emit("response", status_code, headers);
      }
    };
    exports2.HttpClientStream = HttpClientStream;
    HttpClientStream.RESPONSE = "response";
    HttpClientStream.DATA = "data";
    HttpClientStream.ERROR = "error";
    HttpClientStream.END = "end";
    HttpClientStream.HEADERS = "headers";
    var HttpClientConnectionManager = class extends native_resource_1.NativeResource {
      /**
       * @param bootstrap Client bootstrap to use when initiating socket connections.  Leave undefined to use the
       *          default system-wide bootstrap (recommended).
       * @param host Host to connect to
       * @param port Port to connect to on host
       * @param max_connections Maximum number of connections to pool
       * @param initial_window_size Optional initial window size
       * @param socket_options Socket options to use when initiating socket connections
       * @param tls_opts Optional TLS connection options
       * @param proxy_options Optional proxy options
       */
      constructor(bootstrap, host, port, max_connections, initial_window_size, socket_options, tls_opts, proxy_options) {
        if (socket_options == null || socket_options == void 0) {
          throw new error_1.CrtError("HttpClientConnectionManager constructor: socket_options not defined");
        }
        super(binding_1.default.http_connection_manager_new(
          bootstrap != null ? bootstrap.native_handle() : null,
          host,
          port,
          max_connections,
          initial_window_size,
          socket_options.native_handle(),
          tls_opts ? tls_opts.native_handle() : void 0,
          proxy_options ? proxy_options.create_native_handle() : void 0,
          void 0
          /* on_shutdown */
        ));
        this.bootstrap = bootstrap;
        this.host = host;
        this.port = port;
        this.max_connections = max_connections;
        this.initial_window_size = initial_window_size;
        this.socket_options = socket_options;
        this.tls_opts = tls_opts;
        this.proxy_options = proxy_options;
        this.connections = /* @__PURE__ */ new Map();
      }
      /**
      * Vends a connection from the pool
      * @returns A promise that results in an HttpClientConnection. When done with the connection, return
      *          it via {@link release}
      */
      acquire() {
        return new Promise((resolve, reject) => {
          const on_acquired = (handle, error_code) => {
            if (error_code) {
              reject(new error_1.CrtError(error_code));
              return;
            }
            let connection2 = this.connections.get(handle);
            if (!connection2) {
              connection2 = new HttpClientConnection(this.bootstrap, this.host, this.port, this.socket_options, this.tls_opts, this.proxy_options, handle);
              this.connections.set(handle, connection2);
              connection2.on("close", () => {
                this.connections.delete(handle);
              });
            }
            resolve(connection2);
          };
          binding_1.default.http_connection_manager_acquire(this.native_handle(), on_acquired);
        });
      }
      /**
       * Returns an unused connection to the pool
       * @param connection - The connection to return
      */
      release(connection2) {
        if (connection2 == null || connection2 == void 0) {
          throw new error_1.CrtError("HttpClientConnectionManager release: connection not defined");
        }
        binding_1.default.http_connection_manager_release(this.native_handle(), connection2.native_handle());
      }
      /** Closes all connections and rejects all pending requests */
      close() {
        binding_1.default.http_connection_manager_close(this.native_handle());
      }
    };
    exports2.HttpClientConnectionManager = HttpClientConnectionManager;
  }
});

// node_modules/aws-crt/dist/common/mqtt.js
var require_mqtt = __commonJS({
  "node_modules/aws-crt/dist/common/mqtt.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_RECONNECT_MIN_SEC = exports2.DEFAULT_RECONNECT_MAX_SEC = exports2.MqttWill = exports2.QoS = void 0;
    var QoS;
    (function(QoS2) {
      QoS2[QoS2["AtMostOnce"] = 0] = "AtMostOnce";
      QoS2[QoS2["AtLeastOnce"] = 1] = "AtLeastOnce";
      QoS2[QoS2["ExactlyOnce"] = 2] = "ExactlyOnce";
    })(QoS = exports2.QoS || (exports2.QoS = {}));
    var MqttWill = class {
      constructor(topic, qos, payload, retain = false) {
        this.topic = topic;
        this.qos = qos;
        this.payload = payload;
        this.retain = retain;
      }
    };
    exports2.MqttWill = MqttWill;
    exports2.DEFAULT_RECONNECT_MAX_SEC = 128;
    exports2.DEFAULT_RECONNECT_MIN_SEC = 1;
  }
});

// node_modules/aws-crt/dist/common/utils.js
var require_utils = __commonJS({
  "node_modules/aws-crt/dist/common/utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.set_defined_property = void 0;
    function set_defined_property(object, propertyName, value) {
      if (value === void 0 || value == null) {
        return false;
      }
      object[propertyName] = value;
      return true;
    }
    exports2.set_defined_property = set_defined_property;
  }
});

// node_modules/aws-crt/dist/common/mqtt_shared.js
var require_mqtt_shared = __commonJS({
  "node_modules/aws-crt/dist/common/mqtt_shared.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PublishAcknowledgementHandle = exports2.queueAcknowledgeableEvent = exports2.emitAcknowledgeableEvent = exports2.PublishAcknowledgementHandleWrapper = exports2.isValidTopic = exports2.isValidTopicFilter = exports2.AwsIoTDeviceSDKMetrics = exports2.SDK_NAME = exports2.DEFAULT_KEEP_ALIVE = exports2.normalize_payload_to_buffer = exports2.normalize_payload = void 0;
    function normalize_payload(payload) {
      if (payload instanceof Buffer) {
        return payload;
      }
      if (typeof payload === "string") {
        return payload;
      }
      if (ArrayBuffer.isView(payload)) {
        const view = payload;
        return Buffer.from(view.buffer, view.byteOffset, view.byteLength);
      }
      if (payload instanceof ArrayBuffer) {
        return Buffer.from(payload);
      }
      if (typeof payload === "object") {
        return JSON.stringify(payload);
      }
      if (!payload) {
        return "";
      }
      throw new TypeError("payload parameter must be a string, object, or DataView.");
    }
    exports2.normalize_payload = normalize_payload;
    function normalize_payload_to_buffer(payload) {
      let normalized = normalize_payload(payload);
      if (typeof normalized === "string") {
        return Buffer.from(normalized);
      }
      return normalized;
    }
    exports2.normalize_payload_to_buffer = normalize_payload_to_buffer;
    exports2.DEFAULT_KEEP_ALIVE = 1200;
    exports2.SDK_NAME = "IoTDeviceSDK/JS";
    var AwsIoTDeviceSDKMetrics = class {
      constructor() {
        this.libraryName = exports2.SDK_NAME;
      }
    };
    exports2.AwsIoTDeviceSDKMetrics = AwsIoTDeviceSDKMetrics;
    function isValidTopicInternal(topic, isFilter) {
      if (topic.length === 0 || topic.length > 65535) {
        return false;
      }
      let sawHash = false;
      for (let segment of topic.split("/")) {
        if (sawHash) {
          return false;
        }
        if (segment.length === 0) {
          continue;
        }
        if (segment.includes("+")) {
          if (!isFilter) {
            return false;
          }
          if (segment.length > 1) {
            return false;
          }
        }
        if (segment.includes("#")) {
          if (!isFilter) {
            return false;
          }
          if (segment.length > 1) {
            return false;
          }
          sawHash = true;
        }
      }
      return true;
    }
    function isValidTopicFilter(topicFilter) {
      if (typeof topicFilter !== "string") {
        return false;
      }
      let topicFilterAsString = topicFilter;
      return isValidTopicInternal(topicFilterAsString, true);
    }
    exports2.isValidTopicFilter = isValidTopicFilter;
    function isValidTopic(topic) {
      if (typeof topic !== "string") {
        return false;
      }
      let topicAsString = topic;
      return isValidTopicInternal(topicAsString, false);
    }
    exports2.isValidTopic = isValidTopic;
    var PublishAcknowledgementHandleWrapper = class {
      constructor(handle) {
        this.ackHandle = handle;
      }
      /**
       * Attempt to take the acknowledgement handle held by the wrapper.  This will only succeed for the first caller;
       * after the initial call, null will be returned.  By taking the handle, the caller assumes responsibility
       * for sending the acknowledgement packet associated with the incoming publish packet.  Failing to trigger the
       * acknowledgement will cause the broker to potentially re-send the publish.
       */
      acquireHandle() {
        let handle = this.ackHandle;
        this.ackHandle = null;
        return handle;
      }
    };
    exports2.PublishAcknowledgementHandleWrapper = PublishAcknowledgementHandleWrapper;
    function movePublishAcknowledgementHandleWrapper(wrapper, compositionFunctor) {
      if (wrapper) {
        let handle = wrapper.acquireHandle();
        if (compositionFunctor && handle) {
          let interiorHandle = handle;
          handle = new PublishAcknowledgementHandle(() => {
            interiorHandle.invokeAcknowledgement();
            compositionFunctor();
          });
        }
        return new PublishAcknowledgementHandleWrapper(handle);
      }
      return void 0;
    }
    function emitAcknowledgeableEvent(emitter, ackEvent, ackEventPayload, wrapperFieldName, ackHandleWrapper, compositionFunctor) {
      ackHandleWrapper = movePublishAcknowledgementHandleWrapper(ackHandleWrapper, compositionFunctor);
      if (ackHandleWrapper) {
        ackEventPayload[wrapperFieldName] = ackHandleWrapper;
        emitter.emitWithCallback(ackEvent, () => {
          if (ackHandleWrapper) {
            let handle = ackHandleWrapper.acquireHandle();
            if (handle) {
              handle.invokeAcknowledgement();
            }
          }
        }, ackEventPayload);
      } else {
        emitter.emit(ackEvent, ackEventPayload);
      }
    }
    exports2.emitAcknowledgeableEvent = emitAcknowledgeableEvent;
    function queueAcknowledgeableEvent(emitter, ackEvent, ackEventPayload, wrapperFieldName, ackHandleWrapper, compositionFunctor) {
      let wrapper = movePublishAcknowledgementHandleWrapper(ackHandleWrapper, compositionFunctor);
      queueMicrotask(() => {
        if (wrapper) {
          ackEventPayload[wrapperFieldName] = wrapper;
          emitter.emitWithCallback(ackEvent, () => {
            if (wrapper) {
              let handle = wrapper.acquireHandle();
              if (handle) {
                handle.invokeAcknowledgement();
              }
            }
          }, ackEventPayload);
        } else {
          emitter.emit(ackEvent, ackEventPayload);
        }
      });
    }
    exports2.queueAcknowledgeableEvent = queueAcknowledgeableEvent;
    var PublishAcknowledgementHandle = class {
      constructor(acknowledgementFunction) {
        this.acknowledgementFunction = acknowledgementFunction;
      }
      /**
       * trigger the acknowledgement for an associated Publish packet
       */
      invokeAcknowledgement() {
        let acknowledgementFunction = this.acknowledgementFunction;
        this.acknowledgementFunction = void 0;
        if (acknowledgementFunction) {
          acknowledgementFunction();
        }
      }
    };
    exports2.PublishAcknowledgementHandle = PublishAcknowledgementHandle;
  }
});

// node_modules/aws-crt/dist/common/aws_iot_shared.js
var require_aws_iot_shared = __commonJS({
  "node_modules/aws-crt/dist/common/aws_iot_shared.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.extractRegionFromEndpoint = exports2.buildMqtt5FinalUsername = exports2.canonicalizeCustomAuthConfig = exports2.canonicalizeCustomAuthTokenSignature = exports2.populate_username_string_with_custom_authorizer = exports2.is_string_and_not_empty = exports2.add_to_username_parameter = void 0;
    var platform = __importStar(require_platform());
    var utils = __importStar(require_utils());
    var mqtt_shared_1 = require_mqtt_shared();
    function add_to_username_parameter(current_username, parameter_value, parameter_pre_text) {
      let return_string = current_username;
      if (return_string.indexOf("?") != -1) {
        return_string += "&";
      } else {
        return_string += "?";
      }
      if (parameter_value.indexOf(parameter_pre_text) != -1) {
        return return_string + parameter_value;
      } else {
        return return_string + parameter_pre_text + parameter_value;
      }
    }
    exports2.add_to_username_parameter = add_to_username_parameter;
    function is_string_and_not_empty(item) {
      return item != void 0 && typeof item == "string" && item != "";
    }
    exports2.is_string_and_not_empty = is_string_and_not_empty;
    function populate_username_string_with_custom_authorizer(current_username, input_username, input_authorizer, input_signature, input_builder_username, input_token_key_name, input_token_value) {
      let username_string = "";
      if (current_username) {
        username_string += current_username;
      }
      if (is_string_and_not_empty(input_username) == false) {
        if (is_string_and_not_empty(input_builder_username) && input_builder_username) {
          username_string += input_builder_username;
        }
      } else {
        username_string += input_username;
      }
      if (is_string_and_not_empty(input_authorizer) && input_authorizer) {
        username_string = add_to_username_parameter(username_string, input_authorizer, "x-amz-customauthorizer-name=");
      }
      if (is_string_and_not_empty(input_signature) || is_string_and_not_empty(input_token_value) || is_string_and_not_empty(input_token_key_name)) {
        if (!input_token_value || !input_token_key_name || !input_signature) {
          throw new Error("Signing-based custom authentication requires all token-related properties to be set");
        }
      }
      if (is_string_and_not_empty(input_signature) && input_signature) {
        username_string = add_to_username_parameter(username_string, input_signature, "x-amz-customauthorizer-signature=");
      }
      if (is_string_and_not_empty(input_token_value) && is_string_and_not_empty(input_token_key_name)) {
        username_string = add_to_username_parameter(username_string, input_token_value, input_token_key_name + "=");
      }
      return username_string;
    }
    exports2.populate_username_string_with_custom_authorizer = populate_username_string_with_custom_authorizer;
    function canonicalizeCustomAuthTokenSignature(signature) {
      if (signature === void 0 || signature == null) {
        return void 0;
      }
      let hasPercent = signature.indexOf("%") != -1;
      if (hasPercent) {
        return signature;
      } else {
        return encodeURIComponent(signature);
      }
    }
    exports2.canonicalizeCustomAuthTokenSignature = canonicalizeCustomAuthTokenSignature;
    function canonicalizeCustomAuthConfig(config) {
      let processedConfig = {};
      utils.set_defined_property(processedConfig, "authorizerName", config.authorizerName);
      utils.set_defined_property(processedConfig, "username", config.username);
      utils.set_defined_property(processedConfig, "password", config.password);
      utils.set_defined_property(processedConfig, "tokenKeyName", config.tokenKeyName);
      utils.set_defined_property(processedConfig, "tokenValue", config.tokenValue);
      utils.set_defined_property(processedConfig, "tokenSignature", canonicalizeCustomAuthTokenSignature(config.tokenSignature));
      return processedConfig;
    }
    exports2.canonicalizeCustomAuthConfig = canonicalizeCustomAuthConfig;
    function addParam(paramName, paramValue, paramSet) {
      if (paramValue) {
        paramSet.push([paramName, paramValue]);
      }
    }
    function buildMqtt5FinalUsername(customAuthConfig) {
      let path = "";
      let paramList = [];
      if (customAuthConfig) {
        let usingSigning = false;
        if (customAuthConfig.tokenValue || customAuthConfig.tokenKeyName || customAuthConfig.tokenSignature) {
          usingSigning = true;
          if (!customAuthConfig.tokenValue || !customAuthConfig.tokenKeyName || !customAuthConfig.tokenSignature) {
            throw new Error("Token-based custom authentication requires all token-related properties to be set");
          }
        }
        let username = customAuthConfig.username;
        let pathSplit = (username !== null && username !== void 0 ? username : "").split("?");
        let params = pathSplit.slice(1);
        path = pathSplit[0];
        if (params.length > 1) {
          throw new Error("Custom auth username property value is invalid");
        } else if (params.length == 1) {
          params[0].split("&").forEach((keyValue, index, array) => {
            var _a;
            let kvPair = keyValue.split("=");
            paramList.push([kvPair[0], (_a = kvPair[1]) !== null && _a !== void 0 ? _a : ""]);
          });
        }
        addParam("x-amz-customauthorizer-name", customAuthConfig.authorizerName, paramList);
        if (usingSigning) {
          addParam(customAuthConfig.tokenKeyName, customAuthConfig.tokenValue, paramList);
          addParam("x-amz-customauthorizer-signature", customAuthConfig.tokenSignature, paramList);
        }
      }
      paramList.push(["SDK", mqtt_shared_1.SDK_NAME]);
      paramList.push(["Version", platform.crt_version()]);
      return (path !== null && path !== void 0 ? path : "") + "?" + paramList.map((value) => `${value[0]}=${value[1]}`).join("&");
    }
    exports2.buildMqtt5FinalUsername = buildMqtt5FinalUsername;
    function extractRegionFromEndpoint(endpoint) {
      const regexpRegion = /^[\w\-]+\.[\w\-]+\.([\w+\-]+)\./;
      const match = endpoint.match(regexpRegion);
      if (match) {
        return match[1];
      }
      throw new Error("AWS region could not be extracted from endpoint.  Use 'region' property on WebsocketConfig to set manually.");
    }
    exports2.extractRegionFromEndpoint = extractRegionFromEndpoint;
  }
});

// node_modules/aws-crt/dist/native/aws_iot.js
var require_aws_iot = __commonJS({
  "node_modules/aws-crt/dist/native/aws_iot.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AwsIotMqttConnectionConfigBuilder = void 0;
    var mqtt_1 = require_mqtt();
    var io = __importStar(require_io2());
    var io_1 = require_io2();
    var error_1 = require_error();
    var auth_1 = require_auth();
    var iot_shared = __importStar(require_aws_iot_shared());
    var AwsIotMqttConnectionConfigBuilder = class _AwsIotMqttConnectionConfigBuilder {
      constructor(tls_ctx_options) {
        this.tls_ctx_options = tls_ctx_options;
        this.params = {
          client_id: "",
          host_name: "",
          socket_options: new io.SocketOptions(),
          port: 8883,
          use_websocket: false,
          clean_session: false,
          keep_alive: void 0,
          will: void 0,
          username: "",
          password: void 0,
          tls_ctx: void 0,
          reconnect_min_sec: mqtt_1.DEFAULT_RECONNECT_MIN_SEC,
          reconnect_max_sec: mqtt_1.DEFAULT_RECONNECT_MAX_SEC
        };
        this.is_using_custom_authorizer = false;
      }
      /**
       * Create a new builder with mTLS file paths
       * @param cert_path - Path to certificate, in PEM format
       * @param key_path - Path to private key, in PEM format
       */
      static new_mtls_builder_from_path(cert_path, key_path) {
        let builder = new _AwsIotMqttConnectionConfigBuilder(io_1.TlsContextOptions.create_client_with_mtls_from_path(cert_path, key_path));
        builder.params.port = 8883;
        if (io.is_alpn_available()) {
          builder.tls_ctx_options.alpn_list.unshift("x-amzn-mqtt-ca");
        }
        return builder;
      }
      /**
       * Create a new builder with mTLS cert pair in memory
       * @param cert - Certificate, in PEM format
       * @param private_key - Private key, in PEM format
       */
      static new_mtls_builder(cert, private_key) {
        let builder = new _AwsIotMqttConnectionConfigBuilder(io_1.TlsContextOptions.create_client_with_mtls(cert, private_key));
        builder.params.port = 8883;
        if (io.is_alpn_available()) {
          builder.tls_ctx_options.alpn_list.unshift("x-amzn-mqtt-ca");
        }
        return builder;
      }
      /**
       * Create a new builder with mTLS using a PKCS#11 library for private key operations.
       *
       * NOTE: This configuration only works on Unix devices.
       * @param pkcs11_options - PKCS#11 options.
       */
      static new_mtls_pkcs11_builder(pkcs11_options) {
        let builder = new _AwsIotMqttConnectionConfigBuilder(io_1.TlsContextOptions.create_client_with_mtls_pkcs11(pkcs11_options));
        builder.params.port = 8883;
        if (io.is_alpn_available()) {
          builder.tls_ctx_options.alpn_list.unshift("x-amzn-mqtt-ca");
        }
        return builder;
      }
      /**
       * Create a new builder with mTLS using a PKCS#12 file for private key operations.
       *
       * Note: This configuration only works on MacOS devices.
       *
       * @param pkcs12_options - The PKCS#12 options to use in the builder.
       */
      static new_mtls_pkcs12_builder(pkcs12_options) {
        let builder = new _AwsIotMqttConnectionConfigBuilder(io_1.TlsContextOptions.create_client_with_mtls_pkcs12_from_path(pkcs12_options.pkcs12_file, pkcs12_options.pkcs12_password));
        builder.params.port = 8883;
        if (io.is_alpn_available()) {
          builder.tls_ctx_options.alpn_list.unshift("x-amzn-mqtt-ca");
        }
        return builder;
      }
      /**
       * Create a new builder with mTLS using a certificate in a Windows certificate store.
       *
       * NOTE: This configuration only works on Windows devices.
       * @param certificate_path - Path to certificate in a Windows certificate store.
       *      The path must use backslashes and end with the certificate's thumbprint.
       *      Example: `CurrentUser\MY\A11F8A9B5DF5B98BA3508FBCA575D09570E0D2C6`
       */
      static new_mtls_windows_cert_store_path_builder(certificate_path) {
        let builder = new _AwsIotMqttConnectionConfigBuilder(io_1.TlsContextOptions.create_client_with_mtls_windows_cert_store_path(certificate_path));
        builder.params.port = 8883;
        if (io.is_alpn_available()) {
          builder.tls_ctx_options.alpn_list.unshift("x-amzn-mqtt-ca");
        }
        return builder;
      }
      /**
       * Creates a new builder with default Tls options. This requires setting the connection details manually.
       */
      static new_default_builder() {
        let ctx_options = new io.TlsContextOptions();
        let builder = new _AwsIotMqttConnectionConfigBuilder(ctx_options);
        return builder;
      }
      static new_websocket_builder(...args) {
        return this.new_with_websockets(...args);
      }
      static configure_websocket_handshake(builder, options) {
        if (options) {
          if (builder == null || builder == void 0) {
            throw new error_1.CrtError("AwsIotMqttConnectionConfigBuilder configure_websocket_handshake: builder not defined");
          }
          builder.params.websocket_handshake_transform = (request, done) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const signing_config = (_b = (_a = options.create_signing_config) === null || _a === void 0 ? void 0 : _a.call(options)) !== null && _b !== void 0 ? _b : {
              algorithm: auth_1.AwsSigningAlgorithm.SigV4,
              signature_type: auth_1.AwsSignatureType.HttpRequestViaQueryParams,
              provider: options.credentials_provider,
              region: options.region,
              service: (_c = options.service) !== null && _c !== void 0 ? _c : "iotdevicegateway",
              signed_body_value: auth_1.AwsSignedBodyValue.EmptySha256,
              omit_session_token: true
            };
            try {
              yield (0, auth_1.aws_sign_request)(request, signing_config);
              done();
            } catch (error) {
              if (error instanceof error_1.CrtError) {
                done(error.error_code);
              } else {
                done(3);
              }
            }
          });
        }
        return builder;
      }
      /**
       * Configures the connection to use MQTT over websockets. Forces the port to 443.
       */
      static new_with_websockets(options) {
        let tls_ctx_options = options === null || options === void 0 ? void 0 : options.tls_ctx_options;
        if (!tls_ctx_options) {
          tls_ctx_options = new io_1.TlsContextOptions();
          tls_ctx_options.alpn_list = [];
        }
        let builder = new _AwsIotMqttConnectionConfigBuilder(tls_ctx_options);
        builder.params.use_websocket = true;
        builder.params.proxy_options = options === null || options === void 0 ? void 0 : options.proxy_options;
        if (builder.tls_ctx_options) {
          builder.params.port = 443;
        }
        this.configure_websocket_handshake(builder, options);
        return builder;
      }
      /**
       * For API compatibility with the browser version. Alias for {@link new_with_websockets}.
       *
       * @returns a new websocket connection builder object with default TLS configuration
       */
      static new_builder_for_websocket() {
        return this.new_with_websockets();
      }
      /**
       * Overrides the default system trust store.
       * @param ca_dirpath - Only used on Unix-style systems where all trust anchors are
       * stored in a directory (e.g. /etc/ssl/certs).
       * @param ca_filepath - Single file containing all trust CAs, in PEM format
       */
      with_certificate_authority_from_path(ca_dirpath, ca_filepath) {
        this.tls_ctx_options.override_default_trust_store_from_path(ca_dirpath, ca_filepath);
        return this;
      }
      /**
       * Overrides the default system trust store.
       * @param ca - Buffer containing all trust CAs, in PEM format
       */
      with_certificate_authority(ca) {
        this.tls_ctx_options.override_default_trust_store(ca);
        return this;
      }
      /**
       * Configures which TLS cipher preference should be used when establishing connections
       *
       * @param tls_cipher_preference cipher preference to use
       */
      with_tls_cipher_preference(tls_cipher_preference) {
        this.tls_ctx_options.tls_cipher_preference = tls_cipher_preference;
        return this;
      }
      /**
       * Configures the IoT endpoint for this connection
       * @param endpoint The IoT endpoint to connect to
       */
      with_endpoint(endpoint) {
        this.params.host_name = endpoint;
        return this;
      }
      /**
       * The port to connect to on the IoT endpoint
       * @param port The port to connect to on the IoT endpoint. Usually 8883 for MQTT, or 443 for websockets
       */
      with_port(port) {
        this.params.port = port;
        return this;
      }
      /**
       * Configures the client_id to use to connect to the IoT Core service
       * @param client_id The client id for this connection. Needs to be unique across all devices/clients.
       */
      with_client_id(client_id) {
        this.params.client_id = client_id;
        return this;
      }
      /**
       * Determines whether or not the service should try to resume prior subscriptions, if it has any
       * @param clean_session true if the session should drop prior subscriptions when this client connects, false to resume the session
       */
      with_clean_session(clean_session) {
        this.params.clean_session = clean_session;
        return this;
      }
      /**
       * Configures MQTT keep-alive via PING messages. Note that this is not TCP keepalive.
       * @param keep_alive How often in seconds to send an MQTT PING message to the service to keep the connection alive
       */
      with_keep_alive_seconds(keep_alive) {
        this.params.keep_alive = keep_alive;
        return this;
      }
      /**
       * Configures the TCP socket timeout (in milliseconds)
       * @param timeout_ms TCP socket timeout
       * @deprecated
       */
      with_timeout_ms(timeout_ms) {
        this.with_ping_timeout_ms(timeout_ms);
        return this;
      }
      /**
       * Configures the PINGREQ response timeout (in milliseconds)
       * @param ping_timeout PINGREQ response timeout
       */
      with_ping_timeout_ms(ping_timeout) {
        this.params.ping_timeout = ping_timeout;
        return this;
      }
      /**
       * Configures the protocol operation timeout (in milliseconds)
       * @param protocol_operation_timeout protocol operation timeout
       */
      with_protocol_operation_timeout_ms(protocol_operation_timeout) {
        this.params.protocol_operation_timeout = protocol_operation_timeout;
        return this;
      }
      /**
       * Configures the will message to be sent when this client disconnects
       * @param will The will topic, qos, and message
       */
      with_will(will) {
        this.params.will = will;
        return this;
      }
      /**
       * Configures the common settings for the socket to use when opening a connection to the server
       * @param socket_options The socket settings
       */
      with_socket_options(socket_options) {
        this.params.socket_options = socket_options;
        return this;
      }
      /**
       * Configures AWS credentials (usually from Cognito) for this connection
       * @param aws_region The service region to connect to
       * @param aws_access_id IAM Access ID
       * @param aws_secret_key IAM Secret Key
       * @param aws_sts_token STS token from Cognito (optional)
       */
      with_credentials(aws_region, aws_access_id, aws_secret_key, aws_sts_token) {
        return _AwsIotMqttConnectionConfigBuilder.configure_websocket_handshake(this, {
          credentials_provider: auth_1.AwsCredentialsProvider.newStatic(aws_access_id, aws_secret_key, aws_sts_token),
          region: aws_region,
          service: "iotdevicegateway"
        });
      }
      /**
       * Configure the http proxy options to use to establish the connection
       * @param proxy_options proxy options to use to establish the mqtt connection
       */
      with_http_proxy_options(proxy_options) {
        this.params.proxy_options = proxy_options;
        return this;
      }
      /**
       * Sets the custom authorizer settings. This function will modify the username, port, and TLS options.
       *
       * @param username The username to use with the custom authorizer. If an empty string is passed, it will
       *                 check to see if a username has already been set (via WithUsername function). If no
       *                 username is set then no username will be passed with the MQTT connection.
       * @param authorizer_name The name of the custom authorizer. If an empty string is passed, then
       *                       'x-amz-customauthorizer-name' will not be added with the MQTT connection.  It is strongly
       *                       recommended to URL-encode this value; the SDK will not do so for you.
       * @param authorizer_signature The signature of the custom authorizer. If an empty string is passed, then
       *                            'x-amz-customauthorizer-signature' will not be added with the MQTT connection.
       *                            The signature must be based on the private key associated with the custom authorizer.
       *                            The signature must be base64 encoded.
       *                            Required if the custom authorizer has signing enabled.
       * @param password The password to use with the custom authorizer. If null is passed, then no password will
       *                 be set.
       * @param token_key_name Key used to extract the custom authorizer token from MQTT username query-string properties.
       *                       Required if the custom authorizer has signing enabled.  It is strongly suggested to URL-encode
       *                       this value; the SDK will not do so for you.
       * @param token_value An opaque token value.
       *                    Required if the custom authorizer has signing enabled. This value must be signed by the private
       *                    key associated with the custom authorizer and the result placed in the token_signature argument.
       */
      with_custom_authorizer(username, authorizer_name, authorizer_signature, password, token_key_name, token_value) {
        this.is_using_custom_authorizer = true;
        let uri_encoded_signature = iot_shared.canonicalizeCustomAuthTokenSignature(authorizer_signature);
        let username_string = iot_shared.populate_username_string_with_custom_authorizer("", username, authorizer_name, uri_encoded_signature, this.params.username, token_key_name, token_value);
        this.params.username = username_string;
        this.params.password = password;
        if (!this.params.use_websocket) {
          this.tls_ctx_options.alpn_list = ["mqtt"];
        }
        this.params.port = 443;
        return this;
      }
      /**
       * Sets username for the connection
       *
       * @param username the username that will be passed with the MQTT connection
       */
      with_username(username) {
        this.params.username = username;
        return this;
      }
      /**
       * Sets password for the connection
       *
       * @param password the password that will be passed with the MQTT connection
       */
      with_password(password) {
        this.params.password = password;
        return this;
      }
      /**
       * Configure the max reconnection period (in second). The reonnection period will
       * be set in range of [reconnect_min_sec,reconnect_max_sec].
       * @param max_sec max reconnection period
       */
      with_reconnect_max_sec(max_sec) {
        this.params.reconnect_max_sec = max_sec;
        return this;
      }
      /**
       * Configure the min reconnection period (in second). The reonnection period will
       * be set in range of [reconnect_min_sec,reconnect_max_sec].
       * @param min_sec min reconnection period
       */
      with_reconnect_min_sec(min_sec) {
        this.params.reconnect_min_sec = min_sec;
        return this;
      }
      /**
       * Returns the configured MqttConnectionConfig.  On the first invocation of this function, the TLS context is cached
       * and re-used on all subsequent calls to build().
       * @returns The configured MqttConnectionConfig
       */
      build() {
        var _a, _b;
        if (this.params.client_id === void 0 || this.params.host_name === void 0) {
          throw "client_id and endpoint are required";
        }
        if (this.is_using_custom_authorizer == false) {
          if (iot_shared.is_string_and_not_empty(this.params.username)) {
            if (((_a = this.params.username) === null || _a === void 0 ? void 0 : _a.indexOf("x-amz-customauthorizer-name=")) != -1 || ((_b = this.params.username) === null || _b === void 0 ? void 0 : _b.indexOf("x-amz-customauthorizer-signature=")) != -1) {
              this.is_using_custom_authorizer = true;
            }
          }
        }
        if (this.is_using_custom_authorizer == true) {
          if (this.params.port != 443) {
            console.log("Warning: Attempting to connect to authorizer with unsupported port. Port is not 443...");
          }
        }
        if (this.params.tls_ctx === void 0) {
          this.params.tls_ctx = new io.ClientTlsContext(this.tls_ctx_options);
        }
        return this.params;
      }
    };
    exports2.AwsIotMqttConnectionConfigBuilder = AwsIotMqttConnectionConfigBuilder;
  }
});

// node_modules/aws-crt/dist/common/mqtt5.js
var require_mqtt5 = __commonJS({
  "node_modules/aws-crt/dist/common/mqtt5.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InboundTopicAliasBehaviorType = exports2.OutboundTopicAliasBehaviorType = exports2.RetryJitterType = exports2.ClientSessionBehavior = void 0;
    var ClientSessionBehavior;
    (function(ClientSessionBehavior2) {
      ClientSessionBehavior2[ClientSessionBehavior2["Default"] = 0] = "Default";
      ClientSessionBehavior2[ClientSessionBehavior2["Clean"] = 1] = "Clean";
      ClientSessionBehavior2[ClientSessionBehavior2["RejoinPostSuccess"] = 2] = "RejoinPostSuccess";
      ClientSessionBehavior2[ClientSessionBehavior2["RejoinAlways"] = 3] = "RejoinAlways";
    })(ClientSessionBehavior = exports2.ClientSessionBehavior || (exports2.ClientSessionBehavior = {}));
    var RetryJitterType;
    (function(RetryJitterType2) {
      RetryJitterType2[RetryJitterType2["Default"] = 0] = "Default";
      RetryJitterType2[RetryJitterType2["None"] = 1] = "None";
      RetryJitterType2[RetryJitterType2["Full"] = 2] = "Full";
      RetryJitterType2[RetryJitterType2["Decorrelated"] = 3] = "Decorrelated";
    })(RetryJitterType = exports2.RetryJitterType || (exports2.RetryJitterType = {}));
    var OutboundTopicAliasBehaviorType;
    (function(OutboundTopicAliasBehaviorType2) {
      OutboundTopicAliasBehaviorType2[OutboundTopicAliasBehaviorType2["Default"] = 0] = "Default";
      OutboundTopicAliasBehaviorType2[OutboundTopicAliasBehaviorType2["Manual"] = 1] = "Manual";
      OutboundTopicAliasBehaviorType2[OutboundTopicAliasBehaviorType2["LRU"] = 2] = "LRU";
      OutboundTopicAliasBehaviorType2[OutboundTopicAliasBehaviorType2["Disabled"] = 3] = "Disabled";
    })(OutboundTopicAliasBehaviorType = exports2.OutboundTopicAliasBehaviorType || (exports2.OutboundTopicAliasBehaviorType = {}));
    var InboundTopicAliasBehaviorType;
    (function(InboundTopicAliasBehaviorType2) {
      InboundTopicAliasBehaviorType2[InboundTopicAliasBehaviorType2["Default"] = 0] = "Default";
      InboundTopicAliasBehaviorType2[InboundTopicAliasBehaviorType2["Enabled"] = 1] = "Enabled";
      InboundTopicAliasBehaviorType2[InboundTopicAliasBehaviorType2["Disabled"] = 2] = "Disabled";
    })(InboundTopicAliasBehaviorType = exports2.InboundTopicAliasBehaviorType || (exports2.InboundTopicAliasBehaviorType = {}));
  }
});

// node_modules/aws-crt/dist/common/mqtt5_packet.js
var require_mqtt5_packet = __commonJS({
  "node_modules/aws-crt/dist/common/mqtt5_packet.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PacketType = exports2.RetainHandlingType = exports2.QoS = exports2.PayloadFormatIndicator = exports2.isSuccessfulPubackReasonCode = exports2.PubackReasonCode = exports2.isSuccessfulUnsubackReasonCode = exports2.UnsubackReasonCode = exports2.isSuccessfulSubackReasonCode = exports2.SubackReasonCode = exports2.isSuccessfulDisconnectReasonCode = exports2.DisconnectReasonCode = exports2.isSuccessfulConnectReasonCode = exports2.ConnectReasonCode = void 0;
    var ConnectReasonCode;
    (function(ConnectReasonCode2) {
      ConnectReasonCode2[ConnectReasonCode2["Success"] = 0] = "Success";
      ConnectReasonCode2[ConnectReasonCode2["UnspecifiedError"] = 128] = "UnspecifiedError";
      ConnectReasonCode2[ConnectReasonCode2["MalformedPacket"] = 129] = "MalformedPacket";
      ConnectReasonCode2[ConnectReasonCode2["ProtocolError"] = 130] = "ProtocolError";
      ConnectReasonCode2[ConnectReasonCode2["ImplementationSpecificError"] = 131] = "ImplementationSpecificError";
      ConnectReasonCode2[ConnectReasonCode2["UnsupportedProtocolVersion"] = 132] = "UnsupportedProtocolVersion";
      ConnectReasonCode2[ConnectReasonCode2["ClientIdentifierNotValid"] = 133] = "ClientIdentifierNotValid";
      ConnectReasonCode2[ConnectReasonCode2["BadUsernameOrPassword"] = 134] = "BadUsernameOrPassword";
      ConnectReasonCode2[ConnectReasonCode2["NotAuthorized"] = 135] = "NotAuthorized";
      ConnectReasonCode2[ConnectReasonCode2["ServerUnavailable"] = 136] = "ServerUnavailable";
      ConnectReasonCode2[ConnectReasonCode2["ServerBusy"] = 137] = "ServerBusy";
      ConnectReasonCode2[ConnectReasonCode2["Banned"] = 138] = "Banned";
      ConnectReasonCode2[ConnectReasonCode2["BadAuthenticationMethod"] = 140] = "BadAuthenticationMethod";
      ConnectReasonCode2[ConnectReasonCode2["TopicNameInvalid"] = 144] = "TopicNameInvalid";
      ConnectReasonCode2[ConnectReasonCode2["PacketTooLarge"] = 149] = "PacketTooLarge";
      ConnectReasonCode2[ConnectReasonCode2["QuotaExceeded"] = 151] = "QuotaExceeded";
      ConnectReasonCode2[ConnectReasonCode2["PayloadFormatInvalid"] = 153] = "PayloadFormatInvalid";
      ConnectReasonCode2[ConnectReasonCode2["RetainNotSupported"] = 154] = "RetainNotSupported";
      ConnectReasonCode2[ConnectReasonCode2["QosNotSupported"] = 155] = "QosNotSupported";
      ConnectReasonCode2[ConnectReasonCode2["UseAnotherServer"] = 156] = "UseAnotherServer";
      ConnectReasonCode2[ConnectReasonCode2["ServerMoved"] = 157] = "ServerMoved";
      ConnectReasonCode2[ConnectReasonCode2["ConnectionRateExceeded"] = 159] = "ConnectionRateExceeded";
    })(ConnectReasonCode = exports2.ConnectReasonCode || (exports2.ConnectReasonCode = {}));
    function isSuccessfulConnectReasonCode(reasonCode) {
      return reasonCode < 128;
    }
    exports2.isSuccessfulConnectReasonCode = isSuccessfulConnectReasonCode;
    var DisconnectReasonCode;
    (function(DisconnectReasonCode2) {
      DisconnectReasonCode2[DisconnectReasonCode2["NormalDisconnection"] = 0] = "NormalDisconnection";
      DisconnectReasonCode2[DisconnectReasonCode2["DisconnectWithWillMessage"] = 4] = "DisconnectWithWillMessage";
      DisconnectReasonCode2[DisconnectReasonCode2["UnspecifiedError"] = 128] = "UnspecifiedError";
      DisconnectReasonCode2[DisconnectReasonCode2["MalformedPacket"] = 129] = "MalformedPacket";
      DisconnectReasonCode2[DisconnectReasonCode2["ProtocolError"] = 130] = "ProtocolError";
      DisconnectReasonCode2[DisconnectReasonCode2["ImplementationSpecificError"] = 131] = "ImplementationSpecificError";
      DisconnectReasonCode2[DisconnectReasonCode2["NotAuthorized"] = 135] = "NotAuthorized";
      DisconnectReasonCode2[DisconnectReasonCode2["ServerBusy"] = 137] = "ServerBusy";
      DisconnectReasonCode2[DisconnectReasonCode2["ServerShuttingDown"] = 139] = "ServerShuttingDown";
      DisconnectReasonCode2[DisconnectReasonCode2["KeepAliveTimeout"] = 141] = "KeepAliveTimeout";
      DisconnectReasonCode2[DisconnectReasonCode2["SessionTakenOver"] = 142] = "SessionTakenOver";
      DisconnectReasonCode2[DisconnectReasonCode2["TopicFilterInvalid"] = 143] = "TopicFilterInvalid";
      DisconnectReasonCode2[DisconnectReasonCode2["TopicNameInvalid"] = 144] = "TopicNameInvalid";
      DisconnectReasonCode2[DisconnectReasonCode2["ReceiveMaximumExceeded"] = 147] = "ReceiveMaximumExceeded";
      DisconnectReasonCode2[DisconnectReasonCode2["TopicAliasInvalid"] = 148] = "TopicAliasInvalid";
      DisconnectReasonCode2[DisconnectReasonCode2["PacketTooLarge"] = 149] = "PacketTooLarge";
      DisconnectReasonCode2[DisconnectReasonCode2["MessageRateTooHigh"] = 150] = "MessageRateTooHigh";
      DisconnectReasonCode2[DisconnectReasonCode2["QuotaExceeded"] = 151] = "QuotaExceeded";
      DisconnectReasonCode2[DisconnectReasonCode2["AdministrativeAction"] = 152] = "AdministrativeAction";
      DisconnectReasonCode2[DisconnectReasonCode2["PayloadFormatInvalid"] = 153] = "PayloadFormatInvalid";
      DisconnectReasonCode2[DisconnectReasonCode2["RetainNotSupported"] = 154] = "RetainNotSupported";
      DisconnectReasonCode2[DisconnectReasonCode2["QosNotSupported"] = 155] = "QosNotSupported";
      DisconnectReasonCode2[DisconnectReasonCode2["UseAnotherServer"] = 156] = "UseAnotherServer";
      DisconnectReasonCode2[DisconnectReasonCode2["ServerMoved"] = 157] = "ServerMoved";
      DisconnectReasonCode2[DisconnectReasonCode2["SharedSubscriptionsNotSupported"] = 158] = "SharedSubscriptionsNotSupported";
      DisconnectReasonCode2[DisconnectReasonCode2["ConnectionRateExceeded"] = 159] = "ConnectionRateExceeded";
      DisconnectReasonCode2[DisconnectReasonCode2["MaximumConnectTime"] = 160] = "MaximumConnectTime";
      DisconnectReasonCode2[DisconnectReasonCode2["SubscriptionIdentifiersNotSupported"] = 161] = "SubscriptionIdentifiersNotSupported";
      DisconnectReasonCode2[DisconnectReasonCode2["WildcardSubscriptionsNotSupported"] = 162] = "WildcardSubscriptionsNotSupported";
    })(DisconnectReasonCode = exports2.DisconnectReasonCode || (exports2.DisconnectReasonCode = {}));
    function isSuccessfulDisconnectReasonCode(reasonCode) {
      return reasonCode < 128;
    }
    exports2.isSuccessfulDisconnectReasonCode = isSuccessfulDisconnectReasonCode;
    var SubackReasonCode;
    (function(SubackReasonCode2) {
      SubackReasonCode2[SubackReasonCode2["GrantedQoS0"] = 0] = "GrantedQoS0";
      SubackReasonCode2[SubackReasonCode2["GrantedQoS1"] = 1] = "GrantedQoS1";
      SubackReasonCode2[SubackReasonCode2["GrantedQoS2"] = 2] = "GrantedQoS2";
      SubackReasonCode2[SubackReasonCode2["UnspecifiedError"] = 128] = "UnspecifiedError";
      SubackReasonCode2[SubackReasonCode2["ImplementationSpecificError"] = 131] = "ImplementationSpecificError";
      SubackReasonCode2[SubackReasonCode2["NotAuthorized"] = 135] = "NotAuthorized";
      SubackReasonCode2[SubackReasonCode2["TopicFilterInvalid"] = 143] = "TopicFilterInvalid";
      SubackReasonCode2[SubackReasonCode2["PacketIdentifierInUse"] = 145] = "PacketIdentifierInUse";
      SubackReasonCode2[SubackReasonCode2["QuotaExceeded"] = 151] = "QuotaExceeded";
      SubackReasonCode2[SubackReasonCode2["SharedSubscriptionsNotSupported"] = 158] = "SharedSubscriptionsNotSupported";
      SubackReasonCode2[SubackReasonCode2["SubscriptionIdentifiersNotSupported"] = 161] = "SubscriptionIdentifiersNotSupported";
      SubackReasonCode2[SubackReasonCode2["WildcardSubscriptionsNotSupported"] = 162] = "WildcardSubscriptionsNotSupported";
    })(SubackReasonCode = exports2.SubackReasonCode || (exports2.SubackReasonCode = {}));
    function isSuccessfulSubackReasonCode(reasonCode) {
      return reasonCode < 128;
    }
    exports2.isSuccessfulSubackReasonCode = isSuccessfulSubackReasonCode;
    var UnsubackReasonCode;
    (function(UnsubackReasonCode2) {
      UnsubackReasonCode2[UnsubackReasonCode2["Success"] = 0] = "Success";
      UnsubackReasonCode2[UnsubackReasonCode2["NoSubscriptionExisted"] = 17] = "NoSubscriptionExisted";
      UnsubackReasonCode2[UnsubackReasonCode2["UnspecifiedError"] = 128] = "UnspecifiedError";
      UnsubackReasonCode2[UnsubackReasonCode2["ImplementationSpecificError"] = 131] = "ImplementationSpecificError";
      UnsubackReasonCode2[UnsubackReasonCode2["NotAuthorized"] = 135] = "NotAuthorized";
      UnsubackReasonCode2[UnsubackReasonCode2["TopicFilterInvalid"] = 143] = "TopicFilterInvalid";
      UnsubackReasonCode2[UnsubackReasonCode2["PacketIdentifierInUse"] = 145] = "PacketIdentifierInUse";
    })(UnsubackReasonCode = exports2.UnsubackReasonCode || (exports2.UnsubackReasonCode = {}));
    function isSuccessfulUnsubackReasonCode(reasonCode) {
      return reasonCode < 128;
    }
    exports2.isSuccessfulUnsubackReasonCode = isSuccessfulUnsubackReasonCode;
    var PubackReasonCode;
    (function(PubackReasonCode2) {
      PubackReasonCode2[PubackReasonCode2["Success"] = 0] = "Success";
      PubackReasonCode2[PubackReasonCode2["NoMatchingSubscribers"] = 16] = "NoMatchingSubscribers";
      PubackReasonCode2[PubackReasonCode2["UnspecifiedError"] = 128] = "UnspecifiedError";
      PubackReasonCode2[PubackReasonCode2["ImplementationSpecificError"] = 131] = "ImplementationSpecificError";
      PubackReasonCode2[PubackReasonCode2["NotAuthorized"] = 135] = "NotAuthorized";
      PubackReasonCode2[PubackReasonCode2["TopicNameInvalid"] = 144] = "TopicNameInvalid";
      PubackReasonCode2[PubackReasonCode2["PacketIdentifierInUse"] = 145] = "PacketIdentifierInUse";
      PubackReasonCode2[PubackReasonCode2["QuotaExceeded"] = 151] = "QuotaExceeded";
      PubackReasonCode2[PubackReasonCode2["PayloadFormatInvalid"] = 153] = "PayloadFormatInvalid";
    })(PubackReasonCode = exports2.PubackReasonCode || (exports2.PubackReasonCode = {}));
    function isSuccessfulPubackReasonCode(reasonCode) {
      return reasonCode < 128;
    }
    exports2.isSuccessfulPubackReasonCode = isSuccessfulPubackReasonCode;
    var PayloadFormatIndicator;
    (function(PayloadFormatIndicator2) {
      PayloadFormatIndicator2[PayloadFormatIndicator2["Bytes"] = 0] = "Bytes";
      PayloadFormatIndicator2[PayloadFormatIndicator2["Utf8"] = 1] = "Utf8";
    })(PayloadFormatIndicator = exports2.PayloadFormatIndicator || (exports2.PayloadFormatIndicator = {}));
    var QoS;
    (function(QoS2) {
      QoS2[QoS2["AtMostOnce"] = 0] = "AtMostOnce";
      QoS2[QoS2["AtLeastOnce"] = 1] = "AtLeastOnce";
      QoS2[QoS2["ExactlyOnce"] = 2] = "ExactlyOnce";
    })(QoS = exports2.QoS || (exports2.QoS = {}));
    var RetainHandlingType;
    (function(RetainHandlingType2) {
      RetainHandlingType2[RetainHandlingType2["SendOnSubscribe"] = 0] = "SendOnSubscribe";
      RetainHandlingType2[RetainHandlingType2["SendOnSubscribeIfNew"] = 1] = "SendOnSubscribeIfNew";
      RetainHandlingType2[RetainHandlingType2["DontSend"] = 2] = "DontSend";
    })(RetainHandlingType = exports2.RetainHandlingType || (exports2.RetainHandlingType = {}));
    var PacketType;
    (function(PacketType2) {
      PacketType2[PacketType2["Connect"] = 1] = "Connect";
      PacketType2[PacketType2["Connack"] = 2] = "Connack";
      PacketType2[PacketType2["Publish"] = 3] = "Publish";
      PacketType2[PacketType2["Puback"] = 4] = "Puback";
      PacketType2[PacketType2["Pubrec"] = 5] = "Pubrec";
      PacketType2[PacketType2["Pubrel"] = 6] = "Pubrel";
      PacketType2[PacketType2["Pubcomp"] = 7] = "Pubcomp";
      PacketType2[PacketType2["Subscribe"] = 8] = "Subscribe";
      PacketType2[PacketType2["Suback"] = 9] = "Suback";
      PacketType2[PacketType2["Unsubscribe"] = 10] = "Unsubscribe";
      PacketType2[PacketType2["Unsuback"] = 11] = "Unsuback";
      PacketType2[PacketType2["Pingreq"] = 12] = "Pingreq";
      PacketType2[PacketType2["Pingresp"] = 13] = "Pingresp";
      PacketType2[PacketType2["Disconnect"] = 14] = "Disconnect";
      PacketType2[PacketType2["Auth"] = 15] = "Auth";
    })(PacketType = exports2.PacketType || (exports2.PacketType = {}));
  }
});

// node_modules/aws-crt/dist/native/mqtt5.js
var require_mqtt52 = __commonJS({
  "node_modules/aws-crt/dist/native/mqtt5.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Mqtt5Client = exports2.ClientExtendedValidationAndFlowControl = exports2.ClientOperationQueueBehavior = exports2.HttpProxyOptions = void 0;
    var binding_1 = __importDefault(require_binding());
    var native_resource_1 = require_native_resource();
    var event_1 = require_event();
    var io = __importStar(require_io2());
    var mqtt_shared = __importStar(require_mqtt_shared());
    var error_1 = require_error();
    var http_1 = require_http2();
    Object.defineProperty(exports2, "HttpProxyOptions", { enumerable: true, get: function() {
      return http_1.HttpProxyOptions;
    } });
    __exportStar(require_mqtt5(), exports2);
    __exportStar(require_mqtt5_packet(), exports2);
    var ClientOperationQueueBehavior;
    (function(ClientOperationQueueBehavior2) {
      ClientOperationQueueBehavior2[ClientOperationQueueBehavior2["Default"] = 0] = "Default";
      ClientOperationQueueBehavior2[ClientOperationQueueBehavior2["FailNonQos1PublishOnDisconnect"] = 1] = "FailNonQos1PublishOnDisconnect";
      ClientOperationQueueBehavior2[ClientOperationQueueBehavior2["FailQos0PublishOnDisconnect"] = 2] = "FailQos0PublishOnDisconnect";
      ClientOperationQueueBehavior2[ClientOperationQueueBehavior2["FailAllOnDisconnect"] = 3] = "FailAllOnDisconnect";
    })(ClientOperationQueueBehavior = exports2.ClientOperationQueueBehavior || (exports2.ClientOperationQueueBehavior = {}));
    var ClientExtendedValidationAndFlowControl;
    (function(ClientExtendedValidationAndFlowControl2) {
      ClientExtendedValidationAndFlowControl2[ClientExtendedValidationAndFlowControl2["None"] = 0] = "None";
      ClientExtendedValidationAndFlowControl2[ClientExtendedValidationAndFlowControl2["AwsIotCoreDefaults"] = 1] = "AwsIotCoreDefaults";
    })(ClientExtendedValidationAndFlowControl = exports2.ClientExtendedValidationAndFlowControl || (exports2.ClientExtendedValidationAndFlowControl = {}));
    var Mqtt5Client = class _Mqtt5Client extends (0, native_resource_1.NativeResourceMixin)(event_1.BufferedEventEmitter) {
      /**
       * Client constructor
       *
       * @param config The configuration for this client
       */
      constructor(config) {
        super();
        this._super(binding_1.default.mqtt5_client_new(this, config, (client2) => {
          _Mqtt5Client._s_on_stopped(client2);
        }, (client2) => {
          _Mqtt5Client._s_on_attempting_connect(client2);
        }, (client2, connack, settings) => {
          _Mqtt5Client._s_on_connection_success(client2, connack, settings);
        }, (client2, errorCode, connack) => {
          _Mqtt5Client._s_on_connection_failure(client2, new error_1.CrtError(errorCode), connack);
        }, (client2, errorCode, disconnect) => {
          _Mqtt5Client._s_on_disconnection(client2, new error_1.CrtError(errorCode), disconnect);
        }, (client2, message, pubackControlId) => {
          _Mqtt5Client._s_on_message_received(client2, message, pubackControlId);
        }, config.clientBootstrap ? config.clientBootstrap.native_handle() : null, config.socketOptions ? config.socketOptions.native_handle() : null, config.tlsCtx ? config.tlsCtx.native_handle() : null, config.httpProxyOptions ? config.httpProxyOptions.create_native_handle() : null, config.disableMetrics == true ? void 0 : new mqtt_shared.AwsIoTDeviceSDKMetrics()));
      }
      /**
       * Triggers cleanup of native resources associated with the MQTT5 client.  Once this has been invoked, callbacks
       * and events are not guaranteed to be received.
       *
       * This must be called when finished with a client; otherwise, native resources will leak.  It is not safe
       * to invoke any further operations on the client after close() has been called.
       *
       * For a running client, safe and proper shutdown can be accomplished by
       *
       * ```ts
       * const stopped = once(client, "stopped");
       * client.stop();
       * await stopped;
       * client.close();
       * ```
       *
       * This is an asynchronous operation.
       *
       * @group Node-only
       */
      close() {
        binding_1.default.mqtt5_client_close(this.native_handle());
      }
      /**
       * Notifies the MQTT5 client that you want it to maintain connectivity to the configured endpoint.
       * The client will attempt to stay connected using the properties of the reconnect-related parameters
       * in the mqtt5 client configuration.
       *
       * This is an asynchronous operation.
       */
      start() {
        binding_1.default.mqtt5_client_start(this.native_handle());
      }
      /**
       * Notifies the MQTT5 client that you want it to end connectivity to the configured endpoint, disconnecting any
       * existing connection and halting reconnection attempts.
       *
       * This is an asynchronous operation.  Once the process completes, no further events will be emitted until the client
       * has {@link start} invoked.  Invoking {@link start start()} after a {@link stop stop()} will always result in a
       * new MQTT session.
       *
       * @param disconnectPacket (optional) properties of a DISCONNECT packet to send as part of the shutdown process
       */
      stop(disconnectPacket) {
        binding_1.default.mqtt5_client_stop(this.native_handle(), disconnectPacket);
      }
      /**
       * Subscribe to one or more topic filters by queuing a SUBSCRIBE packet to be sent to the server.
       *
       * @param packet SUBSCRIBE packet to send to the server
       * @returns a promise that will be rejected with an error or resolved with the SUBACK response
       */
      subscribe(packet) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
            function curriedPromiseCallback(client2, errorCode, suback) {
              return _Mqtt5Client._s_on_suback_callback(resolve, reject, client2, errorCode, suback);
            }
            try {
              binding_1.default.mqtt5_client_subscribe(this.native_handle(), packet, curriedPromiseCallback);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      /**
       * Unsubscribe from one or more topic filters by queuing an UNSUBSCRIBE packet to be sent to the server.
       *
       * @param packet UNSUBSCRIBE packet to send to the server
       * @returns a promise that will be rejected with an error or resolved with the UNSUBACK response
       */
      unsubscribe(packet) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
            function curriedPromiseCallback(client2, errorCode, unsuback) {
              return _Mqtt5Client._s_on_unsuback_callback(resolve, reject, client2, errorCode, unsuback);
            }
            try {
              binding_1.default.mqtt5_client_unsubscribe(this.native_handle(), packet, curriedPromiseCallback);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      /**
       * Send a message to subscribing clients by queuing a PUBLISH packet to be sent to the server.
       *
       * @param packet PUBLISH packet to send to the server
       * @returns a promise that will be rejected with an error or resolved with the PUBACK response (QoS 1) or
       * undefined (QoS 0)
       */
      publish(packet) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
            if (packet && packet.payload) {
              packet.payload = mqtt_shared.normalize_payload(packet.payload);
            }
            function curriedPromiseCallback(client2, errorCode, result) {
              return _Mqtt5Client._s_on_puback_callback(resolve, reject, client2, errorCode, result);
            }
            try {
              binding_1.default.mqtt5_client_publish(this.native_handle(), packet, curriedPromiseCallback);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      /**
       * Queries a small set of numerical statistics about the current state of the client's operation queue
       *
       * @group Node-only
       */
      getOperationalStatistics() {
        return binding_1.default.mqtt5_client_get_queue_statistics(this.native_handle());
      }
      /**
       * Queries a small set of numerical statistics about the current state of the client's operation queue
       * @deprecated use getOperationalStatistics instead
       *
       * @group Node-only
       */
      getQueueStatistics() {
        return this.getOperationalStatistics();
      }
      on(event, listener) {
        super.on(event, listener);
        return this;
      }
      /*
       * Private helper functions
       *
       * Callbacks come through static functions so that the native threadsafe function objects do not
       * capture the client object itself, simplifying the number of strong references to the client floating around.
       */
      static _s_on_stopped(client2) {
        process.nextTick(() => {
          let stoppedEvent = {};
          client2.emit(_Mqtt5Client.STOPPED, stoppedEvent);
        });
      }
      static _s_on_attempting_connect(client2) {
        process.nextTick(() => {
          let attemptingConnectEvent = {};
          client2.emit(_Mqtt5Client.ATTEMPTING_CONNECT, attemptingConnectEvent);
        });
      }
      static _s_on_connection_success(client2, connack, settings) {
        let connectionSuccessEvent = {
          connack,
          settings
        };
        process.nextTick(() => {
          client2.emit(_Mqtt5Client.CONNECTION_SUCCESS, connectionSuccessEvent);
        });
      }
      static _s_on_connection_failure(client2, error, connack) {
        let connectionFailureEvent = {
          error
        };
        if (connack !== null && connack !== void 0) {
          connectionFailureEvent.connack = connack;
        }
        process.nextTick(() => {
          client2.emit(_Mqtt5Client.CONNECTION_FAILURE, connectionFailureEvent);
        });
      }
      static _s_on_disconnection(client2, error, disconnect) {
        let disconnectionEvent = {
          error
        };
        if (disconnect !== null && disconnect !== void 0) {
          disconnectionEvent.disconnect = disconnect;
        }
        process.nextTick(() => {
          client2.emit(_Mqtt5Client.DISCONNECTION, disconnectionEvent);
        });
      }
      static _s_on_suback_callback(resolve, reject, client2, errorCode, suback) {
        if (errorCode == 0 && suback !== void 0) {
          resolve(suback);
        } else {
          reject(io.error_code_to_string(errorCode));
        }
      }
      static _s_on_unsuback_callback(resolve, reject, client2, errorCode, unsuback) {
        if (errorCode == 0 && unsuback !== void 0) {
          resolve(unsuback);
        } else {
          reject(io.error_code_to_string(errorCode));
        }
      }
      static _s_on_puback_callback(resolve, reject, client2, errorCode, result) {
        if (errorCode == 0) {
          resolve(result);
        } else {
          reject(io.error_code_to_string(errorCode));
        }
      }
      static _s_on_message_received(client2, message, pubackControlId) {
        let acknowledgementControl = void 0;
        if (pubackControlId !== void 0) {
          const controlId = pubackControlId;
          acknowledgementControl = new mqtt_shared.PublishAcknowledgementHandleWrapper(new mqtt_shared.PublishAcknowledgementHandle(() => {
            binding_1.default.mqtt5_client_invoke_publish_acknowledgement(client2.native_handle(), controlId);
          }));
        }
        let messageReceivedEvent = {
          message
        };
        if (acknowledgementControl) {
          messageReceivedEvent.acknowledgementControl = acknowledgementControl;
        }
        process.nextTick(() => {
          client2.emitWithCallback(_Mqtt5Client.MESSAGE_RECEIVED, () => {
            if (acknowledgementControl) {
              const handle = acknowledgementControl.acquireHandle();
              if (handle) {
                handle.invokeAcknowledgement();
              }
            }
          }, messageReceivedEvent);
        });
      }
    };
    exports2.Mqtt5Client = Mqtt5Client;
    Mqtt5Client.ERROR = "error";
    Mqtt5Client.MESSAGE_RECEIVED = "messageReceived";
    Mqtt5Client.ATTEMPTING_CONNECT = "attemptingConnect";
    Mqtt5Client.CONNECTION_SUCCESS = "connectionSuccess";
    Mqtt5Client.CONNECTION_FAILURE = "connectionFailure";
    Mqtt5Client.DISCONNECTION = "disconnection";
    Mqtt5Client.STOPPED = "stopped";
  }
});

// node_modules/aws-crt/dist/native/aws_iot_mqtt5.js
var require_aws_iot_mqtt5 = __commonJS({
  "node_modules/aws-crt/dist/native/aws_iot_mqtt5.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AwsIotMqtt5ClientConfigBuilder = void 0;
    var mqtt5 = __importStar(require_mqtt52());
    var io = __importStar(require_io2());
    var auth = __importStar(require_auth());
    var error_1 = require_error();
    var iot_shared = __importStar(require_aws_iot_shared());
    var mqtt_shared = __importStar(require_mqtt_shared());
    var AwsIotMqtt5ClientConfigBuilder = class _AwsIotMqtt5ClientConfigBuilder {
      constructor(hostName, port, tlsContextOptions) {
        this.tlsContextOptions = tlsContextOptions;
        this.config = {
          hostName,
          port,
          connectProperties: {
            keepAliveIntervalSeconds: mqtt_shared.DEFAULT_KEEP_ALIVE
          },
          extendedValidationAndFlowControlOptions: mqtt5.ClientExtendedValidationAndFlowControl.AwsIotCoreDefaults
        };
      }
      /* Builders for different connection methods to AWS IoT Core */
      /**
       * Create a new MQTT5 client builder that will create MQTT5 clients that connect to AWS IoT Core via mutual TLS
       * using X509 certificate and key at the supplied file paths.
       *
       * @param hostName - AWS IoT endpoint to connect to
       * @param certPath - Path to certificate, in PEM format
       * @param keyPath - Path to private key, in PEM format
       */
      static newDirectMqttBuilderWithMtlsFromPath(hostName, certPath, keyPath) {
        let builder = new _AwsIotMqtt5ClientConfigBuilder(hostName, _AwsIotMqtt5ClientConfigBuilder.DEFAULT_DIRECT_MQTT_PORT, io.TlsContextOptions.create_client_with_mtls_from_path(certPath, keyPath));
        if (io.is_alpn_available()) {
          builder.tlsContextOptions.alpn_list.unshift("x-amzn-mqtt-ca");
        }
        return builder;
      }
      /**
       * Create a new MQTT5 client builder that will create MQTT5 clients that connect to AWS IoT Core via mutual TLS
       * using in-memory X509 certificate and key.
       *
       * @param hostName - AWS IoT endpoint to connect to
       * @param cert - Certificate, in PEM format
       * @param privateKey - Private key, in PEM format
       */
      static newDirectMqttBuilderWithMtlsFromMemory(hostName, cert, privateKey) {
        let builder = new _AwsIotMqtt5ClientConfigBuilder(hostName, _AwsIotMqtt5ClientConfigBuilder.DEFAULT_DIRECT_MQTT_PORT, io.TlsContextOptions.create_client_with_mtls(cert, privateKey));
        if (io.is_alpn_available()) {
          builder.tlsContextOptions.alpn_list.unshift("x-amzn-mqtt-ca");
        }
        return builder;
      }
      /**
       * Create a new MQTT5 client builder that will create MQTT5 clients that connect to AWS IoT Core via mutual TLS
       * using a PKCS11 library for certificate and private key operations.
       *
       * NOTE: This configuration only works on Unix devices.
       *
       * @param hostName - AWS IoT endpoint to connect to
       * @param pkcs11Options - PKCS#11 options.
       */
      static newDirectMqttBuilderWithMtlsFromPkcs11(hostName, pkcs11Options) {
        let builder = new _AwsIotMqtt5ClientConfigBuilder(hostName, _AwsIotMqtt5ClientConfigBuilder.DEFAULT_DIRECT_MQTT_PORT, io.TlsContextOptions.create_client_with_mtls_pkcs11(pkcs11Options));
        if (io.is_alpn_available()) {
          builder.tlsContextOptions.alpn_list.unshift("x-amzn-mqtt-ca");
        }
        return builder;
      }
      /**
       * Create a new MQTT5 client builder that will create MQTT5 clients that connect to AWS IoT Core via mutual TLS
       * using a PKCS12 file.
       *
       * Note: This configuration only works on MacOS devices.
       *
       * @param hostName - AWS IoT endpoint to connect to
       * @param pkcs12_options - The PKCS#12 options to use in the builder.
       */
      static newDirectMqttBuilderWithMtlsFromPkcs12(hostName, pkcs12_options) {
        let builder = new _AwsIotMqtt5ClientConfigBuilder(hostName, _AwsIotMqtt5ClientConfigBuilder.DEFAULT_DIRECT_MQTT_PORT, io.TlsContextOptions.create_client_with_mtls_pkcs12_from_path(pkcs12_options.pkcs12_file, pkcs12_options.pkcs12_password));
        if (io.is_alpn_available()) {
          builder.tlsContextOptions.alpn_list.unshift("x-amzn-mqtt-ca");
        }
        return builder;
      }
      /**
       * Create a new MQTT5 client builder that will create MQTT5 clients that connect to AWS IoT Core via mutual TLS
       * using a certificate entry in a Windows certificate store.
       *
       * NOTE: This configuration only works on Windows devices.
       *
       * @param hostName - AWS IoT endpoint to connect to
       * @param certificatePath - Path to certificate in a Windows certificate store.
       *      The path must use backslashes and end with the certificate's thumbprint.
       *      Example: `CurrentUser\MY\A11F8A9B5DF5B98BA3508FBCA575D09570E0D2C6`
       */
      static newDirectMqttBuilderWithMtlsFromWindowsCertStorePath(hostName, certificatePath) {
        let builder = new _AwsIotMqtt5ClientConfigBuilder(hostName, _AwsIotMqtt5ClientConfigBuilder.DEFAULT_DIRECT_MQTT_PORT, io.TlsContextOptions.create_client_with_mtls_windows_cert_store_path(certificatePath));
        if (io.is_alpn_available()) {
          builder.tlsContextOptions.alpn_list.unshift("x-amzn-mqtt-ca");
        }
        return builder;
      }
      /**
       * Create a new MQTT5 client builder that will create MQTT5 clients that connect to AWS IoT Core via TLS,
       * authenticating via a custom authenticator.
       *
       * @param hostName - AWS IoT endpoint to connect to
       * @param customAuthConfig - AWS IoT custom auth configuration
       */
      static newDirectMqttBuilderWithCustomAuth(hostName, customAuthConfig) {
        let builder = new _AwsIotMqtt5ClientConfigBuilder(hostName, _AwsIotMqtt5ClientConfigBuilder.DEFAULT_WEBSOCKET_MQTT_PORT, new io.TlsContextOptions());
        builder.customAuthConfig = iot_shared.canonicalizeCustomAuthConfig(customAuthConfig);
        builder.tlsContextOptions.alpn_list = ["mqtt"];
        return builder;
      }
      /**
       * Create a new MQTT5 client builder that will create MQTT5 clients that connect to AWS IoT Core via websockets,
       * using AWS Sigv4 signing to establish authenticate.
       *
       * @param hostName - AWS IoT endpoint to connect to
       * @param options - additional sigv4-oriented options to use
       */
      static newWebsocketMqttBuilderWithSigv4Auth(hostName, options) {
        let tlsContextOptions = new io.TlsContextOptions();
        tlsContextOptions.alpn_list = [];
        let builder = new _AwsIotMqtt5ClientConfigBuilder(hostName, _AwsIotMqtt5ClientConfigBuilder.DEFAULT_WEBSOCKET_MQTT_PORT, tlsContextOptions);
        let credentialsProvider = options === null || options === void 0 ? void 0 : options.credentialsProvider;
        if (!credentialsProvider) {
          credentialsProvider = auth.AwsCredentialsProvider.newDefault();
        }
        builder.config.websocketHandshakeTransform = (request, done) => __awaiter(this, void 0, void 0, function* () {
          var _a;
          try {
            const signingConfig = {
              algorithm: auth.AwsSigningAlgorithm.SigV4,
              signature_type: auth.AwsSignatureType.HttpRequestViaQueryParams,
              provider: credentialsProvider,
              region: (_a = options === null || options === void 0 ? void 0 : options.region) !== null && _a !== void 0 ? _a : iot_shared.extractRegionFromEndpoint(hostName),
              service: "iotdevicegateway",
              signed_body_value: auth.AwsSignedBodyValue.EmptySha256,
              omit_session_token: true
            };
            yield auth.aws_sign_request(request, signingConfig);
            done();
          } catch (error) {
            if (error instanceof error_1.CrtError) {
              done(error.error_code);
            } else {
              done(3);
            }
          }
        });
        return builder;
      }
      /**
       * Create a new MQTT5 client builder that will create MQTT5 clients that connect to AWS IoT Core via websockets,
       * authenticating via a custom authenticator.
       *
       * @param hostName - AWS IoT endpoint to connect to
       * @param customAuthConfig - AWS IoT custom auth configuration
       */
      static newWebsocketMqttBuilderWithCustomAuth(hostName, customAuthConfig) {
        let builder = new _AwsIotMqtt5ClientConfigBuilder(hostName, _AwsIotMqtt5ClientConfigBuilder.DEFAULT_WEBSOCKET_MQTT_PORT, new io.TlsContextOptions());
        builder.customAuthConfig = customAuthConfig;
        builder.config.websocketHandshakeTransform = (request, done) => __awaiter(this, void 0, void 0, function* () {
          done(0);
        });
        return builder;
      }
      /* Instance Methods for various config overrides */
      /**
       * Overrides the default system trust store.
       *
       * @param caDirpath - Only used on Unix-style systems where all trust anchors are
       * stored in a directory (e.g. /etc/ssl/certs).
       * @param caFilepath - Single file containing all trust CAs, in PEM format
       */
      withCertificateAuthorityFromPath(caDirpath, caFilepath) {
        this.tlsContextOptions.override_default_trust_store_from_path(caDirpath, caFilepath);
        return this;
      }
      /**
       * Overrides the default system trust store.
       *
       * @param ca - Buffer containing all trust CAs, in PEM format
       */
      withCertificateAuthority(ca) {
        this.tlsContextOptions.override_default_trust_store(ca);
        return this;
      }
      /**
       * Configures which TLS cipher preference should be used when establishing connections
       *
       * @param tlsCipherPreference cipher preference to use
       */
      withTlsCipherPreference(tlsCipherPreference) {
        this.tlsContextOptions.tls_cipher_preference = tlsCipherPreference;
        return this;
      }
      /**
       * Overrides the IoT endpoint port to connect to.
       *
       * @param port The IoT endpoint port to connect to. Usually 8883 for MQTT, or 443 for websockets
       */
      withPort(port) {
        this.config.port = port;
        return this;
      }
      /**
       * Overrides all configurable options with respect to the CONNECT packet sent by the client, including the will.
       * These connect properties will be used for every connection attempt made by the client.  Custom authentication
       * configuration will override the username and password values in this configuration.
       *
       * @param connectPacket all configurable options with respect to the CONNECT packet sent by the client
       */
      withConnectProperties(connectPacket) {
        this.config.connectProperties = connectPacket;
        return this;
      }
      /**
       * Overrides how the MQTT5 client should behave with respect to MQTT sessions.
       *
       * @param sessionBehavior how the MQTT5 client should behave with respect to MQTT sessions.
       */
      withSessionBehavior(sessionBehavior) {
        this.config.sessionBehavior = sessionBehavior;
        return this;
      }
      /**
       * Overrides how the reconnect delay is modified in order to smooth out the distribution of reconnection attempt
       * timepoints for a large set of reconnecting clients.
       *
       * @param retryJitterMode controls how the reconnect delay is modified in order to smooth out the distribution of
       * econnection attempt timepoints for a large set of reconnecting clients.
       */
      withRetryJitterMode(retryJitterMode) {
        this.config.retryJitterMode = retryJitterMode;
        return this;
      }
      /**
       * Overrides the minimum amount of time to wait to reconnect after a disconnect.  Exponential backoff is performed
       * with controllable jitter after each connection failure.
       *
       * @param minReconnectDelayMs minimum amount of time to wait to reconnect after a disconnect.
       */
      withMinReconnectDelayMs(minReconnectDelayMs) {
        this.config.minReconnectDelayMs = minReconnectDelayMs;
        return this;
      }
      /**
       * Overrides the maximum amount of time to wait to reconnect after a disconnect.  Exponential backoff is performed
       * with controllable jitter after each connection failure.
       *
       * @param maxReconnectDelayMs maximum amount of time to wait to reconnect after a disconnect.
       */
      withMaxReconnectDelayMs(maxReconnectDelayMs) {
        this.config.maxReconnectDelayMs = maxReconnectDelayMs;
        return this;
      }
      /**
       * Overrides the amount of time that must elapse with an established connection before the reconnect delay is
       * reset to the minimum.  This helps alleviate bandwidth-waste in fast reconnect cycles due to permission
       * failures on operations.
       *
       * @param minConnectedTimeToResetReconnectDelayMs the amount of time that must elapse with an established
       * connection before the reconnect delay is reset to the minimum
       */
      withMinConnectedTimeToResetReconnectDelayMs(minConnectedTimeToResetReconnectDelayMs) {
        this.config.minConnectedTimeToResetReconnectDelayMs = minConnectedTimeToResetReconnectDelayMs;
        return this;
      }
      /**
       * Overrides the time interval to wait after sending a CONNECT request for a CONNACK to arrive.  If one does not
       * arrive, the connection will be shut down.
       *
       * @param connackTimeoutMs time interval to wait after sending a CONNECT request for a CONNACK to arrive
       */
      withConnackTimeoutMs(connackTimeoutMs) {
        this.config.connackTimeoutMs = connackTimeoutMs;
        return this;
      }
      /**
       * Overrides how disconnects affect the queued and in-progress operations tracked by the client.  Also controls
       * how new operations are handled while the client is not connected.  In particular, if the client is not connected,
       * then any operation that would be failed on disconnect (according to these rules) will also be rejected.
       *
       * @param offlineQueueBehavior how disconnects affect the queued and in-progress operations tracked by the client
       *
       * @group Node-only
       */
      withOfflineQueueBehavior(offlineQueueBehavior) {
        this.config.offlineQueueBehavior = offlineQueueBehavior;
        return this;
      }
      /**
       * Overrides the time interval to wait after sending a PINGREQ for a PINGRESP to arrive.  If one does not arrive,
       * the client will close the current connection.
       *
       * @param pingTimeoutMs time interval to wait after sending a PINGREQ for a PINGRESP to arrive
       *
       * @group Node-only
       */
      withPingTimeoutMs(pingTimeoutMs) {
        this.config.pingTimeoutMs = pingTimeoutMs;
        return this;
      }
      /**
       * Overrides the time interval to wait for an ack after sending a QoS 1+ PUBLISH, SUBSCRIBE, or UNSUBSCRIBE before
       * failing the operation.  Defaults to no timeout.
       *
       * @param ackTimeoutSeconds the time interval to wait for an ack after sending a QoS 1+ PUBLISH, SUBSCRIBE,
       * or UNSUBSCRIBE before failing the operation
       *
       * @group Node-only
       */
      withAckTimeoutSeconds(ackTimeoutSeconds) {
        this.config.ackTimeoutSeconds = ackTimeoutSeconds;
        return this;
      }
      /**
       * Overrides the socket properties of the underlying MQTT connections made by the client.  Leave undefined to use
       * defaults (no TCP keep alive, 10 second socket timeout).
       *
       * @param socketOptions socket properties of the underlying MQTT connections made by the client
       *
       * @group Node-only
       */
      withSocketOptions(socketOptions) {
        this.config.socketOptions = socketOptions;
        return this;
      }
      /**
       * Overrides (tunneling) HTTP proxy usage when establishing MQTT connections.
       *
       * @param httpProxyOptions HTTP proxy options to use when establishing MQTT connections
       *
       * @group Node-only
       */
      withHttpProxyOptions(httpProxyOptions) {
        this.config.httpProxyOptions = httpProxyOptions;
        return this;
      }
      /**
       * Overrides additional controls for client behavior with respect to operation validation and flow control; these
       * checks go beyond the base MQTT5 spec to respect limits of specific MQTT brokers.
       *
       * @param extendedValidationAndFlowControlOptions additional controls for client behavior with respect to operation
       * validation and flow control
       *
       * @group Node-only
       */
      withExtendedValidationAndFlowControlOptions(extendedValidationAndFlowControlOptions) {
        this.config.extendedValidationAndFlowControlOptions = extendedValidationAndFlowControlOptions;
        return this;
      }
      /**
       * Overrides how the MQTT5 client should behave with respect to topic aliasing
       *
       * @param topicAliasingOptions how the MQTT5 client should behave with respect to topic aliasing
       */
      withTopicAliasingOptions(topicAliasingOptions) {
        this.config.topicAliasingOptions = topicAliasingOptions;
        return this;
      }
      /**
       * Constructs an MQTT5 Client configuration object for creating mqtt5 clients.
       */
      build() {
        var _a, _b;
        if (this.config.tlsCtx === void 0) {
          this.config.tlsCtx = new io.ClientTlsContext(this.tlsContextOptions);
        }
        if (this.config.connectProperties) {
          this.config.connectProperties.username = iot_shared.buildMqtt5FinalUsername(this.customAuthConfig);
          if ((_a = this.customAuthConfig) === null || _a === void 0 ? void 0 : _a.password) {
            this.config.connectProperties.password = (_b = this.customAuthConfig) === null || _b === void 0 ? void 0 : _b.password;
          }
        }
        return this.config;
      }
    };
    exports2.AwsIotMqtt5ClientConfigBuilder = AwsIotMqtt5ClientConfigBuilder;
    AwsIotMqtt5ClientConfigBuilder.DEFAULT_WEBSOCKET_MQTT_PORT = 443;
    AwsIotMqtt5ClientConfigBuilder.DEFAULT_DIRECT_MQTT_PORT = 8883;
  }
});

// node_modules/aws-crt/dist/native/iot.js
var require_iot = __commonJS({
  "node_modules/aws-crt/dist/native/iot.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_aws_iot(), exports2);
    __exportStar(require_aws_iot_mqtt5(), exports2);
  }
});

// node_modules/aws-crt/dist/native/mqtt.js
var require_mqtt2 = __commonJS({
  "node_modules/aws-crt/dist/native/mqtt.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MqttClientConnection = exports2.MqttClient = exports2.MqttWill = exports2.QoS = exports2.HttpProxyOptions = void 0;
    var binding_1 = __importDefault(require_binding());
    var native_resource_1 = require_native_resource();
    var event_1 = require_event();
    var crt = __importStar(require_mqtt_shared());
    var error_1 = require_error();
    var io = __importStar(require_io2());
    var http_1 = require_http2();
    Object.defineProperty(exports2, "HttpProxyOptions", { enumerable: true, get: function() {
      return http_1.HttpProxyOptions;
    } });
    var mqtt_1 = require_mqtt();
    var mqtt_2 = require_mqtt();
    Object.defineProperty(exports2, "QoS", { enumerable: true, get: function() {
      return mqtt_2.QoS;
    } });
    Object.defineProperty(exports2, "MqttWill", { enumerable: true, get: function() {
      return mqtt_2.MqttWill;
    } });
    var MqttClient = class extends native_resource_1.NativeResource {
      /**
       * @param bootstrap The {@link io.ClientBootstrap} to use for socket connections.  Leave undefined to use the
       *          default system-wide bootstrap (recommended).
       */
      constructor(bootstrap = void 0) {
        super(binding_1.default.mqtt_client_new(bootstrap != null ? bootstrap.native_handle() : null));
        this.bootstrap = bootstrap;
      }
      /**
       * Creates a new {@link MqttClientConnection}
       * @param config Configuration for the mqtt connection
       * @returns A new connection
       */
      new_connection(config) {
        return new MqttClientConnection(this, config);
      }
    };
    exports2.MqttClient = MqttClient;
    var MqttClientConnection = class extends (0, native_resource_1.NativeResourceMixin)(event_1.BufferedEventEmitter) {
      /**
       * @param client The client that owns this connection
       * @param config The configuration for this connection
       */
      constructor(client2, config) {
        super();
        this.client = client2;
        this.config = config;
        if (config == null || config == void 0) {
          throw new error_1.CrtError("MqttClientConnection constructor: config not defined");
        }
        const will = config.will ? {
          topic: config.will.topic,
          qos: config.will.qos,
          payload: crt.normalize_payload(config.will.payload),
          retain: config.will.retain
        } : void 0;
        var min_sec = mqtt_1.DEFAULT_RECONNECT_MIN_SEC;
        var max_sec = mqtt_1.DEFAULT_RECONNECT_MAX_SEC;
        if (config.reconnect_min_sec) {
          min_sec = config.reconnect_min_sec;
          max_sec = Math.max(min_sec, max_sec);
        }
        if (config.reconnect_max_sec) {
          max_sec = config.reconnect_max_sec;
          min_sec = Math.min(min_sec, max_sec);
        }
        if (client2 == void 0 || client2 == null) {
          throw new error_1.CrtError("MqttClientConnection constructor: client not defined");
        }
        if (config.socket_options == void 0 || config.socket_options == null) {
          throw new error_1.CrtError("MqttClientConnection constructor: socket_options in configuration not defined");
        }
        this._super(binding_1.default.mqtt_client_connection_new(client2.native_handle(), (error_code) => {
          this._on_connection_interrupted(error_code);
        }, (return_code, session_present) => {
          this._on_connection_resumed(return_code, session_present);
        }, (return_code, session_present) => {
          this._on_connection_success(return_code, session_present);
        }, (error_code) => {
          this._on_connection_failure(error_code);
        }, config.tls_ctx ? config.tls_ctx.native_handle() : null, will, config.username, config.password, config.use_websocket, config.proxy_options ? config.proxy_options.create_native_handle() : void 0, config.websocket_handshake_transform, min_sec, max_sec, config.disable_metrics == true ? void 0 : new crt.AwsIoTDeviceSDKMetrics()));
        this.tls_ctx = config.tls_ctx;
        binding_1.default.mqtt_client_connection_on_message(this.native_handle(), this._on_any_publish.bind(this));
        binding_1.default.mqtt_client_connection_on_closed(this.native_handle(), this._on_connection_closed.bind(this));
        this.on("error", (error) => {
        });
      }
      close() {
        binding_1.default.mqtt_client_connection_close(this.native_handle());
      }
      // Overridden to allow uncorking on ready
      on(event, listener) {
        super.on(event, listener);
        if (event == "connect") {
          process.nextTick(() => {
            this.uncork();
          });
        }
        return this;
      }
      /**
       * Open the actual connection to the server (async).
       * @returns A Promise which completes whether the connection succeeds or fails.
       *          If connection fails, the Promise will reject with an exception.
       *          If connection succeeds, the Promise will return a boolean that is
       *          true for resuming an existing session, or false if the session is new
       */
      connect() {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
            reject = this._reject(reject);
            if (this.config.socket_options == null || this.config.socket_options == void 0) {
              throw new error_1.CrtError("MqttClientConnection connect: socket_options in configuration not defined");
            }
            try {
              binding_1.default.mqtt_client_connection_connect(this.native_handle(), this.config.client_id, this.config.host_name, this.config.port, this.config.socket_options.native_handle(), this.config.keep_alive, this.config.ping_timeout, this.config.protocol_operation_timeout, this.config.clean_session, this._on_connect_callback.bind(this, resolve, reject));
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      /**
       * The connection will automatically reconnect when disconnected, removing the need for this function.
       * To cease automatic reconnection attempts, call {@link disconnect}.
       * @deprecated
       */
      reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
            reject = this._reject(reject);
            try {
              binding_1.default.mqtt_client_connection_reconnect(this.native_handle(), this._on_connect_callback.bind(this, resolve, reject));
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      /**
       * Publish message (async).
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * @param topic Topic name
       * @param payload Contents of message
       * @param qos Quality of Service for delivering this message
       * @param retain If true, the server will store the message and its QoS so that it can be
       *               delivered to future subscribers whose subscriptions match the topic name
       * @returns Promise which returns a {@link MqttRequest} which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * For QoS 2, completes when PUBCOMP is received.
       */
      publish(topic, payload, qos, retain = false) {
        return __awaiter(this, void 0, void 0, function* () {
          if (typeof topic !== "string") {
            return Promise.reject("topic is not a string");
          }
          if (typeof qos !== "number") {
            return Promise.reject("qos is not a number");
          }
          if (typeof retain !== "boolean") {
            return Promise.reject("retain is not a boolean");
          }
          return new Promise((resolve, reject) => {
            reject = this._reject(reject);
            try {
              binding_1.default.mqtt_client_connection_publish(this.native_handle(), topic, crt.normalize_payload(payload), qos, retain, this._on_puback_callback.bind(this, resolve, reject));
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      /**
       * Subscribe to a topic filter (async).
       * The client sends a SUBSCRIBE packet and the server responds with a SUBACK.
       *
       * subscribe() may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `callback` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * @param topic Subscribe to this topic filter, which may include wildcards
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param on_message Optional callback invoked when message received.
       * @returns Promise which returns a {@link MqttSubscribeRequest} which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       */
      subscribe(topic, qos, on_message) {
        return __awaiter(this, void 0, void 0, function* () {
          if (typeof topic !== "string") {
            return Promise.reject("topic is not a string");
          }
          if (typeof qos !== "number") {
            return Promise.reject("qos is not a number");
          }
          return new Promise((resolve, reject) => {
            reject = this._reject(reject);
            try {
              binding_1.default.mqtt_client_connection_subscribe(this.native_handle(), topic, qos, on_message, this._on_suback_callback.bind(this, resolve, reject));
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      /**
       * Unsubscribe from a topic filter (async).
       * The client sends an UNSUBSCRIBE packet, and the server responds with an UNSUBACK.
       * @param topic The topic filter to unsubscribe from. May contain wildcards.
       * @returns Promise wihch returns a {@link MqttRequest} which will contain the packet id
       *          of the UNSUBSCRIBE packet being acknowledged. Promise is resolved when an
       *          UNSUBACK is received from the server or is rejected when an exception occurs.
       */
      unsubscribe(topic) {
        return __awaiter(this, void 0, void 0, function* () {
          if (typeof topic !== "string") {
            return Promise.reject("topic is not a string");
          }
          return new Promise((resolve, reject) => {
            reject = this._reject(reject);
            try {
              binding_1.default.mqtt_client_connection_unsubscribe(this.native_handle(), topic, this._on_unsuback_callback.bind(this, resolve, reject));
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      /**
       * Close the connection (async).
       *
       * Will free all native resources, rendering the connection unusable after the disconnect() call.
       *
       * @returns Promise which completes when the connection is closed.
      */
      disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
            reject = this._reject(reject);
            try {
              binding_1.default.mqtt_client_connection_disconnect(this.native_handle(), this._on_disconnect_callback.bind(this, resolve));
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      /**
       * Queries a small set of numerical statistics about the current state of the connection's operation queue
       *
       * @group Node-only
       */
      getOperationalStatistics() {
        return binding_1.default.mqtt_client_connection_get_queue_statistics(this.native_handle());
      }
      /**
       * Queries a small set of numerical statistics about the current state of the connection's operation queue
       * @deprecated use getOperationalStatistics instead
       *
       * @group Node-only
       */
      getQueueStatistics() {
        return this.getOperationalStatistics();
      }
      // Wrap a promise rejection with a function that will also emit the error as an event
      _reject(reject) {
        return (reason) => {
          reject(reason);
          process.nextTick(() => {
            this.emit("error", new error_1.CrtError(reason));
          });
        };
      }
      _on_connection_failure(error_code) {
        let failureCallbackData = { error: new error_1.CrtError(error_code) };
        this.emit("connection_failure", failureCallbackData);
      }
      _on_connection_success(return_code, session_present) {
        let successCallbackData = { session_present, reason_code: return_code };
        this.emit("connection_success", successCallbackData);
      }
      _on_connection_interrupted(error_code) {
        this.emit("interrupt", new error_1.CrtError(error_code));
      }
      _on_connection_resumed(return_code, session_present) {
        this.emit("resume", return_code, session_present);
      }
      _on_any_publish(topic, payload, dup, qos, retain) {
        this.emit("message", topic, payload, dup, qos, retain);
      }
      _on_connection_closed() {
        let closedCallbackData = {};
        this.emit("closed", closedCallbackData);
        this.close();
      }
      _on_connect_callback(resolve, reject, error_code, return_code, session_present) {
        if (error_code == 0 && return_code == 0) {
          resolve(session_present);
          this.emit("connect", session_present);
        } else if (error_code != 0) {
          reject("Failed to connect: " + io.error_code_to_string(error_code));
        } else {
          reject("Server rejected connection.");
        }
      }
      _on_puback_callback(resolve, reject, packet_id, error_code) {
        if (error_code == 0) {
          resolve({ packet_id });
        } else {
          reject("Failed to publish: " + io.error_code_to_string(error_code));
        }
      }
      _on_suback_callback(resolve, reject, packet_id, topic, qos, error_code) {
        if (error_code == 0) {
          resolve({ packet_id, topic, qos, error_code });
        } else {
          reject("Failed to subscribe: " + io.error_code_to_string(error_code));
        }
      }
      _on_unsuback_callback(resolve, reject, packet_id, error_code) {
        if (error_code == 0) {
          resolve({ packet_id });
        } else {
          reject("Failed to unsubscribe: " + io.error_code_to_string(error_code));
        }
      }
      _on_disconnect_callback(resolve) {
        resolve();
        this.emit("disconnect");
      }
    };
    exports2.MqttClientConnection = MqttClientConnection;
    MqttClientConnection.CONNECT = "connect";
    MqttClientConnection.DISCONNECT = "disconnect";
    MqttClientConnection.ERROR = "error";
    MqttClientConnection.INTERRUPT = "interrupt";
    MqttClientConnection.RESUME = "resume";
    MqttClientConnection.MESSAGE = "message";
    MqttClientConnection.CONNECTION_SUCCESS = "connection_success";
    MqttClientConnection.CONNECTION_FAILURE = "connection_failure";
    MqttClientConnection.CLOSED = "closed";
  }
});

// node_modules/aws-crt/dist/common/mqtt_request_response_internal.js
var require_mqtt_request_response_internal = __commonJS({
  "node_modules/aws-crt/dist/common/mqtt_request_response_internal.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RequestResponseClientState = exports2.StreamingOperationState = void 0;
    var StreamingOperationState;
    (function(StreamingOperationState2) {
      StreamingOperationState2[StreamingOperationState2["None"] = 0] = "None";
      StreamingOperationState2[StreamingOperationState2["Open"] = 1] = "Open";
      StreamingOperationState2[StreamingOperationState2["Closed"] = 2] = "Closed";
    })(StreamingOperationState = exports2.StreamingOperationState || (exports2.StreamingOperationState = {}));
    var RequestResponseClientState;
    (function(RequestResponseClientState2) {
      RequestResponseClientState2[RequestResponseClientState2["Ready"] = 0] = "Ready";
      RequestResponseClientState2[RequestResponseClientState2["Closed"] = 1] = "Closed";
    })(RequestResponseClientState = exports2.RequestResponseClientState || (exports2.RequestResponseClientState = {}));
  }
});

// node_modules/aws-crt/dist/common/mqtt_request_response.js
var require_mqtt_request_response = __commonJS({
  "node_modules/aws-crt/dist/common/mqtt_request_response.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SubscriptionStatusEventType = void 0;
    var SubscriptionStatusEventType;
    (function(SubscriptionStatusEventType2) {
      SubscriptionStatusEventType2[SubscriptionStatusEventType2["SubscriptionEstablished"] = 0] = "SubscriptionEstablished";
      SubscriptionStatusEventType2[SubscriptionStatusEventType2["SubscriptionLost"] = 1] = "SubscriptionLost";
      SubscriptionStatusEventType2[SubscriptionStatusEventType2["SubscriptionHalted"] = 2] = "SubscriptionHalted";
    })(SubscriptionStatusEventType = exports2.SubscriptionStatusEventType || (exports2.SubscriptionStatusEventType = {}));
  }
});

// node_modules/aws-crt/dist/native/mqtt_request_response.js
var require_mqtt_request_response2 = __commonJS({
  "node_modules/aws-crt/dist/native/mqtt_request_response.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RequestResponseClient = exports2.StreamingOperationBase = void 0;
    var error_1 = require_error();
    var mqtt_request_response_internal = __importStar(require_mqtt_request_response_internal());
    var native_resource_1 = require_native_resource();
    var event_1 = require_event();
    var binding_1 = __importDefault(require_binding());
    var io_1 = require_io2();
    __exportStar(require_mqtt_request_response(), exports2);
    var StreamingOperationBase = class _StreamingOperationBase extends (0, native_resource_1.NativeResourceMixin)(event_1.BufferedEventEmitter) {
      static new(options, client2) {
        if (!options) {
          throw new error_1.CrtError("invalid configuration for streaming operation");
        }
        let operation = new _StreamingOperationBase(client2);
        operation._super(binding_1.default.mqtt_streaming_operation_new(operation, client2.native_handle(), options, (streamingOperation, type, error_code) => {
          _StreamingOperationBase._s_on_subscription_status_update(operation, type, error_code);
        }, (streamingOperation, publishEvent) => {
          _StreamingOperationBase._s_on_incoming_publish(operation, publishEvent);
        }));
        client2.registerUnclosedStreamingOperation(operation);
        return operation;
      }
      constructor(client2) {
        super();
        this.state = mqtt_request_response_internal.StreamingOperationState.None;
        this.client = client2;
      }
      /**
       * Triggers the streaming operation to start listening to the configured stream of events.  Has no effect on an
       * already-open operation.  It is an error to attempt to re-open a closed streaming operation.
       */
      open() {
        if (this.state == mqtt_request_response_internal.StreamingOperationState.None) {
          this.state = mqtt_request_response_internal.StreamingOperationState.Open;
          binding_1.default.mqtt_streaming_operation_open(this.native_handle());
        } else if (this.state == mqtt_request_response_internal.StreamingOperationState.Closed) {
          throw new error_1.CrtError("MQTT streaming operation already closed");
        }
      }
      /**
       * Stops a streaming operation from listening to the configured stream of events and releases all native
       * resources associated with the stream.
       */
      close() {
        if (this.state != mqtt_request_response_internal.StreamingOperationState.Closed) {
          this.client.unregisterUnclosedStreamingOperation(this);
          this.state = mqtt_request_response_internal.StreamingOperationState.Closed;
          binding_1.default.mqtt_streaming_operation_close(this.native_handle());
        }
      }
      on(event, listener) {
        super.on(event, listener);
        return this;
      }
      static _s_on_subscription_status_update(streamingOperation, type, error_code) {
        let statusEvent = {
          type
        };
        if (error_code != 0) {
          statusEvent.error = new error_1.CrtError(error_code);
        }
        process.nextTick(() => {
          streamingOperation.emit(_StreamingOperationBase.SUBSCRIPTION_STATUS, statusEvent);
        });
      }
      static _s_on_incoming_publish(streamingOperation, publishEvent) {
        process.nextTick(() => {
          streamingOperation.emit(_StreamingOperationBase.INCOMING_PUBLISH, publishEvent);
        });
      }
    };
    exports2.StreamingOperationBase = StreamingOperationBase;
    StreamingOperationBase.SUBSCRIPTION_STATUS = "subscriptionStatus";
    StreamingOperationBase.INCOMING_PUBLISH = "incomingPublish";
    var RequestResponseClient = class _RequestResponseClient extends (0, native_resource_1.NativeResourceMixin)(event_1.BufferedEventEmitter) {
      constructor() {
        super();
        this.state = mqtt_request_response_internal.RequestResponseClientState.Ready;
        this.unclosedOperations = /* @__PURE__ */ new Set();
      }
      /**
       * Creates a new MQTT service request-response client that uses an MQTT5 client as the protocol implementation.
       *
       * @param protocolClient protocol client to use for all operations
       * @param options configuration options for the desired request-response client
       */
      static newFromMqtt5(protocolClient, options) {
        if (!protocolClient) {
          throw new error_1.CrtError("protocol client is null");
        }
        let client2 = new _RequestResponseClient();
        client2._super(binding_1.default.mqtt_request_response_client_new_from_5(client2, protocolClient.native_handle(), options));
        return client2;
      }
      /**
       * Creates a new MQTT service request-response client that uses an MQTT311 client as the protocol implementation.
       *
       * @param protocolClient protocol client to use for all operations
       * @param options configuration options for the desired request-response client
       */
      static newFromMqtt311(protocolClient, options) {
        if (!protocolClient) {
          throw new error_1.CrtError("protocol client is null");
        }
        let client2 = new _RequestResponseClient();
        client2._super(binding_1.default.mqtt_request_response_client_new_from_311(client2, protocolClient.native_handle(), options));
        return client2;
      }
      /**
       * Triggers cleanup of native resources associated with the request-response client.  Closing a client will fail
       * all incomplete requests and close all outstanding streaming operations.
       *
       * This must be called when finished with a client; otherwise, native resources will leak.
       */
      close() {
        if (this.state != mqtt_request_response_internal.RequestResponseClientState.Closed) {
          this.state = mqtt_request_response_internal.RequestResponseClientState.Closed;
          this.closeStreamingOperations();
          binding_1.default.mqtt_request_response_client_close(this.native_handle());
        }
      }
      /**
       * Creates a new streaming operation from a set of configuration options.  A streaming operation provides a
       * mechanism for listening to a specific event stream from an AWS MQTT-based service.
       *
       * @param streamOptions configuration options for the streaming operation
       */
      createStream(streamOptions) {
        if (this.state == mqtt_request_response_internal.RequestResponseClientState.Closed) {
          throw new error_1.CrtError("MQTT request-response client has already been closed");
        }
        return StreamingOperationBase.new(streamOptions, this);
      }
      /**
       * Submits a request to the request-response client.
       *
       * @param requestOptions description of the request to perform
       *
       * Returns a promise that resolves to a response to the request or an error describing how the request attempt
       * failed.
       *
       * A "successful" request-response execution flow is defined as "the service sent a response payload that
       * correlates with the request payload."  Upon deserialization (which is the responsibility of the service model
       * client, one layer up), such a payload may actually indicate a failure.
       */
      submitRequest(requestOptions) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
            if (this.state == mqtt_request_response_internal.RequestResponseClientState.Closed) {
              reject(new error_1.CrtError("MQTT request-response client has already been closed"));
              return;
            }
            if (!requestOptions) {
              reject(new error_1.CrtError("null request options"));
              return;
            }
            function curriedPromiseCallback(errorCode, topic, response) {
              return _RequestResponseClient._s_on_request_completion(resolve, reject, errorCode, topic, response);
            }
            try {
              binding_1.default.mqtt_request_response_client_submit_request(this.native_handle(), requestOptions, curriedPromiseCallback);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      /**
       *
       * Adds a streaming operation to the set of operations that will be closed automatically when the
       * client is closed.
       *
       * @internal
       *
       * @param operation streaming operation to add
       */
      registerUnclosedStreamingOperation(operation) {
        if (this.unclosedOperations) {
          this.unclosedOperations.add(operation);
        }
      }
      /**
       *
       * Removes a streaming operation from the set of operations that will be closed automatically when the
       * client is closed.
       *
       * @internal
       *
       * @param operation streaming operation to remove
       */
      unregisterUnclosedStreamingOperation(operation) {
        if (this.unclosedOperations) {
          this.unclosedOperations.delete(operation);
        }
      }
      closeStreamingOperations() {
        if (this.unclosedOperations) {
          let unclosedOperations = this.unclosedOperations;
          this.unclosedOperations = void 0;
          for (const operation of unclosedOperations) {
            operation.close();
          }
        }
      }
      static _s_on_request_completion(resolve, reject, errorCode, topic, payload) {
        if (errorCode == 0 && topic !== void 0 && payload !== void 0) {
          let response = {
            payload,
            topic
          };
          resolve(response);
        } else {
          reject(new error_1.CrtError((0, io_1.error_code_to_string)(errorCode)));
        }
      }
    };
    exports2.RequestResponseClient = RequestResponseClient;
  }
});

// node_modules/aws-crt/dist/index.js
var require_dist = __commonJS({
  "node_modules/aws-crt/dist/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CrtError = exports2.resource_safety = exports2.promise = exports2.platform = exports2.mqtt_request_response = exports2.mqtt5 = exports2.mqtt = exports2.iot = exports2.io = exports2.http = exports2.eventstream = exports2.crt = exports2.crypto = exports2.checksums = exports2.cancel = exports2.auth = void 0;
    var cancel = __importStar(require_cancel());
    exports2.cancel = cancel;
    var platform = __importStar(require_platform());
    exports2.platform = platform;
    var promise = __importStar(require_promise());
    exports2.promise = promise;
    var resource_safety = __importStar(require_resource_safety());
    exports2.resource_safety = resource_safety;
    var auth = __importStar(require_auth());
    exports2.auth = auth;
    var checksums = __importStar(require_checksums());
    exports2.checksums = checksums;
    var crt = __importStar(require_crt());
    exports2.crt = crt;
    var crypto4 = __importStar(require_crypto());
    exports2.crypto = crypto4;
    var eventstream = __importStar(require_eventstream());
    exports2.eventstream = eventstream;
    var http = __importStar(require_http2());
    exports2.http = http;
    var io = __importStar(require_io2());
    exports2.io = io;
    var iot2 = __importStar(require_iot());
    exports2.iot = iot2;
    var mqtt2 = __importStar(require_mqtt2());
    exports2.mqtt = mqtt2;
    var mqtt5 = __importStar(require_mqtt52());
    exports2.mqtt5 = mqtt5;
    var mqtt_request_response = __importStar(require_mqtt_request_response2());
    exports2.mqtt_request_response = mqtt_request_response;
    var error_1 = require_error();
    Object.defineProperty(exports2, "CrtError", { enumerable: true, get: function() {
      return error_1.CrtError;
    } });
  }
});

// node_modules/@aws-sdk/util-utf8-browser/dist-cjs/pureJs.js
var require_pureJs = __commonJS({
  "node_modules/@aws-sdk/util-utf8-browser/dist-cjs/pureJs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.toUtf8 = exports2.fromUtf8 = void 0;
    var fromUtf8 = (input) => {
      const bytes = [];
      for (let i = 0, len = input.length; i < len; i++) {
        const value = input.charCodeAt(i);
        if (value < 128) {
          bytes.push(value);
        } else if (value < 2048) {
          bytes.push(value >> 6 | 192, value & 63 | 128);
        } else if (i + 1 < input.length && (value & 64512) === 55296 && (input.charCodeAt(i + 1) & 64512) === 56320) {
          const surrogatePair = 65536 + ((value & 1023) << 10) + (input.charCodeAt(++i) & 1023);
          bytes.push(surrogatePair >> 18 | 240, surrogatePair >> 12 & 63 | 128, surrogatePair >> 6 & 63 | 128, surrogatePair & 63 | 128);
        } else {
          bytes.push(value >> 12 | 224, value >> 6 & 63 | 128, value & 63 | 128);
        }
      }
      return Uint8Array.from(bytes);
    };
    exports2.fromUtf8 = fromUtf8;
    var toUtf8 = (input) => {
      let decoded = "";
      for (let i = 0, len = input.length; i < len; i++) {
        const byte = input[i];
        if (byte < 128) {
          decoded += String.fromCharCode(byte);
        } else if (192 <= byte && byte < 224) {
          const nextByte = input[++i];
          decoded += String.fromCharCode((byte & 31) << 6 | nextByte & 63);
        } else if (240 <= byte && byte < 365) {
          const surrogatePair = [byte, input[++i], input[++i], input[++i]];
          const encoded = "%" + surrogatePair.map((byteValue) => byteValue.toString(16)).join("%");
          decoded += decodeURIComponent(encoded);
        } else {
          decoded += String.fromCharCode((byte & 15) << 12 | (input[++i] & 63) << 6 | input[++i] & 63);
        }
      }
      return decoded;
    };
    exports2.toUtf8 = toUtf8;
  }
});

// node_modules/@aws-sdk/util-utf8-browser/dist-cjs/whatwgEncodingApi.js
var require_whatwgEncodingApi = __commonJS({
  "node_modules/@aws-sdk/util-utf8-browser/dist-cjs/whatwgEncodingApi.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.toUtf8 = exports2.fromUtf8 = void 0;
    function fromUtf8(input) {
      return new TextEncoder().encode(input);
    }
    exports2.fromUtf8 = fromUtf8;
    function toUtf8(input) {
      return new TextDecoder("utf-8").decode(input);
    }
    exports2.toUtf8 = toUtf8;
  }
});

// node_modules/@aws-sdk/util-utf8-browser/dist-cjs/index.js
var require_dist_cjs = __commonJS({
  "node_modules/@aws-sdk/util-utf8-browser/dist-cjs/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.toUtf8 = exports2.fromUtf8 = void 0;
    var pureJs_1 = require_pureJs();
    var whatwgEncodingApi_1 = require_whatwgEncodingApi();
    var fromUtf8 = (input) => typeof TextEncoder === "function" ? (0, whatwgEncodingApi_1.fromUtf8)(input) : (0, pureJs_1.fromUtf8)(input);
    exports2.fromUtf8 = fromUtf8;
    var toUtf8 = (input) => typeof TextDecoder === "function" ? (0, whatwgEncodingApi_1.toUtf8)(input) : (0, pureJs_1.toUtf8)(input);
    exports2.toUtf8 = toUtf8;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/eventstream_rpc.js
var require_eventstream_rpc = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/eventstream_rpc.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createRpcError = exports2.StreamingOperation = exports2.RequestResponseOperation = exports2.RpcClient = exports2.validateRpcClientConfig = exports2.RpcError = exports2.RpcErrorType = void 0;
    var aws_crt_1 = require_dist();
    var events_1 = require("events");
    var util_utf8_browser_1 = require_dist_cjs();
    var RpcErrorType;
    (function(RpcErrorType2) {
      RpcErrorType2[RpcErrorType2["SerializationError"] = 0] = "SerializationError";
      RpcErrorType2[RpcErrorType2["DeserializationError"] = 1] = "DeserializationError";
      RpcErrorType2[RpcErrorType2["HandshakeError"] = 2] = "HandshakeError";
      RpcErrorType2[RpcErrorType2["InternalError"] = 3] = "InternalError";
      RpcErrorType2[RpcErrorType2["ClientStateError"] = 4] = "ClientStateError";
      RpcErrorType2[RpcErrorType2["NetworkError"] = 5] = "NetworkError";
      RpcErrorType2[RpcErrorType2["InterruptionError"] = 6] = "InterruptionError";
      RpcErrorType2[RpcErrorType2["ValidationError"] = 7] = "ValidationError";
      RpcErrorType2[RpcErrorType2["ServiceError"] = 8] = "ServiceError";
    })(RpcErrorType = exports2.RpcErrorType || (exports2.RpcErrorType = {}));
    var RpcError = class extends Error {
      /** @internal */
      constructor(model) {
        super(model.description);
        this.type = model.type;
        this.description = model.description;
        if (model.internalError) {
          this.internalError = model.internalError;
        }
        if (model.serviceError) {
          this.serviceError = model.serviceError;
        }
      }
    };
    exports2.RpcError = RpcError;
    function validateRpcClientConfig(config) {
      if (!config) {
        throw createRpcError(RpcErrorType.ValidationError, "Eventstream RPC client configuration is undefined");
      }
      if (!config.hostName) {
        throw createRpcError(RpcErrorType.ValidationError, "Eventstream RPC client configuration must have a valid host name");
      }
      if (typeof config.hostName !== "string") {
        throw createRpcError(RpcErrorType.ValidationError, "Eventstream RPC client configuration host name must be a string");
      }
      if (config.port === void 0 || config.port === null) {
        throw createRpcError(RpcErrorType.ValidationError, "Eventstream RPC client configuration must have a valid port");
      }
      if (typeof config.port !== "number" || !Number.isSafeInteger(config.port) || config.port < 0 || config.port > 65535) {
        throw createRpcError(RpcErrorType.ValidationError, "Eventstream RPC client configuration host name must be 16-bit integer");
      }
    }
    exports2.validateRpcClientConfig = validateRpcClientConfig;
    var ClientState;
    (function(ClientState2) {
      ClientState2[ClientState2["None"] = 0] = "None";
      ClientState2[ClientState2["Connecting"] = 1] = "Connecting";
      ClientState2[ClientState2["Connected"] = 2] = "Connected";
      ClientState2[ClientState2["Finished"] = 3] = "Finished";
      ClientState2[ClientState2["Closed"] = 4] = "Closed";
    })(ClientState || (ClientState = {}));
    var RpcClient = class _RpcClient extends events_1.EventEmitter {
      constructor(config) {
        super();
        this.config = config;
        this.unclosedOperations = /* @__PURE__ */ new Set();
        this.state = ClientState.None;
        this.emitDisconnectOnClose = false;
        let connectionOptions = {
          hostName: config.hostName,
          port: config.port,
          socketOptions: config.socketOptions,
          tlsCtx: config.tlsCtx
        };
        try {
          this.connection = new aws_crt_1.eventstream.ClientConnection(connectionOptions);
        } catch (e) {
          throw createRpcError(RpcErrorType.InternalError, "Failed to create eventstream connection", e);
        }
      }
      /**
       * Factory method to create a new client
       *
       * @param config configuration options that the new client must use
       *
       * Returns a new client on success, otherwise throws an RpcError
       */
      static new(config) {
        return new _RpcClient(config);
      }
      /**
       * Attempts to open a network connection to the configured remote endpoint.  Returned promise will be fulfilled if
       * the transport-level connection is successfully established and the eventstream handshake completes without
       * error.
       *
       * Returns a promise that is resolved with additional context on a successful connection, otherwise rejected.
       *
       * connect() may only be called once.
       */
      connect(options) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (this.state != ClientState.None) {
              reject(createRpcError(RpcErrorType.ClientStateError, "RpcClient.connect() can only be called once"));
              return;
            }
            let onDisconnectWhileConnecting = (eventData) => {
              if (this.state == ClientState.Connecting) {
                this.state = ClientState.Finished;
                reject(createRpcError(RpcErrorType.NetworkError, "RpcClient.connect() failed - connection closed"));
                setImmediate(() => {
                  this.close();
                });
              }
            };
            this.connection.on("disconnection", onDisconnectWhileConnecting);
            this.state = ClientState.Connecting;
            let connack = void 0;
            try {
              yield this.connection.connect({
                cancelController: options === null || options === void 0 ? void 0 : options.cancelController
              });
              let connectMessage = {
                type: aws_crt_1.eventstream.MessageType.Connect
              };
              if (this.config.connectTransform) {
                connectMessage = yield this.config.connectTransform({
                  message: connectMessage,
                  cancelController: options === null || options === void 0 ? void 0 : options.cancelController
                });
              }
              this._applyEventstreamRpcHeadersToConnect(connectMessage);
              let connackPromise = aws_crt_1.cancel.newCancellablePromiseFromNextEvent({
                cancelController: options === null || options === void 0 ? void 0 : options.cancelController,
                emitter: this.connection,
                eventName: aws_crt_1.eventstream.ClientConnection.PROTOCOL_MESSAGE,
                eventDataTransformer: (eventData) => {
                  return eventData.message;
                },
                cancelMessage: "Eventstream connect() cancelled by user request"
              });
              yield this.connection.sendProtocolMessage({
                message: connectMessage,
                cancelController: options === null || options === void 0 ? void 0 : options.cancelController
              });
              connack = yield connackPromise;
            } catch (err) {
              if (this.state == ClientState.Connecting) {
                this.state = ClientState.Finished;
                setImmediate(() => {
                  this.close();
                });
              }
              reject(createRpcError(RpcErrorType.InternalError, "Failed to establish eventstream RPC connection", err));
              return;
            }
            if (this.state != ClientState.Connecting) {
              reject(createRpcError(RpcErrorType.InternalError, "Eventstream RPC connection attempt interrupted"));
              return;
            }
            if (!connack || !_RpcClient.isValidConnack(connack)) {
              this.state = ClientState.Finished;
              reject(createRpcError(RpcErrorType.HandshakeError, "Failed to establish eventstream RPC connection - invalid connack"));
              setImmediate(() => {
                this.close();
              });
              return;
            }
            this.connection.removeListener("disconnection", onDisconnectWhileConnecting);
            this.connection.on("disconnection", (eventData) => {
              if (eventData.errorCode != 0) {
                this.disconnectionReason = new aws_crt_1.CrtError(eventData.errorCode);
              }
              setImmediate(() => {
                this.close();
              });
            });
            this.emitDisconnectOnClose = true;
            this.state = ClientState.Connected;
            resolve({});
          }));
        });
      }
      /**
       * Returns true if the connection is currently open and ready-to-use, false otherwise.
       */
      isConnected() {
        return this.state == ClientState.Connected;
      }
      /**
       * @internal
       *
       * Adds an unclosed operation to the set tracked by the client.  When the client is closed, all unclosed operations
       * will also be closed.  While not foolproof, this enables us to avoid many kinds of resource leaks when the user
       * doesn't do exactly what we would like them to do (which may not be obvious to them, in all fairness).
       *
       * @param operation unclosed operation to register
       */
      registerUnclosedOperation(operation) {
        if (!this.isConnected() || !this.unclosedOperations) {
          throw createRpcError(RpcErrorType.ClientStateError, "Operation registration only allowed when the client is connected");
        }
        this.unclosedOperations.add(operation);
      }
      /**
       * @internal
       *
       * Removes an unclosed operation from the set tracked by the client.  When the client is closed, all unclosed operations
       * will also be closed.
       *
       * @param operation operation to remove, presumably because it just got closed
       */
      removeUnclosedOperation(operation) {
        if (this.unclosedOperations) {
          this.unclosedOperations.delete(operation);
        }
      }
      /**
       * Shuts down the client and begins the process of release all native resources associated with the client
       * and in-progress operations.  It is critical that this function be called when finished with the client;
       * otherwise, native resources will leak.
       *
       * The client tracks unclosed operations and, as part of this process, closes them as well.
       */
      close() {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
              if (this.state == ClientState.Closed) {
                resolve();
                return;
              }
              this.state = ClientState.Closed;
              if (this.emitDisconnectOnClose) {
                this.emitDisconnectOnClose = false;
                if (!this.disconnectionReason) {
                  this.disconnectionReason = new aws_crt_1.CrtError("User-initiated disconnect");
                }
                setImmediate(() => {
                  this.emit("disconnection", { reason: this.disconnectionReason });
                });
              }
              if (this.unclosedOperations) {
                let unclosedOperations = this.unclosedOperations;
                this.unclosedOperations = void 0;
                for (const operation of unclosedOperations) {
                  yield operation.close();
                }
              }
              this.connection.close();
              resolve();
            } catch (err) {
              reject(err);
            }
          }));
        });
      }
      /**
       * @internal
       *
       * Creates a new stream on the client's connection for an RPC operation to use.
       *
       * Returns a new stream on success, otherwise throws an RpcError
       */
      newStream() {
        if (this.state != ClientState.Connected) {
          throw createRpcError(RpcErrorType.ClientStateError, "New streams may only be created while the client is connected");
        }
        try {
          return this.connection.newStream();
        } catch (e) {
          throw createRpcError(RpcErrorType.InternalError, "Failed to create new event stream", e);
        }
      }
      on(event, listener) {
        super.on(event, listener);
        return this;
      }
      static isValidConnack(message) {
        var _a;
        if (message.type != aws_crt_1.eventstream.MessageType.ConnectAck) {
          return false;
        }
        if ((((_a = message.flags) !== null && _a !== void 0 ? _a : 0) & aws_crt_1.eventstream.MessageFlags.ConnectionAccepted) == 0) {
          return false;
        }
        return true;
      }
      _applyEventstreamRpcHeadersToConnect(connectMessage) {
        if (!connectMessage.headers) {
          connectMessage.headers = [];
        }
        connectMessage.headers.push(aws_crt_1.eventstream.Header.newString(":version", "0.1.0"));
      }
    };
    exports2.RpcClient = RpcClient;
    RpcClient.DISCONNECTION = "disconnection";
    var OperationState;
    (function(OperationState2) {
      OperationState2[OperationState2["None"] = 0] = "None";
      OperationState2[OperationState2["Activating"] = 1] = "Activating";
      OperationState2[OperationState2["Activated"] = 2] = "Activated";
      OperationState2[OperationState2["Ended"] = 3] = "Ended";
      OperationState2[OperationState2["Closed"] = 4] = "Closed";
    })(OperationState || (OperationState = {}));
    var OperationBase = class extends events_1.EventEmitter {
      constructor(operationConfig) {
        super();
        this.operationConfig = operationConfig;
        this.state = OperationState.None;
        this.stream = operationConfig.client.newStream();
        operationConfig.client.registerUnclosedOperation(this);
      }
      /**
       * Shuts down the operation's stream binding, with an optional flush of a termination message to the server.
       * Also removes the operation from the associated client's unclosed operation set.
       */
      close() {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (this.state == OperationState.Closed) {
              resolve();
              return;
            }
            this.operationConfig.client.removeUnclosedOperation(this);
            let shouldTerminateStream = this.state == OperationState.Activated;
            this.state = OperationState.Closed;
            if (shouldTerminateStream) {
              try {
                yield this.stream.sendMessage({
                  message: {
                    type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
                    flags: aws_crt_1.eventstream.MessageFlags.TerminateStream
                  }
                });
              } catch (e) {
              }
            }
            setImmediate(() => {
              this.stream.close();
            });
            resolve();
          }));
        });
      }
      /**
       * Activates an eventstream RPC operation
       *
       * @param message eventstream message to send as part of stream activation
       */
      activate(message) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (this.state != OperationState.None) {
              reject(createRpcError(RpcErrorType.ClientStateError, "Eventstream operations may only have activate() invoked once"));
              return;
            }
            this.state = OperationState.Activating;
            try {
              let activatePromise = this.stream.activate({
                operation: this.operationConfig.name,
                message,
                cancelController: this.operationConfig.options.cancelController
              });
              yield activatePromise;
            } catch (e) {
              if (this.state == OperationState.Activating) {
                this.state = OperationState.Ended;
                setImmediate(() => {
                  this.close();
                });
              }
              reject(createRpcError(RpcErrorType.InternalError, "Operation stream activation failure", e));
              return;
            }
            if (this.state != OperationState.Activating) {
              reject(createRpcError(RpcErrorType.InternalError, "Operation stream activation interruption"));
              return;
            }
            this.state = OperationState.Activated;
            resolve({});
          }));
        });
      }
      /**
       * @return true if the stream is currently active and ready-to-use, false otherwise.
       */
      isActive() {
        return this.state == OperationState.Activated;
      }
      /**
       * @return the operation's underlying event stream binding object
       */
      getStream() {
        return this.stream;
      }
      /**
       * Set this operation state to be "Ended" so that closing the operation will not send a terminate message.
       */
      setStateEnded() {
        this.state = OperationState.Ended;
      }
    };
    var RequestResponseOperation = class extends events_1.EventEmitter {
      /**
       * @internal
       *
       * @param operationConfig
       * @param serviceModel
       */
      constructor(operationConfig, serviceModel) {
        if (!serviceModel.operations.has(operationConfig.name)) {
          throw createRpcError(RpcErrorType.InternalError, `service model has no operation named ${operationConfig.name}`);
        }
        super();
        this.operationConfig = operationConfig;
        this.serviceModel = serviceModel;
        this.operation = new OperationBase(this.operationConfig);
      }
      /**
       * Performs the request-response interaction
       *
       * @param request modeled request data
       */
      activate(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let resultPromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
              let stream = this.operation.getStream();
              let responsePromise = aws_crt_1.cancel.newCancellablePromiseFromNextEvent({
                cancelController: this.operationConfig.options.cancelController,
                emitter: stream,
                eventName: aws_crt_1.eventstream.ClientStream.MESSAGE,
                eventDataTransformer: (eventData) => {
                  return eventData.message;
                },
                cancelMessage: "Eventstream execute() cancelled by user request"
              });
              if (!this.operationConfig.options.disableValidation) {
                validateRequest(this.serviceModel, this.operationConfig.name, request);
              }
              let requestMessage = serializeRequest(this.serviceModel, this.operationConfig.name, request);
              yield this.operation.activate(requestMessage);
              let message = yield responsePromise;
              if (((_a = message.flags) !== null && _a !== void 0 ? _a : 0) & aws_crt_1.eventstream.MessageFlags.TerminateStream) {
                this.operation.setStateEnded();
              }
              let response = deserializeResponse(this.serviceModel, this.operationConfig.name, message);
              resolve(response);
            } catch (e) {
              reject(e);
            }
          }));
          let autoClosePromise = resultPromise.finally(() => __awaiter(this, void 0, void 0, function* () {
            yield this.operation.close();
          }));
          return autoClosePromise;
        });
      }
    };
    exports2.RequestResponseOperation = RequestResponseOperation;
    var StreamingOperation = class _StreamingOperation extends events_1.EventEmitter {
      /**
       * @internal
       *
       * @param request
       * @param operationConfig
       * @param serviceModel
       */
      constructor(request, operationConfig, serviceModel) {
        if (!serviceModel.operations.has(operationConfig.name)) {
          throw createRpcError(RpcErrorType.InternalError, `service model has no operation named ${operationConfig.name}`);
        }
        if (!operationConfig.options.disableValidation) {
          validateRequest(serviceModel, operationConfig.name, request);
        }
        super();
        this.request = request;
        this.operationConfig = operationConfig;
        this.serviceModel = serviceModel;
        this.operation = new OperationBase(operationConfig);
        this.responseHandled = false;
      }
      /**
       * Activates a streaming operation
       */
      activate() {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
              let stream = this.operation.getStream();
              stream.addListener(aws_crt_1.eventstream.ClientStream.MESSAGE, this._onStreamMessageEvent.bind(this));
              stream.addListener(aws_crt_1.eventstream.ClientStream.ENDED, this._onStreamEndedEvent.bind(this));
              let responsePromise = aws_crt_1.cancel.newCancellablePromiseFromNextEvent({
                cancelController: this.operationConfig.options.cancelController,
                emitter: stream,
                eventName: aws_crt_1.eventstream.ClientStream.MESSAGE,
                eventDataTransformer: (eventData) => {
                  this.responseHandled = true;
                  return eventData.message;
                },
                cancelMessage: "Eventstream execute() cancelled by user request"
              });
              let requestMessage = serializeRequest(this.serviceModel, this.operationConfig.name, this.request);
              yield this.operation.activate(requestMessage);
              let message = yield responsePromise;
              let response = deserializeResponse(this.serviceModel, this.operationConfig.name, message);
              if (((_a = message.flags) !== null && _a !== void 0 ? _a : 0) & aws_crt_1.eventstream.MessageFlags.TerminateStream) {
                this.operation.setStateEnded();
                yield this.close();
              }
              resolve(response);
            } catch (e) {
              yield this.close();
              reject(e);
            }
          }));
        });
      }
      /**
       * Sends an outbound message on a streaming operation, if the operation allows outbound streaming messages.
       *
       * @param message modeled data to send
       */
      sendMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
              if (!doesOperationAllowOutboundMessages(this.serviceModel, this.operationConfig.name)) {
                throw createRpcError(RpcErrorType.ValidationError, `Operation '${this.operationConfig.name}' does not allow outbound streaming messages.`);
              }
              if (!this.operationConfig.options.disableValidation) {
                validateOutboundMessage(this.serviceModel, this.operationConfig.name, message);
              }
              let serializedMessage = serializeOutboundMessage(this.serviceModel, this.operationConfig.name, message);
              let stream = this.operation.getStream();
              yield stream.sendMessage({
                message: serializedMessage,
                cancelController: this.operationConfig.options.cancelController
              });
              resolve();
            } catch (err) {
              reject(err);
            }
          }));
        });
      }
      /**
       * Asynchronous close method for the underlying event stream.  The user should call this function when finished
       * with the operation in order to clean up native resources.  Failing to do so will cause the native resources
       * to persist until the client is closed.  If the client is never closed then every unclosed operation will leak.
       */
      close() {
        return __awaiter(this, void 0, void 0, function* () {
          return this.operation.close();
        });
      }
      on(event, listener) {
        super.on(event, listener);
        return this;
      }
      _onStreamMessageEvent(eventData) {
        if (this.responseHandled) {
          try {
            let streamingMessage = deserializeInboundMessage(this.serviceModel, this.operationConfig.name, eventData.message);
            setImmediate(() => {
              this.emit(_StreamingOperation.MESSAGE, streamingMessage);
            });
          } catch (err) {
            setImmediate(() => {
              this.emit(_StreamingOperation.STREAM_ERROR, err);
            });
          }
        }
      }
      _onStreamEndedEvent(eventData) {
        setImmediate(() => __awaiter(this, void 0, void 0, function* () {
          this.emit(_StreamingOperation.ENDED, {});
          yield this.close();
        }));
      }
    };
    exports2.StreamingOperation = StreamingOperation;
    StreamingOperation.ENDED = "ended";
    StreamingOperation.STREAM_ERROR = "streamError";
    StreamingOperation.MESSAGE = "message";
    function createRpcError(type, description, internalError, serviceError) {
      return new RpcError({
        type,
        description,
        internalError,
        serviceError
      });
    }
    exports2.createRpcError = createRpcError;
    var SERVICE_MODEL_TYPE_HEADER_NAME = "service-model-type";
    var CONTENT_TYPE_HEADER_NAME = ":content-type";
    var CONTENT_TYPE_PLAIN_TEXT = "text/plain";
    function getEventStreamMessageHeaderValueAsString(message, headerName) {
      if (!message.headers) {
        return void 0;
      }
      try {
        for (const header of message.headers) {
          if (header.name === headerName) {
            return header.asString();
          }
        }
      } catch (err) {
        return void 0;
      }
      return void 0;
    }
    function validateShape(model, shapeName, shape) {
      if (!shape) {
        throw createRpcError(RpcErrorType.ValidationError, `Shape of type '${shapeName}' is undefined`);
      }
      let validator = model.validators.get(shapeName);
      if (!validator) {
        throw createRpcError(RpcErrorType.ValidationError, `No shape named '${shapeName}' exists in the service model`);
      }
      validator(shape);
    }
    function validateOperationShape(model, operationName, shape, shapeSelector) {
      let operation = model.operations.get(operationName);
      if (!operation) {
        throw createRpcError(RpcErrorType.InternalError, `No operation named '${operationName}' exists in the service model`);
      }
      let selectedShape = shapeSelector(operation);
      if (!selectedShape) {
        throw createRpcError(RpcErrorType.ValidationError, `Operation '${operationName}' does not have a defined selection shape`);
      }
      return validateShape(model, selectedShape, shape);
    }
    function validateRequest(model, operationName, request) {
      validateOperationShape(model, operationName, request, (operation) => {
        return operation.requestShape;
      });
    }
    function validateOutboundMessage(model, operationName, message) {
      validateOperationShape(model, operationName, message, (operation) => {
        return operation.outboundMessageShape;
      });
    }
    function doesOperationAllowOutboundMessages(model, operationName) {
      let operation = model.operations.get(operationName);
      if (!operation) {
        throw createRpcError(RpcErrorType.InternalError, `No operation named '${operationName}' exists in the service model`);
      }
      return operation.outboundMessageShape !== void 0;
    }
    function serializeMessage(model, operationName, message, shapeSelector) {
      let operation = model.operations.get(operationName);
      if (!operation) {
        throw createRpcError(RpcErrorType.InternalError, `No operation named '${operationName}' exists in the service model`);
      }
      let shapeName = shapeSelector(operation);
      if (!shapeName) {
        throw createRpcError(RpcErrorType.InternalError, `Operation '${operationName}' does not have a defined selection shape`);
      }
      let serializer = model.serializers.get(shapeName);
      if (!serializer) {
        throw createRpcError(RpcErrorType.InternalError, `No top-level shape serializer for '${shapeName}' exists in the service model`);
      }
      return serializer(message);
    }
    function serializeRequest(model, operationName, request) {
      return serializeMessage(model, operationName, request, (operation) => {
        return operation.requestShape;
      });
    }
    function serializeOutboundMessage(model, operationName, message) {
      return serializeMessage(model, operationName, message, (operation) => {
        return operation.outboundMessageShape;
      });
    }
    function throwResponseError(model, errorShapes, shapeName, message) {
      if (!shapeName) {
        if (message.type != aws_crt_1.eventstream.MessageType.ApplicationMessage) {
          if (message.type == aws_crt_1.eventstream.MessageType.ApplicationError) {
            let contentType = getEventStreamMessageHeaderValueAsString(message, CONTENT_TYPE_HEADER_NAME);
            if (contentType && contentType === CONTENT_TYPE_PLAIN_TEXT) {
              let payloadAsString = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
              ;
              throw createRpcError(RpcErrorType.InternalError, `Eventstream (response) message was not a modelled shape.  Plain text payload is: '${payloadAsString}'`);
            }
          }
        }
        throw createRpcError(RpcErrorType.InternalError, "Eventstream (response) message was not an application message");
      }
      let isErrorShape = errorShapes.has(shapeName);
      let serviceError = void 0;
      if (isErrorShape) {
        let errorDeserializer = model.deserializers.get(shapeName);
        if (errorDeserializer) {
          serviceError = errorDeserializer(message);
        }
      }
      let errorType = serviceError ? RpcErrorType.ServiceError : RpcErrorType.InternalError;
      let errorDescription = serviceError ? "Eventstream RPC request failed.  Check serviceError property for details." : `Unexpected response shape received: '${shapeName}'`;
      let rpcError = createRpcError(errorType, errorDescription, void 0, serviceError);
      throw rpcError;
    }
    function deserializeMessage(model, operationName, message, shapeSelector) {
      let operation = model.operations.get(operationName);
      if (!operation) {
        throw createRpcError(RpcErrorType.InternalError, `No operation named '${operationName}' exists in the service model`);
      }
      let messageShape = getEventStreamMessageHeaderValueAsString(message, SERVICE_MODEL_TYPE_HEADER_NAME);
      let operationShape = shapeSelector(operation);
      if (!messageShape || messageShape !== operationShape || !operationShape) {
        throwResponseError(model, operation.errorShapes, messageShape, message);
        return;
      }
      let deserializer = model.deserializers.get(operationShape);
      if (!deserializer) {
        throw createRpcError(RpcErrorType.InternalError, `No top-level shape deserializer for '${operationShape}' exists in the service model`);
      }
      let response = deserializer(message);
      return response;
    }
    function deserializeResponse(model, operationName, message) {
      return deserializeMessage(model, operationName, message, (operation) => {
        return operation.responseShape;
      });
    }
    function deserializeInboundMessage(model, operationName, message) {
      return deserializeMessage(model, operationName, message, (operation) => {
        return operation.inboundMessageShape;
      });
    }
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/greengrass/model.js
var require_model = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/greengrass/model.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DiscoverResponse = exports2.GGGroup = exports2.GGCore = exports2.ConnectivityInfo = void 0;
    var util_1 = require("util");
    var ConnectivityInfo = class _ConnectivityInfo {
      constructor(id, host_address, port, metadata) {
        this.id = id;
        this.host_address = host_address;
        this.port = port;
        this.metadata = metadata;
      }
      /** @internal */
      static from_json(json) {
        return new _ConnectivityInfo(json.Id, json.HostAddress, json.PortNumber, json.Metadata);
      }
    };
    exports2.ConnectivityInfo = ConnectivityInfo;
    var GGCore = class _GGCore {
      constructor(thing_arn, connectivity) {
        this.thing_arn = thing_arn;
        this.connectivity = connectivity;
      }
      /** @internal */
      static from_json(json) {
        const connectivity = [];
        if (json.Connectivity && (0, util_1.isArray)(json.Connectivity)) {
          json.Connectivity.forEach((payload) => {
            connectivity.push(ConnectivityInfo.from_json(payload));
          });
        }
        return new _GGCore(json.thingArn, connectivity);
      }
    };
    exports2.GGCore = GGCore;
    var GGGroup = class _GGGroup {
      constructor(gg_group_id, cores = [], certificate_authorities = []) {
        this.gg_group_id = gg_group_id;
        this.cores = cores;
        this.certificate_authorities = certificate_authorities;
      }
      /** @internal */
      static from_json(json) {
        const cores = [];
        if (json.Cores && (0, util_1.isArray)(json.Cores)) {
          json.Cores.forEach((payload) => {
            cores.push(GGCore.from_json(payload));
          });
        }
        return new _GGGroup(json.GGGroupId, cores, json.CAs);
      }
    };
    exports2.GGGroup = GGGroup;
    var DiscoverResponse = class _DiscoverResponse {
      constructor(gg_groups = []) {
        this.gg_groups = gg_groups;
      }
      /** @internal */
      static from_json(json) {
        const groups = [];
        if (json.GGGroups && (0, util_1.isArray)(json.GGGroups)) {
          json.GGGroups.forEach((payload) => {
            groups.push(GGGroup.from_json(payload));
          });
        }
        return new _DiscoverResponse(groups);
      }
    };
    exports2.DiscoverResponse = DiscoverResponse;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/greengrass/discoveryclient.js
var require_discoveryclient = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/greengrass/discoveryclient.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DiscoveryClient = exports2.DiscoveryError = exports2.model = void 0;
    var aws_crt_1 = require_dist();
    var util_utf8_browser_1 = require_dist_cjs();
    var model = __importStar(require_model());
    exports2.model = model;
    var DiscoveryError = class extends Error {
      constructor(message, response_code) {
        super(message);
        this.response_code = response_code;
      }
    };
    exports2.DiscoveryError = DiscoveryError;
    var DiscoveryClient = class {
      /**
       *
       * @param bootstrap The `ClientBootstrap` to use to make an HTTP connection to the Greengrass service
       * @param socket_options `SocketOptions` for HTTP connection to the Greengrass service
       * @param tls_ctx TLS Options for the HTTP connection to Greengrass service
       * @param region Region to send Greengrass discovery requests to (ignored if gg_server_name is set)
       * @param gg_server_name Optional name of greengrass endpoint
       */
      constructor(bootstrap, socket_options, tls_ctx, region, gg_server_name = "") {
        this.bootstrap = bootstrap;
        this.socket_options = socket_options;
        this.tls_ctx = tls_ctx;
        this.region = region;
        this.gg_server_name = gg_server_name;
        if (this.gg_server_name !== "") {
          this.endpoint = this.gg_server_name;
        } else {
          this.endpoint = `greengrass-ats.iot.${region}.amazonaws.com`;
        }
        this.connection_manager = new aws_crt_1.http.HttpClientConnectionManager(this.bootstrap, this.endpoint, aws_crt_1.io.is_alpn_available() ? 443 : 8443, 4, 16 * 1024, this.socket_options, new aws_crt_1.io.TlsConnectionOptions(this.tls_ctx, this.endpoint, aws_crt_1.io.is_alpn_available() ? ["x-amzn-http-ca"] : void 0));
      }
      /**
       * Performs the discover API call for the supplied Thing, and returns any associated Greengrass
       * groups/cores/connection info.
       *
       * @param thing_name The name of your IoT Thing, as configured in the console for Greengrass
       */
      discover(thing_name) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
          this.connection_manager.acquire().then((connection2) => {
            const request = new aws_crt_1.http.HttpRequest("GET", `/greengrass/discover/thing/${thing_name}`, new aws_crt_1.http.HttpHeaders([["host", this.endpoint]]));
            const stream = connection2.request(request);
            let response = "";
            stream.on("response", (status_code, headers) => {
              if (status_code != 200) {
                reject(new DiscoveryError(`Discovery failed (headers: ${headers})`, status_code));
              }
            });
            stream.on("data", (body_data) => {
              response += (0, util_utf8_browser_1.toUtf8)(new Uint8Array(body_data));
            });
            stream.on("end", () => {
              const json = JSON.parse(response);
              const discover_response = model.DiscoverResponse.from_json(json);
              resolve(discover_response);
            });
            stream.on("error", (error) => {
              reject(new DiscoveryError(error.toString()));
            });
            stream.activate();
          }).catch((reason) => {
            reject(new aws_crt_1.CrtError(reason));
          });
        }));
      }
    };
    exports2.DiscoveryClient = DiscoveryClient;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/greengrasscoreipc/model.js
var require_model2 = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/greengrasscoreipc/model.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.QOS = exports2.ReceiveMode = exports2.ReportedLifecycleState = exports2.RequestStatus = exports2.FailureHandlingPolicy = exports2.CertificateType = exports2.ConfigurationValidityStatus = exports2.PayloadFormat = exports2.MetricUnitType = exports2.LifecycleState = exports2.DeploymentStatus = exports2.DetailedDeploymentStatus = void 0;
    var DetailedDeploymentStatus;
    (function(DetailedDeploymentStatus2) {
      DetailedDeploymentStatus2["SUCCESSFUL"] = "SUCCESSFUL";
      DetailedDeploymentStatus2["FAILED_NO_STATE_CHANGE"] = "FAILED_NO_STATE_CHANGE";
      DetailedDeploymentStatus2["FAILED_ROLLBACK_NOT_REQUESTED"] = "FAILED_ROLLBACK_NOT_REQUESTED";
      DetailedDeploymentStatus2["FAILED_ROLLBACK_COMPLETE"] = "FAILED_ROLLBACK_COMPLETE";
      DetailedDeploymentStatus2["REJECTED"] = "REJECTED";
    })(DetailedDeploymentStatus = exports2.DetailedDeploymentStatus || (exports2.DetailedDeploymentStatus = {}));
    var DeploymentStatus;
    (function(DeploymentStatus2) {
      DeploymentStatus2["QUEUED"] = "QUEUED";
      DeploymentStatus2["IN_PROGRESS"] = "IN_PROGRESS";
      DeploymentStatus2["SUCCEEDED"] = "SUCCEEDED";
      DeploymentStatus2["FAILED"] = "FAILED";
      DeploymentStatus2["CANCELED"] = "CANCELED";
    })(DeploymentStatus = exports2.DeploymentStatus || (exports2.DeploymentStatus = {}));
    var LifecycleState;
    (function(LifecycleState2) {
      LifecycleState2["RUNNING"] = "RUNNING";
      LifecycleState2["ERRORED"] = "ERRORED";
      LifecycleState2["NEW"] = "NEW";
      LifecycleState2["FINISHED"] = "FINISHED";
      LifecycleState2["INSTALLED"] = "INSTALLED";
      LifecycleState2["BROKEN"] = "BROKEN";
      LifecycleState2["STARTING"] = "STARTING";
      LifecycleState2["STOPPING"] = "STOPPING";
    })(LifecycleState = exports2.LifecycleState || (exports2.LifecycleState = {}));
    var MetricUnitType;
    (function(MetricUnitType2) {
      MetricUnitType2["BYTES"] = "BYTES";
      MetricUnitType2["BYTES_PER_SECOND"] = "BYTES_PER_SECOND";
      MetricUnitType2["COUNT"] = "COUNT";
      MetricUnitType2["COUNT_PER_SECOND"] = "COUNT_PER_SECOND";
      MetricUnitType2["MEGABYTES"] = "MEGABYTES";
      MetricUnitType2["SECONDS"] = "SECONDS";
    })(MetricUnitType = exports2.MetricUnitType || (exports2.MetricUnitType = {}));
    var PayloadFormat;
    (function(PayloadFormat2) {
      PayloadFormat2["BYTES"] = "0";
      PayloadFormat2["UTF8"] = "1";
    })(PayloadFormat = exports2.PayloadFormat || (exports2.PayloadFormat = {}));
    var ConfigurationValidityStatus;
    (function(ConfigurationValidityStatus2) {
      ConfigurationValidityStatus2["ACCEPTED"] = "ACCEPTED";
      ConfigurationValidityStatus2["REJECTED"] = "REJECTED";
    })(ConfigurationValidityStatus = exports2.ConfigurationValidityStatus || (exports2.ConfigurationValidityStatus = {}));
    var CertificateType;
    (function(CertificateType2) {
      CertificateType2["SERVER"] = "SERVER";
    })(CertificateType = exports2.CertificateType || (exports2.CertificateType = {}));
    var FailureHandlingPolicy;
    (function(FailureHandlingPolicy2) {
      FailureHandlingPolicy2["ROLLBACK"] = "ROLLBACK";
      FailureHandlingPolicy2["DO_NOTHING"] = "DO_NOTHING";
    })(FailureHandlingPolicy = exports2.FailureHandlingPolicy || (exports2.FailureHandlingPolicy = {}));
    var RequestStatus;
    (function(RequestStatus2) {
      RequestStatus2["SUCCEEDED"] = "SUCCEEDED";
      RequestStatus2["FAILED"] = "FAILED";
    })(RequestStatus = exports2.RequestStatus || (exports2.RequestStatus = {}));
    var ReportedLifecycleState;
    (function(ReportedLifecycleState2) {
      ReportedLifecycleState2["RUNNING"] = "RUNNING";
      ReportedLifecycleState2["ERRORED"] = "ERRORED";
    })(ReportedLifecycleState = exports2.ReportedLifecycleState || (exports2.ReportedLifecycleState = {}));
    var ReceiveMode;
    (function(ReceiveMode2) {
      ReceiveMode2["RECEIVE_ALL_MESSAGES"] = "RECEIVE_ALL_MESSAGES";
      ReceiveMode2["RECEIVE_MESSAGES_FROM_OTHERS"] = "RECEIVE_MESSAGES_FROM_OTHERS";
    })(ReceiveMode = exports2.ReceiveMode || (exports2.ReceiveMode = {}));
    var QOS;
    (function(QOS2) {
      QOS2["AT_MOST_ONCE"] = "0";
      QOS2["AT_LEAST_ONCE"] = "1";
    })(QOS = exports2.QOS || (exports2.QOS = {}));
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/eventstream_rpc_utils.js
var require_eventstream_rpc_utils = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/eventstream_rpc_utils.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateValueAsUnion = exports2.validateValueAsOptionalObject = exports2.validateValueAsObject = exports2.validateValueAsOptionalMap = exports2.validateValueAsMap = exports2.validateValueAsOptionalArray = exports2.validateValueAsArray = exports2.validateValueAsOptionalAny = exports2.validateValueAsAny = exports2.validateValueAsOptionalBlob = exports2.validateValueAsBlob = exports2.validateValueAsOptionalDate = exports2.validateValueAsDate = exports2.validateValueAsOptionalBoolean = exports2.validateValueAsBoolean = exports2.validateValueAsOptionalInteger = exports2.validateValueAsInteger = exports2.validateValueAsOptionalNumber = exports2.validateValueAsNumber = exports2.validateValueAsOptionalString = exports2.validateValueAsString = exports2.setDefinedObjectPropertyAsMap = exports2.setDefinedMapPropertyAsObject = exports2.normalizeMapValueAsObject = exports2.setDefinedArrayProperty = exports2.normalizeArrayValue = exports2.setDefinedProperty = exports2.transformNumberAsDate = exports2.encodeDateAsNumber = exports2.transformStringAsPayload = exports2.encodePayloadAsString = void 0;
    var eventstream_rpc = __importStar(require_eventstream_rpc());
    var aws_crt_1 = require_dist();
    function encodePayloadAsString(payload) {
      if (typeof payload === "string") {
        return Buffer.from(payload).toString("base64");
      }
      if (ArrayBuffer.isView(payload)) {
        const view = payload;
        return Buffer.from(view.buffer, view.byteOffset, view.byteLength).toString("base64");
      }
      if (payload instanceof ArrayBuffer) {
        let buffer = payload;
        return Buffer.from(buffer).toString("base64");
      }
      throw new TypeError("payload parameter must be a string, ArrayBuffer, or DataView.");
    }
    exports2.encodePayloadAsString = encodePayloadAsString;
    function transformStringAsPayload(value) {
      return Buffer.from(value, "base64");
    }
    exports2.transformStringAsPayload = transformStringAsPayload;
    function encodeDateAsNumber(date) {
      return date.getTime() / 1e3;
    }
    exports2.encodeDateAsNumber = encodeDateAsNumber;
    function transformNumberAsDate(value) {
      return new Date(value * 1e3);
    }
    exports2.transformNumberAsDate = transformNumberAsDate;
    function setDefinedProperty(object, propertyName, value, transformer) {
      if (value === void 0 || value == null) {
        return;
      }
      if (transformer) {
        object[propertyName] = transformer(value);
      } else {
        object[propertyName] = value;
      }
    }
    exports2.setDefinedProperty = setDefinedProperty;
    function normalizeArrayValue(value, transformer) {
      if (transformer == void 0) {
        return value;
      }
      let array = new Array();
      for (const element of value) {
        array.push(transformer(element));
      }
      return array;
    }
    exports2.normalizeArrayValue = normalizeArrayValue;
    function setDefinedArrayProperty(object, propertyName, value, transformer) {
      if (value === void 0 || value == null) {
        return;
      }
      object[propertyName] = normalizeArrayValue(value, transformer);
    }
    exports2.setDefinedArrayProperty = setDefinedArrayProperty;
    function normalizeMapValueAsObject(value, keyTransformer, valueTransformer) {
      let mapAsObject = {};
      for (const [key, val] of value.entries()) {
        let transformedKey = keyTransformer ? keyTransformer(key) : key;
        let transformedvalue = valueTransformer ? valueTransformer(val) : val;
        mapAsObject[transformedKey] = transformedvalue;
      }
      return mapAsObject;
    }
    exports2.normalizeMapValueAsObject = normalizeMapValueAsObject;
    function setDefinedMapPropertyAsObject(object, propertyName, value, keyTransformer, valueTransformer) {
      if (value === void 0 || value == null) {
        return;
      }
      object[propertyName] = normalizeMapValueAsObject(value);
    }
    exports2.setDefinedMapPropertyAsObject = setDefinedMapPropertyAsObject;
    function setDefinedObjectPropertyAsMap(object, propertyName, value, keyTransformer, valueTransformer) {
      if (value === void 0 || value == null) {
        return;
      }
      let map = /* @__PURE__ */ new Map();
      for (const property in value) {
        let transformedKey = keyTransformer ? keyTransformer(property) : property;
        let transformedValue = valueTransformer ? valueTransformer(value[property]) : value[property];
        map.set(transformedKey, transformedValue);
      }
      object[propertyName] = map;
    }
    exports2.setDefinedObjectPropertyAsMap = setDefinedObjectPropertyAsMap;
    function throwMissingPropertyError(propertyName, type) {
      if (propertyName && type) {
        throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Missing required property '${propertyName}' of type '${type}'`);
      } else {
        throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Missing required property`);
      }
    }
    function throwInvalidPropertyValueError(valueDescription, propertyName, type) {
      if (propertyName && type) {
        throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Property '${propertyName}' of type '${type}' must be ${valueDescription}`);
      } else {
        throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Property must be ${valueDescription}`);
      }
    }
    function validateValueAsString(value, propertyName, type) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName, type);
      }
      if (typeof value !== "string") {
        throwInvalidPropertyValueError("a string value", propertyName, type);
      }
    }
    exports2.validateValueAsString = validateValueAsString;
    function validateValueAsOptionalString(value, propertyName, type) {
      if (value === void 0) {
        return;
      }
      validateValueAsString(value, propertyName, type);
    }
    exports2.validateValueAsOptionalString = validateValueAsOptionalString;
    function validateValueAsNumber(value, propertyName, type) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName, type);
      }
      if (typeof value !== "number") {
        throwInvalidPropertyValueError("a number value", propertyName, type);
      }
    }
    exports2.validateValueAsNumber = validateValueAsNumber;
    function validateValueAsOptionalNumber(value, propertyName, type) {
      if (value === void 0) {
        return;
      }
      validateValueAsNumber(value, propertyName, type);
    }
    exports2.validateValueAsOptionalNumber = validateValueAsOptionalNumber;
    function validateValueAsInteger(value, propertyName, type) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName, type);
      }
      if (typeof value !== "number" || !Number.isSafeInteger(value)) {
        throwInvalidPropertyValueError("an integer value", propertyName, type);
      }
    }
    exports2.validateValueAsInteger = validateValueAsInteger;
    function validateValueAsOptionalInteger(value, propertyName, type) {
      if (value === void 0) {
        return;
      }
      validateValueAsInteger(value, propertyName, type);
    }
    exports2.validateValueAsOptionalInteger = validateValueAsOptionalInteger;
    function validateValueAsBoolean(value, propertyName, type) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName, type);
      }
      if (typeof value !== "boolean") {
        throwInvalidPropertyValueError("a boolean value", propertyName, type);
      }
    }
    exports2.validateValueAsBoolean = validateValueAsBoolean;
    function validateValueAsOptionalBoolean(value, propertyName, type) {
      if (value === void 0) {
        return;
      }
      validateValueAsBoolean(value, propertyName, type);
    }
    exports2.validateValueAsOptionalBoolean = validateValueAsOptionalBoolean;
    function validateValueAsDate(value, propertyName, type) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName, type);
      }
      if (!(value instanceof Date) || isNaN(value.getTime())) {
        throwInvalidPropertyValueError("a Date value", propertyName, type);
      }
    }
    exports2.validateValueAsDate = validateValueAsDate;
    function validateValueAsOptionalDate(value, propertyName, type) {
      if (value === void 0) {
        return;
      }
      validateValueAsDate(value, propertyName, type);
    }
    exports2.validateValueAsOptionalDate = validateValueAsOptionalDate;
    function validateValueAsBlob(value, propertyName, type) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName, type);
      }
      if (typeof value !== "string" && !ArrayBuffer.isView(value) && (!value.byteLength || !value.maxByteLength)) {
        throwInvalidPropertyValueError("a value convertible to a binary payload", propertyName, type);
      }
    }
    exports2.validateValueAsBlob = validateValueAsBlob;
    function validateValueAsOptionalBlob(value, propertyName, type) {
      if (value === void 0) {
        return;
      }
      validateValueAsBlob(value, propertyName, type);
    }
    exports2.validateValueAsOptionalBlob = validateValueAsOptionalBlob;
    function validateValueAsAny(value, propertyName, type) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName, type);
      }
    }
    exports2.validateValueAsAny = validateValueAsAny;
    function validateValueAsOptionalAny(value, propertyName, type) {
      if (value === void 0) {
        return;
      }
      validateValueAsAny(value, propertyName, type);
    }
    exports2.validateValueAsOptionalAny = validateValueAsOptionalAny;
    function validateValueAsArray(value, elementValidator, propertyName, type) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName, type);
      }
      if (!Array.isArray(value)) {
        throwInvalidPropertyValueError("an array value", propertyName, type);
      }
      for (const element of value) {
        try {
          elementValidator(element);
        } catch (err) {
          let rpcError = err;
          if (propertyName && type) {
            throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Array property '${propertyName}' of type '${type}' contains an invalid value`, new aws_crt_1.CrtError(rpcError.toString()));
          } else {
            throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Array contains an invalid value`, new aws_crt_1.CrtError(rpcError.toString()));
          }
        }
      }
    }
    exports2.validateValueAsArray = validateValueAsArray;
    function validateValueAsOptionalArray(value, elementValidator, propertyName, type) {
      if (value === void 0) {
        return;
      }
      validateValueAsArray(value, elementValidator, propertyName, type);
    }
    exports2.validateValueAsOptionalArray = validateValueAsOptionalArray;
    function validateValueAsMap(value, keyValidator, valueValidator, propertyName, type) {
      if (value === void 0) {
        return;
      }
      if (!(value instanceof Map)) {
        throwInvalidPropertyValueError("a map value", propertyName, type);
      }
      let valueAsMap = value;
      for (const [key, val] of valueAsMap) {
        try {
          keyValidator(key);
        } catch (err) {
          let rpcError = err;
          if (propertyName && type) {
            throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Map property '${propertyName}' of type '${type}' contains an invalid key`, new aws_crt_1.CrtError(rpcError.toString()));
          } else {
            throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Map contains an invalid key`, new aws_crt_1.CrtError(rpcError.toString()));
          }
        }
        try {
          valueValidator(val);
        } catch (err) {
          let rpcError = err;
          if (propertyName && type) {
            throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Map property '${propertyName}' of type '${type}' contains an invalid value`, new aws_crt_1.CrtError(rpcError.toString()));
          } else {
            throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Map contains an invalid value`, new aws_crt_1.CrtError(rpcError.toString()));
          }
        }
      }
    }
    exports2.validateValueAsMap = validateValueAsMap;
    function validateValueAsOptionalMap(value, keyValidator, valueValidator, propertyName, type) {
      if (value === void 0) {
        return;
      }
      validateValueAsMap(value, keyValidator, valueValidator, propertyName, type);
    }
    exports2.validateValueAsOptionalMap = validateValueAsOptionalMap;
    function validateValueAsObject(value, elementValidator, propertyName, type) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName, type);
      }
      try {
        elementValidator(value);
      } catch (err) {
        let rpcError = err;
        throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Property '${propertyName}' of type '${type}' contains an invalid value`, new aws_crt_1.CrtError(rpcError.toString()));
      }
    }
    exports2.validateValueAsObject = validateValueAsObject;
    function validateValueAsOptionalObject(value, elementValidator, propertyName, type) {
      if (value === void 0) {
        return;
      }
      validateValueAsObject(value, elementValidator, propertyName, type);
    }
    exports2.validateValueAsOptionalObject = validateValueAsOptionalObject;
    function getPropertyCount(value, propertyNames) {
      let propertyCount = 0;
      for (const propertyName of propertyNames) {
        if (value.hasOwnProperty(propertyName)) {
          propertyCount += 1;
        }
      }
      return propertyCount;
    }
    function validateValueAsUnion(value, validators) {
      let propertyCount = getPropertyCount(value, validators.keys());
      if (propertyCount != 1) {
        throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Union has ${propertyCount} properties set`);
      }
      for (const [propertyName, validator] of validators.entries()) {
        let propertyValue = value[propertyName];
        if (propertyValue && validator) {
          try {
            validator(propertyValue);
          } catch (err) {
            let rpcError = err;
            throw eventstream_rpc.createRpcError(eventstream_rpc.RpcErrorType.ValidationError, `Union property '${propertyName}' contains an invalid value`, new aws_crt_1.CrtError(rpcError.toString()));
          }
        }
      }
    }
    exports2.validateValueAsUnion = validateValueAsUnion;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/greengrasscoreipc/model_utils.js
var require_model_utils = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/greengrasscoreipc/model_utils.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.normalizeCancelLocalDeploymentResponse = exports2.normalizeListNamedShadowsForThingRequest = exports2.normalizeListNamedShadowsForThingResponse = exports2.normalizeSubscribeToComponentUpdatesRequest = exports2.normalizeSubscribeToComponentUpdatesResponse = exports2.normalizeListLocalDeploymentsRequest = exports2.normalizeListLocalDeploymentsResponse = exports2.normalizeStopComponentRequest = exports2.normalizeStopComponentResponse = exports2.normalizeComponentNotFoundError = exports2.normalizePauseComponentRequest = exports2.normalizePauseComponentResponse = exports2.normalizeUnauthorizedError = exports2.normalizeResourceNotFoundError = exports2.normalizeCreateLocalDeploymentRequest = exports2.normalizeCreateLocalDeploymentResponse = exports2.normalizeServiceError = exports2.normalizeInvalidRecipeDirectoryPathError = exports2.normalizeInvalidArtifactsDirectoryPathError = exports2.normalizeInvalidArgumentsError = exports2.normalizeIoTCoreMessage = exports2.normalizeConfigurationUpdateEvents = exports2.normalizeValidateConfigurationUpdateEvents = exports2.normalizeSubscriptionResponseMessage = exports2.normalizeCredentialDocument = exports2.normalizePublishMessage = exports2.normalizeCertificateOptions = exports2.normalizeCertificateUpdateEvent = exports2.normalizeClientDeviceCredential = exports2.normalizeConfigurationValidityReport = exports2.normalizeSecretValue = exports2.normalizeComponentUpdatePolicyEvents = exports2.normalizeMQTTMessage = exports2.normalizeConfigurationUpdateEvent = exports2.normalizeMetric = exports2.normalizeValidateConfigurationUpdateEvent = exports2.normalizeMQTTCredential = exports2.normalizeJsonMessage = exports2.normalizeBinaryMessage = exports2.normalizeCertificateUpdate = exports2.normalizeComponentDetails = exports2.normalizePreComponentUpdateEvent = exports2.normalizePostComponentUpdateEvent = exports2.normalizeLocalDeployment = exports2.normalizeRunWithInfo = exports2.normalizeMessageContext = exports2.normalizeDeploymentStatusDetails = exports2.normalizeSystemResourceLimits = exports2.normalizeUserProperty = exports2.makeServiceModel = void 0;
    exports2.normalizePutComponentMetricRequest = exports2.normalizePutComponentMetricResponse = exports2.normalizeDeferComponentUpdateRequest = exports2.normalizeDeferComponentUpdateResponse = exports2.normalizeSubscribeToValidateConfigurationUpdatesRequest = exports2.normalizeSubscribeToValidateConfigurationUpdatesResponse = exports2.normalizeGetConfigurationRequest = exports2.normalizeGetConfigurationResponse = exports2.normalizeSubscribeToTopicRequest = exports2.normalizeSubscribeToTopicResponse = exports2.normalizeGetComponentDetailsRequest = exports2.normalizeGetComponentDetailsResponse = exports2.normalizeGetClientDeviceAuthTokenRequest = exports2.normalizeGetClientDeviceAuthTokenResponse = exports2.normalizeInvalidCredentialError = exports2.normalizePublishToTopicRequest = exports2.normalizePublishToTopicResponse = exports2.normalizeSubscribeToCertificateUpdatesRequest = exports2.normalizeSubscribeToCertificateUpdatesResponse = exports2.normalizeVerifyClientDeviceIdentityRequest = exports2.normalizeVerifyClientDeviceIdentityResponse = exports2.normalizeAuthorizeClientDeviceActionRequest = exports2.normalizeAuthorizeClientDeviceActionResponse = exports2.normalizeInvalidClientDeviceAuthTokenError = exports2.normalizeListComponentsRequest = exports2.normalizeListComponentsResponse = exports2.normalizeCreateDebugPasswordRequest = exports2.normalizeCreateDebugPasswordResponse = exports2.normalizeGetThingShadowRequest = exports2.normalizeGetThingShadowResponse = exports2.normalizeSendConfigurationValidityReportRequest = exports2.normalizeSendConfigurationValidityReportResponse = exports2.normalizeUpdateThingShadowRequest = exports2.normalizeUpdateThingShadowResponse = exports2.normalizeUpdateConfigurationRequest = exports2.normalizeUpdateConfigurationResponse = exports2.normalizeConflictError = exports2.normalizeFailedUpdateConditionCheckError = exports2.normalizeValidateAuthorizationTokenRequest = exports2.normalizeValidateAuthorizationTokenResponse = exports2.normalizeInvalidTokenError = exports2.normalizeRestartComponentRequest = exports2.normalizeRestartComponentResponse = exports2.normalizeGetLocalDeploymentStatusRequest = exports2.normalizeGetLocalDeploymentStatusResponse = exports2.normalizeGetSecretValueRequest = exports2.normalizeGetSecretValueResponse = exports2.normalizeUpdateStateRequest = exports2.normalizeUpdateStateResponse = exports2.normalizeCancelLocalDeploymentRequest = void 0;
    exports2.validateComponentNotFoundError = exports2.validatePauseComponentRequest = exports2.validatePauseComponentResponse = exports2.validateUnauthorizedError = exports2.validateResourceNotFoundError = exports2.validateCreateLocalDeploymentRequest = exports2.validateCreateLocalDeploymentResponse = exports2.validateServiceError = exports2.validateInvalidRecipeDirectoryPathError = exports2.validateInvalidArtifactsDirectoryPathError = exports2.validateInvalidArgumentsError = exports2.validateIoTCoreMessage = exports2.validateConfigurationUpdateEvents = exports2.validateValidateConfigurationUpdateEvents = exports2.validateSubscriptionResponseMessage = exports2.validateCredentialDocument = exports2.validatePublishMessage = exports2.validateCertificateOptions = exports2.validateCertificateUpdateEvent = exports2.validateClientDeviceCredential = exports2.validateConfigurationValidityReport = exports2.validateSecretValue = exports2.validateComponentUpdatePolicyEvents = exports2.validateMQTTMessage = exports2.validateConfigurationUpdateEvent = exports2.validateMetric = exports2.validateValidateConfigurationUpdateEvent = exports2.validateMQTTCredential = exports2.validateJsonMessage = exports2.validateBinaryMessage = exports2.validateCertificateUpdate = exports2.validateComponentDetails = exports2.validatePreComponentUpdateEvent = exports2.validatePostComponentUpdateEvent = exports2.validateLocalDeployment = exports2.validateRunWithInfo = exports2.validateMessageContext = exports2.validateDeploymentStatusDetails = exports2.validateSystemResourceLimits = exports2.validateUserProperty = exports2.normalizeSubscribeToIoTCoreRequest = exports2.normalizeSubscribeToIoTCoreResponse = exports2.normalizeResumeComponentRequest = exports2.normalizeResumeComponentResponse = exports2.normalizePublishToIoTCoreRequest = exports2.normalizePublishToIoTCoreResponse = exports2.normalizeSubscribeToConfigurationUpdateRequest = exports2.normalizeSubscribeToConfigurationUpdateResponse = exports2.normalizeDeleteThingShadowRequest = exports2.normalizeDeleteThingShadowResponse = void 0;
    exports2.validateSubscribeToTopicResponse = exports2.validateGetComponentDetailsRequest = exports2.validateGetComponentDetailsResponse = exports2.validateGetClientDeviceAuthTokenRequest = exports2.validateGetClientDeviceAuthTokenResponse = exports2.validateInvalidCredentialError = exports2.validatePublishToTopicRequest = exports2.validatePublishToTopicResponse = exports2.validateSubscribeToCertificateUpdatesRequest = exports2.validateSubscribeToCertificateUpdatesResponse = exports2.validateVerifyClientDeviceIdentityRequest = exports2.validateVerifyClientDeviceIdentityResponse = exports2.validateAuthorizeClientDeviceActionRequest = exports2.validateAuthorizeClientDeviceActionResponse = exports2.validateInvalidClientDeviceAuthTokenError = exports2.validateListComponentsRequest = exports2.validateListComponentsResponse = exports2.validateCreateDebugPasswordRequest = exports2.validateCreateDebugPasswordResponse = exports2.validateGetThingShadowRequest = exports2.validateGetThingShadowResponse = exports2.validateSendConfigurationValidityReportRequest = exports2.validateSendConfigurationValidityReportResponse = exports2.validateUpdateThingShadowRequest = exports2.validateUpdateThingShadowResponse = exports2.validateUpdateConfigurationRequest = exports2.validateUpdateConfigurationResponse = exports2.validateConflictError = exports2.validateFailedUpdateConditionCheckError = exports2.validateValidateAuthorizationTokenRequest = exports2.validateValidateAuthorizationTokenResponse = exports2.validateInvalidTokenError = exports2.validateRestartComponentRequest = exports2.validateRestartComponentResponse = exports2.validateGetLocalDeploymentStatusRequest = exports2.validateGetLocalDeploymentStatusResponse = exports2.validateGetSecretValueRequest = exports2.validateGetSecretValueResponse = exports2.validateUpdateStateRequest = exports2.validateUpdateStateResponse = exports2.validateCancelLocalDeploymentRequest = exports2.validateCancelLocalDeploymentResponse = exports2.validateListNamedShadowsForThingRequest = exports2.validateListNamedShadowsForThingResponse = exports2.validateSubscribeToComponentUpdatesRequest = exports2.validateSubscribeToComponentUpdatesResponse = exports2.validateListLocalDeploymentsRequest = exports2.validateListLocalDeploymentsResponse = exports2.validateStopComponentRequest = exports2.validateStopComponentResponse = void 0;
    exports2.deserializeInvalidArtifactsDirectoryPathError = exports2.deserializeInvalidArgumentsError = exports2.deserializeIoTCoreMessage = exports2.deserializeConfigurationUpdateEvents = exports2.deserializeValidateConfigurationUpdateEvents = exports2.deserializeSubscriptionResponseMessage = exports2.deserializeCredentialDocument = exports2.deserializePublishMessage = exports2.deserializeCertificateOptions = exports2.deserializeCertificateUpdateEvent = exports2.deserializeClientDeviceCredential = exports2.deserializeConfigurationValidityReport = exports2.deserializeSecretValue = exports2.deserializeComponentUpdatePolicyEvents = exports2.deserializeMQTTMessage = exports2.deserializeConfigurationUpdateEvent = exports2.deserializeMetric = exports2.deserializeValidateConfigurationUpdateEvent = exports2.deserializeMQTTCredential = exports2.deserializeJsonMessage = exports2.deserializeBinaryMessage = exports2.deserializeCertificateUpdate = exports2.deserializeComponentDetails = exports2.deserializePreComponentUpdateEvent = exports2.deserializePostComponentUpdateEvent = exports2.deserializeLocalDeployment = exports2.deserializeRunWithInfo = exports2.deserializeMessageContext = exports2.deserializeDeploymentStatusDetails = exports2.deserializeSystemResourceLimits = exports2.deserializeUserProperty = exports2.validateSubscribeToIoTCoreRequest = exports2.validateSubscribeToIoTCoreResponse = exports2.validateResumeComponentRequest = exports2.validateResumeComponentResponse = exports2.validatePublishToIoTCoreRequest = exports2.validatePublishToIoTCoreResponse = exports2.validateSubscribeToConfigurationUpdateRequest = exports2.validateSubscribeToConfigurationUpdateResponse = exports2.validateDeleteThingShadowRequest = exports2.validateDeleteThingShadowResponse = exports2.validatePutComponentMetricRequest = exports2.validatePutComponentMetricResponse = exports2.validateDeferComponentUpdateRequest = exports2.validateDeferComponentUpdateResponse = exports2.validateSubscribeToValidateConfigurationUpdatesRequest = exports2.validateSubscribeToValidateConfigurationUpdatesResponse = exports2.validateGetConfigurationRequest = exports2.validateGetConfigurationResponse = exports2.validateSubscribeToTopicRequest = void 0;
    exports2.deserializeSubscribeToCertificateUpdatesResponse = exports2.deserializeVerifyClientDeviceIdentityRequest = exports2.deserializeVerifyClientDeviceIdentityResponse = exports2.deserializeAuthorizeClientDeviceActionRequest = exports2.deserializeAuthorizeClientDeviceActionResponse = exports2.deserializeInvalidClientDeviceAuthTokenError = exports2.deserializeListComponentsRequest = exports2.deserializeListComponentsResponse = exports2.deserializeCreateDebugPasswordRequest = exports2.deserializeCreateDebugPasswordResponse = exports2.deserializeGetThingShadowRequest = exports2.deserializeGetThingShadowResponse = exports2.deserializeSendConfigurationValidityReportRequest = exports2.deserializeSendConfigurationValidityReportResponse = exports2.deserializeUpdateThingShadowRequest = exports2.deserializeUpdateThingShadowResponse = exports2.deserializeUpdateConfigurationRequest = exports2.deserializeUpdateConfigurationResponse = exports2.deserializeConflictError = exports2.deserializeFailedUpdateConditionCheckError = exports2.deserializeValidateAuthorizationTokenRequest = exports2.deserializeValidateAuthorizationTokenResponse = exports2.deserializeInvalidTokenError = exports2.deserializeRestartComponentRequest = exports2.deserializeRestartComponentResponse = exports2.deserializeGetLocalDeploymentStatusRequest = exports2.deserializeGetLocalDeploymentStatusResponse = exports2.deserializeGetSecretValueRequest = exports2.deserializeGetSecretValueResponse = exports2.deserializeUpdateStateRequest = exports2.deserializeUpdateStateResponse = exports2.deserializeCancelLocalDeploymentRequest = exports2.deserializeCancelLocalDeploymentResponse = exports2.deserializeListNamedShadowsForThingRequest = exports2.deserializeListNamedShadowsForThingResponse = exports2.deserializeSubscribeToComponentUpdatesRequest = exports2.deserializeSubscribeToComponentUpdatesResponse = exports2.deserializeListLocalDeploymentsRequest = exports2.deserializeListLocalDeploymentsResponse = exports2.deserializeStopComponentRequest = exports2.deserializeStopComponentResponse = exports2.deserializeComponentNotFoundError = exports2.deserializePauseComponentRequest = exports2.deserializePauseComponentResponse = exports2.deserializeUnauthorizedError = exports2.deserializeResourceNotFoundError = exports2.deserializeCreateLocalDeploymentRequest = exports2.deserializeCreateLocalDeploymentResponse = exports2.deserializeServiceError = exports2.deserializeInvalidRecipeDirectoryPathError = void 0;
    exports2.deserializeEventstreamMessageToVerifyClientDeviceIdentityResponse = exports2.deserializeEventstreamMessageToSubscribeToComponentUpdatesResponse = exports2.deserializeEventstreamMessageToListComponentsResponse = exports2.deserializeEventstreamMessageToDeferComponentUpdateResponse = exports2.deserializeEventstreamMessageToUpdateStateResponse = exports2.deserializeEventstreamMessageToIoTCoreMessage = exports2.deserializeEventstreamMessageToComponentUpdatePolicyEvents = exports2.deserializeEventstreamMessageToPutComponentMetricResponse = exports2.deserializeEventstreamMessageToGetComponentDetailsResponse = exports2.deserializeEventstreamMessageToInvalidArgumentsError = exports2.deserializeEventstreamMessageToResumeComponentResponse = exports2.deserializeEventstreamMessageToListLocalDeploymentsResponse = exports2.deserializeEventstreamMessageToInvalidRecipeDirectoryPathError = exports2.deserializeEventstreamMessageToSubscribeToIoTCoreResponse = exports2.deserializeEventstreamMessageToGetSecretValueResponse = exports2.deserializeEventstreamMessageToCertificateUpdateEvent = exports2.deserializeEventstreamMessageToComponentNotFoundError = exports2.deserializeEventstreamMessageToListNamedShadowsForThingResponse = exports2.deserializeEventstreamMessageToFailedUpdateConditionCheckError = exports2.deserializeEventstreamMessageToSubscriptionResponseMessage = exports2.deserializeEventstreamMessageToCreateDebugPasswordResponse = exports2.deserializeEventstreamMessageToConflictError = exports2.deserializeSubscribeToIoTCoreRequest = exports2.deserializeSubscribeToIoTCoreResponse = exports2.deserializeResumeComponentRequest = exports2.deserializeResumeComponentResponse = exports2.deserializePublishToIoTCoreRequest = exports2.deserializePublishToIoTCoreResponse = exports2.deserializeSubscribeToConfigurationUpdateRequest = exports2.deserializeSubscribeToConfigurationUpdateResponse = exports2.deserializeDeleteThingShadowRequest = exports2.deserializeDeleteThingShadowResponse = exports2.deserializePutComponentMetricRequest = exports2.deserializePutComponentMetricResponse = exports2.deserializeDeferComponentUpdateRequest = exports2.deserializeDeferComponentUpdateResponse = exports2.deserializeSubscribeToValidateConfigurationUpdatesRequest = exports2.deserializeSubscribeToValidateConfigurationUpdatesResponse = exports2.deserializeGetConfigurationRequest = exports2.deserializeGetConfigurationResponse = exports2.deserializeSubscribeToTopicRequest = exports2.deserializeSubscribeToTopicResponse = exports2.deserializeGetComponentDetailsRequest = exports2.deserializeGetComponentDetailsResponse = exports2.deserializeGetClientDeviceAuthTokenRequest = exports2.deserializeGetClientDeviceAuthTokenResponse = exports2.deserializeInvalidCredentialError = exports2.deserializePublishToTopicRequest = exports2.deserializePublishToTopicResponse = exports2.deserializeSubscribeToCertificateUpdatesRequest = void 0;
    exports2.serializeSubscribeToTopicRequestToEventstreamMessage = exports2.serializeListComponentsRequestToEventstreamMessage = exports2.serializeGetSecretValueRequestToEventstreamMessage = exports2.serializeDeferComponentUpdateRequestToEventstreamMessage = exports2.serializeGetConfigurationRequestToEventstreamMessage = exports2.serializeDeleteThingShadowRequestToEventstreamMessage = exports2.serializePublishToIoTCoreRequestToEventstreamMessage = exports2.serializePauseComponentRequestToEventstreamMessage = exports2.serializeGetClientDeviceAuthTokenRequestToEventstreamMessage = exports2.serializeValidateAuthorizationTokenRequestToEventstreamMessage = exports2.serializeSendConfigurationValidityReportRequestToEventstreamMessage = exports2.serializeListLocalDeploymentsRequestToEventstreamMessage = exports2.serializeAuthorizeClientDeviceActionRequestToEventstreamMessage = exports2.serializeVerifyClientDeviceIdentityRequestToEventstreamMessage = exports2.serializeStopComponentRequestToEventstreamMessage = exports2.serializeResumeComponentRequestToEventstreamMessage = exports2.serializeUpdateThingShadowRequestToEventstreamMessage = exports2.serializeCreateDebugPasswordRequestToEventstreamMessage = exports2.serializePublishToTopicRequestToEventstreamMessage = exports2.serializeGetComponentDetailsRequestToEventstreamMessage = exports2.deserializeEventstreamMessageToCancelLocalDeploymentResponse = exports2.deserializeEventstreamMessageToValidateConfigurationUpdateEvents = exports2.deserializeEventstreamMessageToStopComponentResponse = exports2.deserializeEventstreamMessageToConfigurationUpdateEvents = exports2.deserializeEventstreamMessageToServiceError = exports2.deserializeEventstreamMessageToSubscribeToValidateConfigurationUpdatesResponse = exports2.deserializeEventstreamMessageToSubscribeToConfigurationUpdateResponse = exports2.deserializeEventstreamMessageToDeleteThingShadowResponse = exports2.deserializeEventstreamMessageToRestartComponentResponse = exports2.deserializeEventstreamMessageToUpdateConfigurationResponse = exports2.deserializeEventstreamMessageToSubscribeToCertificateUpdatesResponse = exports2.deserializeEventstreamMessageToUnauthorizedError = exports2.deserializeEventstreamMessageToPauseComponentResponse = exports2.deserializeEventstreamMessageToGetLocalDeploymentStatusResponse = exports2.deserializeEventstreamMessageToInvalidCredentialError = exports2.deserializeEventstreamMessageToGetConfigurationResponse = exports2.deserializeEventstreamMessageToAuthorizeClientDeviceActionResponse = exports2.deserializeEventstreamMessageToUpdateThingShadowResponse = exports2.deserializeEventstreamMessageToValidateAuthorizationTokenResponse = exports2.deserializeEventstreamMessageToPublishToTopicResponse = exports2.deserializeEventstreamMessageToCreateLocalDeploymentResponse = exports2.deserializeEventstreamMessageToGetClientDeviceAuthTokenResponse = exports2.deserializeEventstreamMessageToInvalidTokenError = exports2.deserializeEventstreamMessageToSubscribeToTopicResponse = exports2.deserializeEventstreamMessageToPublishToIoTCoreResponse = exports2.deserializeEventstreamMessageToInvalidClientDeviceAuthTokenError = exports2.deserializeEventstreamMessageToGetThingShadowResponse = exports2.deserializeEventstreamMessageToSendConfigurationValidityReportResponse = exports2.deserializeEventstreamMessageToInvalidArtifactsDirectoryPathError = exports2.deserializeEventstreamMessageToResourceNotFoundError = void 0;
    exports2.serializeUpdateStateRequestToEventstreamMessage = exports2.serializeSubscribeToIoTCoreRequestToEventstreamMessage = exports2.serializeGetThingShadowRequestToEventstreamMessage = exports2.serializeGetLocalDeploymentStatusRequestToEventstreamMessage = exports2.serializeUpdateConfigurationRequestToEventstreamMessage = exports2.serializeListNamedShadowsForThingRequestToEventstreamMessage = exports2.serializeRestartComponentRequestToEventstreamMessage = exports2.serializeSubscribeToComponentUpdatesRequestToEventstreamMessage = exports2.serializeSubscribeToConfigurationUpdateRequestToEventstreamMessage = exports2.serializePutComponentMetricRequestToEventstreamMessage = exports2.serializeCreateLocalDeploymentRequestToEventstreamMessage = exports2.serializeSubscribeToValidateConfigurationUpdatesRequestToEventstreamMessage = exports2.serializeSubscribeToCertificateUpdatesRequestToEventstreamMessage = exports2.serializeCancelLocalDeploymentRequestToEventstreamMessage = void 0;
    var eventstream_rpc_utils = __importStar(require_eventstream_rpc_utils());
    var aws_crt_1 = require_dist();
    var util_utf8_browser_1 = require_dist_cjs();
    function createNormalizerMap() {
      return /* @__PURE__ */ new Map([
        ["aws.greengrass#UserProperty", normalizeUserProperty],
        ["aws.greengrass#SystemResourceLimits", normalizeSystemResourceLimits],
        ["aws.greengrass#DeploymentStatusDetails", normalizeDeploymentStatusDetails],
        ["aws.greengrass#MessageContext", normalizeMessageContext],
        ["aws.greengrass#RunWithInfo", normalizeRunWithInfo],
        ["aws.greengrass#LocalDeployment", normalizeLocalDeployment],
        ["aws.greengrass#PostComponentUpdateEvent", normalizePostComponentUpdateEvent],
        ["aws.greengrass#PreComponentUpdateEvent", normalizePreComponentUpdateEvent],
        ["aws.greengrass#ComponentDetails", normalizeComponentDetails],
        ["aws.greengrass#CertificateUpdate", normalizeCertificateUpdate],
        ["aws.greengrass#BinaryMessage", normalizeBinaryMessage],
        ["aws.greengrass#JsonMessage", normalizeJsonMessage],
        ["aws.greengrass#MQTTCredential", normalizeMQTTCredential],
        ["aws.greengrass#ValidateConfigurationUpdateEvent", normalizeValidateConfigurationUpdateEvent],
        ["aws.greengrass#Metric", normalizeMetric],
        ["aws.greengrass#ConfigurationUpdateEvent", normalizeConfigurationUpdateEvent],
        ["aws.greengrass#MQTTMessage", normalizeMQTTMessage],
        ["aws.greengrass#ComponentUpdatePolicyEvents", normalizeComponentUpdatePolicyEvents],
        ["aws.greengrass#SecretValue", normalizeSecretValue],
        ["aws.greengrass#ConfigurationValidityReport", normalizeConfigurationValidityReport],
        ["aws.greengrass#ClientDeviceCredential", normalizeClientDeviceCredential],
        ["aws.greengrass#CertificateUpdateEvent", normalizeCertificateUpdateEvent],
        ["aws.greengrass#CertificateOptions", normalizeCertificateOptions],
        ["aws.greengrass#PublishMessage", normalizePublishMessage],
        ["aws.greengrass#CredentialDocument", normalizeCredentialDocument],
        ["aws.greengrass#SubscriptionResponseMessage", normalizeSubscriptionResponseMessage],
        ["aws.greengrass#ValidateConfigurationUpdateEvents", normalizeValidateConfigurationUpdateEvents],
        ["aws.greengrass#ConfigurationUpdateEvents", normalizeConfigurationUpdateEvents],
        ["aws.greengrass#IoTCoreMessage", normalizeIoTCoreMessage],
        ["aws.greengrass#InvalidArgumentsError", normalizeInvalidArgumentsError],
        ["aws.greengrass#InvalidArtifactsDirectoryPathError", normalizeInvalidArtifactsDirectoryPathError],
        ["aws.greengrass#InvalidRecipeDirectoryPathError", normalizeInvalidRecipeDirectoryPathError],
        ["aws.greengrass#ServiceError", normalizeServiceError],
        ["aws.greengrass#CreateLocalDeploymentResponse", normalizeCreateLocalDeploymentResponse],
        ["aws.greengrass#CreateLocalDeploymentRequest", normalizeCreateLocalDeploymentRequest],
        ["aws.greengrass#ResourceNotFoundError", normalizeResourceNotFoundError],
        ["aws.greengrass#UnauthorizedError", normalizeUnauthorizedError],
        ["aws.greengrass#PauseComponentResponse", normalizePauseComponentResponse],
        ["aws.greengrass#PauseComponentRequest", normalizePauseComponentRequest],
        ["aws.greengrass#ComponentNotFoundError", normalizeComponentNotFoundError],
        ["aws.greengrass#StopComponentResponse", normalizeStopComponentResponse],
        ["aws.greengrass#StopComponentRequest", normalizeStopComponentRequest],
        ["aws.greengrass#ListLocalDeploymentsResponse", normalizeListLocalDeploymentsResponse],
        ["aws.greengrass#ListLocalDeploymentsRequest", normalizeListLocalDeploymentsRequest],
        ["aws.greengrass#SubscribeToComponentUpdatesResponse", normalizeSubscribeToComponentUpdatesResponse],
        ["aws.greengrass#SubscribeToComponentUpdatesRequest", normalizeSubscribeToComponentUpdatesRequest],
        ["aws.greengrass#ListNamedShadowsForThingResponse", normalizeListNamedShadowsForThingResponse],
        ["aws.greengrass#ListNamedShadowsForThingRequest", normalizeListNamedShadowsForThingRequest],
        ["aws.greengrass#CancelLocalDeploymentResponse", normalizeCancelLocalDeploymentResponse],
        ["aws.greengrass#CancelLocalDeploymentRequest", normalizeCancelLocalDeploymentRequest],
        ["aws.greengrass#UpdateStateResponse", normalizeUpdateStateResponse],
        ["aws.greengrass#UpdateStateRequest", normalizeUpdateStateRequest],
        ["aws.greengrass#GetSecretValueResponse", normalizeGetSecretValueResponse],
        ["aws.greengrass#GetSecretValueRequest", normalizeGetSecretValueRequest],
        ["aws.greengrass#GetLocalDeploymentStatusResponse", normalizeGetLocalDeploymentStatusResponse],
        ["aws.greengrass#GetLocalDeploymentStatusRequest", normalizeGetLocalDeploymentStatusRequest],
        ["aws.greengrass#RestartComponentResponse", normalizeRestartComponentResponse],
        ["aws.greengrass#RestartComponentRequest", normalizeRestartComponentRequest],
        ["aws.greengrass#InvalidTokenError", normalizeInvalidTokenError],
        ["aws.greengrass#ValidateAuthorizationTokenResponse", normalizeValidateAuthorizationTokenResponse],
        ["aws.greengrass#ValidateAuthorizationTokenRequest", normalizeValidateAuthorizationTokenRequest],
        ["aws.greengrass#FailedUpdateConditionCheckError", normalizeFailedUpdateConditionCheckError],
        ["aws.greengrass#ConflictError", normalizeConflictError],
        ["aws.greengrass#UpdateConfigurationResponse", normalizeUpdateConfigurationResponse],
        ["aws.greengrass#UpdateConfigurationRequest", normalizeUpdateConfigurationRequest],
        ["aws.greengrass#UpdateThingShadowResponse", normalizeUpdateThingShadowResponse],
        ["aws.greengrass#UpdateThingShadowRequest", normalizeUpdateThingShadowRequest],
        ["aws.greengrass#SendConfigurationValidityReportResponse", normalizeSendConfigurationValidityReportResponse],
        ["aws.greengrass#SendConfigurationValidityReportRequest", normalizeSendConfigurationValidityReportRequest],
        ["aws.greengrass#GetThingShadowResponse", normalizeGetThingShadowResponse],
        ["aws.greengrass#GetThingShadowRequest", normalizeGetThingShadowRequest],
        ["aws.greengrass#CreateDebugPasswordResponse", normalizeCreateDebugPasswordResponse],
        ["aws.greengrass#CreateDebugPasswordRequest", normalizeCreateDebugPasswordRequest],
        ["aws.greengrass#ListComponentsResponse", normalizeListComponentsResponse],
        ["aws.greengrass#ListComponentsRequest", normalizeListComponentsRequest],
        ["aws.greengrass#InvalidClientDeviceAuthTokenError", normalizeInvalidClientDeviceAuthTokenError],
        ["aws.greengrass#AuthorizeClientDeviceActionResponse", normalizeAuthorizeClientDeviceActionResponse],
        ["aws.greengrass#AuthorizeClientDeviceActionRequest", normalizeAuthorizeClientDeviceActionRequest],
        ["aws.greengrass#VerifyClientDeviceIdentityResponse", normalizeVerifyClientDeviceIdentityResponse],
        ["aws.greengrass#VerifyClientDeviceIdentityRequest", normalizeVerifyClientDeviceIdentityRequest],
        ["aws.greengrass#SubscribeToCertificateUpdatesResponse", normalizeSubscribeToCertificateUpdatesResponse],
        ["aws.greengrass#SubscribeToCertificateUpdatesRequest", normalizeSubscribeToCertificateUpdatesRequest],
        ["aws.greengrass#PublishToTopicResponse", normalizePublishToTopicResponse],
        ["aws.greengrass#PublishToTopicRequest", normalizePublishToTopicRequest],
        ["aws.greengrass#InvalidCredentialError", normalizeInvalidCredentialError],
        ["aws.greengrass#GetClientDeviceAuthTokenResponse", normalizeGetClientDeviceAuthTokenResponse],
        ["aws.greengrass#GetClientDeviceAuthTokenRequest", normalizeGetClientDeviceAuthTokenRequest],
        ["aws.greengrass#GetComponentDetailsResponse", normalizeGetComponentDetailsResponse],
        ["aws.greengrass#GetComponentDetailsRequest", normalizeGetComponentDetailsRequest],
        ["aws.greengrass#SubscribeToTopicResponse", normalizeSubscribeToTopicResponse],
        ["aws.greengrass#SubscribeToTopicRequest", normalizeSubscribeToTopicRequest],
        ["aws.greengrass#GetConfigurationResponse", normalizeGetConfigurationResponse],
        ["aws.greengrass#GetConfigurationRequest", normalizeGetConfigurationRequest],
        ["aws.greengrass#SubscribeToValidateConfigurationUpdatesResponse", normalizeSubscribeToValidateConfigurationUpdatesResponse],
        ["aws.greengrass#SubscribeToValidateConfigurationUpdatesRequest", normalizeSubscribeToValidateConfigurationUpdatesRequest],
        ["aws.greengrass#DeferComponentUpdateResponse", normalizeDeferComponentUpdateResponse],
        ["aws.greengrass#DeferComponentUpdateRequest", normalizeDeferComponentUpdateRequest],
        ["aws.greengrass#PutComponentMetricResponse", normalizePutComponentMetricResponse],
        ["aws.greengrass#PutComponentMetricRequest", normalizePutComponentMetricRequest],
        ["aws.greengrass#DeleteThingShadowResponse", normalizeDeleteThingShadowResponse],
        ["aws.greengrass#DeleteThingShadowRequest", normalizeDeleteThingShadowRequest],
        ["aws.greengrass#SubscribeToConfigurationUpdateResponse", normalizeSubscribeToConfigurationUpdateResponse],
        ["aws.greengrass#SubscribeToConfigurationUpdateRequest", normalizeSubscribeToConfigurationUpdateRequest],
        ["aws.greengrass#PublishToIoTCoreResponse", normalizePublishToIoTCoreResponse],
        ["aws.greengrass#PublishToIoTCoreRequest", normalizePublishToIoTCoreRequest],
        ["aws.greengrass#ResumeComponentResponse", normalizeResumeComponentResponse],
        ["aws.greengrass#ResumeComponentRequest", normalizeResumeComponentRequest],
        ["aws.greengrass#SubscribeToIoTCoreResponse", normalizeSubscribeToIoTCoreResponse],
        ["aws.greengrass#SubscribeToIoTCoreRequest", normalizeSubscribeToIoTCoreRequest]
      ]);
    }
    function createValidatorMap() {
      return /* @__PURE__ */ new Map([
        ["aws.greengrass#UserProperty", validateUserProperty],
        ["aws.greengrass#SystemResourceLimits", validateSystemResourceLimits],
        ["aws.greengrass#DeploymentStatusDetails", validateDeploymentStatusDetails],
        ["aws.greengrass#MessageContext", validateMessageContext],
        ["aws.greengrass#RunWithInfo", validateRunWithInfo],
        ["aws.greengrass#LocalDeployment", validateLocalDeployment],
        ["aws.greengrass#PostComponentUpdateEvent", validatePostComponentUpdateEvent],
        ["aws.greengrass#PreComponentUpdateEvent", validatePreComponentUpdateEvent],
        ["aws.greengrass#ComponentDetails", validateComponentDetails],
        ["aws.greengrass#CertificateUpdate", validateCertificateUpdate],
        ["aws.greengrass#BinaryMessage", validateBinaryMessage],
        ["aws.greengrass#JsonMessage", validateJsonMessage],
        ["aws.greengrass#MQTTCredential", validateMQTTCredential],
        ["aws.greengrass#ValidateConfigurationUpdateEvent", validateValidateConfigurationUpdateEvent],
        ["aws.greengrass#Metric", validateMetric],
        ["aws.greengrass#ConfigurationUpdateEvent", validateConfigurationUpdateEvent],
        ["aws.greengrass#MQTTMessage", validateMQTTMessage],
        ["aws.greengrass#ComponentUpdatePolicyEvents", validateComponentUpdatePolicyEvents],
        ["aws.greengrass#SecretValue", validateSecretValue],
        ["aws.greengrass#ConfigurationValidityReport", validateConfigurationValidityReport],
        ["aws.greengrass#ClientDeviceCredential", validateClientDeviceCredential],
        ["aws.greengrass#CertificateUpdateEvent", validateCertificateUpdateEvent],
        ["aws.greengrass#CertificateOptions", validateCertificateOptions],
        ["aws.greengrass#PublishMessage", validatePublishMessage],
        ["aws.greengrass#CredentialDocument", validateCredentialDocument],
        ["aws.greengrass#SubscriptionResponseMessage", validateSubscriptionResponseMessage],
        ["aws.greengrass#ValidateConfigurationUpdateEvents", validateValidateConfigurationUpdateEvents],
        ["aws.greengrass#ConfigurationUpdateEvents", validateConfigurationUpdateEvents],
        ["aws.greengrass#IoTCoreMessage", validateIoTCoreMessage],
        ["aws.greengrass#InvalidArgumentsError", validateInvalidArgumentsError],
        ["aws.greengrass#InvalidArtifactsDirectoryPathError", validateInvalidArtifactsDirectoryPathError],
        ["aws.greengrass#InvalidRecipeDirectoryPathError", validateInvalidRecipeDirectoryPathError],
        ["aws.greengrass#ServiceError", validateServiceError],
        ["aws.greengrass#CreateLocalDeploymentResponse", validateCreateLocalDeploymentResponse],
        ["aws.greengrass#CreateLocalDeploymentRequest", validateCreateLocalDeploymentRequest],
        ["aws.greengrass#ResourceNotFoundError", validateResourceNotFoundError],
        ["aws.greengrass#UnauthorizedError", validateUnauthorizedError],
        ["aws.greengrass#PauseComponentResponse", validatePauseComponentResponse],
        ["aws.greengrass#PauseComponentRequest", validatePauseComponentRequest],
        ["aws.greengrass#ComponentNotFoundError", validateComponentNotFoundError],
        ["aws.greengrass#StopComponentResponse", validateStopComponentResponse],
        ["aws.greengrass#StopComponentRequest", validateStopComponentRequest],
        ["aws.greengrass#ListLocalDeploymentsResponse", validateListLocalDeploymentsResponse],
        ["aws.greengrass#ListLocalDeploymentsRequest", validateListLocalDeploymentsRequest],
        ["aws.greengrass#SubscribeToComponentUpdatesResponse", validateSubscribeToComponentUpdatesResponse],
        ["aws.greengrass#SubscribeToComponentUpdatesRequest", validateSubscribeToComponentUpdatesRequest],
        ["aws.greengrass#ListNamedShadowsForThingResponse", validateListNamedShadowsForThingResponse],
        ["aws.greengrass#ListNamedShadowsForThingRequest", validateListNamedShadowsForThingRequest],
        ["aws.greengrass#CancelLocalDeploymentResponse", validateCancelLocalDeploymentResponse],
        ["aws.greengrass#CancelLocalDeploymentRequest", validateCancelLocalDeploymentRequest],
        ["aws.greengrass#UpdateStateResponse", validateUpdateStateResponse],
        ["aws.greengrass#UpdateStateRequest", validateUpdateStateRequest],
        ["aws.greengrass#GetSecretValueResponse", validateGetSecretValueResponse],
        ["aws.greengrass#GetSecretValueRequest", validateGetSecretValueRequest],
        ["aws.greengrass#GetLocalDeploymentStatusResponse", validateGetLocalDeploymentStatusResponse],
        ["aws.greengrass#GetLocalDeploymentStatusRequest", validateGetLocalDeploymentStatusRequest],
        ["aws.greengrass#RestartComponentResponse", validateRestartComponentResponse],
        ["aws.greengrass#RestartComponentRequest", validateRestartComponentRequest],
        ["aws.greengrass#InvalidTokenError", validateInvalidTokenError],
        ["aws.greengrass#ValidateAuthorizationTokenResponse", validateValidateAuthorizationTokenResponse],
        ["aws.greengrass#ValidateAuthorizationTokenRequest", validateValidateAuthorizationTokenRequest],
        ["aws.greengrass#FailedUpdateConditionCheckError", validateFailedUpdateConditionCheckError],
        ["aws.greengrass#ConflictError", validateConflictError],
        ["aws.greengrass#UpdateConfigurationResponse", validateUpdateConfigurationResponse],
        ["aws.greengrass#UpdateConfigurationRequest", validateUpdateConfigurationRequest],
        ["aws.greengrass#UpdateThingShadowResponse", validateUpdateThingShadowResponse],
        ["aws.greengrass#UpdateThingShadowRequest", validateUpdateThingShadowRequest],
        ["aws.greengrass#SendConfigurationValidityReportResponse", validateSendConfigurationValidityReportResponse],
        ["aws.greengrass#SendConfigurationValidityReportRequest", validateSendConfigurationValidityReportRequest],
        ["aws.greengrass#GetThingShadowResponse", validateGetThingShadowResponse],
        ["aws.greengrass#GetThingShadowRequest", validateGetThingShadowRequest],
        ["aws.greengrass#CreateDebugPasswordResponse", validateCreateDebugPasswordResponse],
        ["aws.greengrass#CreateDebugPasswordRequest", validateCreateDebugPasswordRequest],
        ["aws.greengrass#ListComponentsResponse", validateListComponentsResponse],
        ["aws.greengrass#ListComponentsRequest", validateListComponentsRequest],
        ["aws.greengrass#InvalidClientDeviceAuthTokenError", validateInvalidClientDeviceAuthTokenError],
        ["aws.greengrass#AuthorizeClientDeviceActionResponse", validateAuthorizeClientDeviceActionResponse],
        ["aws.greengrass#AuthorizeClientDeviceActionRequest", validateAuthorizeClientDeviceActionRequest],
        ["aws.greengrass#VerifyClientDeviceIdentityResponse", validateVerifyClientDeviceIdentityResponse],
        ["aws.greengrass#VerifyClientDeviceIdentityRequest", validateVerifyClientDeviceIdentityRequest],
        ["aws.greengrass#SubscribeToCertificateUpdatesResponse", validateSubscribeToCertificateUpdatesResponse],
        ["aws.greengrass#SubscribeToCertificateUpdatesRequest", validateSubscribeToCertificateUpdatesRequest],
        ["aws.greengrass#PublishToTopicResponse", validatePublishToTopicResponse],
        ["aws.greengrass#PublishToTopicRequest", validatePublishToTopicRequest],
        ["aws.greengrass#InvalidCredentialError", validateInvalidCredentialError],
        ["aws.greengrass#GetClientDeviceAuthTokenResponse", validateGetClientDeviceAuthTokenResponse],
        ["aws.greengrass#GetClientDeviceAuthTokenRequest", validateGetClientDeviceAuthTokenRequest],
        ["aws.greengrass#GetComponentDetailsResponse", validateGetComponentDetailsResponse],
        ["aws.greengrass#GetComponentDetailsRequest", validateGetComponentDetailsRequest],
        ["aws.greengrass#SubscribeToTopicResponse", validateSubscribeToTopicResponse],
        ["aws.greengrass#SubscribeToTopicRequest", validateSubscribeToTopicRequest],
        ["aws.greengrass#GetConfigurationResponse", validateGetConfigurationResponse],
        ["aws.greengrass#GetConfigurationRequest", validateGetConfigurationRequest],
        ["aws.greengrass#SubscribeToValidateConfigurationUpdatesResponse", validateSubscribeToValidateConfigurationUpdatesResponse],
        ["aws.greengrass#SubscribeToValidateConfigurationUpdatesRequest", validateSubscribeToValidateConfigurationUpdatesRequest],
        ["aws.greengrass#DeferComponentUpdateResponse", validateDeferComponentUpdateResponse],
        ["aws.greengrass#DeferComponentUpdateRequest", validateDeferComponentUpdateRequest],
        ["aws.greengrass#PutComponentMetricResponse", validatePutComponentMetricResponse],
        ["aws.greengrass#PutComponentMetricRequest", validatePutComponentMetricRequest],
        ["aws.greengrass#DeleteThingShadowResponse", validateDeleteThingShadowResponse],
        ["aws.greengrass#DeleteThingShadowRequest", validateDeleteThingShadowRequest],
        ["aws.greengrass#SubscribeToConfigurationUpdateResponse", validateSubscribeToConfigurationUpdateResponse],
        ["aws.greengrass#SubscribeToConfigurationUpdateRequest", validateSubscribeToConfigurationUpdateRequest],
        ["aws.greengrass#PublishToIoTCoreResponse", validatePublishToIoTCoreResponse],
        ["aws.greengrass#PublishToIoTCoreRequest", validatePublishToIoTCoreRequest],
        ["aws.greengrass#ResumeComponentResponse", validateResumeComponentResponse],
        ["aws.greengrass#ResumeComponentRequest", validateResumeComponentRequest],
        ["aws.greengrass#SubscribeToIoTCoreResponse", validateSubscribeToIoTCoreResponse],
        ["aws.greengrass#SubscribeToIoTCoreRequest", validateSubscribeToIoTCoreRequest]
      ]);
    }
    function createDeserializerMap() {
      return /* @__PURE__ */ new Map([
        ["aws.greengrass#ConflictError", deserializeEventstreamMessageToConflictError],
        ["aws.greengrass#CreateDebugPasswordResponse", deserializeEventstreamMessageToCreateDebugPasswordResponse],
        ["aws.greengrass#SubscriptionResponseMessage", deserializeEventstreamMessageToSubscriptionResponseMessage],
        ["aws.greengrass#FailedUpdateConditionCheckError", deserializeEventstreamMessageToFailedUpdateConditionCheckError],
        ["aws.greengrass#ListNamedShadowsForThingResponse", deserializeEventstreamMessageToListNamedShadowsForThingResponse],
        ["aws.greengrass#ComponentNotFoundError", deserializeEventstreamMessageToComponentNotFoundError],
        ["aws.greengrass#CertificateUpdateEvent", deserializeEventstreamMessageToCertificateUpdateEvent],
        ["aws.greengrass#GetSecretValueResponse", deserializeEventstreamMessageToGetSecretValueResponse],
        ["aws.greengrass#SubscribeToIoTCoreResponse", deserializeEventstreamMessageToSubscribeToIoTCoreResponse],
        ["aws.greengrass#InvalidRecipeDirectoryPathError", deserializeEventstreamMessageToInvalidRecipeDirectoryPathError],
        ["aws.greengrass#ListLocalDeploymentsResponse", deserializeEventstreamMessageToListLocalDeploymentsResponse],
        ["aws.greengrass#ResumeComponentResponse", deserializeEventstreamMessageToResumeComponentResponse],
        ["aws.greengrass#InvalidArgumentsError", deserializeEventstreamMessageToInvalidArgumentsError],
        ["aws.greengrass#GetComponentDetailsResponse", deserializeEventstreamMessageToGetComponentDetailsResponse],
        ["aws.greengrass#PutComponentMetricResponse", deserializeEventstreamMessageToPutComponentMetricResponse],
        ["aws.greengrass#ComponentUpdatePolicyEvents", deserializeEventstreamMessageToComponentUpdatePolicyEvents],
        ["aws.greengrass#IoTCoreMessage", deserializeEventstreamMessageToIoTCoreMessage],
        ["aws.greengrass#UpdateStateResponse", deserializeEventstreamMessageToUpdateStateResponse],
        ["aws.greengrass#DeferComponentUpdateResponse", deserializeEventstreamMessageToDeferComponentUpdateResponse],
        ["aws.greengrass#ListComponentsResponse", deserializeEventstreamMessageToListComponentsResponse],
        ["aws.greengrass#SubscribeToComponentUpdatesResponse", deserializeEventstreamMessageToSubscribeToComponentUpdatesResponse],
        ["aws.greengrass#VerifyClientDeviceIdentityResponse", deserializeEventstreamMessageToVerifyClientDeviceIdentityResponse],
        ["aws.greengrass#ResourceNotFoundError", deserializeEventstreamMessageToResourceNotFoundError],
        ["aws.greengrass#InvalidArtifactsDirectoryPathError", deserializeEventstreamMessageToInvalidArtifactsDirectoryPathError],
        ["aws.greengrass#SendConfigurationValidityReportResponse", deserializeEventstreamMessageToSendConfigurationValidityReportResponse],
        ["aws.greengrass#GetThingShadowResponse", deserializeEventstreamMessageToGetThingShadowResponse],
        ["aws.greengrass#InvalidClientDeviceAuthTokenError", deserializeEventstreamMessageToInvalidClientDeviceAuthTokenError],
        ["aws.greengrass#PublishToIoTCoreResponse", deserializeEventstreamMessageToPublishToIoTCoreResponse],
        ["aws.greengrass#SubscribeToTopicResponse", deserializeEventstreamMessageToSubscribeToTopicResponse],
        ["aws.greengrass#InvalidTokenError", deserializeEventstreamMessageToInvalidTokenError],
        ["aws.greengrass#GetClientDeviceAuthTokenResponse", deserializeEventstreamMessageToGetClientDeviceAuthTokenResponse],
        ["aws.greengrass#CreateLocalDeploymentResponse", deserializeEventstreamMessageToCreateLocalDeploymentResponse],
        ["aws.greengrass#PublishToTopicResponse", deserializeEventstreamMessageToPublishToTopicResponse],
        ["aws.greengrass#ValidateAuthorizationTokenResponse", deserializeEventstreamMessageToValidateAuthorizationTokenResponse],
        ["aws.greengrass#UpdateThingShadowResponse", deserializeEventstreamMessageToUpdateThingShadowResponse],
        ["aws.greengrass#AuthorizeClientDeviceActionResponse", deserializeEventstreamMessageToAuthorizeClientDeviceActionResponse],
        ["aws.greengrass#GetConfigurationResponse", deserializeEventstreamMessageToGetConfigurationResponse],
        ["aws.greengrass#InvalidCredentialError", deserializeEventstreamMessageToInvalidCredentialError],
        ["aws.greengrass#GetLocalDeploymentStatusResponse", deserializeEventstreamMessageToGetLocalDeploymentStatusResponse],
        ["aws.greengrass#PauseComponentResponse", deserializeEventstreamMessageToPauseComponentResponse],
        ["aws.greengrass#UnauthorizedError", deserializeEventstreamMessageToUnauthorizedError],
        ["aws.greengrass#SubscribeToCertificateUpdatesResponse", deserializeEventstreamMessageToSubscribeToCertificateUpdatesResponse],
        ["aws.greengrass#UpdateConfigurationResponse", deserializeEventstreamMessageToUpdateConfigurationResponse],
        ["aws.greengrass#RestartComponentResponse", deserializeEventstreamMessageToRestartComponentResponse],
        ["aws.greengrass#DeleteThingShadowResponse", deserializeEventstreamMessageToDeleteThingShadowResponse],
        ["aws.greengrass#SubscribeToConfigurationUpdateResponse", deserializeEventstreamMessageToSubscribeToConfigurationUpdateResponse],
        ["aws.greengrass#SubscribeToValidateConfigurationUpdatesResponse", deserializeEventstreamMessageToSubscribeToValidateConfigurationUpdatesResponse],
        ["aws.greengrass#ServiceError", deserializeEventstreamMessageToServiceError],
        ["aws.greengrass#ConfigurationUpdateEvents", deserializeEventstreamMessageToConfigurationUpdateEvents],
        ["aws.greengrass#StopComponentResponse", deserializeEventstreamMessageToStopComponentResponse],
        ["aws.greengrass#ValidateConfigurationUpdateEvents", deserializeEventstreamMessageToValidateConfigurationUpdateEvents],
        ["aws.greengrass#CancelLocalDeploymentResponse", deserializeEventstreamMessageToCancelLocalDeploymentResponse]
      ]);
    }
    function createSerializerMap() {
      return /* @__PURE__ */ new Map([
        ["aws.greengrass#GetComponentDetailsRequest", serializeGetComponentDetailsRequestToEventstreamMessage],
        ["aws.greengrass#PublishToTopicRequest", serializePublishToTopicRequestToEventstreamMessage],
        ["aws.greengrass#CreateDebugPasswordRequest", serializeCreateDebugPasswordRequestToEventstreamMessage],
        ["aws.greengrass#UpdateThingShadowRequest", serializeUpdateThingShadowRequestToEventstreamMessage],
        ["aws.greengrass#ResumeComponentRequest", serializeResumeComponentRequestToEventstreamMessage],
        ["aws.greengrass#StopComponentRequest", serializeStopComponentRequestToEventstreamMessage],
        ["aws.greengrass#VerifyClientDeviceIdentityRequest", serializeVerifyClientDeviceIdentityRequestToEventstreamMessage],
        ["aws.greengrass#AuthorizeClientDeviceActionRequest", serializeAuthorizeClientDeviceActionRequestToEventstreamMessage],
        ["aws.greengrass#ListLocalDeploymentsRequest", serializeListLocalDeploymentsRequestToEventstreamMessage],
        ["aws.greengrass#SendConfigurationValidityReportRequest", serializeSendConfigurationValidityReportRequestToEventstreamMessage],
        ["aws.greengrass#ValidateAuthorizationTokenRequest", serializeValidateAuthorizationTokenRequestToEventstreamMessage],
        ["aws.greengrass#GetClientDeviceAuthTokenRequest", serializeGetClientDeviceAuthTokenRequestToEventstreamMessage],
        ["aws.greengrass#PauseComponentRequest", serializePauseComponentRequestToEventstreamMessage],
        ["aws.greengrass#PublishToIoTCoreRequest", serializePublishToIoTCoreRequestToEventstreamMessage],
        ["aws.greengrass#DeleteThingShadowRequest", serializeDeleteThingShadowRequestToEventstreamMessage],
        ["aws.greengrass#GetConfigurationRequest", serializeGetConfigurationRequestToEventstreamMessage],
        ["aws.greengrass#DeferComponentUpdateRequest", serializeDeferComponentUpdateRequestToEventstreamMessage],
        ["aws.greengrass#GetSecretValueRequest", serializeGetSecretValueRequestToEventstreamMessage],
        ["aws.greengrass#ListComponentsRequest", serializeListComponentsRequestToEventstreamMessage],
        ["aws.greengrass#SubscribeToTopicRequest", serializeSubscribeToTopicRequestToEventstreamMessage],
        ["aws.greengrass#CancelLocalDeploymentRequest", serializeCancelLocalDeploymentRequestToEventstreamMessage],
        ["aws.greengrass#SubscribeToCertificateUpdatesRequest", serializeSubscribeToCertificateUpdatesRequestToEventstreamMessage],
        ["aws.greengrass#SubscribeToValidateConfigurationUpdatesRequest", serializeSubscribeToValidateConfigurationUpdatesRequestToEventstreamMessage],
        ["aws.greengrass#CreateLocalDeploymentRequest", serializeCreateLocalDeploymentRequestToEventstreamMessage],
        ["aws.greengrass#PutComponentMetricRequest", serializePutComponentMetricRequestToEventstreamMessage],
        ["aws.greengrass#SubscribeToConfigurationUpdateRequest", serializeSubscribeToConfigurationUpdateRequestToEventstreamMessage],
        ["aws.greengrass#SubscribeToComponentUpdatesRequest", serializeSubscribeToComponentUpdatesRequestToEventstreamMessage],
        ["aws.greengrass#RestartComponentRequest", serializeRestartComponentRequestToEventstreamMessage],
        ["aws.greengrass#ListNamedShadowsForThingRequest", serializeListNamedShadowsForThingRequestToEventstreamMessage],
        ["aws.greengrass#UpdateConfigurationRequest", serializeUpdateConfigurationRequestToEventstreamMessage],
        ["aws.greengrass#GetLocalDeploymentStatusRequest", serializeGetLocalDeploymentStatusRequestToEventstreamMessage],
        ["aws.greengrass#GetThingShadowRequest", serializeGetThingShadowRequestToEventstreamMessage],
        ["aws.greengrass#SubscribeToIoTCoreRequest", serializeSubscribeToIoTCoreRequestToEventstreamMessage],
        ["aws.greengrass#UpdateStateRequest", serializeUpdateStateRequestToEventstreamMessage]
      ]);
    }
    function createOperationMap() {
      return /* @__PURE__ */ new Map([
        ["aws.greengrass#AuthorizeClientDeviceAction", {
          requestShape: "aws.greengrass#AuthorizeClientDeviceActionRequest",
          responseShape: "aws.greengrass#AuthorizeClientDeviceActionResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#UnauthorizedError",
            "aws.greengrass#ServiceError",
            "aws.greengrass#InvalidArgumentsError",
            "aws.greengrass#InvalidClientDeviceAuthTokenError"
          ])
        }],
        ["aws.greengrass#CancelLocalDeployment", {
          requestShape: "aws.greengrass#CancelLocalDeploymentRequest",
          responseShape: "aws.greengrass#CancelLocalDeploymentResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#ResourceNotFoundError",
            "aws.greengrass#InvalidArgumentsError"
          ])
        }],
        ["aws.greengrass#CreateDebugPassword", {
          requestShape: "aws.greengrass#CreateDebugPasswordRequest",
          responseShape: "aws.greengrass#CreateDebugPasswordResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#UnauthorizedError",
            "aws.greengrass#ServiceError"
          ])
        }],
        ["aws.greengrass#CreateLocalDeployment", {
          requestShape: "aws.greengrass#CreateLocalDeploymentRequest",
          responseShape: "aws.greengrass#CreateLocalDeploymentResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#InvalidRecipeDirectoryPathError",
            "aws.greengrass#InvalidArtifactsDirectoryPathError",
            "aws.greengrass#InvalidArgumentsError"
          ])
        }],
        ["aws.greengrass#DeferComponentUpdate", {
          requestShape: "aws.greengrass#DeferComponentUpdateRequest",
          responseShape: "aws.greengrass#DeferComponentUpdateResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#ResourceNotFoundError",
            "aws.greengrass#InvalidArgumentsError"
          ])
        }],
        ["aws.greengrass#DeleteThingShadow", {
          requestShape: "aws.greengrass#DeleteThingShadowRequest",
          responseShape: "aws.greengrass#DeleteThingShadowResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#InvalidArgumentsError",
            "aws.greengrass#ResourceNotFoundError",
            "aws.greengrass#ServiceError",
            "aws.greengrass#UnauthorizedError"
          ])
        }],
        ["aws.greengrass#GetClientDeviceAuthToken", {
          requestShape: "aws.greengrass#GetClientDeviceAuthTokenRequest",
          responseShape: "aws.greengrass#GetClientDeviceAuthTokenResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#UnauthorizedError",
            "aws.greengrass#ServiceError",
            "aws.greengrass#InvalidArgumentsError",
            "aws.greengrass#InvalidCredentialError"
          ])
        }],
        ["aws.greengrass#GetComponentDetails", {
          requestShape: "aws.greengrass#GetComponentDetailsRequest",
          responseShape: "aws.greengrass#GetComponentDetailsResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#ResourceNotFoundError",
            "aws.greengrass#InvalidArgumentsError"
          ])
        }],
        ["aws.greengrass#GetConfiguration", {
          requestShape: "aws.greengrass#GetConfigurationRequest",
          responseShape: "aws.greengrass#GetConfigurationResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#ResourceNotFoundError"
          ])
        }],
        ["aws.greengrass#GetLocalDeploymentStatus", {
          requestShape: "aws.greengrass#GetLocalDeploymentStatusRequest",
          responseShape: "aws.greengrass#GetLocalDeploymentStatusResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#ResourceNotFoundError"
          ])
        }],
        ["aws.greengrass#GetSecretValue", {
          requestShape: "aws.greengrass#GetSecretValueRequest",
          responseShape: "aws.greengrass#GetSecretValueResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#UnauthorizedError",
            "aws.greengrass#ResourceNotFoundError",
            "aws.greengrass#ServiceError"
          ])
        }],
        ["aws.greengrass#GetThingShadow", {
          requestShape: "aws.greengrass#GetThingShadowRequest",
          responseShape: "aws.greengrass#GetThingShadowResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#InvalidArgumentsError",
            "aws.greengrass#ResourceNotFoundError",
            "aws.greengrass#ServiceError",
            "aws.greengrass#UnauthorizedError"
          ])
        }],
        ["aws.greengrass#ListComponents", {
          requestShape: "aws.greengrass#ListComponentsRequest",
          responseShape: "aws.greengrass#ListComponentsResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError"
          ])
        }],
        ["aws.greengrass#ListLocalDeployments", {
          requestShape: "aws.greengrass#ListLocalDeploymentsRequest",
          responseShape: "aws.greengrass#ListLocalDeploymentsResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError"
          ])
        }],
        ["aws.greengrass#ListNamedShadowsForThing", {
          requestShape: "aws.greengrass#ListNamedShadowsForThingRequest",
          responseShape: "aws.greengrass#ListNamedShadowsForThingResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#InvalidArgumentsError",
            "aws.greengrass#ResourceNotFoundError",
            "aws.greengrass#ServiceError",
            "aws.greengrass#UnauthorizedError"
          ])
        }],
        ["aws.greengrass#PauseComponent", {
          requestShape: "aws.greengrass#PauseComponentRequest",
          responseShape: "aws.greengrass#PauseComponentResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#UnauthorizedError",
            "aws.greengrass#ServiceError",
            "aws.greengrass#ResourceNotFoundError"
          ])
        }],
        ["aws.greengrass#PublishToIoTCore", {
          requestShape: "aws.greengrass#PublishToIoTCoreRequest",
          responseShape: "aws.greengrass#PublishToIoTCoreResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#UnauthorizedError"
          ])
        }],
        ["aws.greengrass#PublishToTopic", {
          requestShape: "aws.greengrass#PublishToTopicRequest",
          responseShape: "aws.greengrass#PublishToTopicResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#UnauthorizedError"
          ])
        }],
        ["aws.greengrass#PutComponentMetric", {
          requestShape: "aws.greengrass#PutComponentMetricRequest",
          responseShape: "aws.greengrass#PutComponentMetricResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#UnauthorizedError",
            "aws.greengrass#ServiceError",
            "aws.greengrass#InvalidArgumentsError"
          ])
        }],
        ["aws.greengrass#RestartComponent", {
          requestShape: "aws.greengrass#RestartComponentRequest",
          responseShape: "aws.greengrass#RestartComponentResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#ComponentNotFoundError",
            "aws.greengrass#InvalidArgumentsError"
          ])
        }],
        ["aws.greengrass#ResumeComponent", {
          requestShape: "aws.greengrass#ResumeComponentRequest",
          responseShape: "aws.greengrass#ResumeComponentResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#UnauthorizedError",
            "aws.greengrass#ServiceError",
            "aws.greengrass#ResourceNotFoundError"
          ])
        }],
        ["aws.greengrass#SendConfigurationValidityReport", {
          requestShape: "aws.greengrass#SendConfigurationValidityReportRequest",
          responseShape: "aws.greengrass#SendConfigurationValidityReportResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#InvalidArgumentsError",
            "aws.greengrass#ServiceError"
          ])
        }],
        ["aws.greengrass#StopComponent", {
          requestShape: "aws.greengrass#StopComponentRequest",
          responseShape: "aws.greengrass#StopComponentResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#ComponentNotFoundError",
            "aws.greengrass#InvalidArgumentsError"
          ])
        }],
        ["aws.greengrass#SubscribeToCertificateUpdates", {
          requestShape: "aws.greengrass#SubscribeToCertificateUpdatesRequest",
          responseShape: "aws.greengrass#SubscribeToCertificateUpdatesResponse",
          inboundMessageShape: "aws.greengrass#CertificateUpdateEvent",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#UnauthorizedError",
            "aws.greengrass#InvalidArgumentsError"
          ])
        }],
        ["aws.greengrass#SubscribeToComponentUpdates", {
          requestShape: "aws.greengrass#SubscribeToComponentUpdatesRequest",
          responseShape: "aws.greengrass#SubscribeToComponentUpdatesResponse",
          inboundMessageShape: "aws.greengrass#ComponentUpdatePolicyEvents",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#ResourceNotFoundError"
          ])
        }],
        ["aws.greengrass#SubscribeToConfigurationUpdate", {
          requestShape: "aws.greengrass#SubscribeToConfigurationUpdateRequest",
          responseShape: "aws.greengrass#SubscribeToConfigurationUpdateResponse",
          inboundMessageShape: "aws.greengrass#ConfigurationUpdateEvents",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#ResourceNotFoundError"
          ])
        }],
        ["aws.greengrass#SubscribeToIoTCore", {
          requestShape: "aws.greengrass#SubscribeToIoTCoreRequest",
          responseShape: "aws.greengrass#SubscribeToIoTCoreResponse",
          inboundMessageShape: "aws.greengrass#IoTCoreMessage",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#UnauthorizedError"
          ])
        }],
        ["aws.greengrass#SubscribeToTopic", {
          requestShape: "aws.greengrass#SubscribeToTopicRequest",
          responseShape: "aws.greengrass#SubscribeToTopicResponse",
          inboundMessageShape: "aws.greengrass#SubscriptionResponseMessage",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#InvalidArgumentsError",
            "aws.greengrass#ServiceError",
            "aws.greengrass#UnauthorizedError"
          ])
        }],
        ["aws.greengrass#SubscribeToValidateConfigurationUpdates", {
          requestShape: "aws.greengrass#SubscribeToValidateConfigurationUpdatesRequest",
          responseShape: "aws.greengrass#SubscribeToValidateConfigurationUpdatesResponse",
          inboundMessageShape: "aws.greengrass#ValidateConfigurationUpdateEvents",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError"
          ])
        }],
        ["aws.greengrass#UpdateConfiguration", {
          requestShape: "aws.greengrass#UpdateConfigurationRequest",
          responseShape: "aws.greengrass#UpdateConfigurationResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#UnauthorizedError",
            "aws.greengrass#ConflictError",
            "aws.greengrass#FailedUpdateConditionCheckError",
            "aws.greengrass#InvalidArgumentsError"
          ])
        }],
        ["aws.greengrass#UpdateState", {
          requestShape: "aws.greengrass#UpdateStateRequest",
          responseShape: "aws.greengrass#UpdateStateResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#ServiceError",
            "aws.greengrass#ResourceNotFoundError"
          ])
        }],
        ["aws.greengrass#UpdateThingShadow", {
          requestShape: "aws.greengrass#UpdateThingShadowRequest",
          responseShape: "aws.greengrass#UpdateThingShadowResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#InvalidArgumentsError",
            "aws.greengrass#ConflictError",
            "aws.greengrass#ServiceError",
            "aws.greengrass#UnauthorizedError"
          ])
        }],
        ["aws.greengrass#ValidateAuthorizationToken", {
          requestShape: "aws.greengrass#ValidateAuthorizationTokenRequest",
          responseShape: "aws.greengrass#ValidateAuthorizationTokenResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#InvalidTokenError",
            "aws.greengrass#UnauthorizedError",
            "aws.greengrass#ServiceError"
          ])
        }],
        ["aws.greengrass#VerifyClientDeviceIdentity", {
          requestShape: "aws.greengrass#VerifyClientDeviceIdentityRequest",
          responseShape: "aws.greengrass#VerifyClientDeviceIdentityResponse",
          errorShapes: /* @__PURE__ */ new Set([
            "aws.greengrass#UnauthorizedError",
            "aws.greengrass#ServiceError",
            "aws.greengrass#InvalidArgumentsError"
          ])
        }]
      ]);
    }
    var DetailedDeploymentStatusValues = /* @__PURE__ */ new Set([
      "SUCCESSFUL",
      "FAILED_NO_STATE_CHANGE",
      "FAILED_ROLLBACK_NOT_REQUESTED",
      "FAILED_ROLLBACK_COMPLETE",
      "REJECTED"
    ]);
    var DeploymentStatusValues = /* @__PURE__ */ new Set([
      "QUEUED",
      "IN_PROGRESS",
      "SUCCEEDED",
      "FAILED",
      "CANCELED"
    ]);
    var LifecycleStateValues = /* @__PURE__ */ new Set([
      "RUNNING",
      "ERRORED",
      "NEW",
      "FINISHED",
      "INSTALLED",
      "BROKEN",
      "STARTING",
      "STOPPING"
    ]);
    var MetricUnitTypeValues = /* @__PURE__ */ new Set([
      "BYTES",
      "BYTES_PER_SECOND",
      "COUNT",
      "COUNT_PER_SECOND",
      "MEGABYTES",
      "SECONDS"
    ]);
    var PayloadFormatValues = /* @__PURE__ */ new Set([
      "0",
      "1"
    ]);
    var ConfigurationValidityStatusValues = /* @__PURE__ */ new Set([
      "ACCEPTED",
      "REJECTED"
    ]);
    var CertificateTypeValues = /* @__PURE__ */ new Set([
      "SERVER"
    ]);
    var FailureHandlingPolicyValues = /* @__PURE__ */ new Set([
      "ROLLBACK",
      "DO_NOTHING"
    ]);
    var RequestStatusValues = /* @__PURE__ */ new Set([
      "SUCCEEDED",
      "FAILED"
    ]);
    var ReportedLifecycleStateValues = /* @__PURE__ */ new Set([
      "RUNNING",
      "ERRORED"
    ]);
    var ReceiveModeValues = /* @__PURE__ */ new Set([
      "RECEIVE_ALL_MESSAGES",
      "RECEIVE_MESSAGES_FROM_OTHERS"
    ]);
    var QOSValues = /* @__PURE__ */ new Set([
      "0",
      "1"
    ]);
    function createEnumsMap() {
      return /* @__PURE__ */ new Map([
        ["DetailedDeploymentStatus", DetailedDeploymentStatusValues],
        ["DeploymentStatus", DeploymentStatusValues],
        ["LifecycleState", LifecycleStateValues],
        ["MetricUnitType", MetricUnitTypeValues],
        ["PayloadFormat", PayloadFormatValues],
        ["ConfigurationValidityStatus", ConfigurationValidityStatusValues],
        ["CertificateType", CertificateTypeValues],
        ["FailureHandlingPolicy", FailureHandlingPolicyValues],
        ["RequestStatus", RequestStatusValues],
        ["ReportedLifecycleState", ReportedLifecycleStateValues],
        ["ReceiveMode", ReceiveModeValues],
        ["QOS", QOSValues]
      ]);
    }
    function makeServiceModel() {
      return {
        normalizers: createNormalizerMap(),
        validators: createValidatorMap(),
        deserializers: createDeserializerMap(),
        serializers: createSerializerMap(),
        operations: createOperationMap(),
        enums: createEnumsMap()
      };
    }
    exports2.makeServiceModel = makeServiceModel;
    function normalizeUserProperty(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "key", value.key);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "value", value.value);
      return normalizedValue;
    }
    exports2.normalizeUserProperty = normalizeUserProperty;
    function normalizeSystemResourceLimits(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "memory", value.memory);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "cpus", value.cpus);
      return normalizedValue;
    }
    exports2.normalizeSystemResourceLimits = normalizeSystemResourceLimits;
    function normalizeDeploymentStatusDetails(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "detailedDeploymentStatus", value.detailedDeploymentStatus);
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "deploymentErrorStack", value.deploymentErrorStack, void 0);
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "deploymentErrorTypes", value.deploymentErrorTypes, void 0);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "deploymentFailureCause", value.deploymentFailureCause);
      return normalizedValue;
    }
    exports2.normalizeDeploymentStatusDetails = normalizeDeploymentStatusDetails;
    function normalizeMessageContext(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "topic", value.topic);
      return normalizedValue;
    }
    exports2.normalizeMessageContext = normalizeMessageContext;
    function normalizeRunWithInfo(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "posixUser", value.posixUser);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "windowsUser", value.windowsUser);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "systemResourceLimits", value.systemResourceLimits, normalizeSystemResourceLimits);
      return normalizedValue;
    }
    exports2.normalizeRunWithInfo = normalizeRunWithInfo;
    function normalizeLocalDeployment(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "deploymentId", value.deploymentId);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "status", value.status);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "createdOn", value.createdOn);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "deploymentStatusDetails", value.deploymentStatusDetails, normalizeDeploymentStatusDetails);
      return normalizedValue;
    }
    exports2.normalizeLocalDeployment = normalizeLocalDeployment;
    function normalizePostComponentUpdateEvent(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "deploymentId", value.deploymentId);
      return normalizedValue;
    }
    exports2.normalizePostComponentUpdateEvent = normalizePostComponentUpdateEvent;
    function normalizePreComponentUpdateEvent(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "deploymentId", value.deploymentId);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "isGgcRestarting", value.isGgcRestarting);
      return normalizedValue;
    }
    exports2.normalizePreComponentUpdateEvent = normalizePreComponentUpdateEvent;
    function normalizeComponentDetails(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "componentName", value.componentName);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "version", value.version);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "state", value.state);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "configuration", value.configuration);
      return normalizedValue;
    }
    exports2.normalizeComponentDetails = normalizeComponentDetails;
    function normalizeCertificateUpdate(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "privateKey", value.privateKey);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "publicKey", value.publicKey);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "certificate", value.certificate);
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "caCertificates", value.caCertificates, void 0);
      return normalizedValue;
    }
    exports2.normalizeCertificateUpdate = normalizeCertificateUpdate;
    function normalizeBinaryMessage(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message, eventstream_rpc_utils.encodePayloadAsString);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "context", value.context, normalizeMessageContext);
      return normalizedValue;
    }
    exports2.normalizeBinaryMessage = normalizeBinaryMessage;
    function normalizeJsonMessage(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "context", value.context, normalizeMessageContext);
      return normalizedValue;
    }
    exports2.normalizeJsonMessage = normalizeJsonMessage;
    function normalizeMQTTCredential(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "clientId", value.clientId);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "certificatePem", value.certificatePem);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "username", value.username);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "password", value.password);
      return normalizedValue;
    }
    exports2.normalizeMQTTCredential = normalizeMQTTCredential;
    function normalizeValidateConfigurationUpdateEvent(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "configuration", value.configuration);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "deploymentId", value.deploymentId);
      return normalizedValue;
    }
    exports2.normalizeValidateConfigurationUpdateEvent = normalizeValidateConfigurationUpdateEvent;
    function normalizeMetric(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "name", value.name);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "unit", value.unit);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "value", value.value);
      return normalizedValue;
    }
    exports2.normalizeMetric = normalizeMetric;
    function normalizeConfigurationUpdateEvent(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "componentName", value.componentName);
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "keyPath", value.keyPath, void 0);
      return normalizedValue;
    }
    exports2.normalizeConfigurationUpdateEvent = normalizeConfigurationUpdateEvent;
    function normalizeMQTTMessage(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "topicName", value.topicName);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "payload", value.payload, eventstream_rpc_utils.encodePayloadAsString);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "retain", value.retain);
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "userProperties", value.userProperties, normalizeUserProperty);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "messageExpiryIntervalSeconds", value.messageExpiryIntervalSeconds);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "correlationData", value.correlationData, eventstream_rpc_utils.encodePayloadAsString);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "responseTopic", value.responseTopic);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "payloadFormat", value.payloadFormat);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "contentType", value.contentType);
      return normalizedValue;
    }
    exports2.normalizeMQTTMessage = normalizeMQTTMessage;
    function normalizeComponentUpdatePolicyEvents(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "preUpdateEvent", value.preUpdateEvent, normalizePreComponentUpdateEvent);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "postUpdateEvent", value.postUpdateEvent, normalizePostComponentUpdateEvent);
      return normalizedValue;
    }
    exports2.normalizeComponentUpdatePolicyEvents = normalizeComponentUpdatePolicyEvents;
    function normalizeSecretValue(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "secretString", value.secretString);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "secretBinary", value.secretBinary, eventstream_rpc_utils.encodePayloadAsString);
      return normalizedValue;
    }
    exports2.normalizeSecretValue = normalizeSecretValue;
    function normalizeConfigurationValidityReport(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "status", value.status);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "deploymentId", value.deploymentId);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeConfigurationValidityReport = normalizeConfigurationValidityReport;
    function normalizeClientDeviceCredential(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "clientDeviceCertificate", value.clientDeviceCertificate);
      return normalizedValue;
    }
    exports2.normalizeClientDeviceCredential = normalizeClientDeviceCredential;
    function normalizeCertificateUpdateEvent(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "certificateUpdate", value.certificateUpdate, normalizeCertificateUpdate);
      return normalizedValue;
    }
    exports2.normalizeCertificateUpdateEvent = normalizeCertificateUpdateEvent;
    function normalizeCertificateOptions(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "certificateType", value.certificateType);
      return normalizedValue;
    }
    exports2.normalizeCertificateOptions = normalizeCertificateOptions;
    function normalizePublishMessage(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "jsonMessage", value.jsonMessage, normalizeJsonMessage);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "binaryMessage", value.binaryMessage, normalizeBinaryMessage);
      return normalizedValue;
    }
    exports2.normalizePublishMessage = normalizePublishMessage;
    function normalizeCredentialDocument(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "mqttCredential", value.mqttCredential, normalizeMQTTCredential);
      return normalizedValue;
    }
    exports2.normalizeCredentialDocument = normalizeCredentialDocument;
    function normalizeSubscriptionResponseMessage(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "jsonMessage", value.jsonMessage, normalizeJsonMessage);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "binaryMessage", value.binaryMessage, normalizeBinaryMessage);
      return normalizedValue;
    }
    exports2.normalizeSubscriptionResponseMessage = normalizeSubscriptionResponseMessage;
    function normalizeValidateConfigurationUpdateEvents(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "validateConfigurationUpdateEvent", value.validateConfigurationUpdateEvent, normalizeValidateConfigurationUpdateEvent);
      return normalizedValue;
    }
    exports2.normalizeValidateConfigurationUpdateEvents = normalizeValidateConfigurationUpdateEvents;
    function normalizeConfigurationUpdateEvents(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "configurationUpdateEvent", value.configurationUpdateEvent, normalizeConfigurationUpdateEvent);
      return normalizedValue;
    }
    exports2.normalizeConfigurationUpdateEvents = normalizeConfigurationUpdateEvents;
    function normalizeIoTCoreMessage(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message, normalizeMQTTMessage);
      return normalizedValue;
    }
    exports2.normalizeIoTCoreMessage = normalizeIoTCoreMessage;
    function normalizeInvalidArgumentsError(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeInvalidArgumentsError = normalizeInvalidArgumentsError;
    function normalizeInvalidArtifactsDirectoryPathError(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeInvalidArtifactsDirectoryPathError = normalizeInvalidArtifactsDirectoryPathError;
    function normalizeInvalidRecipeDirectoryPathError(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeInvalidRecipeDirectoryPathError = normalizeInvalidRecipeDirectoryPathError;
    function normalizeServiceError(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "context", value.context);
      return normalizedValue;
    }
    exports2.normalizeServiceError = normalizeServiceError;
    function normalizeCreateLocalDeploymentResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "deploymentId", value.deploymentId);
      return normalizedValue;
    }
    exports2.normalizeCreateLocalDeploymentResponse = normalizeCreateLocalDeploymentResponse;
    function normalizeCreateLocalDeploymentRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "groupName", value.groupName);
      eventstream_rpc_utils.setDefinedMapPropertyAsObject(normalizedValue, "rootComponentVersionsToAdd", value.rootComponentVersionsToAdd, void 0, void 0);
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "rootComponentsToRemove", value.rootComponentsToRemove, void 0);
      eventstream_rpc_utils.setDefinedMapPropertyAsObject(normalizedValue, "componentToConfiguration", value.componentToConfiguration, void 0, void 0);
      eventstream_rpc_utils.setDefinedMapPropertyAsObject(normalizedValue, "componentToRunWithInfo", value.componentToRunWithInfo, void 0, normalizeRunWithInfo);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "recipeDirectoryPath", value.recipeDirectoryPath);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "artifactsDirectoryPath", value.artifactsDirectoryPath);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "failureHandlingPolicy", value.failureHandlingPolicy);
      return normalizedValue;
    }
    exports2.normalizeCreateLocalDeploymentRequest = normalizeCreateLocalDeploymentRequest;
    function normalizeResourceNotFoundError(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "resourceType", value.resourceType);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "resourceName", value.resourceName);
      return normalizedValue;
    }
    exports2.normalizeResourceNotFoundError = normalizeResourceNotFoundError;
    function normalizeUnauthorizedError(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeUnauthorizedError = normalizeUnauthorizedError;
    function normalizePauseComponentResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizePauseComponentResponse = normalizePauseComponentResponse;
    function normalizePauseComponentRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "componentName", value.componentName);
      return normalizedValue;
    }
    exports2.normalizePauseComponentRequest = normalizePauseComponentRequest;
    function normalizeComponentNotFoundError(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeComponentNotFoundError = normalizeComponentNotFoundError;
    function normalizeStopComponentResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "stopStatus", value.stopStatus);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeStopComponentResponse = normalizeStopComponentResponse;
    function normalizeStopComponentRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "componentName", value.componentName);
      return normalizedValue;
    }
    exports2.normalizeStopComponentRequest = normalizeStopComponentRequest;
    function normalizeListLocalDeploymentsResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "localDeployments", value.localDeployments, normalizeLocalDeployment);
      return normalizedValue;
    }
    exports2.normalizeListLocalDeploymentsResponse = normalizeListLocalDeploymentsResponse;
    function normalizeListLocalDeploymentsRequest(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeListLocalDeploymentsRequest = normalizeListLocalDeploymentsRequest;
    function normalizeSubscribeToComponentUpdatesResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeSubscribeToComponentUpdatesResponse = normalizeSubscribeToComponentUpdatesResponse;
    function normalizeSubscribeToComponentUpdatesRequest(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeSubscribeToComponentUpdatesRequest = normalizeSubscribeToComponentUpdatesRequest;
    function normalizeListNamedShadowsForThingResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "results", value.results, void 0);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "timestamp", value.timestamp, eventstream_rpc_utils.encodeDateAsNumber);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "nextToken", value.nextToken);
      return normalizedValue;
    }
    exports2.normalizeListNamedShadowsForThingResponse = normalizeListNamedShadowsForThingResponse;
    function normalizeListNamedShadowsForThingRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "thingName", value.thingName);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "nextToken", value.nextToken);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "pageSize", value.pageSize);
      return normalizedValue;
    }
    exports2.normalizeListNamedShadowsForThingRequest = normalizeListNamedShadowsForThingRequest;
    function normalizeCancelLocalDeploymentResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeCancelLocalDeploymentResponse = normalizeCancelLocalDeploymentResponse;
    function normalizeCancelLocalDeploymentRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "deploymentId", value.deploymentId);
      return normalizedValue;
    }
    exports2.normalizeCancelLocalDeploymentRequest = normalizeCancelLocalDeploymentRequest;
    function normalizeUpdateStateResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeUpdateStateResponse = normalizeUpdateStateResponse;
    function normalizeUpdateStateRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "state", value.state);
      return normalizedValue;
    }
    exports2.normalizeUpdateStateRequest = normalizeUpdateStateRequest;
    function normalizeGetSecretValueResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "secretId", value.secretId);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "versionId", value.versionId);
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "versionStage", value.versionStage, void 0);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "secretValue", value.secretValue, normalizeSecretValue);
      return normalizedValue;
    }
    exports2.normalizeGetSecretValueResponse = normalizeGetSecretValueResponse;
    function normalizeGetSecretValueRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "secretId", value.secretId);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "versionId", value.versionId);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "versionStage", value.versionStage);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "refresh", value.refresh);
      return normalizedValue;
    }
    exports2.normalizeGetSecretValueRequest = normalizeGetSecretValueRequest;
    function normalizeGetLocalDeploymentStatusResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "deployment", value.deployment, normalizeLocalDeployment);
      return normalizedValue;
    }
    exports2.normalizeGetLocalDeploymentStatusResponse = normalizeGetLocalDeploymentStatusResponse;
    function normalizeGetLocalDeploymentStatusRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "deploymentId", value.deploymentId);
      return normalizedValue;
    }
    exports2.normalizeGetLocalDeploymentStatusRequest = normalizeGetLocalDeploymentStatusRequest;
    function normalizeRestartComponentResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "restartStatus", value.restartStatus);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeRestartComponentResponse = normalizeRestartComponentResponse;
    function normalizeRestartComponentRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "componentName", value.componentName);
      return normalizedValue;
    }
    exports2.normalizeRestartComponentRequest = normalizeRestartComponentRequest;
    function normalizeInvalidTokenError(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeInvalidTokenError = normalizeInvalidTokenError;
    function normalizeValidateAuthorizationTokenResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "isValid", value.isValid);
      return normalizedValue;
    }
    exports2.normalizeValidateAuthorizationTokenResponse = normalizeValidateAuthorizationTokenResponse;
    function normalizeValidateAuthorizationTokenRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "token", value.token);
      return normalizedValue;
    }
    exports2.normalizeValidateAuthorizationTokenRequest = normalizeValidateAuthorizationTokenRequest;
    function normalizeFailedUpdateConditionCheckError(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeFailedUpdateConditionCheckError = normalizeFailedUpdateConditionCheckError;
    function normalizeConflictError(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeConflictError = normalizeConflictError;
    function normalizeUpdateConfigurationResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeUpdateConfigurationResponse = normalizeUpdateConfigurationResponse;
    function normalizeUpdateConfigurationRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "keyPath", value.keyPath, void 0);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "timestamp", value.timestamp, eventstream_rpc_utils.encodeDateAsNumber);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "valueToMerge", value.valueToMerge);
      return normalizedValue;
    }
    exports2.normalizeUpdateConfigurationRequest = normalizeUpdateConfigurationRequest;
    function normalizeUpdateThingShadowResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "payload", value.payload, eventstream_rpc_utils.encodePayloadAsString);
      return normalizedValue;
    }
    exports2.normalizeUpdateThingShadowResponse = normalizeUpdateThingShadowResponse;
    function normalizeUpdateThingShadowRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "thingName", value.thingName);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "shadowName", value.shadowName);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "payload", value.payload, eventstream_rpc_utils.encodePayloadAsString);
      return normalizedValue;
    }
    exports2.normalizeUpdateThingShadowRequest = normalizeUpdateThingShadowRequest;
    function normalizeSendConfigurationValidityReportResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeSendConfigurationValidityReportResponse = normalizeSendConfigurationValidityReportResponse;
    function normalizeSendConfigurationValidityReportRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "configurationValidityReport", value.configurationValidityReport, normalizeConfigurationValidityReport);
      return normalizedValue;
    }
    exports2.normalizeSendConfigurationValidityReportRequest = normalizeSendConfigurationValidityReportRequest;
    function normalizeGetThingShadowResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "payload", value.payload, eventstream_rpc_utils.encodePayloadAsString);
      return normalizedValue;
    }
    exports2.normalizeGetThingShadowResponse = normalizeGetThingShadowResponse;
    function normalizeGetThingShadowRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "thingName", value.thingName);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "shadowName", value.shadowName);
      return normalizedValue;
    }
    exports2.normalizeGetThingShadowRequest = normalizeGetThingShadowRequest;
    function normalizeCreateDebugPasswordResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "password", value.password);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "username", value.username);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "passwordExpiration", value.passwordExpiration, eventstream_rpc_utils.encodeDateAsNumber);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "certificateSHA256Hash", value.certificateSHA256Hash);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "certificateSHA1Hash", value.certificateSHA1Hash);
      return normalizedValue;
    }
    exports2.normalizeCreateDebugPasswordResponse = normalizeCreateDebugPasswordResponse;
    function normalizeCreateDebugPasswordRequest(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeCreateDebugPasswordRequest = normalizeCreateDebugPasswordRequest;
    function normalizeListComponentsResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "components", value.components, normalizeComponentDetails);
      return normalizedValue;
    }
    exports2.normalizeListComponentsResponse = normalizeListComponentsResponse;
    function normalizeListComponentsRequest(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeListComponentsRequest = normalizeListComponentsRequest;
    function normalizeInvalidClientDeviceAuthTokenError(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeInvalidClientDeviceAuthTokenError = normalizeInvalidClientDeviceAuthTokenError;
    function normalizeAuthorizeClientDeviceActionResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "isAuthorized", value.isAuthorized);
      return normalizedValue;
    }
    exports2.normalizeAuthorizeClientDeviceActionResponse = normalizeAuthorizeClientDeviceActionResponse;
    function normalizeAuthorizeClientDeviceActionRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "clientDeviceAuthToken", value.clientDeviceAuthToken);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "operation", value.operation);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "resource", value.resource);
      return normalizedValue;
    }
    exports2.normalizeAuthorizeClientDeviceActionRequest = normalizeAuthorizeClientDeviceActionRequest;
    function normalizeVerifyClientDeviceIdentityResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "isValidClientDevice", value.isValidClientDevice);
      return normalizedValue;
    }
    exports2.normalizeVerifyClientDeviceIdentityResponse = normalizeVerifyClientDeviceIdentityResponse;
    function normalizeVerifyClientDeviceIdentityRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "credential", value.credential, normalizeClientDeviceCredential);
      return normalizedValue;
    }
    exports2.normalizeVerifyClientDeviceIdentityRequest = normalizeVerifyClientDeviceIdentityRequest;
    function normalizeSubscribeToCertificateUpdatesResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeSubscribeToCertificateUpdatesResponse = normalizeSubscribeToCertificateUpdatesResponse;
    function normalizeSubscribeToCertificateUpdatesRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "certificateOptions", value.certificateOptions, normalizeCertificateOptions);
      return normalizedValue;
    }
    exports2.normalizeSubscribeToCertificateUpdatesRequest = normalizeSubscribeToCertificateUpdatesRequest;
    function normalizePublishToTopicResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizePublishToTopicResponse = normalizePublishToTopicResponse;
    function normalizePublishToTopicRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "topic", value.topic);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "publishMessage", value.publishMessage, normalizePublishMessage);
      return normalizedValue;
    }
    exports2.normalizePublishToTopicRequest = normalizePublishToTopicRequest;
    function normalizeInvalidCredentialError(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      return normalizedValue;
    }
    exports2.normalizeInvalidCredentialError = normalizeInvalidCredentialError;
    function normalizeGetClientDeviceAuthTokenResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "clientDeviceAuthToken", value.clientDeviceAuthToken);
      return normalizedValue;
    }
    exports2.normalizeGetClientDeviceAuthTokenResponse = normalizeGetClientDeviceAuthTokenResponse;
    function normalizeGetClientDeviceAuthTokenRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "credential", value.credential, normalizeCredentialDocument);
      return normalizedValue;
    }
    exports2.normalizeGetClientDeviceAuthTokenRequest = normalizeGetClientDeviceAuthTokenRequest;
    function normalizeGetComponentDetailsResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "componentDetails", value.componentDetails, normalizeComponentDetails);
      return normalizedValue;
    }
    exports2.normalizeGetComponentDetailsResponse = normalizeGetComponentDetailsResponse;
    function normalizeGetComponentDetailsRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "componentName", value.componentName);
      return normalizedValue;
    }
    exports2.normalizeGetComponentDetailsRequest = normalizeGetComponentDetailsRequest;
    function normalizeSubscribeToTopicResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "topicName", value.topicName);
      return normalizedValue;
    }
    exports2.normalizeSubscribeToTopicResponse = normalizeSubscribeToTopicResponse;
    function normalizeSubscribeToTopicRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "topic", value.topic);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "receiveMode", value.receiveMode);
      return normalizedValue;
    }
    exports2.normalizeSubscribeToTopicRequest = normalizeSubscribeToTopicRequest;
    function normalizeGetConfigurationResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "componentName", value.componentName);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "value", value.value);
      return normalizedValue;
    }
    exports2.normalizeGetConfigurationResponse = normalizeGetConfigurationResponse;
    function normalizeGetConfigurationRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "componentName", value.componentName);
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "keyPath", value.keyPath, void 0);
      return normalizedValue;
    }
    exports2.normalizeGetConfigurationRequest = normalizeGetConfigurationRequest;
    function normalizeSubscribeToValidateConfigurationUpdatesResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeSubscribeToValidateConfigurationUpdatesResponse = normalizeSubscribeToValidateConfigurationUpdatesResponse;
    function normalizeSubscribeToValidateConfigurationUpdatesRequest(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeSubscribeToValidateConfigurationUpdatesRequest = normalizeSubscribeToValidateConfigurationUpdatesRequest;
    function normalizeDeferComponentUpdateResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeDeferComponentUpdateResponse = normalizeDeferComponentUpdateResponse;
    function normalizeDeferComponentUpdateRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "deploymentId", value.deploymentId);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "message", value.message);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "recheckAfterMs", value.recheckAfterMs);
      return normalizedValue;
    }
    exports2.normalizeDeferComponentUpdateRequest = normalizeDeferComponentUpdateRequest;
    function normalizePutComponentMetricResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizePutComponentMetricResponse = normalizePutComponentMetricResponse;
    function normalizePutComponentMetricRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "metrics", value.metrics, normalizeMetric);
      return normalizedValue;
    }
    exports2.normalizePutComponentMetricRequest = normalizePutComponentMetricRequest;
    function normalizeDeleteThingShadowResponse(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "payload", value.payload, eventstream_rpc_utils.encodePayloadAsString);
      return normalizedValue;
    }
    exports2.normalizeDeleteThingShadowResponse = normalizeDeleteThingShadowResponse;
    function normalizeDeleteThingShadowRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "thingName", value.thingName);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "shadowName", value.shadowName);
      return normalizedValue;
    }
    exports2.normalizeDeleteThingShadowRequest = normalizeDeleteThingShadowRequest;
    function normalizeSubscribeToConfigurationUpdateResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeSubscribeToConfigurationUpdateResponse = normalizeSubscribeToConfigurationUpdateResponse;
    function normalizeSubscribeToConfigurationUpdateRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "componentName", value.componentName);
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "keyPath", value.keyPath, void 0);
      return normalizedValue;
    }
    exports2.normalizeSubscribeToConfigurationUpdateRequest = normalizeSubscribeToConfigurationUpdateRequest;
    function normalizePublishToIoTCoreResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizePublishToIoTCoreResponse = normalizePublishToIoTCoreResponse;
    function normalizePublishToIoTCoreRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "topicName", value.topicName);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "qos", value.qos);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "payload", value.payload, eventstream_rpc_utils.encodePayloadAsString);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "retain", value.retain);
      eventstream_rpc_utils.setDefinedArrayProperty(normalizedValue, "userProperties", value.userProperties, normalizeUserProperty);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "messageExpiryIntervalSeconds", value.messageExpiryIntervalSeconds);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "correlationData", value.correlationData, eventstream_rpc_utils.encodePayloadAsString);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "responseTopic", value.responseTopic);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "payloadFormat", value.payloadFormat);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "contentType", value.contentType);
      return normalizedValue;
    }
    exports2.normalizePublishToIoTCoreRequest = normalizePublishToIoTCoreRequest;
    function normalizeResumeComponentResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeResumeComponentResponse = normalizeResumeComponentResponse;
    function normalizeResumeComponentRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "componentName", value.componentName);
      return normalizedValue;
    }
    exports2.normalizeResumeComponentRequest = normalizeResumeComponentRequest;
    function normalizeSubscribeToIoTCoreResponse(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    exports2.normalizeSubscribeToIoTCoreResponse = normalizeSubscribeToIoTCoreResponse;
    function normalizeSubscribeToIoTCoreRequest(value) {
      let normalizedValue = {};
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "topicName", value.topicName);
      eventstream_rpc_utils.setDefinedProperty(normalizedValue, "qos", value.qos);
      return normalizedValue;
    }
    exports2.normalizeSubscribeToIoTCoreRequest = normalizeSubscribeToIoTCoreRequest;
    function validateUserProperty(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.key, "key", "UserProperty");
      eventstream_rpc_utils.validateValueAsOptionalString(value.value, "value", "UserProperty");
    }
    exports2.validateUserProperty = validateUserProperty;
    function validateSystemResourceLimits(value) {
      eventstream_rpc_utils.validateValueAsOptionalInteger(value.memory, "memory", "SystemResourceLimits");
      eventstream_rpc_utils.validateValueAsOptionalNumber(value.cpus, "cpus", "SystemResourceLimits");
    }
    exports2.validateSystemResourceLimits = validateSystemResourceLimits;
    function validateDeploymentStatusDetails(value) {
      eventstream_rpc_utils.validateValueAsString(value.detailedDeploymentStatus, "detailedDeploymentStatus", "DeploymentStatusDetails");
      eventstream_rpc_utils.validateValueAsOptionalArray(value.deploymentErrorStack, eventstream_rpc_utils.validateValueAsString, "deploymentErrorStack", "DeploymentStatusDetails");
      eventstream_rpc_utils.validateValueAsOptionalArray(value.deploymentErrorTypes, eventstream_rpc_utils.validateValueAsString, "deploymentErrorTypes", "DeploymentStatusDetails");
      eventstream_rpc_utils.validateValueAsOptionalString(value.deploymentFailureCause, "deploymentFailureCause", "DeploymentStatusDetails");
    }
    exports2.validateDeploymentStatusDetails = validateDeploymentStatusDetails;
    function validateMessageContext(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.topic, "topic", "MessageContext");
    }
    exports2.validateMessageContext = validateMessageContext;
    function validateRunWithInfo(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.posixUser, "posixUser", "RunWithInfo");
      eventstream_rpc_utils.validateValueAsOptionalString(value.windowsUser, "windowsUser", "RunWithInfo");
      eventstream_rpc_utils.validateValueAsOptionalObject(value.systemResourceLimits, validateSystemResourceLimits, "systemResourceLimits", "RunWithInfo");
    }
    exports2.validateRunWithInfo = validateRunWithInfo;
    function validateLocalDeployment(value) {
      eventstream_rpc_utils.validateValueAsString(value.deploymentId, "deploymentId", "LocalDeployment");
      eventstream_rpc_utils.validateValueAsString(value.status, "status", "LocalDeployment");
      eventstream_rpc_utils.validateValueAsOptionalString(value.createdOn, "createdOn", "LocalDeployment");
      eventstream_rpc_utils.validateValueAsOptionalObject(value.deploymentStatusDetails, validateDeploymentStatusDetails, "deploymentStatusDetails", "LocalDeployment");
    }
    exports2.validateLocalDeployment = validateLocalDeployment;
    function validatePostComponentUpdateEvent(value) {
      eventstream_rpc_utils.validateValueAsString(value.deploymentId, "deploymentId", "PostComponentUpdateEvent");
    }
    exports2.validatePostComponentUpdateEvent = validatePostComponentUpdateEvent;
    function validatePreComponentUpdateEvent(value) {
      eventstream_rpc_utils.validateValueAsString(value.deploymentId, "deploymentId", "PreComponentUpdateEvent");
      eventstream_rpc_utils.validateValueAsBoolean(value.isGgcRestarting, "isGgcRestarting", "PreComponentUpdateEvent");
    }
    exports2.validatePreComponentUpdateEvent = validatePreComponentUpdateEvent;
    function validateComponentDetails(value) {
      eventstream_rpc_utils.validateValueAsString(value.componentName, "componentName", "ComponentDetails");
      eventstream_rpc_utils.validateValueAsString(value.version, "version", "ComponentDetails");
      eventstream_rpc_utils.validateValueAsString(value.state, "state", "ComponentDetails");
      eventstream_rpc_utils.validateValueAsOptionalAny(value.configuration, "configuration", "ComponentDetails");
    }
    exports2.validateComponentDetails = validateComponentDetails;
    function validateCertificateUpdate(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.privateKey, "privateKey", "CertificateUpdate");
      eventstream_rpc_utils.validateValueAsOptionalString(value.publicKey, "publicKey", "CertificateUpdate");
      eventstream_rpc_utils.validateValueAsOptionalString(value.certificate, "certificate", "CertificateUpdate");
      eventstream_rpc_utils.validateValueAsOptionalArray(value.caCertificates, eventstream_rpc_utils.validateValueAsString, "caCertificates", "CertificateUpdate");
    }
    exports2.validateCertificateUpdate = validateCertificateUpdate;
    function validateBinaryMessage(value) {
      eventstream_rpc_utils.validateValueAsOptionalBlob(value.message, "message", "BinaryMessage");
      eventstream_rpc_utils.validateValueAsOptionalObject(value.context, validateMessageContext, "context", "BinaryMessage");
    }
    exports2.validateBinaryMessage = validateBinaryMessage;
    function validateJsonMessage(value) {
      eventstream_rpc_utils.validateValueAsOptionalAny(value.message, "message", "JsonMessage");
      eventstream_rpc_utils.validateValueAsOptionalObject(value.context, validateMessageContext, "context", "JsonMessage");
    }
    exports2.validateJsonMessage = validateJsonMessage;
    function validateMQTTCredential(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.clientId, "clientId", "MQTTCredential");
      eventstream_rpc_utils.validateValueAsOptionalString(value.certificatePem, "certificatePem", "MQTTCredential");
      eventstream_rpc_utils.validateValueAsOptionalString(value.username, "username", "MQTTCredential");
      eventstream_rpc_utils.validateValueAsOptionalString(value.password, "password", "MQTTCredential");
    }
    exports2.validateMQTTCredential = validateMQTTCredential;
    function validateValidateConfigurationUpdateEvent(value) {
      eventstream_rpc_utils.validateValueAsOptionalAny(value.configuration, "configuration", "ValidateConfigurationUpdateEvent");
      eventstream_rpc_utils.validateValueAsString(value.deploymentId, "deploymentId", "ValidateConfigurationUpdateEvent");
    }
    exports2.validateValidateConfigurationUpdateEvent = validateValidateConfigurationUpdateEvent;
    function validateMetric(value) {
      eventstream_rpc_utils.validateValueAsString(value.name, "name", "Metric");
      eventstream_rpc_utils.validateValueAsString(value.unit, "unit", "Metric");
      eventstream_rpc_utils.validateValueAsNumber(value.value, "value", "Metric");
    }
    exports2.validateMetric = validateMetric;
    function validateConfigurationUpdateEvent(value) {
      eventstream_rpc_utils.validateValueAsString(value.componentName, "componentName", "ConfigurationUpdateEvent");
      eventstream_rpc_utils.validateValueAsArray(value.keyPath, eventstream_rpc_utils.validateValueAsString, "keyPath", "ConfigurationUpdateEvent");
    }
    exports2.validateConfigurationUpdateEvent = validateConfigurationUpdateEvent;
    function validateMQTTMessage(value) {
      eventstream_rpc_utils.validateValueAsString(value.topicName, "topicName", "MQTTMessage");
      eventstream_rpc_utils.validateValueAsOptionalBlob(value.payload, "payload", "MQTTMessage");
      eventstream_rpc_utils.validateValueAsOptionalBoolean(value.retain, "retain", "MQTTMessage");
      eventstream_rpc_utils.validateValueAsOptionalArray(value.userProperties, validateUserProperty, "userProperties", "MQTTMessage");
      eventstream_rpc_utils.validateValueAsOptionalInteger(value.messageExpiryIntervalSeconds, "messageExpiryIntervalSeconds", "MQTTMessage");
      eventstream_rpc_utils.validateValueAsOptionalBlob(value.correlationData, "correlationData", "MQTTMessage");
      eventstream_rpc_utils.validateValueAsOptionalString(value.responseTopic, "responseTopic", "MQTTMessage");
      eventstream_rpc_utils.validateValueAsOptionalString(value.payloadFormat, "payloadFormat", "MQTTMessage");
      eventstream_rpc_utils.validateValueAsOptionalString(value.contentType, "contentType", "MQTTMessage");
    }
    exports2.validateMQTTMessage = validateMQTTMessage;
    var _ComponentUpdatePolicyEventsPropertyValidators = /* @__PURE__ */ new Map([
      ["preUpdateEvent", validatePreComponentUpdateEvent],
      ["postUpdateEvent", validatePostComponentUpdateEvent]
    ]);
    function validateComponentUpdatePolicyEvents(value) {
      eventstream_rpc_utils.validateValueAsUnion(value, _ComponentUpdatePolicyEventsPropertyValidators);
    }
    exports2.validateComponentUpdatePolicyEvents = validateComponentUpdatePolicyEvents;
    var _SecretValuePropertyValidators = /* @__PURE__ */ new Map([
      ["secretString", eventstream_rpc_utils.validateValueAsString],
      ["secretBinary", eventstream_rpc_utils.validateValueAsBlob]
    ]);
    function validateSecretValue(value) {
      eventstream_rpc_utils.validateValueAsUnion(value, _SecretValuePropertyValidators);
    }
    exports2.validateSecretValue = validateSecretValue;
    function validateConfigurationValidityReport(value) {
      eventstream_rpc_utils.validateValueAsString(value.status, "status", "ConfigurationValidityReport");
      eventstream_rpc_utils.validateValueAsString(value.deploymentId, "deploymentId", "ConfigurationValidityReport");
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "ConfigurationValidityReport");
    }
    exports2.validateConfigurationValidityReport = validateConfigurationValidityReport;
    var _ClientDeviceCredentialPropertyValidators = /* @__PURE__ */ new Map([
      ["clientDeviceCertificate", eventstream_rpc_utils.validateValueAsString]
    ]);
    function validateClientDeviceCredential(value) {
      eventstream_rpc_utils.validateValueAsUnion(value, _ClientDeviceCredentialPropertyValidators);
    }
    exports2.validateClientDeviceCredential = validateClientDeviceCredential;
    var _CertificateUpdateEventPropertyValidators = /* @__PURE__ */ new Map([
      ["certificateUpdate", validateCertificateUpdate]
    ]);
    function validateCertificateUpdateEvent(value) {
      eventstream_rpc_utils.validateValueAsUnion(value, _CertificateUpdateEventPropertyValidators);
    }
    exports2.validateCertificateUpdateEvent = validateCertificateUpdateEvent;
    function validateCertificateOptions(value) {
      eventstream_rpc_utils.validateValueAsString(value.certificateType, "certificateType", "CertificateOptions");
    }
    exports2.validateCertificateOptions = validateCertificateOptions;
    var _PublishMessagePropertyValidators = /* @__PURE__ */ new Map([
      ["jsonMessage", validateJsonMessage],
      ["binaryMessage", validateBinaryMessage]
    ]);
    function validatePublishMessage(value) {
      eventstream_rpc_utils.validateValueAsUnion(value, _PublishMessagePropertyValidators);
    }
    exports2.validatePublishMessage = validatePublishMessage;
    var _CredentialDocumentPropertyValidators = /* @__PURE__ */ new Map([
      ["mqttCredential", validateMQTTCredential]
    ]);
    function validateCredentialDocument(value) {
      eventstream_rpc_utils.validateValueAsUnion(value, _CredentialDocumentPropertyValidators);
    }
    exports2.validateCredentialDocument = validateCredentialDocument;
    var _SubscriptionResponseMessagePropertyValidators = /* @__PURE__ */ new Map([
      ["jsonMessage", validateJsonMessage],
      ["binaryMessage", validateBinaryMessage]
    ]);
    function validateSubscriptionResponseMessage(value) {
      eventstream_rpc_utils.validateValueAsUnion(value, _SubscriptionResponseMessagePropertyValidators);
    }
    exports2.validateSubscriptionResponseMessage = validateSubscriptionResponseMessage;
    var _ValidateConfigurationUpdateEventsPropertyValidators = /* @__PURE__ */ new Map([
      ["validateConfigurationUpdateEvent", validateValidateConfigurationUpdateEvent]
    ]);
    function validateValidateConfigurationUpdateEvents(value) {
      eventstream_rpc_utils.validateValueAsUnion(value, _ValidateConfigurationUpdateEventsPropertyValidators);
    }
    exports2.validateValidateConfigurationUpdateEvents = validateValidateConfigurationUpdateEvents;
    var _ConfigurationUpdateEventsPropertyValidators = /* @__PURE__ */ new Map([
      ["configurationUpdateEvent", validateConfigurationUpdateEvent]
    ]);
    function validateConfigurationUpdateEvents(value) {
      eventstream_rpc_utils.validateValueAsUnion(value, _ConfigurationUpdateEventsPropertyValidators);
    }
    exports2.validateConfigurationUpdateEvents = validateConfigurationUpdateEvents;
    var _IoTCoreMessagePropertyValidators = /* @__PURE__ */ new Map([
      ["message", validateMQTTMessage]
    ]);
    function validateIoTCoreMessage(value) {
      eventstream_rpc_utils.validateValueAsUnion(value, _IoTCoreMessagePropertyValidators);
    }
    exports2.validateIoTCoreMessage = validateIoTCoreMessage;
    function validateInvalidArgumentsError(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "InvalidArgumentsError");
    }
    exports2.validateInvalidArgumentsError = validateInvalidArgumentsError;
    function validateInvalidArtifactsDirectoryPathError(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "InvalidArtifactsDirectoryPathError");
    }
    exports2.validateInvalidArtifactsDirectoryPathError = validateInvalidArtifactsDirectoryPathError;
    function validateInvalidRecipeDirectoryPathError(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "InvalidRecipeDirectoryPathError");
    }
    exports2.validateInvalidRecipeDirectoryPathError = validateInvalidRecipeDirectoryPathError;
    function validateServiceError(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "ServiceError");
      eventstream_rpc_utils.validateValueAsOptionalAny(value.context, "context", "ServiceError");
    }
    exports2.validateServiceError = validateServiceError;
    function validateCreateLocalDeploymentResponse(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.deploymentId, "deploymentId", "CreateLocalDeploymentResponse");
    }
    exports2.validateCreateLocalDeploymentResponse = validateCreateLocalDeploymentResponse;
    function validateCreateLocalDeploymentRequest(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.groupName, "groupName", "CreateLocalDeploymentRequest");
      eventstream_rpc_utils.validateValueAsOptionalMap(value.rootComponentVersionsToAdd, eventstream_rpc_utils.validateValueAsString, eventstream_rpc_utils.validateValueAsString, "rootComponentVersionsToAdd", "CreateLocalDeploymentRequest");
      eventstream_rpc_utils.validateValueAsOptionalArray(value.rootComponentsToRemove, eventstream_rpc_utils.validateValueAsString, "rootComponentsToRemove", "CreateLocalDeploymentRequest");
      eventstream_rpc_utils.validateValueAsOptionalMap(value.componentToConfiguration, eventstream_rpc_utils.validateValueAsString, eventstream_rpc_utils.validateValueAsAny, "componentToConfiguration", "CreateLocalDeploymentRequest");
      eventstream_rpc_utils.validateValueAsOptionalMap(value.componentToRunWithInfo, eventstream_rpc_utils.validateValueAsString, validateRunWithInfo, "componentToRunWithInfo", "CreateLocalDeploymentRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.recipeDirectoryPath, "recipeDirectoryPath", "CreateLocalDeploymentRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.artifactsDirectoryPath, "artifactsDirectoryPath", "CreateLocalDeploymentRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.failureHandlingPolicy, "failureHandlingPolicy", "CreateLocalDeploymentRequest");
    }
    exports2.validateCreateLocalDeploymentRequest = validateCreateLocalDeploymentRequest;
    function validateResourceNotFoundError(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "ResourceNotFoundError");
      eventstream_rpc_utils.validateValueAsOptionalString(value.resourceType, "resourceType", "ResourceNotFoundError");
      eventstream_rpc_utils.validateValueAsOptionalString(value.resourceName, "resourceName", "ResourceNotFoundError");
    }
    exports2.validateResourceNotFoundError = validateResourceNotFoundError;
    function validateUnauthorizedError(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "UnauthorizedError");
    }
    exports2.validateUnauthorizedError = validateUnauthorizedError;
    function validatePauseComponentResponse(value) {
    }
    exports2.validatePauseComponentResponse = validatePauseComponentResponse;
    function validatePauseComponentRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.componentName, "componentName", "PauseComponentRequest");
    }
    exports2.validatePauseComponentRequest = validatePauseComponentRequest;
    function validateComponentNotFoundError(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "ComponentNotFoundError");
    }
    exports2.validateComponentNotFoundError = validateComponentNotFoundError;
    function validateStopComponentResponse(value) {
      eventstream_rpc_utils.validateValueAsString(value.stopStatus, "stopStatus", "StopComponentResponse");
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "StopComponentResponse");
    }
    exports2.validateStopComponentResponse = validateStopComponentResponse;
    function validateStopComponentRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.componentName, "componentName", "StopComponentRequest");
    }
    exports2.validateStopComponentRequest = validateStopComponentRequest;
    function validateListLocalDeploymentsResponse(value) {
      eventstream_rpc_utils.validateValueAsOptionalArray(value.localDeployments, validateLocalDeployment, "localDeployments", "ListLocalDeploymentsResponse");
    }
    exports2.validateListLocalDeploymentsResponse = validateListLocalDeploymentsResponse;
    function validateListLocalDeploymentsRequest(value) {
    }
    exports2.validateListLocalDeploymentsRequest = validateListLocalDeploymentsRequest;
    function validateSubscribeToComponentUpdatesResponse(value) {
    }
    exports2.validateSubscribeToComponentUpdatesResponse = validateSubscribeToComponentUpdatesResponse;
    function validateSubscribeToComponentUpdatesRequest(value) {
    }
    exports2.validateSubscribeToComponentUpdatesRequest = validateSubscribeToComponentUpdatesRequest;
    function validateListNamedShadowsForThingResponse(value) {
      eventstream_rpc_utils.validateValueAsArray(value.results, eventstream_rpc_utils.validateValueAsString, "results", "ListNamedShadowsForThingResponse");
      eventstream_rpc_utils.validateValueAsDate(value.timestamp, "timestamp", "ListNamedShadowsForThingResponse");
      eventstream_rpc_utils.validateValueAsOptionalString(value.nextToken, "nextToken", "ListNamedShadowsForThingResponse");
    }
    exports2.validateListNamedShadowsForThingResponse = validateListNamedShadowsForThingResponse;
    function validateListNamedShadowsForThingRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.thingName, "thingName", "ListNamedShadowsForThingRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.nextToken, "nextToken", "ListNamedShadowsForThingRequest");
      eventstream_rpc_utils.validateValueAsOptionalInteger(value.pageSize, "pageSize", "ListNamedShadowsForThingRequest");
    }
    exports2.validateListNamedShadowsForThingRequest = validateListNamedShadowsForThingRequest;
    function validateCancelLocalDeploymentResponse(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "CancelLocalDeploymentResponse");
    }
    exports2.validateCancelLocalDeploymentResponse = validateCancelLocalDeploymentResponse;
    function validateCancelLocalDeploymentRequest(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.deploymentId, "deploymentId", "CancelLocalDeploymentRequest");
    }
    exports2.validateCancelLocalDeploymentRequest = validateCancelLocalDeploymentRequest;
    function validateUpdateStateResponse(value) {
    }
    exports2.validateUpdateStateResponse = validateUpdateStateResponse;
    function validateUpdateStateRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.state, "state", "UpdateStateRequest");
    }
    exports2.validateUpdateStateRequest = validateUpdateStateRequest;
    function validateGetSecretValueResponse(value) {
      eventstream_rpc_utils.validateValueAsString(value.secretId, "secretId", "GetSecretValueResponse");
      eventstream_rpc_utils.validateValueAsString(value.versionId, "versionId", "GetSecretValueResponse");
      eventstream_rpc_utils.validateValueAsArray(value.versionStage, eventstream_rpc_utils.validateValueAsString, "versionStage", "GetSecretValueResponse");
      eventstream_rpc_utils.validateValueAsUnion(value.secretValue, _SecretValuePropertyValidators);
    }
    exports2.validateGetSecretValueResponse = validateGetSecretValueResponse;
    function validateGetSecretValueRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.secretId, "secretId", "GetSecretValueRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.versionId, "versionId", "GetSecretValueRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.versionStage, "versionStage", "GetSecretValueRequest");
      eventstream_rpc_utils.validateValueAsOptionalBoolean(value.refresh, "refresh", "GetSecretValueRequest");
    }
    exports2.validateGetSecretValueRequest = validateGetSecretValueRequest;
    function validateGetLocalDeploymentStatusResponse(value) {
      eventstream_rpc_utils.validateValueAsObject(value.deployment, validateLocalDeployment, "deployment", "GetLocalDeploymentStatusResponse");
    }
    exports2.validateGetLocalDeploymentStatusResponse = validateGetLocalDeploymentStatusResponse;
    function validateGetLocalDeploymentStatusRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.deploymentId, "deploymentId", "GetLocalDeploymentStatusRequest");
    }
    exports2.validateGetLocalDeploymentStatusRequest = validateGetLocalDeploymentStatusRequest;
    function validateRestartComponentResponse(value) {
      eventstream_rpc_utils.validateValueAsString(value.restartStatus, "restartStatus", "RestartComponentResponse");
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "RestartComponentResponse");
    }
    exports2.validateRestartComponentResponse = validateRestartComponentResponse;
    function validateRestartComponentRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.componentName, "componentName", "RestartComponentRequest");
    }
    exports2.validateRestartComponentRequest = validateRestartComponentRequest;
    function validateInvalidTokenError(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "InvalidTokenError");
    }
    exports2.validateInvalidTokenError = validateInvalidTokenError;
    function validateValidateAuthorizationTokenResponse(value) {
      eventstream_rpc_utils.validateValueAsBoolean(value.isValid, "isValid", "ValidateAuthorizationTokenResponse");
    }
    exports2.validateValidateAuthorizationTokenResponse = validateValidateAuthorizationTokenResponse;
    function validateValidateAuthorizationTokenRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.token, "token", "ValidateAuthorizationTokenRequest");
    }
    exports2.validateValidateAuthorizationTokenRequest = validateValidateAuthorizationTokenRequest;
    function validateFailedUpdateConditionCheckError(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "FailedUpdateConditionCheckError");
    }
    exports2.validateFailedUpdateConditionCheckError = validateFailedUpdateConditionCheckError;
    function validateConflictError(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "ConflictError");
    }
    exports2.validateConflictError = validateConflictError;
    function validateUpdateConfigurationResponse(value) {
    }
    exports2.validateUpdateConfigurationResponse = validateUpdateConfigurationResponse;
    function validateUpdateConfigurationRequest(value) {
      eventstream_rpc_utils.validateValueAsOptionalArray(value.keyPath, eventstream_rpc_utils.validateValueAsString, "keyPath", "UpdateConfigurationRequest");
      eventstream_rpc_utils.validateValueAsDate(value.timestamp, "timestamp", "UpdateConfigurationRequest");
      eventstream_rpc_utils.validateValueAsAny(value.valueToMerge, "valueToMerge", "UpdateConfigurationRequest");
    }
    exports2.validateUpdateConfigurationRequest = validateUpdateConfigurationRequest;
    function validateUpdateThingShadowResponse(value) {
      eventstream_rpc_utils.validateValueAsBlob(value.payload, "payload", "UpdateThingShadowResponse");
    }
    exports2.validateUpdateThingShadowResponse = validateUpdateThingShadowResponse;
    function validateUpdateThingShadowRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.thingName, "thingName", "UpdateThingShadowRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.shadowName, "shadowName", "UpdateThingShadowRequest");
      eventstream_rpc_utils.validateValueAsBlob(value.payload, "payload", "UpdateThingShadowRequest");
    }
    exports2.validateUpdateThingShadowRequest = validateUpdateThingShadowRequest;
    function validateSendConfigurationValidityReportResponse(value) {
    }
    exports2.validateSendConfigurationValidityReportResponse = validateSendConfigurationValidityReportResponse;
    function validateSendConfigurationValidityReportRequest(value) {
      eventstream_rpc_utils.validateValueAsObject(value.configurationValidityReport, validateConfigurationValidityReport, "configurationValidityReport", "SendConfigurationValidityReportRequest");
    }
    exports2.validateSendConfigurationValidityReportRequest = validateSendConfigurationValidityReportRequest;
    function validateGetThingShadowResponse(value) {
      eventstream_rpc_utils.validateValueAsBlob(value.payload, "payload", "GetThingShadowResponse");
    }
    exports2.validateGetThingShadowResponse = validateGetThingShadowResponse;
    function validateGetThingShadowRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.thingName, "thingName", "GetThingShadowRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.shadowName, "shadowName", "GetThingShadowRequest");
    }
    exports2.validateGetThingShadowRequest = validateGetThingShadowRequest;
    function validateCreateDebugPasswordResponse(value) {
      eventstream_rpc_utils.validateValueAsString(value.password, "password", "CreateDebugPasswordResponse");
      eventstream_rpc_utils.validateValueAsString(value.username, "username", "CreateDebugPasswordResponse");
      eventstream_rpc_utils.validateValueAsDate(value.passwordExpiration, "passwordExpiration", "CreateDebugPasswordResponse");
      eventstream_rpc_utils.validateValueAsOptionalString(value.certificateSHA256Hash, "certificateSHA256Hash", "CreateDebugPasswordResponse");
      eventstream_rpc_utils.validateValueAsOptionalString(value.certificateSHA1Hash, "certificateSHA1Hash", "CreateDebugPasswordResponse");
    }
    exports2.validateCreateDebugPasswordResponse = validateCreateDebugPasswordResponse;
    function validateCreateDebugPasswordRequest(value) {
    }
    exports2.validateCreateDebugPasswordRequest = validateCreateDebugPasswordRequest;
    function validateListComponentsResponse(value) {
      eventstream_rpc_utils.validateValueAsOptionalArray(value.components, validateComponentDetails, "components", "ListComponentsResponse");
    }
    exports2.validateListComponentsResponse = validateListComponentsResponse;
    function validateListComponentsRequest(value) {
    }
    exports2.validateListComponentsRequest = validateListComponentsRequest;
    function validateInvalidClientDeviceAuthTokenError(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "InvalidClientDeviceAuthTokenError");
    }
    exports2.validateInvalidClientDeviceAuthTokenError = validateInvalidClientDeviceAuthTokenError;
    function validateAuthorizeClientDeviceActionResponse(value) {
      eventstream_rpc_utils.validateValueAsBoolean(value.isAuthorized, "isAuthorized", "AuthorizeClientDeviceActionResponse");
    }
    exports2.validateAuthorizeClientDeviceActionResponse = validateAuthorizeClientDeviceActionResponse;
    function validateAuthorizeClientDeviceActionRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.clientDeviceAuthToken, "clientDeviceAuthToken", "AuthorizeClientDeviceActionRequest");
      eventstream_rpc_utils.validateValueAsString(value.operation, "operation", "AuthorizeClientDeviceActionRequest");
      eventstream_rpc_utils.validateValueAsString(value.resource, "resource", "AuthorizeClientDeviceActionRequest");
    }
    exports2.validateAuthorizeClientDeviceActionRequest = validateAuthorizeClientDeviceActionRequest;
    function validateVerifyClientDeviceIdentityResponse(value) {
      eventstream_rpc_utils.validateValueAsBoolean(value.isValidClientDevice, "isValidClientDevice", "VerifyClientDeviceIdentityResponse");
    }
    exports2.validateVerifyClientDeviceIdentityResponse = validateVerifyClientDeviceIdentityResponse;
    function validateVerifyClientDeviceIdentityRequest(value) {
      eventstream_rpc_utils.validateValueAsUnion(value.credential, _ClientDeviceCredentialPropertyValidators);
    }
    exports2.validateVerifyClientDeviceIdentityRequest = validateVerifyClientDeviceIdentityRequest;
    function validateSubscribeToCertificateUpdatesResponse(value) {
    }
    exports2.validateSubscribeToCertificateUpdatesResponse = validateSubscribeToCertificateUpdatesResponse;
    function validateSubscribeToCertificateUpdatesRequest(value) {
      eventstream_rpc_utils.validateValueAsObject(value.certificateOptions, validateCertificateOptions, "certificateOptions", "SubscribeToCertificateUpdatesRequest");
    }
    exports2.validateSubscribeToCertificateUpdatesRequest = validateSubscribeToCertificateUpdatesRequest;
    function validatePublishToTopicResponse(value) {
    }
    exports2.validatePublishToTopicResponse = validatePublishToTopicResponse;
    function validatePublishToTopicRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.topic, "topic", "PublishToTopicRequest");
      eventstream_rpc_utils.validateValueAsUnion(value.publishMessage, _PublishMessagePropertyValidators);
    }
    exports2.validatePublishToTopicRequest = validatePublishToTopicRequest;
    function validateInvalidCredentialError(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "InvalidCredentialError");
    }
    exports2.validateInvalidCredentialError = validateInvalidCredentialError;
    function validateGetClientDeviceAuthTokenResponse(value) {
      eventstream_rpc_utils.validateValueAsString(value.clientDeviceAuthToken, "clientDeviceAuthToken", "GetClientDeviceAuthTokenResponse");
    }
    exports2.validateGetClientDeviceAuthTokenResponse = validateGetClientDeviceAuthTokenResponse;
    function validateGetClientDeviceAuthTokenRequest(value) {
      eventstream_rpc_utils.validateValueAsUnion(value.credential, _CredentialDocumentPropertyValidators);
    }
    exports2.validateGetClientDeviceAuthTokenRequest = validateGetClientDeviceAuthTokenRequest;
    function validateGetComponentDetailsResponse(value) {
      eventstream_rpc_utils.validateValueAsObject(value.componentDetails, validateComponentDetails, "componentDetails", "GetComponentDetailsResponse");
    }
    exports2.validateGetComponentDetailsResponse = validateGetComponentDetailsResponse;
    function validateGetComponentDetailsRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.componentName, "componentName", "GetComponentDetailsRequest");
    }
    exports2.validateGetComponentDetailsRequest = validateGetComponentDetailsRequest;
    function validateSubscribeToTopicResponse(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.topicName, "topicName", "SubscribeToTopicResponse");
    }
    exports2.validateSubscribeToTopicResponse = validateSubscribeToTopicResponse;
    function validateSubscribeToTopicRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.topic, "topic", "SubscribeToTopicRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.receiveMode, "receiveMode", "SubscribeToTopicRequest");
    }
    exports2.validateSubscribeToTopicRequest = validateSubscribeToTopicRequest;
    function validateGetConfigurationResponse(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.componentName, "componentName", "GetConfigurationResponse");
      eventstream_rpc_utils.validateValueAsOptionalAny(value.value, "value", "GetConfigurationResponse");
    }
    exports2.validateGetConfigurationResponse = validateGetConfigurationResponse;
    function validateGetConfigurationRequest(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.componentName, "componentName", "GetConfigurationRequest");
      eventstream_rpc_utils.validateValueAsArray(value.keyPath, eventstream_rpc_utils.validateValueAsString, "keyPath", "GetConfigurationRequest");
    }
    exports2.validateGetConfigurationRequest = validateGetConfigurationRequest;
    function validateSubscribeToValidateConfigurationUpdatesResponse(value) {
    }
    exports2.validateSubscribeToValidateConfigurationUpdatesResponse = validateSubscribeToValidateConfigurationUpdatesResponse;
    function validateSubscribeToValidateConfigurationUpdatesRequest(value) {
    }
    exports2.validateSubscribeToValidateConfigurationUpdatesRequest = validateSubscribeToValidateConfigurationUpdatesRequest;
    function validateDeferComponentUpdateResponse(value) {
    }
    exports2.validateDeferComponentUpdateResponse = validateDeferComponentUpdateResponse;
    function validateDeferComponentUpdateRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.deploymentId, "deploymentId", "DeferComponentUpdateRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.message, "message", "DeferComponentUpdateRequest");
      eventstream_rpc_utils.validateValueAsOptionalInteger(value.recheckAfterMs, "recheckAfterMs", "DeferComponentUpdateRequest");
    }
    exports2.validateDeferComponentUpdateRequest = validateDeferComponentUpdateRequest;
    function validatePutComponentMetricResponse(value) {
    }
    exports2.validatePutComponentMetricResponse = validatePutComponentMetricResponse;
    function validatePutComponentMetricRequest(value) {
      eventstream_rpc_utils.validateValueAsArray(value.metrics, validateMetric, "metrics", "PutComponentMetricRequest");
    }
    exports2.validatePutComponentMetricRequest = validatePutComponentMetricRequest;
    function validateDeleteThingShadowResponse(value) {
      eventstream_rpc_utils.validateValueAsBlob(value.payload, "payload", "DeleteThingShadowResponse");
    }
    exports2.validateDeleteThingShadowResponse = validateDeleteThingShadowResponse;
    function validateDeleteThingShadowRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.thingName, "thingName", "DeleteThingShadowRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.shadowName, "shadowName", "DeleteThingShadowRequest");
    }
    exports2.validateDeleteThingShadowRequest = validateDeleteThingShadowRequest;
    function validateSubscribeToConfigurationUpdateResponse(value) {
    }
    exports2.validateSubscribeToConfigurationUpdateResponse = validateSubscribeToConfigurationUpdateResponse;
    function validateSubscribeToConfigurationUpdateRequest(value) {
      eventstream_rpc_utils.validateValueAsOptionalString(value.componentName, "componentName", "SubscribeToConfigurationUpdateRequest");
      eventstream_rpc_utils.validateValueAsArray(value.keyPath, eventstream_rpc_utils.validateValueAsString, "keyPath", "SubscribeToConfigurationUpdateRequest");
    }
    exports2.validateSubscribeToConfigurationUpdateRequest = validateSubscribeToConfigurationUpdateRequest;
    function validatePublishToIoTCoreResponse(value) {
    }
    exports2.validatePublishToIoTCoreResponse = validatePublishToIoTCoreResponse;
    function validatePublishToIoTCoreRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.topicName, "topicName", "PublishToIoTCoreRequest");
      eventstream_rpc_utils.validateValueAsString(value.qos, "qos", "PublishToIoTCoreRequest");
      eventstream_rpc_utils.validateValueAsOptionalBlob(value.payload, "payload", "PublishToIoTCoreRequest");
      eventstream_rpc_utils.validateValueAsOptionalBoolean(value.retain, "retain", "PublishToIoTCoreRequest");
      eventstream_rpc_utils.validateValueAsOptionalArray(value.userProperties, validateUserProperty, "userProperties", "PublishToIoTCoreRequest");
      eventstream_rpc_utils.validateValueAsOptionalInteger(value.messageExpiryIntervalSeconds, "messageExpiryIntervalSeconds", "PublishToIoTCoreRequest");
      eventstream_rpc_utils.validateValueAsOptionalBlob(value.correlationData, "correlationData", "PublishToIoTCoreRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.responseTopic, "responseTopic", "PublishToIoTCoreRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.payloadFormat, "payloadFormat", "PublishToIoTCoreRequest");
      eventstream_rpc_utils.validateValueAsOptionalString(value.contentType, "contentType", "PublishToIoTCoreRequest");
    }
    exports2.validatePublishToIoTCoreRequest = validatePublishToIoTCoreRequest;
    function validateResumeComponentResponse(value) {
    }
    exports2.validateResumeComponentResponse = validateResumeComponentResponse;
    function validateResumeComponentRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.componentName, "componentName", "ResumeComponentRequest");
    }
    exports2.validateResumeComponentRequest = validateResumeComponentRequest;
    function validateSubscribeToIoTCoreResponse(value) {
    }
    exports2.validateSubscribeToIoTCoreResponse = validateSubscribeToIoTCoreResponse;
    function validateSubscribeToIoTCoreRequest(value) {
      eventstream_rpc_utils.validateValueAsString(value.topicName, "topicName", "SubscribeToIoTCoreRequest");
      eventstream_rpc_utils.validateValueAsString(value.qos, "qos", "SubscribeToIoTCoreRequest");
    }
    exports2.validateSubscribeToIoTCoreRequest = validateSubscribeToIoTCoreRequest;
    function deserializeUserProperty(value) {
      return value;
    }
    exports2.deserializeUserProperty = deserializeUserProperty;
    function deserializeSystemResourceLimits(value) {
      return value;
    }
    exports2.deserializeSystemResourceLimits = deserializeSystemResourceLimits;
    function deserializeDeploymentStatusDetails(value) {
      return value;
    }
    exports2.deserializeDeploymentStatusDetails = deserializeDeploymentStatusDetails;
    function deserializeMessageContext(value) {
      return value;
    }
    exports2.deserializeMessageContext = deserializeMessageContext;
    function deserializeRunWithInfo(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "systemResourceLimits", value.systemResourceLimits, deserializeSystemResourceLimits);
      return value;
    }
    exports2.deserializeRunWithInfo = deserializeRunWithInfo;
    function deserializeLocalDeployment(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "deploymentStatusDetails", value.deploymentStatusDetails, deserializeDeploymentStatusDetails);
      return value;
    }
    exports2.deserializeLocalDeployment = deserializeLocalDeployment;
    function deserializePostComponentUpdateEvent(value) {
      return value;
    }
    exports2.deserializePostComponentUpdateEvent = deserializePostComponentUpdateEvent;
    function deserializePreComponentUpdateEvent(value) {
      return value;
    }
    exports2.deserializePreComponentUpdateEvent = deserializePreComponentUpdateEvent;
    function deserializeComponentDetails(value) {
      return value;
    }
    exports2.deserializeComponentDetails = deserializeComponentDetails;
    function deserializeCertificateUpdate(value) {
      return value;
    }
    exports2.deserializeCertificateUpdate = deserializeCertificateUpdate;
    function deserializeBinaryMessage(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "message", value.message, eventstream_rpc_utils.transformStringAsPayload);
      eventstream_rpc_utils.setDefinedProperty(value, "context", value.context, deserializeMessageContext);
      return value;
    }
    exports2.deserializeBinaryMessage = deserializeBinaryMessage;
    function deserializeJsonMessage(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "context", value.context, deserializeMessageContext);
      return value;
    }
    exports2.deserializeJsonMessage = deserializeJsonMessage;
    function deserializeMQTTCredential(value) {
      return value;
    }
    exports2.deserializeMQTTCredential = deserializeMQTTCredential;
    function deserializeValidateConfigurationUpdateEvent(value) {
      return value;
    }
    exports2.deserializeValidateConfigurationUpdateEvent = deserializeValidateConfigurationUpdateEvent;
    function deserializeMetric(value) {
      return value;
    }
    exports2.deserializeMetric = deserializeMetric;
    function deserializeConfigurationUpdateEvent(value) {
      return value;
    }
    exports2.deserializeConfigurationUpdateEvent = deserializeConfigurationUpdateEvent;
    function deserializeMQTTMessage(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "payload", value.payload, eventstream_rpc_utils.transformStringAsPayload);
      eventstream_rpc_utils.setDefinedArrayProperty(value, "userProperties", value.userProperties, deserializeUserProperty);
      eventstream_rpc_utils.setDefinedProperty(value, "correlationData", value.correlationData, eventstream_rpc_utils.transformStringAsPayload);
      return value;
    }
    exports2.deserializeMQTTMessage = deserializeMQTTMessage;
    function deserializeComponentUpdatePolicyEvents(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "preUpdateEvent", value.preUpdateEvent, deserializePreComponentUpdateEvent);
      eventstream_rpc_utils.setDefinedProperty(value, "postUpdateEvent", value.postUpdateEvent, deserializePostComponentUpdateEvent);
      return value;
    }
    exports2.deserializeComponentUpdatePolicyEvents = deserializeComponentUpdatePolicyEvents;
    function deserializeSecretValue(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "secretBinary", value.secretBinary, eventstream_rpc_utils.transformStringAsPayload);
      return value;
    }
    exports2.deserializeSecretValue = deserializeSecretValue;
    function deserializeConfigurationValidityReport(value) {
      return value;
    }
    exports2.deserializeConfigurationValidityReport = deserializeConfigurationValidityReport;
    function deserializeClientDeviceCredential(value) {
      return value;
    }
    exports2.deserializeClientDeviceCredential = deserializeClientDeviceCredential;
    function deserializeCertificateUpdateEvent(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "certificateUpdate", value.certificateUpdate, deserializeCertificateUpdate);
      return value;
    }
    exports2.deserializeCertificateUpdateEvent = deserializeCertificateUpdateEvent;
    function deserializeCertificateOptions(value) {
      return value;
    }
    exports2.deserializeCertificateOptions = deserializeCertificateOptions;
    function deserializePublishMessage(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "jsonMessage", value.jsonMessage, deserializeJsonMessage);
      eventstream_rpc_utils.setDefinedProperty(value, "binaryMessage", value.binaryMessage, deserializeBinaryMessage);
      return value;
    }
    exports2.deserializePublishMessage = deserializePublishMessage;
    function deserializeCredentialDocument(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "mqttCredential", value.mqttCredential, deserializeMQTTCredential);
      return value;
    }
    exports2.deserializeCredentialDocument = deserializeCredentialDocument;
    function deserializeSubscriptionResponseMessage(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "jsonMessage", value.jsonMessage, deserializeJsonMessage);
      eventstream_rpc_utils.setDefinedProperty(value, "binaryMessage", value.binaryMessage, deserializeBinaryMessage);
      return value;
    }
    exports2.deserializeSubscriptionResponseMessage = deserializeSubscriptionResponseMessage;
    function deserializeValidateConfigurationUpdateEvents(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "validateConfigurationUpdateEvent", value.validateConfigurationUpdateEvent, deserializeValidateConfigurationUpdateEvent);
      return value;
    }
    exports2.deserializeValidateConfigurationUpdateEvents = deserializeValidateConfigurationUpdateEvents;
    function deserializeConfigurationUpdateEvents(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "configurationUpdateEvent", value.configurationUpdateEvent, deserializeConfigurationUpdateEvent);
      return value;
    }
    exports2.deserializeConfigurationUpdateEvents = deserializeConfigurationUpdateEvents;
    function deserializeIoTCoreMessage(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "message", value.message, deserializeMQTTMessage);
      return value;
    }
    exports2.deserializeIoTCoreMessage = deserializeIoTCoreMessage;
    function deserializeInvalidArgumentsError(value) {
      return value;
    }
    exports2.deserializeInvalidArgumentsError = deserializeInvalidArgumentsError;
    function deserializeInvalidArtifactsDirectoryPathError(value) {
      return value;
    }
    exports2.deserializeInvalidArtifactsDirectoryPathError = deserializeInvalidArtifactsDirectoryPathError;
    function deserializeInvalidRecipeDirectoryPathError(value) {
      return value;
    }
    exports2.deserializeInvalidRecipeDirectoryPathError = deserializeInvalidRecipeDirectoryPathError;
    function deserializeServiceError(value) {
      return value;
    }
    exports2.deserializeServiceError = deserializeServiceError;
    function deserializeCreateLocalDeploymentResponse(value) {
      return value;
    }
    exports2.deserializeCreateLocalDeploymentResponse = deserializeCreateLocalDeploymentResponse;
    function deserializeCreateLocalDeploymentRequest(value) {
      eventstream_rpc_utils.setDefinedObjectPropertyAsMap(value, "componentToRunWithInfo", value.componentToRunWithInfo, void 0, deserializeRunWithInfo);
      return value;
    }
    exports2.deserializeCreateLocalDeploymentRequest = deserializeCreateLocalDeploymentRequest;
    function deserializeResourceNotFoundError(value) {
      return value;
    }
    exports2.deserializeResourceNotFoundError = deserializeResourceNotFoundError;
    function deserializeUnauthorizedError(value) {
      return value;
    }
    exports2.deserializeUnauthorizedError = deserializeUnauthorizedError;
    function deserializePauseComponentResponse(value) {
      return value;
    }
    exports2.deserializePauseComponentResponse = deserializePauseComponentResponse;
    function deserializePauseComponentRequest(value) {
      return value;
    }
    exports2.deserializePauseComponentRequest = deserializePauseComponentRequest;
    function deserializeComponentNotFoundError(value) {
      return value;
    }
    exports2.deserializeComponentNotFoundError = deserializeComponentNotFoundError;
    function deserializeStopComponentResponse(value) {
      return value;
    }
    exports2.deserializeStopComponentResponse = deserializeStopComponentResponse;
    function deserializeStopComponentRequest(value) {
      return value;
    }
    exports2.deserializeStopComponentRequest = deserializeStopComponentRequest;
    function deserializeListLocalDeploymentsResponse(value) {
      eventstream_rpc_utils.setDefinedArrayProperty(value, "localDeployments", value.localDeployments, deserializeLocalDeployment);
      return value;
    }
    exports2.deserializeListLocalDeploymentsResponse = deserializeListLocalDeploymentsResponse;
    function deserializeListLocalDeploymentsRequest(value) {
      return value;
    }
    exports2.deserializeListLocalDeploymentsRequest = deserializeListLocalDeploymentsRequest;
    function deserializeSubscribeToComponentUpdatesResponse(value) {
      return value;
    }
    exports2.deserializeSubscribeToComponentUpdatesResponse = deserializeSubscribeToComponentUpdatesResponse;
    function deserializeSubscribeToComponentUpdatesRequest(value) {
      return value;
    }
    exports2.deserializeSubscribeToComponentUpdatesRequest = deserializeSubscribeToComponentUpdatesRequest;
    function deserializeListNamedShadowsForThingResponse(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "timestamp", value.timestamp, eventstream_rpc_utils.transformNumberAsDate);
      return value;
    }
    exports2.deserializeListNamedShadowsForThingResponse = deserializeListNamedShadowsForThingResponse;
    function deserializeListNamedShadowsForThingRequest(value) {
      return value;
    }
    exports2.deserializeListNamedShadowsForThingRequest = deserializeListNamedShadowsForThingRequest;
    function deserializeCancelLocalDeploymentResponse(value) {
      return value;
    }
    exports2.deserializeCancelLocalDeploymentResponse = deserializeCancelLocalDeploymentResponse;
    function deserializeCancelLocalDeploymentRequest(value) {
      return value;
    }
    exports2.deserializeCancelLocalDeploymentRequest = deserializeCancelLocalDeploymentRequest;
    function deserializeUpdateStateResponse(value) {
      return value;
    }
    exports2.deserializeUpdateStateResponse = deserializeUpdateStateResponse;
    function deserializeUpdateStateRequest(value) {
      return value;
    }
    exports2.deserializeUpdateStateRequest = deserializeUpdateStateRequest;
    function deserializeGetSecretValueResponse(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "secretValue", value.secretValue, deserializeSecretValue);
      return value;
    }
    exports2.deserializeGetSecretValueResponse = deserializeGetSecretValueResponse;
    function deserializeGetSecretValueRequest(value) {
      return value;
    }
    exports2.deserializeGetSecretValueRequest = deserializeGetSecretValueRequest;
    function deserializeGetLocalDeploymentStatusResponse(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "deployment", value.deployment, deserializeLocalDeployment);
      return value;
    }
    exports2.deserializeGetLocalDeploymentStatusResponse = deserializeGetLocalDeploymentStatusResponse;
    function deserializeGetLocalDeploymentStatusRequest(value) {
      return value;
    }
    exports2.deserializeGetLocalDeploymentStatusRequest = deserializeGetLocalDeploymentStatusRequest;
    function deserializeRestartComponentResponse(value) {
      return value;
    }
    exports2.deserializeRestartComponentResponse = deserializeRestartComponentResponse;
    function deserializeRestartComponentRequest(value) {
      return value;
    }
    exports2.deserializeRestartComponentRequest = deserializeRestartComponentRequest;
    function deserializeInvalidTokenError(value) {
      return value;
    }
    exports2.deserializeInvalidTokenError = deserializeInvalidTokenError;
    function deserializeValidateAuthorizationTokenResponse(value) {
      return value;
    }
    exports2.deserializeValidateAuthorizationTokenResponse = deserializeValidateAuthorizationTokenResponse;
    function deserializeValidateAuthorizationTokenRequest(value) {
      return value;
    }
    exports2.deserializeValidateAuthorizationTokenRequest = deserializeValidateAuthorizationTokenRequest;
    function deserializeFailedUpdateConditionCheckError(value) {
      return value;
    }
    exports2.deserializeFailedUpdateConditionCheckError = deserializeFailedUpdateConditionCheckError;
    function deserializeConflictError(value) {
      return value;
    }
    exports2.deserializeConflictError = deserializeConflictError;
    function deserializeUpdateConfigurationResponse(value) {
      return value;
    }
    exports2.deserializeUpdateConfigurationResponse = deserializeUpdateConfigurationResponse;
    function deserializeUpdateConfigurationRequest(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "timestamp", value.timestamp, eventstream_rpc_utils.transformNumberAsDate);
      return value;
    }
    exports2.deserializeUpdateConfigurationRequest = deserializeUpdateConfigurationRequest;
    function deserializeUpdateThingShadowResponse(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "payload", value.payload, eventstream_rpc_utils.transformStringAsPayload);
      return value;
    }
    exports2.deserializeUpdateThingShadowResponse = deserializeUpdateThingShadowResponse;
    function deserializeUpdateThingShadowRequest(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "payload", value.payload, eventstream_rpc_utils.transformStringAsPayload);
      return value;
    }
    exports2.deserializeUpdateThingShadowRequest = deserializeUpdateThingShadowRequest;
    function deserializeSendConfigurationValidityReportResponse(value) {
      return value;
    }
    exports2.deserializeSendConfigurationValidityReportResponse = deserializeSendConfigurationValidityReportResponse;
    function deserializeSendConfigurationValidityReportRequest(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "configurationValidityReport", value.configurationValidityReport, deserializeConfigurationValidityReport);
      return value;
    }
    exports2.deserializeSendConfigurationValidityReportRequest = deserializeSendConfigurationValidityReportRequest;
    function deserializeGetThingShadowResponse(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "payload", value.payload, eventstream_rpc_utils.transformStringAsPayload);
      return value;
    }
    exports2.deserializeGetThingShadowResponse = deserializeGetThingShadowResponse;
    function deserializeGetThingShadowRequest(value) {
      return value;
    }
    exports2.deserializeGetThingShadowRequest = deserializeGetThingShadowRequest;
    function deserializeCreateDebugPasswordResponse(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "passwordExpiration", value.passwordExpiration, eventstream_rpc_utils.transformNumberAsDate);
      return value;
    }
    exports2.deserializeCreateDebugPasswordResponse = deserializeCreateDebugPasswordResponse;
    function deserializeCreateDebugPasswordRequest(value) {
      return value;
    }
    exports2.deserializeCreateDebugPasswordRequest = deserializeCreateDebugPasswordRequest;
    function deserializeListComponentsResponse(value) {
      eventstream_rpc_utils.setDefinedArrayProperty(value, "components", value.components, deserializeComponentDetails);
      return value;
    }
    exports2.deserializeListComponentsResponse = deserializeListComponentsResponse;
    function deserializeListComponentsRequest(value) {
      return value;
    }
    exports2.deserializeListComponentsRequest = deserializeListComponentsRequest;
    function deserializeInvalidClientDeviceAuthTokenError(value) {
      return value;
    }
    exports2.deserializeInvalidClientDeviceAuthTokenError = deserializeInvalidClientDeviceAuthTokenError;
    function deserializeAuthorizeClientDeviceActionResponse(value) {
      return value;
    }
    exports2.deserializeAuthorizeClientDeviceActionResponse = deserializeAuthorizeClientDeviceActionResponse;
    function deserializeAuthorizeClientDeviceActionRequest(value) {
      return value;
    }
    exports2.deserializeAuthorizeClientDeviceActionRequest = deserializeAuthorizeClientDeviceActionRequest;
    function deserializeVerifyClientDeviceIdentityResponse(value) {
      return value;
    }
    exports2.deserializeVerifyClientDeviceIdentityResponse = deserializeVerifyClientDeviceIdentityResponse;
    function deserializeVerifyClientDeviceIdentityRequest(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "credential", value.credential, deserializeClientDeviceCredential);
      return value;
    }
    exports2.deserializeVerifyClientDeviceIdentityRequest = deserializeVerifyClientDeviceIdentityRequest;
    function deserializeSubscribeToCertificateUpdatesResponse(value) {
      return value;
    }
    exports2.deserializeSubscribeToCertificateUpdatesResponse = deserializeSubscribeToCertificateUpdatesResponse;
    function deserializeSubscribeToCertificateUpdatesRequest(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "certificateOptions", value.certificateOptions, deserializeCertificateOptions);
      return value;
    }
    exports2.deserializeSubscribeToCertificateUpdatesRequest = deserializeSubscribeToCertificateUpdatesRequest;
    function deserializePublishToTopicResponse(value) {
      return value;
    }
    exports2.deserializePublishToTopicResponse = deserializePublishToTopicResponse;
    function deserializePublishToTopicRequest(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "publishMessage", value.publishMessage, deserializePublishMessage);
      return value;
    }
    exports2.deserializePublishToTopicRequest = deserializePublishToTopicRequest;
    function deserializeInvalidCredentialError(value) {
      return value;
    }
    exports2.deserializeInvalidCredentialError = deserializeInvalidCredentialError;
    function deserializeGetClientDeviceAuthTokenResponse(value) {
      return value;
    }
    exports2.deserializeGetClientDeviceAuthTokenResponse = deserializeGetClientDeviceAuthTokenResponse;
    function deserializeGetClientDeviceAuthTokenRequest(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "credential", value.credential, deserializeCredentialDocument);
      return value;
    }
    exports2.deserializeGetClientDeviceAuthTokenRequest = deserializeGetClientDeviceAuthTokenRequest;
    function deserializeGetComponentDetailsResponse(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "componentDetails", value.componentDetails, deserializeComponentDetails);
      return value;
    }
    exports2.deserializeGetComponentDetailsResponse = deserializeGetComponentDetailsResponse;
    function deserializeGetComponentDetailsRequest(value) {
      return value;
    }
    exports2.deserializeGetComponentDetailsRequest = deserializeGetComponentDetailsRequest;
    function deserializeSubscribeToTopicResponse(value) {
      return value;
    }
    exports2.deserializeSubscribeToTopicResponse = deserializeSubscribeToTopicResponse;
    function deserializeSubscribeToTopicRequest(value) {
      return value;
    }
    exports2.deserializeSubscribeToTopicRequest = deserializeSubscribeToTopicRequest;
    function deserializeGetConfigurationResponse(value) {
      return value;
    }
    exports2.deserializeGetConfigurationResponse = deserializeGetConfigurationResponse;
    function deserializeGetConfigurationRequest(value) {
      return value;
    }
    exports2.deserializeGetConfigurationRequest = deserializeGetConfigurationRequest;
    function deserializeSubscribeToValidateConfigurationUpdatesResponse(value) {
      return value;
    }
    exports2.deserializeSubscribeToValidateConfigurationUpdatesResponse = deserializeSubscribeToValidateConfigurationUpdatesResponse;
    function deserializeSubscribeToValidateConfigurationUpdatesRequest(value) {
      return value;
    }
    exports2.deserializeSubscribeToValidateConfigurationUpdatesRequest = deserializeSubscribeToValidateConfigurationUpdatesRequest;
    function deserializeDeferComponentUpdateResponse(value) {
      return value;
    }
    exports2.deserializeDeferComponentUpdateResponse = deserializeDeferComponentUpdateResponse;
    function deserializeDeferComponentUpdateRequest(value) {
      return value;
    }
    exports2.deserializeDeferComponentUpdateRequest = deserializeDeferComponentUpdateRequest;
    function deserializePutComponentMetricResponse(value) {
      return value;
    }
    exports2.deserializePutComponentMetricResponse = deserializePutComponentMetricResponse;
    function deserializePutComponentMetricRequest(value) {
      eventstream_rpc_utils.setDefinedArrayProperty(value, "metrics", value.metrics, deserializeMetric);
      return value;
    }
    exports2.deserializePutComponentMetricRequest = deserializePutComponentMetricRequest;
    function deserializeDeleteThingShadowResponse(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "payload", value.payload, eventstream_rpc_utils.transformStringAsPayload);
      return value;
    }
    exports2.deserializeDeleteThingShadowResponse = deserializeDeleteThingShadowResponse;
    function deserializeDeleteThingShadowRequest(value) {
      return value;
    }
    exports2.deserializeDeleteThingShadowRequest = deserializeDeleteThingShadowRequest;
    function deserializeSubscribeToConfigurationUpdateResponse(value) {
      return value;
    }
    exports2.deserializeSubscribeToConfigurationUpdateResponse = deserializeSubscribeToConfigurationUpdateResponse;
    function deserializeSubscribeToConfigurationUpdateRequest(value) {
      return value;
    }
    exports2.deserializeSubscribeToConfigurationUpdateRequest = deserializeSubscribeToConfigurationUpdateRequest;
    function deserializePublishToIoTCoreResponse(value) {
      return value;
    }
    exports2.deserializePublishToIoTCoreResponse = deserializePublishToIoTCoreResponse;
    function deserializePublishToIoTCoreRequest(value) {
      eventstream_rpc_utils.setDefinedProperty(value, "payload", value.payload, eventstream_rpc_utils.transformStringAsPayload);
      eventstream_rpc_utils.setDefinedArrayProperty(value, "userProperties", value.userProperties, deserializeUserProperty);
      eventstream_rpc_utils.setDefinedProperty(value, "correlationData", value.correlationData, eventstream_rpc_utils.transformStringAsPayload);
      return value;
    }
    exports2.deserializePublishToIoTCoreRequest = deserializePublishToIoTCoreRequest;
    function deserializeResumeComponentResponse(value) {
      return value;
    }
    exports2.deserializeResumeComponentResponse = deserializeResumeComponentResponse;
    function deserializeResumeComponentRequest(value) {
      return value;
    }
    exports2.deserializeResumeComponentRequest = deserializeResumeComponentRequest;
    function deserializeSubscribeToIoTCoreResponse(value) {
      return value;
    }
    exports2.deserializeSubscribeToIoTCoreResponse = deserializeSubscribeToIoTCoreResponse;
    function deserializeSubscribeToIoTCoreRequest(value) {
      return value;
    }
    exports2.deserializeSubscribeToIoTCoreRequest = deserializeSubscribeToIoTCoreRequest;
    function deserializeEventstreamMessageToConflictError(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeConflictError(response);
    }
    exports2.deserializeEventstreamMessageToConflictError = deserializeEventstreamMessageToConflictError;
    function deserializeEventstreamMessageToCreateDebugPasswordResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeCreateDebugPasswordResponse(response);
    }
    exports2.deserializeEventstreamMessageToCreateDebugPasswordResponse = deserializeEventstreamMessageToCreateDebugPasswordResponse;
    function deserializeEventstreamMessageToSubscriptionResponseMessage(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeSubscriptionResponseMessage(response);
    }
    exports2.deserializeEventstreamMessageToSubscriptionResponseMessage = deserializeEventstreamMessageToSubscriptionResponseMessage;
    function deserializeEventstreamMessageToFailedUpdateConditionCheckError(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeFailedUpdateConditionCheckError(response);
    }
    exports2.deserializeEventstreamMessageToFailedUpdateConditionCheckError = deserializeEventstreamMessageToFailedUpdateConditionCheckError;
    function deserializeEventstreamMessageToListNamedShadowsForThingResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeListNamedShadowsForThingResponse(response);
    }
    exports2.deserializeEventstreamMessageToListNamedShadowsForThingResponse = deserializeEventstreamMessageToListNamedShadowsForThingResponse;
    function deserializeEventstreamMessageToComponentNotFoundError(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeComponentNotFoundError(response);
    }
    exports2.deserializeEventstreamMessageToComponentNotFoundError = deserializeEventstreamMessageToComponentNotFoundError;
    function deserializeEventstreamMessageToCertificateUpdateEvent(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeCertificateUpdateEvent(response);
    }
    exports2.deserializeEventstreamMessageToCertificateUpdateEvent = deserializeEventstreamMessageToCertificateUpdateEvent;
    function deserializeEventstreamMessageToGetSecretValueResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeGetSecretValueResponse(response);
    }
    exports2.deserializeEventstreamMessageToGetSecretValueResponse = deserializeEventstreamMessageToGetSecretValueResponse;
    function deserializeEventstreamMessageToSubscribeToIoTCoreResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeSubscribeToIoTCoreResponse(response);
    }
    exports2.deserializeEventstreamMessageToSubscribeToIoTCoreResponse = deserializeEventstreamMessageToSubscribeToIoTCoreResponse;
    function deserializeEventstreamMessageToInvalidRecipeDirectoryPathError(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeInvalidRecipeDirectoryPathError(response);
    }
    exports2.deserializeEventstreamMessageToInvalidRecipeDirectoryPathError = deserializeEventstreamMessageToInvalidRecipeDirectoryPathError;
    function deserializeEventstreamMessageToListLocalDeploymentsResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeListLocalDeploymentsResponse(response);
    }
    exports2.deserializeEventstreamMessageToListLocalDeploymentsResponse = deserializeEventstreamMessageToListLocalDeploymentsResponse;
    function deserializeEventstreamMessageToResumeComponentResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeResumeComponentResponse(response);
    }
    exports2.deserializeEventstreamMessageToResumeComponentResponse = deserializeEventstreamMessageToResumeComponentResponse;
    function deserializeEventstreamMessageToInvalidArgumentsError(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeInvalidArgumentsError(response);
    }
    exports2.deserializeEventstreamMessageToInvalidArgumentsError = deserializeEventstreamMessageToInvalidArgumentsError;
    function deserializeEventstreamMessageToGetComponentDetailsResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeGetComponentDetailsResponse(response);
    }
    exports2.deserializeEventstreamMessageToGetComponentDetailsResponse = deserializeEventstreamMessageToGetComponentDetailsResponse;
    function deserializeEventstreamMessageToPutComponentMetricResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializePutComponentMetricResponse(response);
    }
    exports2.deserializeEventstreamMessageToPutComponentMetricResponse = deserializeEventstreamMessageToPutComponentMetricResponse;
    function deserializeEventstreamMessageToComponentUpdatePolicyEvents(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeComponentUpdatePolicyEvents(response);
    }
    exports2.deserializeEventstreamMessageToComponentUpdatePolicyEvents = deserializeEventstreamMessageToComponentUpdatePolicyEvents;
    function deserializeEventstreamMessageToIoTCoreMessage(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeIoTCoreMessage(response);
    }
    exports2.deserializeEventstreamMessageToIoTCoreMessage = deserializeEventstreamMessageToIoTCoreMessage;
    function deserializeEventstreamMessageToUpdateStateResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeUpdateStateResponse(response);
    }
    exports2.deserializeEventstreamMessageToUpdateStateResponse = deserializeEventstreamMessageToUpdateStateResponse;
    function deserializeEventstreamMessageToDeferComponentUpdateResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeDeferComponentUpdateResponse(response);
    }
    exports2.deserializeEventstreamMessageToDeferComponentUpdateResponse = deserializeEventstreamMessageToDeferComponentUpdateResponse;
    function deserializeEventstreamMessageToListComponentsResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeListComponentsResponse(response);
    }
    exports2.deserializeEventstreamMessageToListComponentsResponse = deserializeEventstreamMessageToListComponentsResponse;
    function deserializeEventstreamMessageToSubscribeToComponentUpdatesResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeSubscribeToComponentUpdatesResponse(response);
    }
    exports2.deserializeEventstreamMessageToSubscribeToComponentUpdatesResponse = deserializeEventstreamMessageToSubscribeToComponentUpdatesResponse;
    function deserializeEventstreamMessageToVerifyClientDeviceIdentityResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeVerifyClientDeviceIdentityResponse(response);
    }
    exports2.deserializeEventstreamMessageToVerifyClientDeviceIdentityResponse = deserializeEventstreamMessageToVerifyClientDeviceIdentityResponse;
    function deserializeEventstreamMessageToResourceNotFoundError(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeResourceNotFoundError(response);
    }
    exports2.deserializeEventstreamMessageToResourceNotFoundError = deserializeEventstreamMessageToResourceNotFoundError;
    function deserializeEventstreamMessageToInvalidArtifactsDirectoryPathError(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeInvalidArtifactsDirectoryPathError(response);
    }
    exports2.deserializeEventstreamMessageToInvalidArtifactsDirectoryPathError = deserializeEventstreamMessageToInvalidArtifactsDirectoryPathError;
    function deserializeEventstreamMessageToSendConfigurationValidityReportResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeSendConfigurationValidityReportResponse(response);
    }
    exports2.deserializeEventstreamMessageToSendConfigurationValidityReportResponse = deserializeEventstreamMessageToSendConfigurationValidityReportResponse;
    function deserializeEventstreamMessageToGetThingShadowResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeGetThingShadowResponse(response);
    }
    exports2.deserializeEventstreamMessageToGetThingShadowResponse = deserializeEventstreamMessageToGetThingShadowResponse;
    function deserializeEventstreamMessageToInvalidClientDeviceAuthTokenError(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeInvalidClientDeviceAuthTokenError(response);
    }
    exports2.deserializeEventstreamMessageToInvalidClientDeviceAuthTokenError = deserializeEventstreamMessageToInvalidClientDeviceAuthTokenError;
    function deserializeEventstreamMessageToPublishToIoTCoreResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializePublishToIoTCoreResponse(response);
    }
    exports2.deserializeEventstreamMessageToPublishToIoTCoreResponse = deserializeEventstreamMessageToPublishToIoTCoreResponse;
    function deserializeEventstreamMessageToSubscribeToTopicResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeSubscribeToTopicResponse(response);
    }
    exports2.deserializeEventstreamMessageToSubscribeToTopicResponse = deserializeEventstreamMessageToSubscribeToTopicResponse;
    function deserializeEventstreamMessageToInvalidTokenError(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeInvalidTokenError(response);
    }
    exports2.deserializeEventstreamMessageToInvalidTokenError = deserializeEventstreamMessageToInvalidTokenError;
    function deserializeEventstreamMessageToGetClientDeviceAuthTokenResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeGetClientDeviceAuthTokenResponse(response);
    }
    exports2.deserializeEventstreamMessageToGetClientDeviceAuthTokenResponse = deserializeEventstreamMessageToGetClientDeviceAuthTokenResponse;
    function deserializeEventstreamMessageToCreateLocalDeploymentResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeCreateLocalDeploymentResponse(response);
    }
    exports2.deserializeEventstreamMessageToCreateLocalDeploymentResponse = deserializeEventstreamMessageToCreateLocalDeploymentResponse;
    function deserializeEventstreamMessageToPublishToTopicResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializePublishToTopicResponse(response);
    }
    exports2.deserializeEventstreamMessageToPublishToTopicResponse = deserializeEventstreamMessageToPublishToTopicResponse;
    function deserializeEventstreamMessageToValidateAuthorizationTokenResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeValidateAuthorizationTokenResponse(response);
    }
    exports2.deserializeEventstreamMessageToValidateAuthorizationTokenResponse = deserializeEventstreamMessageToValidateAuthorizationTokenResponse;
    function deserializeEventstreamMessageToUpdateThingShadowResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeUpdateThingShadowResponse(response);
    }
    exports2.deserializeEventstreamMessageToUpdateThingShadowResponse = deserializeEventstreamMessageToUpdateThingShadowResponse;
    function deserializeEventstreamMessageToAuthorizeClientDeviceActionResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeAuthorizeClientDeviceActionResponse(response);
    }
    exports2.deserializeEventstreamMessageToAuthorizeClientDeviceActionResponse = deserializeEventstreamMessageToAuthorizeClientDeviceActionResponse;
    function deserializeEventstreamMessageToGetConfigurationResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeGetConfigurationResponse(response);
    }
    exports2.deserializeEventstreamMessageToGetConfigurationResponse = deserializeEventstreamMessageToGetConfigurationResponse;
    function deserializeEventstreamMessageToInvalidCredentialError(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeInvalidCredentialError(response);
    }
    exports2.deserializeEventstreamMessageToInvalidCredentialError = deserializeEventstreamMessageToInvalidCredentialError;
    function deserializeEventstreamMessageToGetLocalDeploymentStatusResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeGetLocalDeploymentStatusResponse(response);
    }
    exports2.deserializeEventstreamMessageToGetLocalDeploymentStatusResponse = deserializeEventstreamMessageToGetLocalDeploymentStatusResponse;
    function deserializeEventstreamMessageToPauseComponentResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializePauseComponentResponse(response);
    }
    exports2.deserializeEventstreamMessageToPauseComponentResponse = deserializeEventstreamMessageToPauseComponentResponse;
    function deserializeEventstreamMessageToUnauthorizedError(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeUnauthorizedError(response);
    }
    exports2.deserializeEventstreamMessageToUnauthorizedError = deserializeEventstreamMessageToUnauthorizedError;
    function deserializeEventstreamMessageToSubscribeToCertificateUpdatesResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeSubscribeToCertificateUpdatesResponse(response);
    }
    exports2.deserializeEventstreamMessageToSubscribeToCertificateUpdatesResponse = deserializeEventstreamMessageToSubscribeToCertificateUpdatesResponse;
    function deserializeEventstreamMessageToUpdateConfigurationResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeUpdateConfigurationResponse(response);
    }
    exports2.deserializeEventstreamMessageToUpdateConfigurationResponse = deserializeEventstreamMessageToUpdateConfigurationResponse;
    function deserializeEventstreamMessageToRestartComponentResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeRestartComponentResponse(response);
    }
    exports2.deserializeEventstreamMessageToRestartComponentResponse = deserializeEventstreamMessageToRestartComponentResponse;
    function deserializeEventstreamMessageToDeleteThingShadowResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeDeleteThingShadowResponse(response);
    }
    exports2.deserializeEventstreamMessageToDeleteThingShadowResponse = deserializeEventstreamMessageToDeleteThingShadowResponse;
    function deserializeEventstreamMessageToSubscribeToConfigurationUpdateResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeSubscribeToConfigurationUpdateResponse(response);
    }
    exports2.deserializeEventstreamMessageToSubscribeToConfigurationUpdateResponse = deserializeEventstreamMessageToSubscribeToConfigurationUpdateResponse;
    function deserializeEventstreamMessageToSubscribeToValidateConfigurationUpdatesResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeSubscribeToValidateConfigurationUpdatesResponse(response);
    }
    exports2.deserializeEventstreamMessageToSubscribeToValidateConfigurationUpdatesResponse = deserializeEventstreamMessageToSubscribeToValidateConfigurationUpdatesResponse;
    function deserializeEventstreamMessageToServiceError(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeServiceError(response);
    }
    exports2.deserializeEventstreamMessageToServiceError = deserializeEventstreamMessageToServiceError;
    function deserializeEventstreamMessageToConfigurationUpdateEvents(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeConfigurationUpdateEvents(response);
    }
    exports2.deserializeEventstreamMessageToConfigurationUpdateEvents = deserializeEventstreamMessageToConfigurationUpdateEvents;
    function deserializeEventstreamMessageToStopComponentResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeStopComponentResponse(response);
    }
    exports2.deserializeEventstreamMessageToStopComponentResponse = deserializeEventstreamMessageToStopComponentResponse;
    function deserializeEventstreamMessageToValidateConfigurationUpdateEvents(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeValidateConfigurationUpdateEvents(response);
    }
    exports2.deserializeEventstreamMessageToValidateConfigurationUpdateEvents = deserializeEventstreamMessageToValidateConfigurationUpdateEvents;
    function deserializeEventstreamMessageToCancelLocalDeploymentResponse(message) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(message.payload));
      let response = JSON.parse(payload_text);
      return deserializeCancelLocalDeploymentResponse(response);
    }
    exports2.deserializeEventstreamMessageToCancelLocalDeploymentResponse = deserializeEventstreamMessageToCancelLocalDeploymentResponse;
    function serializeGetComponentDetailsRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeGetComponentDetailsRequest(request))
      };
    }
    exports2.serializeGetComponentDetailsRequestToEventstreamMessage = serializeGetComponentDetailsRequestToEventstreamMessage;
    function serializePublishToTopicRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizePublishToTopicRequest(request))
      };
    }
    exports2.serializePublishToTopicRequestToEventstreamMessage = serializePublishToTopicRequestToEventstreamMessage;
    function serializeCreateDebugPasswordRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeCreateDebugPasswordRequest(request))
      };
    }
    exports2.serializeCreateDebugPasswordRequestToEventstreamMessage = serializeCreateDebugPasswordRequestToEventstreamMessage;
    function serializeUpdateThingShadowRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeUpdateThingShadowRequest(request))
      };
    }
    exports2.serializeUpdateThingShadowRequestToEventstreamMessage = serializeUpdateThingShadowRequestToEventstreamMessage;
    function serializeResumeComponentRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeResumeComponentRequest(request))
      };
    }
    exports2.serializeResumeComponentRequestToEventstreamMessage = serializeResumeComponentRequestToEventstreamMessage;
    function serializeStopComponentRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeStopComponentRequest(request))
      };
    }
    exports2.serializeStopComponentRequestToEventstreamMessage = serializeStopComponentRequestToEventstreamMessage;
    function serializeVerifyClientDeviceIdentityRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeVerifyClientDeviceIdentityRequest(request))
      };
    }
    exports2.serializeVerifyClientDeviceIdentityRequestToEventstreamMessage = serializeVerifyClientDeviceIdentityRequestToEventstreamMessage;
    function serializeAuthorizeClientDeviceActionRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeAuthorizeClientDeviceActionRequest(request))
      };
    }
    exports2.serializeAuthorizeClientDeviceActionRequestToEventstreamMessage = serializeAuthorizeClientDeviceActionRequestToEventstreamMessage;
    function serializeListLocalDeploymentsRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeListLocalDeploymentsRequest(request))
      };
    }
    exports2.serializeListLocalDeploymentsRequestToEventstreamMessage = serializeListLocalDeploymentsRequestToEventstreamMessage;
    function serializeSendConfigurationValidityReportRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeSendConfigurationValidityReportRequest(request))
      };
    }
    exports2.serializeSendConfigurationValidityReportRequestToEventstreamMessage = serializeSendConfigurationValidityReportRequestToEventstreamMessage;
    function serializeValidateAuthorizationTokenRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeValidateAuthorizationTokenRequest(request))
      };
    }
    exports2.serializeValidateAuthorizationTokenRequestToEventstreamMessage = serializeValidateAuthorizationTokenRequestToEventstreamMessage;
    function serializeGetClientDeviceAuthTokenRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeGetClientDeviceAuthTokenRequest(request))
      };
    }
    exports2.serializeGetClientDeviceAuthTokenRequestToEventstreamMessage = serializeGetClientDeviceAuthTokenRequestToEventstreamMessage;
    function serializePauseComponentRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizePauseComponentRequest(request))
      };
    }
    exports2.serializePauseComponentRequestToEventstreamMessage = serializePauseComponentRequestToEventstreamMessage;
    function serializePublishToIoTCoreRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizePublishToIoTCoreRequest(request))
      };
    }
    exports2.serializePublishToIoTCoreRequestToEventstreamMessage = serializePublishToIoTCoreRequestToEventstreamMessage;
    function serializeDeleteThingShadowRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeDeleteThingShadowRequest(request))
      };
    }
    exports2.serializeDeleteThingShadowRequestToEventstreamMessage = serializeDeleteThingShadowRequestToEventstreamMessage;
    function serializeGetConfigurationRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeGetConfigurationRequest(request))
      };
    }
    exports2.serializeGetConfigurationRequestToEventstreamMessage = serializeGetConfigurationRequestToEventstreamMessage;
    function serializeDeferComponentUpdateRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeDeferComponentUpdateRequest(request))
      };
    }
    exports2.serializeDeferComponentUpdateRequestToEventstreamMessage = serializeDeferComponentUpdateRequestToEventstreamMessage;
    function serializeGetSecretValueRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeGetSecretValueRequest(request))
      };
    }
    exports2.serializeGetSecretValueRequestToEventstreamMessage = serializeGetSecretValueRequestToEventstreamMessage;
    function serializeListComponentsRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeListComponentsRequest(request))
      };
    }
    exports2.serializeListComponentsRequestToEventstreamMessage = serializeListComponentsRequestToEventstreamMessage;
    function serializeSubscribeToTopicRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeSubscribeToTopicRequest(request))
      };
    }
    exports2.serializeSubscribeToTopicRequestToEventstreamMessage = serializeSubscribeToTopicRequestToEventstreamMessage;
    function serializeCancelLocalDeploymentRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeCancelLocalDeploymentRequest(request))
      };
    }
    exports2.serializeCancelLocalDeploymentRequestToEventstreamMessage = serializeCancelLocalDeploymentRequestToEventstreamMessage;
    function serializeSubscribeToCertificateUpdatesRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeSubscribeToCertificateUpdatesRequest(request))
      };
    }
    exports2.serializeSubscribeToCertificateUpdatesRequestToEventstreamMessage = serializeSubscribeToCertificateUpdatesRequestToEventstreamMessage;
    function serializeSubscribeToValidateConfigurationUpdatesRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeSubscribeToValidateConfigurationUpdatesRequest(request))
      };
    }
    exports2.serializeSubscribeToValidateConfigurationUpdatesRequestToEventstreamMessage = serializeSubscribeToValidateConfigurationUpdatesRequestToEventstreamMessage;
    function serializeCreateLocalDeploymentRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeCreateLocalDeploymentRequest(request))
      };
    }
    exports2.serializeCreateLocalDeploymentRequestToEventstreamMessage = serializeCreateLocalDeploymentRequestToEventstreamMessage;
    function serializePutComponentMetricRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizePutComponentMetricRequest(request))
      };
    }
    exports2.serializePutComponentMetricRequestToEventstreamMessage = serializePutComponentMetricRequestToEventstreamMessage;
    function serializeSubscribeToConfigurationUpdateRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeSubscribeToConfigurationUpdateRequest(request))
      };
    }
    exports2.serializeSubscribeToConfigurationUpdateRequestToEventstreamMessage = serializeSubscribeToConfigurationUpdateRequestToEventstreamMessage;
    function serializeSubscribeToComponentUpdatesRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeSubscribeToComponentUpdatesRequest(request))
      };
    }
    exports2.serializeSubscribeToComponentUpdatesRequestToEventstreamMessage = serializeSubscribeToComponentUpdatesRequestToEventstreamMessage;
    function serializeRestartComponentRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeRestartComponentRequest(request))
      };
    }
    exports2.serializeRestartComponentRequestToEventstreamMessage = serializeRestartComponentRequestToEventstreamMessage;
    function serializeListNamedShadowsForThingRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeListNamedShadowsForThingRequest(request))
      };
    }
    exports2.serializeListNamedShadowsForThingRequestToEventstreamMessage = serializeListNamedShadowsForThingRequestToEventstreamMessage;
    function serializeUpdateConfigurationRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeUpdateConfigurationRequest(request))
      };
    }
    exports2.serializeUpdateConfigurationRequestToEventstreamMessage = serializeUpdateConfigurationRequestToEventstreamMessage;
    function serializeGetLocalDeploymentStatusRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeGetLocalDeploymentStatusRequest(request))
      };
    }
    exports2.serializeGetLocalDeploymentStatusRequestToEventstreamMessage = serializeGetLocalDeploymentStatusRequestToEventstreamMessage;
    function serializeGetThingShadowRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeGetThingShadowRequest(request))
      };
    }
    exports2.serializeGetThingShadowRequestToEventstreamMessage = serializeGetThingShadowRequestToEventstreamMessage;
    function serializeSubscribeToIoTCoreRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeSubscribeToIoTCoreRequest(request))
      };
    }
    exports2.serializeSubscribeToIoTCoreRequestToEventstreamMessage = serializeSubscribeToIoTCoreRequestToEventstreamMessage;
    function serializeUpdateStateRequestToEventstreamMessage(request) {
      return {
        type: aws_crt_1.eventstream.MessageType.ApplicationMessage,
        payload: JSON.stringify(normalizeUpdateStateRequest(request))
      };
    }
    exports2.serializeUpdateStateRequestToEventstreamMessage = serializeUpdateStateRequestToEventstreamMessage;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/greengrasscoreipc/client.js
var require_client = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/greengrasscoreipc/client.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Client = exports2.model = void 0;
    var model = __importStar(require_model2());
    exports2.model = model;
    var model_utils = __importStar(require_model_utils());
    var eventstream_rpc = __importStar(require_eventstream_rpc());
    var events_1 = require("events");
    var Client = class _Client extends events_1.EventEmitter {
      /**
       * Constructor for a GreengrassCoreIPC service client.
       *
       * @param config client configuration settings
       */
      constructor(config) {
        super();
        this.serviceModel = model_utils.makeServiceModel();
        this.rpcClient = eventstream_rpc.RpcClient.new(config);
        this.rpcClient.on("disconnection", (eventData) => {
          setImmediate(() => {
            this.emit(_Client.DISCONNECTION, eventData);
          });
        });
      }
      /**
       * Attempts to open an eventstream connection to the configured remote endpoint.  Returned promise will be fulfilled
       * if the transport-level connection is successfully established and the eventstream handshake completes without
       * error.
       *
       * connect() may only be called once.
       */
      connect() {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.rpcClient.connect();
        });
      }
      /**
       * Shuts down the client and begins the process of releasing all native resources associated with the client
       * as well as any unclosed operations.  It is critical that this function be called when finished with the client;
       * otherwise, native resources will leak.
       *
       * The client tracks unclosed operations and, as part of this process, closes them as well.
       *
       * Once a client has been closed, it may no longer be used.
       */
      close() {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.rpcClient.close();
        });
      }
      on(event, listener) {
        super.on(event, listener);
        return this;
      }
      /************************ Service Operations ************************/
      /**
       * Performs a AuthorizeClientDeviceAction operation.
       *
       * Send a request to authorize action on some resource
       *
       * @param request data describing the AuthorizeClientDeviceAction operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the AuthorizeClientDeviceAction operation's result, or rejected with an
       *    RpcError
       */
      authorizeClientDeviceAction(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#AuthorizeClientDeviceAction",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a CancelLocalDeployment operation.
       *
       * Cancel a local deployment on the device.
       *
       * @param request data describing the CancelLocalDeployment operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the CancelLocalDeployment operation's result, or rejected with an
       *    RpcError
       */
      cancelLocalDeployment(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#CancelLocalDeployment",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a CreateDebugPassword operation.
       *
       * Generate a password for the LocalDebugConsole component
       *
       * @param request data describing the CreateDebugPassword operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the CreateDebugPassword operation's result, or rejected with an
       *    RpcError
       */
      createDebugPassword(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#CreateDebugPassword",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a CreateLocalDeployment operation.
       *
       * Creates a local deployment on the device.  Also allows to remove existing components.
       *
       * @param request data describing the CreateLocalDeployment operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the CreateLocalDeployment operation's result, or rejected with an
       *    RpcError
       */
      createLocalDeployment(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#CreateLocalDeployment",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a DeferComponentUpdate operation.
       *
       * Defer the update of components by a given amount of time and check again after that.
       *
       * @param request data describing the DeferComponentUpdate operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the DeferComponentUpdate operation's result, or rejected with an
       *    RpcError
       */
      deferComponentUpdate(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#DeferComponentUpdate",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a DeleteThingShadow operation.
       *
       * Deletes a device shadow document stored in the local shadow service
       *
       * @param request data describing the DeleteThingShadow operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the DeleteThingShadow operation's result, or rejected with an
       *    RpcError
       */
      deleteThingShadow(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#DeleteThingShadow",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a GetClientDeviceAuthToken operation.
       *
       * Get session token for a client device
       *
       * @param request data describing the GetClientDeviceAuthToken operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the GetClientDeviceAuthToken operation's result, or rejected with an
       *    RpcError
       */
      getClientDeviceAuthToken(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#GetClientDeviceAuthToken",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a GetComponentDetails operation.
       *
       * Gets the status and version of the component with the given component name
       *
       * @param request data describing the GetComponentDetails operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the GetComponentDetails operation's result, or rejected with an
       *    RpcError
       */
      getComponentDetails(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#GetComponentDetails",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a GetConfiguration operation.
       *
       * Get value of a given key from the configuration
       *
       * @param request data describing the GetConfiguration operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the GetConfiguration operation's result, or rejected with an
       *    RpcError
       */
      getConfiguration(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#GetConfiguration",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a GetLocalDeploymentStatus operation.
       *
       * Get status of a local deployment with the given deploymentId
       *
       * @param request data describing the GetLocalDeploymentStatus operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the GetLocalDeploymentStatus operation's result, or rejected with an
       *    RpcError
       */
      getLocalDeploymentStatus(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#GetLocalDeploymentStatus",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a GetSecretValue operation.
       *
       * Retrieves a secret stored in AWS secrets manager
       *
       * @param request data describing the GetSecretValue operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the GetSecretValue operation's result, or rejected with an
       *    RpcError
       */
      getSecretValue(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#GetSecretValue",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a GetThingShadow operation.
       *
       * Retrieves a device shadow document stored by the local shadow service
       *
       * @param request data describing the GetThingShadow operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the GetThingShadow operation's result, or rejected with an
       *    RpcError
       */
      getThingShadow(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#GetThingShadow",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a ListComponents operation.
       *
       * Request for a list of components
       *
       * @param request data describing the ListComponents operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the ListComponents operation's result, or rejected with an
       *    RpcError
       */
      listComponents(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#ListComponents",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a ListLocalDeployments operation.
       *
       * Lists the last 5 local deployments along with their statuses
       *
       * @param request data describing the ListLocalDeployments operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the ListLocalDeployments operation's result, or rejected with an
       *    RpcError
       */
      listLocalDeployments(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#ListLocalDeployments",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a ListNamedShadowsForThing operation.
       *
       * Lists the named shadows for the specified thing
       *
       * @param request data describing the ListNamedShadowsForThing operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the ListNamedShadowsForThing operation's result, or rejected with an
       *    RpcError
       */
      listNamedShadowsForThing(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#ListNamedShadowsForThing",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a PauseComponent operation.
       *
       * Pause a running component
       *
       * @param request data describing the PauseComponent operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the PauseComponent operation's result, or rejected with an
       *    RpcError
       */
      pauseComponent(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#PauseComponent",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a PublishToIoTCore operation.
       *
       * Publish an MQTT message to AWS IoT message broker
       *
       * @param request data describing the PublishToIoTCore operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the PublishToIoTCore operation's result, or rejected with an
       *    RpcError
       */
      publishToIoTCore(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#PublishToIoTCore",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a PublishToTopic operation.
       *
       * Publish to a custom topic.
       *
       * @param request data describing the PublishToTopic operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the PublishToTopic operation's result, or rejected with an
       *    RpcError
       */
      publishToTopic(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#PublishToTopic",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a PutComponentMetric operation.
       *
       * Send component metrics
       * NOTE Only usable by AWS components
       *
       * @param request data describing the PutComponentMetric operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the PutComponentMetric operation's result, or rejected with an
       *    RpcError
       */
      putComponentMetric(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#PutComponentMetric",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a RestartComponent operation.
       *
       * Restarts a component with the given name
       *
       * @param request data describing the RestartComponent operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the RestartComponent operation's result, or rejected with an
       *    RpcError
       */
      restartComponent(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#RestartComponent",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a ResumeComponent operation.
       *
       * Resume a paused component
       *
       * @param request data describing the ResumeComponent operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the ResumeComponent operation's result, or rejected with an
       *    RpcError
       */
      resumeComponent(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#ResumeComponent",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a SendConfigurationValidityReport operation.
       *
       * This operation should be used in response to event received as part of SubscribeToValidateConfigurationUpdates
       * subscription. It is not necessary to send the report if the configuration is valid (GGC will wait for timeout
       * period and proceed). Sending the report with invalid config status will prevent GGC from applying the updates
       *
       * @param request data describing the SendConfigurationValidityReport operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the SendConfigurationValidityReport operation's result, or rejected with an
       *    RpcError
       */
      sendConfigurationValidityReport(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#SendConfigurationValidityReport",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a StopComponent operation.
       *
       * Stops a component with the given name
       *
       * @param request data describing the StopComponent operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the StopComponent operation's result, or rejected with an
       *    RpcError
       */
      stopComponent(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#StopComponent",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Creates a SubscribeToCertificateUpdates streaming operation.
       *
       * Create a subscription for new certificates
       *
       * Once created, the streaming operation must be started by a call to activate().
       *
       * If the operation allows for streaming input, the user may attach event listeners to receive messages.
       *
       * If the operation allows for streaming output, the user may call sendProtocolMessage() to send messages on
       * the operation's event stream once the operation has been activated.
       *
       * The user should close() a streaming operation once finished with it.  If close() is not called, the native
       * resources associated with the streaming operation will not be freed until the client is closed.
       *
       * @param request data describing the SubscribeToCertificateUpdates streaming operation to create
       * @param options additional eventstream options to use while this operation is active
       * @return a new StreamingOperation object
       */
      subscribeToCertificateUpdates(request, options) {
        let operationConfig = {
          name: "aws.greengrass#SubscribeToCertificateUpdates",
          client: this.rpcClient,
          options: options ? options : {}
        };
        return new eventstream_rpc.StreamingOperation(request, operationConfig, this.serviceModel);
      }
      /**
       * Creates a SubscribeToComponentUpdates streaming operation.
       *
       * Subscribe to receive notification if GGC is about to update any components
       *
       * Once created, the streaming operation must be started by a call to activate().
       *
       * If the operation allows for streaming input, the user may attach event listeners to receive messages.
       *
       * If the operation allows for streaming output, the user may call sendProtocolMessage() to send messages on
       * the operation's event stream once the operation has been activated.
       *
       * The user should close() a streaming operation once finished with it.  If close() is not called, the native
       * resources associated with the streaming operation will not be freed until the client is closed.
       *
       * @param request data describing the SubscribeToComponentUpdates streaming operation to create
       * @param options additional eventstream options to use while this operation is active
       * @return a new StreamingOperation object
       */
      subscribeToComponentUpdates(request, options) {
        let operationConfig = {
          name: "aws.greengrass#SubscribeToComponentUpdates",
          client: this.rpcClient,
          options: options ? options : {}
        };
        return new eventstream_rpc.StreamingOperation(request, operationConfig, this.serviceModel);
      }
      /**
       * Creates a SubscribeToConfigurationUpdate streaming operation.
       *
       * Subscribes to be notified when GGC updates the configuration for a given componentName and keyName.
       *
       * Once created, the streaming operation must be started by a call to activate().
       *
       * If the operation allows for streaming input, the user may attach event listeners to receive messages.
       *
       * If the operation allows for streaming output, the user may call sendProtocolMessage() to send messages on
       * the operation's event stream once the operation has been activated.
       *
       * The user should close() a streaming operation once finished with it.  If close() is not called, the native
       * resources associated with the streaming operation will not be freed until the client is closed.
       *
       * @param request data describing the SubscribeToConfigurationUpdate streaming operation to create
       * @param options additional eventstream options to use while this operation is active
       * @return a new StreamingOperation object
       */
      subscribeToConfigurationUpdate(request, options) {
        let operationConfig = {
          name: "aws.greengrass#SubscribeToConfigurationUpdate",
          client: this.rpcClient,
          options: options ? options : {}
        };
        return new eventstream_rpc.StreamingOperation(request, operationConfig, this.serviceModel);
      }
      /**
       * Creates a SubscribeToIoTCore streaming operation.
       *
       * Subscribe to a topic in AWS IoT message broker.
       *
       * Once created, the streaming operation must be started by a call to activate().
       *
       * If the operation allows for streaming input, the user may attach event listeners to receive messages.
       *
       * If the operation allows for streaming output, the user may call sendProtocolMessage() to send messages on
       * the operation's event stream once the operation has been activated.
       *
       * The user should close() a streaming operation once finished with it.  If close() is not called, the native
       * resources associated with the streaming operation will not be freed until the client is closed.
       *
       * @param request data describing the SubscribeToIoTCore streaming operation to create
       * @param options additional eventstream options to use while this operation is active
       * @return a new StreamingOperation object
       */
      subscribeToIoTCore(request, options) {
        let operationConfig = {
          name: "aws.greengrass#SubscribeToIoTCore",
          client: this.rpcClient,
          options: options ? options : {}
        };
        return new eventstream_rpc.StreamingOperation(request, operationConfig, this.serviceModel);
      }
      /**
       * Creates a SubscribeToTopic streaming operation.
       *
       * Creates a subscription for a custom topic
       *
       * Once created, the streaming operation must be started by a call to activate().
       *
       * If the operation allows for streaming input, the user may attach event listeners to receive messages.
       *
       * If the operation allows for streaming output, the user may call sendProtocolMessage() to send messages on
       * the operation's event stream once the operation has been activated.
       *
       * The user should close() a streaming operation once finished with it.  If close() is not called, the native
       * resources associated with the streaming operation will not be freed until the client is closed.
       *
       * @param request data describing the SubscribeToTopic streaming operation to create
       * @param options additional eventstream options to use while this operation is active
       * @return a new StreamingOperation object
       */
      subscribeToTopic(request, options) {
        let operationConfig = {
          name: "aws.greengrass#SubscribeToTopic",
          client: this.rpcClient,
          options: options ? options : {}
        };
        return new eventstream_rpc.StreamingOperation(request, operationConfig, this.serviceModel);
      }
      /**
           * Creates a SubscribeToValidateConfigurationUpdates streaming operation.
           *
           * Subscribes to be notified when GGC is about to update configuration for this component
      GGC will wait for a timeout period before it proceeds with the update.
      If the new configuration is not valid this component can use the SendConfigurationValidityReport
      operation to indicate that
           *
           * Once created, the streaming operation must be started by a call to activate().
           *
           * If the operation allows for streaming input, the user may attach event listeners to receive messages.
           *
           * If the operation allows for streaming output, the user may call sendProtocolMessage() to send messages on
           * the operation's event stream once the operation has been activated.
           *
           * The user should close() a streaming operation once finished with it.  If close() is not called, the native
           * resources associated with the streaming operation will not be freed until the client is closed.
           *
           * @param request data describing the SubscribeToValidateConfigurationUpdates streaming operation to create
           * @param options additional eventstream options to use while this operation is active
           * @return a new StreamingOperation object
           */
      subscribeToValidateConfigurationUpdates(request, options) {
        let operationConfig = {
          name: "aws.greengrass#SubscribeToValidateConfigurationUpdates",
          client: this.rpcClient,
          options: options ? options : {}
        };
        return new eventstream_rpc.StreamingOperation(request, operationConfig, this.serviceModel);
      }
      /**
       * Performs a UpdateConfiguration operation.
       *
       * Update this component's configuration by replacing the value of given keyName with the newValue.
       * If an oldValue is specified then update will only take effect id the current value matches the given oldValue
       *
       * @param request data describing the UpdateConfiguration operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the UpdateConfiguration operation's result, or rejected with an
       *    RpcError
       */
      updateConfiguration(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#UpdateConfiguration",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a UpdateState operation.
       *
       * Update status of this component
       *
       * @param request data describing the UpdateState operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the UpdateState operation's result, or rejected with an
       *    RpcError
       */
      updateState(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#UpdateState",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a UpdateThingShadow operation.
       *
       * Updates a device shadow document stored in the local shadow service
       * The update is an upsert operation, with optimistic locking support
       *
       * @param request data describing the UpdateThingShadow operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the UpdateThingShadow operation's result, or rejected with an
       *    RpcError
       */
      updateThingShadow(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#UpdateThingShadow",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a ValidateAuthorizationToken operation.
       *
       * Validate authorization token
       * NOTE This API can be used only by stream manager, customer component calling this API will receive UnauthorizedError
       *
       * @param request data describing the ValidateAuthorizationToken operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the ValidateAuthorizationToken operation's result, or rejected with an
       *    RpcError
       */
      validateAuthorizationToken(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#ValidateAuthorizationToken",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
      /**
       * Performs a VerifyClientDeviceIdentity operation.
       *
       * Verify client device credentials
       *
       * @param request data describing the VerifyClientDeviceIdentity operation to perform
       * @param options additional eventstream options to use while performing this operation
       * @return a Promise that is resolved with the VerifyClientDeviceIdentity operation's result, or rejected with an
       *    RpcError
       */
      verifyClientDeviceIdentity(request, options) {
        return __awaiter(this, void 0, void 0, function* () {
          let operationConfig = {
            name: "aws.greengrass#VerifyClientDeviceIdentity",
            client: this.rpcClient,
            options: options ? options : {}
          };
          let operation = new eventstream_rpc.RequestResponseOperation(operationConfig, this.serviceModel);
          return yield operation.activate(request);
        });
      }
    };
    exports2.Client = Client;
    Client.DISCONNECTION = "disconnection";
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/greengrasscoreipc.js
var require_greengrasscoreipc = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/greengrasscoreipc.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createClient = exports2.createDefaultClientConfig = void 0;
    var greengrasscoreipc = __importStar(require_client());
    var eventstream_rpc = __importStar(require_eventstream_rpc());
    var aws_crt_1 = require_dist();
    __exportStar(require_client(), exports2);
    function createDefaultClientConfig() {
      let envHostName = process.env.AWS_GG_NUCLEUS_DOMAIN_SOCKET_FILEPATH_FOR_COMPONENT;
      let envAuthToken = process.env.SVCUID;
      return {
        hostName: envHostName ? envHostName : "",
        port: 0,
        socketOptions: new aws_crt_1.io.SocketOptions(aws_crt_1.io.SocketType.STREAM, aws_crt_1.io.SocketDomain.LOCAL),
        connectTransform: (options) => __awaiter(this, void 0, void 0, function* () {
          let connectMessage = options.message;
          if (envAuthToken) {
            connectMessage.payload = JSON.stringify({
              authToken: envAuthToken
            });
          }
          return connectMessage;
        })
      };
    }
    exports2.createDefaultClientConfig = createDefaultClientConfig;
    function createClient(config) {
      if (!config) {
        config = createDefaultClientConfig();
      }
      eventstream_rpc.validateRpcClientConfig(config);
      return new greengrasscoreipc.Client(config);
    }
    exports2.createClient = createClient;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotidentity/model.js
var require_model3 = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotidentity/model.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/service_client_mqtt_adapter.js
var require_service_client_mqtt_adapter = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/service_client_mqtt_adapter.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ServiceClientMqtt5Adapter = exports2.ServiceClientMqtt311Adapter = void 0;
    var aws_crt_1 = require_dist();
    var ServiceClientMqtt311Adapter = class {
      constructor(connection2) {
        this.connection = connection2;
      }
      publish(topic, payload, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.connection.publish(topic, payload, qos);
        });
      }
      subscribe(topic, qos, on_message) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.connection.subscribe(topic, qos, on_message);
        });
      }
    };
    exports2.ServiceClientMqtt311Adapter = ServiceClientMqtt311Adapter;
    var ServiceClientMqtt5Adapter = class {
      onMessageReceivedHandler(eventData) {
        var _a;
        let publish = eventData.message;
        let topic = publish.topicName;
        let handler = this.subscriptionHandlers.get(topic);
        if (handler) {
          handler(topic, publish.payload, false, publish.qos, (_a = publish.retain) !== null && _a !== void 0 ? _a : false);
        }
      }
      constructor(client2) {
        this.client = client2;
        this.subscriptionHandlers = /* @__PURE__ */ new Map();
        client2.on("messageReceived", this.onMessageReceivedHandler.bind(this));
      }
      publish(topic, payload, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
              let result = yield this.client.publish({
                topicName: topic,
                payload,
                qos
              });
              if (result === void 0) {
                if (qos == aws_crt_1.mqtt.QoS.AtMostOnce) {
                  resolve({});
                } else {
                  reject("Publish failed due to internal error");
                }
                return;
              }
              let puback = result;
              if (aws_crt_1.mqtt5.isSuccessfulPubackReasonCode(puback.reasonCode)) {
                resolve({});
              } else {
                reject(new aws_crt_1.CrtError("Publish failed with reason code: " + puback.reasonCode));
              }
            } catch (e) {
              reject(e);
            }
          }));
        });
      }
      subscribe(topic, qos, on_message) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
              this.subscriptionHandlers.set(topic, on_message);
              let result = yield this.client.subscribe({
                subscriptions: [{ topicFilter: topic, qos }]
              });
              let reasonCode = result.reasonCodes[0];
              if (aws_crt_1.mqtt5.isSuccessfulSubackReasonCode(reasonCode)) {
                resolve({
                  topic,
                  qos: reasonCode
                });
              } else {
                throw new aws_crt_1.CrtError("Subscribe failed with reason code: " + reasonCode);
              }
            } catch (e) {
              this.subscriptionHandlers.delete(topic);
              reject(e);
            }
          }));
        });
      }
    };
    exports2.ServiceClientMqtt5Adapter = ServiceClientMqtt5Adapter;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotidentity/iotidentityclient.js
var require_iotidentityclient = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotidentity/iotidentityclient.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IotIdentityClient = exports2.IotIdentityError = void 0;
    var util_utf8_browser_1 = require_dist_cjs();
    var service_client_mqtt_adapter = __importStar(require_service_client_mqtt_adapter());
    var IotIdentityError = class extends Error {
      constructor(message, payload) {
        super(message);
        this.payload = payload;
        const myProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, myProto);
        } else {
          this.prototype = myProto;
        }
      }
    };
    exports2.IotIdentityError = IotIdentityError;
    var IotIdentityClient = class _IotIdentityClient {
      static createClientError(err, payload) {
        if (err instanceof Error) {
          return new IotIdentityError(err.message, payload);
        } else {
          return new IotIdentityError(_IotIdentityClient.INVALID_PAYLOAD_PARSING_ERROR, payload);
        }
      }
      constructor(connection2) {
        if (connection2 !== void 0) {
          this.mqttAdapter = new service_client_mqtt_adapter.ServiceClientMqtt311Adapter(connection2);
        }
      }
      /**
       * Creates a new IotIdentityClient that uses the SDK Mqtt5 client internally.
       *
       * The pre-existing constructor that is bound to the MQTT311 client makes this awkward since we
       * must support
       *
       * ```
       * new IotIdentityClient(mqtt311connection);
       * ```
       *
       * for backwards compatibility, but still want to be able to inject an MQTT5 client as well.
       *
       * @param client the MQTT5 client to use with this service client
       *
       * @return a new IotIdentityClient instance
       */
      static newFromMqtt5Client(client2) {
        let serviceClient = new _IotIdentityClient();
        serviceClient.mqttAdapter = new service_client_mqtt_adapter.ServiceClientMqtt5Adapter(client2);
        return serviceClient;
      }
      /**
       * Creates a certificate from a certificate signing request (CSR). AWS IoT provides client certificates that are signed by the Amazon Root certificate authority (CA). The new certificate has a PENDING_ACTIVATION status. When you call RegisterThing to provision a thing with this certificate, the certificate status changes to ACTIVE or INACTIVE as described in the template.
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html#fleet-provision-api
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotIdentity
       */
      publishCreateCertificateFromCsr(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/certificates/create-from-csr/json";
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Creates new keys and a certificate. AWS IoT provides client certificates that are signed by the Amazon Root certificate authority (CA). The new certificate has a PENDING_ACTIVATION status. When you call RegisterThing to provision a thing with this certificate, the certificate status changes to ACTIVE or INACTIVE as described in the template.
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html#fleet-provision-api
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotIdentity
       */
      publishCreateKeysAndCertificate(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/certificates/create/json";
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Provisions an AWS IoT thing using a pre-defined template.
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html#fleet-provision-api
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotIdentity
       */
      publishRegisterThing(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/provisioning-templates/{templateName}/provision/json";
          topic = topic.replace("{templateName}", request.templateName);
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Subscribes to the accepted topic of the CreateCertificateFromCsr operation.
       *
       *
       * subscribeToCreateCertificateFromCsrAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html#fleet-provision-api
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotIdentity
       */
      subscribeToCreateCertificateFromCsrAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/certificates/create-from-csr/json/accepted";
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotIdentityClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic of the CreateCertificateFromCsr operation.
       *
       *
       * subscribeToCreateCertificateFromCsrRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html#fleet-provision-api
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotIdentity
       */
      subscribeToCreateCertificateFromCsrRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/certificates/create-from-csr/json/rejected";
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotIdentityClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the accepted topic of the CreateKeysAndCertificate operation.
       *
       *
       * subscribeToCreateKeysAndCertificateAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html#fleet-provision-api
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotIdentity
       */
      subscribeToCreateKeysAndCertificateAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/certificates/create/json/accepted";
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotIdentityClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic of the CreateKeysAndCertificate operation.
       *
       *
       * subscribeToCreateKeysAndCertificateRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html#fleet-provision-api
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotIdentity
       */
      subscribeToCreateKeysAndCertificateRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/certificates/create/json/rejected";
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotIdentityClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the accepted topic of the RegisterThing operation.
       *
       *
       * subscribeToRegisterThingAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html#fleet-provision-api
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotIdentity
       */
      subscribeToRegisterThingAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/provisioning-templates/{templateName}/provision/json/accepted";
          topic = topic.replace("{templateName}", request.templateName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotIdentityClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic of the RegisterThing operation.
       *
       *
       * subscribeToRegisterThingRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html#fleet-provision-api
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotIdentity
       */
      subscribeToRegisterThingRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/provisioning-templates/{templateName}/provision/json/rejected";
          topic = topic.replace("{templateName}", request.templateName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotIdentityClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
    };
    exports2.IotIdentityClient = IotIdentityClient;
    IotIdentityClient.INVALID_PAYLOAD_PARSING_ERROR = "Invalid/unknown error parsing payload into response";
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/mqtt_request_response.js
var require_mqtt_request_response3 = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/mqtt_request_response.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ServiceError = exports2.StreamingOperation = void 0;
    var events_1 = require("events");
    var aws_crt_1 = require_dist();
    var mqtt_request_response_utils = __importStar(require_mqtt_request_response_utils());
    var StreamingOperation = class _StreamingOperation extends events_1.EventEmitter {
      constructor(config) {
        super();
        let streamingOperationModel = config.serviceModel.streamingOperations.get(config.operationName);
        if (!streamingOperationModel) {
          throw new aws_crt_1.CrtError("NYI");
        }
        let validator = config.serviceModel.shapeValidators.get(streamingOperationModel.inputShapeName);
        if (!validator) {
          throw new aws_crt_1.CrtError("NYI");
        }
        validator(config.modelConfig);
        let streamOptions = {
          subscriptionTopicFilter: streamingOperationModel.subscriptionGenerator(config.modelConfig)
        };
        this.deserializer = streamingOperationModel.deserializer;
        this.operation = config.client.createStream(streamOptions);
        this.operation.addListener(aws_crt_1.mqtt_request_response.StreamingOperationBase.SUBSCRIPTION_STATUS, this.onSubscriptionStatusChanged.bind(this));
        this.operation.addListener(aws_crt_1.mqtt_request_response.StreamingOperationBase.INCOMING_PUBLISH, this.onIncomingPublish.bind(this));
      }
      static create(config) {
        let operation = new _StreamingOperation(config);
        return operation;
      }
      open() {
        this.operation.open();
      }
      close() {
        this.operation.close();
      }
      on(event, listener) {
        super.on(event, listener);
        return this;
      }
      onSubscriptionStatusChanged(eventData) {
        setImmediate(() => __awaiter(this, void 0, void 0, function* () {
          this.emit(_StreamingOperation.SUBSCRIPTION_STATUS, eventData);
        }));
      }
      onIncomingPublish(eventData) {
        try {
          let message = this.deserializer(eventData.payload);
          setImmediate(() => __awaiter(this, void 0, void 0, function* () {
            this.emit(_StreamingOperation.INCOMING_PUBLISH, {
              message
            });
          }));
        } catch (error) {
          let serviceError = mqtt_request_response_utils.createServiceError(error.toString());
          setImmediate(() => __awaiter(this, void 0, void 0, function* () {
            this.emit(_StreamingOperation.INCOMING_PUBLISH_ERROR, {
              payload: eventData.payload,
              error: serviceError
            });
          }));
        }
      }
    };
    exports2.StreamingOperation = StreamingOperation;
    StreamingOperation.SUBSCRIPTION_STATUS = "subscriptionStatus";
    StreamingOperation.INCOMING_PUBLISH = "incomingPublish";
    StreamingOperation.INCOMING_PUBLISH_ERROR = "incomingPublishError";
    var ServiceError = class extends Error {
      /** @internal */
      constructor(options) {
        super(options.description);
        if (options.internalError) {
          this.internalError = options.internalError;
        }
        if (options.modeledError) {
          this.modeledError = options.modeledError;
        }
      }
    };
    exports2.ServiceError = ServiceError;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/mqtt_request_response_utils.js
var require_mqtt_request_response_utils = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/mqtt_request_response_utils.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateValueAsOptionalObject = exports2.validateValueAsObject = exports2.validateValueAsOptionalMap = exports2.validateValueAsMap = exports2.validateValueAsOptionalArray = exports2.validateValueAsArray = exports2.validateValueAsOptionalAny = exports2.validateValueAsAny = exports2.validateValueAsOptionalBlob = exports2.validateValueAsBlob = exports2.validateValueAsOptionalDate = exports2.validateValueAsDate = exports2.validateValueAsOptionalBoolean = exports2.validateValueAsBoolean = exports2.validateValueAsOptionalInteger = exports2.validateValueAsInteger = exports2.validateValueAsOptionalString = exports2.validateValueAsString = exports2.validateValueAsNumber = exports2.validateOptionalValueAsNumber = exports2.validateValueAsTopicSegment = exports2.createServiceError = exports2.doRequestResponse = void 0;
    var aws_crt_1 = require_dist();
    var mqtt_request_response_1 = require_mqtt_request_response3();
    function buildResponseDeserializerMap(paths) {
      return new Map(paths.map((path) => {
        return [path.topic, path.deserializer];
      }));
    }
    function buildResponsePaths(paths) {
      return paths.map((path) => {
        let responsePath = {
          topic: path.topic
        };
        if (path.correlationTokenJsonPath) {
          responsePath.correlationTokenJsonPath = path.correlationTokenJsonPath;
        }
        return responsePath;
      });
    }
    function doRequestResponse(options) {
      return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
          try {
            let operationModel = options.serviceModel.requestResponseOperations.get(options.operationName);
            if (!operationModel) {
              reject(createServiceError(`Operation "${options.operationName}" not in client's service model`));
              return;
            }
            let validator = options.serviceModel.shapeValidators.get(operationModel.inputShapeName);
            if (!validator) {
              reject(createServiceError(`Operation "${options.operationName}" does not have an input validator`));
              return;
            }
            validator(options.request);
            let publishTopic = operationModel.publishTopicGenerator(options.request);
            let subscriptionsNeeded = operationModel.subscriptionGenerator(options.request);
            let modelPaths = operationModel.responsePathGenerator(options.request);
            let deserializerMap = buildResponseDeserializerMap(modelPaths);
            let responsePaths = buildResponsePaths(modelPaths);
            let [request, correlationToken] = operationModel.correlationTokenApplicator(options.request);
            let payload = operationModel.payloadTransformer(request);
            let requestOptions = {
              subscriptionTopicFilters: subscriptionsNeeded,
              responsePaths,
              publishTopic,
              payload
            };
            if (correlationToken) {
              requestOptions.correlationToken = correlationToken;
            }
            let response = yield options.client.submitRequest(requestOptions);
            let responseTopic = response.topic;
            let wasSuccess = responseTopic.endsWith("accepted");
            let responsePayload = response.payload;
            let deserializer = deserializerMap.get(responseTopic);
            if (!deserializer) {
              reject(createServiceError(`Operation "${options.operationName}" does not have a deserializer for topic "${responseTopic}"`));
              return;
            }
            let deserializedResponse = deserializer(responsePayload);
            if (wasSuccess) {
              resolve(deserializedResponse);
            } else {
              reject(createServiceError("Request failed", void 0, deserializedResponse));
            }
          } catch (err) {
            if (err instanceof mqtt_request_response_1.ServiceError) {
              reject(err);
            } else if (err instanceof aws_crt_1.CrtError) {
              reject(createServiceError("CrtError", err));
            } else {
              reject(createServiceError(err.toString()));
            }
          }
        }));
      });
    }
    exports2.doRequestResponse = doRequestResponse;
    function createServiceError(description, internalError, modeledError) {
      return new mqtt_request_response_1.ServiceError({
        description,
        internalError,
        modeledError
      });
    }
    exports2.createServiceError = createServiceError;
    function throwMissingPropertyError(propertyName) {
      if (propertyName) {
        throw createServiceError(`validation failure - missing required property '${propertyName}'`);
      } else {
        throw createServiceError(`validation failure - missing required property`);
      }
    }
    function throwInvalidPropertyValueError(valueDescription, propertyName) {
      if (propertyName) {
        throw createServiceError(`validation failure - property '${propertyName}' must be ${valueDescription}`);
      } else {
        throw createServiceError(`validation failure - property must be ${valueDescription}`);
      }
    }
    function validateValueAsTopicSegment(value, propertyName) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName);
      }
      if (typeof value !== "string") {
        throwInvalidPropertyValueError("a string", propertyName);
      }
      if (value.includes("/") || value.includes("#") || value.includes("+")) {
        throwInvalidPropertyValueError("a valid MQTT topic", propertyName);
      }
    }
    exports2.validateValueAsTopicSegment = validateValueAsTopicSegment;
    function validateOptionalValueAsNumber(value, propertyName) {
      if (value === void 0) {
        return;
      }
      validateValueAsNumber(value, propertyName);
    }
    exports2.validateOptionalValueAsNumber = validateOptionalValueAsNumber;
    function validateValueAsNumber(value, propertyName) {
      if (value == void 0) {
        throwMissingPropertyError(propertyName);
      }
      if (typeof value !== "number") {
        throwInvalidPropertyValueError("a number", propertyName);
      }
    }
    exports2.validateValueAsNumber = validateValueAsNumber;
    function validateValueAsString(value, propertyName) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName);
      }
      if (typeof value !== "string") {
        throwInvalidPropertyValueError("a string value", propertyName);
      }
    }
    exports2.validateValueAsString = validateValueAsString;
    function validateValueAsOptionalString(value, propertyName) {
      if (value === void 0) {
        return;
      }
      validateValueAsString(value, propertyName);
    }
    exports2.validateValueAsOptionalString = validateValueAsOptionalString;
    function validateValueAsInteger(value, propertyName) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName);
      }
      if (typeof value !== "number" || !Number.isSafeInteger(value)) {
        throwInvalidPropertyValueError("an integer value", propertyName);
      }
    }
    exports2.validateValueAsInteger = validateValueAsInteger;
    function validateValueAsOptionalInteger(value, propertyName) {
      if (value === void 0) {
        return;
      }
      validateValueAsInteger(value, propertyName);
    }
    exports2.validateValueAsOptionalInteger = validateValueAsOptionalInteger;
    function validateValueAsBoolean(value, propertyName) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName);
      }
      if (typeof value !== "boolean") {
        throwInvalidPropertyValueError("a boolean value", propertyName);
      }
    }
    exports2.validateValueAsBoolean = validateValueAsBoolean;
    function validateValueAsOptionalBoolean(value, propertyName) {
      if (value === void 0) {
        return;
      }
      validateValueAsBoolean(value, propertyName);
    }
    exports2.validateValueAsOptionalBoolean = validateValueAsOptionalBoolean;
    function validateValueAsDate(value, propertyName) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName);
      }
      if (!(value instanceof Date) || isNaN(value.getTime())) {
        throwInvalidPropertyValueError("a Date value", propertyName);
      }
    }
    exports2.validateValueAsDate = validateValueAsDate;
    function validateValueAsOptionalDate(value, propertyName) {
      if (value === void 0) {
        return;
      }
      validateValueAsDate(value, propertyName);
    }
    exports2.validateValueAsOptionalDate = validateValueAsOptionalDate;
    function validateValueAsBlob(value, propertyName) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName);
      }
      if (typeof value !== "string" && !ArrayBuffer.isView(value) && (!value.byteLength || !value.maxByteLength)) {
        throwInvalidPropertyValueError("a value convertible to a binary payload", propertyName);
      }
    }
    exports2.validateValueAsBlob = validateValueAsBlob;
    function validateValueAsOptionalBlob(value, propertyName) {
      if (value === void 0) {
        return;
      }
      validateValueAsBlob(value, propertyName);
    }
    exports2.validateValueAsOptionalBlob = validateValueAsOptionalBlob;
    function validateValueAsAny(value, propertyName) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName);
      }
    }
    exports2.validateValueAsAny = validateValueAsAny;
    function validateValueAsOptionalAny(value, propertyName) {
      if (value === void 0) {
        return;
      }
      validateValueAsAny(value, propertyName);
    }
    exports2.validateValueAsOptionalAny = validateValueAsOptionalAny;
    function validateValueAsArray(value, elementValidator, propertyName) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName);
      }
      if (!Array.isArray(value)) {
        throwInvalidPropertyValueError("an array value", propertyName);
      }
      for (const element of value) {
        try {
          elementValidator(element);
        } catch (err) {
          let serviceError = err;
          if (propertyName) {
            throw createServiceError(`Array property '${propertyName}' contains an invalid value: ${serviceError.toString()}`);
          } else {
            throw createServiceError(`Array contains an invalid value: ${serviceError.toString()}`);
          }
        }
      }
    }
    exports2.validateValueAsArray = validateValueAsArray;
    function validateValueAsOptionalArray(value, elementValidator, propertyName) {
      if (value === void 0) {
        return;
      }
      validateValueAsArray(value, elementValidator, propertyName);
    }
    exports2.validateValueAsOptionalArray = validateValueAsOptionalArray;
    function validateValueAsMap(value, keyValidator, valueValidator, propertyName) {
      if (value === void 0) {
        return;
      }
      for (const key in value) {
        try {
          keyValidator(key);
        } catch (err) {
          let serviceError = err;
          if (propertyName) {
            throw createServiceError(`Map property '${propertyName}' contains an invalid key: ${serviceError.toString()}`);
          } else {
            throw createServiceError(`Map contains an invalid key: ${serviceError.toString()}`);
          }
        }
        let val = value[key];
        try {
          valueValidator(val);
        } catch (err) {
          let serviceError = err;
          if (propertyName) {
            throw createServiceError(`Map property '${propertyName}' contains an invalid value: ${serviceError.toString()}`);
          } else {
            throw createServiceError(`Map contains an invalid value: ${serviceError.toString()}`);
          }
        }
      }
    }
    exports2.validateValueAsMap = validateValueAsMap;
    function validateValueAsOptionalMap(value, keyValidator, valueValidator, propertyName) {
      if (value === void 0) {
        return;
      }
      validateValueAsMap(value, keyValidator, valueValidator, propertyName);
    }
    exports2.validateValueAsOptionalMap = validateValueAsOptionalMap;
    function validateValueAsObject(value, elementValidator, propertyName) {
      if (value === void 0) {
        throwMissingPropertyError(propertyName);
      }
      try {
        elementValidator(value);
      } catch (err) {
        let serviceError = err;
        throw createServiceError(`Property '${propertyName}' contains an invalid value: ${serviceError.toString()}`);
      }
    }
    exports2.validateValueAsObject = validateValueAsObject;
    function validateValueAsOptionalObject(value, elementValidator, propertyName) {
      if (value === void 0) {
        return;
      }
      validateValueAsObject(value, elementValidator, propertyName);
    }
    exports2.validateValueAsOptionalObject = validateValueAsOptionalObject;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotidentity/v2utils.js
var require_v2utils = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotidentity/v2utils.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.makeServiceModel = void 0;
    var util_utf8_browser_1 = require_dist_cjs();
    var model_validation_utils = __importStar(require_mqtt_request_response_utils());
    function normalizeCreateCertificateFromCsrRequest(value) {
      let normalizedValue = {};
      if (value.certificateSigningRequest) {
        normalizedValue.certificateSigningRequest = value.certificateSigningRequest;
      }
      return normalizedValue;
    }
    function buildCreateCertificateFromCsrRequestPayload(request) {
      let value = normalizeCreateCertificateFromCsrRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToCreateCertificateFromCsrRequest(request) {
      return [request, void 0];
    }
    function normalizeCreateKeysAndCertificateRequest(value) {
      let normalizedValue = {};
      return normalizedValue;
    }
    function buildCreateKeysAndCertificateRequestPayload(request) {
      let value = normalizeCreateKeysAndCertificateRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToCreateKeysAndCertificateRequest(request) {
      return [request, void 0];
    }
    function normalizeRegisterThingRequest(value) {
      let normalizedValue = {};
      if (value.certificateOwnershipToken) {
        normalizedValue.certificateOwnershipToken = value.certificateOwnershipToken;
      }
      if (value.parameters) {
        normalizedValue.parameters = value.parameters;
      }
      return normalizedValue;
    }
    function buildRegisterThingRequestPayload(request) {
      let value = normalizeRegisterThingRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToRegisterThingRequest(request) {
      return [request, void 0];
    }
    function buildCreateCertificateFromCsrSubscriptions(request) {
      return new Array(`$aws/certificates/create-from-csr/json/accepted`, `$aws/certificates/create-from-csr/json/rejected`);
    }
    function buildCreateCertificateFromCsrPublishTopic(request) {
      return `$aws/certificates/create-from-csr/json`;
    }
    function buildCreateCertificateFromCsrResponsePaths(request) {
      return new Array({
        topic: `$aws/certificates/create-from-csr/json/accepted`,
        deserializer: deserializeCreateCertificateFromCsrResponse
      }, {
        topic: `$aws/certificates/create-from-csr/json/rejected`,
        deserializer: deserializeV2ErrorResponse
      });
    }
    function buildCreateKeysAndCertificateSubscriptions(request) {
      return new Array(`$aws/certificates/create/json/accepted`, `$aws/certificates/create/json/rejected`);
    }
    function buildCreateKeysAndCertificatePublishTopic(request) {
      return `$aws/certificates/create/json`;
    }
    function buildCreateKeysAndCertificateResponsePaths(request) {
      return new Array({
        topic: `$aws/certificates/create/json/accepted`,
        deserializer: deserializeCreateKeysAndCertificateResponse
      }, {
        topic: `$aws/certificates/create/json/rejected`,
        deserializer: deserializeV2ErrorResponse
      });
    }
    function buildRegisterThingSubscriptions(request) {
      let typedRequest = request;
      return new Array(`$aws/provisioning-templates/${typedRequest.templateName}/provision/json/accepted`, `$aws/provisioning-templates/${typedRequest.templateName}/provision/json/rejected`);
    }
    function buildRegisterThingPublishTopic(request) {
      let typedRequest = request;
      return `$aws/provisioning-templates/${typedRequest.templateName}/provision/json`;
    }
    function buildRegisterThingResponsePaths(request) {
      let typedRequest = request;
      return new Array({
        topic: `$aws/provisioning-templates/${typedRequest.templateName}/provision/json/accepted`,
        deserializer: deserializeRegisterThingResponse
      }, {
        topic: `$aws/provisioning-templates/${typedRequest.templateName}/provision/json/rejected`,
        deserializer: deserializeV2ErrorResponse
      });
    }
    function deserializeCreateCertificateFromCsrResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function deserializeCreateKeysAndCertificateResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function deserializeRegisterThingResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function deserializeV2ErrorResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function createRequestResponseOperationServiceModelMap() {
      return /* @__PURE__ */ new Map([
        ["createCertificateFromCsr", {
          inputShapeName: "CreateCertificateFromCsrRequest",
          payloadTransformer: buildCreateCertificateFromCsrRequestPayload,
          subscriptionGenerator: buildCreateCertificateFromCsrSubscriptions,
          responsePathGenerator: buildCreateCertificateFromCsrResponsePaths,
          publishTopicGenerator: buildCreateCertificateFromCsrPublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToCreateCertificateFromCsrRequest
        }],
        ["createKeysAndCertificate", {
          inputShapeName: "CreateKeysAndCertificateRequest",
          payloadTransformer: buildCreateKeysAndCertificateRequestPayload,
          subscriptionGenerator: buildCreateKeysAndCertificateSubscriptions,
          responsePathGenerator: buildCreateKeysAndCertificateResponsePaths,
          publishTopicGenerator: buildCreateKeysAndCertificatePublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToCreateKeysAndCertificateRequest
        }],
        ["registerThing", {
          inputShapeName: "RegisterThingRequest",
          payloadTransformer: buildRegisterThingRequestPayload,
          subscriptionGenerator: buildRegisterThingSubscriptions,
          responsePathGenerator: buildRegisterThingResponsePaths,
          publishTopicGenerator: buildRegisterThingPublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToRegisterThingRequest
        }]
      ]);
    }
    function createStreamingOperationServiceModelMap() {
      return /* @__PURE__ */ new Map([]);
    }
    function validateCreateCertificateFromCsrRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsString(value.certificateSigningRequest, "certificateSigningRequest");
    }
    function validateCreateKeysAndCertificateRequest(value) {
      let typedValue = value;
    }
    function validateRegisterThingRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.templateName, "templateName");
      model_validation_utils.validateValueAsString(value.certificateOwnershipToken, "certificateOwnershipToken");
      model_validation_utils.validateValueAsOptionalMap(value.parameters, model_validation_utils.validateValueAsString, model_validation_utils.validateValueAsString, "parameters");
    }
    function createValidatorMap() {
      return /* @__PURE__ */ new Map([
        ["CreateCertificateFromCsrRequest", validateCreateCertificateFromCsrRequest],
        ["CreateKeysAndCertificateRequest", validateCreateKeysAndCertificateRequest],
        ["RegisterThingRequest", validateRegisterThingRequest]
      ]);
    }
    function makeServiceModel() {
      let model = {
        requestResponseOperations: createRequestResponseOperationServiceModelMap(),
        streamingOperations: createStreamingOperationServiceModelMap(),
        shapeValidators: createValidatorMap()
      };
      return model;
    }
    exports2.makeServiceModel = makeServiceModel;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotidentity/iotidentityclientv2.js
var require_iotidentityclientv2 = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotidentity/iotidentityclientv2.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IotIdentityClientv2 = void 0;
    var aws_crt_1 = require_dist();
    var mqtt_request_response_utils = __importStar(require_mqtt_request_response_utils());
    var v2utils = __importStar(require_v2utils());
    var IotIdentityClientv2 = class _IotIdentityClientv2 {
      constructor(rrClient) {
        this.rrClient = rrClient;
        this.serviceModel = v2utils.makeServiceModel();
      }
      /**
       * Creates a new service client that will use an SDK MQTT 311 client as transport.
       *
       * @param protocolClient the MQTT 311 client to use for transport
       * @param options additional service client configuration options
       *
       * @return a new service client
       *
       */
      static newFromMqtt311(protocolClient, options) {
        let rrClient = aws_crt_1.mqtt_request_response.RequestResponseClient.newFromMqtt311(protocolClient, options);
        return new _IotIdentityClientv2(rrClient);
      }
      /**
       * Creates a new service client that will use an SDK MQTT 5 client as transport.
       *
       * @param protocolClient the MQTT 5 client to use for transport
       * @param options additional service client configuration options
       *
       * @return a new service client
       *
       */
      static newFromMqtt5(protocolClient, options) {
        let rrClient = aws_crt_1.mqtt_request_response.RequestResponseClient.newFromMqtt5(protocolClient, options);
        return new _IotIdentityClientv2(rrClient);
      }
      /**
       * Triggers cleanup of all resources associated with the service client.  Closing a client will fail
       * all incomplete requests and close all unclosed streaming operations.
       *
       * This must be called when finished with a client; otherwise, native resources will leak.
       */
      close() {
        this.rrClient.close();
      }
      /**
       * Creates a certificate from a certificate signing request (CSR). AWS IoT provides client certificates that are signed by the Amazon Root certificate authority (CA). The new certificate has a PENDING_ACTIVATION status. When you call RegisterThing to provision a thing with this certificate, the certificate status changes to ACTIVE or INACTIVE as described in the template.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html#fleet-provision-api
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotIdentity
       */
      createCertificateFromCsr(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "createCertificateFromCsr",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
      /**
       * Creates new keys and a certificate. AWS IoT provides client certificates that are signed by the Amazon Root certificate authority (CA). The new certificate has a PENDING_ACTIVATION status. When you call RegisterThing to provision a thing with this certificate, the certificate status changes to ACTIVE or INACTIVE as described in the template.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html#fleet-provision-api
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotIdentity
       */
      createKeysAndCertificate(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "createKeysAndCertificate",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
      /**
       * Provisions an AWS IoT thing using a pre-defined template.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html#fleet-provision-api
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotIdentity
       */
      registerThing(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "registerThing",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
    };
    exports2.IotIdentityClientv2 = IotIdentityClientv2;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotidentity/iotidentity.js
var require_iotidentity = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotidentity/iotidentity.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.model = exports2.IotIdentityError = exports2.IotIdentityClientv2 = exports2.IotIdentityClient = void 0;
    var model = __importStar(require_model3());
    exports2.model = model;
    var iotidentityclient_1 = require_iotidentityclient();
    Object.defineProperty(exports2, "IotIdentityClient", { enumerable: true, get: function() {
      return iotidentityclient_1.IotIdentityClient;
    } });
    Object.defineProperty(exports2, "IotIdentityError", { enumerable: true, get: function() {
      return iotidentityclient_1.IotIdentityError;
    } });
    var iotidentityclientv2_1 = require_iotidentityclientv2();
    Object.defineProperty(exports2, "IotIdentityClientv2", { enumerable: true, get: function() {
      return iotidentityclientv2_1.IotIdentityClientv2;
    } });
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotjobs/model.js
var require_model4 = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotjobs/model.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RejectedErrorCode = exports2.JobStatus = void 0;
    var JobStatus;
    (function(JobStatus2) {
      JobStatus2["UNKNOWN_ENUM_VALUE"] = "UNKNOWN_ENUM_VALUE";
      JobStatus2["IN_PROGRESS"] = "IN_PROGRESS";
      JobStatus2["FAILED"] = "FAILED";
      JobStatus2["QUEUED"] = "QUEUED";
      JobStatus2["TIMED_OUT"] = "TIMED_OUT";
      JobStatus2["SUCCEEDED"] = "SUCCEEDED";
      JobStatus2["CANCELED"] = "CANCELED";
      JobStatus2["REJECTED"] = "REJECTED";
      JobStatus2["REMOVED"] = "REMOVED";
    })(JobStatus = exports2.JobStatus || (exports2.JobStatus = {}));
    var RejectedErrorCode;
    (function(RejectedErrorCode2) {
      RejectedErrorCode2["UNKNOWN_ENUM_VALUE"] = "UNKNOWN_ENUM_VALUE";
      RejectedErrorCode2["INVALID_TOPIC"] = "InvalidTopic";
      RejectedErrorCode2["INVALID_STATE_TRANSITION"] = "InvalidStateTransition";
      RejectedErrorCode2["RESOURCE_NOT_FOUND"] = "ResourceNotFound";
      RejectedErrorCode2["INVALID_REQUEST"] = "InvalidRequest";
      RejectedErrorCode2["REQUEST_THROTTLED"] = "RequestThrottled";
      RejectedErrorCode2["INTERNAL_ERROR"] = "InternalError";
      RejectedErrorCode2["TERMINAL_STATE_REACHED"] = "TerminalStateReached";
      RejectedErrorCode2["INVALID_JSON"] = "InvalidJson";
      RejectedErrorCode2["VERSION_MISMATCH"] = "VersionMismatch";
    })(RejectedErrorCode = exports2.RejectedErrorCode || (exports2.RejectedErrorCode = {}));
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotjobs/iotjobsclient.js
var require_iotjobsclient = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotjobs/iotjobsclient.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IotJobsClient = exports2.IotJobsError = void 0;
    var util_utf8_browser_1 = require_dist_cjs();
    var service_client_mqtt_adapter = __importStar(require_service_client_mqtt_adapter());
    var IotJobsError = class extends Error {
      constructor(message, payload) {
        super(message);
        this.payload = payload;
        const myProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, myProto);
        } else {
          this.prototype = myProto;
        }
      }
    };
    exports2.IotJobsError = IotJobsError;
    var IotJobsClient = class _IotJobsClient {
      static createClientError(err, payload) {
        if (err instanceof Error) {
          return new IotJobsError(err.message, payload);
        } else {
          return new IotJobsError(_IotJobsClient.INVALID_PAYLOAD_PARSING_ERROR, payload);
        }
      }
      constructor(connection2) {
        if (connection2 !== void 0) {
          this.mqttAdapter = new service_client_mqtt_adapter.ServiceClientMqtt311Adapter(connection2);
        }
      }
      /**
       * Creates a new IotJobsClient that uses the SDK Mqtt5 client internally.
       *
       * The pre-existing constructor that is bound to the MQTT311 client makes this awkward since we
       * must support
       *
       * ```
       * new IotJobsClient(mqtt311connection);
       * ```
       *
       * for backwards compatibility, but still want to be able to inject an MQTT5 client as well.
       *
       * @param client the MQTT5 client to use with this service client
       *
       * @return a new IotJobsClient instance
       */
      static newFromMqtt5Client(client2) {
        let serviceClient = new _IotJobsClient();
        serviceClient.mqttAdapter = new service_client_mqtt_adapter.ServiceClientMqtt5Adapter(client2);
        return serviceClient;
      }
      /**
       * Gets detailed information about a job execution.
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-describejobexecution
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotJobs
       */
      publishDescribeJobExecution(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/{jobId}/get";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{jobId}", request.jobId);
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Gets the list of all jobs for a thing that are not in a terminal state.
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-getpendingjobexecutions
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotJobs
       */
      publishGetPendingJobExecutions(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/get";
          topic = topic.replace("{thingName}", request.thingName);
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Gets and starts the next pending job execution for a thing (status IN_PROGRESS or QUEUED).
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-startnextpendingjobexecution
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotJobs
       */
      publishStartNextPendingJobExecution(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/start-next";
          topic = topic.replace("{thingName}", request.thingName);
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Updates the status of a job execution. You can optionally create a step timer by setting a value for the stepTimeoutInMinutes property. If you don't update the value of this property by running UpdateJobExecution again, the job execution times out when the step timer expires.
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-updatejobexecution
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotJobs
       */
      publishUpdateJobExecution(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/{jobId}/update";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{jobId}", request.jobId);
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Subscribes to the accepted topic for the DescribeJobExecution operation
       *
       *
       * subscribeToDescribeJobExecutionAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-describejobexecution
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotJobs
       */
      subscribeToDescribeJobExecutionAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/{jobId}/get/accepted";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{jobId}", request.jobId);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotJobsClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic for the DescribeJobExecution operation
       *
       *
       * subscribeToDescribeJobExecutionRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-describejobexecution
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotJobs
       */
      subscribeToDescribeJobExecutionRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/{jobId}/get/rejected";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{jobId}", request.jobId);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotJobsClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the accepted topic for the GetPendingJobsExecutions operation
       *
       *
       * subscribeToGetPendingJobExecutionsAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-getpendingjobexecutions
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotJobs
       */
      subscribeToGetPendingJobExecutionsAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/get/accepted";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotJobsClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic for the GetPendingJobsExecutions operation
       *
       *
       * subscribeToGetPendingJobExecutionsRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-getpendingjobexecutions
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotJobs
       */
      subscribeToGetPendingJobExecutionsRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/get/rejected";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotJobsClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to JobExecutionsChanged notifications for a given IoT thing.
       *
       *
       * subscribeToJobExecutionsChangedEvents may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-jobexecutionschanged
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotJobs
       */
      subscribeToJobExecutionsChangedEvents(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/notify";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotJobsClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       *
       *
       *
       * subscribeToNextJobExecutionChangedEvents may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-nextjobexecutionchanged
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotJobs
       */
      subscribeToNextJobExecutionChangedEvents(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/notify-next";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotJobsClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the accepted topic for the StartNextPendingJobExecution operation
       *
       *
       * subscribeToStartNextPendingJobExecutionAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-startnextpendingjobexecution
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotJobs
       */
      subscribeToStartNextPendingJobExecutionAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/start-next/accepted";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotJobsClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic for the StartNextPendingJobExecution operation
       *
       *
       * subscribeToStartNextPendingJobExecutionRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-startnextpendingjobexecution
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotJobs
       */
      subscribeToStartNextPendingJobExecutionRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/start-next/rejected";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotJobsClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the accepted topic for the UpdateJobExecution operation
       *
       *
       * subscribeToUpdateJobExecutionAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-updatejobexecution
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotJobs
       */
      subscribeToUpdateJobExecutionAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/{jobId}/update/accepted";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{jobId}", request.jobId);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotJobsClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic for the UpdateJobExecution operation
       *
       *
       * subscribeToUpdateJobExecutionRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-updatejobexecution
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotJobs
       */
      subscribeToUpdateJobExecutionRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/jobs/{jobId}/update/rejected";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{jobId}", request.jobId);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotJobsClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
    };
    exports2.IotJobsClient = IotJobsClient;
    IotJobsClient.INVALID_PAYLOAD_PARSING_ERROR = "Invalid/unknown error parsing payload into response";
  }
});

// node_modules/uuid/dist/esm-node/rng.js
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    import_crypto.default.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var import_crypto, rnds8Pool, poolPtr;
var init_rng = __esm({
  "node_modules/uuid/dist/esm-node/rng.js"() {
    import_crypto = __toESM(require("crypto"));
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
  }
});

// node_modules/uuid/dist/esm-node/regex.js
var regex_default;
var init_regex = __esm({
  "node_modules/uuid/dist/esm-node/regex.js"() {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  }
});

// node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "node_modules/uuid/dist/esm-node/validate.js"() {
    init_regex();
    validate_default = validate;
  }
});

// node_modules/uuid/dist/esm-node/stringify.js
function stringify(arr, offset = 0) {
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, stringify_default;
var init_stringify = __esm({
  "node_modules/uuid/dist/esm-node/stringify.js"() {
    init_validate();
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).substr(1));
    }
    stringify_default = stringify;
  }
});

// node_modules/uuid/dist/esm-node/v1.js
function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || stringify_default(b);
}
var _nodeId, _clockseq, _lastMSecs, _lastNSecs, v1_default;
var init_v1 = __esm({
  "node_modules/uuid/dist/esm-node/v1.js"() {
    init_rng();
    init_stringify();
    _lastMSecs = 0;
    _lastNSecs = 0;
    v1_default = v1;
  }
});

// node_modules/uuid/dist/esm-node/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default;
var init_parse = __esm({
  "node_modules/uuid/dist/esm-node/parse.js"() {
    init_validate();
    parse_default = parse;
  }
});

// node_modules/uuid/dist/esm-node/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35_default(name, version2, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (namespace.length !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version2;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return stringify_default(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}
var DNS, URL;
var init_v35 = __esm({
  "node_modules/uuid/dist/esm-node/v35.js"() {
    init_stringify();
    init_parse();
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
});

// node_modules/uuid/dist/esm-node/md5.js
function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_crypto2.default.createHash("md5").update(bytes).digest();
}
var import_crypto2, md5_default;
var init_md5 = __esm({
  "node_modules/uuid/dist/esm-node/md5.js"() {
    import_crypto2 = __toESM(require("crypto"));
    md5_default = md5;
  }
});

// node_modules/uuid/dist/esm-node/v3.js
var v3, v3_default;
var init_v3 = __esm({
  "node_modules/uuid/dist/esm-node/v3.js"() {
    init_v35();
    init_md5();
    v3 = v35_default("v3", 48, md5_default);
    v3_default = v3;
  }
});

// node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return stringify_default(rnds);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/uuid/dist/esm-node/v4.js"() {
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// node_modules/uuid/dist/esm-node/sha1.js
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_crypto3.default.createHash("sha1").update(bytes).digest();
}
var import_crypto3, sha1_default;
var init_sha1 = __esm({
  "node_modules/uuid/dist/esm-node/sha1.js"() {
    import_crypto3 = __toESM(require("crypto"));
    sha1_default = sha1;
  }
});

// node_modules/uuid/dist/esm-node/v5.js
var v5, v5_default;
var init_v5 = __esm({
  "node_modules/uuid/dist/esm-node/v5.js"() {
    init_v35();
    init_sha1();
    v5 = v35_default("v5", 80, sha1_default);
    v5_default = v5;
  }
});

// node_modules/uuid/dist/esm-node/nil.js
var nil_default;
var init_nil = __esm({
  "node_modules/uuid/dist/esm-node/nil.js"() {
    nil_default = "00000000-0000-0000-0000-000000000000";
  }
});

// node_modules/uuid/dist/esm-node/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.substr(14, 1), 16);
}
var version_default;
var init_version = __esm({
  "node_modules/uuid/dist/esm-node/version.js"() {
    init_validate();
    version_default = version;
  }
});

// node_modules/uuid/dist/esm-node/index.js
var esm_node_exports = {};
__export(esm_node_exports, {
  NIL: () => nil_default,
  parse: () => parse_default,
  stringify: () => stringify_default,
  v1: () => v1_default,
  v3: () => v3_default,
  v4: () => v4_default,
  v5: () => v5_default,
  validate: () => validate_default,
  version: () => version_default
});
var init_esm_node = __esm({
  "node_modules/uuid/dist/esm-node/index.js"() {
    init_v1();
    init_v3();
    init_v4();
    init_v5();
    init_nil();
    init_version();
    init_validate();
    init_stringify();
    init_parse();
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotjobs/v2utils.js
var require_v2utils2 = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotjobs/v2utils.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.makeServiceModel = void 0;
    var util_utf8_browser_1 = require_dist_cjs();
    var model_validation_utils = __importStar(require_mqtt_request_response_utils());
    var uuid_1 = (init_esm_node(), __toCommonJS(esm_node_exports));
    function normalizeDescribeJobExecutionRequest(value) {
      let normalizedValue = {};
      if (value.clientToken) {
        normalizedValue.clientToken = value.clientToken;
      }
      if (value.executionNumber) {
        normalizedValue.executionNumber = value.executionNumber;
      }
      if (value.includeJobDocument) {
        normalizedValue.includeJobDocument = value.includeJobDocument;
      }
      return normalizedValue;
    }
    function buildDescribeJobExecutionRequestPayload(request) {
      let value = normalizeDescribeJobExecutionRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToDescribeJobExecutionRequest(request) {
      let typedRequest = request;
      let correlationToken = (0, uuid_1.v4)();
      typedRequest.clientToken = correlationToken;
      return [typedRequest, correlationToken];
    }
    function normalizeGetPendingJobExecutionsRequest(value) {
      let normalizedValue = {};
      if (value.clientToken) {
        normalizedValue.clientToken = value.clientToken;
      }
      return normalizedValue;
    }
    function buildGetPendingJobExecutionsRequestPayload(request) {
      let value = normalizeGetPendingJobExecutionsRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToGetPendingJobExecutionsRequest(request) {
      let typedRequest = request;
      let correlationToken = (0, uuid_1.v4)();
      typedRequest.clientToken = correlationToken;
      return [typedRequest, correlationToken];
    }
    function normalizeStartNextPendingJobExecutionRequest(value) {
      let normalizedValue = {};
      if (value.clientToken) {
        normalizedValue.clientToken = value.clientToken;
      }
      if (value.stepTimeoutInMinutes) {
        normalizedValue.stepTimeoutInMinutes = value.stepTimeoutInMinutes;
      }
      if (value.statusDetails) {
        normalizedValue.statusDetails = value.statusDetails;
      }
      return normalizedValue;
    }
    function buildStartNextPendingJobExecutionRequestPayload(request) {
      let value = normalizeStartNextPendingJobExecutionRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToStartNextPendingJobExecutionRequest(request) {
      let typedRequest = request;
      let correlationToken = (0, uuid_1.v4)();
      typedRequest.clientToken = correlationToken;
      return [typedRequest, correlationToken];
    }
    function normalizeUpdateJobExecutionRequest(value) {
      let normalizedValue = {};
      if (value.status) {
        normalizedValue.status = value.status;
      }
      if (value.clientToken) {
        normalizedValue.clientToken = value.clientToken;
      }
      if (value.statusDetails) {
        normalizedValue.statusDetails = value.statusDetails;
      }
      if (value.expectedVersion) {
        normalizedValue.expectedVersion = value.expectedVersion;
      }
      if (value.executionNumber) {
        normalizedValue.executionNumber = value.executionNumber;
      }
      if (value.includeJobExecutionState) {
        normalizedValue.includeJobExecutionState = value.includeJobExecutionState;
      }
      if (value.includeJobDocument) {
        normalizedValue.includeJobDocument = value.includeJobDocument;
      }
      if (value.stepTimeoutInMinutes) {
        normalizedValue.stepTimeoutInMinutes = value.stepTimeoutInMinutes;
      }
      return normalizedValue;
    }
    function buildUpdateJobExecutionRequestPayload(request) {
      let value = normalizeUpdateJobExecutionRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToUpdateJobExecutionRequest(request) {
      let typedRequest = request;
      let correlationToken = (0, uuid_1.v4)();
      typedRequest.clientToken = correlationToken;
      return [typedRequest, correlationToken];
    }
    function buildDescribeJobExecutionSubscriptions(request) {
      let typedRequest = request;
      return new Array(`$aws/things/${typedRequest.thingName}/jobs/${typedRequest.jobId}/get/+`);
    }
    function buildDescribeJobExecutionPublishTopic(request) {
      let typedRequest = request;
      return `$aws/things/${typedRequest.thingName}/jobs/${typedRequest.jobId}/get`;
    }
    function buildDescribeJobExecutionResponsePaths(request) {
      let typedRequest = request;
      return new Array({
        topic: `$aws/things/${typedRequest.thingName}/jobs/${typedRequest.jobId}/get/accepted`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeDescribeJobExecutionResponse
      }, {
        topic: `$aws/things/${typedRequest.thingName}/jobs/${typedRequest.jobId}/get/rejected`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeV2ErrorResponse
      });
    }
    function buildGetPendingJobExecutionsSubscriptions(request) {
      let typedRequest = request;
      return new Array(`$aws/things/${typedRequest.thingName}/jobs/get/+`);
    }
    function buildGetPendingJobExecutionsPublishTopic(request) {
      let typedRequest = request;
      return `$aws/things/${typedRequest.thingName}/jobs/get`;
    }
    function buildGetPendingJobExecutionsResponsePaths(request) {
      let typedRequest = request;
      return new Array({
        topic: `$aws/things/${typedRequest.thingName}/jobs/get/accepted`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeGetPendingJobExecutionsResponse
      }, {
        topic: `$aws/things/${typedRequest.thingName}/jobs/get/rejected`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeV2ErrorResponse
      });
    }
    function buildStartNextPendingJobExecutionSubscriptions(request) {
      let typedRequest = request;
      return new Array(`$aws/things/${typedRequest.thingName}/jobs/start-next/+`);
    }
    function buildStartNextPendingJobExecutionPublishTopic(request) {
      let typedRequest = request;
      return `$aws/things/${typedRequest.thingName}/jobs/start-next`;
    }
    function buildStartNextPendingJobExecutionResponsePaths(request) {
      let typedRequest = request;
      return new Array({
        topic: `$aws/things/${typedRequest.thingName}/jobs/start-next/accepted`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeStartNextJobExecutionResponse
      }, {
        topic: `$aws/things/${typedRequest.thingName}/jobs/start-next/rejected`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeV2ErrorResponse
      });
    }
    function buildUpdateJobExecutionSubscriptions(request) {
      let typedRequest = request;
      return new Array(`$aws/things/${typedRequest.thingName}/jobs/${typedRequest.jobId}/update/+`);
    }
    function buildUpdateJobExecutionPublishTopic(request) {
      let typedRequest = request;
      return `$aws/things/${typedRequest.thingName}/jobs/${typedRequest.jobId}/update`;
    }
    function buildUpdateJobExecutionResponsePaths(request) {
      let typedRequest = request;
      return new Array({
        topic: `$aws/things/${typedRequest.thingName}/jobs/${typedRequest.jobId}/update/accepted`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeUpdateJobExecutionResponse
      }, {
        topic: `$aws/things/${typedRequest.thingName}/jobs/${typedRequest.jobId}/update/rejected`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeV2ErrorResponse
      });
    }
    function deserializeDescribeJobExecutionResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function deserializeGetPendingJobExecutionsResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function deserializeStartNextJobExecutionResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function deserializeUpdateJobExecutionResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function deserializeV2ErrorResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function createRequestResponseOperationServiceModelMap() {
      return /* @__PURE__ */ new Map([
        ["describeJobExecution", {
          inputShapeName: "DescribeJobExecutionRequest",
          payloadTransformer: buildDescribeJobExecutionRequestPayload,
          subscriptionGenerator: buildDescribeJobExecutionSubscriptions,
          responsePathGenerator: buildDescribeJobExecutionResponsePaths,
          publishTopicGenerator: buildDescribeJobExecutionPublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToDescribeJobExecutionRequest
        }],
        ["getPendingJobExecutions", {
          inputShapeName: "GetPendingJobExecutionsRequest",
          payloadTransformer: buildGetPendingJobExecutionsRequestPayload,
          subscriptionGenerator: buildGetPendingJobExecutionsSubscriptions,
          responsePathGenerator: buildGetPendingJobExecutionsResponsePaths,
          publishTopicGenerator: buildGetPendingJobExecutionsPublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToGetPendingJobExecutionsRequest
        }],
        ["startNextPendingJobExecution", {
          inputShapeName: "StartNextPendingJobExecutionRequest",
          payloadTransformer: buildStartNextPendingJobExecutionRequestPayload,
          subscriptionGenerator: buildStartNextPendingJobExecutionSubscriptions,
          responsePathGenerator: buildStartNextPendingJobExecutionResponsePaths,
          publishTopicGenerator: buildStartNextPendingJobExecutionPublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToStartNextPendingJobExecutionRequest
        }],
        ["updateJobExecution", {
          inputShapeName: "UpdateJobExecutionRequest",
          payloadTransformer: buildUpdateJobExecutionRequestPayload,
          subscriptionGenerator: buildUpdateJobExecutionSubscriptions,
          responsePathGenerator: buildUpdateJobExecutionResponsePaths,
          publishTopicGenerator: buildUpdateJobExecutionPublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToUpdateJobExecutionRequest
        }]
      ]);
    }
    function buildCreateJobExecutionsChangedStreamTopicFilter(config) {
      const typedConfig = config;
      return `$aws/things/${typedConfig.thingName}/jobs/notify`;
    }
    function buildCreateNextJobExecutionChangedStreamTopicFilter(config) {
      const typedConfig = config;
      return `$aws/things/${typedConfig.thingName}/jobs/notify-next`;
    }
    function deserializeJobExecutionsChangedEventPayload(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function deserializeNextJobExecutionChangedEventPayload(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function createStreamingOperationServiceModelMap() {
      return /* @__PURE__ */ new Map([
        ["createJobExecutionsChangedStream", {
          inputShapeName: "JobExecutionsChangedSubscriptionRequest",
          subscriptionGenerator: buildCreateJobExecutionsChangedStreamTopicFilter,
          deserializer: deserializeJobExecutionsChangedEventPayload
        }],
        ["createNextJobExecutionChangedStream", {
          inputShapeName: "NextJobExecutionChangedSubscriptionRequest",
          subscriptionGenerator: buildCreateNextJobExecutionChangedStreamTopicFilter,
          deserializer: deserializeNextJobExecutionChangedEventPayload
        }]
      ]);
    }
    function validateDescribeJobExecutionRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
      model_validation_utils.validateValueAsTopicSegment(value.jobId, "jobId");
      model_validation_utils.validateValueAsOptionalInteger(value.executionNumber, "executionNumber");
      model_validation_utils.validateValueAsOptionalBoolean(value.includeJobDocument, "includeJobDocument");
    }
    function validateGetPendingJobExecutionsRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
    }
    function validateJobExecutionsChangedSubscriptionRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
    }
    function validateNextJobExecutionChangedSubscriptionRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
    }
    function validateStartNextPendingJobExecutionRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
      model_validation_utils.validateValueAsOptionalInteger(value.stepTimeoutInMinutes, "stepTimeoutInMinutes");
      model_validation_utils.validateValueAsOptionalMap(value.statusDetails, model_validation_utils.validateValueAsString, model_validation_utils.validateValueAsString, "statusDetails");
    }
    function validateUpdateJobExecutionRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
      model_validation_utils.validateValueAsTopicSegment(value.jobId, "jobId");
      model_validation_utils.validateValueAsString(value.status, "status");
      model_validation_utils.validateValueAsOptionalMap(value.statusDetails, model_validation_utils.validateValueAsString, model_validation_utils.validateValueAsString, "statusDetails");
      model_validation_utils.validateValueAsOptionalInteger(value.expectedVersion, "expectedVersion");
      model_validation_utils.validateValueAsOptionalInteger(value.executionNumber, "executionNumber");
      model_validation_utils.validateValueAsOptionalBoolean(value.includeJobExecutionState, "includeJobExecutionState");
      model_validation_utils.validateValueAsOptionalBoolean(value.includeJobDocument, "includeJobDocument");
      model_validation_utils.validateValueAsOptionalInteger(value.stepTimeoutInMinutes, "stepTimeoutInMinutes");
    }
    function createValidatorMap() {
      return /* @__PURE__ */ new Map([
        ["JobExecutionsChangedSubscriptionRequest", validateJobExecutionsChangedSubscriptionRequest],
        ["NextJobExecutionChangedSubscriptionRequest", validateNextJobExecutionChangedSubscriptionRequest],
        ["DescribeJobExecutionRequest", validateDescribeJobExecutionRequest],
        ["GetPendingJobExecutionsRequest", validateGetPendingJobExecutionsRequest],
        ["StartNextPendingJobExecutionRequest", validateStartNextPendingJobExecutionRequest],
        ["UpdateJobExecutionRequest", validateUpdateJobExecutionRequest]
      ]);
    }
    function makeServiceModel() {
      let model = {
        requestResponseOperations: createRequestResponseOperationServiceModelMap(),
        streamingOperations: createStreamingOperationServiceModelMap(),
        shapeValidators: createValidatorMap()
      };
      return model;
    }
    exports2.makeServiceModel = makeServiceModel;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotjobs/iotjobsclientv2.js
var require_iotjobsclientv2 = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotjobs/iotjobsclientv2.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IotJobsClientv2 = void 0;
    var aws_crt_1 = require_dist();
    var mqtt_request_response = __importStar(require_mqtt_request_response3());
    var mqtt_request_response_utils = __importStar(require_mqtt_request_response_utils());
    var v2utils = __importStar(require_v2utils2());
    var IotJobsClientv2 = class _IotJobsClientv2 {
      constructor(rrClient) {
        this.rrClient = rrClient;
        this.serviceModel = v2utils.makeServiceModel();
      }
      /**
       * Creates a new service client that will use an SDK MQTT 311 client as transport.
       *
       * @param protocolClient the MQTT 311 client to use for transport
       * @param options additional service client configuration options
       *
       * @return a new service client
       *
       */
      static newFromMqtt311(protocolClient, options) {
        let rrClient = aws_crt_1.mqtt_request_response.RequestResponseClient.newFromMqtt311(protocolClient, options);
        return new _IotJobsClientv2(rrClient);
      }
      /**
       * Creates a new service client that will use an SDK MQTT 5 client as transport.
       *
       * @param protocolClient the MQTT 5 client to use for transport
       * @param options additional service client configuration options
       *
       * @return a new service client
       *
       */
      static newFromMqtt5(protocolClient, options) {
        let rrClient = aws_crt_1.mqtt_request_response.RequestResponseClient.newFromMqtt5(protocolClient, options);
        return new _IotJobsClientv2(rrClient);
      }
      /**
       * Triggers cleanup of all resources associated with the service client.  Closing a client will fail
       * all incomplete requests and close all unclosed streaming operations.
       *
       * This must be called when finished with a client; otherwise, native resources will leak.
       */
      close() {
        this.rrClient.close();
      }
      /**
       * Gets detailed information about a job execution.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-describejobexecution
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotJobs
       */
      describeJobExecution(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "describeJobExecution",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
      /**
       * Gets the list of all jobs for a thing that are not in a terminal state.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-getpendingjobexecutions
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotJobs
       */
      getPendingJobExecutions(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "getPendingJobExecutions",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
      /**
       * Gets and starts the next pending job execution for a thing (status IN_PROGRESS or QUEUED).
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-startnextpendingjobexecution
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotJobs
       */
      startNextPendingJobExecution(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "startNextPendingJobExecution",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
      /**
       * Updates the status of a job execution. You can optionally create a step timer by setting a value for the stepTimeoutInMinutes property. If you don't update the value of this property by running UpdateJobExecution again, the job execution times out when the step timer expires.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-updatejobexecution
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotJobs
       */
      updateJobExecution(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "updateJobExecution",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
      /**
       * Creates a stream of JobExecutionsChanged notifications for a given IoT thing.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-jobexecutionschanged
       *
       * @param config streaming operation configuration options
       *
       * @return a streaming operation which will emit an event every time a message is received on the
       *    associated MQTT topic
       *
       * @category IotJobs
       */
      createJobExecutionsChangedStream(config) {
        let streamingOperationConfig = {
          operationName: "createJobExecutionsChangedStream",
          serviceModel: this.serviceModel,
          client: this.rrClient,
          modelConfig: config
        };
        return mqtt_request_response.StreamingOperation.create(streamingOperationConfig);
      }
      /**
       *
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/jobs-api.html#mqtt-nextjobexecutionchanged
       *
       * @param config streaming operation configuration options
       *
       * @return a streaming operation which will emit an event every time a message is received on the
       *    associated MQTT topic
       *
       * @category IotJobs
       */
      createNextJobExecutionChangedStream(config) {
        let streamingOperationConfig = {
          operationName: "createNextJobExecutionChangedStream",
          serviceModel: this.serviceModel,
          client: this.rrClient,
          modelConfig: config
        };
        return mqtt_request_response.StreamingOperation.create(streamingOperationConfig);
      }
    };
    exports2.IotJobsClientv2 = IotJobsClientv2;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotjobs/iotjobs.js
var require_iotjobs = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotjobs/iotjobs.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.model = exports2.IotJobsError = exports2.IotJobsClientv2 = exports2.IotJobsClient = void 0;
    var model = __importStar(require_model4());
    exports2.model = model;
    var iotjobsclient_1 = require_iotjobsclient();
    Object.defineProperty(exports2, "IotJobsClient", { enumerable: true, get: function() {
      return iotjobsclient_1.IotJobsClient;
    } });
    Object.defineProperty(exports2, "IotJobsError", { enumerable: true, get: function() {
      return iotjobsclient_1.IotJobsError;
    } });
    var iotjobsclientv2_1 = require_iotjobsclientv2();
    Object.defineProperty(exports2, "IotJobsClientv2", { enumerable: true, get: function() {
      return iotjobsclientv2_1.IotJobsClientv2;
    } });
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotshadow/model.js
var require_model5 = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotshadow/model.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotshadow/iotshadowclient.js
var require_iotshadowclient = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotshadow/iotshadowclient.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IotShadowClient = exports2.IotShadowError = void 0;
    var util_utf8_browser_1 = require_dist_cjs();
    var service_client_mqtt_adapter = __importStar(require_service_client_mqtt_adapter());
    var IotShadowError = class extends Error {
      constructor(message, payload) {
        super(message);
        this.payload = payload;
        const myProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, myProto);
        } else {
          this.prototype = myProto;
        }
      }
    };
    exports2.IotShadowError = IotShadowError;
    var IotShadowClient = class _IotShadowClient {
      static createClientError(err, payload) {
        if (err instanceof Error) {
          return new IotShadowError(err.message, payload);
        } else {
          return new IotShadowError(_IotShadowClient.INVALID_PAYLOAD_PARSING_ERROR, payload);
        }
      }
      constructor(connection2) {
        if (connection2 !== void 0) {
          this.mqttAdapter = new service_client_mqtt_adapter.ServiceClientMqtt311Adapter(connection2);
        }
      }
      /**
       * Creates a new IotShadowClient that uses the SDK Mqtt5 client internally.
       *
       * The pre-existing constructor that is bound to the MQTT311 client makes this awkward since we
       * must support
       *
       * ```
       * new IotShadowClient(mqtt311connection);
       * ```
       *
       * for backwards compatibility, but still want to be able to inject an MQTT5 client as well.
       *
       * @param client the MQTT5 client to use with this service client
       *
       * @return a new IotShadowClient instance
       */
      static newFromMqtt5Client(client2) {
        let serviceClient = new _IotShadowClient();
        serviceClient.mqttAdapter = new service_client_mqtt_adapter.ServiceClientMqtt5Adapter(client2);
        return serviceClient;
      }
      /**
       * Deletes a named shadow for an AWS IoT thing.
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#delete-pub-sub-topic
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotShadow
       */
      publishDeleteNamedShadow(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/name/{shadowName}/delete";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{shadowName}", request.shadowName);
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Deletes the (classic) shadow for an AWS IoT thing.
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#delete-pub-sub-topic
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotShadow
       */
      publishDeleteShadow(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/delete";
          topic = topic.replace("{thingName}", request.thingName);
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Gets a named shadow for an AWS IoT thing.
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#get-pub-sub-topic
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotShadow
       */
      publishGetNamedShadow(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/name/{shadowName}/get";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{shadowName}", request.shadowName);
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Gets the (classic) shadow for an AWS IoT thing.
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#get-pub-sub-topic
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotShadow
       */
      publishGetShadow(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/get";
          topic = topic.replace("{thingName}", request.thingName);
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Update a named shadow for a device.
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-pub-sub-topic
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotShadow
       */
      publishUpdateNamedShadow(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/name/{shadowName}/update";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{shadowName}", request.shadowName);
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Update a device's (classic) shadow.
       *
       * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-pub-sub-topic
       *
       * @param request Message to be serialized and sent
       * @param qos Quality of Service for delivering this message
       * @return Promise which returns a `mqtt.MqttRequest` which will contain the packet id of
       *          the PUBLISH packet.
       *
       * * For QoS 0, completes as soon as the packet is sent.
       * * For QoS 1, completes when PUBACK is received.
       * * QoS 2 is not supported by AWS IoT.
       *
       * @category IotShadow
       */
      publishUpdateShadow(request, qos) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/update";
          topic = topic.replace("{thingName}", request.thingName);
          return this.mqttAdapter.publish(topic, JSON.stringify(request), qos);
        });
      }
      /**
       * Subscribes to the accepted topic for the DeleteNamedShadow operation.
       *
       *
       * subscribeToDeleteNamedShadowAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#delete-accepted-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToDeleteNamedShadowAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/name/{shadowName}/delete/accepted";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{shadowName}", request.shadowName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic for the DeleteNamedShadow operation.
       *
       *
       * subscribeToDeleteNamedShadowRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#delete-rejected-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToDeleteNamedShadowRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/name/{shadowName}/delete/rejected";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{shadowName}", request.shadowName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the accepted topic for the DeleteShadow operation
       *
       *
       * subscribeToDeleteShadowAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#delete-accepted-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToDeleteShadowAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/delete/accepted";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic for the DeleteShadow operation
       *
       *
       * subscribeToDeleteShadowRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#delete-rejected-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToDeleteShadowRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/delete/rejected";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the accepted topic for the GetNamedShadow operation.
       *
       *
       * subscribeToGetNamedShadowAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#get-accepted-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToGetNamedShadowAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/name/{shadowName}/get/accepted";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{shadowName}", request.shadowName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic for the GetNamedShadow operation.
       *
       *
       * subscribeToGetNamedShadowRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#get-rejected-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToGetNamedShadowRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/name/{shadowName}/get/rejected";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{shadowName}", request.shadowName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the accepted topic for the GetShadow operation.
       *
       *
       * subscribeToGetShadowAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#get-accepted-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToGetShadowAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/get/accepted";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic for the GetShadow operation.
       *
       *
       * subscribeToGetShadowRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#get-rejected-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToGetShadowRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/get/rejected";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribe to NamedShadowDelta events for a named shadow of an AWS IoT thing.
       *
       *
       * subscribeToNamedShadowDeltaUpdatedEvents may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-delta-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToNamedShadowDeltaUpdatedEvents(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/name/{shadowName}/update/delta";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{shadowName}", request.shadowName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribe to ShadowUpdated events for a named shadow of an AWS IoT thing.
       *
       *
       * subscribeToNamedShadowUpdatedEvents may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-documents-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToNamedShadowUpdatedEvents(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/name/{shadowName}/update/documents";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{shadowName}", request.shadowName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribe to ShadowDelta events for the (classic) shadow of an AWS IoT thing.
       *
       *
       * subscribeToShadowDeltaUpdatedEvents may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-delta-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToShadowDeltaUpdatedEvents(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/update/delta";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribe to ShadowUpdated events for the (classic) shadow of an AWS IoT thing.
       *
       *
       * subscribeToShadowUpdatedEvents may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-documents-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToShadowUpdatedEvents(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/update/documents";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the accepted topic for the UpdateNamedShadow operation
       *
       *
       * subscribeToUpdateNamedShadowAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-accepted-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToUpdateNamedShadowAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/name/{shadowName}/update/accepted";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{shadowName}", request.shadowName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic for the UpdateNamedShadow operation
       *
       *
       * subscribeToUpdateNamedShadowRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-rejected-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToUpdateNamedShadowRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/name/{shadowName}/update/rejected";
          topic = topic.replace("{thingName}", request.thingName);
          topic = topic.replace("{shadowName}", request.shadowName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the accepted topic for the UpdateShadow operation
       *
       *
       * subscribeToUpdateShadowAccepted may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-accepted-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToUpdateShadowAccepted(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/update/accepted";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
      /**
       * Subscribes to the rejected topic for the UpdateShadow operation
       *
       *
       * subscribeToUpdateShadowRejected may be called while the device is offline, though the async
       * operation cannot complete successfully until the connection resumes.
       *
       * Once subscribed, `messageHandler` is invoked each time a message matching
       * the `topic` is received. It is possible for such messages to arrive before
       * the SUBACK is received.
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-rejected-pub-sub-topic
       *
       * @param request Subscription request configuration
       * @param qos Maximum requested QoS that server may use when sending messages to the client.
       *            The server may grant a lower QoS in the SUBACK
       * @param messageHandler Callback invoked when message or error is received from the server.
       * @return Promise which returns a `mqtt.MqttSubscribeRequest` which will contain the
       *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
       *          from the server or is rejected when an exception occurs.
       *
       * @category IotShadow
       */
      subscribeToUpdateShadowRejected(request, qos, messageHandler) {
        return __awaiter(this, void 0, void 0, function* () {
          let topic = "$aws/things/{thingName}/shadow/update/rejected";
          topic = topic.replace("{thingName}", request.thingName);
          const on_message = (topic2, payload) => {
            let response;
            let error;
            try {
              const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
              response = JSON.parse(payload_text);
            } catch (err) {
              error = _IotShadowClient.createClientError(err, payload);
            } finally {
              messageHandler(error, response);
            }
          };
          return this.mqttAdapter.subscribe(topic, qos, on_message);
        });
      }
    };
    exports2.IotShadowClient = IotShadowClient;
    IotShadowClient.INVALID_PAYLOAD_PARSING_ERROR = "Invalid/unknown error parsing payload into response";
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotshadow/v2utils.js
var require_v2utils3 = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotshadow/v2utils.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.makeServiceModel = void 0;
    var util_utf8_browser_1 = require_dist_cjs();
    var model_validation_utils = __importStar(require_mqtt_request_response_utils());
    var uuid_1 = (init_esm_node(), __toCommonJS(esm_node_exports));
    function normalizeDeleteNamedShadowRequest(value) {
      let normalizedValue = {};
      if (value.clientToken) {
        normalizedValue.clientToken = value.clientToken;
      }
      return normalizedValue;
    }
    function buildDeleteNamedShadowRequestPayload(request) {
      let value = normalizeDeleteNamedShadowRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToDeleteNamedShadowRequest(request) {
      let typedRequest = request;
      let correlationToken = (0, uuid_1.v4)();
      typedRequest.clientToken = correlationToken;
      return [typedRequest, correlationToken];
    }
    function normalizeDeleteShadowRequest(value) {
      let normalizedValue = {};
      if (value.clientToken) {
        normalizedValue.clientToken = value.clientToken;
      }
      return normalizedValue;
    }
    function buildDeleteShadowRequestPayload(request) {
      let value = normalizeDeleteShadowRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToDeleteShadowRequest(request) {
      let typedRequest = request;
      let correlationToken = (0, uuid_1.v4)();
      typedRequest.clientToken = correlationToken;
      return [typedRequest, correlationToken];
    }
    function normalizeGetNamedShadowRequest(value) {
      let normalizedValue = {};
      if (value.clientToken) {
        normalizedValue.clientToken = value.clientToken;
      }
      return normalizedValue;
    }
    function buildGetNamedShadowRequestPayload(request) {
      let value = normalizeGetNamedShadowRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToGetNamedShadowRequest(request) {
      let typedRequest = request;
      let correlationToken = (0, uuid_1.v4)();
      typedRequest.clientToken = correlationToken;
      return [typedRequest, correlationToken];
    }
    function normalizeGetShadowRequest(value) {
      let normalizedValue = {};
      if (value.clientToken) {
        normalizedValue.clientToken = value.clientToken;
      }
      return normalizedValue;
    }
    function buildGetShadowRequestPayload(request) {
      let value = normalizeGetShadowRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToGetShadowRequest(request) {
      let typedRequest = request;
      let correlationToken = (0, uuid_1.v4)();
      typedRequest.clientToken = correlationToken;
      return [typedRequest, correlationToken];
    }
    function normalizeUpdateNamedShadowRequest(value) {
      let normalizedValue = {};
      if (value.clientToken) {
        normalizedValue.clientToken = value.clientToken;
      }
      if (value.state) {
        normalizedValue.state = value.state;
      }
      if (value.version) {
        normalizedValue.version = value.version;
      }
      return normalizedValue;
    }
    function buildUpdateNamedShadowRequestPayload(request) {
      let value = normalizeUpdateNamedShadowRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToUpdateNamedShadowRequest(request) {
      let typedRequest = request;
      let correlationToken = (0, uuid_1.v4)();
      typedRequest.clientToken = correlationToken;
      return [typedRequest, correlationToken];
    }
    function normalizeUpdateShadowRequest(value) {
      let normalizedValue = {};
      if (value.clientToken) {
        normalizedValue.clientToken = value.clientToken;
      }
      if (value.state) {
        normalizedValue.state = value.state;
      }
      if (value.version) {
        normalizedValue.version = value.version;
      }
      return normalizedValue;
    }
    function buildUpdateShadowRequestPayload(request) {
      let value = normalizeUpdateShadowRequest(request);
      return (0, util_utf8_browser_1.fromUtf8)(JSON.stringify(value));
    }
    function applyCorrelationTokenToUpdateShadowRequest(request) {
      let typedRequest = request;
      let correlationToken = (0, uuid_1.v4)();
      typedRequest.clientToken = correlationToken;
      return [typedRequest, correlationToken];
    }
    function buildDeleteNamedShadowSubscriptions(request) {
      let typedRequest = request;
      return new Array(`$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/delete/+`);
    }
    function buildDeleteNamedShadowPublishTopic(request) {
      let typedRequest = request;
      return `$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/delete`;
    }
    function buildDeleteNamedShadowResponsePaths(request) {
      let typedRequest = request;
      return new Array({
        topic: `$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/delete/accepted`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeDeleteShadowResponse
      }, {
        topic: `$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/delete/rejected`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeV2ErrorResponse
      });
    }
    function buildDeleteShadowSubscriptions(request) {
      let typedRequest = request;
      return new Array(`$aws/things/${typedRequest.thingName}/shadow/delete/+`);
    }
    function buildDeleteShadowPublishTopic(request) {
      let typedRequest = request;
      return `$aws/things/${typedRequest.thingName}/shadow/delete`;
    }
    function buildDeleteShadowResponsePaths(request) {
      let typedRequest = request;
      return new Array({
        topic: `$aws/things/${typedRequest.thingName}/shadow/delete/accepted`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeDeleteShadowResponse
      }, {
        topic: `$aws/things/${typedRequest.thingName}/shadow/delete/rejected`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeV2ErrorResponse
      });
    }
    function buildGetNamedShadowSubscriptions(request) {
      let typedRequest = request;
      return new Array(`$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/get/+`);
    }
    function buildGetNamedShadowPublishTopic(request) {
      let typedRequest = request;
      return `$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/get`;
    }
    function buildGetNamedShadowResponsePaths(request) {
      let typedRequest = request;
      return new Array({
        topic: `$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/get/accepted`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeGetShadowResponse
      }, {
        topic: `$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/get/rejected`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeV2ErrorResponse
      });
    }
    function buildGetShadowSubscriptions(request) {
      let typedRequest = request;
      return new Array(`$aws/things/${typedRequest.thingName}/shadow/get/+`);
    }
    function buildGetShadowPublishTopic(request) {
      let typedRequest = request;
      return `$aws/things/${typedRequest.thingName}/shadow/get`;
    }
    function buildGetShadowResponsePaths(request) {
      let typedRequest = request;
      return new Array({
        topic: `$aws/things/${typedRequest.thingName}/shadow/get/accepted`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeGetShadowResponse
      }, {
        topic: `$aws/things/${typedRequest.thingName}/shadow/get/rejected`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeV2ErrorResponse
      });
    }
    function buildUpdateNamedShadowSubscriptions(request) {
      let typedRequest = request;
      return new Array(`$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/update/accepted`, `$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/update/rejected`);
    }
    function buildUpdateNamedShadowPublishTopic(request) {
      let typedRequest = request;
      return `$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/update`;
    }
    function buildUpdateNamedShadowResponsePaths(request) {
      let typedRequest = request;
      return new Array({
        topic: `$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/update/accepted`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeUpdateShadowResponse
      }, {
        topic: `$aws/things/${typedRequest.thingName}/shadow/name/${typedRequest.shadowName}/update/rejected`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeV2ErrorResponse
      });
    }
    function buildUpdateShadowSubscriptions(request) {
      let typedRequest = request;
      return new Array(`$aws/things/${typedRequest.thingName}/shadow/update/accepted`, `$aws/things/${typedRequest.thingName}/shadow/update/rejected`);
    }
    function buildUpdateShadowPublishTopic(request) {
      let typedRequest = request;
      return `$aws/things/${typedRequest.thingName}/shadow/update`;
    }
    function buildUpdateShadowResponsePaths(request) {
      let typedRequest = request;
      return new Array({
        topic: `$aws/things/${typedRequest.thingName}/shadow/update/accepted`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeUpdateShadowResponse
      }, {
        topic: `$aws/things/${typedRequest.thingName}/shadow/update/rejected`,
        correlationTokenJsonPath: "clientToken",
        deserializer: deserializeV2ErrorResponse
      });
    }
    function deserializeDeleteShadowResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function deserializeGetShadowResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function deserializeUpdateShadowResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function deserializeV2ErrorResponse(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function createRequestResponseOperationServiceModelMap() {
      return /* @__PURE__ */ new Map([
        ["deleteNamedShadow", {
          inputShapeName: "DeleteNamedShadowRequest",
          payloadTransformer: buildDeleteNamedShadowRequestPayload,
          subscriptionGenerator: buildDeleteNamedShadowSubscriptions,
          responsePathGenerator: buildDeleteNamedShadowResponsePaths,
          publishTopicGenerator: buildDeleteNamedShadowPublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToDeleteNamedShadowRequest
        }],
        ["deleteShadow", {
          inputShapeName: "DeleteShadowRequest",
          payloadTransformer: buildDeleteShadowRequestPayload,
          subscriptionGenerator: buildDeleteShadowSubscriptions,
          responsePathGenerator: buildDeleteShadowResponsePaths,
          publishTopicGenerator: buildDeleteShadowPublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToDeleteShadowRequest
        }],
        ["getNamedShadow", {
          inputShapeName: "GetNamedShadowRequest",
          payloadTransformer: buildGetNamedShadowRequestPayload,
          subscriptionGenerator: buildGetNamedShadowSubscriptions,
          responsePathGenerator: buildGetNamedShadowResponsePaths,
          publishTopicGenerator: buildGetNamedShadowPublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToGetNamedShadowRequest
        }],
        ["getShadow", {
          inputShapeName: "GetShadowRequest",
          payloadTransformer: buildGetShadowRequestPayload,
          subscriptionGenerator: buildGetShadowSubscriptions,
          responsePathGenerator: buildGetShadowResponsePaths,
          publishTopicGenerator: buildGetShadowPublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToGetShadowRequest
        }],
        ["updateNamedShadow", {
          inputShapeName: "UpdateNamedShadowRequest",
          payloadTransformer: buildUpdateNamedShadowRequestPayload,
          subscriptionGenerator: buildUpdateNamedShadowSubscriptions,
          responsePathGenerator: buildUpdateNamedShadowResponsePaths,
          publishTopicGenerator: buildUpdateNamedShadowPublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToUpdateNamedShadowRequest
        }],
        ["updateShadow", {
          inputShapeName: "UpdateShadowRequest",
          payloadTransformer: buildUpdateShadowRequestPayload,
          subscriptionGenerator: buildUpdateShadowSubscriptions,
          responsePathGenerator: buildUpdateShadowResponsePaths,
          publishTopicGenerator: buildUpdateShadowPublishTopic,
          correlationTokenApplicator: applyCorrelationTokenToUpdateShadowRequest
        }]
      ]);
    }
    function buildCreateNamedShadowDeltaUpdatedStreamTopicFilter(config) {
      const typedConfig = config;
      return `$aws/things/${typedConfig.thingName}/shadow/name/${typedConfig.shadowName}/update/delta`;
    }
    function buildCreateNamedShadowUpdatedStreamTopicFilter(config) {
      const typedConfig = config;
      return `$aws/things/${typedConfig.thingName}/shadow/name/${typedConfig.shadowName}/update/documents`;
    }
    function buildCreateShadowDeltaUpdatedStreamTopicFilter(config) {
      const typedConfig = config;
      return `$aws/things/${typedConfig.thingName}/shadow/update/delta`;
    }
    function buildCreateShadowUpdatedStreamTopicFilter(config) {
      const typedConfig = config;
      return `$aws/things/${typedConfig.thingName}/shadow/update/documents`;
    }
    function deserializeShadowDeltaUpdatedEventPayload(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function deserializeShadowUpdatedEventPayload(payload) {
      const payload_text = (0, util_utf8_browser_1.toUtf8)(new Uint8Array(payload));
      return JSON.parse(payload_text);
    }
    function createStreamingOperationServiceModelMap() {
      return /* @__PURE__ */ new Map([
        ["createNamedShadowDeltaUpdatedStream", {
          inputShapeName: "NamedShadowDeltaUpdatedSubscriptionRequest",
          subscriptionGenerator: buildCreateNamedShadowDeltaUpdatedStreamTopicFilter,
          deserializer: deserializeShadowDeltaUpdatedEventPayload
        }],
        ["createNamedShadowUpdatedStream", {
          inputShapeName: "NamedShadowUpdatedSubscriptionRequest",
          subscriptionGenerator: buildCreateNamedShadowUpdatedStreamTopicFilter,
          deserializer: deserializeShadowUpdatedEventPayload
        }],
        ["createShadowDeltaUpdatedStream", {
          inputShapeName: "ShadowDeltaUpdatedSubscriptionRequest",
          subscriptionGenerator: buildCreateShadowDeltaUpdatedStreamTopicFilter,
          deserializer: deserializeShadowDeltaUpdatedEventPayload
        }],
        ["createShadowUpdatedStream", {
          inputShapeName: "ShadowUpdatedSubscriptionRequest",
          subscriptionGenerator: buildCreateShadowUpdatedStreamTopicFilter,
          deserializer: deserializeShadowUpdatedEventPayload
        }]
      ]);
    }
    function validateDeleteNamedShadowRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
      model_validation_utils.validateValueAsTopicSegment(value.shadowName, "shadowName");
    }
    function validateDeleteShadowRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
    }
    function validateGetNamedShadowRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
      model_validation_utils.validateValueAsTopicSegment(value.shadowName, "shadowName");
    }
    function validateGetShadowRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
    }
    function validateNamedShadowDeltaUpdatedSubscriptionRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
      model_validation_utils.validateValueAsTopicSegment(value.shadowName, "shadowName");
    }
    function validateNamedShadowUpdatedSubscriptionRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
      model_validation_utils.validateValueAsTopicSegment(value.shadowName, "shadowName");
    }
    function validateShadowDeltaUpdatedSubscriptionRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
    }
    function validateShadowState(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsOptionalAny(value.desired, "desired");
      model_validation_utils.validateValueAsOptionalAny(value.reported, "reported");
    }
    function validateShadowUpdatedSubscriptionRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
    }
    function validateUpdateNamedShadowRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
      model_validation_utils.validateValueAsTopicSegment(value.shadowName, "shadowName");
      model_validation_utils.validateValueAsOptionalObject(value.state, validateShadowState, "state");
      model_validation_utils.validateValueAsOptionalInteger(value.version, "version");
    }
    function validateUpdateShadowRequest(value) {
      let typedValue = value;
      model_validation_utils.validateValueAsTopicSegment(value.thingName, "thingName");
      model_validation_utils.validateValueAsOptionalObject(value.state, validateShadowState, "state");
      model_validation_utils.validateValueAsOptionalInteger(value.version, "version");
    }
    function createValidatorMap() {
      return /* @__PURE__ */ new Map([
        ["NamedShadowDeltaUpdatedSubscriptionRequest", validateNamedShadowDeltaUpdatedSubscriptionRequest],
        ["NamedShadowUpdatedSubscriptionRequest", validateNamedShadowUpdatedSubscriptionRequest],
        ["ShadowDeltaUpdatedSubscriptionRequest", validateShadowDeltaUpdatedSubscriptionRequest],
        ["ShadowUpdatedSubscriptionRequest", validateShadowUpdatedSubscriptionRequest],
        ["DeleteNamedShadowRequest", validateDeleteNamedShadowRequest],
        ["DeleteShadowRequest", validateDeleteShadowRequest],
        ["GetNamedShadowRequest", validateGetNamedShadowRequest],
        ["GetShadowRequest", validateGetShadowRequest],
        ["UpdateNamedShadowRequest", validateUpdateNamedShadowRequest],
        ["UpdateShadowRequest", validateUpdateShadowRequest]
      ]);
    }
    function makeServiceModel() {
      let model = {
        requestResponseOperations: createRequestResponseOperationServiceModelMap(),
        streamingOperations: createStreamingOperationServiceModelMap(),
        shapeValidators: createValidatorMap()
      };
      return model;
    }
    exports2.makeServiceModel = makeServiceModel;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotshadow/iotshadowclientv2.js
var require_iotshadowclientv2 = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotshadow/iotshadowclientv2.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IotShadowClientv2 = void 0;
    var aws_crt_1 = require_dist();
    var mqtt_request_response = __importStar(require_mqtt_request_response3());
    var mqtt_request_response_utils = __importStar(require_mqtt_request_response_utils());
    var v2utils = __importStar(require_v2utils3());
    var IotShadowClientv2 = class _IotShadowClientv2 {
      constructor(rrClient) {
        this.rrClient = rrClient;
        this.serviceModel = v2utils.makeServiceModel();
      }
      /**
       * Creates a new service client that will use an SDK MQTT 311 client as transport.
       *
       * @param protocolClient the MQTT 311 client to use for transport
       * @param options additional service client configuration options
       *
       * @return a new service client
       *
       */
      static newFromMqtt311(protocolClient, options) {
        let rrClient = aws_crt_1.mqtt_request_response.RequestResponseClient.newFromMqtt311(protocolClient, options);
        return new _IotShadowClientv2(rrClient);
      }
      /**
       * Creates a new service client that will use an SDK MQTT 5 client as transport.
       *
       * @param protocolClient the MQTT 5 client to use for transport
       * @param options additional service client configuration options
       *
       * @return a new service client
       *
       */
      static newFromMqtt5(protocolClient, options) {
        let rrClient = aws_crt_1.mqtt_request_response.RequestResponseClient.newFromMqtt5(protocolClient, options);
        return new _IotShadowClientv2(rrClient);
      }
      /**
       * Triggers cleanup of all resources associated with the service client.  Closing a client will fail
       * all incomplete requests and close all unclosed streaming operations.
       *
       * This must be called when finished with a client; otherwise, native resources will leak.
       */
      close() {
        this.rrClient.close();
      }
      /**
       * Deletes a named shadow for an AWS IoT thing.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#delete-pub-sub-topic
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotShadow
       */
      deleteNamedShadow(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "deleteNamedShadow",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
      /**
       * Deletes the (classic) shadow for an AWS IoT thing.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#delete-pub-sub-topic
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotShadow
       */
      deleteShadow(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "deleteShadow",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
      /**
       * Gets a named shadow for an AWS IoT thing.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#get-pub-sub-topic
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotShadow
       */
      getNamedShadow(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "getNamedShadow",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
      /**
       * Gets the (classic) shadow for an AWS IoT thing.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#get-pub-sub-topic
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotShadow
       */
      getShadow(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "getShadow",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
      /**
       * Update a named shadow for a device.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-pub-sub-topic
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotShadow
       */
      updateNamedShadow(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "updateNamedShadow",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
      /**
       * Update a device's (classic) shadow.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-pub-sub-topic
       *
       * @param request operation to perform
       *
       * @return Promise which resolves into the response to the request
       *
       * @category IotShadow
       */
      updateShadow(request) {
        return __awaiter(this, void 0, void 0, function* () {
          let config = {
            operationName: "updateShadow",
            serviceModel: this.serviceModel,
            client: this.rrClient,
            request
          };
          return yield mqtt_request_response_utils.doRequestResponse(config);
        });
      }
      /**
       * Create a stream for NamedShadowDelta events for a named shadow of an AWS IoT thing.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-delta-pub-sub-topic
       *
       * @param config streaming operation configuration options
       *
       * @return a streaming operation which will emit an event every time a message is received on the
       *    associated MQTT topic
       *
       * @category IotShadow
       */
      createNamedShadowDeltaUpdatedStream(config) {
        let streamingOperationConfig = {
          operationName: "createNamedShadowDeltaUpdatedStream",
          serviceModel: this.serviceModel,
          client: this.rrClient,
          modelConfig: config
        };
        return mqtt_request_response.StreamingOperation.create(streamingOperationConfig);
      }
      /**
       * Create a stream for ShadowUpdated events for a named shadow of an AWS IoT thing.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-documents-pub-sub-topic
       *
       * @param config streaming operation configuration options
       *
       * @return a streaming operation which will emit an event every time a message is received on the
       *    associated MQTT topic
       *
       * @category IotShadow
       */
      createNamedShadowUpdatedStream(config) {
        let streamingOperationConfig = {
          operationName: "createNamedShadowUpdatedStream",
          serviceModel: this.serviceModel,
          client: this.rrClient,
          modelConfig: config
        };
        return mqtt_request_response.StreamingOperation.create(streamingOperationConfig);
      }
      /**
       * Create a stream for ShadowDelta events for the (classic) shadow of an AWS IoT thing.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-delta-pub-sub-topic
       *
       * @param config streaming operation configuration options
       *
       * @return a streaming operation which will emit an event every time a message is received on the
       *    associated MQTT topic
       *
       * @category IotShadow
       */
      createShadowDeltaUpdatedStream(config) {
        let streamingOperationConfig = {
          operationName: "createShadowDeltaUpdatedStream",
          serviceModel: this.serviceModel,
          client: this.rrClient,
          modelConfig: config
        };
        return mqtt_request_response.StreamingOperation.create(streamingOperationConfig);
      }
      /**
       * Create a stream for ShadowUpdated events for the (classic) shadow of an AWS IoT thing.
       *
       *
       * AWS documentation: https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-mqtt.html#update-documents-pub-sub-topic
       *
       * @param config streaming operation configuration options
       *
       * @return a streaming operation which will emit an event every time a message is received on the
       *    associated MQTT topic
       *
       * @category IotShadow
       */
      createShadowUpdatedStream(config) {
        let streamingOperationConfig = {
          operationName: "createShadowUpdatedStream",
          serviceModel: this.serviceModel,
          client: this.rrClient,
          modelConfig: config
        };
        return mqtt_request_response.StreamingOperation.create(streamingOperationConfig);
      }
    };
    exports2.IotShadowClientv2 = IotShadowClientv2;
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/iotshadow/iotshadow.js
var require_iotshadow = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/iotshadow/iotshadow.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.model = exports2.IotShadowError = exports2.IotShadowClientv2 = exports2.IotShadowClient = void 0;
    var model = __importStar(require_model5());
    exports2.model = model;
    var iotshadowclient_1 = require_iotshadowclient();
    Object.defineProperty(exports2, "IotShadowClient", { enumerable: true, get: function() {
      return iotshadowclient_1.IotShadowClient;
    } });
    Object.defineProperty(exports2, "IotShadowError", { enumerable: true, get: function() {
      return iotshadowclient_1.IotShadowError;
    } });
    var iotshadowclientv2_1 = require_iotshadowclientv2();
    Object.defineProperty(exports2, "IotShadowClientv2", { enumerable: true, get: function() {
      return iotshadowclientv2_1.IotShadowClientv2;
    } });
  }
});

// node_modules/aws-iot-device-sdk-v2/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/aws-iot-device-sdk-v2/dist/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CrtError = exports2.mqtt_request_response = exports2.mqtt5 = exports2.mqtt = exports2.iotshadow = exports2.iotjobs = exports2.iotidentity = exports2.iot = exports2.io = exports2.http = exports2.greengrasscoreipc = exports2.greengrass = exports2.eventstream_rpc = exports2.auth = void 0;
    var eventstream_rpc = __importStar(require_eventstream_rpc());
    exports2.eventstream_rpc = eventstream_rpc;
    var greengrass = __importStar(require_discoveryclient());
    exports2.greengrass = greengrass;
    var greengrasscoreipc = __importStar(require_greengrasscoreipc());
    exports2.greengrasscoreipc = greengrasscoreipc;
    var iotidentity = __importStar(require_iotidentity());
    exports2.iotidentity = iotidentity;
    var iotjobs = __importStar(require_iotjobs());
    exports2.iotjobs = iotjobs;
    var iotshadow = __importStar(require_iotshadow());
    exports2.iotshadow = iotshadow;
    var mqtt_request_response = __importStar(require_mqtt_request_response3());
    exports2.mqtt_request_response = mqtt_request_response;
    var aws_crt_1 = require_dist();
    Object.defineProperty(exports2, "auth", { enumerable: true, get: function() {
      return aws_crt_1.auth;
    } });
    Object.defineProperty(exports2, "http", { enumerable: true, get: function() {
      return aws_crt_1.http;
    } });
    Object.defineProperty(exports2, "io", { enumerable: true, get: function() {
      return aws_crt_1.io;
    } });
    Object.defineProperty(exports2, "iot", { enumerable: true, get: function() {
      return aws_crt_1.iot;
    } });
    Object.defineProperty(exports2, "mqtt", { enumerable: true, get: function() {
      return aws_crt_1.mqtt;
    } });
    Object.defineProperty(exports2, "mqtt5", { enumerable: true, get: function() {
      return aws_crt_1.mqtt5;
    } });
    Object.defineProperty(exports2, "CrtError", { enumerable: true, get: function() {
      return aws_crt_1.CrtError;
    } });
  }
});

// artifacts/index.js
var { mqtt, iot } = require_dist2();
console.log("Starting IPC MQTT bridge");
var client = new mqtt.MqttClient();
var connection = client.new_connection({
  region: "ap-southeast-1",
  clientId: "greengrass-edge"
});
async function start() {
  await connection.connect();
  setInterval(async () => {
    const payload = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      message: "heartbeat"
    };
    console.log("publishing:", payload);
    await connection.publish(
      "edge/telemetry",
      JSON.stringify(payload),
      mqtt.QoS.AtLeastOnce
    );
  }, 1e4);
}
start().catch(console.error);
