const warnings = new Map();
const itemsCheckedByGroup = new Map();

let firstInput = '';

/**
 * Validamos apenas os campos listados (não são todos os tipos de input que validamos como, por exemplo, `hidden` ou
 * `button`). Essa mesma lista é usada no arquivo de demonstração
 */
const fieldsToValidate = [
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

document.querySelectorAll(fieldsToValidate.join(',')).forEach(function (thisField) {
  const fieldId   = thisField.id;
  const fieldName = thisField.name;
  const fieldType = thisField.type;
  const tag       = thisField.tagName.toLowerCase();

  const isRadioOrCheckbox = (/^(radio|checkbox)$/gi.test(fieldType));

  /**
   * Condições em que o Fill Form não altera o valor do campo:
   *
   * 1) O campo não está visível
   * 2) O campo está desativado (atributo `disabled`)
   * 3) O campo é somente leitura (atributo `readonly`)
   * 4) O campo já está preenchido
   */
  if (
    thisField.offsetWidth === 0 || thisField.offsetHeight === 0 || thisField.style.display === 'none' ||
    thisField.disabled || thisField.readOnly || (
      (isRadioOrCheckbox && thisField.checked) ||     // Se for radio ou checkbox e estiver checked
      (!isRadioOrCheckbox && thisField.value !== '')  // Se NÃO for radio ou checkbox e o value estiver definido
    )
  ) {
    return;
  }

  // -------------------------------------------------------------------------------------------------------------------

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
  if (firstInput === '' && fieldType !== 'checkbox' && fieldType !== 'radio') {
    firstInput = (fieldId) ? `#${fieldId}` : `[type="${fieldType}"][name="${fieldName}"]`;
  }

  // Verifica se o maxlength está definido para o campo ou não
  const maxLengthIsDefined = (!isNaN(thisField.maxLength) && thisField.maxLength > 0);

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Valida se o `maxlength` está definido ou não (apenas alguns campos utilizam esse atributo)
   */
  if (!maxLengthIsDefined && /^(text|password|url|email|tel)$/gi.test(fieldType)) {
    addWarning(field, 'O atributo "maxlength" não foi definido');
  }

  // -------------------------------------------------------------------------------------------------------------------

  let value = (() => {
    switch (true) {
      case (/^rg/igm.test(fieldName)):
        return gerarRg();
      case (/cpf/igm.test(fieldName)):
        return gerarCpf();
      case (/cnpj/igm.test(fieldName)):
        return gerarCnpj();
      case (/cep/igm.test(fieldName)):
        return gerarCep();
      case (/ddd/igm.test(fieldName)):
        return gerarDdd();
      case (/cel/igm.test(fieldName) || fieldType === 'tel'):
        return gerarTelefone(9);
      case (/(tel|fax)/igm.test(fieldName) || fieldType === 'tel'):
        return gerarTelefone(8);
      case (/data/igm.test(fieldName) && fieldType === 'text'):
        return gerarData();
      case (/email/igm.test(fieldName) || fieldType === 'email'):
        return gerarEmail();
      case (/numero/igm.test(fieldName) || fieldType === 'number'):
        return gerarNumero();
      case (/(url|site|website)/igm.test(fieldName) || fieldType === 'url'):
        return gerarDominio();
      default:
        return gerarTexto();
    }
  })();

  // -------------------------------------------------------------------------------------------------------------------

  if (tag === 'textarea') {
    value = gerarTexto(true);
  }

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Gera uma senha aleatoriamente com base no `maxlength`, se disponível
   */
  if (fieldType === 'password') {
    value = gerarSenha((maxLengthIsDefined) ? thisField.maxLength : random(20));
  }

  // -------------------------------------------------------------------------------------------------------------------

  // Se for um select, seleciona uma das opções disponíveis aleatoriamente
  if (tag === 'select' && fieldType === 'select-one') {
    let tryAgain = true;

    while (tryAgain) {
      const optionsLength  = thisField.options.length;
      const optionIndex    = random(optionsLength - 1);
      const optionSelected = thisField.options[optionIndex];

      if (optionSelected.value !== '') {
        value = optionSelected.value;
        tryAgain = false;
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------------

  // Se for um radio ou checkbox, seleciona uma das opções aleatoriamente
  if (fieldType === 'checkbox' || fieldType === 'radio') {
    const thisGroup = `[type="${fieldType}"][name="${fieldName}"]:not(:disabled)`;

    // Primeiro verifica se esse grupo de inputs ainda não foi alterado. Se algum campo já foi selecionado, ignora
    if (itemsCheckedByGroup.has(thisGroup)) {
      return;
    }

    const inputs        = document.querySelectorAll(thisGroup);
    const inputsLength  = inputs.length;
    const inputIndex    = random(inputsLength);
    const selectedInput = inputs[inputIndex];

    if (!selectedInput || typeof selectedInput.value === 'undefined') {
      return;
    }

    // Armazena o valor selecionado deste grupo
    itemsCheckedByGroup.set(thisGroup, selectedInput.value);

    /**
     * Marca o campo selecionado com o `checked` executando o click nele (dessa forma podemos ativar qualquer script que
     * esteja sendo utilizado na página, que esteja monitorando esses campos para poder executar alguma ação)
     */
    selectedInput.click();

    return;
  }

  // -------------------------------------------------------------------------------------------------------------------

  if (value !== '') {

    // Se o `maxlength` estiver definido, "trunca" o valor
    if (maxLengthIsDefined && typeof value === 'string') {
      value = value.substring(0, thisField.maxLength);
    }

    /**
     * Aplica o valor definido no campo e, na sequência, disparamos o evento que indica que houve alterações no campo
     * (caso tenha alguma máscara, conseguimos aplicá-la no novo valor definido)
     */
    thisField.value = value;
    thisField.dispatchEvent(new Event('input'));

    // Exibimos o valor no "title" dos campos
    let prevTitle = '';

    if (thisField.title !== '') {
      prevTitle = `${thisField.title} - `;
    }

    thisField.title = `${prevTitle}Value: ${value}`;
  }

  /**
   * Para selects disparamos o evento que "notifica" que houve mudança no campo (para ativar qualquer script que esteja
   * associado a esse campo, como por exemplo, exibir algum campo condicionalmente à escolha de algum dos valores
   * disponíveis nesse select)
   */
  if (tag === 'select' && fieldType === 'select-one') {
    thisField.dispatchEvent(new Event('change'));
  }
});

/**
 * Se tivermos algum aviso para exibir, esse é o momento
 */
if (warnings && warnings.size) {
  const idModal    = `fill-form-${Math.random().toString(36).substring(2)}`;
  const monoSpace  = 'font-family: monospace';
  const titleOpen  = `<span style="display: block; ${monoSpace}; font-size: 22px; color: #c00;">`;
  const titleClose = `</span>`;

  let count = 0;
  let tableContent = '';

  warnings.forEach(function (mensagens, header) {
    const bgColor     = (count % 2 === 0) ? ' background-color: #efefef;' : '';
    const cellOpen    = `<td style="${monoSpace}; font-size: 12px; white-space: nowrap; padding: 5px;${bgColor}">`;
    const cellClose   = `</td>`;
    const cellContent = mensagens.join('<br>');

    tableContent += `<tr>${cellOpen}${header}${cellClose}${cellOpen}${cellContent}${cellClose}</tr>`;

    count++;
  });

  const mensagem = [
    `<div id="${idModal}-modal" style="`,
      'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); min-width: 800px; padding: 10px;',
      'color: #333; font-size: 14px; background-color: #fcfcfc; border: 5px solid #c00; z-index: 999999999;"',
    '>',
      `${titleOpen}Avisos:${titleClose}`,
      `<table style="width: 100%; margin-top: 10px; border: 1px solid #dfdfdf;">${tableContent}</table>`,
    '</div>',

    `<div id="${idModal}-overlay" `,

      'style="',
        'position: fixed; top: 0; right: 0; bottom: 0; left: 0; width: 500vw; height: 500vh;',
        'background-color: #333; opacity: 0.75; z-index: 999999998; cursor: pointer;',
      '" ',

      'onclick="javascript:',
        `document.getElementById('${idModal}-modal').remove();`,
        `document.getElementById('${idModal}-overlay').remove();"`,
      '"',
    '></div>'
  ];

  document.body.insertAdjacentHTML('afterbegin', mensagem.join(''));
}

/**
 * Após executarmos o fill form, a página é "scrollada", então nós focamos o primeiro input do formulário e, logo na
 * sequência, removemos o foco :-)
 */
if (firstInput !== '') {
  setTimeout(function () {
    const field = document.querySelector(firstInput);

    field.focus();
    field.blur();
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
  if (!warnings.has(input)) {
    warnings.set(input, []);
  }

  warnings.get(input).push(msg);
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
 * Retirna a lista dos "Top Level Domains" que utilizamos
 */
function getTopLevelDomains() {
  return ['.com.br', '.info', '.org', '.net', '.com'];
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
function gerarTelefone(digitos) {

  // Cria 5 números randomicamente
  const n = [];
  for (let i = 1; i <= 5; i++) {
    n[i] = random(10);
  }

  let telefone = `${n[2]}${n[5]}${n[4]}${n[2]}${n[3]}${n[1]}${n[4]}${n[1]}`;

  // Só adiciona o DDD se o campo DDD não existir
  if (!document.querySelector('input[name*="ddd"]')) {
    telefone = gerarDdd() + (digitos === 9 ? '9' : '') + telefone;
  }

  return telefone;
}

/**
 * Gera uma data no padrão brasileiro, sem máscara
 *
 * 28032020 (28/03/2020)
 */
function gerarData() {
  const ano = random(new Date().getFullYear() - 1900) + 1900;
  const mes = random(11) + 1;
  const dia = random(29) + 1;

  return `${dia}${mes}${ano}`;
}

/**
 * Gera um número de CPF válido, sem máscara
 */
function gerarCpf() {
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
function gerarCnpj() {
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
    (n[6] * 8)  + (n[5] * 9)  + (n[4] * 2)  + (n[3] * 3) + (n[2] * 4) + (n[1] * 5)
  );

  dig1 = 11 - (digitoVerificador(dig1, 11));

  if (dig1 >= 10) {
    dig1 = 0;
  }

  // Cálculo do segundo dígito verificador
  dig2 = (
    (dig1 * 2) + (n[12] * 3) + (n[11] * 4) + (n[10] * 5) + (n[9] * 6) + (n[8] * 7) + (n[7] * 8) +
    (n[6] * 9) + (n[5] * 2)  + (n[4] * 3)  + (n[3] * 4)  + (n[2] * 5) + (n[1] * 6)
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
function gerarCep() {
  const ceps = [
    '13092-150', '13500-000', '13500-110', '13500-313', '13506-555', '13537-000',
    '20260-160', '20511-170', '20511-330', '20521-110', '20530-350', '78931-000',
    '78956-000', '78967-800', '78968-000', '78973-000', '78990-000', '78993-000',
  ];

  return ceps[random(ceps.length - 1)].replace(/[^0-9]/, '');
}

/**
 * Retorna um número de RG disponível
 */
function gerarRg() {
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
function gerarSenha(length) {
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
    password += chars[random(chars.length - 1)];
  }

  return password;
}

/**
 * Retorna um número de DDD válido, com base na lista de DDDs disponíveis de cada Estado brasileiro
 */
function gerarDdd() {
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

  return DDDs[random(DDDs.length)];
}

/**
 * Gera um e-mail randomicamente utilizando apenas as letras e números definidos na lista
 */
function gerarEmail() {
  let email = '';

  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  const TLDs  = getTopLevelDomains();

  for (let i = 0; i < 10; i++) {
    email += chars.charAt(random(chars.length - 1));
  }

  email += '@';

  for (let j = 0; j < 8; j++) {
    email += chars.charAt(random(chars.length - 1));
  }

  return email += TLDs[random(TLDs.length - 1)];
}

/**
 * Gera um domínio randomicamente utilizando apenas as letras e números definidos na lista
 */
function gerarDominio() {
  let dominio = '';

  const chars     = 'abcdefghijkmnpqrstuvwxyz23456789';
  const protocols = ['http://www.', 'https://www.', 'ftp://'];
  const TLDs      = getTopLevelDomains();

  dominio += protocols[random(protocols.length)];

  for (let i = 0; i < 10; i++) {
    dominio += chars.charAt(random(chars.length));
  }

  return dominio += TLDs[random(TLDs.length)];
}

/**
 * Gera um número aleatório entre 1 e 999
 */
function gerarNumero() {
  return random(999) + 1;
}

/**
 * Retorna um texto `Lorem Ipsum` para ser utilizado no preenchimento dos campos
 *
 * @param fullText - Opcional. Se `true`, retorna todos os parágrafos
 */
function gerarTexto(fullText = false) {
  const loremIpsum = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit nec sodales sit amet, bibendum non tellus.',
    'Phasellus eget sapien est, et molestie nibh. Pellentesque semper dui non ipsum volutpat interdum.',
    'Phasellus id fringilla metus. In quis eros tellus. Pellentesque auctor vestibulum magna eget pellentesque.',
    'Proin ante, iaculis porttitor massa. Morbi iaculis scelerisque dapibus. Vestibulum lacinia ornare quam vel.',
    'Cras pulvinar, arcu vitae convallis ultrices, justo eros imperdiet erat, eget fringilla arcu augue.',
    'Duis risus arcu, sodales sit amet suscipit non, accumsan at ligula. Aliquam iaculis consectetur pellentesque.',
    'Praesent eu nulla ac magna commodo interdum a sit amet nisi. Sed justo orci, faucibus nec volutpat.',
    'Consectetur adipiscing elit. Integer et est id magna posuere feugiat. Maecenas quis ips arcu.'
  ];

  return (fullText)
    ? loremIpsum.join('\n\n')
    : loremIpsum[random(loremIpsum.length - 1)];
}
