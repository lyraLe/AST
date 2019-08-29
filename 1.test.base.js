let code = `function ast(a,b) {}`; // 待解析代码
// 1. 解析语法树
const esprima = require('esprima');
const tree = esprima.parseScript(code);

console.log(tree);

// 2. 遍历树并更改树的内容
const estraverse = require('estraverse');
estraverse.traverse(tree, {
    enter(node) { // 实际应用中用enter就够了
        console.log('enter', node.type);
        if (node.name === 'ast') {
            node.name = 'Lyra';
        }
    },
    // leave(node) {
    //     console.log('leave', node.type)
    // } 
})

// 生成新的代码
const escodegen = require('escodegen');
const result = escodegen.generate(tree);
console.log(result)