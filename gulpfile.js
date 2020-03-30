/**
 * @description Configuração das tarefas do Gulp para gerar o bookmarklet e/ou o arquivo de demonstração
 */
'use strict';

const del = require('del');
const gulp = require('gulp');
const exec = require('child_process').exec;
const fs = require('fs');
const tap = require('gulp-tap');

// ---------------------------------------------------------------------------------------------------------------------

// Diretório de publicação dos arquivos
const dirs = {
  src: '.',
  demo: 'demo',
  dist: 'dist',
};

const sources = {
  demo: dirs.demo + '/*.*'
};

// Nome do arquivo gerado com o código do bookmarklet
const fileName = 'fill-form';

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Copia os arquivos da demonstração (JS, CSS) para o diretório de publicação
 */
function demoFilesTask() {
  return gulp
    .src(sources.demo)
    .pipe(gulp.dest(dirs.dist));
}

/**
 * Executa a criação do bookmarklet utilizando o arquivo minificado criado anteriormente
 */
function bookmarkletTask() {
  return exec('npm run bookmarklet');
}

/**
 * Executa a criação do demo do bookmarklet
 */
function bookmarkletDemoTask() {
  return gulp.src(`${dirs.demo}/${fileName}.html`)
    .pipe(tap(replaceVariables))
    .pipe(gulp.dest(dirs.dist));
}

/**
 * Efetua a substituição da variável com o conteúdo do bookmarklet no arquivo de demonstração
 *
 * @param file - Referência ao arquivo HTML com o conteúdo da demonstração
 */
function replaceVariables(file) {
  const bookmarkletCode = fs.readFileSync(`${dirs.dist}/${fileName}.js`, 'utf8');
  file.contents = new Buffer.from(String(file.contents).replace(/{{BOOKMARKLET_CODE}}/, bookmarkletCode));
}

/**
 * Cria o diretório de publicação (o plugin `bookmarklet` não cria o diretório para nós...)
 */
function createDistTask() {
  return gulp
    .src('*.*', { read: false })
    .pipe(gulp.dest(dirs.dist));
}

/**
 * Exclui o diretório de publicação (normalmente utilizado antes de gerar novos arquivos)
 */
function cleanDistTask() {
  return del([dirs.dist]);
}

// ---------------------------------------------------------------------------------------------------------------------

const gulpBuild = gulp.series(
  cleanDistTask,
  createDistTask,
  gulp.parallel(
    bookmarkletTask
  )
);

const gulpDemo = gulp.series(
  cleanDistTask,
  createDistTask,
  gulp.parallel(
    demoFilesTask
  ),
  gulp.parallel(
    bookmarkletTask,
  ),
  gulp.parallel(
    bookmarkletDemoTask
  )
);

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Versão de publicação (compila e minifica)
 * `$ gulp build`
 */
exports.build = gulpBuild;
exports.default = gulpBuild;

/**
 * Cria o demo
 * `$ gulp demo`
 */
exports.demo = gulpDemo;
