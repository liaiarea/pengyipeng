var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../Users/L/AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// server/services/kuaiziService.js
var KuaiziService = class {
  static {
    __name(this, "KuaiziService");
  }
  constructor(env2) {
    this.baseURL = "https://openapi.kuaizi.co/v2";
    this.appKey = env2.KUAIZI_APP_KEY;
    this.appSecret = env2.KUAIZI_APP_SECRET;
    this.accountId = env2.KUAIZI_ACCOUNT_ID;
    this.usedVideos = /* @__PURE__ */ new Set();
    this.env = env2;
    if (!this.appKey || !this.appSecret) {
      console.error("\u274C \u5FEB\u5B50API\u914D\u7F6E\u7F3A\u5931\uFF0C\u8BF7\u68C0\u67E5\u73AF\u5883\u53D8\u91CF");
    }
  }
  /**
   * MD5哈希函数 - Cloudflare Workers兼容版本
   */
  async md5(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    function md5cycle(x, k) {
      let a = x[0], b = x[1], c = x[2], d = x[3];
      a = ff(a, b, c, d, k[0], 7, -680876936);
      d = ff(d, a, b, c, k[1], 12, -389564586);
      c = ff(c, d, a, b, k[2], 17, 606105819);
      b = ff(b, c, d, a, k[3], 22, -1044525330);
      x[0] = add32(a, x[0]);
      x[1] = add32(b, x[1]);
      x[2] = add32(c, x[2]);
      x[3] = add32(d, x[3]);
    }
    __name(md5cycle, "md5cycle");
    function cmn(q, a, b, x, s, t) {
      a = add32(add32(a, q), add32(x, t));
      return add32(a << s | a >>> 32 - s, b);
    }
    __name(cmn, "cmn");
    function ff(a, b, c, d, x, s, t) {
      return cmn(b & c | ~b & d, a, b, x, s, t);
    }
    __name(ff, "ff");
    function add32(a, b) {
      return a + b & 4294967295;
    }
    __name(add32, "add32");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hash.substring(0, 32);
  }
  /**
   * 生成API签名 - 根据快子API文档要求
   */
  async generateSign(timestamp) {
    const signString = `${timestamp}#${this.appSecret}`;
    return await this.md5(signString);
  }
  /**
   * 获取API请求头
   */
  async getHeaders() {
    const timestamp = Date.now();
    const sign = await this.generateSign(timestamp);
    return {
      "AUTH-TIMESTAMP": timestamp.toString(),
      "AUTH-SIGN": sign,
      "APP-KEY": this.appKey,
      "Content-Type": "application/json"
    };
  }
  /**
   * 获取素材列表
   */
  async getMaterialList(params = {}) {
    try {
      console.log("\u{1F4CB} \u83B7\u53D6\u7D20\u6750\u5217\u8868:", params);
      const queryParams = new URLSearchParams({
        account_id: this.accountId,
        type: params.type || "video",
        page: params.page || 1,
        size: params.size || 20
      });
      if (params.category) {
        queryParams.append("category", params.category);
      }
      if (params.keyword) {
        queryParams.append("keyword", params.keyword);
      }
      const url = `${this.baseURL}/material/list?${queryParams}`;
      console.log("\u{1F517} \u8BF7\u6C42URL:", url);
      const response = await fetch(url, {
        method: "GET",
        headers: await this.getHeaders()
      });
      const data = await response.json();
      if (data.code === 200) {
        const materialData = data.data;
        console.log("\u2705 \u83B7\u53D6\u7D20\u6750\u6210\u529F:", {
          total: materialData.total,
          page: materialData.page,
          page_size: materialData.page_size,
          count: materialData.list?.length || 0
        });
        return materialData;
      } else {
        this.handleKuaiziError(data.code, data.message);
        throw new Error(data.message || "\u83B7\u53D6\u7D20\u6750\u5217\u8868\u5931\u8D25");
      }
    } catch (error3) {
      console.error("\u274C \u83B7\u53D6\u7D20\u6750\u5217\u8868\u5931\u8D25:", error3.message);
      throw error3;
    }
  }
  /**
   * 获取未使用的视频 - 随机选择
   */
  async getUnusedVideo(params = {}) {
    try {
      console.log("\u{1F3AF} \u83B7\u53D6\u672A\u4F7F\u7528\u89C6\u9891:", params);
      const materialData = await this.getMaterialList({
        type: "video",
        category: params.category,
        page: 1,
        size: 50
        // 获取更多视频以便随机选择
      });
      let videos = materialData.list || [];
      videos = videos.filter((video) => !this.usedVideos.has(video.id));
      if (videos.length === 0) {
        console.log("\u26A0\uFE0F \u6CA1\u6709\u53EF\u7528\u7684\u672A\u4F7F\u7528\u89C6\u9891\uFF0C\u91CD\u7F6E\u5DF2\u4F7F\u7528\u5217\u8868");
        this.usedVideos.clear();
        videos = materialData.list || [];
      }
      if (videos.length === 0) {
        console.log("\u274C \u7D20\u6750\u5E93\u4E2D\u6CA1\u6709\u89C6\u9891");
        return null;
      }
      const randomIndex = Math.floor(Math.random() * videos.length);
      const selectedVideo = videos[randomIndex];
      console.log(`\u{1F3AC} \u968F\u673A\u9009\u62E9\u89C6\u9891 ${randomIndex + 1}/${videos.length}: ${selectedVideo.name}`);
      return {
        id: selectedVideo.id,
        video_url: selectedVideo.file?.url || "",
        cover_url: selectedVideo.file?.thumb_url || "",
        caption: selectedVideo.name || selectedVideo.note || "\u7CBE\u5F69\u89C6\u9891\u5185\u5BB9",
        hashtags: this.parseHashtags(selectedVideo.tags || ""),
        duration: selectedVideo.file?.file_info?.play_time || 0,
        size: selectedVideo.file?.size || 0,
        width: selectedVideo.file?.file_info?.width || 0,
        height: selectedVideo.file?.file_info?.height || 0,
        fps: selectedVideo.file?.file_info?.fps || 0,
        bitrate: selectedVideo.file?.file_info?.bitrate || 0,
        file_ext: selectedVideo.file_ext || "mp4",
        create_date: selectedVideo.create_date || ""
      };
    } catch (error3) {
      console.error("\u274C \u83B7\u53D6\u672A\u4F7F\u7528\u89C6\u9891\u5931\u8D25:", error3.message);
      throw error3;
    }
  }
  /**
   * 标记视频为已使用
   */
  async markVideoAsUsed(videoId) {
    try {
      this.usedVideos.add(videoId);
      console.log(`\u2705 \u89C6\u9891 ${videoId} \u5DF2\u6807\u8BB0\u4E3A\u5DF2\u4F7F\u7528`);
      if (this.env.VIDEO_CACHE) {
        try {
          const usedList = await this.env.VIDEO_CACHE.get("used_videos");
          const used = usedList ? JSON.parse(usedList) : [];
          if (!used.includes(videoId)) {
            used.push(videoId);
            await this.env.VIDEO_CACHE.put("used_videos", JSON.stringify(used));
          }
        } catch (e) {
          console.warn("KV\u5B58\u50A8\u5DF2\u4F7F\u7528\u89C6\u9891\u5931\u8D25:", e);
        }
      }
      return true;
    } catch (error3) {
      console.error("\u274C \u6807\u8BB0\u89C6\u9891\u5931\u8D25:", error3.message);
      return false;
    }
  }
  /**
   * 获取账户信息（替代方法）
   */
  async getAccountInfo() {
    try {
      const materialData = await this.getMaterialList({
        type: "video",
        page: 1,
        size: 1
      });
      return {
        total_materials: materialData.total,
        status: "active",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error3) {
      console.error("\u274C \u83B7\u53D6\u8D26\u6237\u4FE1\u606F\u5931\u8D25:", error3.message);
      throw error3;
    }
  }
  /**
   * 解析标签字符串
   */
  parseHashtags(tagsString) {
    if (!tagsString) return [];
    return tagsString.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
  }
  /**
   * 处理快子API特定错误码
   */
  handleKuaiziError(errorCode, errorMessage) {
    switch (errorCode) {
      case 4e4:
        console.error("\u274C \u5FEB\u5B50API: \u53C2\u6570\u9519\u8BEF -", errorMessage);
        break;
      case 40005:
        console.error("\u274C \u5FEB\u5B50API: \u7B7E\u540D\u9A8C\u8BC1\u5931\u8D25 -", errorMessage);
        break;
      case 61e3:
        console.error("\u274C \u5FEB\u5B50API: \u8D26\u6237\u4F59\u989D\u4E0D\u8DB3 -", errorMessage);
        break;
      default:
        console.error(`\u274C \u5FEB\u5B50API\u9519\u8BEF ${errorCode}:`, errorMessage);
    }
  }
  /**
   * 重置已使用视频列表
   */
  resetUsedVideos() {
    this.usedVideos.clear();
    console.log("\u2705 \u5DF2\u91CD\u7F6E\u4F7F\u7528\u8BB0\u5F55");
  }
};

// server/utils/response.js
function createResponse(code, message, data = null, error3 = null) {
  const responseBody = {
    code,
    message,
    data,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (error3) {
    responseBody.error = error3;
  }
  const status = code >= 200 && code < 300 ? code : code >= 400 ? code : 500;
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      "Content-Type": "application/json;charset=UTF-8"
    }
  });
}
__name(createResponse, "createResponse");
function createSuccessResponse(data, message = "success") {
  return createResponse(200, message, data);
}
__name(createSuccessResponse, "createSuccessResponse");
function createErrorResponse(code, message, error3 = null) {
  return createResponse(code, message, null, error3);
}
__name(createErrorResponse, "createErrorResponse");

