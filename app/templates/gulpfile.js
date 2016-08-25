// generated on <%= date %> using <%= name %> <%= version %>



const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const wiredep = require('wiredep').stream;

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

//Gather Required Goodies
var gp_concat = require('gulp-concat-util'),
gp_rename = require('gulp-rename'),
htmlreplace = require('gulp-html-replace'),
replace = require('gulp-replace-task'),
deleteLines = require('gulp-delete-lines'),
liquify = require('gulp-liquify'),
swig = require('gulp-swig'),
gravatar = require('gravatar'),
runSequence = require('run-sequence'),
removeEmptyLines = require('gulp-remove-empty-lines'),
fs = require('fs');

//Desk/Liquid Releated Variables
var customFilters = {
    gravatar_image: function(url) {
        var unsecureUrl = gravatar.url(url, { s: '100', r: 'x', d: 'retro' }, false);
        var url = gravatar.url(url);
        return '<img src="' + url + '"/>';
    },
    in_time_zone: function(str) {
        return str;
    },
    clip: function(str) {
        var strnew = str.substring(0, 200)
        return strnew;
    },
    format_snippet: function(str) {
        return str;
    },
    portal_image_url: function(str) {
        return str;
    },
    form: function(str) {
        return str;
    },
    customer_feedback: function(str) {
        return str;
    },
    show_something: function(str) {
        return str;
    },
    escape_newlines: function(str){
      return str;
    },
    pluralize: function(str) {
      return str;
    }
}
// For files being hosted at <%= urlpath %>
var locals = JSON.parse(fs.readFileSync('./app/data.json', 'utf8'));

// Default Task
gulp.task('styles', () => {<% if (includeSass) { %>
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))<% } else { %>
  return gulp.src('app/styles/*.css')
    .pipe($.sourcemaps.init())<% } %>
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

<% if (includeBabel) { -%>
gulp.task('scripts', () => {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});
<% } -%>

function lint(files, options) {
  return gulp.src(files)
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js', {
    fix: true
  })
    .pipe(gulp.dest('app/scripts'));
});
gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js', {
    fix: true,
    env: {
<% if (testFramework === 'mocha') { -%>
      mocha: true
<% } else if (testFramework === 'jasmine') { -%>
      jasmine: true
<% } -%>
    }
  })
    .pipe(gulp.dest('test/spec/**/*.js'));
});

