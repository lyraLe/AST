module.exports = {
    entry: './6.test.import.js',
    output: {
        filename: 'bundle.js',
        path: __dirname,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'react'],
                        // plugins: [
                        //     ['import', {
                        //         libraryName: 'antd'
                        //         }
                        //     ]
                        // ]
                        // plugins: ['lyra-import']
                    }
                },
                exclude: /node_modules/              
            }
        ]

    }
}