// server/utils/validation.js
function validateCategory(category) {
  if (!category) {
    return { valid: true };
  }
  if (typeof category !== "string") {
    return { valid: false, error: "\u7C7B\u522B\u5FC5\u987B\u662F\u5B57\u7B26\u4E32" };
  }
  if (category.length > 50) {
    return { valid: false, error: "\u7C7B\u522B\u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC750\u5B57\u7B26" };
  }
  return { valid: true };
}
__name(validateCategory, "validateCategory");
function validatePagination(page, size) {
  const pageNum = parseInt(page) || 1;
  const sizeNum = parseInt(size) || 20;
  if (pageNum < 1 || pageNum > 1e3) {
    return { valid: false, error: "\u9875\u7801\u5FC5\u987B\u57281-1000\u4E4B\u95F4" };
  }
  if (sizeNum < 1 || sizeNum > 100) {
    return { valid: false, error: "\u6BCF\u9875\u5927\u5C0F\u5FC5\u987B\u57281-100\u4E4B\u95F4" };
  }
  return {
    valid: true,
    page: pageNum,
    size: sizeNum
  };
}
__name(validatePagination, "validatePagination");
function validateInput(data, rules) {
  const errors = [];
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    if (rule.required && (value === void 0 || value === null || value === "")) {
      errors.push(`${field}\u662F\u5FC5\u9700\u7684`);
      continue;
    }
    if (!rule.required && (value === void 0 || value === null || value === "")) {
      continue;
    }
    if (rule.type && typeof value !== rule.type) {
      errors.push(`${field}\u5FC5\u987B\u662F${rule.type}\u7C7B\u578B`);
      continue;
    }
    if (rule.minLength && typeof value === "string" && value.length < rule.minLength) {
      errors.push(`${field}\u957F\u5EA6\u4E0D\u80FD\u5C11\u4E8E${rule.minLength}\u5B57\u7B26`);
    }
    if (rule.maxLength && typeof value === "string" && value.length > rule.maxLength) {
      errors.push(`${field}\u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC7${rule.maxLength}\u5B57\u7B26`);
    }
    if (rule.min && typeof value === "number" && value < rule.min) {
      errors.push(`${field}\u4E0D\u80FD\u5C0F\u4E8E${rule.min}`);
    }
    if (rule.max && typeof value === "number" && value > rule.max) {
      errors.push(`${field}\u4E0D\u80FD\u5927\u4E8E${rule.max}`);
    }
    if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
      errors.push(`${field}\u683C\u5F0F\u65E0\u6548`);
    }
    if (rule.validator && typeof rule.validator === "function") {
      const result = rule.validator(value);
      if (result !== true) {
        errors.push(typeof result === "string" ? result : `${field}\u9A8C\u8BC1\u5931\u8D25`);
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
__name(validateInput, "validateInput");

// server/routes/nfc.js
async function handleNfcRoutes(request, env2) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const kuaiziService = new KuaiziService(env2);
  try {
    if (path === "/api/nfc/redirect" && method === "GET") {
      return await handleNfcRedirect(request, env2, kuaiziService);
    }
    if (path === "/api/nfc/videos" && method === "GET") {
      return await handleGetVideos(request, env2, kuaiziService);
    }
    if (path === "/api/nfc/account" && method === "GET") {
      return await handleGetAccount(request, env2, kuaiziService);
    }
    if (path === "/api/nfc/trigger" && method === "POST") {
      return await handleManualTrigger(request, env2, kuaiziService);
    }
    return createErrorResponse(404, "NFC\u63A5\u53E3\u4E0D\u5B58\u5728");
  } catch (error3) {
    console.error("NFC\u8DEF\u7531\u5904\u7406\u9519\u8BEF:", error3);
    return createErrorResponse(500, "NFC\u670D\u52A1\u5904\u7406\u5931\u8D25", error3.message);
  }
}
__name(handleNfcRoutes, "handleNfcRoutes");
async function handleNfcRedirect(request, env2, kuaiziService) {
  try {
    const url = new URL(request.url);
    const store_id = url.searchParams.get("store_id");
    const category = url.searchParams.get("category") || "general";
    console.log("\u{1F50D} NFC\u8DF3\u8F6C\u8BF7\u6C42:", { store_id, category });
    if (!store_id) {
      return Response.redirect("/error?msg=" + encodeURIComponent("\u7F3A\u5C11\u5546\u5E97ID\u53C2\u6570"), 302);
    }
    const userAgent = request.headers.get("User-Agent") || "";
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isMobile = isIOS || isAndroid;
    if (!isMobile) {
      return Response.redirect("/mobile-required", 302);
    }
    const videoData = await kuaiziService.getUnusedVideo({
      store_id,
      category
    });
    if (!videoData) {
      console.error("\u274C \u6CA1\u6709\u53EF\u7528\u7684\u89C6\u9891\u7D20\u6750");
      return Response.redirect("/no-video-available", 302);
    }
    await kuaiziService.markVideoAsUsed(videoData.id);
    const douyinUrl = generateDouyinUrl(videoData, isIOS, env2);
    console.log("\u2705 \u751F\u6210\u6296\u97F3\u8DF3\u8F6C\u94FE\u63A5:", douyinUrl);
    return Response.redirect(douyinUrl, 302);
  } catch (error3) {
    console.error("\u274C NFC\u8DF3\u8F6C\u5904\u7406\u5931\u8D25:", error3);
    let errorMsg = "\u83B7\u53D6\u89C6\u9891\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5";
    if (error3.message.includes("\u4F59\u989D\u4E0D\u8DB3")) {
      errorMsg = "\u8D26\u6237\u4F59\u989D\u4E0D\u8DB3\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458";
    } else if (error3.message.includes("\u7B7E\u540D\u9A8C\u8BC1\u5931\u8D25")) {
      errorMsg = "API\u914D\u7F6E\u9519\u8BEF\uFF0C\u8BF7\u8054\u7CFB\u6280\u672F\u652F\u6301";
    }
    return Response.redirect("/error?msg=" + encodeURIComponent(errorMsg), 302);
  }
}
__name(handleNfcRedirect, "handleNfcRedirect");
async function handleGetVideos(request, env2, kuaiziService) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const category = url.searchParams.get("category");
    const materialData = await kuaiziService.getMaterialList({
      type: "video",
      page,
      size: limit,
      category: category || ""
    });
    return createSuccessResponse({
      list: materialData.list || [],
      total: materialData.total || 0,
      page,
      limit
    });
  } catch (error3) {
    console.error("\u83B7\u53D6\u89C6\u9891\u5217\u8868\u5931\u8D25:", error3);
    return createErrorResponse(500, error3.message || "\u83B7\u53D6\u89C6\u9891\u5217\u8868\u5931\u8D25");
  }
}
__name(handleGetVideos, "handleGetVideos");
async function handleGetAccount(request, env2, kuaiziService) {
  try {
    const materialData = await kuaiziService.getMaterialList({
      type: "video",
      page: 1,
      size: 1
    });
    return createSuccessResponse({
      total_materials: materialData.total,
      status: "active",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error3) {
    console.error("\u83B7\u53D6\u8D26\u6237\u4FE1\u606F\u5931\u8D25:", error3);
    return createErrorResponse(500, error3.message || "\u83B7\u53D6\u8D26\u6237\u4FE1\u606F\u5931\u8D25");
  }
}
__name(handleGetAccount, "handleGetAccount");
async function handleManualTrigger(request, env2, kuaiziService) {
  try {
    const body = await request.json();
    const { store_id, category } = body;
    const validation = validateInput(body, {
      store_id: { required: true, type: "string" },
      category: { required: false, type: "string" }
    });
    if (!validation.valid) {
      return createErrorResponse(400, "\u53C2\u6570\u9A8C\u8BC1\u5931\u8D25", validation.errors);
    }
    const videoData = await kuaiziService.getUnusedVideo({
      store_id,
      category: category || "general"
    });
    if (!videoData) {
      return createErrorResponse(404, "\u6682\u65E0\u53EF\u7528\u89C6\u9891");
    }
    return createSuccessResponse({
      video: videoData,
      douyin_url_ios: generateDouyinUrl(videoData, true, env2),
      douyin_url_android: generateDouyinUrl(videoData, false, env2)
    });
  } catch (error3) {
    console.error("\u624B\u52A8\u89E6\u53D1\u5931\u8D25:", error3);
    return createErrorResponse(500, error3.message || "\u624B\u52A8\u89E6\u53D1\u5931\u8D25");
  }
}
__name(handleManualTrigger, "handleManualTrigger");
function generateDouyinUrl(videoData, isIOS, env2) {
  const baseUrl = "snssdk1128://platformapi/startapp";
  const params = new URLSearchParams({
    appKey: env2.DOUYIN_APP_ID || "default_app_id",
    videoPath: videoData.video_url,
    caption: videoData.caption || "",
    hashtags: videoData.hashtags ? videoData.hashtags.join(",") : "",
    callback: `${env2.DOMAIN || ""}/api/douyin/callback`
  });
  return `${baseUrl}?${params.toString()}`;
}
__name(generateDouyinUrl, "generateDouyinUrl");

// server/routes/kuaizi.js
async function handleKuaiziRoutes(request, env2) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const kuaiziService = new KuaiziService(env2);
  try {
    if (path === "/api/kuaizi/videos" && method === "GET") {
      return await handleGetVideos2(request, env2, kuaiziService);
    }
    if (path === "/api/kuaizi/test" && method === "GET") {
      return await handleApiTest(request, env2, kuaiziService);
    }
    if (path === "/api/kuaizi/account" && method === "GET") {
      return await handleGetAccount2(request, env2, kuaiziService);
    }
    return createErrorResponse(404, "\u5FEB\u5B50API\u63A5\u53E3\u4E0D\u5B58\u5728");
  } catch (error3) {
    console.error("\u5FEB\u5B50API\u8DEF\u7531\u5904\u7406\u9519\u8BEF:", error3);
    return createErrorResponse(500, "\u5FEB\u5B50API\u670D\u52A1\u5904\u7406\u5931\u8D25", error3.message);
  }
}
__name(handleKuaiziRoutes, "handleKuaiziRoutes");
async function handleGetVideos2(request, env2, kuaiziService) {
  try {
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    const size = url.searchParams.get("size") || "10";
    const category = url.searchParams.get("category");
    const pageValidation = validatePagination(page, size);
    if (!pageValidation.valid) {
      return createErrorResponse(400, pageValidation.error);
    }
    const categoryValidation = validateCategory(category);
    if (!categoryValidation.valid) {
      return createErrorResponse(400, categoryValidation.error);
    }
    const videos = await kuaiziService.getMaterialList({
      type: "video",
      page: pageValidation.page,
      size: pageValidation.size,
      category
    });
    return createSuccessResponse(videos);
  } catch (error3) {
    console.error("\u83B7\u53D6\u89C6\u9891\u5217\u8868\u5931\u8D25:", error3);
    return createErrorResponse(500, "\u83B7\u53D6\u89C6\u9891\u5217\u8868\u5931\u8D25", error3.message);
  }
}
__name(handleGetVideos2, "handleGetVideos");
async function handleApiTest(request, env2, kuaiziService) {
  try {
    const testData = await kuaiziService.getMaterialList({
      type: "video",
      page: 1,
      size: 1
    });
    return createSuccessResponse({
      connected: true,
      total_videos: testData.total,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error3) {
    console.error("API\u8FDE\u63A5\u6D4B\u8BD5\u5931\u8D25:", error3);
    return createErrorResponse(500, "API\u8FDE\u63A5\u6D4B\u8BD5\u5931\u8D25", error3.message);
  }
}
__name(handleApiTest, "handleApiTest");
async function handleGetAccount2(request, env2, kuaiziService) {
  try {
    const accountInfo = await kuaiziService.getAccountInfo();
    return createSuccessResponse(accountInfo);
  } catch (error3) {
    console.error("\u83B7\u53D6\u8D26\u6237\u4FE1\u606F\u5931\u8D25:", error3);
    return createErrorResponse(500, "\u83B7\u53D6\u8D26\u6237\u4FE1\u606F\u5931\u8D25", error3.message);
  }
}
__name(handleGetAccount2, "handleGetAccount");

// server/routes/douyin.js
async function handleDouyinRoutes(request, env2) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  try {
    if (path === "/api/douyin/callback" && method === "GET") {
      return await handleDouyinCallback(request, env2);
    }
    if (path === "/api/douyin/share" && method === "POST") {
      return await handleShareToDouyin(request, env2);
    }
    return createErrorResponse(404, "\u6296\u97F3\u63A5\u53E3\u4E0D\u5B58\u5728");
  } catch (error3) {
    console.error("\u6296\u97F3\u8DEF\u7531\u5904\u7406\u9519\u8BEF:", error3);
    return createErrorResponse(500, "\u6296\u97F3\u670D\u52A1\u5904\u7406\u5931\u8D25", error3.message);
  }
}
__name(handleDouyinRoutes, "handleDouyinRoutes");
async function handleDouyinCallback(request, env2) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error3 = url.searchParams.get("error");
    if (error3) {
      console.error("\u6296\u97F3\u56DE\u8C03\u9519\u8BEF:", error3);
      return Response.redirect("/share-failed?error=" + encodeURIComponent(error3), 302);
    }
    if (code) {
      console.log("\u6296\u97F3\u5206\u4EAB\u6210\u529F\u56DE\u8C03:", { code, state });
      return Response.redirect("/share-success", 302);
    }
    return Response.redirect("/share-failed", 302);
  } catch (error3) {
    console.error("\u5904\u7406\u6296\u97F3\u56DE\u8C03\u5931\u8D25:", error3);
    return Response.redirect("/share-failed", 302);
  }
}
__name(handleDouyinCallback, "handleDouyinCallback");
async function handleShareToDouyin(request, env2) {
  try {
    const body = await request.json();
    const { video_url, caption, hashtags } = body;
    if (!video_url) {
      return createErrorResponse(400, "\u89C6\u9891URL\u4E0D\u80FD\u4E3A\u7A7A");
    }
    const shareUrl = generateDouyinShareUrl({
      video_url,
      caption: caption || "",
      hashtags: hashtags || []
    }, env2);
    return createSuccessResponse({
      share_url: shareUrl,
      message: "\u5206\u4EAB\u94FE\u63A5\u751F\u6210\u6210\u529F"
    });
  } catch (error3) {
    console.error("\u751F\u6210\u6296\u97F3\u5206\u4EAB\u94FE\u63A5\u5931\u8D25:", error3);
    return createErrorResponse(500, error3.message || "\u751F\u6210\u5206\u4EAB\u94FE\u63A5\u5931\u8D25");
  }
}
__name(handleShareToDouyin, "handleShareToDouyin");
function generateDouyinShareUrl(videoData, env2) {
  const baseUrl = "snssdk1128://platformapi/startapp";
  const params = new URLSearchParams({
    appKey: env2.DOUYIN_APP_ID || "default_app_id",
    videoPath: videoData.video_url,
    caption: videoData.caption || "",
    hashtags: Array.isArray(videoData.hashtags) ? videoData.hashtags.join(",") : "",
    callback: `${env2.DOMAIN || ""}/api/douyin/callback`
  });
  return `${baseUrl}?${params.toString()}`;
}
__name(generateDouyinShareUrl, "generateDouyinShareUrl");