<% if (includeBabel) { -%>
gulp.task('html', ['styles', 'scripts'], () => {
<% } else { -%>
gulp.task('html', ['styles'], () => {
<% } -%>
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

<% if (includeBabel) { -%>
gulp.task('serve', ['styles', 'templates' , 'scripts', 'fonts'], () => {
<% } else { -%>
gulp.task('serve', ['styles', 'templates' , 'fonts'], () => {
<% } -%>
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
  gulp.watch(['app/pages/*.html', 'app/*.html'], ['templates']).on('change', reload);
  gulp.watch([
    'app/*.html',
<% if (!includeBabel) { -%>
    'app/scripts/**/*.js',
<% } -%>
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.<%= includeSass ? 'scss' : 'css' %>', ['styles']);
<% if (includeBabel) { -%>
  gulp.watch('app/scripts/**/*.js', ['scripts']);
<% } -%>
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

<% if (includeBabel) { -%>
gulp.task('serve:test', ['scripts'], () => {
<% } else { -%>
gulp.task('serve:test', () => {
<% } -%>
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
<% if (includeBabel) { -%>
        '/scripts': '.tmp/scripts',
<% } else { -%>
        '/scripts': 'app/scripts',
<% } -%>
        '/bower_components': 'bower_components'
      }
    }
  });

<% if (includeBabel) { -%>
  gulp.watch('app/scripts/**/*.js', ['scripts']);
<% } -%>
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {<% if (includeSass) { %>
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));
<% } %>
  gulp.src('app/*.html')
    .pipe(wiredep({<% if (includeBootstrap) { if (includeSass) { %>
      exclude: ['bootstrap-sass'],<% } else { %>
      exclude: ['bootstrap.js'],<% }} %>
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});




// Desk Related Functionality
gulp.task('templates', function() {
    gulp.src(['app/pages/*.html'])
        .pipe(liquify(locals, {
            filters: customFilters
        }))
        .pipe(gulp.dest('.tmp'))
        .pipe(reload({ stream: true }));
});
gulp.task('header', function() {
    gulp.src(['app/header.html'])
        .pipe(liquify(locals, {
            filters: customFilters
        }))
        .pipe(gulp.dest('dist'))
        .pipe(reload({ stream: true }));
});
gulp.task('cleanup', function () {
  gulp.src('app/_layout.html')
      .pipe(deleteLines({
          'filters': [
              /<script/i,
              /<link/i,
              /<meta/i,
              /<html/i,
              /<.html/i,
              /<.head/i,
              /<head/i,
              /<body/i,
              /<.body/i,
              /<!-- bower/g,
              /<!-- build/g,
              /<!-- place/g,
              /<!-- end/g,
              /<!-- header/g,
              /<!doctype/g,
              /<title/g,
              /<!-- Place/g,
              /<.head>/g
          ]
      }))
    .pipe(replace({
      patterns: [
        {
          match: /{% block main %}\n{% endblock %}/g,
          replacement: fs.readFileSync('.tmp/body.liquid', 'utf8')
        }
      ]
    }))
    .pipe(htmlreplace({
      'page_index': '{% if page  == "page_index" %}',
      'endblock': '',
      'css': '',
      'js': ''
    }))
    .pipe(removeEmptyLines())
    .pipe(gp_rename('body.liquid'))
    .pipe(gulp.dest('dist'));
});
gulp.task('layout', function () {
  gulp.src('app/_layout.html')
      .pipe(deleteLines({
          'filters': [
              /<script/i,
              /<link/i,
              /<meta/i,
              /<html/i,
              /<.html/i,
              /<.head/i,
              /<head/i,
              /<body/i,
              /<.body/i,
              /<!-- bower/g,
              /<!-- build/g,
              /<!-- place/g,
              /<!-- end/g,
              /<!-- header/g,
              /<!doctype/g,
              /<title/g,
              /<!-- Place/g,
              /<.head>/g
          ]
      }))
    .pipe(replace({
      patterns: [
        {
          match: /{% block main %}\n{% endblock %}/g,
          replacement: '{{desk:body}}'
        }
      ]
    }))
    .pipe(htmlreplace({
      'page_index': '{% if page  == "page_index" %}',
      'endblock': '',
      'css': '',
      'js': ''
    }))
    .pipe(removeEmptyLines())
    .pipe(gp_rename('layout.liquid'))
    .pipe(gulp.dest('dist'));
});
gulp.task('body', function() {
    return gulp.src([
            'app/pages/index.html',
            'app/pages/article.html',
            'app/pages/topic.html',
            'app/pages/search.html',
            'app/pages/question-show.html',
            'app/pages/question.html',
            'app/pages/question-precreate.html',
            'app/pages/email.html',
            'app/pages/email-precreate.html',
            'app/pages/email-sent.html',
            'app/pages/chat.html',
            'app/pages/chat-precreate.html',
            'app/pages/myportal.html',
            'app/pages/myportal-show.html',
            'app/pages/login.html',
            'app/pages/register.html',
            'app/pages/forgot.html',
            'app/pages/myaccount.html',
            'app/pages/verification.html',
            'app/pages/csat.html',
            'app/pages/csat-sent.html'
        ])
        .pipe(htmlreplace({
            'page_index': '<!--begin:portal_body-->\n{% if page  == "page_index" %}\n<!--begin:page_index-->\n',
            'page_article': '<!--end:page_index-->\n{% elsif page == "page_article" %}\n<!--begin:page_article-->',
            'page_topic': '<!--end:page_article-->\n{% elsif page == "page_topic" %}\n<!--begin:page_topic-->',
            'page_search_result': '<!--end:page_topic-->\n{% elsif page == "page_search_result" %}\n<!--begin:page_search_result-->',
            'question_show': '<!--end:page_search_result-->\n{% elsif page == "question_show" %}\n<!--begin:question_show-->',
            'question_new': '<!--end:question_show-->\n{% elsif page == "question_new" %}\n<!--begin:question_new-->',
            'question_pre_create': '<!--end:question_new-->\n{% elsif page == "question_pre_create" %}\n<!--begin:question_pre_create-->',
            'email_new': '<!--end:question_pre_create-->\n{% elsif page == "email_new" %}\n<!--begin:email_new-->',
            'email_pre_create': '<!--end:email_new-->\n{% elsif page == "email_pre_create" %}\n<!--begin:email_pre_create-->',
            'email_submitted': '<!--end:email_pre_create-->\n{% elsif page == "email_submitted" %}\n<!--begin:email_submitted-->',
            'chat_new': '<!--end:email_submitted-->\n{% elsif page == "chat_new" %}\n<!--begin:chat_new-->',
            'chat_pre_create': '<!--end:chat_new-->\n{% elsif page == "chat_pre_create" %}\n<!--begin:chat_pre_create-->',
            'myportal_index': '<!--end:chat_pre_create-->\n{% elsif page == "myportal_index" %}\n<!--begin:myportal_index-->',
            'myportal_show': '<!--end:myportal_index-->\n{% elsif page == "myportal_show" %}\n<!--begin:myportal_show-->',
            'login': '<!--end:myportal_show-->\n{% elsif page == "login" %}\n<!--begin:login-->',
            'registration': '<!--end:login-->\n{% elsif page == "registration" %}\n<!--begin:registration-->',
            'forgot_password': '<!--end:registration-->\n{% elsif page == "forgot_password" %}\n<!--begin:forgot_password-->',
            'myaccount': '<!--end:forgot_password-->\n{% elsif page == "myaccount" %}\n<!--begin:myaccount-->',
            'authentication_verification': '<!--end:myaccount-->\n{% elsif page == "authentication_verification" %}\n<!--begin:authentication_verification-->',
            'customer_feedback': '<!--end:authentication_verification-->\n{% elsif page == "customer_feedback" %}\n<!--begin:customer_feedback-->',
            'customer_feedback_completed': '<!--end:customer_feedback-->\n{% elsif page == "customer_feedback_completed" %}\n<!--begin:customer_feedback_completed-->',
            'endblock': '',
            'deskbody': '{{desk:body}}',
            'bodyclose': '<!--end:customer_feedback_completed-->\n{%endif%}\n<!--end:portal_body-->'
        }))
        .pipe(removeEmptyLines())
        .pipe(gp_concat('body.liquid'))
        .pipe(gulp.dest('.tmp'))
});
gulp.task('pages', function() {
    return gulp.src([
            'app/pages/index.html',
            'app/pages/article.html',
            'app/pages/topic-article.html',
            'app/pages/search.html',
            'app/pages/question-show.html',
            'app/pages/question.html',
            'app/pages/question-precreate.html',
            'app/pages/email.html',
            'app/pages/email-precreate.html',
            'app/pages/email-sent.html',
            'app/pages/chat.html',
            'app/pages/chat-precreate.html',
            'app/pages/myportal.html',
            'app/pages/myportal-show.html',
            'app/pages/login.html',
            'app/pages/register.html',
            'app/pages/forgot.html',
            'app/pages/myaccount.html',
            'app/pages/verification.html',
            'app/pages/csat.html',
            'app/pages/csat-sent.html'
        ])
        .pipe(htmlreplace({
            'page_index': 'derp',
            'page_article': '',
            'page_topic': '',
            'page_search_result': '',
            'question_show': '',
            'question_new': '',
            'question_pre_create': '',
            'email_new': '',
            'email_pre_create': '',
            'email_submitted': '',
            'chat_new': '',
            'chat_pre_create': '',
            'myportal_index': '',
            'myportal_show': '',
            'login': '',
            'registration': '',
            'forgot_password': '',
            'myaccount': '',
            'authentication_verification': '',
            'customer_feedback': '',
            'customer_feedback_completed': '',
            'endblock': '',
            'deskbody': '{{desk:body}}',
            'bodyclose': ''
        }))
        .pipe(deleteLines({
          'filters': [
              /<!--end:/g
            ]
        }))
        .pipe(removeEmptyLines())
        .pipe(gulp.dest('dist/theme'))
    return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: extraPaths
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('dist/styles'))
});

gulp.task('desk', function(done) {
    runSequence('html', 'pages', 'body', 'layout', 'cleanup', function() {
        done();
        console.log('Body, Scripts and Styles are now ready for your Desk.com site');
    });
});
