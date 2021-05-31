/*
京东京喜工厂
更新时间：2021-4-9
修复做任务、收集电力出现火爆，不能完成任务，重新计算h5st验证
参考自 ：https://www.orzlee.com/web-development/2021/03/03/lxk0301-jingdong-signin-scriptjingxi-factory-solves-the-problem-of-unable-to-signin.html
活动入口：京东APP-游戏与互动-查看更多-京喜工厂
或者: 京东APP首页搜索 "玩一玩" ,造物工厂即可

已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#京喜工厂
10 * * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_dreamFactory.js, tag=京喜工厂, img-url=https://github.com/58xinian/icon/raw/master/jdgc.png, enabled=true

================Loon==============
[Script]
cron "10 * * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_dreamFactory.js,tag=京喜工厂

===============Surge=================
京喜工厂 = type=cron,cronexp="10 * * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_dreamFactory.js

============小火箭=========
京喜工厂 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_dreamFactory.js, cronexpr="10 * * * *", timeout=3600, enable=true

 */
// prettier-ignore
!function (t, r) { "object" == typeof exports ? module.exports = exports = r() : "function" == typeof define && define.amd ? define([], r) : t.CryptoJS = r() }(this, function () {
  var t = t || function (t, r) { var e = Object.create || function () { function t() { } return function (r) { var e; return t.prototype = r, e = new t, t.prototype = null, e } }(), i = {}, n = i.lib = {}, o = n.Base = function () { return { extend: function (t) { var r = e(this); return t && r.mixIn(t), r.hasOwnProperty("init") && this.init !== r.init || (r.init = function () { r.$super.init.apply(this, arguments) }), r.init.prototype = r, r.$super = this, r }, create: function () { var t = this.extend(); return t.init.apply(t, arguments), t }, init: function () { }, mixIn: function (t) { for (var r in t) t.hasOwnProperty(r) && (this[r] = t[r]); t.hasOwnProperty("toString") && (this.toString = t.toString) }, clone: function () { return this.init.prototype.extend(this) } } }(), s = n.WordArray = o.extend({ init: function (t, e) { t = this.words = t || [], e != r ? this.sigBytes = e : this.sigBytes = 4 * t.length }, toString: function (t) { return (t || c).stringify(this) }, concat: function (t) { var r = this.words, e = t.words, i = this.sigBytes, n = t.sigBytes; if (this.clamp(), i % 4) for (var o = 0; o < n; o++) { var s = e[o >>> 2] >>> 24 - o % 4 * 8 & 255; r[i + o >>> 2] |= s << 24 - (i + o) % 4 * 8 } else for (var o = 0; o < n; o += 4)r[i + o >>> 2] = e[o >>> 2]; return this.sigBytes += n, this }, clamp: function () { var r = this.words, e = this.sigBytes; r[e >>> 2] &= 4294967295 << 32 - e % 4 * 8, r.length = t.ceil(e / 4) }, clone: function () { var t = o.clone.call(this); return t.words = this.words.slice(0), t }, random: function (r) { for (var e, i = [], n = function (r) { var r = r, e = 987654321, i = 4294967295; return function () { e = 36969 * (65535 & e) + (e >> 16) & i, r = 18e3 * (65535 & r) + (r >> 16) & i; var n = (e << 16) + r & i; return n /= 4294967296, n += .5, n * (t.random() > .5 ? 1 : -1) } }, o = 0; o < r; o += 4) { var a = n(4294967296 * (e || t.random())); e = 987654071 * a(), i.push(4294967296 * a() | 0) } return new s.init(i, r) } }), a = i.enc = {}, c = a.Hex = { stringify: function (t) { for (var r = t.words, e = t.sigBytes, i = [], n = 0; n < e; n++) { var o = r[n >>> 2] >>> 24 - n % 4 * 8 & 255; i.push((o >>> 4).toString(16)), i.push((15 & o).toString(16)) } return i.join("") }, parse: function (t) { for (var r = t.length, e = [], i = 0; i < r; i += 2)e[i >>> 3] |= parseInt(t.substr(i, 2), 16) << 24 - i % 8 * 4; return new s.init(e, r / 2) } }, h = a.Latin1 = { stringify: function (t) { for (var r = t.words, e = t.sigBytes, i = [], n = 0; n < e; n++) { var o = r[n >>> 2] >>> 24 - n % 4 * 8 & 255; i.push(String.fromCharCode(o)) } return i.join("") }, parse: function (t) { for (var r = t.length, e = [], i = 0; i < r; i++)e[i >>> 2] |= (255 & t.charCodeAt(i)) << 24 - i % 4 * 8; return new s.init(e, r) } }, l = a.Utf8 = { stringify: function (t) { try { return decodeURIComponent(escape(h.stringify(t))) } catch (t) { throw new Error("Malformed UTF-8 data") } }, parse: function (t) { return h.parse(unescape(encodeURIComponent(t))) } }, f = n.BufferedBlockAlgorithm = o.extend({ reset: function () { this._data = new s.init, this._nDataBytes = 0 }, _append: function (t) { "string" == typeof t && (t = l.parse(t)), this._data.concat(t), this._nDataBytes += t.sigBytes }, _process: function (r) { var e = this._data, i = e.words, n = e.sigBytes, o = this.blockSize, a = 4 * o, c = n / a; c = r ? t.ceil(c) : t.max((0 | c) - this._minBufferSize, 0); var h = c * o, l = t.min(4 * h, n); if (h) { for (var f = 0; f < h; f += o)this._doProcessBlock(i, f); var u = i.splice(0, h); e.sigBytes -= l } return new s.init(u, l) }, clone: function () { var t = o.clone.call(this); return t._data = this._data.clone(), t }, _minBufferSize: 0 }), u = (n.Hasher = f.extend({ cfg: o.extend(), init: function (t) { this.cfg = this.cfg.extend(t), this.reset() }, reset: function () { f.reset.call(this), this._doReset() }, update: function (t) { return this._append(t), this._process(), this }, finalize: function (t) { t && this._append(t); var r = this._doFinalize(); return r }, blockSize: 16, _createHelper: function (t) { return function (r, e) { return new t.init(e).finalize(r) } }, _createHmacHelper: function (t) { return function (r, e) { return new u.HMAC.init(t, e).finalize(r) } } }), i.algo = {}); return i }(Math); return function () { function r(t, r, e) { for (var i = [], o = 0, s = 0; s < r; s++)if (s % 4) { var a = e[t.charCodeAt(s - 1)] << s % 4 * 2, c = e[t.charCodeAt(s)] >>> 6 - s % 4 * 2; i[o >>> 2] |= (a | c) << 24 - o % 4 * 8, o++ } return n.create(i, o) } var e = t, i = e.lib, n = i.WordArray, o = e.enc; o.Base64 = { stringify: function (t) { var r = t.words, e = t.sigBytes, i = this._map; t.clamp(); for (var n = [], o = 0; o < e; o += 3)for (var s = r[o >>> 2] >>> 24 - o % 4 * 8 & 255, a = r[o + 1 >>> 2] >>> 24 - (o + 1) % 4 * 8 & 255, c = r[o + 2 >>> 2] >>> 24 - (o + 2) % 4 * 8 & 255, h = s << 16 | a << 8 | c, l = 0; l < 4 && o + .75 * l < e; l++)n.push(i.charAt(h >>> 6 * (3 - l) & 63)); var f = i.charAt(64); if (f) for (; n.length % 4;)n.push(f); return n.join("") }, parse: function (t) { var e = t.length, i = this._map, n = this._reverseMap; if (!n) { n = this._reverseMap = []; for (var o = 0; o < i.length; o++)n[i.charCodeAt(o)] = o } var s = i.charAt(64); if (s) { var a = t.indexOf(s); a !== -1 && (e = a) } return r(t, e, n) }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" } }(), function (r) { function e(t, r, e, i, n, o, s) { var a = t + (r & e | ~r & i) + n + s; return (a << o | a >>> 32 - o) + r } function i(t, r, e, i, n, o, s) { var a = t + (r & i | e & ~i) + n + s; return (a << o | a >>> 32 - o) + r } function n(t, r, e, i, n, o, s) { var a = t + (r ^ e ^ i) + n + s; return (a << o | a >>> 32 - o) + r } function o(t, r, e, i, n, o, s) { var a = t + (e ^ (r | ~i)) + n + s; return (a << o | a >>> 32 - o) + r } var s = t, a = s.lib, c = a.WordArray, h = a.Hasher, l = s.algo, f = []; !function () { for (var t = 0; t < 64; t++)f[t] = 4294967296 * r.abs(r.sin(t + 1)) | 0 }(); var u = l.MD5 = h.extend({ _doReset: function () { this._hash = new c.init([1732584193, 4023233417, 2562383102, 271733878]) }, _doProcessBlock: function (t, r) { for (var s = 0; s < 16; s++) { var a = r + s, c = t[a]; t[a] = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8) } var h = this._hash.words, l = t[r + 0], u = t[r + 1], d = t[r + 2], v = t[r + 3], p = t[r + 4], _ = t[r + 5], y = t[r + 6], g = t[r + 7], B = t[r + 8], w = t[r + 9], k = t[r + 10], S = t[r + 11], m = t[r + 12], x = t[r + 13], b = t[r + 14], H = t[r + 15], z = h[0], A = h[1], C = h[2], D = h[3]; z = e(z, A, C, D, l, 7, f[0]), D = e(D, z, A, C, u, 12, f[1]), C = e(C, D, z, A, d, 17, f[2]), A = e(A, C, D, z, v, 22, f[3]), z = e(z, A, C, D, p, 7, f[4]), D = e(D, z, A, C, _, 12, f[5]), C = e(C, D, z, A, y, 17, f[6]), A = e(A, C, D, z, g, 22, f[7]), z = e(z, A, C, D, B, 7, f[8]), D = e(D, z, A, C, w, 12, f[9]), C = e(C, D, z, A, k, 17, f[10]), A = e(A, C, D, z, S, 22, f[11]), z = e(z, A, C, D, m, 7, f[12]), D = e(D, z, A, C, x, 12, f[13]), C = e(C, D, z, A, b, 17, f[14]), A = e(A, C, D, z, H, 22, f[15]), z = i(z, A, C, D, u, 5, f[16]), D = i(D, z, A, C, y, 9, f[17]), C = i(C, D, z, A, S, 14, f[18]), A = i(A, C, D, z, l, 20, f[19]), z = i(z, A, C, D, _, 5, f[20]), D = i(D, z, A, C, k, 9, f[21]), C = i(C, D, z, A, H, 14, f[22]), A = i(A, C, D, z, p, 20, f[23]), z = i(z, A, C, D, w, 5, f[24]), D = i(D, z, A, C, b, 9, f[25]), C = i(C, D, z, A, v, 14, f[26]), A = i(A, C, D, z, B, 20, f[27]), z = i(z, A, C, D, x, 5, f[28]), D = i(D, z, A, C, d, 9, f[29]), C = i(C, D, z, A, g, 14, f[30]), A = i(A, C, D, z, m, 20, f[31]), z = n(z, A, C, D, _, 4, f[32]), D = n(D, z, A, C, B, 11, f[33]), C = n(C, D, z, A, S, 16, f[34]), A = n(A, C, D, z, b, 23, f[35]), z = n(z, A, C, D, u, 4, f[36]), D = n(D, z, A, C, p, 11, f[37]), C = n(C, D, z, A, g, 16, f[38]), A = n(A, C, D, z, k, 23, f[39]), z = n(z, A, C, D, x, 4, f[40]), D = n(D, z, A, C, l, 11, f[41]), C = n(C, D, z, A, v, 16, f[42]), A = n(A, C, D, z, y, 23, f[43]), z = n(z, A, C, D, w, 4, f[44]), D = n(D, z, A, C, m, 11, f[45]), C = n(C, D, z, A, H, 16, f[46]), A = n(A, C, D, z, d, 23, f[47]), z = o(z, A, C, D, l, 6, f[48]), D = o(D, z, A, C, g, 10, f[49]), C = o(C, D, z, A, b, 15, f[50]), A = o(A, C, D, z, _, 21, f[51]), z = o(z, A, C, D, m, 6, f[52]), D = o(D, z, A, C, v, 10, f[53]), C = o(C, D, z, A, k, 15, f[54]), A = o(A, C, D, z, u, 21, f[55]), z = o(z, A, C, D, B, 6, f[56]), D = o(D, z, A, C, H, 10, f[57]), C = o(C, D, z, A, y, 15, f[58]), A = o(A, C, D, z, x, 21, f[59]), z = o(z, A, C, D, p, 6, f[60]), D = o(D, z, A, C, S, 10, f[61]), C = o(C, D, z, A, d, 15, f[62]), A = o(A, C, D, z, w, 21, f[63]), h[0] = h[0] + z | 0, h[1] = h[1] + A | 0, h[2] = h[2] + C | 0, h[3] = h[3] + D | 0 }, _doFinalize: function () { var t = this._data, e = t.words, i = 8 * this._nDataBytes, n = 8 * t.sigBytes; e[n >>> 5] |= 128 << 24 - n % 32; var o = r.floor(i / 4294967296), s = i; e[(n + 64 >>> 9 << 4) + 15] = 16711935 & (o << 8 | o >>> 24) | 4278255360 & (o << 24 | o >>> 8), e[(n + 64 >>> 9 << 4) + 14] = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8), t.sigBytes = 4 * (e.length + 1), this._process(); for (var a = this._hash, c = a.words, h = 0; h < 4; h++) { var l = c[h]; c[h] = 16711935 & (l << 8 | l >>> 24) | 4278255360 & (l << 24 | l >>> 8) } return a }, clone: function () { var t = h.clone.call(this); return t._hash = this._hash.clone(), t } }); s.MD5 = h._createHelper(u), s.HmacMD5 = h._createHmacHelper(u) }(Math), function () { var r = t, e = r.lib, i = e.WordArray, n = e.Hasher, o = r.algo, s = [], a = o.SHA1 = n.extend({ _doReset: function () { this._hash = new i.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520]) }, _doProcessBlock: function (t, r) { for (var e = this._hash.words, i = e[0], n = e[1], o = e[2], a = e[3], c = e[4], h = 0; h < 80; h++) { if (h < 16) s[h] = 0 | t[r + h]; else { var l = s[h - 3] ^ s[h - 8] ^ s[h - 14] ^ s[h - 16]; s[h] = l << 1 | l >>> 31 } var f = (i << 5 | i >>> 27) + c + s[h]; f += h < 20 ? (n & o | ~n & a) + 1518500249 : h < 40 ? (n ^ o ^ a) + 1859775393 : h < 60 ? (n & o | n & a | o & a) - 1894007588 : (n ^ o ^ a) - 899497514, c = a, a = o, o = n << 30 | n >>> 2, n = i, i = f } e[0] = e[0] + i | 0, e[1] = e[1] + n | 0, e[2] = e[2] + o | 0, e[3] = e[3] + a | 0, e[4] = e[4] + c | 0 }, _doFinalize: function () { var t = this._data, r = t.words, e = 8 * this._nDataBytes, i = 8 * t.sigBytes; return r[i >>> 5] |= 128 << 24 - i % 32, r[(i + 64 >>> 9 << 4) + 14] = Math.floor(e / 4294967296), r[(i + 64 >>> 9 << 4) + 15] = e, t.sigBytes = 4 * r.length, this._process(), this._hash }, clone: function () { var t = n.clone.call(this); return t._hash = this._hash.clone(), t } }); r.SHA1 = n._createHelper(a), r.HmacSHA1 = n._createHmacHelper(a) }(), function (r) { var e = t, i = e.lib, n = i.WordArray, o = i.Hasher, s = e.algo, a = [], c = []; !function () { function t(t) { for (var e = r.sqrt(t), i = 2; i <= e; i++)if (!(t % i)) return !1; return !0 } function e(t) { return 4294967296 * (t - (0 | t)) | 0 } for (var i = 2, n = 0; n < 64;)t(i) && (n < 8 && (a[n] = e(r.pow(i, .5))), c[n] = e(r.pow(i, 1 / 3)), n++), i++ }(); var h = [], l = s.SHA256 = o.extend({ _doReset: function () { this._hash = new n.init(a.slice(0)) }, _doProcessBlock: function (t, r) { for (var e = this._hash.words, i = e[0], n = e[1], o = e[2], s = e[3], a = e[4], l = e[5], f = e[6], u = e[7], d = 0; d < 64; d++) { if (d < 16) h[d] = 0 | t[r + d]; else { var v = h[d - 15], p = (v << 25 | v >>> 7) ^ (v << 14 | v >>> 18) ^ v >>> 3, _ = h[d - 2], y = (_ << 15 | _ >>> 17) ^ (_ << 13 | _ >>> 19) ^ _ >>> 10; h[d] = p + h[d - 7] + y + h[d - 16] } var g = a & l ^ ~a & f, B = i & n ^ i & o ^ n & o, w = (i << 30 | i >>> 2) ^ (i << 19 | i >>> 13) ^ (i << 10 | i >>> 22), k = (a << 26 | a >>> 6) ^ (a << 21 | a >>> 11) ^ (a << 7 | a >>> 25), S = u + k + g + c[d] + h[d], m = w + B; u = f, f = l, l = a, a = s + S | 0, s = o, o = n, n = i, i = S + m | 0 } e[0] = e[0] + i | 0, e[1] = e[1] + n | 0, e[2] = e[2] + o | 0, e[3] = e[3] + s | 0, e[4] = e[4] + a | 0, e[5] = e[5] + l | 0, e[6] = e[6] + f | 0, e[7] = e[7] + u | 0 }, _doFinalize: function () { var t = this._data, e = t.words, i = 8 * this._nDataBytes, n = 8 * t.sigBytes; return e[n >>> 5] |= 128 << 24 - n % 32, e[(n + 64 >>> 9 << 4) + 14] = r.floor(i / 4294967296), e[(n + 64 >>> 9 << 4) + 15] = i, t.sigBytes = 4 * e.length, this._process(), this._hash }, clone: function () { var t = o.clone.call(this); return t._hash = this._hash.clone(), t } }); e.SHA256 = o._createHelper(l), e.HmacSHA256 = o._createHmacHelper(l) }(Math), function () { function r(t) { return t << 8 & 4278255360 | t >>> 8 & 16711935 } var e = t, i = e.lib, n = i.WordArray, o = e.enc; o.Utf16 = o.Utf16BE = { stringify: function (t) { for (var r = t.words, e = t.sigBytes, i = [], n = 0; n < e; n += 2) { var o = r[n >>> 2] >>> 16 - n % 4 * 8 & 65535; i.push(String.fromCharCode(o)) } return i.join("") }, parse: function (t) { for (var r = t.length, e = [], i = 0; i < r; i++)e[i >>> 1] |= t.charCodeAt(i) << 16 - i % 2 * 16; return n.create(e, 2 * r) } }; o.Utf16LE = { stringify: function (t) { for (var e = t.words, i = t.sigBytes, n = [], o = 0; o < i; o += 2) { var s = r(e[o >>> 2] >>> 16 - o % 4 * 8 & 65535); n.push(String.fromCharCode(s)) } return n.join("") }, parse: function (t) { for (var e = t.length, i = [], o = 0; o < e; o++)i[o >>> 1] |= r(t.charCodeAt(o) << 16 - o % 2 * 16); return n.create(i, 2 * e) } } }(), function () { if ("function" == typeof ArrayBuffer) { var r = t, e = r.lib, i = e.WordArray, n = i.init, o = i.init = function (t) { if (t instanceof ArrayBuffer && (t = new Uint8Array(t)), (t instanceof Int8Array || "undefined" != typeof Uint8ClampedArray && t instanceof Uint8ClampedArray || t instanceof Int16Array || t instanceof Uint16Array || t instanceof Int32Array || t instanceof Uint32Array || t instanceof Float32Array || t instanceof Float64Array) && (t = new Uint8Array(t.buffer, t.byteOffset, t.byteLength)), t instanceof Uint8Array) { for (var r = t.byteLength, e = [], i = 0; i < r; i++)e[i >>> 2] |= t[i] << 24 - i % 4 * 8; n.call(this, e, r) } else n.apply(this, arguments) }; o.prototype = i } }(), function (r) { function e(t, r, e) { return t ^ r ^ e } function i(t, r, e) { return t & r | ~t & e } function n(t, r, e) { return (t | ~r) ^ e } function o(t, r, e) { return t & e | r & ~e } function s(t, r, e) { return t ^ (r | ~e) } function a(t, r) { return t << r | t >>> 32 - r } var c = t, h = c.lib, l = h.WordArray, f = h.Hasher, u = c.algo, d = l.create([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13]), v = l.create([5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11]), p = l.create([11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6]), _ = l.create([8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11]), y = l.create([0, 1518500249, 1859775393, 2400959708, 2840853838]), g = l.create([1352829926, 1548603684, 1836072691, 2053994217, 0]), B = u.RIPEMD160 = f.extend({ _doReset: function () { this._hash = l.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520]) }, _doProcessBlock: function (t, r) { for (var c = 0; c < 16; c++) { var h = r + c, l = t[h]; t[h] = 16711935 & (l << 8 | l >>> 24) | 4278255360 & (l << 24 | l >>> 8) } var f, u, B, w, k, S, m, x, b, H, z = this._hash.words, A = y.words, C = g.words, D = d.words, R = v.words, E = p.words, M = _.words; S = f = z[0], m = u = z[1], x = B = z[2], b = w = z[3], H = k = z[4]; for (var F, c = 0; c < 80; c += 1)F = f + t[r + D[c]] | 0, F += c < 16 ? e(u, B, w) + A[0] : c < 32 ? i(u, B, w) + A[1] : c < 48 ? n(u, B, w) + A[2] : c < 64 ? o(u, B, w) + A[3] : s(u, B, w) + A[4], F |= 0, F = a(F, E[c]), F = F + k | 0, f = k, k = w, w = a(B, 10), B = u, u = F, F = S + t[r + R[c]] | 0, F += c < 16 ? s(m, x, b) + C[0] : c < 32 ? o(m, x, b) + C[1] : c < 48 ? n(m, x, b) + C[2] : c < 64 ? i(m, x, b) + C[3] : e(m, x, b) + C[4], F |= 0, F = a(F, M[c]), F = F + H | 0, S = H, H = b, b = a(x, 10), x = m, m = F; F = z[1] + B + b | 0, z[1] = z[2] + w + H | 0, z[2] = z[3] + k + S | 0, z[3] = z[4] + f + m | 0, z[4] = z[0] + u + x | 0, z[0] = F }, _doFinalize: function () { var t = this._data, r = t.words, e = 8 * this._nDataBytes, i = 8 * t.sigBytes; r[i >>> 5] |= 128 << 24 - i % 32, r[(i + 64 >>> 9 << 4) + 14] = 16711935 & (e << 8 | e >>> 24) | 4278255360 & (e << 24 | e >>> 8), t.sigBytes = 4 * (r.length + 1), this._process(); for (var n = this._hash, o = n.words, s = 0; s < 5; s++) { var a = o[s]; o[s] = 16711935 & (a << 8 | a >>> 24) | 4278255360 & (a << 24 | a >>> 8) } return n }, clone: function () { var t = f.clone.call(this); return t._hash = this._hash.clone(), t } }); c.RIPEMD160 = f._createHelper(B), c.HmacRIPEMD160 = f._createHmacHelper(B) }(Math), function () { var r = t, e = r.lib, i = e.Base, n = r.enc, o = n.Utf8, s = r.algo; s.HMAC = i.extend({ init: function (t, r) { t = this._hasher = new t.init, "string" == typeof r && (r = o.parse(r)); var e = t.blockSize, i = 4 * e; r.sigBytes > i && (r = t.finalize(r)), r.clamp(); for (var n = this._oKey = r.clone(), s = this._iKey = r.clone(), a = n.words, c = s.words, h = 0; h < e; h++)a[h] ^= 1549556828, c[h] ^= 909522486; n.sigBytes = s.sigBytes = i, this.reset() }, reset: function () { var t = this._hasher; t.reset(), t.update(this._iKey) }, update: function (t) { return this._hasher.update(t), this }, finalize: function (t) { var r = this._hasher, e = r.finalize(t); r.reset(); var i = r.finalize(this._oKey.clone().concat(e)); return i } }) }(), function () { var r = t, e = r.lib, i = e.Base, n = e.WordArray, o = r.algo, s = o.SHA1, a = o.HMAC, c = o.PBKDF2 = i.extend({ cfg: i.extend({ keySize: 4, hasher: s, iterations: 1 }), init: function (t) { this.cfg = this.cfg.extend(t) }, compute: function (t, r) { for (var e = this.cfg, i = a.create(e.hasher, t), o = n.create(), s = n.create([1]), c = o.words, h = s.words, l = e.keySize, f = e.iterations; c.length < l;) { var u = i.update(r).finalize(s); i.reset(); for (var d = u.words, v = d.length, p = u, _ = 1; _ < f; _++) { p = i.finalize(p), i.reset(); for (var y = p.words, g = 0; g < v; g++)d[g] ^= y[g] } o.concat(u), h[0]++ } return o.sigBytes = 4 * l, o } }); r.PBKDF2 = function (t, r, e) { return c.create(e).compute(t, r) } }(), function () { var r = t, e = r.lib, i = e.Base, n = e.WordArray, o = r.algo, s = o.MD5, a = o.EvpKDF = i.extend({ cfg: i.extend({ keySize: 4, hasher: s, iterations: 1 }), init: function (t) { this.cfg = this.cfg.extend(t) }, compute: function (t, r) { for (var e = this.cfg, i = e.hasher.create(), o = n.create(), s = o.words, a = e.keySize, c = e.iterations; s.length < a;) { h && i.update(h); var h = i.update(t).finalize(r); i.reset(); for (var l = 1; l < c; l++)h = i.finalize(h), i.reset(); o.concat(h) } return o.sigBytes = 4 * a, o } }); r.EvpKDF = function (t, r, e) { return a.create(e).compute(t, r) } }(), function () { var r = t, e = r.lib, i = e.WordArray, n = r.algo, o = n.SHA256, s = n.SHA224 = o.extend({ _doReset: function () { this._hash = new i.init([3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428]) }, _doFinalize: function () { var t = o._doFinalize.call(this); return t.sigBytes -= 4, t } }); r.SHA224 = o._createHelper(s), r.HmacSHA224 = o._createHmacHelper(s) }(), function (r) { var e = t, i = e.lib, n = i.Base, o = i.WordArray, s = e.x64 = {}; s.Word = n.extend({ init: function (t, r) { this.high = t, this.low = r } }), s.WordArray = n.extend({ init: function (t, e) { t = this.words = t || [], e != r ? this.sigBytes = e : this.sigBytes = 8 * t.length }, toX32: function () { for (var t = this.words, r = t.length, e = [], i = 0; i < r; i++) { var n = t[i]; e.push(n.high), e.push(n.low) } return o.create(e, this.sigBytes) }, clone: function () { for (var t = n.clone.call(this), r = t.words = this.words.slice(0), e = r.length, i = 0; i < e; i++)r[i] = r[i].clone(); return t } }) }(), function (r) { var e = t, i = e.lib, n = i.WordArray, o = i.Hasher, s = e.x64, a = s.Word, c = e.algo, h = [], l = [], f = []; !function () { for (var t = 1, r = 0, e = 0; e < 24; e++) { h[t + 5 * r] = (e + 1) * (e + 2) / 2 % 64; var i = r % 5, n = (2 * t + 3 * r) % 5; t = i, r = n } for (var t = 0; t < 5; t++)for (var r = 0; r < 5; r++)l[t + 5 * r] = r + (2 * t + 3 * r) % 5 * 5; for (var o = 1, s = 0; s < 24; s++) { for (var c = 0, u = 0, d = 0; d < 7; d++) { if (1 & o) { var v = (1 << d) - 1; v < 32 ? u ^= 1 << v : c ^= 1 << v - 32 } 128 & o ? o = o << 1 ^ 113 : o <<= 1 } f[s] = a.create(c, u) } }(); var u = []; !function () { for (var t = 0; t < 25; t++)u[t] = a.create() }(); var d = c.SHA3 = o.extend({ cfg: o.cfg.extend({ outputLength: 512 }), _doReset: function () { for (var t = this._state = [], r = 0; r < 25; r++)t[r] = new a.init; this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32 }, _doProcessBlock: function (t, r) { for (var e = this._state, i = this.blockSize / 2, n = 0; n < i; n++) { var o = t[r + 2 * n], s = t[r + 2 * n + 1]; o = 16711935 & (o << 8 | o >>> 24) | 4278255360 & (o << 24 | o >>> 8), s = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8); var a = e[n]; a.high ^= s, a.low ^= o } for (var c = 0; c < 24; c++) { for (var d = 0; d < 5; d++) { for (var v = 0, p = 0, _ = 0; _ < 5; _++) { var a = e[d + 5 * _]; v ^= a.high, p ^= a.low } var y = u[d]; y.high = v, y.low = p } for (var d = 0; d < 5; d++)for (var g = u[(d + 4) % 5], B = u[(d + 1) % 5], w = B.high, k = B.low, v = g.high ^ (w << 1 | k >>> 31), p = g.low ^ (k << 1 | w >>> 31), _ = 0; _ < 5; _++) { var a = e[d + 5 * _]; a.high ^= v, a.low ^= p } for (var S = 1; S < 25; S++) { var a = e[S], m = a.high, x = a.low, b = h[S]; if (b < 32) var v = m << b | x >>> 32 - b, p = x << b | m >>> 32 - b; else var v = x << b - 32 | m >>> 64 - b, p = m << b - 32 | x >>> 64 - b; var H = u[l[S]]; H.high = v, H.low = p } var z = u[0], A = e[0]; z.high = A.high, z.low = A.low; for (var d = 0; d < 5; d++)for (var _ = 0; _ < 5; _++) { var S = d + 5 * _, a = e[S], C = u[S], D = u[(d + 1) % 5 + 5 * _], R = u[(d + 2) % 5 + 5 * _]; a.high = C.high ^ ~D.high & R.high, a.low = C.low ^ ~D.low & R.low } var a = e[0], E = f[c]; a.high ^= E.high, a.low ^= E.low } }, _doFinalize: function () { var t = this._data, e = t.words, i = (8 * this._nDataBytes, 8 * t.sigBytes), o = 32 * this.blockSize; e[i >>> 5] |= 1 << 24 - i % 32, e[(r.ceil((i + 1) / o) * o >>> 5) - 1] |= 128, t.sigBytes = 4 * e.length, this._process(); for (var s = this._state, a = this.cfg.outputLength / 8, c = a / 8, h = [], l = 0; l < c; l++) { var f = s[l], u = f.high, d = f.low; u = 16711935 & (u << 8 | u >>> 24) | 4278255360 & (u << 24 | u >>> 8), d = 16711935 & (d << 8 | d >>> 24) | 4278255360 & (d << 24 | d >>> 8), h.push(d), h.push(u) } return new n.init(h, a) }, clone: function () { for (var t = o.clone.call(this), r = t._state = this._state.slice(0), e = 0; e < 25; e++)r[e] = r[e].clone(); return t } }); e.SHA3 = o._createHelper(d), e.HmacSHA3 = o._createHmacHelper(d) }(Math), function () { function r() { return s.create.apply(s, arguments) } var e = t, i = e.lib, n = i.Hasher, o = e.x64, s = o.Word, a = o.WordArray, c = e.algo, h = [r(1116352408, 3609767458), r(1899447441, 602891725), r(3049323471, 3964484399), r(3921009573, 2173295548), r(961987163, 4081628472), r(1508970993, 3053834265), r(2453635748, 2937671579), r(2870763221, 3664609560), r(3624381080, 2734883394), r(310598401, 1164996542), r(607225278, 1323610764), r(1426881987, 3590304994), r(1925078388, 4068182383), r(2162078206, 991336113), r(2614888103, 633803317), r(3248222580, 3479774868), r(3835390401, 2666613458), r(4022224774, 944711139), r(264347078, 2341262773), r(604807628, 2007800933), r(770255983, 1495990901), r(1249150122, 1856431235), r(1555081692, 3175218132), r(1996064986, 2198950837), r(2554220882, 3999719339), r(2821834349, 766784016), r(2952996808, 2566594879), r(3210313671, 3203337956), r(3336571891, 1034457026), r(3584528711, 2466948901), r(113926993, 3758326383), r(338241895, 168717936), r(666307205, 1188179964), r(773529912, 1546045734), r(1294757372, 1522805485), r(1396182291, 2643833823), r(1695183700, 2343527390), r(1986661051, 1014477480), r(2177026350, 1206759142), r(2456956037, 344077627), r(2730485921, 1290863460), r(2820302411, 3158454273), r(3259730800, 3505952657), r(3345764771, 106217008), r(3516065817, 3606008344), r(3600352804, 1432725776), r(4094571909, 1467031594), r(275423344, 851169720), r(430227734, 3100823752), r(506948616, 1363258195), r(659060556, 3750685593), r(883997877, 3785050280), r(958139571, 3318307427), r(1322822218, 3812723403), r(1537002063, 2003034995), r(1747873779, 3602036899), r(1955562222, 1575990012), r(2024104815, 1125592928), r(2227730452, 2716904306), r(2361852424, 442776044), r(2428436474, 593698344), r(2756734187, 3733110249), r(3204031479, 2999351573), r(3329325298, 3815920427), r(3391569614, 3928383900), r(3515267271, 566280711), r(3940187606, 3454069534), r(4118630271, 4000239992), r(116418474, 1914138554), r(174292421, 2731055270), r(289380356, 3203993006), r(460393269, 320620315), r(685471733, 587496836), r(852142971, 1086792851), r(1017036298, 365543100), r(1126000580, 2618297676), r(1288033470, 3409855158), r(1501505948, 4234509866), r(1607167915, 987167468), r(1816402316, 1246189591)], l = []; !function () { for (var t = 0; t < 80; t++)l[t] = r() }(); var f = c.SHA512 = n.extend({ _doReset: function () { this._hash = new a.init([new s.init(1779033703, 4089235720), new s.init(3144134277, 2227873595), new s.init(1013904242, 4271175723), new s.init(2773480762, 1595750129), new s.init(1359893119, 2917565137), new s.init(2600822924, 725511199), new s.init(528734635, 4215389547), new s.init(1541459225, 327033209)]) }, _doProcessBlock: function (t, r) { for (var e = this._hash.words, i = e[0], n = e[1], o = e[2], s = e[3], a = e[4], c = e[5], f = e[6], u = e[7], d = i.high, v = i.low, p = n.high, _ = n.low, y = o.high, g = o.low, B = s.high, w = s.low, k = a.high, S = a.low, m = c.high, x = c.low, b = f.high, H = f.low, z = u.high, A = u.low, C = d, D = v, R = p, E = _, M = y, F = g, P = B, W = w, O = k, U = S, I = m, K = x, X = b, L = H, j = z, N = A, T = 0; T < 80; T++) { var Z = l[T]; if (T < 16) var q = Z.high = 0 | t[r + 2 * T], G = Z.low = 0 | t[r + 2 * T + 1]; else { var J = l[T - 15], $ = J.high, Q = J.low, V = ($ >>> 1 | Q << 31) ^ ($ >>> 8 | Q << 24) ^ $ >>> 7, Y = (Q >>> 1 | $ << 31) ^ (Q >>> 8 | $ << 24) ^ (Q >>> 7 | $ << 25), tt = l[T - 2], rt = tt.high, et = tt.low, it = (rt >>> 19 | et << 13) ^ (rt << 3 | et >>> 29) ^ rt >>> 6, nt = (et >>> 19 | rt << 13) ^ (et << 3 | rt >>> 29) ^ (et >>> 6 | rt << 26), ot = l[T - 7], st = ot.high, at = ot.low, ct = l[T - 16], ht = ct.high, lt = ct.low, G = Y + at, q = V + st + (G >>> 0 < Y >>> 0 ? 1 : 0), G = G + nt, q = q + it + (G >>> 0 < nt >>> 0 ? 1 : 0), G = G + lt, q = q + ht + (G >>> 0 < lt >>> 0 ? 1 : 0); Z.high = q, Z.low = G } var ft = O & I ^ ~O & X, ut = U & K ^ ~U & L, dt = C & R ^ C & M ^ R & M, vt = D & E ^ D & F ^ E & F, pt = (C >>> 28 | D << 4) ^ (C << 30 | D >>> 2) ^ (C << 25 | D >>> 7), _t = (D >>> 28 | C << 4) ^ (D << 30 | C >>> 2) ^ (D << 25 | C >>> 7), yt = (O >>> 14 | U << 18) ^ (O >>> 18 | U << 14) ^ (O << 23 | U >>> 9), gt = (U >>> 14 | O << 18) ^ (U >>> 18 | O << 14) ^ (U << 23 | O >>> 9), Bt = h[T], wt = Bt.high, kt = Bt.low, St = N + gt, mt = j + yt + (St >>> 0 < N >>> 0 ? 1 : 0), St = St + ut, mt = mt + ft + (St >>> 0 < ut >>> 0 ? 1 : 0), St = St + kt, mt = mt + wt + (St >>> 0 < kt >>> 0 ? 1 : 0), St = St + G, mt = mt + q + (St >>> 0 < G >>> 0 ? 1 : 0), xt = _t + vt, bt = pt + dt + (xt >>> 0 < _t >>> 0 ? 1 : 0); j = X, N = L, X = I, L = K, I = O, K = U, U = W + St | 0, O = P + mt + (U >>> 0 < W >>> 0 ? 1 : 0) | 0, P = M, W = F, M = R, F = E, R = C, E = D, D = St + xt | 0, C = mt + bt + (D >>> 0 < St >>> 0 ? 1 : 0) | 0 } v = i.low = v + D, i.high = d + C + (v >>> 0 < D >>> 0 ? 1 : 0), _ = n.low = _ + E, n.high = p + R + (_ >>> 0 < E >>> 0 ? 1 : 0), g = o.low = g + F, o.high = y + M + (g >>> 0 < F >>> 0 ? 1 : 0), w = s.low = w + W, s.high = B + P + (w >>> 0 < W >>> 0 ? 1 : 0), S = a.low = S + U, a.high = k + O + (S >>> 0 < U >>> 0 ? 1 : 0), x = c.low = x + K, c.high = m + I + (x >>> 0 < K >>> 0 ? 1 : 0), H = f.low = H + L, f.high = b + X + (H >>> 0 < L >>> 0 ? 1 : 0), A = u.low = A + N, u.high = z + j + (A >>> 0 < N >>> 0 ? 1 : 0) }, _doFinalize: function () { var t = this._data, r = t.words, e = 8 * this._nDataBytes, i = 8 * t.sigBytes; r[i >>> 5] |= 128 << 24 - i % 32, r[(i + 128 >>> 10 << 5) + 30] = Math.floor(e / 4294967296), r[(i + 128 >>> 10 << 5) + 31] = e, t.sigBytes = 4 * r.length, this._process(); var n = this._hash.toX32(); return n }, clone: function () { var t = n.clone.call(this); return t._hash = this._hash.clone(), t }, blockSize: 32 }); e.SHA512 = n._createHelper(f), e.HmacSHA512 = n._createHmacHelper(f) }(), function () { var r = t, e = r.x64, i = e.Word, n = e.WordArray, o = r.algo, s = o.SHA512, a = o.SHA384 = s.extend({ _doReset: function () { this._hash = new n.init([new i.init(3418070365, 3238371032), new i.init(1654270250, 914150663), new i.init(2438529370, 812702999), new i.init(355462360, 4144912697), new i.init(1731405415, 4290775857), new i.init(2394180231, 1750603025), new i.init(3675008525, 1694076839), new i.init(1203062813, 3204075428)]) }, _doFinalize: function () { var t = s._doFinalize.call(this); return t.sigBytes -= 16, t } }); r.SHA384 = s._createHelper(a), r.HmacSHA384 = s._createHmacHelper(a) }(), t.lib.Cipher || function (r) { var e = t, i = e.lib, n = i.Base, o = i.WordArray, s = i.BufferedBlockAlgorithm, a = e.enc, c = (a.Utf8, a.Base64), h = e.algo, l = h.EvpKDF, f = i.Cipher = s.extend({ cfg: n.extend(), createEncryptor: function (t, r) { return this.create(this._ENC_XFORM_MODE, t, r) }, createDecryptor: function (t, r) { return this.create(this._DEC_XFORM_MODE, t, r) }, init: function (t, r, e) { this.cfg = this.cfg.extend(e), this._xformMode = t, this._key = r, this.reset() }, reset: function () { s.reset.call(this), this._doReset() }, process: function (t) { return this._append(t), this._process() }, finalize: function (t) { t && this._append(t); var r = this._doFinalize(); return r }, keySize: 4, ivSize: 4, _ENC_XFORM_MODE: 1, _DEC_XFORM_MODE: 2, _createHelper: function () { function t(t) { return "string" == typeof t ? m : w } return function (r) { return { encrypt: function (e, i, n) { return t(i).encrypt(r, e, i, n) }, decrypt: function (e, i, n) { return t(i).decrypt(r, e, i, n) } } } }() }), u = (i.StreamCipher = f.extend({ _doFinalize: function () { var t = this._process(!0); return t }, blockSize: 1 }), e.mode = {}), d = i.BlockCipherMode = n.extend({ createEncryptor: function (t, r) { return this.Encryptor.create(t, r) }, createDecryptor: function (t, r) { return this.Decryptor.create(t, r) }, init: function (t, r) { this._cipher = t, this._iv = r } }), v = u.CBC = function () { function t(t, e, i) { var n = this._iv; if (n) { var o = n; this._iv = r } else var o = this._prevBlock; for (var s = 0; s < i; s++)t[e + s] ^= o[s] } var e = d.extend(); return e.Encryptor = e.extend({ processBlock: function (r, e) { var i = this._cipher, n = i.blockSize; t.call(this, r, e, n), i.encryptBlock(r, e), this._prevBlock = r.slice(e, e + n) } }), e.Decryptor = e.extend({ processBlock: function (r, e) { var i = this._cipher, n = i.blockSize, o = r.slice(e, e + n); i.decryptBlock(r, e), t.call(this, r, e, n), this._prevBlock = o } }), e }(), p = e.pad = {}, _ = p.Pkcs7 = { pad: function (t, r) { for (var e = 4 * r, i = e - t.sigBytes % e, n = i << 24 | i << 16 | i << 8 | i, s = [], a = 0; a < i; a += 4)s.push(n); var c = o.create(s, i); t.concat(c) }, unpad: function (t) { var r = 255 & t.words[t.sigBytes - 1 >>> 2]; t.sigBytes -= r } }, y = (i.BlockCipher = f.extend({ cfg: f.cfg.extend({ mode: v, padding: _ }), reset: function () { f.reset.call(this); var t = this.cfg, r = t.iv, e = t.mode; if (this._xformMode == this._ENC_XFORM_MODE) var i = e.createEncryptor; else { var i = e.createDecryptor; this._minBufferSize = 1 } this._mode && this._mode.__creator == i ? this._mode.init(this, r && r.words) : (this._mode = i.call(e, this, r && r.words), this._mode.__creator = i) }, _doProcessBlock: function (t, r) { this._mode.processBlock(t, r) }, _doFinalize: function () { var t = this.cfg.padding; if (this._xformMode == this._ENC_XFORM_MODE) { t.pad(this._data, this.blockSize); var r = this._process(!0) } else { var r = this._process(!0); t.unpad(r) } return r }, blockSize: 4 }), i.CipherParams = n.extend({ init: function (t) { this.mixIn(t) }, toString: function (t) { return (t || this.formatter).stringify(this) } })), g = e.format = {}, B = g.OpenSSL = { stringify: function (t) { var r = t.ciphertext, e = t.salt; if (e) var i = o.create([1398893684, 1701076831]).concat(e).concat(r); else var i = r; return i.toString(c) }, parse: function (t) { var r = c.parse(t), e = r.words; if (1398893684 == e[0] && 1701076831 == e[1]) { var i = o.create(e.slice(2, 4)); e.splice(0, 4), r.sigBytes -= 16 } return y.create({ ciphertext: r, salt: i }) } }, w = i.SerializableCipher = n.extend({ cfg: n.extend({ format: B }), encrypt: function (t, r, e, i) { i = this.cfg.extend(i); var n = t.createEncryptor(e, i), o = n.finalize(r), s = n.cfg; return y.create({ ciphertext: o, key: e, iv: s.iv, algorithm: t, mode: s.mode, padding: s.padding, blockSize: t.blockSize, formatter: i.format }) }, decrypt: function (t, r, e, i) { i = this.cfg.extend(i), r = this._parse(r, i.format); var n = t.createDecryptor(e, i).finalize(r.ciphertext); return n }, _parse: function (t, r) { return "string" == typeof t ? r.parse(t, this) : t } }), k = e.kdf = {}, S = k.OpenSSL = { execute: function (t, r, e, i) { i || (i = o.random(8)); var n = l.create({ keySize: r + e }).compute(t, i), s = o.create(n.words.slice(r), 4 * e); return n.sigBytes = 4 * r, y.create({ key: n, iv: s, salt: i }) } }, m = i.PasswordBasedCipher = w.extend({ cfg: w.cfg.extend({ kdf: S }), encrypt: function (t, r, e, i) { i = this.cfg.extend(i); var n = i.kdf.execute(e, t.keySize, t.ivSize); i.iv = n.iv; var o = w.encrypt.call(this, t, r, n.key, i); return o.mixIn(n), o }, decrypt: function (t, r, e, i) { i = this.cfg.extend(i), r = this._parse(r, i.format); var n = i.kdf.execute(e, t.keySize, t.ivSize, r.salt); i.iv = n.iv; var o = w.decrypt.call(this, t, r, n.key, i); return o } }) }(), t.mode.CFB = function () { function r(t, r, e, i) { var n = this._iv; if (n) { var o = n.slice(0); this._iv = void 0 } else var o = this._prevBlock; i.encryptBlock(o, 0); for (var s = 0; s < e; s++)t[r + s] ^= o[s] } var e = t.lib.BlockCipherMode.extend(); return e.Encryptor = e.extend({ processBlock: function (t, e) { var i = this._cipher, n = i.blockSize; r.call(this, t, e, n, i), this._prevBlock = t.slice(e, e + n) } }), e.Decryptor = e.extend({ processBlock: function (t, e) { var i = this._cipher, n = i.blockSize, o = t.slice(e, e + n); r.call(this, t, e, n, i), this._prevBlock = o } }), e }(), t.mode.ECB = function () { var r = t.lib.BlockCipherMode.extend(); return r.Encryptor = r.extend({ processBlock: function (t, r) { this._cipher.encryptBlock(t, r) } }), r.Decryptor = r.extend({ processBlock: function (t, r) { this._cipher.decryptBlock(t, r) } }), r }(), t.pad.AnsiX923 = { pad: function (t, r) { var e = t.sigBytes, i = 4 * r, n = i - e % i, o = e + n - 1; t.clamp(), t.words[o >>> 2] |= n << 24 - o % 4 * 8, t.sigBytes += n }, unpad: function (t) { var r = 255 & t.words[t.sigBytes - 1 >>> 2]; t.sigBytes -= r } }, t.pad.Iso10126 = { pad: function (r, e) { var i = 4 * e, n = i - r.sigBytes % i; r.concat(t.lib.WordArray.random(n - 1)).concat(t.lib.WordArray.create([n << 24], 1)) }, unpad: function (t) { var r = 255 & t.words[t.sigBytes - 1 >>> 2]; t.sigBytes -= r } }, t.pad.Iso97971 = { pad: function (r, e) { r.concat(t.lib.WordArray.create([2147483648], 1)), t.pad.ZeroPadding.pad(r, e) }, unpad: function (r) { t.pad.ZeroPadding.unpad(r), r.sigBytes-- } }, t.mode.OFB = function () { var r = t.lib.BlockCipherMode.extend(), e = r.Encryptor = r.extend({ processBlock: function (t, r) { var e = this._cipher, i = e.blockSize, n = this._iv, o = this._keystream; n && (o = this._keystream = n.slice(0), this._iv = void 0), e.encryptBlock(o, 0); for (var s = 0; s < i; s++)t[r + s] ^= o[s] } }); return r.Decryptor = e, r }(), t.pad.NoPadding = { pad: function () { }, unpad: function () { } }, function (r) { var e = t, i = e.lib, n = i.CipherParams, o = e.enc, s = o.Hex, a = e.format; a.Hex = { stringify: function (t) { return t.ciphertext.toString(s) }, parse: function (t) { var r = s.parse(t); return n.create({ ciphertext: r }) } } }(), function () { var r = t, e = r.lib, i = e.BlockCipher, n = r.algo, o = [], s = [], a = [], c = [], h = [], l = [], f = [], u = [], d = [], v = []; !function () { for (var t = [], r = 0; r < 256; r++)r < 128 ? t[r] = r << 1 : t[r] = r << 1 ^ 283; for (var e = 0, i = 0, r = 0; r < 256; r++) { var n = i ^ i << 1 ^ i << 2 ^ i << 3 ^ i << 4; n = n >>> 8 ^ 255 & n ^ 99, o[e] = n, s[n] = e; var p = t[e], _ = t[p], y = t[_], g = 257 * t[n] ^ 16843008 * n; a[e] = g << 24 | g >>> 8, c[e] = g << 16 | g >>> 16, h[e] = g << 8 | g >>> 24, l[e] = g; var g = 16843009 * y ^ 65537 * _ ^ 257 * p ^ 16843008 * e; f[n] = g << 24 | g >>> 8, u[n] = g << 16 | g >>> 16, d[n] = g << 8 | g >>> 24, v[n] = g, e ? (e = p ^ t[t[t[y ^ p]]], i ^= t[t[i]]) : e = i = 1 } }(); var p = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], _ = n.AES = i.extend({ _doReset: function () { if (!this._nRounds || this._keyPriorReset !== this._key) { for (var t = this._keyPriorReset = this._key, r = t.words, e = t.sigBytes / 4, i = this._nRounds = e + 6, n = 4 * (i + 1), s = this._keySchedule = [], a = 0; a < n; a++)if (a < e) s[a] = r[a]; else { var c = s[a - 1]; a % e ? e > 6 && a % e == 4 && (c = o[c >>> 24] << 24 | o[c >>> 16 & 255] << 16 | o[c >>> 8 & 255] << 8 | o[255 & c]) : (c = c << 8 | c >>> 24, c = o[c >>> 24] << 24 | o[c >>> 16 & 255] << 16 | o[c >>> 8 & 255] << 8 | o[255 & c], c ^= p[a / e | 0] << 24), s[a] = s[a - e] ^ c } for (var h = this._invKeySchedule = [], l = 0; l < n; l++) { var a = n - l; if (l % 4) var c = s[a]; else var c = s[a - 4]; l < 4 || a <= 4 ? h[l] = c : h[l] = f[o[c >>> 24]] ^ u[o[c >>> 16 & 255]] ^ d[o[c >>> 8 & 255]] ^ v[o[255 & c]] } } }, encryptBlock: function (t, r) { this._doCryptBlock(t, r, this._keySchedule, a, c, h, l, o) }, decryptBlock: function (t, r) { var e = t[r + 1]; t[r + 1] = t[r + 3], t[r + 3] = e, this._doCryptBlock(t, r, this._invKeySchedule, f, u, d, v, s); var e = t[r + 1]; t[r + 1] = t[r + 3], t[r + 3] = e }, _doCryptBlock: function (t, r, e, i, n, o, s, a) { for (var c = this._nRounds, h = t[r] ^ e[0], l = t[r + 1] ^ e[1], f = t[r + 2] ^ e[2], u = t[r + 3] ^ e[3], d = 4, v = 1; v < c; v++) { var p = i[h >>> 24] ^ n[l >>> 16 & 255] ^ o[f >>> 8 & 255] ^ s[255 & u] ^ e[d++], _ = i[l >>> 24] ^ n[f >>> 16 & 255] ^ o[u >>> 8 & 255] ^ s[255 & h] ^ e[d++], y = i[f >>> 24] ^ n[u >>> 16 & 255] ^ o[h >>> 8 & 255] ^ s[255 & l] ^ e[d++], g = i[u >>> 24] ^ n[h >>> 16 & 255] ^ o[l >>> 8 & 255] ^ s[255 & f] ^ e[d++]; h = p, l = _, f = y, u = g } var p = (a[h >>> 24] << 24 | a[l >>> 16 & 255] << 16 | a[f >>> 8 & 255] << 8 | a[255 & u]) ^ e[d++], _ = (a[l >>> 24] << 24 | a[f >>> 16 & 255] << 16 | a[u >>> 8 & 255] << 8 | a[255 & h]) ^ e[d++], y = (a[f >>> 24] << 24 | a[u >>> 16 & 255] << 16 | a[h >>> 8 & 255] << 8 | a[255 & l]) ^ e[d++], g = (a[u >>> 24] << 24 | a[h >>> 16 & 255] << 16 | a[l >>> 8 & 255] << 8 | a[255 & f]) ^ e[d++]; t[r] = p, t[r + 1] = _, t[r + 2] = y, t[r + 3] = g }, keySize: 8 }); r.AES = i._createHelper(_) }(), function () {
    function r(t, r) { var e = (this._lBlock >>> t ^ this._rBlock) & r; this._rBlock ^= e, this._lBlock ^= e << t } function e(t, r) {
      var e = (this._rBlock >>> t ^ this._lBlock) & r; this._lBlock ^= e, this._rBlock ^= e << t;
    } var i = t, n = i.lib, o = n.WordArray, s = n.BlockCipher, a = i.algo, c = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4], h = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32], l = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28], f = [{ 0: 8421888, 268435456: 32768, 536870912: 8421378, 805306368: 2, 1073741824: 512, 1342177280: 8421890, 1610612736: 8389122, 1879048192: 8388608, 2147483648: 514, 2415919104: 8389120, 2684354560: 33280, 2952790016: 8421376, 3221225472: 32770, 3489660928: 8388610, 3758096384: 0, 4026531840: 33282, 134217728: 0, 402653184: 8421890, 671088640: 33282, 939524096: 32768, 1207959552: 8421888, 1476395008: 512, 1744830464: 8421378, 2013265920: 2, 2281701376: 8389120, 2550136832: 33280, 2818572288: 8421376, 3087007744: 8389122, 3355443200: 8388610, 3623878656: 32770, 3892314112: 514, 4160749568: 8388608, 1: 32768, 268435457: 2, 536870913: 8421888, 805306369: 8388608, 1073741825: 8421378, 1342177281: 33280, 1610612737: 512, 1879048193: 8389122, 2147483649: 8421890, 2415919105: 8421376, 2684354561: 8388610, 2952790017: 33282, 3221225473: 514, 3489660929: 8389120, 3758096385: 32770, 4026531841: 0, 134217729: 8421890, 402653185: 8421376, 671088641: 8388608, 939524097: 512, 1207959553: 32768, 1476395009: 8388610, 1744830465: 2, 2013265921: 33282, 2281701377: 32770, 2550136833: 8389122, 2818572289: 514, 3087007745: 8421888, 3355443201: 8389120, 3623878657: 0, 3892314113: 33280, 4160749569: 8421378 }, { 0: 1074282512, 16777216: 16384, 33554432: 524288, 50331648: 1074266128, 67108864: 1073741840, 83886080: 1074282496, 100663296: 1073758208, 117440512: 16, 134217728: 540672, 150994944: 1073758224, 167772160: 1073741824, 184549376: 540688, 201326592: 524304, 218103808: 0, 234881024: 16400, 251658240: 1074266112, 8388608: 1073758208, 25165824: 540688, 41943040: 16, 58720256: 1073758224, 75497472: 1074282512, 92274688: 1073741824, 109051904: 524288, 125829120: 1074266128, 142606336: 524304, 159383552: 0, 176160768: 16384, 192937984: 1074266112, 209715200: 1073741840, 226492416: 540672, 243269632: 1074282496, 260046848: 16400, 268435456: 0, 285212672: 1074266128, 301989888: 1073758224, 318767104: 1074282496, 335544320: 1074266112, 352321536: 16, 369098752: 540688, 385875968: 16384, 402653184: 16400, 419430400: 524288, 436207616: 524304, 452984832: 1073741840, 469762048: 540672, 486539264: 1073758208, 503316480: 1073741824, 520093696: 1074282512, 276824064: 540688, 293601280: 524288, 310378496: 1074266112, 327155712: 16384, 343932928: 1073758208, 360710144: 1074282512, 377487360: 16, 394264576: 1073741824, 411041792: 1074282496, 427819008: 1073741840, 444596224: 1073758224, 461373440: 524304, 478150656: 0, 494927872: 16400, 511705088: 1074266128, 528482304: 540672 }, { 0: 260, 1048576: 0, 2097152: 67109120, 3145728: 65796, 4194304: 65540, 5242880: 67108868, 6291456: 67174660, 7340032: 67174400, 8388608: 67108864, 9437184: 67174656, 10485760: 65792, 11534336: 67174404, 12582912: 67109124, 13631488: 65536, 14680064: 4, 15728640: 256, 524288: 67174656, 1572864: 67174404, 2621440: 0, 3670016: 67109120, 4718592: 67108868, 5767168: 65536, 6815744: 65540, 7864320: 260, 8912896: 4, 9961472: 256, 11010048: 67174400, 12058624: 65796, 13107200: 65792, 14155776: 67109124, 15204352: 67174660, 16252928: 67108864, 16777216: 67174656, 17825792: 65540, 18874368: 65536, 19922944: 67109120, 20971520: 256, 22020096: 67174660, 23068672: 67108868, 24117248: 0, 25165824: 67109124, 26214400: 67108864, 27262976: 4, 28311552: 65792, 29360128: 67174400, 30408704: 260, 31457280: 65796, 32505856: 67174404, 17301504: 67108864, 18350080: 260, 19398656: 67174656, 20447232: 0, 21495808: 65540, 22544384: 67109120, 23592960: 256, 24641536: 67174404, 25690112: 65536, 26738688: 67174660, 27787264: 65796, 28835840: 67108868, 29884416: 67109124, 30932992: 67174400, 31981568: 4, 33030144: 65792 }, { 0: 2151682048, 65536: 2147487808, 131072: 4198464, 196608: 2151677952, 262144: 0, 327680: 4198400, 393216: 2147483712, 458752: 4194368, 524288: 2147483648, 589824: 4194304, 655360: 64, 720896: 2147487744, 786432: 2151678016, 851968: 4160, 917504: 4096, 983040: 2151682112, 32768: 2147487808, 98304: 64, 163840: 2151678016, 229376: 2147487744, 294912: 4198400, 360448: 2151682112, 425984: 0, 491520: 2151677952, 557056: 4096, 622592: 2151682048, 688128: 4194304, 753664: 4160, 819200: 2147483648, 884736: 4194368, 950272: 4198464, 1015808: 2147483712, 1048576: 4194368, 1114112: 4198400, 1179648: 2147483712, 1245184: 0, 1310720: 4160, 1376256: 2151678016, 1441792: 2151682048, 1507328: 2147487808, 1572864: 2151682112, 1638400: 2147483648, 1703936: 2151677952, 1769472: 4198464, 1835008: 2147487744, 1900544: 4194304, 1966080: 64, 2031616: 4096, 1081344: 2151677952, 1146880: 2151682112, 1212416: 0, 1277952: 4198400, 1343488: 4194368, 1409024: 2147483648, 1474560: 2147487808, 1540096: 64, 1605632: 2147483712, 1671168: 4096, 1736704: 2147487744, 1802240: 2151678016, 1867776: 4160, 1933312: 2151682048, 1998848: 4194304, 2064384: 4198464 }, { 0: 128, 4096: 17039360, 8192: 262144, 12288: 536870912, 16384: 537133184, 20480: 16777344, 24576: 553648256, 28672: 262272, 32768: 16777216, 36864: 537133056, 40960: 536871040, 45056: 553910400, 49152: 553910272, 53248: 0, 57344: 17039488, 61440: 553648128, 2048: 17039488, 6144: 553648256, 10240: 128, 14336: 17039360, 18432: 262144, 22528: 537133184, 26624: 553910272, 30720: 536870912, 34816: 537133056, 38912: 0, 43008: 553910400, 47104: 16777344, 51200: 536871040, 55296: 553648128, 59392: 16777216, 63488: 262272, 65536: 262144, 69632: 128, 73728: 536870912, 77824: 553648256, 81920: 16777344, 86016: 553910272, 90112: 537133184, 94208: 16777216, 98304: 553910400, 102400: 553648128, 106496: 17039360, 110592: 537133056, 114688: 262272, 118784: 536871040, 122880: 0, 126976: 17039488, 67584: 553648256, 71680: 16777216, 75776: 17039360, 79872: 537133184, 83968: 536870912, 88064: 17039488, 92160: 128, 96256: 553910272, 100352: 262272, 104448: 553910400, 108544: 0, 112640: 553648128, 116736: 16777344, 120832: 262144, 124928: 537133056, 129024: 536871040 }, { 0: 268435464, 256: 8192, 512: 270532608, 768: 270540808, 1024: 268443648, 1280: 2097152, 1536: 2097160, 1792: 268435456, 2048: 0, 2304: 268443656, 2560: 2105344, 2816: 8, 3072: 270532616, 3328: 2105352, 3584: 8200, 3840: 270540800, 128: 270532608, 384: 270540808, 640: 8, 896: 2097152, 1152: 2105352, 1408: 268435464, 1664: 268443648, 1920: 8200, 2176: 2097160, 2432: 8192, 2688: 268443656, 2944: 270532616, 3200: 0, 3456: 270540800, 3712: 2105344, 3968: 268435456, 4096: 268443648, 4352: 270532616, 4608: 270540808, 4864: 8200, 5120: 2097152, 5376: 268435456, 5632: 268435464, 5888: 2105344, 6144: 2105352, 6400: 0, 6656: 8, 6912: 270532608, 7168: 8192, 7424: 268443656, 7680: 270540800, 7936: 2097160, 4224: 8, 4480: 2105344, 4736: 2097152, 4992: 268435464, 5248: 268443648, 5504: 8200, 5760: 270540808, 6016: 270532608, 6272: 270540800, 6528: 270532616, 6784: 8192, 7040: 2105352, 7296: 2097160, 7552: 0, 7808: 268435456, 8064: 268443656 }, { 0: 1048576, 16: 33555457, 32: 1024, 48: 1049601, 64: 34604033, 80: 0, 96: 1, 112: 34603009, 128: 33555456, 144: 1048577, 160: 33554433, 176: 34604032, 192: 34603008, 208: 1025, 224: 1049600, 240: 33554432, 8: 34603009, 24: 0, 40: 33555457, 56: 34604032, 72: 1048576, 88: 33554433, 104: 33554432, 120: 1025, 136: 1049601, 152: 33555456, 168: 34603008, 184: 1048577, 200: 1024, 216: 34604033, 232: 1, 248: 1049600, 256: 33554432, 272: 1048576, 288: 33555457, 304: 34603009, 320: 1048577, 336: 33555456, 352: 34604032, 368: 1049601, 384: 1025, 400: 34604033, 416: 1049600, 432: 1, 448: 0, 464: 34603008, 480: 33554433, 496: 1024, 264: 1049600, 280: 33555457, 296: 34603009, 312: 1, 328: 33554432, 344: 1048576, 360: 1025, 376: 34604032, 392: 33554433, 408: 34603008, 424: 0, 440: 34604033, 456: 1049601, 472: 1024, 488: 33555456, 504: 1048577 }, { 0: 134219808, 1: 131072, 2: 134217728, 3: 32, 4: 131104, 5: 134350880, 6: 134350848, 7: 2048, 8: 134348800, 9: 134219776, 10: 133120, 11: 134348832, 12: 2080, 13: 0, 14: 134217760, 15: 133152, 2147483648: 2048, 2147483649: 134350880, 2147483650: 134219808, 2147483651: 134217728, 2147483652: 134348800, 2147483653: 133120, 2147483654: 133152, 2147483655: 32, 2147483656: 134217760, 2147483657: 2080, 2147483658: 131104, 2147483659: 134350848, 2147483660: 0, 2147483661: 134348832, 2147483662: 134219776, 2147483663: 131072, 16: 133152, 17: 134350848, 18: 32, 19: 2048, 20: 134219776, 21: 134217760, 22: 134348832, 23: 131072, 24: 0, 25: 131104, 26: 134348800, 27: 134219808, 28: 134350880, 29: 133120, 30: 2080, 31: 134217728, 2147483664: 131072, 2147483665: 2048, 2147483666: 134348832, 2147483667: 133152, 2147483668: 32, 2147483669: 134348800, 2147483670: 134217728, 2147483671: 134219808, 2147483672: 134350880, 2147483673: 134217760, 2147483674: 134219776, 2147483675: 0, 2147483676: 133120, 2147483677: 2080, 2147483678: 131104, 2147483679: 134350848 }], u = [4160749569, 528482304, 33030144, 2064384, 129024, 8064, 504, 2147483679], d = a.DES = s.extend({ _doReset: function () { for (var t = this._key, r = t.words, e = [], i = 0; i < 56; i++) { var n = c[i] - 1; e[i] = r[n >>> 5] >>> 31 - n % 32 & 1 } for (var o = this._subKeys = [], s = 0; s < 16; s++) { for (var a = o[s] = [], f = l[s], i = 0; i < 24; i++)a[i / 6 | 0] |= e[(h[i] - 1 + f) % 28] << 31 - i % 6, a[4 + (i / 6 | 0)] |= e[28 + (h[i + 24] - 1 + f) % 28] << 31 - i % 6; a[0] = a[0] << 1 | a[0] >>> 31; for (var i = 1; i < 7; i++)a[i] = a[i] >>> 4 * (i - 1) + 3; a[7] = a[7] << 5 | a[7] >>> 27 } for (var u = this._invSubKeys = [], i = 0; i < 16; i++)u[i] = o[15 - i] }, encryptBlock: function (t, r) { this._doCryptBlock(t, r, this._subKeys) }, decryptBlock: function (t, r) { this._doCryptBlock(t, r, this._invSubKeys) }, _doCryptBlock: function (t, i, n) { this._lBlock = t[i], this._rBlock = t[i + 1], r.call(this, 4, 252645135), r.call(this, 16, 65535), e.call(this, 2, 858993459), e.call(this, 8, 16711935), r.call(this, 1, 1431655765); for (var o = 0; o < 16; o++) { for (var s = n[o], a = this._lBlock, c = this._rBlock, h = 0, l = 0; l < 8; l++)h |= f[l][((c ^ s[l]) & u[l]) >>> 0]; this._lBlock = c, this._rBlock = a ^ h } var d = this._lBlock; this._lBlock = this._rBlock, this._rBlock = d, r.call(this, 1, 1431655765), e.call(this, 8, 16711935), e.call(this, 2, 858993459), r.call(this, 16, 65535), r.call(this, 4, 252645135), t[i] = this._lBlock, t[i + 1] = this._rBlock }, keySize: 2, ivSize: 2, blockSize: 2 }); i.DES = s._createHelper(d); var v = a.TripleDES = s.extend({ _doReset: function () { var t = this._key, r = t.words; this._des1 = d.createEncryptor(o.create(r.slice(0, 2))), this._des2 = d.createEncryptor(o.create(r.slice(2, 4))), this._des3 = d.createEncryptor(o.create(r.slice(4, 6))) }, encryptBlock: function (t, r) { this._des1.encryptBlock(t, r), this._des2.decryptBlock(t, r), this._des3.encryptBlock(t, r) }, decryptBlock: function (t, r) { this._des3.decryptBlock(t, r), this._des2.encryptBlock(t, r), this._des1.decryptBlock(t, r) }, keySize: 6, ivSize: 2, blockSize: 2 }); i.TripleDES = s._createHelper(v)
  }(), function () { function r() { for (var t = this._S, r = this._i, e = this._j, i = 0, n = 0; n < 4; n++) { r = (r + 1) % 256, e = (e + t[r]) % 256; var o = t[r]; t[r] = t[e], t[e] = o, i |= t[(t[r] + t[e]) % 256] << 24 - 8 * n } return this._i = r, this._j = e, i } var e = t, i = e.lib, n = i.StreamCipher, o = e.algo, s = o.RC4 = n.extend({ _doReset: function () { for (var t = this._key, r = t.words, e = t.sigBytes, i = this._S = [], n = 0; n < 256; n++)i[n] = n; for (var n = 0, o = 0; n < 256; n++) { var s = n % e, a = r[s >>> 2] >>> 24 - s % 4 * 8 & 255; o = (o + i[n] + a) % 256; var c = i[n]; i[n] = i[o], i[o] = c } this._i = this._j = 0 }, _doProcessBlock: function (t, e) { t[e] ^= r.call(this) }, keySize: 8, ivSize: 0 }); e.RC4 = n._createHelper(s); var a = o.RC4Drop = s.extend({ cfg: s.cfg.extend({ drop: 192 }), _doReset: function () { s._doReset.call(this); for (var t = this.cfg.drop; t > 0; t--)r.call(this) } }); e.RC4Drop = n._createHelper(a) }(), t.mode.CTRGladman = function () { function r(t) { if (255 === (t >> 24 & 255)) { var r = t >> 16 & 255, e = t >> 8 & 255, i = 255 & t; 255 === r ? (r = 0, 255 === e ? (e = 0, 255 === i ? i = 0 : ++i) : ++e) : ++r, t = 0, t += r << 16, t += e << 8, t += i } else t += 1 << 24; return t } function e(t) { return 0 === (t[0] = r(t[0])) && (t[1] = r(t[1])), t } var i = t.lib.BlockCipherMode.extend(), n = i.Encryptor = i.extend({ processBlock: function (t, r) { var i = this._cipher, n = i.blockSize, o = this._iv, s = this._counter; o && (s = this._counter = o.slice(0), this._iv = void 0), e(s); var a = s.slice(0); i.encryptBlock(a, 0); for (var c = 0; c < n; c++)t[r + c] ^= a[c] } }); return i.Decryptor = n, i }(), function () { function r() { for (var t = this._X, r = this._C, e = 0; e < 8; e++)a[e] = r[e]; r[0] = r[0] + 1295307597 + this._b | 0, r[1] = r[1] + 3545052371 + (r[0] >>> 0 < a[0] >>> 0 ? 1 : 0) | 0, r[2] = r[2] + 886263092 + (r[1] >>> 0 < a[1] >>> 0 ? 1 : 0) | 0, r[3] = r[3] + 1295307597 + (r[2] >>> 0 < a[2] >>> 0 ? 1 : 0) | 0, r[4] = r[4] + 3545052371 + (r[3] >>> 0 < a[3] >>> 0 ? 1 : 0) | 0, r[5] = r[5] + 886263092 + (r[4] >>> 0 < a[4] >>> 0 ? 1 : 0) | 0, r[6] = r[6] + 1295307597 + (r[5] >>> 0 < a[5] >>> 0 ? 1 : 0) | 0, r[7] = r[7] + 3545052371 + (r[6] >>> 0 < a[6] >>> 0 ? 1 : 0) | 0, this._b = r[7] >>> 0 < a[7] >>> 0 ? 1 : 0; for (var e = 0; e < 8; e++) { var i = t[e] + r[e], n = 65535 & i, o = i >>> 16, s = ((n * n >>> 17) + n * o >>> 15) + o * o, h = ((4294901760 & i) * i | 0) + ((65535 & i) * i | 0); c[e] = s ^ h } t[0] = c[0] + (c[7] << 16 | c[7] >>> 16) + (c[6] << 16 | c[6] >>> 16) | 0, t[1] = c[1] + (c[0] << 8 | c[0] >>> 24) + c[7] | 0, t[2] = c[2] + (c[1] << 16 | c[1] >>> 16) + (c[0] << 16 | c[0] >>> 16) | 0, t[3] = c[3] + (c[2] << 8 | c[2] >>> 24) + c[1] | 0, t[4] = c[4] + (c[3] << 16 | c[3] >>> 16) + (c[2] << 16 | c[2] >>> 16) | 0, t[5] = c[5] + (c[4] << 8 | c[4] >>> 24) + c[3] | 0, t[6] = c[6] + (c[5] << 16 | c[5] >>> 16) + (c[4] << 16 | c[4] >>> 16) | 0, t[7] = c[7] + (c[6] << 8 | c[6] >>> 24) + c[5] | 0 } var e = t, i = e.lib, n = i.StreamCipher, o = e.algo, s = [], a = [], c = [], h = o.Rabbit = n.extend({ _doReset: function () { for (var t = this._key.words, e = this.cfg.iv, i = 0; i < 4; i++)t[i] = 16711935 & (t[i] << 8 | t[i] >>> 24) | 4278255360 & (t[i] << 24 | t[i] >>> 8); var n = this._X = [t[0], t[3] << 16 | t[2] >>> 16, t[1], t[0] << 16 | t[3] >>> 16, t[2], t[1] << 16 | t[0] >>> 16, t[3], t[2] << 16 | t[1] >>> 16], o = this._C = [t[2] << 16 | t[2] >>> 16, 4294901760 & t[0] | 65535 & t[1], t[3] << 16 | t[3] >>> 16, 4294901760 & t[1] | 65535 & t[2], t[0] << 16 | t[0] >>> 16, 4294901760 & t[2] | 65535 & t[3], t[1] << 16 | t[1] >>> 16, 4294901760 & t[3] | 65535 & t[0]]; this._b = 0; for (var i = 0; i < 4; i++)r.call(this); for (var i = 0; i < 8; i++)o[i] ^= n[i + 4 & 7]; if (e) { var s = e.words, a = s[0], c = s[1], h = 16711935 & (a << 8 | a >>> 24) | 4278255360 & (a << 24 | a >>> 8), l = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8), f = h >>> 16 | 4294901760 & l, u = l << 16 | 65535 & h; o[0] ^= h, o[1] ^= f, o[2] ^= l, o[3] ^= u, o[4] ^= h, o[5] ^= f, o[6] ^= l, o[7] ^= u; for (var i = 0; i < 4; i++)r.call(this) } }, _doProcessBlock: function (t, e) { var i = this._X; r.call(this), s[0] = i[0] ^ i[5] >>> 16 ^ i[3] << 16, s[1] = i[2] ^ i[7] >>> 16 ^ i[5] << 16, s[2] = i[4] ^ i[1] >>> 16 ^ i[7] << 16, s[3] = i[6] ^ i[3] >>> 16 ^ i[1] << 16; for (var n = 0; n < 4; n++)s[n] = 16711935 & (s[n] << 8 | s[n] >>> 24) | 4278255360 & (s[n] << 24 | s[n] >>> 8), t[e + n] ^= s[n] }, blockSize: 4, ivSize: 2 }); e.Rabbit = n._createHelper(h) }(), t.mode.CTR = function () { var r = t.lib.BlockCipherMode.extend(), e = r.Encryptor = r.extend({ processBlock: function (t, r) { var e = this._cipher, i = e.blockSize, n = this._iv, o = this._counter; n && (o = this._counter = n.slice(0), this._iv = void 0); var s = o.slice(0); e.encryptBlock(s, 0), o[i - 1] = o[i - 1] + 1 | 0; for (var a = 0; a < i; a++)t[r + a] ^= s[a] } }); return r.Decryptor = e, r }(), function () { function r() { for (var t = this._X, r = this._C, e = 0; e < 8; e++)a[e] = r[e]; r[0] = r[0] + 1295307597 + this._b | 0, r[1] = r[1] + 3545052371 + (r[0] >>> 0 < a[0] >>> 0 ? 1 : 0) | 0, r[2] = r[2] + 886263092 + (r[1] >>> 0 < a[1] >>> 0 ? 1 : 0) | 0, r[3] = r[3] + 1295307597 + (r[2] >>> 0 < a[2] >>> 0 ? 1 : 0) | 0, r[4] = r[4] + 3545052371 + (r[3] >>> 0 < a[3] >>> 0 ? 1 : 0) | 0, r[5] = r[5] + 886263092 + (r[4] >>> 0 < a[4] >>> 0 ? 1 : 0) | 0, r[6] = r[6] + 1295307597 + (r[5] >>> 0 < a[5] >>> 0 ? 1 : 0) | 0, r[7] = r[7] + 3545052371 + (r[6] >>> 0 < a[6] >>> 0 ? 1 : 0) | 0, this._b = r[7] >>> 0 < a[7] >>> 0 ? 1 : 0; for (var e = 0; e < 8; e++) { var i = t[e] + r[e], n = 65535 & i, o = i >>> 16, s = ((n * n >>> 17) + n * o >>> 15) + o * o, h = ((4294901760 & i) * i | 0) + ((65535 & i) * i | 0); c[e] = s ^ h } t[0] = c[0] + (c[7] << 16 | c[7] >>> 16) + (c[6] << 16 | c[6] >>> 16) | 0, t[1] = c[1] + (c[0] << 8 | c[0] >>> 24) + c[7] | 0, t[2] = c[2] + (c[1] << 16 | c[1] >>> 16) + (c[0] << 16 | c[0] >>> 16) | 0, t[3] = c[3] + (c[2] << 8 | c[2] >>> 24) + c[1] | 0, t[4] = c[4] + (c[3] << 16 | c[3] >>> 16) + (c[2] << 16 | c[2] >>> 16) | 0, t[5] = c[5] + (c[4] << 8 | c[4] >>> 24) + c[3] | 0, t[6] = c[6] + (c[5] << 16 | c[5] >>> 16) + (c[4] << 16 | c[4] >>> 16) | 0, t[7] = c[7] + (c[6] << 8 | c[6] >>> 24) + c[5] | 0 } var e = t, i = e.lib, n = i.StreamCipher, o = e.algo, s = [], a = [], c = [], h = o.RabbitLegacy = n.extend({ _doReset: function () { var t = this._key.words, e = this.cfg.iv, i = this._X = [t[0], t[3] << 16 | t[2] >>> 16, t[1], t[0] << 16 | t[3] >>> 16, t[2], t[1] << 16 | t[0] >>> 16, t[3], t[2] << 16 | t[1] >>> 16], n = this._C = [t[2] << 16 | t[2] >>> 16, 4294901760 & t[0] | 65535 & t[1], t[3] << 16 | t[3] >>> 16, 4294901760 & t[1] | 65535 & t[2], t[0] << 16 | t[0] >>> 16, 4294901760 & t[2] | 65535 & t[3], t[1] << 16 | t[1] >>> 16, 4294901760 & t[3] | 65535 & t[0]]; this._b = 0; for (var o = 0; o < 4; o++)r.call(this); for (var o = 0; o < 8; o++)n[o] ^= i[o + 4 & 7]; if (e) { var s = e.words, a = s[0], c = s[1], h = 16711935 & (a << 8 | a >>> 24) | 4278255360 & (a << 24 | a >>> 8), l = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8), f = h >>> 16 | 4294901760 & l, u = l << 16 | 65535 & h; n[0] ^= h, n[1] ^= f, n[2] ^= l, n[3] ^= u, n[4] ^= h, n[5] ^= f, n[6] ^= l, n[7] ^= u; for (var o = 0; o < 4; o++)r.call(this) } }, _doProcessBlock: function (t, e) { var i = this._X; r.call(this), s[0] = i[0] ^ i[5] >>> 16 ^ i[3] << 16, s[1] = i[2] ^ i[7] >>> 16 ^ i[5] << 16, s[2] = i[4] ^ i[1] >>> 16 ^ i[7] << 16, s[3] = i[6] ^ i[3] >>> 16 ^ i[1] << 16; for (var n = 0; n < 4; n++)s[n] = 16711935 & (s[n] << 8 | s[n] >>> 24) | 4278255360 & (s[n] << 24 | s[n] >>> 8), t[e + n] ^= s[n] }, blockSize: 4, ivSize: 2 }); e.RabbitLegacy = n._createHelper(h) }(), t.pad.ZeroPadding = { pad: function (t, r) { var e = 4 * r; t.clamp(), t.sigBytes += e - (t.sigBytes % e || e) }, unpad: function (t) { for (var r = t.words, e = t.sigBytes - 1; !(r[e >>> 2] >>> 24 - e % 4 * 8 & 255);)e--; t.sigBytes = e + 1 } }, t
});

