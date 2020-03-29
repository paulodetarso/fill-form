// ==Bookmarklet==
// @script https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/Bookmarklet==

var avisos = new Map();
var primeiroInput = '';

/**
 * Validamos apenas os campos listados (não são todos os tipos de input que validamos como, por exemplo, `hidden` ou
 * `button`). Essa mesma lista é usada no arquivo de demonstração
 */
var fieldsToValidate = [
  '[type="text"]',
  '[type="password"]',
  '[type="url"]',
  '[type="email"]',
  '[type="tel"]',
  '[type="number"]',
  '[type="radio"]',
  '[type="checkbox"]',
  'select',
  'textarea',
];

$(fieldsToValidate.join(',')).each(function () {

  /**
   * Condições em que o Fill Form não altera o valor do campo:
   *
   * 1) O campo não está visível
   * 2) O campo está desativado (atributo `disabled`)
   * 3) O campo é somente leitura (atributo `readonly`)
   * 4) O campo já está preenchido
   */
  if (
    this.offsetWidth === 0 || this.offsetHeight === 0 || this.style.display === 'none' ||
    this.disabled || this.readOnly || this.value !== ''
  ) {
    return;
  }

  // -------------------------------------------------------------------------------------------------------------------

  const fieldId = $(this).attr('id');
  const fieldName = this.name;
  const fieldType = this.type;
  const tag = this.tagName.toLowerCase();

  let attrId = '';
  let attrName = '';
  let attrType = '';

  if (fieldId) {
    attrId = ` id="${fieldId}"`;
  } else if (fieldName) {
    attrName = ` name="${fieldName}"`;
  }

  // Se for um input, exibimos o type também para ajudar na identificação
  if (tag === 'input') {
    attrType = ` type="${fieldType}"`;
  }

  // Cria o identificador do campo e substitui os caracteres especiais `<`, `>` e `"` pelas respectivas entidades HTML
  let field = `<${((fieldType === 'select-one') ? 'select' : tag)}${attrType}${attrName}${attrId}>`;
  field = field.replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;');

  /**
   * Armazenamos o identificador do primeiro campo do formulário que não seja nem radio nem checkbox (veja a utilização
   * desse identificador após a definição do `value` do campo)
   */
  if (primeiroInput === '' && fieldType !== 'checkbox' && fieldType !== 'radio') {
    primeiroInput = (fieldId) ? `#${fieldId}` : `[type="${fieldType}"][name="${fieldName}"]`;
  }

  // Verifica se o maxlength está definido para o campo ou não
  const maxLengthIsDefined = (!isNaN($(this).attr('maxlength')));

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Valida se o `maxlength` está definido ou não (apenas alguns campos utilizam esse atributo)
   */
  if (!maxLengthIsDefined && /^(text|password|url|email|tel)$/gi.test(fieldType)) {
    addWarning(field, 'O atributo "maxlength" não foi definido');
  }

  // -------------------------------------------------------------------------------------------------------------------

  let value = generateText();

  if (/^rg/igm.test(fieldName)) {
    value = geneateRg();
  } else if (/cpf/igm.test(fieldName)) {
    value = generateCpf();
  } else if (/cnpj/igm.test(fieldName)) {
    value = generateCnpj();
  } else if (/cep/igm.test(fieldName)) {
    value = generateCep();
  } else if (/ddd/igm.test(fieldName)) {
    value = generateDdd(true);
  } else if (/cel/igm.test(fieldName) || fieldType === 'tel') {
    value = generateTelefone(9);
  } else if (/(tel|fax)/igm.test(fieldName) || fieldType === 'tel') {
    value = generateTelefone(8);
  } else if (/data/igm.test(fieldName) && fieldType === 'text') {
    value = generateData();
  } else if (/email/igm.test(fieldName) || fieldType === 'email') {
    value = generateEmail();
  } else if (/numero/igm.test(fieldName) || fieldType === 'number') {
    value = Math.floor((Math.random() * 999) + 1);
  } else if (/(url|site|website)/igm.test(fieldName) || fieldType === 'url') {
    value = 'http://www.dominio.com.br/';
  }

  // -------------------------------------------------------------------------------------------------------------------

  if (tag === 'textarea') {
    value = generateText(true);
  }

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Gera uma senha aleatoriamente com base no `maxlength`, se disponível
   */
  if (fieldType === 'password') {
    value = generatePassword((maxLengthIsDefined) ? $(this).attr('maxlength') : Math.round(Math.random() * 20));
  }

  // -------------------------------------------------------------------------------------------------------------------

  // Se for um select, seleciona uma das opções disponíveis aleatoriamente
  if (fieldType === 'select-one') {
    let tryAgain = true;

    while (tryAgain) {
      const optionsLength = parseInt($(this).find('option').length, 10);
      const optionIndex = Math.floor((Math.random() * optionsLength));
      const optionSelected = $(this).find('option').get(optionIndex);

      if (optionSelected.value !== '') {
        value = optionSelected.value;
        tryAgain = false;
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------------

  // Se for um radio ou checkbox, seleciona uma das opções aleatoriamente
  if (fieldType === 'checkbox' || fieldType === 'radio') {
    const thisGroup = `[type="${fieldType}"][name="${fieldName}"]`;

    $(thisGroup).each(function () {
      this.checked = false;
    });

    const inputsLength = parseInt($(thisGroup).length, 10);
    const inputIndex = Math.floor((Math.random() * inputsLength));

    $(thisGroup).get(inputIndex).checked = true;
    $(`${thisGroup}:eq(${inputIndex})`).trigger('click');

    return;
  }

  // -------------------------------------------------------------------------------------------------------------------

  // Aplica o valor definido no campo
  if (value !== '') {
    if (maxLengthIsDefined && typeof value === 'string') {
      value = value.substr(0, $(this).attr('maxlength'));
    }

    $(this).val(value);
  }

  // Aplica a máscara se o campo estiver alguma
  $(this).trigger('focusout');

  /**
   * Para selects disparamos o evento que "notifica" que houve mudança no campo (para ativar qualquer script que esteja
   * associado a esse campo, como por exemplo, exibir algum campo condicionalmente à escolha de algum dos valores
   * disponíveis nesse select)
   */
  if (fieldType === 'select-one') {
    $(this).trigger('change');
  }
});

/**
 * Se tivermos algum aviso para exibir, esse é o momento
 */
if (avisos && avisos.size) {
  const idModal = `fill-form-${Math.random().toString(36).substring(2)}`;
  const monoSpace = 'font-family: monospace';
  const titleOpen = `<span style="display: block; ${monoSpace}; font-size: 22px; color: #c00;">`;
  const titleClose = `</span>`;

  let count = 0;
  let tableContent = '';

  avisos.forEach(function (mensagens, header) {
    const bgColor = (count % 2 === 0) ? ' background-color: #efefef;' : '';
    const cellOpen = `<td style="${monoSpace}; font-size: 12px; white-space: nowrap; padding: 5px;${bgColor}">`;
    const cellClose = `</td>`;
    const cellContent = mensagens.join('<br>');

    tableContent += `<tr>${cellOpen}${header}${cellClose}${cellOpen}${cellContent}${cellClose}</tr>`;

    count++;
  });

  const mensagem = `

    <div
      style="
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%); min-width: 800px; padding: 10px;
        color: #333; font-size: 14px; background-color: #fcfcfc; border: 5px solid #c00; z-index: 999999999;"
      id="${idModal}-modal"
    >
      ${titleOpen}Avisos:${titleClose}
      <table style="width: 100%; margin-top: 10px; border: 1px solid #dfdfdf;">
        ${tableContent}
      </table>
    </div>

    <div
      style="
        position: fixed; top: 0; right: 0; bottom: 0; left: 0; width: 500vw; height: 500vh;
        background-color: #333; opacity: 0.75; z-index: 999999998; cursor: pointer;"
      id="${idModal}-overlay"
      onclick="javascript:
        document.getElementById('${idModal}-modal').style.display = 'none';
        document.getElementById('${idModal}-overlay').style.display = 'none';"
      "
    ></div>`;

  $('body').prepend(mensagem);
}

/**
 * Após executarmos o fill form, a página é "scrollada", então nós focamos o primeiro input do formulário e, logo na
 * sequência, removemos o foco :-)
 */
if (primeiroInput !== '') {
  window.setTimeout(function () {
    $(primeiroInput).trigger('focus').trigger('blur');
  });
}

/**
 * Verifica se esse campo já foi adicionado à lista dos erros ou não e cria o índice, caso esse seja o primeiro, e
 * depois adiciona o aviso informado à lista dos avisos
 *
 * @param input - Input completo que será usado como índice e que aparecerá na tabela dos avisos
 * @param msg - Mensagem que será exibida na tabela dos avisos
 */
function addWarning(input, msg) {

  // Se for o primeiro aviso desse campo, cria o índice
  if (!avisos.has(input)) {
    avisos.set(input, []);
  }

  avisos.get(input).push(msg);
}

/**
 * Obtém o dígito verificador utilizado em CPFs e CNPJs
 *
 * @param digito - Base do dígito verificador criado para um CPF ou CNPJ
 * @param base - Base de cálculo do dígito verificador
 */
function digitoVerificador(digito, base) {
  return Math.round(digito - (Math.floor(digito / base) * base));
}

/**
 * Gera um número inteiro randomicamente entre 0 (zero) e o número informado, lembrando que esse número NÃO será
 * utilizado como um possível retorno, por exemplo, se for informado um 9, será retornado um número entre 0 e 8
 *
 * @param max - Número máximo que será utilizado para definir o número
 */
function random(max) {
  return Math.round(Math.random() * max);
}

/**
 * Gera um número de telefone/celular aleatoriamente, com 8 ou 9 dígitos. Se não existir um campo com `ddd` no `name`,
 * adiciona o DDD também
 *
 * Com DDD: 1132447698 / 11998765432
 * Sem DDD: 32447698   / 998765432
 *
 * @param digitos - Quantidade de dígitos do telefone - 8 para telefone fixo e 9 para celular
 */
function generateTelefone(digitos) {
  const base = 9;
  const num1 = random(base);
  const num2 = random(base);
  const num3 = random(base);
  const num4 = random(base);
  const num5 = random(base);

  let telefone = '' + num2 + num5 + num4 + num2 + num3 + num3 + num4 + num1;

  // Só adiciona o DDD se o campo DDD não existir
  if (!$('input[name*="ddd"]').length) {
    telefone = generateDdd() + (digitos === 9 ? '9' : '') + telefone;
  }

  return telefone;
}

/**
 * Gera uma data no padrão brasileiro, sem máscara
 *
 * 28032020 (28/03/2020)
 */
function generateData() {
  const dias = [];
  const meses = [];
  const anos = [];

  for (let d = 1; d <= 31; d++) {
    dias.push(d);
  }

  for (let m = 1; m <= 12; m++) {
    meses.push(m);
  }

  for (let a = 1900; a <= 2050; a++) {
    anos.push(a);
  }

  let dia = dias[Math.floor((Math.random() * dias.length) - 1)];
  let mes = meses[Math.floor((Math.random() * meses.length) - 1)];
  const ano = anos[Math.floor((Math.random() * anos.length) - 1)];

  if (dia >= 1 && dia <= 9) {
    dia = '0' + dia;
  }

  if (mes >= 1 && mes <= 9) {
    mes = '0' + mes;
  }

  return `${dia}${mes}${ano}`;
}

/**
 * Gera um número de CPF válido, sem máscara
 */
function generateCpf() {
  let dig1 = 0;
  let dig2 = 0;

  // Cria 9 números randomicamente
  const n = [];
  for (let i = 1; i <= 9; i++) {
    n[i] = random(9);
  }

  // Cálculo do primeiro dígito verificador
  let multiplicador = 10;

  for (const idx_1 in n) {
    dig1 += (n[idx_1] * multiplicador);
    multiplicador--;
  }

  dig1 = 11 - (digitoVerificador(dig1, 11));

  if (dig1 >= 10) {
    dig1 = 0;
  }

  // Cálculo do segundo dígito verificador
  multiplicador = 11;

  for (const idx_2 in n) {
    dig2 += (n[idx_2] * multiplicador);
    multiplicador--;
  }

  dig2 += (dig1 * 2);
  dig2 = 11 - (digitoVerificador(dig2, 11));

  if (dig2 >= 10) {
    dig2 = 0;
  }

  return `${n.join('')}${dig1}${dig2}`;
}

/**
 * Gera um número de CNPJ válido, sem máscara
 */
function generateCnpj() {
  let dig1 = 0;
  let dig2 = 0;

  // Cria 8 números randomicamente
  const n = [];
  for (let i = 1; i <= 8; i++) {
    n[i] = random(9);
  }

  // Completa a lista dos números, sendo que os últimos 4 são fixos
  n[9] = n[10] = n[11] = 0;
  n[12] = 1;

  // Cálculo do primeiro dígito verificador
  dig1 = (
    (n[12] * 2) + (n[11] * 3) + (n[10] * 4) + (n[9] * 5) + (n[8] * 6) + (n[7] * 7) +
    (n[6] * 8) + (n[5] * 9) + (n[4] * 2) + (n[3] * 3) + (n[2] * 4) + (n[1] * 5)
  );

  dig1 = 11 - (digitoVerificador(dig1, 11));

  if (dig1 >= 10) {
    dig1 = 0;
  }

  // Cálculo do segundo dígito verificador
  dig2 = (
    (dig1 * 2) + (n[12] * 3) + (n[11] * 4) + (n[10] * 5) + (n[9] * 6) + (n[8] * 7) + (n[7] * 8) +
    (n[6] * 9) + (n[5] * 2) + (n[4] * 3) + (n[3] * 4) + (n[2] * 5) + (n[1] * 6)
  );

  dig2 = 11 - (digitoVerificador(dig2, 11));

  if (dig2 >= 10) {
    dig2 = 0;
  }

  return `${n.join('')}${dig1}${dig2}`;
}

/**
 * Retorna um número de CEP disponível válido, sem máscara
 */
function generateCep() {
  const ceps = [
    '13092-150', '13500-000', '13500-110', '13500-313', '13506-555', '13537-000',
    '20260-160', '20511-170', '20511-330', '20521-110', '20530-350', '78931-000',
    '78956-000', '78967-800', '78968-000', '78973-000', '78990-000', '78993-000',
  ];

  return ceps[random(ceps.length)].replace(/[^0-9]/, '');
}

/**
 * Retorna um número de RG disponível
 */
function geneateRg() {
  const rgs = [
    '42.943.412-1', '91.122.534-1', '4.032.894-40',
    '41.875.789-6', '2.977.269'
  ];

  return rgs[random(rgs.length)];
}

/**
 * Retorna uma senha aleatória utilizando os caracteres disponíveis
 *
 * @param length - Tamanho da senha
 */
function generatePassword(length) {
  let password = '';
  const chars = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',

    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',

    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',

    '@', '#', '$', '%', '&', '*', '-', '_', '=', '+', '?'
  ];

  for (let idx = 0; idx < length; idx++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  return password;
}

/**
 * Retorna um número de DDD válido, com base na lista de DDDs disponíveis de cada Estado brasileiro
 */
function generateDdd() {
  const DDDs = [
    11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 24, 27, 28,
    31, 32, 33, 34, 35, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48, 49,
    51, 53, 54, 55,
    61, 62, 63, 64, 65, 66, 67, 68, 69,
    71, 73, 74, 75, 77, 79,
    81, 82, 83, 84, 85, 86, 87, 88, 89,
    91, 92, 93, 94, 95, 96, 97, 98, 99
  ];

  return DDDs[Math.round(Math.random() * DDDs.length)];
}

/**
 * Gera um e-mail randomicamente utilizando apenas as letras e números definidos na lista
 */
function generateEmail() {
  let email = '';
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  const TLDs = ['.com.br', '.info', '.org', '.net', '.com']; // Top-Level Domains :-)

  for (let i = 0; i < 10; i++) {
    email += chars.charAt(Math.round(chars.length * Math.random()));
  }

  email += '@';

  for (let j = 0; j < 8; j++) {
    email += chars.charAt(Math.round(chars.length * Math.random()));
  }

  return email += TLDs[Math.round(Math.random() * TLDs.length)];
}

/**
 * Retorna um texto `Lorem Ipsum` para ser utilizado no preenchimento dos campos
 *
 * @param fullText - Opcional. Se `true`, retorna todos os parágrafos
 */
function generateText(fullText = false) {
  const loremIpsum = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit nec sodales sit amet, bibendum non tellus. Vestibulum ' +
    'ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae.',

    'Phasellus eget sapien est, et molestie nibh. Pellentesque semper dui non ipsum volutpat interdum. Nulla et est. ' +
    'Praesent tincidunt magna sed sem feugiat malesuada. Suspendisse fringilla lobortis erat ac ultricies.',

    'Phasellus id fringilla metus. In quis eros tellus. Pellentesque auctor vestibulum magna eget pellentesque. Proin ' +
    'ante, iaculis porttitor massa. Morbi iaculis scelerisque dapibus. Vestibulum lacinia ornare quam vel viverra.',

    'Cras pulvinar, arcu vitae convallis ultrices, justo eros imperdiet erat, eget fringilla arcu augue. Duis risus ' +
    'arcu, sodales sit amet suscipit non, accumsan at ligula. Aliquam iaculis consectetur pellentesque.',

    'Praesent eu nulla ac magna commodo interdum a sit amet nisi. Sed justo orci, faucibus nec volutpat. Lorem ipsum ' +
    'dolor sit amet, consectetur adipiscing elit. Integer et est id magna posuere feugiat. Maecenas quis ips arcu.'
  ];

  return (fullText)
    ? loremIpsum.join('\n\n')
    : loremIpsum[Math.floor(Math.random() * loremIpsum.length)];
}
