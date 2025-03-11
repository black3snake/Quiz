const gulp = require('gulp');
const less = require('gulp-less');
const browserSync = require('browser-sync').create();
const debug = require('gulp-debug');

gulp.task('less', function () {
    return gulp.src('./src/*.less')
        .pipe(debug({title: 'src'}))
        .pipe(less())
        .pipe(debug({title: 'less'}))
        .pipe(gulp.dest('./dist'))
        .pipe(debug({title: 'dest'}))
        .pipe(browserSync.stream())
        .pipe(debug({title: 'stream'}))
});

gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });
    gulp.watch('./src/*.less', gulp.parallel('less'));
    gulp.watch('./index.html').on('change', browserSync.reload);
    gulp.watch('./scripts/script.js').on('change', browserSync.reload);
})

gulp.task('default', gulp.parallel('less', 'serve'));