// server/routes/router.js
function createRouter(env2) {
  return {
    async handle(request) {
      const url = new URL(request.url);
      const path = url.pathname;
      try {
        if (path.startsWith("/api/nfc/")) {
          return await handleNfcRoutes(request, env2);
        }
        if (path.startsWith("/api/kuaizi/")) {
          return await handleKuaiziRoutes(request, env2);
        }
        if (path.startsWith("/api/douyin/")) {
          return await handleDouyinRoutes(request, env2);
        }
        return createResponse(404, "\u63A5\u53E3\u4E0D\u5B58\u5728", null);
      } catch (error3) {
        console.error("\u8DEF\u7531\u5904\u7406\u9519\u8BEF:", error3);
        return createResponse(500, "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF", null, error3.message);
      }
    }
  };
}
__name(createRouter, "createRouter");

// server/middleware/cors.js
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400"
};
function handleCors(request, response = null) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }
  if (response) {
    const newHeaders = new Headers(response.headers);
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS
  });
}
__name(handleCors, "handleCors");

// server/middleware/rateLimit.js
var RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1e3,
  // 15分钟窗口
  maxRequests: 100,
  // 最大请求数
  keyPrefix: "rate_limit:"
};
async function handleRateLimit(request, env2) {
  try {
    const clientIP = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
    const key = `${RATE_LIMIT_CONFIG.keyPrefix}${clientIP}`;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_CONFIG.windowMs;
    let rateLimitData;
    try {
      const stored = await env2.VIDEO_CACHE?.get(key);
      rateLimitData = stored ? JSON.parse(stored) : { count: 0, resetTime: now + RATE_LIMIT_CONFIG.windowMs };
    } catch (e) {
      console.warn("KV\u5B58\u50A8\u4E0D\u53EF\u7528\uFF0C\u8DF3\u8FC7\u901F\u7387\u9650\u5236:", e);
      return null;
    }
    if (now > rateLimitData.resetTime) {
      rateLimitData = { count: 0, resetTime: now + RATE_LIMIT_CONFIG.windowMs };
    }
    if (rateLimitData.count >= RATE_LIMIT_CONFIG.maxRequests) {
      return createResponse(429, "\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5", {
        retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1e3)
      });
    }
    rateLimitData.count++;
    try {
      await env2.VIDEO_CACHE?.put(key, JSON.stringify(rateLimitData), {
        expirationTtl: Math.ceil(RATE_LIMIT_CONFIG.windowMs / 1e3)
      });
    } catch (e) {
      console.warn("\u66F4\u65B0\u901F\u7387\u9650\u5236\u6570\u636E\u5931\u8D25:", e);
    }
    return null;
  } catch (error3) {
    console.error("\u901F\u7387\u9650\u5236\u5904\u7406\u9519\u8BEF:", error3);
    return null;
  }
}
__name(handleRateLimit, "handleRateLimit");

