var gulp = require('gulp'),
// load Node.js API
	fs   = require('fs'),
	path = require('path'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	spritesmith = require('gulp.spritesmith'),
	postcss     = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	mqpacker = require('css-mqpacker'),
	removeEmptyLines = require('gulp-remove-empty-lines');
	// cleanCSS = require('gulp-clean-css');


var dir  = {
	/**
	 * pc : sprite.support_1x.mustache
	 * mobile : sprite.support_2x.mustache
	 * **/
	template : 'sprite.support_1x.mustache',
	source: 'src/',
	scss:   'scss/lib/spritesmith/',
	img:    'img/',
	sprite: 'sprite/'
};

// ---------------------------------
// PostCss options
// ---------------------------------
var processors = [
	autoprefixer({browsers: ['last 2 version', '> 5%']}),
	mqpacker
];

// ---------------------------------
// Functions
// ---------------------------------
// function.getFolders
var getFolders = function (dir) {
	return fs.readdirSync(dir)
		.filter(function (file) {
			return fs.statSync(path.join(dir, file)).isDirectory();
		});
};

// ---------------------------------
// Tasks
// ---------------------------------
// task.sprites
gulp.task('sprites', function () {
	// set target folders
	var folders = getFolders(dir.source + dir.img + dir.sprite);

	// generate image & sass files
	folders.map(function (folder) {

		var spriteData = gulp.src(dir.sprite + folder + '/*.png', {cwd: dir.source + dir.img})
			.pipe(spritesmith({
				imgPath:   '../' + dir.img + 'sp_' + folder + '.png',
				imgName:   'sp_' + folder + '.png',
				cssName:   '_sp_' + folder + '.scss',
				cssFormat: 'scss',
				algorithm: 'binary-tree', //top-down, left-right, diagonal, alt-diagonal, binary-tree
				padding:   10,
				cssTemplate: dir.source + dir.scss + dir.template,
				cssVarMap: function(sprite) {
					sprite.name = sprite.name;
					sprite.origin = 'sp_' + folder;
				},
				cssSpritesheetName: 'sp_' + folder
			}));

		spriteData.img.pipe(gulp.dest(dir.source + dir.img));
		spriteData.css.pipe(gulp.dest(dir.source + dir.scss));
	});
});

// ---------------------------------
// Tasks
// ---------------------------------
// task.sass
gulp.task('compile-sass', function() {
	return gulp.src("src/scss/**/*.scss")
		.pipe(sass({
			outputStyle: 'compact'
		}).on('error', sass.logError))
		.pipe(postcss(processors))
		.pipe(removeEmptyLines())
		.pipe(gulp.dest(dir.source + 'css'))
});

// watch설정
gulp.task('watch',['sprites','compile-sass'], function () {
	gulp.watch('src/img/sprite/!**!/!*', ['sprites']);
	gulp.watch('src/scss/**/*.scss', ['compile-sass']);
});
