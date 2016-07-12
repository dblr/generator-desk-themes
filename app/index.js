'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');
var mkdirp = require('mkdirp');
var _s = require('underscore.string');

module.exports = generators.Base.extend({
  constructor: function () {
    var testLocal;

    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });

    this.option('babel', {
      desc: 'Use Babel',
      type: Boolean,
      defaults: true
    });

    if (this.options['test-framework'] === 'mocha') {
      testLocal = require.resolve('generator-mocha/generators/app/index.js');
    } else if (this.options['test-framework'] === 'jasmine') {
      testLocal = require.resolve('generator-jasmine/generators/app/index.js');
    }

    this.composeWith(this.options['test-framework'] + ':app', {
      options: {
        'skip-install': this.options['skip-install']
      }
    }, {
      local: testLocal
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    if (!this.options['skip-welcome-message']) {
      this.log(yosay('Desk.com local theme generator and development tool!'));
    }

    var prompts = [{
      type    : 'input',
      name    : 'name',
      message : 'Your project name?',
      default : this.appname // Default to current folder name
    },{
      type: 'list',
      name: 'features',
      message: 'Which theme would you like to start with?',
      choices: [{
        name: 'Foundation - v5',
        value: 'includeFoundation'
      },{
        name: 'Foundation - v6',
        value: 'includeFoundationSix'
      },{
        name: 'Respnsive Template (Desk default)',
        value: 'includeBootstrap'
      },{
        name: 'More Options - Coming soon',
        value: 'includeThemePark'
      }]
      ,default: 0
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;
      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      };

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeSass = true;
      this.includeJQuery = true;
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeFoundation = hasFeature('includeFoundation');
      this.includeFoundationSix = hasFeature('includeFoundationSix');
      this.includeModernizr = false;
      this.appname = answers.name;
      done();
    }.bind(this));
  },

  writing: {
    gulpfile: function () {
      this.fs.copyTpl(
        this.templatePath('gulpfile.js'),
        this.destinationPath('gulpfile.js'),
        {
          date: (new Date).toISOString().split('T')[0],
          name: this.pkg.name,
          version: this.pkg.version,
          includeSass: this.includeSass,
          includeBootstrap: this.includeBootstrap,
          includeBabel: this.options['babel'],
          testFramework: this.options['test-framework']
        }
      );
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          includeSass: this.includeSass,
          includeBabel: this.options['babel']
        }
      );
    },

    babel: function () {
      this.fs.copy(
        this.templatePath('babelrc'),
        this.destinationPath('.babelrc')
      );
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore'));

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes'));
    },

    bower: function () {
      var bowerJson = {
        name: _s.slugify(this.appname),
        private: true,
        dependencies: {}
      };
      bowerJson.dependencies['font-awesome'] = '~4.5';
      if (this.includeBootstrap) {
          bowerJson.dependencies['bootstrap-sass'] = '~3.3.5';
          bowerJson.overrides = {
            'bootstrap-sass': {
              'main': [
                'assets/stylesheets/_bootstrap.scss',
                'assets/fonts/bootstrap/*',
                'assets/javascripts/bootstrap.js'
              ]
            }
          };
      } else if(this.includeFoundationSix) {
          bowerJson.dependencies['foundation-sites'] = 'latest';
      } else if(this.includeFoundation) {
          bowerJson.dependencies['foundation'] = '5.5.3';
      }

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '~2.8.1';
      }

      //bowerJson.dependencies['j'] = '~2.8.1'
      bowerJson.dependencies['jquery'] = '~1.9.1'
      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    editorConfig: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
    },

    h5bp: function () {
      this.fs.copy(
        this.templatePath('favicon.ico'),
        this.destinationPath('app/favicon.ico')
      );

      this.fs.copy(
        this.templatePath('apple-touch-icon.png'),
        this.destinationPath('app/apple-touch-icon.png')
      );

      this.fs.copy(
        this.templatePath('robots.txt'),
        this.destinationPath('app/robots.txt'));
    },

    styles: function () {
    },

    scripts: function () {
    },

    html: function() {
        this.fs.copy(
            this.templatePath('data.json'),
            this.destinationPath('app/data.json'));
        var fwPath;
        fwPath = '/bower_components/bootstrap-sass/assets/javascripts/'
            // path prefix for Bootstrap JS files
        if (this.includeBootstrap) {
            fwPath = '/bower_components/bootstrap-sass/assets/javascripts/'
        } else if (this.includeFoundation) {
            fwPath = '/bower_components/foundation-sites/dist/'
        }  else if (this.includeFoundationSix) {
            fwPath = '/bower_components/foundation/js/'
        }
        if (this.includeBootstrap) {
          this.fs.copyTpl(
              this.templatePath('default/'),
              this.destinationPath('app/'), {
                  appname: this.appname,
                  includeSass: this.includeSass,
                  includeFoundation: this.includeFoundation,
                  includeBootstrap: this.includeBootstrap,
                  includeModernizr: this.includeModernizr,
                  includeJQuery: this.includeJQuery,
                  fwPath: fwPath
              }
          );
        } else {
          this.fs.copyTpl(
              this.templatePath('foundation/'),
              this.destinationPath('app/'), {
                  appname: this.appname,
                  includeSass: this.includeSass,
                  includeFoundation: this.includeFoundation,
                  includeFoundationSix: this.includeFoundationSix,
                  includeBootstrap: this.includeBootstrap,
                  includeModernizr: this.includeModernizr,
                  includeJQuery: this.includeJQuery,
                  fwPath: fwPath
              }
          );
        }
    },

    misc: function () {
      mkdirp('app/images');
      mkdirp('app/fonts');
    }
  },

  install: function () {
    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  },

  end: function () {
    var bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    // wire Bower packages to .html
    wiredep({
      bowerJson: bowerJson,
      directory: 'bower_components',
      ignorePath: /^(\.\.\/)*\.\./,
      src: ['app/_layout.html', 'app/widgets.html']
    });

    if (this.includeSass) {
      // wire Bower packages to .scss
      wiredep({
        bowerJson: bowerJson,
        exclude: ['font-awesome', 'font-awesome.scss'],
        directory: 'bower_components',
        ignorePath: /^(\.\.\/)+/,
        src: 'app/styles/*.scss'
      });
    }
  }
});
