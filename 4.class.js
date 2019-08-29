// 将class转化为Es5的构造函数
// 按照esprima将class生成的AST树转为function生成的AST树做比较
/*
1.class的AST树
{
    "type": "Program",
    "body": [
        {
            "type": "ClassDeclaration",
            "id": {
                "type": "Identifier",
                "name": "Lyra"
            },
            "superClass": null,
            "body": {
                "type": "ClassBody",
                "body": [
                    {
                        "type": "MethodDefinition",
                        "key": {
                            "type": "Identifier",
                            "name": "constructor"
                        },
                        "computed": false,
                        "value": {
                            "type": "FunctionExpression",
                            "id": null,
                            "params": [
                                {
                                    "type": "Identifier",
                                    "name": "name"
                                }
                            ],
                            "body": {
                                "type": "BlockStatement",
                                "body": [
                                    {
                                        "type": "ExpressionStatement",
                                        "expression": {
                                            "type": "AssignmentExpression",
                                            "operator": "=",
                                            "left": {
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "ThisExpression"
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "name"
                                                }
                                            },
                                            "right": {
                                                "type": "Identifier",
                                                "name": "name"
                                            }
                                        }
                                    }
                                ]
                            },
                            "generator": false,
                            "expression": false,
                            "async": false
                        },
                        "kind": "constructor",
                        "static": false
                    },
                    {
                        "type": "MethodDefinition",
                        "key": {
                            "type": "Identifier",
                            "name": "getName"
                        },
                        "computed": false,
                        "value": {
                            "type": "FunctionExpression",
                            "id": null,
                            "params": [],
                            "body": {
                                "type": "BlockStatement",
                                "body": []
                            },
                            "generator": false,
                            "expression": false,
                            "async": false
                        },
                        "kind": "method",
                        "static": false
                    }
                ]
            }
        }
    ],
    "sourceType": "script"
}
2. function 的AST树
{
    "type": "Program",
    "body": [
        {
            "type": "FunctionDeclaration",
            "id": {
                "type": "Identifier",
                "name": "Lyra"
            },
            "params": [
                {
                    "type": "Identifier",
                    "name": "name"
                }
            ],
            "body": {
                "type": "BlockStatement",
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "expression": {
                            "type": "AssignmentExpression",
                            "operator": "=",
                            "left": {
                                "type": "MemberExpression",
                                "computed": false,
                                "object": {
                                    "type": "ThisExpression"
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "name"
                                }
                            },
                            "right": {
                                "type": "Identifier",
                                "name": "name"
                            }
                        }
                    }
                ]
            },
            "generator": false,
            "expression": false,
            "async": false
        },
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                            "type": "Identifier",
                            "name": "Lyra"
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "prototype"
                        }
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "getName"
                    }
                },
                "right": {
                    "type": "FunctionExpression",
                    "id": null,
                    "params": [],
                    "body": {
                        "type": "BlockStatement",
                        "body": []
                    },
                    "generator": false,
                    "expression": false,
                    "async": false
                }
            }
        }
    ],
    "sourceType": "script"
}
*/
/**最终结果如下：
    function Lyra(name) {
        this.name = name;
    }
    Lyra.prototype.getName = function() {

    }
 */
let code = `
    class Lyra{
        constructor(name) {
            this.name = name;
        }
        getName() {
            return this.name;
        }
    }
`;
let babel = require('babel-core');
let t = require('babel-types');

let classPlugin = {
    visitor: {
        ClassDeclaration(path) { // 转为FunctionDeclaration
            const { node } = path;
            let className = node.id.name; // 对应下面要用的id，函数或者类名
            className = t.identifier(className);
            let classLists = node.body.body;
            // 默认的空函数
            let Func = t.functionDeclaration(className,[],t.blockStatement([]),false,false); // id格式必须是identifier, 
            path.replaceWith(Func);
            
            let es5Func = [];
            classLists.forEach((item, index) => {
                let body = classLists[index].body; // path里面遍历的树状结构不完全和esprima相同
                // 如果是构造函数，将默认的空函数替换掉
                if (item.kind === 'constructor') { // 构造函数
                    let params = item.params;
                    Func = t.functionDeclaration(className, params, body, false, false)
                } else {
                    // 其他情况，原型上的方法Lyra.prototype.getName = function() {}
                    // 首先定义Lyra.prototype
                    let protoObj = t.memberExpression(className, t.identifier('prototype'));
                    // =左侧的内容
                    let left = t.memberExpression(protoObj, t.identifier(item.key.name));
                    let right = t.functionExpression(null, [], body, false, false);
                    let assign = t.assignmentExpression('=', left, right);
                    es5Func.push(assign);
                }
                if (es5Func.length === 0) {
                    path.replaceWith(Func)
                } else {
                    es5Func.push(Func);
                    path.replaceWithMultiple(es5Func);
                }
            })
        }
    }
}
const result = babel.transform(code, {
    plugins: [
        classPlugin
    ]
});
console.log(result.code)