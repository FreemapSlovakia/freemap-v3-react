"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.categoryKeys = exports.getNameFromOsmElementSync = exports.getNameFromOsmElement = exports.resolveGenericName = void 0;
function resolveGenericName(m, tags) {
    var parts = [];
    for (var _i = 0, _a = Object.entries(tags); _i < _a.length; _i++) {
        var _b = _a[_i], k = _b[0], v = _b[1];
        var valMapping = m[k];
        if (!valMapping) {
            continue;
        }
        if (typeof valMapping === 'string') {
            parts.push(valMapping.replace('{}', v));
            continue;
        }
        if (valMapping[v]) {
            var subkeyMapping = valMapping[v];
            if (typeof subkeyMapping === 'string') {
                parts.push(subkeyMapping.replace('{}', v));
                continue;
            }
            var res = resolveGenericName(subkeyMapping, tags);
            if (res) {
                parts.push(res.replace('{}', v));
                continue;
            }
            if (typeof subkeyMapping['*'] === 'string') {
                parts.push(subkeyMapping['*'].replace('{}', v));
                continue;
            }
        }
        if (typeof valMapping['*'] === 'string') {
            parts.push(valMapping['*'].replace('{}', v));
            continue;
        }
    }
    return parts.length === 0 ? undefined : parts.join('; ');
}
exports.resolveGenericName = resolveGenericName;
function getNameFromOsmElement(tags, type, lang) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, osmTagToNameMapping, colorNames;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require(
                    /* webpackChunkName: "osmTagToNameMapping-[request]" */
                    "./osmTagToNameMapping-" + (['sk', 'cs'].includes(lang) ? lang : 'en') + ".ts"); })];
                case 1:
                    _a = (_b.sent()), osmTagToNameMapping = _a.osmTagToNameMapping, colorNames = _a.colorNames;
                    return [2 /*return*/, getNameFromOsmElementSync(tags, type, lang, osmTagToNameMapping, colorNames)];
            }
        });
    });
}
exports.getNameFromOsmElement = getNameFromOsmElement;
function getNameFromOsmElementSync(tags, type, lang, osmTagToNameMapping, colorNames) {
    var _a, _b, _c, _d;
    var langName = tags['name:' + lang];
    var name = tags['name'];
    var effName = name && langName && langName !== name ? langName + (" (" + name + ")") : name;
    // TODO alt_name, loc_name, ...
    var ref = tags['ref'];
    var operator = tags['operator'];
    var subj = resolveGenericName(osmTagToNameMapping, tags);
    if (type === 'relation' && tags['type'] === 'route') {
        var color = (_c = colorNames[((_a = tags['osmc:symbol']) !== null && _a !== void 0 ? _a : '').replace(/:.*/, '') || ((_b = tags['colour']) !== null && _b !== void 0 ? _b : '')]) !== null && _c !== void 0 ? _c : '';
        subj = color + ' ' + subj;
    }
    return [
        subj !== null && subj !== void 0 ? subj : (process.env['NODE_ENV'] === 'production' ? '' : JSON.stringify(tags)),
        (_d = effName !== null && effName !== void 0 ? effName : ref) !== null && _d !== void 0 ? _d : operator,
    ];
}
exports.getNameFromOsmElementSync = getNameFromOsmElementSync;
// TODO add others
exports.categoryKeys = new Set([
    'admin_level',
    'amenity',
    'barrier',
    'boundary',
    'building',
    'bus',
    'cusine',
    'highway',
    'historic',
    'information',
    'landuse',
    'leaf_type',
    'leisure',
    'man_made',
    'natural',
    'network',
    'office',
    'public_transport',
    'railway',
    'route',
    'service',
    'shelter',
    'shop',
    'sport',
    'tactile_paving',
    'tourism',
    'type',
    'vending',
    'wall',
    'water',
    'waterway',
]);
