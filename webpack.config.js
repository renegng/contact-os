const autoprefixer = require('autoprefixer');

/*** Main General Bundle ***/

// Creates the general bundle
var wpBundle = new Object({
    // When entry is an array, only the last one in the array will be exposed through library (swcms)
    // If all entries are to be exposed, then entry should use the object syntax and library the array name syntax
    entry: [
        './static/css/swing_app.scss',
        './static/js/swing_firebase.js',
        './static/js/swing_app.js'
    ],
    output: {
        filename: 'static/js/bundle/swing-bundle.js',
        library: 'swcms',
        libraryTarget: 'var',
        path: __dirname
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        '@babel/plugin-proposal-class-properties',
                        'babel-plugin-macros'
                    ],
                    presets: [
                        [
                            '@babel/preset-env', {
                                'modules': false,
                                'useBuiltIns': 'entry',
                                'corejs': {'version': '3.16', 'proposals': true},
                            }
                        ]
                    ],
                },
            },
            {
                test: /\.scss$/,
                use: [
                    { loader: 'file-loader',
                        options: {
                            name: 'static/css/bundle/swing-bundle.css',
                        },
                    },
                    { loader: 'extract-loader' },
                    { loader: 'css-loader',
                        options: {
                            esModule: false,
                        },
                    },
                    { loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    autoprefixer()
                                ]
                            }
                        },
                    },
                    { loader: 'sass-loader',
                        options: {
                            // Prefer Dart Sass
                            implementation: require('sass'),
                            sassOptions: {
                                includePaths: ['./node_modules'],
                            },
                            webpackImporter: false,
                        }
                    }
                ]
            }
        ]
    }
});

/*** Specific Bundles ***/

// Creates the employees appointments bundle
var wpAppointmentsEmp = new Object({
    entry: [
        './instance/js/swing_countrycitystate-api-key.json',
        './static/js/appointments-emp.js'
    ],
    output: {
        filename: 'static/js/bundle/appointments-e.min.js',
        library: 'swapn',
        libraryTarget: 'var',
        path: __dirname
    },
    externals: {
        jsCalendar: 'jsCalendar'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        '@babel/plugin-proposal-class-properties',
                        'babel-plugin-macros'
                    ],
                    presets: [
                        [
                            '@babel/preset-env', {
                                'modules': false,
                                'useBuiltIns': 'entry',
                                'corejs': {'version': '3', 'proposals': true},
                            }
                        ]
                    ]
                }
            }
        ]
    }
});

// Creates the users appointments bundle
var wpAppointmentsUsr = new Object({
    entry: [
        './instance/js/swing_countrycitystate-api-key.json',
        './static/js/appointments-usr.js'
    ],
    output: {
        filename: 'static/js/bundle/appointments-u.min.js',
        library: 'swapn',
        libraryTarget: 'var',
        path: __dirname
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        '@babel/plugin-proposal-class-properties',
                        'babel-plugin-macros'
                    ],
                    presets: [
                        [
                            '@babel/preset-env', {
                                'modules': false,
                                'useBuiltIns': 'entry',
                                'corejs': {'version': '3', 'proposals': true},
                            }
                        ]
                    ]
                }
            }
        ]
    }
});

// Creates the view appointments bundle
var wpAppointmentsView = new Object({
    entry: [
        './static/js/appointments-view.js'
    ],
    output: {
        filename: 'static/js/bundle/appointments-v.min.js',
        library: 'swapn',
        libraryTarget: 'var',
        path: __dirname
    },
    externals: {
        jsCalendar: 'jsCalendar'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        '@babel/plugin-proposal-class-properties',
                        'babel-plugin-macros'
                    ],
                    presets: [
                        [
                            '@babel/preset-env', {
                                'modules': false,
                                'useBuiltIns': 'entry',
                                'corejs': {'version': '3', 'proposals': true},
                            }
                        ]
                    ]
                }
            }
        ]
    }
});

// Creates the service worker bundle
var wpServiceWorker = new Object({
    entry: [
        './static/js/serviceworker.js'
    ],
    output: {
        filename: 'static/js/bundle/sw.js',
        library: 'swsrw',
        libraryTarget: 'var',
        path: __dirname
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        '@babel/plugin-proposal-class-properties',
                        'babel-plugin-macros'
                    ],
                    presets: [
                        [
                            '@babel/preset-env', {
                                'modules': false,
                                'useBuiltIns': 'entry',
                                'corejs': {'version': '3', 'proposals': true},
                            }
                        ]
                    ]
                }
            }
        ]
    }
});

// Creates the initiator bundle
var wpSIORTCInitiator = new Object({
    entry: [
        './static/js/sio-rtc-initiator.js'
    ],
    output: {
        filename: 'static/js/bundle/sio-rtc-initiator.min.js',
        library: 'swsiortc',
        libraryTarget: 'var',
        path: __dirname
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        '@babel/plugin-proposal-class-properties',
                        'babel-plugin-macros'
                    ],
                    presets: [
                        [
                            '@babel/preset-env', {
                                'modules': false,
                                'useBuiltIns': 'entry',
                                'corejs': {'version': '3', 'proposals': true},
                            }
                        ]
                    ]
                }
            }
        ]
    }
});

// Creates the receiver bundle
var wpSIORTCReceiver = new Object({
    entry: [
        './static/js/sio-rtc-receiver.js'
    ],
    output: {
        filename: 'static/js/bundle/sio-rtc-receiver.min.js',
        library: 'swsiortc',
        libraryTarget: 'var',
        path: __dirname
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        '@babel/plugin-proposal-class-properties',
                        'babel-plugin-macros'
                    ],
                    presets: [
                        [
                            '@babel/preset-env', {
                                'modules': false,
                                'useBuiltIns': 'entry',
                                'corejs': {'version': '3', 'proposals': true},
                            }
                        ]
                    ]
                }
            }
        ]
    }
});

// Creates the statistics and reports bundle
var wpStatistics = new Object({
    entry: [
        './static/js/stats.js'
    ],
    output: {
        filename: 'static/js/bundle/stats.min.js',
        library: 'swsts',
        libraryTarget: 'var',
        path: __dirname
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        '@babel/plugin-proposal-class-properties',
                        'babel-plugin-macros'
                    ],
                    presets: [
                        [
                            '@babel/preset-env', {
                                'modules': false,
                                'useBuiltIns': 'entry',
                                'corejs': {'version': '3', 'proposals': true},
                            }
                        ]
                    ]
                }
            }
        ]
    }
});

/*** Compilation of Bundles ***/

// Compile all modules
module.exports = [
    wpSIORTCInitiator,
    wpSIORTCReceiver,
    wpAppointmentsEmp,
    wpAppointmentsUsr,
    wpAppointmentsView,
    wpServiceWorker,
    wpStatistics,
    wpBundle
];
