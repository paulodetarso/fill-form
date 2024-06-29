import gulp from 'gulp';
import tap from 'gulp-tap';
import uglify from 'gulp-uglify';
import { exec } from 'child_process';
import { deleteAsync } from 'del';
import { readFileSync } from 'fs';

// ---------------------------------------------------------------------------------------------------------------------

// Diretório de publicação dos arquivos
const dirs = {
  demo: 'demo',
  dist: 'dist',
};

const sources = {
  demo: `${dirs.demo}/*.*`
};

// Nome do arquivo gerado com o código do bookmarklet
const fileName = 'fill-form';

const uglifyOptions = {
  toplevel: true,
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Copia os arquivos da demonstração (JS, CSS) para o diretório de publicação
 */
const demoFilesTask = () => {
  return gulp
    .src(sources.demo)
    .pipe(gulp.dest(dirs.dist));
};

/**
 * Executa a criação do bookmarklet utilizando o arquivo minificado criado anteriormente
 */
const bookmarkletTask = cb => {
  exec('npm run bookmarklet', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
};

/**
 * Executa a criação do demo do bookmarklet
 */
const bookmarkletDemoTask = () => {
  return gulp.src(`${dirs.demo}/${fileName}.html`)
    .pipe(tap(replaceVariables))
    .pipe(gulp.dest(dirs.dist));
};

/**
 * Efetua a substituição da variável com o conteúdo do bookmarklet no arquivo de demonstração
 *
 * @param file - Referência ao arquivo HTML com o conteúdo da demonstração
 */
const replaceVariables = file => {
  const bookmarkletCode = readFileSync(`${dirs.dist}/${fileName}.js`, 'utf8');
  file.contents = Buffer.from(String(file.contents).replace(/{{BOOKMARKLET_CODE}}/, bookmarkletCode));
};

/**
 * Minifica o arquivo JS e o copia para o diretório final
 */
const scriptTask = () => {
  return gulp
    .src(`./${fileName}.js`)
    .pipe(uglify(uglifyOptions))
    .pipe(gulp.dest(dirs.dist));
};

/**
 * Exclui o diretório de publicação (normalmente utilizado antes de gerar novos arquivos)
 */
const cleanDistTask = () => {
  return deleteAsync([dirs.dist]);
};

// ---------------------------------------------------------------------------------------------------------------------

const gulpBuild = gulp.series(
  cleanDistTask,
  scriptTask,
  gulp.parallel(
    bookmarkletTask
  )
);

const gulpDemo = gulp.series(
  cleanDistTask,
  scriptTask,
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
 * `$ gulp build` - Versão de publicação (compila e minifica)
 * `$ gulp demo` - Cria o demo
 */
export {
  gulpBuild as build,
  gulpDemo  as demo,
}
