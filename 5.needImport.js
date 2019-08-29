// tree shakeing 按需加载，引入某个模块的某个方法
// import { Button, Alert } from 'antd';
/* esprima
    "type": "Program",
    "body": [
        {
            "type": "ImportDeclaration",
            "specifiers": [
                {
                    "type": "ImportSpecifier",
                    "local": {
                        "type": "Identifier",
                        "name": "Button"
                    },
                    "imported": {
                        "type": "Identifier",
                        "name": "Button"
                    }
                },
                {
                    "type": "ImportSpecifier",
                    "local": {
                        "type": "Identifier",
                        "name": "Alert"
                    },
                    "imported": {
                        "type": "Identifier",
                        "name": "Alert"
                    }
                }
            ],
            "source": {
                "type": "Literal",
                "value": "antd",
                "raw": "'antd'"
            }
        }
    ],
    "sourceType": "module"
}
*/
// 通过babel-plugin-import转换成 
// import Button from 'antd/lib/button'
// import Alert from 'antd/lib/alert;
/*{
    "type": "Program",
    "body": [
        {
            "type": "ImportDeclaration",
            "specifiers": [
                {
                    "type": "ImportDefaultSpecifier",
                    "local": {
                        "type": "Identifier",
                        "name": "Button"
                    }
                }
            ],
            "source": {
                "type": "Literal",
                "value": "antd/lib/button",
                "raw": "'antd/lib/button'"
            }
        }
    ],
    "sourceType": "module"
}
*/

let babel = require('babel-core');
let t = require('babel-types');
let code = `import { Button, Alert } from 'antd';`;

let importPlugin = {
    visitor: {
        ImportDeclaration(path) {
            const { node } = path;
            const source = node.source.value; // 'antd'
            let specifiers = node.specifiers;
            let arr = [];
            let arr1 = [];
            specifiers.map(item => {
                if (!t.isImportDefaultSpecifier(item)) {
                    arr.push(t.importDeclaration(
                        [t.importDefaultSpecifier(item.local)],
                        t.stringLiteral(`${source}/lib/${item.local.name.toLowerCase()}`)
                    ));
                    return;
                }
                arr1.push(t.importDeclaration(
                    [t.importDefaultSpecifier(item.local)],
                    t.stringLiteral(`${source}/lib/${item.local.name.toLowerCase()}`)
                ))
            })
            if (arr.length > 0) { // 如果有解构赋值
                path.replaceWithMultiple(arr.concat(arr1));
            }
        }
    }
}
let result = babel.transform(code, {
    plugins: [
        importPlugin
    ]
})

console.log(result.code)