// server/index.js
var index_default = {
  async fetch(request, env2, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      if (request.method === "OPTIONS") {
        return handleCors(request);
      }
      if (path.startsWith("/api/")) {
        const rateLimitResponse = await handleRateLimit(request, env2);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
        const router = createRouter(env2);
        const response = await router.handle(request);
        return handleCors(request, response);
      }
      if (path === "/health") {
        return createResponse(200, "success", {
          status: "healthy",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          version: "1.0.0",
          worker: true
        });
      }
      if (path === "/nfc-redirect") {
        const queryParams = url.search;
        return Response.redirect(`/api/nfc/redirect${queryParams}`, 302);
      }
      if (path === "/api" || path === "/api/") {
        return createResponse(200, "success", {
          message: "NFC\u6296\u97F3\u89C6\u9891API\u670D\u52A1 - Cloudflare Workers\u7248",
          version: "1.0.0",
          endpoints: [
            "GET /api/nfc/redirect - NFC\u8DF3\u8F6C\u5904\u7406",
            "GET /api/nfc/videos - \u83B7\u53D6\u89C6\u9891\u5217\u8868",
            "POST /api/nfc/trigger - \u624B\u52A8\u89E6\u53D1",
            "GET /health - \u5065\u5EB7\u68C0\u67E5"
          ]
        });
      }
      return env2.ASSETS.fetch(request);
    } catch (error3) {
      console.error("Workers\u5904\u7406\u9519\u8BEF:", error3);
      return createResponse(500, "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF", null, error3.message);
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
