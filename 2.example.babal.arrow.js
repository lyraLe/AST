// 实践，用babel实现es6箭头函数转为es5函数
// 实现插件babel-plugin-arrow-function的功能

// 通过babel-core实现转换，里面有个transform函数，可以传入插件
// babel-types 
// 1.生成ast树
// 2.判断是否是某种类型

const babel = require('babel-core');
const t = require('babel-types');

let code = `let sum = (a, b) => {return a + b }`;

let ArrowPlugin = {
    visitor: {
        ArrowFunctionExpression(path) {
            let node = path.node;
            let params = node.params;
            let body = node.body;
            let func = t.functionExpression(null, params, body, false, false); // id, params, body, generator, aysnc 
            path.replaceWith(func); // 使用函数表达式替换箭头函数表达式
        }
    }
}
let result = babel.transform(code, {
    plugins: [ArrowPlugin] // 插件名称自定义
})

console.log(result.code)