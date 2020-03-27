/**
 * @description Configuração das tarefas do Gulp para gerar o bookmarklet e/ou o arquivo de demonstração
 */
'use strict';

const del = require('del');
const gulp = require('gulp');
const exec = require('child_process').exec;

// ---------------------------------------------------------------------------------------------------------------------

// Diretório de publicação dos arquivos
const distDir = 'dist';

// ---------------------------------------------------------------------------------------------------------------------

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
  return exec('npm run bookmarkletDemo');
}

/**
 * Cria o diretório de publicação (o plugin `bookmarklet` não cria o diretório para nós...)
 */
function createDistTask() {
  return gulp
    .src('*.*', { read: false })
    .pipe(gulp.dest(distDir));
}

/**
 * Exclui o diretório de publicação (normalmente utilizado antes de gerar novos arquivos)
 */
function cleanDistTask() {
  return del([distDir]);
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