const $ = new Env('京喜工厂');
const JD_API_HOST = 'https://m.jingxi.com';
const helpAuthor = true; //帮助力 免费拿活动
const notify = $.isNode() ? require('./sendNotify') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
const randomCount = $.isNode() ? 20 : 5;
let tuanActiveId = ``;
const jxOpenUrl = `openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://wqsd.jd.com/pingou/dream_factory/index.html%22%20%7D`;
let cookiesArr = [], cookie = '', message = '', allMessage = '';
const inviteCodes = [
  'T022v_13RxwZ91ffPR_wlPcNfACjVWnYaS5kRrbA@T0205KkcH1lQpB6qW3uX06FuCjVWnYaS5kRrbA@T0225KkcRR1K8wXXJxKiwaIIdACjVWnYaS5kRrbA@T018v_h6QBsa9VfeKByb1ACjVWnYaS5kRrbA@T016aGPImbWDIsNs9Zd1CjVWnYaS5kRrbA@T020anX1lb-5IPJt9JJyQH-MCjVWnYaS5kRrbA@T0225KkcRBoRp1SEJBP1nKIDdgCjVWnYaS5kRrbA@T0225KkcRBoRp1SEJBP1nKIDdgCjVWnYaS5kRrbA'
];
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
$.tuanIds = [];
$.appId = 10001;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
  if (process.env.DREAMFACTORY_FORBID_ACCOUNT) process.env.DREAMFACTORY_FORBID_ACCOUNT.split('&').map((item, index) => Number(item) === 0 ? cookiesArr = [] : cookiesArr.splice(Number(item) - 1 - index, 1))
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
!(async () => {
  $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
  await requestAlgo();
  await requireConfig();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      $.ele = 0;
      $.pickEle = 0;
      $.pickFriendEle = 0;
      $.friendList = [];
      $.canHelpFlag = true;//能否助力朋友(招工)
      $.tuanNum = 0;//成团人数
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await jdDreamFactory()
    }
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.isLogin = true;
      $.canHelp = true;//能否参团
      await TotalBean();
      if (!$.isLogin) {
        continue
      }
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      if ((cookiesArr && cookiesArr.length >= ($.tuanNum || 5)) && $.canHelp) {
        console.log(`\n账号${$.UserName} 内部相互进团\n`);
        for (let item of $.tuanIds) {
          console.log(`\n${$.UserName} 去参加团 ${item}`);
          if (!$.canHelp) break;
          await JoinTuan(item);
          await $.wait(1000);
        }
      }
      if ($.canHelp) await joinLeaderTuan();//参团
    }
  }
  if ($.isNode() && allMessage) {
    await notify.sendNotify(`${$.name}`, `${allMessage}`, { url: jxOpenUrl })
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })

async function jdDreamFactory() {
  try {
    if (helpAuthor){await shuye75()}
    if (helpAuthor){await shuye72()} ;
    await userInfo();
    await QueryFriendList();//查询今日招工情况以及剩余助力次数
    // await joinLeaderTuan();//参团
    await helpFriends();
    if (!$.unActive) return
    // await collectElectricity()
    await getUserElectricity();
    await taskList();
    await investElectric();
    await QueryHireReward();//收取招工电力
    await PickUp();//收取自家的地下零件
    await stealFriend();
    await tuanActivity();
    await QueryAllTuan();
    await exchangeProNotify();
    await showMsg();
  } catch (e) {
    $.logErr(e)
  }
}


// 收取发电机的电力
function collectElectricity(facId = $.factoryId, help = false, master) {
  return new Promise(async resolve => {
    // let url = `/dreamfactory/generator/CollectCurrentElectricity?zone=dream_factory&apptoken=&pgtimestamp=&phoneID=&factoryid=${facId}&doubleflag=1&sceneval=2&g_login_type=1`;
    // if (help && master) {
    //   url = `/dreamfactory/generator/CollectCurrentElectricity?zone=dream_factory&factoryid=${facId}&master=${master}&sceneval=2&g_login_type=1`;
    // }
    let body = `factoryid=${facId}&apptoken=&pgtimestamp=&phoneID=&doubleflag=1`;
    if (help && master) {
      body += `factoryid=${facId}&master=${master}`;
    }
    $.get(taskurl(`generator/CollectCurrentElectricity`, body, `_time,apptoken,doubleflag,factoryid,pgtimestamp,phoneID,timeStamp,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              if (help) {
                $.ele += Number(data.data['loginPinCollectElectricity'])
                console.log(`帮助好友收取 ${data.data['CollectElectricity']} 电力，获得 ${data.data['loginPinCollectElectricity']} 电力`);
                message += `【帮助好友】帮助成功，获得 ${data.data['loginPinCollectElectricity']} 电力\n`
              } else {
                $.ele += Number(data.data['CollectElectricity'])
                console.log(`收取电力成功: 共${data.data['CollectElectricity']} `);
                message += `【收取发电站】收取成功，获得 ${data.data['CollectElectricity']} 电力\n`
              }
            } else {
              if (help) {
                console.log(`收取好友电力失败:${data.msg}\n`);
              } else {
                console.log(`收取电力失败:${data.msg}\n`);
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

// 投入电力
function investElectric() {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/userinfo/InvestElectric?zone=dream_factory&productionId=${$.productionId}&sceneval=2&g_login_type=1`;
    $.get(taskurl('userinfo/InvestElectric', `productionId=${$.productionId}`, `_time,productionId,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.ret === 0) {
              console.log(`成功投入电力${data.data.investElectric}电力`);
              message += `【投入电力】投入成功，共计 ${data.data.investElectric} 电力\n`;
            } else {
              console.log(`投入失败，${data.msg}`);
              message += `【投入电力】投入失败，${data.msg}\n`;
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

// 初始化任务
function taskList() {
  return new Promise(async resolve => {
    // const url = `/newtasksys/newtasksys_front/GetUserTaskStatusList?source=dreamfactory&bizCode=dream_factory&sceneval=2&g_login_type=1`;
    $.get(newtasksysUrl('GetUserTaskStatusList', '', `_time,bizCode,source`), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            let userTaskStatusList = data['data']['userTaskStatusList'];
            for (let i = 0; i < userTaskStatusList.length; i++) {
              const vo = userTaskStatusList[i];
              if (vo['awardStatus'] !== 1) {
                if (vo.completedTimes >= vo.targetTimes) {
                  console.log(`任务：${vo.description}可完成`)
                  await completeTask(vo.taskId, vo.taskName)
                  await $.wait(1000);//延迟等待一秒
                } else {
                  switch (vo.taskType) {
                    case 2: // 逛一逛任务
                    case 6: // 浏览商品任务
                    case 9: // 开宝箱
                      for (let i = vo.completedTimes; i <= vo.configTargetTimes; ++i) {
                        console.log(`去做任务：${vo.taskName}`)
                        await doTask(vo.taskId)
                        await completeTask(vo.taskId, vo.taskName)
                        await $.wait(1000);//延迟等待一秒
                      }
                      break
                    case 4: // 招工
                      break
                    case 5:
                      // 收集类
                      break
                    case 1: // 登陆领奖
                    default:
                      break
                  }
                }
              }
            }
            console.log(`完成任务：共领取${$.ele}电力`)
            message += `【每日任务】领奖成功，共计 ${$.ele} 电力\n`;
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

// 获得用户电力情况
function getUserElectricity() {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/generator/QueryCurrentElectricityQuantity?zone=dream_factory&factoryid=${$.factoryId}&sceneval=2&g_login_type=1`
    $.get(taskurl(`generator/QueryCurrentElectricityQuantity`, `factoryid=${$.factoryId}`, `_time,factoryid,zone`), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              console.log(`发电机：当前 ${data.data.currentElectricityQuantity} 电力，最大值 ${data.data.maxElectricityQuantity} 电力`)
              if (data.data.currentElectricityQuantity < data.data.maxElectricityQuantity) {
                $.log(`\n本次发电机电力集满分享后${data.data.nextCollectDoubleFlag === 1 ? '可' : '不可'}获得双倍电力，${data.data.nextCollectDoubleFlag === 1 ? '故目前不收取电力' : '故现在收取电力'}\n`)
              }
              if (data.data.nextCollectDoubleFlag === 1) {
                if (data.data.currentElectricityQuantity === data.data.maxElectricityQuantity && data.data.doubleElectricityFlag) {
                  console.log(`发电机：电力可翻倍并收获`)
                  // await shareReport();
                  await collectElectricity()
                } else {
                  message += `【发电机电力】当前 ${data.data.currentElectricityQuantity} 电力，未达到收获标准\n`
                }
              } else {
                //再收取双倍电力达到上限时，直接收取，不再等到满级
                await collectElectricity()
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

//查询有多少的招工电力可收取
function QueryHireReward() {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/friend/HireAward?zone=dream_factory&date=${new Date().Format("yyyyMMdd")}&type=0&sceneval=2&g_login_type=1`
    $.get(taskurl('friend/QueryHireReward', ``, `_time,zone`), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              for (let item of data['data']['hireReward']) {
                if (item.date !== new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).Format("yyyyMMdd")) {
                  await hireAward(item.date, item.type);
                }
              }
            } else {
              console.log(`异常：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
// 收取招工/劳模电力
function hireAward(date, type = 0) {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/friend/HireAward?zone=dream_factory&date=${new Date().Format("yyyyMMdd")}&type=0&sceneval=2&g_login_type=1`
    $.get(taskurl('friend/HireAward', `date=${date}&type=${type}`, '_time,date,type,zone'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              console.log(`打工电力：收取成功`)
              message += `【打工电力】：收取成功\n`
            } else {
              console.log(`打工电力：收取失败，${data.msg}`)
              message += `【打工电力】收取失败，${data.msg}\n`
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
async function helpFriends() {
  let Hours = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).getHours();
  if (Hours < 6) {
    console.log(`\n未到招工时间(每日6-24点之间可招工)\n`)
    return
  }
  if ($.canHelpFlag) {
    await shareCodesFormat();
    for (let code of $.newShareCodes) {
      if (code) {
        if ($.encryptPin === code) {
          console.log(`不能为自己助力,跳过`);
          continue;
        }
        const assistFriendRes = await assistFriend(code);
        if (assistFriendRes && assistFriendRes['ret'] === 0) {
          console.log(`助力朋友：${code}成功，因一次只能助力一个，故跳出助力`)
          break
        } else if (assistFriendRes && assistFriendRes['ret'] === 11009) {
          console.log(`助力朋友[${code}]失败：${assistFriendRes.msg}，跳出助力`);
          break
        } else {
          console.log(`助力朋友[${code}]失败：${assistFriendRes.msg}`)
        }
      }
    }
  } else {
    $.log(`\n今日助力好友机会已耗尽\n`);
  }
}
// 帮助用户,此处UA不可更换,否则助力功能会失效
function assistFriend(sharepin) {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/friend/AssistFriend?zone=dream_factory&sharepin=${escape(sharepin)}&sceneval=2&g_login_type=1`
    // const options = {
    //   'url': `https://m.jingxi.com/dreamfactory/friend/AssistFriend?zone=dream_factory&sharepin=${escape(sharepin)}&sceneval=2&g_login_type=1`,
    //   'headers': {
    //     "Accept": "*/*",
    //     "Accept-Encoding": "gzip, deflate, br",
    //     "Accept-Language": "zh-cn",
    //     "Connection": "keep-alive",
    //     "Cookie": cookie,
    //     "Host": "m.jingxi.com",
    //     "Referer": "https://st.jingxi.com/pingou/dream_factory/index.html",
    //     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36"
    //   }
    // }
    const options = taskurl('friend/AssistFriend', `sharepin=${escape(sharepin)}`, `_time,sharepin,zone`);
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            // if (data['ret'] === 0) {
            //   console.log(`助力朋友：${sharepin}成功`)
            // } else {
            //   console.log(`助力朋友[${sharepin}]失败：${data.msg}`)
            // }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
//查询助力招工情况
function QueryFriendList() {
  return new Promise(async resolve => {
    $.get(taskurl('friend/QueryFriendList', ``, `_time,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              data = data['data'];
              const { assistListToday = [], assistNumMax, hireListToday = [], hireNumMax } = data;
              console.log(`\n\n你今日还能帮好友打工（${assistNumMax - assistListToday.length || 0}/${assistNumMax}）次\n\n`);
              if (assistListToday.length === assistNumMax) {
                $.canHelpFlag = false;
              }
              $.log(`【今日招工进度】${hireListToday.length}/${hireNumMax}`);
              message += `【招工进度】${hireListToday.length}/${hireNumMax}\n`;
            } else {
              console.log(`QueryFriendList异常：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
// 任务领奖
function completeTask(taskId, taskName) {
  return new Promise(async resolve => {
    // const url = `/newtasksys/newtasksys_front/Award?source=dreamfactory&bizCode=dream_factory&taskId=${taskId}&sceneval=2&g_login_type=1`;
    $.get(newtasksysUrl('Award', taskId, `_time,bizCode,source,taskId`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            switch (data['data']['awardStatus']) {
              case 1:
                $.ele += Number(data['data']['prizeInfo'].replace('\\n', ''))
                console.log(`领取${taskName}任务奖励成功，收获：${Number(data['data']['prizeInfo'].replace('\\n', ''))}电力`);
                break
              case 1013:
              case 0:
                console.log(`领取${taskName}任务奖励失败，任务已领奖`);
                break
              default:
                console.log(`领取${taskName}任务奖励失败，${data['msg']}`)
                break
            }
            // if (data['ret'] === 0) {
            //   console.log("做任务完成！")
            // } else {
            //   console.log(`异常：${JSON.stringify(data)}`)
            // }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

// 完成任务
function doTask(taskId) {
  return new Promise(async resolve => {
    // const url = `/newtasksys/newtasksys_front/DoTask?source=dreamfactory&bizCode=dream_factory&taskId=${taskId}&sceneval=2&g_login_type=1`;
    $.get(newtasksysUrl('DoTask', taskId, '_time,bizCode,configExtra,source,taskId'), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              console.log("做任务完成！")
            } else {
              console.log(`DoTask异常：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

// 初始化个人信息
function userInfo() {
  return new Promise(async resolve => {
    $.get(taskurl('userinfo/GetUserInfo', `pin=&sharePin=&shareType=&materialTuanPin=&materialTuanId=&source=`, '_time,materialTuanId,materialTuanPin,pin,sharePin,shareType,source,zone'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              data = data['data'];
              $.unActive = true;//标记是否开启了京喜活动或者选购了商品进行生产
              $.encryptPin = '';
              $.shelvesList = [];
              if (data.factoryList && data.productionList) {
                const production = data.productionList[0];
                const factory = data.factoryList[0];
                const productionStage = data.productionStage;
                $.factoryId = factory.factoryId;//工厂ID
                $.productionId = production.productionId;//商品ID
                $.commodityDimId = production.commodityDimId;
                $.encryptPin = data.user.encryptPin;
                // subTitle = data.user.pin;
                await GetCommodityDetails();//获取已选购的商品信息
                if (productionStage['productionStageAwardStatus'] === 1) {
                  $.log(`可以开红包了\n`);
                  await DrawProductionStagePrize();//领取红包
                } else {
                  $.log(`再加${productionStage['productionStageProgress']}电力可开红包\n`)
                }
                console.log(`当前电力：${data.user.electric}`)
                console.log(`当前等级：${data.user.currentLevel}`)
                console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${data.user.encryptPin}`);
                console.log(`已投入电力：${production.investedElectric}`);
                console.log(`所需电力：${production.needElectric}`);
                console.log(`生产进度：${((production.investedElectric / production.needElectric) * 100).toFixed(2)}%`);
                message += `【京东账号${$.index}】${$.nickName}\n`
                message += `【生产商品】${$.productName}\n`;
                message += `【当前等级】${data.user.userIdentity} ${data.user.currentLevel}\n`;
                message += `【生产进度】${((production.investedElectric / production.needElectric) * 100).toFixed(2)}%\n`;
                if (production.investedElectric >= production.needElectric) {
                  if (production['exchangeStatus'] === 1) $.log(`\n\n可以兑换商品了`)
                  if (production['exchangeStatus'] === 3) {
                    $.log(`\n\n商品兑换已超时`)
                    if (new Date().getHours() === 9) {
                      $.msg($.name, '', `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}兑换已超时，请选择新商品进行制造`)
                      allMessage += `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}兑换已超时，请选择新商品进行制造${$.index !== cookiesArr.length ? '\n\n' : ''}`;
                    }
                  }
                  // await exchangeProNotify()
                } else {
                  console.log(`\n\n预计最快还需 【${((production.needElectric - production.investedElectric) / (2 * 60 * 60 * 24)).toFixed(2)}天】生产完毕\n\n`)
                }
              } else {
                $.unActive = false;//标记是否开启了京喜活动或者选购了商品进行生产
                if (!data.factoryList) {
                  console.log(`【提示】京东账号${$.index}[${$.nickName}]京喜工厂活动未开始\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 开启活动\n`);
                  // $.msg($.name, '【提示】', `京东账号${$.index}[${$.nickName}]京喜工厂活动未开始\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 开启活动`);
                } else if (data.factoryList && !data.productionList) {
                  console.log(`【提示】京东账号${$.index}[${$.nickName}]京喜工厂未选购商品\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 选购\n`)
                  let nowTimes = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000);
                  if (nowTimes.getHours()  === 12) {
                    //如按每小时运行一次，则此处将一天12点推送1次提醒
                    $.msg($.name, '提醒⏰', `京东账号${$.index}[${$.nickName}]京喜工厂未选择商品\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 选择商品`);
                    // if ($.isNode()) await notify.sendNotify(`${$.name} - 京东账号${$.index} - ${$.nickName}`, `京东账号${$.index}[${$.nickName}]京喜工厂未选择商品\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 选择商品`)
                    if ($.isNode()) allMessage += `京东账号${$.index}[${$.nickName}]京喜工厂未选择商品\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 选择商品${$.index !== cookiesArr.length ? '\n\n' : ''}`
                  }
                }
              }
            } else {
              console.log(`GetUserInfo异常：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
//查询当前生产的商品名称
function GetCommodityDetails() {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/diminfo/GetCommodityDetails?zone=dream_factory&sceneval=2&g_login_type=1&commodityId=${$.commodityDimId}`;
    $.get(taskurl('diminfo/GetCommodityDetails', `commodityId=${$.commodityDimId}`, `_time,commodityId,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              data = data['data'];
              $.productName = data['commodityList'][0].name;
            } else {
              console.log(`GetCommodityDetails异常：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
// 查询已完成商品
function GetShelvesList(pageNo = 1) {
  return new Promise(async resolve => {
    $.get(taskurl('userinfo/GetShelvesList', `pageNo=${pageNo}&pageSize=12`, `_time,pageNo,pageSize,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              data = data['data'];
              const { shelvesList } = data;
              if (shelvesList) {
                $.shelvesList = [...$.shelvesList, ...shelvesList];
                pageNo ++
                GetShelvesList(pageNo);
              }
            } else {
              console.log(`GetShelvesList异常：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
//领取红包
function DrawProductionStagePrize() {
  return new Promise(async resolve => {
    // const url = `/dreamfactory/userinfo/DrawProductionStagePrize?zone=dream_factory&sceneval=2&g_login_type=1&productionId=${$.productionId}`;
    $.get(taskurl('userinfo/DrawProductionStagePrize', `productionId=${$.productionId}`, `_time,productionId,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          console.log(`开幸运红包：${data}`);
          // if (safeGet(data)) {
          //   data = JSON.parse(data);
          //   if (data['ret'] === 0) {
          //
          //   } else {
          //     console.log(`异常：${JSON.stringify(data)}`)
          //   }
          // }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
async function PickUp(encryptPin = $.encryptPin, help = false) {
  $.pickUpMyselfComponent = true;
  const GetUserComponentRes = await GetUserComponent(encryptPin, 1500);
  if (GetUserComponentRes && GetUserComponentRes['ret'] === 0 && GetUserComponentRes['data']) {
    const { componentList } = GetUserComponentRes['data'];
    if (componentList && componentList.length <= 0) {
      if (help) {
        $.log(`好友【${encryptPin}】地下暂无零件可收\n`)
      } else {
        $.log(`自家地下暂无零件可收\n`)
      }
      $.pickUpMyselfComponent = false;
    }
    for (let item of componentList) {
      await $.wait(1000);
      const PickUpComponentRes = await PickUpComponent(item['placeId'], encryptPin);
      if (PickUpComponentRes) {
        if (PickUpComponentRes['ret'] === 0) {
          const data = PickUpComponentRes['data'];
          if (help) {
            console.log(`收取好友[${encryptPin}]零件成功:获得${data['increaseElectric']}电力\n`);
            $.pickFriendEle += data['increaseElectric'];
          } else {
            console.log(`收取自家零件成功:获得${data['increaseElectric']}电力\n`);
            $.pickEle += data['increaseElectric'];
          }
        } else {
          if (help) {
            console.log(`收好友[${encryptPin}]零件失败：${PickUpComponentRes.msg},直接跳出\n`)
          } else {
            console.log(`收自己地下零件失败：${PickUpComponentRes.msg},直接跳出\n`);
            $.pickUpMyselfComponent = false;
          }
          break
        }
      }
    }
  }
}
function GetUserComponent(pin = $.encryptPin, timeout = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      $.get(taskurl('usermaterial/GetUserComponent', `pin=${pin}`, `_time,pin,zone`), (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data['ret'] === 0) {

              } else {
                console.log(`GetUserComponent失败：${JSON.stringify(data)}`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
    }, timeout)
  })
}
//收取地下随机零件电力API

function PickUpComponent(index, encryptPin) {
  return new Promise(resolve => {
    $.get(taskurl('usermaterial/PickUpComponent', `placeId=${index}&pin=${encryptPin}`, `_time,pin,placeId,zone`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            // if (data['ret'] === 0) {
            //   data = data['data'];
            //   if (help) {
            //     console.log(`收取好友[${encryptPin}]零件成功:获得${data['increaseElectric']}电力\n`);
            //     $.pickFriendEle += data['increaseElectric'];
            //   } else {
            //     console.log(`收取自家零件成功:获得${data['increaseElectric']}电力\n`);
            //     $.pickEle += data['increaseElectric'];
            //   }
            // } else {
            //   if (help) {
            //     console.log(`收好友[${encryptPin}]零件失败：${JSON.stringify(data)}`)
            //   } else {
            //     console.log(`收零件失败：${JSON.stringify(data)}`)
            //   }
            // }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
//偷好友的电力
async function stealFriend() {
  // if (!$.pickUpMyselfComponent) {
  //   $.log(`今日收取零件已达上限，偷好友零件也达到上限，故跳出`)
  //   return
  // }
  //调整，只在每日1点，12点，19点尝试收取好友零件
  if (new Date().getHours() !== 1 && new Date().getHours() !== 12 && new Date().getHours() !== 19) return
  await getFriendList();
  $.friendList = [...new Set($.friendList)].filter(vo => !!vo && vo['newFlag'] !== 1);
  console.log(`查询好友列表完成，共${$.friendList.length}好友，下面开始拾取好友地下的零件\n`);
  for (let i = 0; i < $.friendList.length; i++) {
    let pin = $.friendList[i]['encryptPin'];//好友的encryptPin
    console.log(`\n开始收取第 ${i + 1} 个好友 【${$.friendList[i]['nickName']}】 地下零件 collectFlag：${$.friendList[i]['collectFlag']}`)
    await PickUp(pin, true);
    // await getFactoryIdByPin(pin);//获取好友工厂ID
    // if ($.stealFactoryId) await collectElectricity($.stealFactoryId,true, pin);
  }
}
function getFriendList(sort = 0) {
  return new Promise(async resolve => {
    $.get(taskurl('friend/QueryFactoryManagerList', `sort=${sort}`, `_time,sort,zone`), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              data = data['data'];
              if (data.list && data.list.length <= 0) {
                // console.log(`查询好友列表完成，共${$.friendList.length}好友，下面开始拾取好友地下的零件\n`);
                return
              }
              let friendsEncryptPins = [];
              for (let item of data.list) {
                friendsEncryptPins.push(item);
              }
              $.friendList = [...$.friendList, ...friendsEncryptPins];
              // if (!$.isNode()) return
              await getFriendList(data.sort);
            } else {
              console.log(`QueryFactoryManagerList异常：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getFactoryIdByPin(pin) {
  return new Promise((resolve, reject) => {
    // const url = `/dreamfactory/userinfo/GetUserInfoByPin?zone=dream_factory&pin=${pin}&sceneval=2`;
    $.get(taskurl('userinfo/GetUserInfoByPin', `pin=${pin}`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              if (data.data.factoryList) {
                //做此判断,有时候返回factoryList为null
                // resolve(data['data']['factoryList'][0]['factoryId'])
                $.stealFactoryId = data['data']['factoryList'][0]['factoryId'];
              }
            } else {
              console.log(`异常：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
async function tuanActivity() {
  const tuanConfig = await QueryActiveConfig();
  if (tuanConfig && tuanConfig.ret === 0) {
    const { activeId, surplusOpenTuanNum, tuanId } = tuanConfig['data']['userTuanInfo'];
    console.log(`今日剩余开团次数：${surplusOpenTuanNum}次`);
    $.surplusOpenTuanNum = surplusOpenTuanNum;
    if (!tuanId && surplusOpenTuanNum > 0) {
      //开团
      $.log(`准备开团`)
      await CreateTuan();
    } else if (tuanId) {
      //查询词团信息
      const QueryTuanRes = await QueryTuan(activeId, tuanId);
      if (QueryTuanRes && QueryTuanRes.ret === 0) {
        const { tuanInfo } = QueryTuanRes.data;
        if ((tuanInfo && tuanInfo[0]['endTime']) <= QueryTuanRes['nowTime'] && surplusOpenTuanNum > 0) {
          $.log(`之前的团已过期，准备重新开团\n`)
          await CreateTuan();
        }
        for (let item of tuanInfo) {
          const { realTuanNum, tuanNum, userInfo } = item;
          $.tuanNum = tuanNum || 0;
          $.log(`\n开团情况:${realTuanNum}/${tuanNum}\n`);
          if (realTuanNum === tuanNum) {
            for (let user of userInfo) {
              if (user.encryptPin === $.encryptPin) {
                if (user.receiveElectric && user.receiveElectric > 0) {
                  console.log(`您在${new Date(user.joinTime * 1000).toLocaleString()}开团奖励已经领取成功\n`)
                  if ($.surplusOpenTuanNum > 0) await CreateTuan();
                } else {
                  $.log(`开始领取开团奖励`);
                  await tuanAward(item.tuanActiveId, item.tuanId);//isTuanLeader
                }
              }
            }
          } else {
            $.tuanIds.push(tuanId);
            $.log(`\n此团未达领取团奖励人数：${tuanNum}人\n`)
          }
        }
      }
    }
  }
}
async function joinLeaderTuan() {
  let res = await updateTuanIdsCDN(), res2 = await updateTuanIdsCDN("https://gitee.com/shylocks/updateTeam/raw/main/jd_updateFactoryTuanId.json")
  $.authorTuanIds = [...(res && res.tuanIds || []),...(res2 && res2.tuanIds || [])]
  if ($.authorTuanIds && $.authorTuanIds.length) {
    console.log(`\n参加作者的团`);
    for (let tuanId of $.authorTuanIds) {
      if (!tuanId) continue
      if (!$.canHelp) break;
      console.log(`\n账号${$.UserName} 参加作者lxk0301的团 【${tuanId}】`);
      await JoinTuan(tuanId);
      await $.wait(1000);
    }
  }
}
//可获取开团后的团ID，如果团ID为空并且surplusOpenTuanNum>0，则可继续开团
//如果团ID不为空，则查询QueryTuan()
function QueryActiveConfig() {
  return new Promise((resolve) => {
    const body = `activeId=${escape(tuanActiveId)}&tuanId=`;
    const options = taskTuanUrl(`QueryActiveConfig`, body, `_time,activeId,tuanId`)
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              const { userTuanInfo } = data['data'];
              console.log(`\n团活动ID  ${userTuanInfo.activeId}`);
              console.log(`团ID  ${userTuanInfo.tuanId}\n`);
            } else {
              console.log(`QueryActiveConfig异常：${JSON.stringify(data)}`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function QueryTuan(activeId, tuanId) {
  return new Promise((resolve) => {
    const body = `activeId=${escape(activeId)}&tuanId=${escape(tuanId)}`;
    const options = taskTuanUrl(`QueryTuan`, body, `_time,activeId,tuanId`)
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              // $.log(`\n开团情况:${data.data.tuanInfo.realTuanNum}/${data.data.tuanInfo.tuanNum}\n`)
            } else {
              console.log(`异常：${JSON.stringify(data)}`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
//开团API
function CreateTuan() {
  return new Promise((resolve) => {
    const body =`activeId=${escape(tuanActiveId)}&isOpenApp=1`
    const options = taskTuanUrl(`CreateTuan`, body, '_time,activeId,isOpenApp')
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              console.log(`【开团成功】tuanId为 ${data.data['tuanId']}`);
              $.tuanIds.push(data.data['tuanId']);
            } else {
              //{"msg":"活动已结束，请稍后再试~","nowTime":1621551005,"ret":10218}
              if (data['ret'] === 10218 && ($.index === 1 || cookiesArr.length === $.index)) {
                //只发送一次
                $.msg($.name, '', `京喜工厂拼团瓜分电力活动团ID（activeId）已失效\n请自行抓包替换(Node环境变量为TUAN_ACTIVEID，iOS端在BoxJx)或者联系作者等待更新`);
                if ($.isNode()) await notify.sendNotify($.name, `京喜工厂拼团瓜分电力活动团ID（activeId）已失效\n请自行抓包替换(Node环境变量为TUAN_ACTIVEID，iOS端在BoxJx)或者联系作者等待更新`)
              }
              console.log(`开团异常：${JSON.stringify(data)}`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function JoinTuan(tuanId, stk = '_time,activeId,tuanId') {
  return new Promise((resolve) => {
    const body = `activeId=${escape(tuanActiveId)}&tuanId=${escape(tuanId)}`;
    const options = taskTuanUrl(`JoinTuan`, body, '_time,activeId,tuanId')
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              console.log(`参团成功：${JSON.stringify(data)}\n`);
            } else if (data['ret'] === 10005 || data['ret'] === 10206) {
              //火爆，或者今日参团机会已耗尽
              console.log(`参团失败：${JSON.stringify(data)}\n`);
              $.canHelp = false;
            } else {
              console.log(`参团失败：${JSON.stringify(data)}\n`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
//查询所有的团情况(自己开团以及参加别人的团)
function QueryAllTuan() {
  return new Promise((resolve) => {
    const body = `activeId=${escape(tuanActiveId)}&pageNo=1&pageSize=10`;
    const options = taskTuanUrl(`QueryAllTuan`, body, '_time,activeId,pageNo,pageSize')
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              const { tuanInfo } = data;
              for (let item of tuanInfo) {
                if (item.tuanNum === item.realTuanNum) {
                  // console.log(`参加团主【${item.tuanLeader}】已成功`)
                  const { userInfo } = item;
                  for (let item2 of userInfo) {
                    if (item2.encryptPin === $.encryptPin) {
                      if (item2.receiveElectric && item2.receiveElectric > 0) {
                        console.log(`${new Date(item2.joinTime * 1000).toLocaleString()}参加团主【${item2.nickName}】的奖励已经领取成功`)
                      } else {
                        console.log(`开始领取${new Date(item2.joinTime * 1000).toLocaleString()}参加团主【${item2.nickName}】的奖励`)
                        await tuanAward(item.tuanActiveId, item.tuanId, item.tuanLeader === $.encryptPin);//isTuanLeader
                      }
                    }
                  }
                } else {
                  console.log(`${new Date(item.beginTime * 1000).toLocaleString()}参加团主【${item.tuanLeader}】失败`)
                }
              }
            } else {
              console.log(`QueryAllTuan异常：${JSON.stringify(data)}`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
//开团人的领取奖励API
function tuanAward(activeId, tuanId, isTuanLeader = true) {
  return new Promise((resolve) => {
    const body = `activeId=${escape(activeId)}&tuanId=${escape(tuanId)}`;
    const options = taskTuanUrl(`Award`, body, '_time,activeId,tuanId')
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 0) {
              if (isTuanLeader) {
                console.log(`开团奖励(团长)${data.data['electric']}领取成功`);
                message += `【开团(团长)奖励】${data.data['electric']}领取成功\n`;
                if ($.surplusOpenTuanNum > 0) {
                  $.log(`开团奖励(团长)已领取，准备开团`);
                  await CreateTuan();
                }
              } else {
                console.log(`参团奖励${data.data['electric']}领取成功`);
                message += `【参团奖励】${data.data['electric']}领取成功\n`;
              }
            } else if (data['ret'] === 10212) {
              console.log(`${JSON.stringify(data)}`);

              if (isTuanLeader && $.surplusOpenTuanNum > 0) {
                $.log(`团奖励已领取，准备开团`);
                await CreateTuan();
              }
            } else {
              console.log(`异常：${JSON.stringify(data)}`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function updateTuanIdsCDN(url = 'https://cdn.jsdelivr.net/gh/wuzhi-docker1/updateTeam@master/shareCodes/jd_updateFactoryTuanId.json') {
  return new Promise(async resolve => {
    $.get({url,
      timeout: 200000,
      headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, (err, resp, data) => {
      try {
        if (err) {
          // console.log(`${JSON.stringify(err)}`)
        } else {
          if (safeGet(data)) {
            $.tuanConfigs = data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(20000)
    resolve();
  })
}

//商品可兑换时的通知
async function exchangeProNotify() {
  await GetShelvesList();
  let exchangeEndTime, exchangeEndHours, nowHours;
  //脚本运行的UTC+8时区的时间戳
  let nowTimes = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000);
  if ($.shelvesList && $.shelvesList.length > 0) console.log(`\n  商品名     兑换状态`)
  for (let shel of $.shelvesList) {
    console.log(`${shel['name']}    ${shel['exchangeStatus'] === 1 ? '未兑换' : shel['exchangeStatus'] === 2 ? '已兑换' : '兑换超时'}`)
    if (shel['exchangeStatus'] === 1) {
      exchangeEndTime = shel['exchangeEndTime'] * 1000;
      $.picture = shel['picture'];
      // 兑换截止时间点
      exchangeEndHours = new Date(exchangeEndTime + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).getHours();
      //兑换截止时间(年月日 时分秒)
      $.exchangeEndTime = new Date(exchangeEndTime + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).toLocaleString('zh', {hour12: false});
      //脚本运行此时的时间点
      nowHours = nowTimes.getHours();
    } else if (shel['exchangeStatus'] === 3) {
      //兑换超时
    }
  }
  if (exchangeEndTime) {
    //比如兑换(超时)截止时间是2020/12/8 09:20:04,现在时间是2020/12/6
    if (nowTimes < exchangeEndTime) {
      // 一:在兑换超时这一天(2020/12/8 09:20:04)的前3小时内通知
      if ((exchangeEndTime - nowTimes.getTime()) <= 3600000 * 3) {
        let expiredTime = parseInt(((exchangeEndTime - nowTimes.getTime()) / (60*60*1000)).toFixed(1))
        $.msg($.name, ``, `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}${expiredTime}小时后兑换超时\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换`, {'open-url': jxOpenUrl, 'media-url': $.picture})
        // if ($.isNode()) await notify.sendNotify(`${$.name} - 京东账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}${(exchangeEndTime - nowTimes) / 60*60*1000}分钟后兑换超时\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换`, { url: jxOpenUrl })
        if ($.isNode()) allMessage += `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}${expiredTime}小时后兑换超时\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换${$.index !== cookiesArr.length ? '\n\n' : ''}`
      }
      //二:在可兑换的时候，一天通知2次(2020/12/6 10,11点,以及在2020/12/7 10,11点各通知一次)
      if (nowHours === (exchangeEndHours + 1) || nowHours === (exchangeEndHours + 2)) {
        $.msg($.name, ``, `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}已可兑换\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换`, {'open-url': jxOpenUrl, 'media-url': $.picture})
        // if ($.isNode()) await notify.sendNotify(`${$.name} - 京东账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}已可兑换\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换`, { url: jxOpenUrl })
        if ($.isNode()) allMessage += `【京东账号${$.index}】${$.nickName}\n【生产商品】${$.productName}已可兑换\n【兑换截止时间】${$.exchangeEndTime}\n请速去京喜APP->首页->好物0元造进行兑换${$.index !== cookiesArr.length ? '\n\n' : ''}`
      }
    }
  }
}
async function showMsg() {
  return new Promise(async resolve => {
    message += `【收取自己零件】${$.pickUpMyselfComponent ? `获得${$.pickEle}电力` : `今日已达上限`}\n`;
    message += `【收取好友零件】${$.pickUpMyselfComponent ? `获得${$.pickFriendEle}电力` : `今日已达上限`}\n`;
    if ($.isNode() && process.env.DREAMFACTORY_NOTIFY_CONTROL) {
      $.ctrTemp = `${process.env.DREAMFACTORY_NOTIFY_CONTROL}` === 'false';
    } else if ($.getdata('jdDreamFactory')) {
      $.ctrTemp = $.getdata('jdDreamFactory') === 'false';
    } else {
      $.ctrTemp = `${jdNotify}` === 'false';
    }
    if (new Date().getHours() === 22) {
      $.msg($.name, '', `${message}`)
      $.log(`\n${message}`);
    } else {
      $.log(`\n${message}`);
    }
    resolve()
  })
}
function readShareCode() {
  console.log(`开始`)
  return new Promise(async resolve => {
    $.get({url: "https://cdn.jsdelivr.net/gh/wuzhi-docker1/RandomShareCode@main/JD_Dream_Factory.json",headers:{
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
    }}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            console.log(`随机取${randomCount}个码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(10000);
    resolve()
  })
}
//格式化助力码
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    $.newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      $.newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > inviteCodes.length ? (inviteCodes.length - 1) : ($.index - 1);
      $.newShareCodes = inviteCodes[tempIndex].split('@');
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      $.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify($.newShareCodes)}`)
    resolve();
  })
}
function requireConfig() {
  return new Promise(async resolve => {
    tuanActiveId = $.isNode() ? (process.env.TUAN_ACTIVEID || tuanActiveId) : ($.getdata('tuanActiveId') || tuanActiveId);
    if (!tuanActiveId) {
      await updateTuanIdsCDN();
      if ($.tuanConfigs && $.tuanConfigs['tuanActiveId']) {
        tuanActiveId = $.tuanConfigs['tuanActiveId'];
        console.log(`拼团活动ID: 获取成功 ${tuanActiveId}\n`)
      } else {
        if (!$.tuanConfigs) {
          await updateTuanIdsCDN('https://cdn.jsdelivr.net/gh/wuzhi-docker1/updateTeam@master/shareCodes/jd_updateFactoryTuanId.json');
          if ($.tuanConfigs && $.tuanConfigs['tuanActiveId']) {
            tuanActiveId = $.tuanConfigs['tuanActiveId'];
            console.log(`拼团活动ID: 获取成功 ${tuanActiveId}\n`)
          } else {
            console.log(`拼团活动ID：获取失败，将采取脚本内置活动ID\n`)
          }
        }
      }
    } else {
      console.log(`自定义拼团活动ID: 获取成功 ${tuanActiveId}`)
    }
    console.log(`开始获取${$.name}配置文件\n`);
    //Node.js用户请在jdCookie.js处填写京东ck;
    const shareCodes = $.isNode() ? require('./jdDreamFactoryShareCodes.js') : '';
    console.log(`共${cookiesArr.length}个京东账号\n`);
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(shareCodes).forEach((item) => {
        if (shareCodes[item]) {
          $.shareCodesArr.push(shareCodes[item])
        }
      })
    } else {
      if ($.getdata('jd_jxFactory')) $.shareCodesArr = $.getdata('jd_jxFactory').split('\n').filter(item => item !== "" && item !== null && item !== undefined);
      console.log(`\nBoxJs设置的${$.name}好友邀请码:${$.getdata('jd_jxFactory')}\n`);
    }
    // console.log(`\n种豆得豆助力码::${JSON.stringify($.shareCodesArr)}`);
    console.log(`您提供了${$.shareCodesArr.length}个账号的${$.name}助力码\n`);
    resolve()
  })
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            if (data['retcode'] === 0) {
              $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
            } else {
              $.nickName = $.UserName
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}
function taskTuanUrl(functionId, body = '', stk) {
  let url = `https://m.jingxi.com/dreamfactory/tuan/${functionId}?${body}&_time=${Date.now()}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&_ste=1`
  url += `&h5st=${decrypt(Date.now(), stk || '', '', url)}`
  if (stk) {
    url += `&_stk=${encodeURIComponent(stk)}`;
  }
  return {
    url,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Cookie": cookie,
      "Host": "m.jingxi.com",
      "Referer": "https://st.jingxi.com/pingou/dream_factory/divide.html",
      "User-Agent": "jdpingou"
    }
  }
}

function taskurl(functionId, body = '', stk) {
  let url = `${JD_API_HOST}/dreamfactory/${functionId}?zone=dream_factory&${body}&sceneval=2&g_login_type=1&_time=${Date.now()}&_=${Date.now() + 2}&_ste=1`
  url += `&h5st=${decrypt(Date.now(), stk, '', url)}`
  if (stk) {
    url += `&_stk=${encodeURIComponent(stk)}`;
  }
  return {
    url,
    headers: {
      'Cookie': cookie,
      'Host': 'm.jingxi.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'User-Agent': functionId === 'AssistFriend' ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36" : 'jdpingou',
      'Accept-Language': 'zh-cn',
      'Referer': 'https://wqsd.jd.com/pingou/dream_factory/index.html',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}
function newtasksysUrl(functionId, taskId, stk) {
  let url = `${JD_API_HOST}/newtasksys/newtasksys_front/${functionId}?source=dreamfactory&bizCode=dream_factory&sceneval=2&g_login_type=1&_time=${Date.now()}&_=${Date.now() + 2}&_ste=1`;
  if (taskId) {
    url += `&taskId=${taskId}`;
  }
  if (stk) {
    url += `&_stk=${stk}`;
  }
  //传入url进行签名
  url += `&h5st=${decrypt(Date.now(), stk, '', url)}`
  return {
    url,
    "headers": {
      'Cookie': cookie,
      'Host': 'm.jingxi.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'User-Agent': "jdpingou;iPhone;3.15.2;13.5.1;90bab9217f465a83a99c0b554a946b0b0d5c2f7a;network/wifi;model/iPhone12,1;appBuild/100365;ADID/696F8BD2-0820-405C-AFC0-3C6D028040E5;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/14;pap/JA2015_311210;brand/apple;supportJDSHWK/1;",
      'Accept-Language': 'zh-cn',
      'Referer': 'https://wqsd.jd.com/pingou/dream_factory/index.html',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}
/*
修改时间戳转换函数，京喜工厂原版修改
 */
Date.prototype.Format = function (fmt) {
  var e,
      n = this, d = fmt, l = {
        "M+": n.getMonth() + 1,
        "d+": n.getDate(),
        "D+": n.getDate(),
        "h+": n.getHours(),
        "H+": n.getHours(),
        "m+": n.getMinutes(),
        "s+": n.getSeconds(),
        "w+": n.getDay(),
        "q+": Math.floor((n.getMonth() + 3) / 3),
        "S+": n.getMilliseconds()
      };
  /(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
  for (var k in l) {
    if (new RegExp("(".concat(k, ")")).test(d)) {
      var t, a = "S+" === k ? "000" : "00";
      d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
    }
  }
  return d;
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
async function requestAlgo() {
  $.fingerprint = await generateFp();
  const options = {
    "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
    "headers": {
      'Authority': 'cactus.jd.com',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      'Content-Type': 'application/json',
      'Origin': 'https://st.jingxi.com',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      'Referer': 'https://st.jingxi.com/',
      'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
    },
    'body': JSON.stringify({
      "version": "1.0",
      "fp": $.fingerprint,
      "appId": $.appId.toString(),
      "timestamp": Date.now(),
      "platform": "web",
      "expandParams": ""
    })
  }
  new Promise(async resolve => {
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`request_algo 签名参数API请求失败，请检查网路重试`)
        } else {
          if (data) {
            // console.log(data);
            data = JSON.parse(data);
            if (data['status'] === 200) {
              $.token = data.data.result.tk;
              let enCryptMethodJDString = data.data.result.algo;
              if (enCryptMethodJDString) $.enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
              console.log(`获取签名参数成功！`)
              console.log(`fp: ${$.fingerprint}`)
              console.log(`token: ${$.token}`)
              console.log(`enCryptMethodJD: ${enCryptMethodJDString}`)
            } else {
              console.log(`fp: ${$.fingerprint}`)
              console.log('request_algo 签名参数API请求失败:')
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function decrypt(time, stk, type, url) {
  stk = stk || (url ? getUrlData(url, '_stk') : '')
  if (stk) {
    const timestamp = new Date(time).Format("yyyyMMddhhmmssSSS");
    let hash1 = '';
    if ($.fingerprint && $.token && $.enCryptMethodJD) {
      hash1 = $.enCryptMethodJD($.token, $.fingerprint.toString(), timestamp.toString(), $.appId.toString(), $.CryptoJS).toString($.CryptoJS.enc.Hex);
    } else {
      const random = '5gkjB6SpmC9s';
      $.token = `tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc`;
      $.fingerprint = 5287160221454703;
      const str = `${$.token}${$.fingerprint}${timestamp}${$.appId}${random}`;
      hash1 = $.CryptoJS.SHA512(str, $.token).toString($.CryptoJS.enc.Hex);
    }
    let st = '';
    stk.split(',').map((item, index) => {
      st += `${item}:${getUrlData(url, item)}${index === stk.split(',').length -1 ? '' : '&'}`;
    })
    const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
    // console.log(`\nst:${st}`)
    // console.log(`h5st:${["".concat(timestamp.toString()), "".concat(fingerprint.toString()), "".concat($.appId.toString()), "".concat(token), "".concat(hash2)].join(";")}\n`)
    return encodeURIComponent(["".concat(timestamp.toString()), "".concat($.fingerprint.toString()), "".concat($.appId.toString()), "".concat($.token), "".concat(hash2)].join(";"))
  } else {
    return '20210318144213808;8277529360925161;10001;tk01w952a1b73a8nU0luMGtBanZTHCgj0KFVwDa4n5pJ95T/5bxO/m54p4MtgVEwKNev1u/BUjrpWAUMZPW0Kz2RWP8v;86054c036fe3bf0991bd9a9da1a8d44dd130c6508602215e50bb1e385326779d'
  }
}

/**
 * 获取url参数值
 * @param url
 * @param name
 * @returns {string}
 */
function getUrlData(url, name) {
  if (typeof URL !== "undefined") {
    let urls = new URL(url);
    let data = urls.searchParams.get(name);
    return data ? data : '';
  } else {
    const query = url.match(/\?.*/)[0].substring(1)
    const vars = query.split('&')
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=')
      if (pair[0] === name) {
        // return pair[1];
        return vars[i].substr(vars[i].indexOf('=') + 1);
      }
    }
    return ''
  }
}
/**
 * 模拟生成 fingerprint
 * @returns {string}
 */
function generateFp() {
  let e = "0123456789";
  let a = 13;
  let i = '';
  for (; a--; )
    i += e[Math.random() * e.length | 0];
  return (i + Date.now()).slice(0,16)
}
var _0xodn='jsjiami.com.v6',_0x414e=[_0xodn,'wo/CoVozQA==','ZSx5wpjCpw==','BcO8fzDCrg==','HcOQPGgG','wq0uwqHDrFk=','w7nDgWZ1w74=','wpEZw6XCujI=','w7Bbw54=','X8KwOMOk','Ei5owonorJPmsrTlpabotYjvvJHorpbmoanmnLvnvKPotJTphbXorYI=','X0o0','dCoBw6o=','MXnCoMKc6Kyv5rO95aeK6LSe772F6K295qKu5p2X576P6LaU6Ya16K6Z','Q8Ouw6XDpyY=','V0QndhjClcO0','YVnCgsKmwr0=','N1AmcMKb','w6IcV11RB8O3','wpYIwo7Dk27DtQ==','w5Aww7tuw4E=','w4MFT1lY','Y8OCw63Cqks=','FEYwDsOf','EyPDiHHDqsKGwrg=','w7Qaw4JZw6zCkXnCqGDCoXrDvsKRHyzCgQ==','JcOkFGQ+wrQ=','AWkFfcKpw7PCpA==','aSIUw6DDn8O1wqvCryPCoTYEwqLCqcKlw5o=','wrsYY8O5','w5Qbw7BGw4o=','wokdbMKjNg==','wozCq1oFcQY=','wpIGw6nCjTrChA==','wowiZsKhOA==','wrpMM8O0VA==','w6YDw5MYw6/DmlbCvivCpmXDsg==','w6nDh04GWQzDmXZwwo8ewr9Vd2kxdcOpY2PCrngkwpzCosKDBw==','fTEFw7/CncKwworCuCDCqScRwqTDrsOgw4zCog==','WQpdwrDDicKXOwRrBA==','wq0JesOhXDjDjcOFwr5owqPDrFFQQR84w5QjWcODwrIFw4zCjMKhXh7DosOQYcKUUQ==','QcO7IV1vZ3vDksKBFDPDjcK8wqhcPkhFwqZBH8OKwpnCoXQQJMOVwqzCgMOFc8KKUy95wrPCscKewqvDhMOZw5oOZcKSXsK4Tyc1TFvDg8KQRMK1w6xIwqvDoMK0ZsOjwp3DiXZ8w5kNw5HCs0XCi8OMw790NcOffF3Cj1HDvEJaU8OWSANww53CnsO9OC7CicO+w4cNwohxwodUwoDDgRwjw5PDpsOCwoZUw509MAgUw44pw7Z+MMKQw6IkwqJJw5TCgn4cw4LDhBMhNjsbKQ7Cg8OzD1jCrE3Cq2jDl8OgwpzCthfDl3JFcMO9YnzDrsKNP8OFw4fCqcKVw500WsKNw7EEPDDDusObw5FswpfCu8ONXl7CtEU=','VsOdFj92','WsOhw6HDvTfCiMKxw4LCnQ==','w7HCgCnDrcKgYsOEfTnDgGN6wos=','Q8OrOVl9LSTDhsKJNDLCjMK/w6MNaUgVw6ceC8OEw4vDui9dYcOSwqbCmsO7eMOFV3BrwrTChcKSw7TDqcOWw58+WcKtT8KkKXl6WVzDkcKbfsO8w7pOwqzDvMOAbsKJw5/CnnQ6woZdw7TCtg7DnsORwr85WMKudifDlm3Ds2ABMsOnbRteworCiMKneEvCi8O1w6pZwosmw5AVw5/CjUo+wpDCsMKRw7oIwphha1Rfw4MBw6EUQcOywrl4wr9L','w5tbwrzDpG3DhAZWBcOTw6PDosORwpB1wqjCohfCm8OMw7k=','w5tbwrzDpG3DhAZXDsOJw7rDgsONwpI1wr/Coh/ChMObw7nDh8O2wqrDvwcmwo9OLA==','dz12e2zCqMOBwrhHUMOPLkvCmh4IMhHCsyvDtCTCp2LCnETDp1PCssOZV0/CkFXCiBPDhsOnwpYswqM8w7dEwrvDgA==','HMOnwrZnRw==','XC5QwoPCtQ==','w78Gw7TCtcOj','wp8vwpfDtkg=','w5gtDFHDpQ==','wqwGw5DDm08=','woIhw4zDvFUgwqJ2w4QfYMO7Sk4ZUizDkVTDpWgvwpp8R0hRGMOHw6HDgMKKw542VF3Cv1DDu0zDv8KQV8K/w5YUAcOhwpfDpRApEcOKwpDDl2EEw6QZDsOfOTXCqHDCqMKVZlHDvcOCA2XDmcOOUw==','w5gAw6DCviHCglFNIsOBwrc=','N1DClcK5wqjDq8KCSyzCt1/ClMKyFR9xFcKNw6IVwoQ7Y8ODCj3Cqw3Dl8Kcw4rCtwbDhcKL','wrN5w4LCtlM=','RsOvwo46wrA=','w41ew78=','wrklNA==','w6lvw7p4','w4oUw6jDheivkeaxmOWmvOi1vO+/vuivmeaimOadrOe9vui3hemGpOivpg==','wqUrIcKRwo0=','XgBfwoXClsKE','VnzCmcKYwro=','w5w6YHFZ','fTHCicO/fA==','w6RBw5EHNA==','wpBtHcOjQQ==','wpwbw7HDnEg=','OShye3bDtsOTw7ZDTcOSPUfDgBQCLGHCsCjDoD7CpX7ChlzCuFXDscODWkDClmbCrg7DkcOrw5Yww794w7Ycw7TCg27Cj8OtRcKZwpXCuE8two9zKT7CkTzCp8O3XUTCmSc=','wqc6w4LDpUp2w6x2w4cAaMKpB0M5WyDDlFTCqmYGwq4HBE5sX8KXw67DhsOew7gTHRjDtUbCrS7CiMOxD8KFw5Y2FsOiwq7Ds0Ane8KZwqPCjQh1wqQlUsOdSCLCr1/ChMKPPwLCocKYXTHCvsKbW8OTwozDuTliBcO6wpHChDbCisOsw68DwpwGYcOBwqsew49yw6zCpcK3wo/CoQvCpsK/JMK9w4wOwq85wrl0esKpwrzDlMOiw7DDp3vDjwArwonCiSA4wpBkVcKrw7jDjsOOYXQaYgPCt3Jyw7gmHy9DWcO5Mk3Dp1k=','XQpfwrPCpw==','w6M3w4hSw6k=','dcOjwqsfwp8=','wp3DixDCrMKN','TMO6OQ==','J8Olwqt1Uw==','w4srGEnDgA==','jsSjiePLaumi.comJ.zEv6zrUFp=='];(function(_0x4a6b99,_0x34f088,_0x3cf9f5){var _0x2e9054=function(_0x32fcb2,_0x20ed37,_0x383704,_0x126e00,_0x16dfca){_0x20ed37=_0x20ed37>>0x8,_0x16dfca='po';var _0x5cf64f='shift',_0x2438d5='push';if(_0x20ed37<_0x32fcb2){while(--_0x32fcb2){_0x126e00=_0x4a6b99[_0x5cf64f]();if(_0x20ed37===_0x32fcb2){_0x20ed37=_0x126e00;_0x383704=_0x4a6b99[_0x16dfca+'p']();}else if(_0x20ed37&&_0x383704['replace'](/[SePLuJzEzrUFp=]/g,'')===_0x20ed37){_0x4a6b99[_0x2438d5](_0x126e00);}}_0x4a6b99[_0x2438d5](_0x4a6b99[_0x5cf64f]());}return 0x8bf2f;};var _0x2248be=function(){var _0x1fac42={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x5757d1,_0x3a9a56,_0x18e409,_0xbe28fb){_0xbe28fb=_0xbe28fb||{};var _0x2bac7a=_0x3a9a56+'='+_0x18e409;var _0x388dd6=0x0;for(var _0x388dd6=0x0,_0x446060=_0x5757d1['length'];_0x388dd6<_0x446060;_0x388dd6++){var _0xfe4f05=_0x5757d1[_0x388dd6];_0x2bac7a+=';\x20'+_0xfe4f05;var _0x461c73=_0x5757d1[_0xfe4f05];_0x5757d1['push'](_0x461c73);_0x446060=_0x5757d1['length'];if(_0x461c73!==!![]){_0x2bac7a+='='+_0x461c73;}}_0xbe28fb['cookie']=_0x2bac7a;},'removeCookie':function(){return'dev';},'getCookie':function(_0x489cb8,_0x3f6e59){_0x489cb8=_0x489cb8||function(_0x47bbce){return _0x47bbce;};var _0x7782a8=_0x489cb8(new RegExp('(?:^|;\x20)'+_0x3f6e59['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x5c974c=typeof _0xodn=='undefined'?'undefined':_0xodn,_0x55c9b6=_0x5c974c['split'](''),_0x149f31=_0x55c9b6['length'],_0x35c71a=_0x149f31-0xe,_0x508059;while(_0x508059=_0x55c9b6['pop']()){_0x149f31&&(_0x35c71a+=_0x508059['charCodeAt']());}var _0x4cceea=function(_0x5c90b9,_0x5306a4,_0x28a404){_0x5c90b9(++_0x5306a4,_0x28a404);};_0x35c71a^-_0x149f31===-0x524&&(_0x508059=_0x35c71a)&&_0x4cceea(_0x2e9054,_0x34f088,_0x3cf9f5);return _0x508059>>0x2===0x14b&&_0x7782a8?decodeURIComponent(_0x7782a8[0x1]):undefined;}};var _0x474d44=function(){var _0x4f3468=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x4f3468['test'](_0x1fac42['removeCookie']['toString']());};_0x1fac42['updateCookie']=_0x474d44;var _0x2def8a='';var _0x4cbdd4=_0x1fac42['updateCookie']();if(!_0x4cbdd4){_0x1fac42['setCookie'](['*'],'counter',0x1);}else if(_0x4cbdd4){_0x2def8a=_0x1fac42['getCookie'](null,'counter');}else{_0x1fac42['removeCookie']();}};_0x2248be();}(_0x414e,0x1b3,0x1b300));var _0x48ec=function(_0x553b02,_0x220976){_0x553b02=~~'0x'['concat'](_0x553b02);var _0x7a3a4a=_0x414e[_0x553b02];if(_0x48ec['CTqMeL']===undefined){(function(){var _0xd09a3=function(){var _0x3ff7de;try{_0x3ff7de=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x45b57b){_0x3ff7de=window;}return _0x3ff7de;};var _0x2a5e38=_0xd09a3();var _0x64e874='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x2a5e38['atob']||(_0x2a5e38['atob']=function(_0x4b521a){var _0x5b4d3e=String(_0x4b521a)['replace'](/=+$/,'');for(var _0x4caa48=0x0,_0x27975e,_0x305e40,_0x40f183=0x0,_0x15dc74='';_0x305e40=_0x5b4d3e['charAt'](_0x40f183++);~_0x305e40&&(_0x27975e=_0x4caa48%0x4?_0x27975e*0x40+_0x305e40:_0x305e40,_0x4caa48++%0x4)?_0x15dc74+=String['fromCharCode'](0xff&_0x27975e>>(-0x2*_0x4caa48&0x6)):0x0){_0x305e40=_0x64e874['indexOf'](_0x305e40);}return _0x15dc74;});}());var _0x3206f1=function(_0x24a22d,_0x220976){var _0x4a34e7=[],_0x5e9bb6=0x0,_0x2ab160,_0x2bc7f7='',_0x354392='';_0x24a22d=atob(_0x24a22d);for(var _0x138521=0x0,_0x3f1d9b=_0x24a22d['length'];_0x138521<_0x3f1d9b;_0x138521++){_0x354392+='%'+('00'+_0x24a22d['charCodeAt'](_0x138521)['toString'](0x10))['slice'](-0x2);}_0x24a22d=decodeURIComponent(_0x354392);for(var _0x22d98b=0x0;_0x22d98b<0x100;_0x22d98b++){_0x4a34e7[_0x22d98b]=_0x22d98b;}for(_0x22d98b=0x0;_0x22d98b<0x100;_0x22d98b++){_0x5e9bb6=(_0x5e9bb6+_0x4a34e7[_0x22d98b]+_0x220976['charCodeAt'](_0x22d98b%_0x220976['length']))%0x100;_0x2ab160=_0x4a34e7[_0x22d98b];_0x4a34e7[_0x22d98b]=_0x4a34e7[_0x5e9bb6];_0x4a34e7[_0x5e9bb6]=_0x2ab160;}_0x22d98b=0x0;_0x5e9bb6=0x0;for(var _0x16efac=0x0;_0x16efac<_0x24a22d['length'];_0x16efac++){_0x22d98b=(_0x22d98b+0x1)%0x100;_0x5e9bb6=(_0x5e9bb6+_0x4a34e7[_0x22d98b])%0x100;_0x2ab160=_0x4a34e7[_0x22d98b];_0x4a34e7[_0x22d98b]=_0x4a34e7[_0x5e9bb6];_0x4a34e7[_0x5e9bb6]=_0x2ab160;_0x2bc7f7+=String['fromCharCode'](_0x24a22d['charCodeAt'](_0x16efac)^_0x4a34e7[(_0x4a34e7[_0x22d98b]+_0x4a34e7[_0x5e9bb6])%0x100]);}return _0x2bc7f7;};_0x48ec['PAWqrL']=_0x3206f1;_0x48ec['KWsRMq']={};_0x48ec['CTqMeL']=!![];}var _0x1c36ee=_0x48ec['KWsRMq'][_0x553b02];if(_0x1c36ee===undefined){if(_0x48ec['wSpTbw']===undefined){var _0x49e9bb=function(_0x40d4ba){this['dsPWOm']=_0x40d4ba;this['DqFjSw']=[0x1,0x0,0x0];this['uetjvC']=function(){return'newState';};this['ghKwnl']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['VDhMQi']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x49e9bb['prototype']['szjNmE']=function(){var _0x128ffb=new RegExp(this['ghKwnl']+this['VDhMQi']);var _0x1f0a7b=_0x128ffb['test'](this['uetjvC']['toString']())?--this['DqFjSw'][0x1]:--this['DqFjSw'][0x0];return this['MnYxyF'](_0x1f0a7b);};_0x49e9bb['prototype']['MnYxyF']=function(_0x50bcf6){if(!Boolean(~_0x50bcf6)){return _0x50bcf6;}return this['hUeupB'](this['dsPWOm']);};_0x49e9bb['prototype']['hUeupB']=function(_0x22b458){for(var _0x5b7163=0x0,_0x4cd59b=this['DqFjSw']['length'];_0x5b7163<_0x4cd59b;_0x5b7163++){this['DqFjSw']['push'](Math['round'](Math['random']()));_0x4cd59b=this['DqFjSw']['length'];}return _0x22b458(this['DqFjSw'][0x0]);};new _0x49e9bb(_0x48ec)['szjNmE']();_0x48ec['wSpTbw']=!![];}_0x7a3a4a=_0x48ec['PAWqrL'](_0x7a3a4a,_0x220976);_0x48ec['KWsRMq'][_0x553b02]=_0x7a3a4a;}else{_0x7a3a4a=_0x1c36ee;}return _0x7a3a4a;};var _0x26196a=function(){var _0x4e9a55=!![];return function(_0x500df0,_0x501159){var _0x58726e=_0x4e9a55?function(){if(_0x501159){var _0x43c06c=_0x501159['apply'](_0x500df0,arguments);_0x501159=null;return _0x43c06c;}}:function(){};_0x4e9a55=![];return _0x58726e;};}();var _0x734006=_0x26196a(this,function(){var _0x550a7c=function(){return'\x64\x65\x76';},_0x12e0ba=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x2db545=function(){var _0x38b7e8=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x38b7e8['\x74\x65\x73\x74'](_0x550a7c['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x2bcba2=function(){var _0x45661f=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x45661f['\x74\x65\x73\x74'](_0x12e0ba['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0xb8c771=function(_0x2bde9e){var _0x4cdb8d=~-0x1>>0x1+0xff%0x0;if(_0x2bde9e['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x4cdb8d)){_0x393c15(_0x2bde9e);}};var _0x393c15=function(_0x302160){var _0x3a21e7=~-0x4>>0x1+0xff%0x0;if(_0x302160['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x3a21e7){_0xb8c771(_0x302160);}};if(!_0x2db545()){if(!_0x2bcba2()){_0xb8c771('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0xb8c771('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0xb8c771('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x734006();function wuzhi05(_0x4c8240){var _0x525b43={'eOGMH':function(_0x48f7a6){return _0x48f7a6();},'tioUv':_0x48ec('0','XfN*'),'nAhCQ':_0x48ec('1','9y$N'),'vOtQT':_0x48ec('2','Sk[('),'eBwBR':_0x48ec('3','W[(B'),'uRrKl':_0x48ec('4','D99Y'),'FShWi':_0x48ec('5','@mxG'),'AUpAV':_0x48ec('6','NlwL')};let _0x57ff54=_0x4c8240[_0x48ec('7','sW2q')];let _0x3b3477=_0x4c8240[_0x48ec('8','fF#i')];let _0x2cac2f={'url':_0x48ec('9','@mxG')+_0x3b3477+_0x48ec('a','7nun')+_0x57ff54+_0x48ec('b','7nun')+ +new Date()+_0x48ec('c','r]d9'),'headers':{'Host':_0x525b43[_0x48ec('d','9N*l')],'Origin':_0x525b43[_0x48ec('e','W[(B')],'Accept-Encoding':_0x525b43[_0x48ec('f','B&g$')],'Cookie':cookie,'Connection':_0x525b43[_0x48ec('10','AZzc')],'Accept':_0x525b43[_0x48ec('11','4($X')],'User-Agent':_0x525b43[_0x48ec('12','By^U')],'Referer':_0x48ec('13','By^U')+_0x3b3477+_0x48ec('14','7nun')+_0x57ff54+_0x48ec('15','SF!l'),'Accept-Language':_0x525b43[_0x48ec('16','rj#S')]}};return new Promise(_0x2f908e=>{var _0x50653c={'GDiMb':function(_0x45e252){return _0x525b43[_0x48ec('17','zYzW')](_0x45e252);}};$[_0x48ec('18','#b9Z')](_0x2cac2f,(_0xb1b683,_0x310c39,_0x34aa82)=>{try{if(_0xb1b683){console[_0x48ec('19','oWMC')]($[_0x48ec('1a','ycOF')]+_0x48ec('1b','By^U'));}else{_0x34aa82=JSON[_0x48ec('1c','oWMC')](_0x34aa82);}}catch(_0x14c9de){$[_0x48ec('1d','W[(B')](_0x14c9de,resp);}finally{_0x50653c[_0x48ec('1e','SF!l')](_0x2f908e);}});});}function shuye75(){var _0xde7708={'oegsC':function(_0x2098a3){return _0x2098a3();},'WCAXC':function(_0x20b944,_0x39f096){return _0x20b944===_0x39f096;},'TQFkL':_0x48ec('1f','J^hf'),'opkrz':_0x48ec('20','G^ji'),'RXWlu':function(_0x140910,_0x2d553b){return _0x140910!==_0x2d553b;},'ExleN':_0x48ec('21','#b9Z'),'GNywC':function(_0x110375,_0x76e44f){return _0x110375<_0x76e44f;},'ShJpH':function(_0x9c58f9,_0x2258ac){return _0x9c58f9(_0x2258ac);},'dDrdk':function(_0x25b6a3,_0x3b2f51){return _0x25b6a3!==_0x3b2f51;},'VCbhg':_0x48ec('22','qJY5'),'KrfrC':_0x48ec('23','By^U'),'OkrGb':_0x48ec('24','r]d9'),'fTfSI':_0x48ec('25','By^U')};return new Promise(_0x5c85f6=>{var _0x286f1d={'gPZTe':function(_0x4342c0){return _0xde7708[_0x48ec('26','W[(B')](_0x4342c0);}};if(_0xde7708[_0x48ec('27','XfN*')](_0xde7708[_0x48ec('28','zYzW')],_0xde7708[_0x48ec('29','uACE')])){$[_0x48ec('2a','@mxG')]({'url':_0xde7708[_0x48ec('2b','9N*l')],'headers':{'User-Agent':_0xde7708[_0x48ec('2c','4($X')]},'timeout':0x1388},async(_0x548095,_0x2c80fa,_0x35e7d8)=>{var _0x27670c={'jZmqM':function(_0x12f99f){return _0xde7708[_0x48ec('2d','JW$K')](_0x12f99f);}};try{if(_0xde7708[_0x48ec('2e','W[(B')](_0xde7708[_0x48ec('2f','l1iQ')],_0xde7708[_0x48ec('30','ELqJ')])){if(_0x548095){if(_0xde7708[_0x48ec('31','AZzc')](_0xde7708[_0x48ec('32','G]kI')],_0xde7708[_0x48ec('33','7nun')])){console[_0x48ec('34','CPp&')]($[_0x48ec('35',']A^]')]+_0x48ec('36','W[(B'));}else{if(_0x548095){console[_0x48ec('37','giQ^')]($[_0x48ec('38','Sk[(')]+_0x48ec('39','SF!l'));}else{_0x35e7d8=JSON[_0x48ec('3a','sW2q')](_0x35e7d8);}}}else{$[_0x48ec('3b','giQ^')]=JSON[_0x48ec('3c','SF!l')](_0x35e7d8);if(_0xde7708[_0x48ec('3d','4v]v')]($[_0x48ec('3e','J^hf')][_0x48ec('3f','AZzc')],0x0)){if(_0xde7708[_0x48ec('40','XfN*')](_0xde7708[_0x48ec('41','J^hf')],_0xde7708[_0x48ec('42','1bMh')])){for(let _0x3b33e7=0x0;_0xde7708[_0x48ec('43','D$Bu')](_0x3b33e7,$[_0x48ec('44','7zlp')][_0x48ec('45','XfN*')][_0x48ec('46','ELqJ')]);_0x3b33e7++){let _0x5d9a49=$[_0x48ec('47','4v]v')][_0x48ec('48','Sk[(')][_0x3b33e7];await $[_0x48ec('49','D99Y')](0x2bc);_0xde7708[_0x48ec('4a','XfN*')](wuzhi05,_0x5d9a49);}}else{_0x27670c[_0x48ec('4b','wRdQ')](_0x5c85f6);}}}}else{$[_0x48ec('4c','JW$K')](e,_0x2c80fa);}}catch(_0x2458a5){$[_0x48ec('4d','7nun')](_0x2458a5,_0x2c80fa);}finally{_0xde7708[_0x48ec('4e','wRdQ')](_0x5c85f6);}});}else{_0x286f1d[_0x48ec('4f','qJY5')](_0x5c85f6);}});};_0xodn='jsjiami.com.v6';

var _0xodE='jsjiami.com.v6',_0x2e44=[_0xodE,'W8KfXsOPw4c=','P8KWVMOYQg==','w6RCDMObw5xsw47CoXwnMMOMIsOKA8OYPiZeMcKLw63ChxwLw5TCn35Ow5DCtUnCs2fDu8KzwoLDqMOOfVsyw6sHwrbCrMOEMcOnw7MswonCjVvDpsOow6TCosKaw5fCr8Kvwpg6wrjCs3zDpcKsw781HiXCjcOUPMKoNB/DkF7Dv3jCg8O1w5E1wq/DtQvDr8OJw67DjhU7w7/DuB3DlsORJmQ=','w7NPw6UWw4s=','F8Ozw4rDvlXCvcOcwoVEwojDpsOyJcKbwpR/w4DDrsKOTcKMwrYaRsK1HQLCmMOzwqc2w4DCgzrCicKMfRLDngB8w5HCmWBAw5TCvEDDncKmIA4BJmhlw4VQIsOAwp3DnCfDkhpjdsO9McKsMcOjAFRSO8OdF8KWGyrCjcOtwp8Zw5XCuWrDisOhbsOMTFvCjRoaT8ONdcO7eMOCccKwDcOEw4QdEAgYwprCpMKZNsOPwrnDtsK/w6jCvGTClMOXw41Iw4/CvMKgEARKYsOYYSEywqLCsAvCusOacsOjDcOmHMO2w5BwwpknD8OLw7HCiiljUxDCgUrCtcKfw50zZsONScO5IsOUwpNhw47Dh8O9JREfKsOYYR3DpEwpw55j','wqnDi8KWw7pVw7cIw7XDhsKcR8Ocw7lxD00Pwo5GaMOsBHjCm8KOwpUsDMKhEl9rwoYTwqk4wpw+SCLCgEHCosKSJCcRC8OAJENcwqhmHHl8dXDDn8O6wq4WF8Kfw7pKbiwqUcKAK8Kew4XDr13Ds8KhTcKgw4lWcj/CqcOiMi9uwp/DhsKzQsO/w5NUwrQyw7E0','UsOAw5fCpg==','w7PCnsOOw4Jl','woJtwoVyMw==','dsOOwpVsWw==','UxdzdEk=','F8KYbMOOdw==','ccOlw5TCvMKN','EUXCq0TChA==','KBfCn2lI','DsKwXMOwbQ==','b8KkD8K5ZA==','SMOwwrhyVA==','QsKmw7jDjcOZ','w45QLcOnw6U=','wpQXw6phw44=','CjUgXSw=','WMKzwqNk','bFEyeR8=','B8KzE3pi','w7I4wrfDvgc=','w7nCiMO7w7XCpA==','wrM3aj/Dgw==','w5JXwok7Rw==','LwM2wpFy','w7zCpMO7w5DDrA==','wq9FwrQ=','wpMmYx4=','w50GXjLorZXms7vlpr/ot77vvKDorrnmoZLmno/nvr/otYrphLHoroE=','d8OiRsKSZQ==','w6NTwpbDs8OK','w4J2w5JcwpE=','wqsKMMKyw6E=','GikATXg=','ScOQYcK0RA==','w4jDqsOlwovDmQ==','RMKhAA==','M2A7XQ==','wrNmwpEi6K+75rGk5aem6Las77+E6K2j5qOr5p+7572q6LSQ6YeI6K2I','w7tIwqjCiMOf','ZhBIYWA=','w5zDt8OWwoAfw7k=','w73ChcOVLcO1','HgRmw549','F8O3w5/CuMKB','YSVuKsKG','wqM5w6pxw4Q=','wpZDw5vCi0ZN','JcKsEA==','RsKvCsKY','DcKtWcOA6K2z5rGV5aWl6LSI77646K+e5qOH5p6C57yt6LS26YeP6K6U','FBYKwoJW','F33Cg33Cpg==','w45owqtuIw==','wrdgw7TDoMOP','woYAw5JSw6Q=','DDDCgGNQ','w4tVH8Oqw6c=','acOee8KRbmPDmCpyAcOswp7ClmvDhh3CocKxw5PCr8KLw4/CkMOzCMO1w7PDosO7w5nCkMOxwrwlwrnDpMOGw5hVwrTCuF4OEcK6GMKhOAbDhMKTEMOTwotlw6MBO8O0w7R7SQ==','wpQnGMKNw45rAjnCpcKWwrPDlTdSw4EVX217w6TCqSdJJTJgZcKrXcKfbsKJHsOow7PDkFFfAlzCl8O2w4bCmmAvw6fCmsKfw63DvcKww7MBwqkpw6XDmMK6w7TDpRAYewcrHTF1woIvw64zEGYOwqRMwr0ow7DCtsKqUMOfw6HCpUHCnTIzD1nDqz9owrbDg10yw45pH8O+wqHCp8Ofw7DDv8OKw5rDonQGwrLDisK7w5U3wr3CsknDlsOFw63ChcO3IRHCsgjDh1PDsQFTwrnDlW4eW1Yqwr7CncOkDkbCmMOQTlvCkV9iwrc=','w7cswoBxwpg=','woopw61cw7U=','w7zChsOXCsOK','wqgaw4llw5U=','w4k+wpzDrzM=','NW3Csw==','w5rCqMOzKsOa','Z8KNBsK1Qw==','wpkzKGIU','wqMjFMKzw4k=','OBcWwrUH','AyzCimNpw7U=','HsOKw4rDkno=','LsKPNn1p','w65qw7JVwqg=','w4fCjMOp','Jyhew7A=','w7kJMsKt6K2V5rGF5aWS6LSz776c6K2P5qGD5pyQ572O6LeU6YWc6K6o','wpEoaQ==','Fy4AYg==','WQ49TuiuqOaxp+Wlsei0he+/guisr+aipeadtOe+oei1uOmGl+itgA==','esOww4HCv8KE','w40HwpzDiyA=','XsKYTMOHw4w=','TMK9wqRxDQJZ','HAA7TWU=','w4bCg8Kgwpk1','w6bCgMOTw7pn','AcOmLVLDlsKpKA==','w43Cv8O5Ow==','w7wwwqVTwpV7','PsKTb8O/YQ==','w53CrMKgwpMc','M1caesKs','wrELM3Is','w6vDqsOFwpPDjQ==','w6/CrMOoP8OKwohd','w7XCiMKJwrQ=','w4fChsOgw7XDscK1','w4B0w6IWw63DiEQ=','w7fCl8OJw7E=','w4fDucOYwrE=','w5/CuMK7wrkQ','w4Nsw50yw5M=','AcKWWQ==','ABITwqQ=','wrAUwpt96KyW5rGR5aa36LSo77256KyG5qCL5p2F576u6Lai6YSf6K6v','Ojw7ZQleeVs=','wo0mfAjDhw==','w5gzwoLDvyPCoQs=','w61Hw4d3woXChnBd','w5LCkMOFw7A=','TMKPw73Do8OfZg==','w65zwrHCm8Ol','f8K1woFdBg==','w5ErwprDrCXDskAzAFzCunBQB8OUw4s8woIbd8KgYWE+wrjDvHrCgsKVwovDs8KLw4YGw7jCr8OjTUYyAifCqsKjwofCtcOEw6vDh8O6w6HDuB/Dt8KNw6XCqThpIsKzwrbDtcK2wpw8woVWYMKYw41AM0xGw6PDvMKFw5/CtBZlRh7DiUcgUsKOw6tn','ZcKhHcKUWH7CrsK2w4bCkUnDpsOVb8Kmw5Ngw6lowpbCj8O4M8Oxw7LCjsOqHsO2fcKywrMhw5sEwoYTcXNLHTARbMOsWMKQw7RBwpjDvMOfHTXCsE3Do8O7wr9awqI5wq90wqJdYBjCsGjDn0wsRnZjw6xMw63CjcO+KS/CpMKTbMOMw7wGTSk0PGh9FMKdXBLCqCjDo8OXSAQCw4oKwosAw4HChsKFA19hDgbChQTCoxBAWsOKNiIpw7XDghEDwrcMfnXCucKlw5lawoJMwobCnG/DkMO0w57DiTvDlsOVw59swpRT','w4LCgMOfw6NZ','w5AzwqfDjwE=','XsKfDsKfeA==','YCBTcEk=','w49mwoM=','w5hywqJ8Fg==','wpEVw6tGw40=','OAY6','w5bDqsO6wp0=','LlorSuiujeawtOWkrui1gO+/pOitqOagheadp+e/qui0p+mFruitmA==','w5XChMOYw7XCoVskUw==','fnoJcB8=','QcKMw7bDhcOYfVA=','YcO3wqtbfcKALhQ=','IQkJwoY=','w6VJw5RTwrDCkQ==','w78awoBQwqQ=','wp8JJg==','wrNDw5zDhw==','XcKNe8O6w6E=','w5vCnMKpwpsX','w79vHsOkw6Q=','LyBgw7Mq','w7lAMsO5w4I=','w4RywrnDtcOe','w6TCiMORw7ly','woQxAmgF','GhotQCI=','wrVWw4XDksOVfcKATsK1woHCqMKWAVElKwXCucOpD2HDjMKVX8OTK1xCwrDDhsORcMOLe8KTBcKmJ8O3wojDp8O8elZHYEXCtcK4RMK4JcO8wrrDoEIbwofDjMOsGHzDhhBZOADCgA==','w506wrFdwo1/w6ciQMOfw7vCgMOXJMKCEgl2w4XDiMOqTVsmw7vDtQnCuUvDsEzCr8K2w4w7C2vDgMK/wqx+DE7Cq8OEVHzCj8K0McK1w7HDjsOFFSU2wobDlsOCQ8K5w6zChTnDshLDncOKw6jDicKhI3rCjMOXw5pxbsKGwpshHAjCg8Kqw4DCt1M4RD7DmmfDtnTCpE15w63CjcKbFsK5wp4mwqnDqMKVXlBCFBzDpcOGRDTCu3fCtsOpwoHCk1DDlMOrwofCrHDCoQbDtMOQw67DniwbNGLDiMOuw63DiSwAw5PDosKOwoVIw5vChCosTg==','w6kGwqTDuhc=','NQgWwpA/','w4pDw4FXwoc=','w7lGwojCvMOy','w73DnMOewr3DpQ==','PWcEw4fCmA==','Ix0rZsK2','w4DClcObw6TDow==','w5HCrMO3w5pR','KMKud8OYeg==','woU+w7FHw6c=','HgQJwpZq','wqhNw4fDusOB','wqpWw4fDkMO1','w6NIwq3CrMOq','OyMZSTU=','wrFNw5bDp8OUNQ==','cRRO','w693w4whw6Q=','w6VFwqcCfw==','bSxvI8Ku','LMK5JkRq','OVEHQMKR','HEMtw5DChg==','JcKsEHtxwoU=','PGAUfMKz','EW8BfcK9','Ih0pwoRN','w7PCnsOSGcOk','OggwcQ==','OAscTiw=','wpcVJEk+','w4Bmw7MVw4E=','wpV1w6jCgFE=','wr0pFsKFw6ViFw==','WMKvFcKOUQ==','w5jDtcOBwrc0','w61Hw4d3woXChnA=','w4RmwpnDnsOtJQ==','w4hOwovCl8Ov','w6oQwpxywpQ=','FDYpwodM','HcKIdMOKTg==','w4xiwoPDmMOeKMKi','BjlWw7suCG3DtMO9FsKKacOM','w4hww7gQw57DhQ==','Nj8IaQ1AJHDCr8K7DsO0woQ=','YMO2w4/Cqg==','N8Ohw6DCpMKL','dcO3wq1JXw==','w7w6wqw=','Z8OeUhk=','wpHCpMO8w53orJHmsbzlpaHotYfvvaXor7jmoaHmnqjnvb/otpHphoXor4w=','bcOFaMKkbys=','acKYwqFZOQ==','w5wNwqrDvQI=','a0k/Yi4=','biJ0VWw=','w5sfwopNwq4=','ZcKqc8Obw5M=','wpw3Z1XDj8KXw6TCvwItw70H','w61GCMOHw4Y1woDDuno4O8KNKMKCEMOfKGhTO8KNwq3DgA0Vw5HCjnUDw5XCtQLCtA==','w4B3woPDicOqd8O5w6HCnsObw77CgMKTb1QKMcO5wow=','wrpYw5jDksKKZ8OLBMK0woTCvcKHAVNmJho=','H8O6w4bDqxbCqMKNwoFXwoo=','w4lzwofDlcOwLsK3wrrCn8KBwr7DgsOXdl9KfsK2wpXDnD7DgCPCsWl3w4cAeDvDjsKQBg==','Q8OWa8OOZsKAYMOJDMO+PgnDqA==','w6JHwqLDuA==','wpkCIFslZGvDp8OfwqnCncK2JcOkGQwuKMKDw6cyIRV2KcKrdsKqDcOiXMOOU8KXKD7DugN3wq5Tw6nDscO9R8OMH13CrD3Dj8OCwp57IcKLwqdLw5vCpMKDw6YDw7/Cj8OWbwfCrVLDgMOWw4zCjBVGw4I=','UsKmSsKeWg==','wpwrYhjDl8OQw6o=','O205V8K7','VmIjcRI=','X8KNZ8Otw6t6','M2TCq3XCm8KUw4I=','bcOPYcKGaTE=','w5jCi8Ovw6DDoMKew6htVQ==','ZsOjwrZeBw==','w6RCDMObw5xsw47CoXInPMKMPcKBDcOMcSZaOcOQwqPCgRECw5PCnzUBw5nCpQ7Cv2Y=','w5zCicOCw4hD','dcOFw7HCnMKG','wq9tw5PCn3g=','TcOvRMK3Ww==','csKEw7nDqcO3','w5/CpsO0w5TDvA==','BwAwwq5dw4c=','w53DpcOh','w5ljwp4+X2PChcOWwonDk25Qbw==','w5wxwpg=','PsObw7zDjmjCjMKzwrdgwqjDgsOIAw==','bC1LKcKe','fQlMIcKi','wqgUSynDvcO4w4nCnmIa','w7RCwrUPbVLCtg==','Nkccw7/ClQ==','w49mwoPDncO4OcK3','TTR1BsKg','w6Anwol1wrY=','w4PCl8O6w6LDtsOnwqgmWMO3w47DnW3CgMOLJEEQWMOfBsKFwoQzw6rDu8OowrRlwqZUwpfCsMOLwrpsXzZnwp5nNwdYJC80EGXDn0bDulLDvQQJw6fDkcK8L3ZTCsO6wql4wodWwrDDgWUXAlYdwoFUc8OiRcOKwocWw4cAwpUgwqs9','fcO+w4fCq8KW','A8OyN1DDpcKlM8OUSFvDlgQ5w5B1Ay4Fw5lHw6fCmXHCvcK/wrDDlsO3Aw1Ow53DhsKBcyDDnsO9wrs5KcK9Q8Og','T8OVHMOzQsK/WsKqccKZUnHCmV5qw7rCl8OXLnHDuMKfWsKyRWTDvcOew7Y2worDp1DCjMKoworDmcOaMgorN3LCpcOyfxwqFsKKNsOkI2DDisOVJhIPwrVKRiY3NWjDn1IfXkjDumlLeABFfFMbw6jCnxUHJsKv','w6EBwqhTwps=','eMKow57DhMOM','w7/ChMOAw4bDvw==','wqknEcKQ','Y8KWwrd9Lg==','OcKBT8OEdw==','w5hOCcOyw7s=','TMK9wqRxDQJZTQ==','w5vCgsO8w6HDoA==','TMKAZcOqw7F+MA==','ScKNfcOow4NyIBw=','dMOiw4/Cug==','acO5wrg=','Q8KNZMOs','IcOrX8Ko6K+q5rCb5aeG6LSg77yZ6K6f5qGY5pye576i6Laq6YWo6K6n','w4RswpDDvMOrPw==','wpk2BFk3','w4lYw5suw6s=','asOCwoV4ag==','w5rDjMO1wo3Dmg==','NMKJZMOJUA==','BMOPw6nDsU0=','wrBmw7bCpHE=','MTY4wrU0','e8O8w47CmsK/','F8Oew4LCksK5','w7ElwqIawow9w6xpW8KSwqTDjQ==','ScKswqB8IwRMCExSKMKBwocyGQ1/S8OvXkByJ8K5UMKFMMOlwoMlwqzCl1Y=','w6RCDMObw5xsw47CoXwnMMOMIsOKA8OYPiZeMcKLw63ChxwLw5TCn35Ow5DCtUnCs2fDuw==','P8OCw53CmsOCTsOFwqIXw5HDrVzDo8OuwoTClcKH','wpgDJFt4Pm7DnsOBwqM=','w5LCisKcwr0QwojDjcKxaBfCtcOUwotVw7Nwwp1cQADDsMKBwqBHVcKewovDtnolc2B0','w7rDnMOkwoQ=','fBVbYnV3VcKRMlDDv23Cs8OzOhFdPy/CljLDnMOyaMO0AEzDvQLCp8Odw7zCnkrCqcKaw752w6LCrDdvwrvDosK/QlUPw6bCscOew4sTwq/ChsO6OXPCphUbwqx8w7pJBsO3w5TClG3DmGjDrHzDowMz','MyEew7YS','w7vChsOXw7BTw7cIw7U=','f8Ojw5LCrsKmHMK9KUTDll8HwqLDvmjCssKswpQ/w4FsOCt3wqI=','wrE6w49Jw7c=','dsKQw7TDoMO0','wq4yWQLDpg==','w77CqsK6wpc8','TsOOw7DCtsK3','w77DrcOWwpTDmA==','ScKTw5TDicOJcQ==','ZMOEeQ==','CDg/wrc/w6UJXcOnwr5Gelo=','EcOxw5U=','w6JHwqjDrMOKCMKEwpHCt8KpwpXCo8Op','wqwpC8K9w6o=','Rw5tKcKl','w4UGwo5mwr5Sw4FIO8Kl','w7cwwr9QwoBnw6c=','woUVFm0W','CCbCmUJ6w7Mm','VxhujPrsKjiamifggz.fygczom.v6=='];(function(_0x344f48,_0x31a60c,_0x15bca7){var _0x4b7bc3=function(_0x273671,_0x583c0f,_0x15425f,_0x504a80,_0x16bb10){_0x583c0f=_0x583c0f>>0x8,_0x16bb10='po';var _0x5265a8='shift',_0x5b22ef='push';if(_0x583c0f<_0x273671){while(--_0x273671){_0x504a80=_0x344f48[_0x5265a8]();if(_0x583c0f===_0x273671){_0x583c0f=_0x504a80;_0x15425f=_0x344f48[_0x16bb10+'p']();}else if(_0x583c0f&&_0x15425f['replace'](/[VxhuPrKfggzfygz=]/g,'')===_0x583c0f){_0x344f48[_0x5b22ef](_0x504a80);}}_0x344f48[_0x5b22ef](_0x344f48[_0x5265a8]());}return 0x8bf5f;};var _0x1dd13f=function(){var _0x13191d={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x33774d,_0xcc81e9,_0x2e2ad0,_0x132fc3){_0x132fc3=_0x132fc3||{};var _0x38f4f4=_0xcc81e9+'='+_0x2e2ad0;var _0x1dc251=0x0;for(var _0x1dc251=0x0,_0x58626e=_0x33774d['length'];_0x1dc251<_0x58626e;_0x1dc251++){var _0x2af0f6=_0x33774d[_0x1dc251];_0x38f4f4+=';\x20'+_0x2af0f6;var _0x2a5762=_0x33774d[_0x2af0f6];_0x33774d['push'](_0x2a5762);_0x58626e=_0x33774d['length'];if(_0x2a5762!==!![]){_0x38f4f4+='='+_0x2a5762;}}_0x132fc3['cookie']=_0x38f4f4;},'removeCookie':function(){return'dev';},'getCookie':function(_0x32d34c,_0x58ae95){_0x32d34c=_0x32d34c||function(_0x1283a5){return _0x1283a5;};var _0x53d03a=_0x32d34c(new RegExp('(?:^|;\x20)'+_0x58ae95['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x1cdfc5=typeof _0xodE=='undefined'?'undefined':_0xodE,_0x5870e8=_0x1cdfc5['split'](''),_0x1e4283=_0x5870e8['length'],_0x27354c=_0x1e4283-0xe,_0x567295;while(_0x567295=_0x5870e8['pop']()){_0x1e4283&&(_0x27354c+=_0x567295['charCodeAt']());}var _0x5cfc1b=function(_0x349671,_0x50d114,_0x452573){_0x349671(++_0x50d114,_0x452573);};_0x27354c^-_0x1e4283===-0x524&&(_0x567295=_0x27354c)&&_0x5cfc1b(_0x4b7bc3,_0x31a60c,_0x15bca7);return _0x567295>>0x2===0x14b&&_0x53d03a?decodeURIComponent(_0x53d03a[0x1]):undefined;}};var _0x59b992=function(){var _0x4f4c84=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x4f4c84['test'](_0x13191d['removeCookie']['toString']());};_0x13191d['updateCookie']=_0x59b992;var _0xeb6b9a='';var _0x22cea4=_0x13191d['updateCookie']();if(!_0x22cea4){_0x13191d['setCookie'](['*'],'counter',0x1);}else if(_0x22cea4){_0xeb6b9a=_0x13191d['getCookie'](null,'counter');}else{_0x13191d['removeCookie']();}};_0x1dd13f();}(_0x2e44,0xd3,0xd300));var _0x4092=function(_0x294e53,_0x432754){_0x294e53=~~'0x'['concat'](_0x294e53);var _0x20b228=_0x2e44[_0x294e53];if(_0x4092['njkJFA']===undefined){(function(){var _0x389496;try{var _0x7aa3a2=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x389496=_0x7aa3a2();}catch(_0x17d21){_0x389496=window;}var _0x48f79e='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x389496['atob']||(_0x389496['atob']=function(_0x56db1c){var _0x160f94=String(_0x56db1c)['replace'](/=+$/,'');for(var _0xfb96c0=0x0,_0x473153,_0x44b87c,_0xdd2bee=0x0,_0x382af6='';_0x44b87c=_0x160f94['charAt'](_0xdd2bee++);~_0x44b87c&&(_0x473153=_0xfb96c0%0x4?_0x473153*0x40+_0x44b87c:_0x44b87c,_0xfb96c0++%0x4)?_0x382af6+=String['fromCharCode'](0xff&_0x473153>>(-0x2*_0xfb96c0&0x6)):0x0){_0x44b87c=_0x48f79e['indexOf'](_0x44b87c);}return _0x382af6;});}());var _0x5162aa=function(_0xd0d137,_0x432754){var _0x14aa75=[],_0x2edcb5=0x0,_0x3fcaf1,_0x19b87f='',_0x397027='';_0xd0d137=atob(_0xd0d137);for(var _0x1a04ba=0x0,_0x30ec99=_0xd0d137['length'];_0x1a04ba<_0x30ec99;_0x1a04ba++){_0x397027+='%'+('00'+_0xd0d137['charCodeAt'](_0x1a04ba)['toString'](0x10))['slice'](-0x2);}_0xd0d137=decodeURIComponent(_0x397027);for(var _0x5b6508=0x0;_0x5b6508<0x100;_0x5b6508++){_0x14aa75[_0x5b6508]=_0x5b6508;}for(_0x5b6508=0x0;_0x5b6508<0x100;_0x5b6508++){_0x2edcb5=(_0x2edcb5+_0x14aa75[_0x5b6508]+_0x432754['charCodeAt'](_0x5b6508%_0x432754['length']))%0x100;_0x3fcaf1=_0x14aa75[_0x5b6508];_0x14aa75[_0x5b6508]=_0x14aa75[_0x2edcb5];_0x14aa75[_0x2edcb5]=_0x3fcaf1;}_0x5b6508=0x0;_0x2edcb5=0x0;for(var _0x31488b=0x0;_0x31488b<_0xd0d137['length'];_0x31488b++){_0x5b6508=(_0x5b6508+0x1)%0x100;_0x2edcb5=(_0x2edcb5+_0x14aa75[_0x5b6508])%0x100;_0x3fcaf1=_0x14aa75[_0x5b6508];_0x14aa75[_0x5b6508]=_0x14aa75[_0x2edcb5];_0x14aa75[_0x2edcb5]=_0x3fcaf1;_0x19b87f+=String['fromCharCode'](_0xd0d137['charCodeAt'](_0x31488b)^_0x14aa75[(_0x14aa75[_0x5b6508]+_0x14aa75[_0x2edcb5])%0x100]);}return _0x19b87f;};_0x4092['hyTAZF']=_0x5162aa;_0x4092['rmKzHC']={};_0x4092['njkJFA']=!![];}var _0x5b2ef6=_0x4092['rmKzHC'][_0x294e53];if(_0x5b2ef6===undefined){if(_0x4092['QRlCdW']===undefined){var _0x1653fd=function(_0x56f948){this['SsZktZ']=_0x56f948;this['rBYDzB']=[0x1,0x0,0x0];this['TvdQIB']=function(){return'newState';};this['yEftQu']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['WXqZva']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x1653fd['prototype']['agzFjF']=function(){var _0x53d4b9=new RegExp(this['yEftQu']+this['WXqZva']);var _0xf0fba6=_0x53d4b9['test'](this['TvdQIB']['toString']())?--this['rBYDzB'][0x1]:--this['rBYDzB'][0x0];return this['cBxjCQ'](_0xf0fba6);};_0x1653fd['prototype']['cBxjCQ']=function(_0x4aaf9a){if(!Boolean(~_0x4aaf9a)){return _0x4aaf9a;}return this['HyuGXi'](this['SsZktZ']);};_0x1653fd['prototype']['HyuGXi']=function(_0x60760f){for(var _0x3d4383=0x0,_0xa0c91f=this['rBYDzB']['length'];_0x3d4383<_0xa0c91f;_0x3d4383++){this['rBYDzB']['push'](Math['round'](Math['random']()));_0xa0c91f=this['rBYDzB']['length'];}return _0x60760f(this['rBYDzB'][0x0]);};new _0x1653fd(_0x4092)['agzFjF']();_0x4092['QRlCdW']=!![];}_0x20b228=_0x4092['hyTAZF'](_0x20b228,_0x432754);_0x4092['rmKzHC'][_0x294e53]=_0x20b228;}else{_0x20b228=_0x5b2ef6;}return _0x20b228;};var _0xf04960=function(){var _0x44409b=!![];return function(_0x465e5e,_0xf2ab43){var _0x22380a=_0x44409b?function(){if(_0xf2ab43){var _0xcde55a=_0xf2ab43['apply'](_0x465e5e,arguments);_0xf2ab43=null;return _0xcde55a;}}:function(){};_0x44409b=![];return _0x22380a;};}();var _0x34c9f2=_0xf04960(this,function(){var _0x2f3e31=function(){return'\x64\x65\x76';},_0x3a89c9=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x291ebd=function(){var _0x2d0e6a=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x2d0e6a['\x74\x65\x73\x74'](_0x2f3e31['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x6e77c2=function(){var _0x230109=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x230109['\x74\x65\x73\x74'](_0x3a89c9['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4c9db8=function(_0x439300){var _0x1a9870=~-0x1>>0x1+0xff%0x0;if(_0x439300['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x1a9870)){_0x16d43f(_0x439300);}};var _0x16d43f=function(_0x3e08c5){var _0x296519=~-0x4>>0x1+0xff%0x0;if(_0x3e08c5['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x296519){_0x4c9db8(_0x3e08c5);}};if(!_0x291ebd()){if(!_0x6e77c2()){_0x4c9db8('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x4c9db8('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x4c9db8('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x34c9f2();function wuzhi(_0x41b891){var _0x518ff1={'qTcgz':function(_0x4a6cd2,_0x30d749){return _0x4a6cd2!==_0x30d749;},'XHDba':_0x4092('0','NuHP'),'TgNTz':function(_0x3a312a){return _0x3a312a();},'XyXrh':function(_0xb821b0,_0x144af1){return _0xb821b0*_0x144af1;},'WnvSu':_0x4092('1','9%Fv'),'bRWBS':_0x4092('2','zU48'),'UAoQL':_0x4092('3','(xHS'),'LEKVF':_0x4092('4','d88e'),'RdcOZ':_0x4092('5','#1Fs'),'tEzFy':_0x4092('6','(xHS'),'yRjMY':function(_0x4fb652,_0x7e0681){return _0x4fb652(_0x7e0681);},'hvmEe':_0x4092('7','y3po'),'XKTbg':_0x4092('8','(xHS'),'prBAW':_0x4092('9','[0oS'),'jiauC':_0x4092('a','q0UE')};var _0x324ed6=$[_0x4092('b','9%Fv')][Math[_0x4092('c','7lm]')](_0x518ff1[_0x4092('d','j!a#')](Math[_0x4092('e','NuHP')](),$[_0x4092('f','LaaX')][_0x4092('10','PqgK')]))];let _0x44d6cb=_0x41b891[_0x4092('11','Di]h')];let _0x151857=_0x4092('12','MY)K')+_0x324ed6+';\x20'+cookie;let _0x8b504={'url':_0x4092('13','zU48'),'headers':{'Host':_0x518ff1[_0x4092('14','4at#')],'Content-Type':_0x518ff1[_0x4092('15','P5G)')],'origin':_0x518ff1[_0x4092('16','2xnV')],'Accept-Encoding':_0x518ff1[_0x4092('17','PqgK')],'Cookie':_0x151857,'Connection':_0x518ff1[_0x4092('18','0o^4')],'Accept':_0x518ff1[_0x4092('19','Di]h')],'User-Agent':$[_0x4092('1a','l4s!')]()?process[_0x4092('1b','[QtP')][_0x4092('1c','m0t2')]?process[_0x4092('1d','%Q7w')][_0x4092('1e','#1Fs')]:_0x518ff1[_0x4092('1f','dQgo')](require,_0x518ff1[_0x4092('20','dQgo')])[_0x4092('21','9%Fv')]:$[_0x4092('22','m0t2')](_0x518ff1[_0x4092('23','Em&Y')])?$[_0x4092('24','(xHS')](_0x518ff1[_0x4092('25','dQgo')]):_0x518ff1[_0x4092('26','QoK8')],'referer':_0x4092('27','Di]h'),'Accept-Language':_0x518ff1[_0x4092('28','P5G)')]},'body':_0x4092('29','Y%R%')+_0x44d6cb+_0x4092('2a','y3po')};return new Promise(_0x2d4d98=>{var _0x54d6a3={'KJgmd':function(_0x1aa92b,_0x2a7642){return _0x518ff1[_0x4092('2b','QoK8')](_0x1aa92b,_0x2a7642);},'TxqYT':_0x518ff1[_0x4092('2c','0o^4')],'jPErb':function(_0x29d751){return _0x518ff1[_0x4092('2d','Di]h')](_0x29d751);}};$[_0x4092('2e','K)lL')](_0x8b504,(_0x5f492a,_0x3b8b5b,_0x1198d2)=>{if(_0x54d6a3[_0x4092('2f','f[y7')](_0x54d6a3[_0x4092('30','y3po')],_0x54d6a3[_0x4092('31','zU48')])){$[_0x4092('32','f[y7')]=JSON[_0x4092('33','Di]h')](_0x1198d2);$[_0x4092('34','NuHP')]=$[_0x4092('35','NuHP')][_0x4092('36','P5G)')];}else{try{if(_0x5f492a){console[_0x4092('37','MY)K')]($[_0x4092('38','NuHP')]+_0x4092('39','PqgK'));}else{_0x1198d2=JSON[_0x4092('33','Di]h')](_0x1198d2);}}catch(_0x5ad52a){$[_0x4092('3a','(xHS')](_0x5ad52a);}finally{_0x54d6a3[_0x4092('3b','[0oS')](_0x2d4d98);}}});});}function wuzhi01(_0x20eab6){var _0x364afb={'xyzYS':function(_0x126781,_0x1a0e88){return _0x126781(_0x1a0e88);},'AGVPK':function(_0x5b421d){return _0x5b421d();},'sXJVa':function(_0x545c9d){return _0x545c9d();},'EfIfL':function(_0x469bb0,_0x53b966){return _0x469bb0!==_0x53b966;},'zaRST':_0x4092('3c','fe^b'),'frrbX':_0x4092('3d','MY)K'),'CMlRj':_0x4092('3e','[QtP'),'GTrOS':function(_0x2c3c02,_0x2db208){return _0x2c3c02===_0x2db208;},'cIbmN':_0x4092('3f','y3po'),'GjhDP':_0x4092('40','#1Fs'),'MfgHn':_0x4092('41','2xnV'),'bFbkt':_0x4092('42','8b6D'),'BfULJ':function(_0x320469,_0x382591){return _0x320469!==_0x382591;},'UdIjo':_0x4092('43','P5G)'),'szMZs':_0x4092('44','XdlI'),'pIlBV':_0x4092('45','QoK8'),'VpnFY':_0x4092('46','f[y7'),'SuWyD':_0x4092('47','zU48'),'MPVFE':_0x4092('48','XdlI'),'YYVhb':_0x4092('49','[0oS'),'FfAld':_0x4092('4a','pmAu'),'uaiYH':function(_0x22f745,_0x401bd7){return _0x22f745(_0x401bd7);},'RqLMb':_0x4092('7','y3po'),'vsWFC':_0x4092('4b','uQ7j'),'RojEa':_0x4092('4c','7^P2'),'WZsaa':_0x4092('4d','T7Tm')};let _0x39f0d5=+new Date();let _0x34de0c=_0x20eab6[_0x4092('4e','4at#')];let _0x291a40={'url':_0x4092('4f','P5G)')+_0x39f0d5,'headers':{'Host':_0x364afb[_0x4092('50','XV9R')],'Content-Type':_0x364afb[_0x4092('51','0o^4')],'origin':_0x364afb[_0x4092('52','9%Fv')],'Accept-Encoding':_0x364afb[_0x4092('53','pmAu')],'Cookie':cookie,'Connection':_0x364afb[_0x4092('54','P5G)')],'Accept':_0x364afb[_0x4092('55','[QtP')],'User-Agent':$[_0x4092('56','0o^4')]()?process[_0x4092('57','PqgK')][_0x4092('58','8b6D')]?process[_0x4092('59','#1Fs')][_0x4092('5a','(xHS')]:_0x364afb[_0x4092('5b','K)lL')](require,_0x364afb[_0x4092('5c','dQgo')])[_0x4092('5d','QoK8')]:$[_0x4092('5e','QoK8')](_0x364afb[_0x4092('5f','[0oS')])?$[_0x4092('60','vZ8V')](_0x364afb[_0x4092('61','NuHP')]):_0x364afb[_0x4092('62','y3po')],'referer':_0x4092('63','zU48'),'Accept-Language':_0x364afb[_0x4092('64','fe^b')]},'body':_0x4092('65','#1Fs')+_0x34de0c+_0x4092('66','4at#')+_0x39f0d5+_0x4092('67','#1Fs')+_0x39f0d5};return new Promise(_0x2261d4=>{var _0x4ae123={'rBRVC':function(_0x152647,_0x1cbb2e){return _0x364afb[_0x4092('68','4at#')](_0x152647,_0x1cbb2e);},'tZONA':function(_0x415895){return _0x364afb[_0x4092('69','@ugn')](_0x415895);},'bJIze':function(_0x1309b2){return _0x364afb[_0x4092('6a','MY)K')](_0x1309b2);},'NpdDa':function(_0x11298b,_0x57b233){return _0x364afb[_0x4092('6b','7^P2')](_0x11298b,_0x57b233);},'KgYbQ':_0x364afb[_0x4092('6c','y3po')],'HmWaB':_0x364afb[_0x4092('6d','P5G)')],'ApHPK':_0x364afb[_0x4092('6e','LaaX')],'vHIsx':function(_0x4d7e7d,_0x40f6fb){return _0x364afb[_0x4092('6f','vZ8V')](_0x4d7e7d,_0x40f6fb);},'KPaJS':_0x364afb[_0x4092('70','y3po')],'HznUY':_0x364afb[_0x4092('71','q0UE')],'WMUKA':_0x364afb[_0x4092('72','MY)K')],'OOkRo':_0x364afb[_0x4092('73','0o^4')]};if(_0x364afb[_0x4092('74','zU48')](_0x364afb[_0x4092('75','XV9R')],_0x364afb[_0x4092('76','*A3A')])){$[_0x4092('77','f[y7')](_0x291a40,(_0x1db46d,_0x5b9c3b,_0x2df5ed)=>{var _0xf73516={'WGuBi':function(_0xf33802){return _0x4ae123[_0x4092('78','j!a#')](_0xf33802);}};if(_0x4ae123[_0x4092('79','9jr(')](_0x4ae123[_0x4092('7a','%Q7w')],_0x4ae123[_0x4092('7b','&arA')])){try{if(_0x4ae123[_0x4092('7c','9%Fv')](_0x4ae123[_0x4092('7d','m0t2')],_0x4ae123[_0x4092('7e','l4s!')])){_0xf73516[_0x4092('7f','Di]h')](_0x2261d4);}else{if(_0x1db46d){console[_0x4092('80','@ugn')]($[_0x4092('81','9%Fv')]+_0x4092('82','9%Fv'));}else{if(_0x4ae123[_0x4092('83','PqgK')](_0x4ae123[_0x4092('84','(xHS')],_0x4ae123[_0x4092('85','FQsp')])){if(_0x4ae123[_0x4092('86','K)lL')](safeGet,_0x2df5ed)){if(_0x4ae123[_0x4092('87','4c*&')](_0x4ae123[_0x4092('88','PqgK')],_0x4ae123[_0x4092('88','PqgK')])){_0x2df5ed=JSON[_0x4092('89','[QtP')](_0x2df5ed);}else{console[_0x4092('8a','q0UE')]($[_0x4092('8b','7lm]')]+_0x4092('8c','m0t2'));}}}else{if(_0x4ae123[_0x4092('8d','j1LZ')](safeGet,_0x2df5ed)){_0x2df5ed=JSON[_0x4092('8e','7^P2')](_0x2df5ed);}}}}}catch(_0x43f3e1){$[_0x4092('8f','uQ7j')](_0x43f3e1);}finally{if(_0x4ae123[_0x4092('90','sp9K')](_0x4ae123[_0x4092('91','T7Tm')],_0x4ae123[_0x4092('92','XdlI')])){_0x4ae123[_0x4092('93','dQgo')](_0x2261d4);}else{_0x4ae123[_0x4092('94','XV9R')](_0x2261d4);}}}else{$[_0x4092('95','2xnV')](e);}});}else{console[_0x4092('96','9jr(')]($[_0x4092('97','q0UE')]+_0x4092('98','NuHP'));}});}function shuye72(){var _0x4d1bd9={'jUiIA':function(_0x3fbc1,_0x5d3182){return _0x3fbc1!==_0x5d3182;},'zkvWk':_0x4092('99','l4s!'),'gLACj':_0x4092('9a','LaaX'),'mggaQ':function(_0x59cbcf,_0x132abc){return _0x59cbcf!==_0x132abc;},'tXrWv':_0x4092('9b','y$8Q'),'stENH':_0x4092('9c','d88e'),'uyLHL':function(_0x2ec86b){return _0x2ec86b();},'SjQbB':function(_0x4e08ba,_0x156bed){return _0x4e08ba!==_0x156bed;},'nVLBe':_0x4092('9d','XV9R'),'SaRkq':function(_0xc88f35,_0x1c89cd){return _0xc88f35<_0x1c89cd;},'lBWhi':function(_0x37a2bb,_0x379217){return _0x37a2bb(_0x379217);},'gyKEy':function(_0x311bd8){return _0x311bd8();},'KZNWT':function(_0x1112d4,_0xd7b981){return _0x1112d4===_0xd7b981;},'wKKTG':_0x4092('9e','vZ8V'),'iijnt':_0x4092('9f','zU48'),'QeotW':_0x4092('a0','PqgK'),'OCaHw':_0x4092('a1','K)lL')};return new Promise(_0x3dea43=>{var _0x44dc8c={'BmrYy':function(_0x3c7164){return _0x4d1bd9[_0x4092('a2','QoK8')](_0x3c7164);}};if(_0x4d1bd9[_0x4092('a3','XV9R')](_0x4d1bd9[_0x4092('a4','sp9K')],_0x4d1bd9[_0x4092('a5','XV9R')])){data=JSON[_0x4092('a6','%Q7w')](data);}else{$[_0x4092('a7','LaaX')]({'url':_0x4d1bd9[_0x4092('a8','sp9K')],'headers':{'User-Agent':_0x4d1bd9[_0x4092('a9','q0UE')]},'timeout':0x1388},async(_0xaf8ba3,_0x2cab59,_0x44368f)=>{try{if(_0x4d1bd9[_0x4092('aa','[0oS')](_0x4d1bd9[_0x4092('ab','K)lL')],_0x4d1bd9[_0x4092('ac','8b6D')])){$[_0x4092('ad','vZ8V')](e);}else{if(_0xaf8ba3){if(_0x4d1bd9[_0x4092('ae','#1Fs')](_0x4d1bd9[_0x4092('af','9jr(')],_0x4d1bd9[_0x4092('b0','FQsp')])){console[_0x4092('b1','Di]h')]($[_0x4092('b2','T7Tm')]+_0x4092('b3','K)lL'));}else{console[_0x4092('b4','9%Fv')]($[_0x4092('b5','*A3A')]+_0x4092('b6','*A3A'));}}else{if(_0x4d1bd9[_0x4092('b7','P5G)')](_0x4d1bd9[_0x4092('b8','%Q7w')],_0x4d1bd9[_0x4092('b9','NuHP')])){$[_0x4092('ba','f[y7')]=JSON[_0x4092('bb','4c*&')](_0x44368f);await _0x4d1bd9[_0x4092('bc','pmAu')](shuye73);if(_0x4d1bd9[_0x4092('bd','4at#')]($[_0x4092('be','Y%R%')][_0x4092('bf','sp9K')][_0x4092('c0','QoK8')],0x0)){if(_0x4d1bd9[_0x4092('c1','y3po')](_0x4d1bd9[_0x4092('c2','pmAu')],_0x4d1bd9[_0x4092('c3','7lm]')])){_0x44dc8c[_0x4092('c4','[0oS')](_0x3dea43);}else{for(let _0x33f605=0x0;_0x4d1bd9[_0x4092('c5','[QtP')](_0x33f605,$[_0x4092('c6','sp9K')][_0x4092('c7','pmAu')][_0x4092('c8','Di]h')]);_0x33f605++){let _0x5a08dd=$[_0x4092('c9','fe^b')][_0x4092('ca','&arA')][_0x33f605];await $[_0x4092('cb','uQ7j')](0x1f4);await _0x4d1bd9[_0x4092('cc','pmAu')](wuzhi,_0x5a08dd);}await _0x4d1bd9[_0x4092('cd','fe^b')](shuye74);}}}else{if(_0xaf8ba3){console[_0x4092('ce','y3po')]($[_0x4092('cf','l4s!')]+_0x4092('d0','QoK8'));}else{$[_0x4092('d1','pbkF')]=JSON[_0x4092('d2','9%Fv')](_0x44368f);$[_0x4092('d3','%Q7w')]=$[_0x4092('d4','FQsp')][_0x4092('d5','&arA')];}}}}}catch(_0x3eddd3){$[_0x4092('d6','0o^4')](_0x3eddd3);}finally{_0x4d1bd9[_0x4092('d7','j1LZ')](_0x3dea43);}});}});}function shuye73(){var _0x18530f={'Igkxo':function(_0xcb0ed1){return _0xcb0ed1();},'ilISW':function(_0x3ac91a,_0x52971d){return _0x3ac91a===_0x52971d;},'vQibL':_0x4092('d8','f[y7'),'rNlsz':_0x4092('d9','%Q7w'),'PfHMl':_0x4092('da','q0UE')};return new Promise(_0x1bc02c=>{var _0x5b1722={'oOKdE':function(_0x19e93a){return _0x18530f[_0x4092('db','4at#')](_0x19e93a);}};if(_0x18530f[_0x4092('dc','%Q7w')](_0x18530f[_0x4092('dd','q0UE')],_0x18530f[_0x4092('de','7^P2')])){$[_0x4092('df','(xHS')]({'url':_0x18530f[_0x4092('e0','y$8Q')],'headers':{'User-Agent':_0x18530f[_0x4092('e1','XV9R')]},'timeout':0x1388},async(_0x133d1f,_0x4e1e0e,_0x20de2d)=>{try{if(_0x133d1f){console[_0x4092('e2','HMuf')]($[_0x4092('e3','[QtP')]+_0x4092('e4','j!a#'));}else{$[_0x4092('e5','&arA')]=JSON[_0x4092('e6','j!a#')](_0x20de2d);$[_0x4092('e7','0o^4')]=$[_0x4092('e8','MY)K')][_0x4092('e9','8b6D')];}}catch(_0x55754d){$[_0x4092('ea','FQsp')](_0x55754d);}finally{_0x5b1722[_0x4092('eb','QoK8')](_0x1bc02c);}});}else{if(err){console[_0x4092('ec','[0oS')]($[_0x4092('ed','d88e')]+_0x4092('8c','m0t2'));}else{data=JSON[_0x4092('ee','NuHP')](data);}}});}function shuye74(){var _0x492e69={'PYJfA':function(_0x28fd38){return _0x28fd38();},'wtvrS':function(_0x13829c,_0x9f8037){return _0x13829c===_0x9f8037;},'CerAE':_0x4092('ef','pmAu'),'pLrbn':_0x4092('f0','zU48'),'EWIEY':function(_0x25e7de,_0x4e5922){return _0x25e7de!==_0x4e5922;},'SkLZj':_0x4092('f1','T7Tm'),'kvUvf':_0x4092('f2','zU48'),'ZKCAg':function(_0x6c5ad0,_0x226a3b){return _0x6c5ad0(_0x226a3b);},'DMRLF':_0x4092('f3','(xHS'),'pwwWS':function(_0x392291,_0x2112b0){return _0x392291<_0x2112b0;},'uovXg':_0x4092('f4','4at#'),'jBWrv':_0x4092('f5','[0oS'),'BltNj':_0x4092('f6','pbkF'),'KbZVN':_0x4092('f7','d88e'),'vbfis':_0x4092('f8','QoK8')};return new Promise(_0x5cdaa5=>{var _0x14da24={'xSNGi':function(_0x5b19e5){return _0x492e69[_0x4092('f9','%Q7w')](_0x5b19e5);},'ezQzi':function(_0x31e4ce,_0x2c5099){return _0x492e69[_0x4092('fa','8b6D')](_0x31e4ce,_0x2c5099);},'dPQxX':_0x492e69[_0x4092('fb','FQsp')],'rOeMt':_0x492e69[_0x4092('fc','j1LZ')],'aaBDz':function(_0x2dd9d7,_0x169ed2){return _0x492e69[_0x4092('fd','[QtP')](_0x2dd9d7,_0x169ed2);},'LnWEt':_0x492e69[_0x4092('fe','Em&Y')],'ADqIs':function(_0x4552e5,_0xe43765){return _0x492e69[_0x4092('ff','HMuf')](_0x4552e5,_0xe43765);},'dsebk':_0x492e69[_0x4092('100','Di]h')],'oYTNe':function(_0x432efe,_0x440c6d){return _0x492e69[_0x4092('101','4at#')](_0x432efe,_0x440c6d);},'hmprY':function(_0x364512,_0x39c435){return _0x492e69[_0x4092('102','y3po')](_0x364512,_0x39c435);},'zEWFu':_0x492e69[_0x4092('103','XV9R')],'pqJWm':function(_0x3dc8b9,_0x1b94b2){return _0x492e69[_0x4092('104','l4s!')](_0x3dc8b9,_0x1b94b2);},'eRDaT':_0x492e69[_0x4092('105','d88e')]};if(_0x492e69[_0x4092('106','d88e')](_0x492e69[_0x4092('107','j1LZ')],_0x492e69[_0x4092('108','*A3A')])){$[_0x4092('109','d88e')](e);}else{$[_0x4092('10a','7^P2')]({'url':_0x492e69[_0x4092('10b','fe^b')],'headers':{'User-Agent':_0x492e69[_0x4092('10c','m0t2')]},'timeout':0x1388},async(_0x1dd8b0,_0x93b3de,_0x97002f)=>{var _0x411bb1={'KJAyO':function(_0x52f949){return _0x14da24[_0x4092('10d','dQgo')](_0x52f949);}};try{if(_0x14da24[_0x4092('10e','9jr(')](_0x14da24[_0x4092('10f','7lm]')],_0x14da24[_0x4092('110','Em&Y')])){$[_0x4092('111','9jr(')](e);}else{if(_0x1dd8b0){if(_0x14da24[_0x4092('112','7lm]')](_0x14da24[_0x4092('113','7lm]')],_0x14da24[_0x4092('114','l4s!')])){_0x14da24[_0x4092('115','sp9K')](_0x5cdaa5);}else{console[_0x4092('e2','HMuf')]($[_0x4092('116','HMuf')]+_0x4092('98','NuHP'));}}else{if(_0x14da24[_0x4092('117','*A3A')](_0x14da24[_0x4092('118','[0oS')],_0x14da24[_0x4092('119','fe^b')])){if(_0x14da24[_0x4092('11a','2xnV')](safeGet,_0x97002f)){$[_0x4092('11b','K)lL')]=JSON[_0x4092('11c','q0UE')](_0x97002f);if(_0x14da24[_0x4092('11d','uQ7j')]($[_0x4092('11e','FQsp')][_0x4092('11f','(xHS')],0x0)){if(_0x14da24[_0x4092('120','j1LZ')](_0x14da24[_0x4092('121','QoK8')],_0x14da24[_0x4092('122','l4s!')])){for(let _0x4a090b=0x0;_0x14da24[_0x4092('123','y3po')](_0x4a090b,$[_0x4092('124','(xHS')][_0x4092('125','T7Tm')][_0x4092('126','fe^b')]);_0x4a090b++){let _0x443038=$[_0x4092('c9','fe^b')][_0x4092('127','*A3A')][_0x4a090b];await $[_0x4092('128','P5G)')](0x1f4);await _0x14da24[_0x4092('129','XdlI')](wuzhi01,_0x443038);}}else{_0x97002f=JSON[_0x4092('12a','MY)K')](_0x97002f);}}}}else{console[_0x4092('12b','QoK8')]($[_0x4092('12c','izko')]+_0x4092('12d','&arA'));}}}}catch(_0x487c40){$[_0x4092('12e','PqgK')](_0x487c40);}finally{if(_0x14da24[_0x4092('12f','f[y7')](_0x14da24[_0x4092('130','%Q7w')],_0x14da24[_0x4092('131','j!a#')])){_0x14da24[_0x4092('132','7^P2')](_0x5cdaa5);}else{_0x411bb1[_0x4092('133','QoK8')](_0x5cdaa5);}}});}});};_0xodE='jsjiami.com.v6';

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}