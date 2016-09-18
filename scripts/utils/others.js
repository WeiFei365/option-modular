import _ from 'lodash';

import {
    objectIsEmpty,
    jsonOnlyKeys
} from './extendjs.js';


/**
 * from:
 *  "a.b.c"
 * to:
 *  {
 *      a: {
 *          b: {
 *              c: lastValue
 *          }
 *      }
 *  }
 * @param  {[String]} keyPaths              [description]
 * @param  {[type]} [lastValue=undefined]   [description]
 * @return {[Object]}                       [description]
 */
export function stringPathToJson(keyPaths, lastValue = undefined) {
    let jsonPath = {};

    if (!_.isString(keyPaths)) { return undefined; }

    const keys = keyPaths.split('.');
    for (let i = 0, next = jsonPath; i < keys.length; i++) {
        next[keys[i]] = (i + 1) === keys.length ? lastValue : (next = {});
    }

    jsonPath.$length = keys.length;
    jsonPath.$first = keys[0];
    return jsonPath;
}

/**
 * from:
 *  {
 *      a: {
 *          b: {
 *              c: null
 *          }
 *      }
 *  }
 * to:
 *  `[${prePath}.]a.b.c`
 * @param  {[type]} jsonPath     [description]
 * @param  {Array}  [prePath=[]] [description]
 * @return {[type]}              [description]
 */
export function jsonToStringPaths(jsonPath, prePath = []) {
    let paths = [];

    function toLeaf(level, prePath) {
        if (!_.isPlainObject(level)) {
            return paths.push(prePath.join('.'));
        }

        for (var pathKey in level) {if (level.hasOwnProperty(pathKey)) {
            toLeaf(level[pathKey], prePath.concat([pathKey]));
        }}
    }
    toLeaf(jsonPath, prePath);

    return paths;
}

/**
 * [optionSetters description]
 * @param  {[type]} option              整个 option
 * @param  {[type]} optionByKeyPath     option.key 真正的验证器
 * @param  {Object} [userOption={}]     需要更新的 option；为了提高遍历性能、减少不必要的 keys 遍历，默认以用户需要的 keys 作为基石
 * @param  {Object} [keyPaths={}]       为了提高遍历性能、减少不必要的 keys 遍历
 * @param  {[type]} [mustNextAll=false} =             {}] 忽视用户需要的 keys，以 option 作为 keys 的基石
 * @return {[type]}                     [description]
 */
export function optionSetters(option, optionByKeyPath, {
    userOption = {},
    keyPaths = {},
    mustNextAll = false
} = {}) {

    if (objectIsEmpty(keyPaths)) {
        keyPaths = jsonOnlyKeys(objectIsEmpty(userOption) ? option : userOption);

        if (objectIsEmpty(keyPaths)) {
            return option;
        }
    }

    for (const optionKey in keyPaths) {if (keyPaths.hasOwnProperty(optionKey)) {
        option = optionByKeyPath(option, optionKey, mustNextAll ? undefined : keyPaths[optionKey]);
    }}

    return option;
}
