// ==Bookmarklet==
// @script https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/Bookmarklet==

var resumo = '';
var first = '';

var loremIpsum = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit nec sodales sit amet, bibendum non tellus. Vestibulum ' +
  'ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae.',

  'Phasellus eget sapien est, et molestie nibh. Pellentesque semper dui non ipsum volutpat interdum. Nulla et est. ' +
  'Praesent tincidunt magna sed sem feugiat malesuada. Suspendisse fringilla lobortis erat ac ultricies.',

  'Phasellus id fringilla metus. In quis eros tellus. Pellentesque auctor vestibulum magna eget pellentesque. Proin ' +
  'ante, iaculis porttitor massa. Morbi iaculis scelerisque dapibus. Vestibulum lacinia ornare quam vel viverra.',

  'Cras pulvinar, arcu vitae convallis ultrices, justo eros imperdiet erat, eget fringilla arcu augue. Duis risus ' +
  'arcu, sodales sit amet suscipit non, accumsan at ligula. Aliquam iaculis consectetur pellentesque.',

  'Praesent eu nulla ac magna commodo interdum a sit amet nisi. Sed justo orci, faucibus nec volutpat. Lorem ipsum' +
  'dolor sit amet, consectetur adipiscing elit. Integer et est id magna posuere feugiat. Maecenas quis ips arcu.'
];

$('input,select,textarea').each(function () {
  var fieldName = this.name;
  var fieldType = this.type;
  var tag = this.tagName.toLowerCase();

  if (
    /^(hidden|button|submit|image)$/gi.test(fieldType) || this.disabled || this.readOnly ||
    this.offsetWidth === 0 || this.offsetHeight === 0 || this.style.display === 'none'
  ) {
    return;
  }

  if (isNaN($(this).attr('maxlength')) && (fieldType === 'text' || fieldType === 'password')) {
    resumo += 'Campo "' + fieldName + '" não está com maxlength definido\n';
  }

  if (first === '' && fieldType !== 'checkbox' && fieldType !== 'radio') {
    first = tag + '[name="' + fieldName + '"]';
  }

  var value = generateRandomText();

  if (/^rg/igm.test(fieldName)) {
    value = geneateRg(true);
  } else if (/^cpf/igm.test(fieldName)) {
    value = generateCpf(true);
  } else if (/^cel/igm.test(fieldName) || fieldType == 'tel') {
    value = generateCelular(true);
  } else if (/^(tel|fax)/igm.test(fieldName) || fieldType == 'tel') {
    value = generateTelefone(true);
  } else if (/^ddd/igm.test(fieldName)) {
    value = generateDdd(true);
  } else if (/^cep/igm.test(fieldName)) {
    value = generateCep(true);
  } else if (/^cnpj/igm.test(fieldName)) {
    value = generateCnpj(true);
  } else if (/^data/igm.test(fieldName)) {
    value = generateData(true);
  } else if (/^email/igm.test(fieldName) || fieldType === 'email') {
    value = generateEmail();
  } else if (/^numero/igm.test(fieldName)) {
    value = Math.floor((Math.random() * 999) + 1);
  } else if (/^(url|site|website)/igm.test(fieldName) || fieldType === 'url') {
    value = 'http://www.dominio.com.br/';
  }

  if (tag === 'textarea') {
    value = generateFullText();
  }

  if (fieldType === 'password') {
    var strLength = ($(this).attr('maxlength') !== 'undefined')
      ? $(this).attr('maxlength')
      : Math.round(Math.random() * 20);

    value = generatePassword(strLength);
    $(this).data('password', value);
  }

  if (fieldType === 'select-one') {
    var tryAgain = true;

    while (tryAgain) {
      var optionsLength = parseInt($(this).find('option').length, 10);
      var optionIndex = Math.floor((Math.random() * optionsLength));
      var optionSelected = $(this).find('option').get(optionIndex);

      if (optionSelected.value !== '') {
        value = optionSelected.value;
        tryAgain = false;
      }
    }
  }

  if (fieldType === 'checkbox' || fieldType === 'radio') {
    $('input[name="' + fieldName + '"]').each(function () {
      this.checked = false;
    });

    var inputsLength = parseInt($('input[name="' + fieldName + '"]').length, 10);
    var inputIndex = Math.floor((Math.random() * inputsLength));

    $('input[name="' + fieldName + '"]').get(inputIndex).checked = true;
    $('input[name="' + fieldName + '"]:eq(' + inputIndex + ')').trigger('click');

    return;
  }

  if (value !== '') {
    if (!isNaN($(this).attr('maxlength')) && typeof value === 'string') {
      value = value.substr(0, $(this).attr('maxlength'));
    }

    $(this).val(value);
  }

  $(this).trigger('focusout');

  if (fieldType === 'select-one') {
    $(this).trigger('change');
  }
});

if (resumo !== '') {
  alert(resumo);
}

if (first !== '') {
  window.setTimeout(function () {
    $(first).trigger('focus').trigger('blur');
  }, 500);
}

function generateTelefone(z) {

  // TODO: Verificar a real necessidade desse parâmetro
  var on = (typeof z == 'undefined') ? false : true;

  var n = 9;
  var n1 = random(n);
  var n2 = random(n);
  var n3 = random(n);
  var n4 = random(n);
  var n5 = random(n);
  var d = generateDdd();
  var tel = '' + n2 + n5 + n4 + n2 + '-' + n3 + n3 + n4 + n1;

  // Só adiciona o DDD se o campo DDD não existir
  var ret = ($('input[name^="ddd"]').length === 0) ? '(' + d + ') ' + tel : tel;

  if (on) {
    ret = ret.replace(/[^0-9]/gim, '');
  }

  return ret;
}

function generateCelular(z) {

  // TODO: Verificar a real necessidade desse parâmetro
  var on = (typeof z == 'undefined') ? false : true;

  var n = 9;
  var n1 = random(n);
  var n2 = random(n);
  var n3 = random(n);
  var n4 = random(n);
  var n5 = random(n);
  var d = generateDdd();
  var tel = '' + n2 + n5 + n4 + n2 + '-' + n3 + n3 + n4 + n1;

  // Só adiciona o DDD se o campo DDD não existir
  var ret = ($('input[name^="ddd"]').length === 0) ? (d == 11) ? '(' + d + ') 9' + tel : '(' + d + ') ' + tel : tel;

  if (on) {
    ret = ret.replace(/[^0-9]/gim, '');
  }

  return ret;
}

function generateData(z) {

  // TODO: Verificar a real necessidade desse parâmetro
  var on = (typeof z == 'undefined') ? false : true;

  var dias = [];
  var meses = [];
  var anos = [];

  for (var d = 1; d <= 31; d++) {
    dias.push(d);
  }

  for (var m = 1; m <= 12; m++) {
    meses.push(m);
  }

  for (var a = 1900; a <= 2050; a++) {
    anos.push(a);
  }

  var dia = dias[ Math.floor((Math.random() * dias.length) - 1) ];
  var mes = meses[ Math.floor((Math.random() * meses.length) - 1) ];
  var ano = anos[ Math.floor((Math.random() * anos.length) - 1) ];

  if (dia >= 1 && dia <= 9) {
    dia = '0' + dia;
  }

  if (mes >= 1 && mes <= 9) {
    mes = '0' + mes;
  }

  var data = dia + '/' + mes + '/' + ano;

  return (on) ? data.replace(/[^0-9]/, '') : data;
}

function generateCpf(z) {

  // TODO: Verificar a real necessidade desse parâmetro
  var on = (typeof z == 'undefined') ? false : true;

  var n = 9;
  var n1 = random(n);
  var n2 = random(n);
  var n3 = random(n);
  var n4 = random(n);
  var n5 = random(n);
  var n6 = random(n);
  var n7 = random(n);
  var n8 = random(n);
  var n9 = random(n);

  var d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
  d1 = 11 - (mod(d1, 11));

  if (d1 >= 10) {
    d1 = 0;
  }

  var d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
  d2 = 11 - (mod(d2, 11));

  if (d2 >= 10) {
    d2 = 0;
  }

  var cpf = '' + n1 + n2 + n3 + '.' + n4 + n5 + n6 + '.' + n7 + n8 + n9 + '-' + d1 + d2;

  if (on) {
    cpf = cpf.replace(/[^0-9]/gim, '');
  }

  return cpf;
}

function generateCnpj(z) {

  // TODO: Verificar a real necessidade desse parâmetro
  var on = (typeof z == 'undefined') ? false : true;

  var n = 9;
  var n01 = random(n);
  var n02 = random(n);
  var n03 = random(n);
  var n04 = random(n);
  var n05 = random(n);
  var n06 = random(n);
  var n07 = random(n);
  var n08 = random(n);
  var n09 = 0;
  var n10 = 0;
  var n11 = 0;
  var n12 = 1;

  var d1 = (
    (n12 * 2) + (n11 * 3) + (n10 * 4) + (n09 * 5) + (n08 * 6) + (n07 * 7) +
    (n06 * 8) + (n05 * 9) + (n04 * 2) + (n03 * 3) + (n02 * 4) + (n01 * 5)
  );

  d1 = 11 - (mod(d1, 11));

  if (d1 >= 10) {
    d1 = 0;
  }

  var d2 = (
     (d1 * 2) + (n12 * 3) + (n11 * 4) + (n10 * 5) + (n09 * 6) + (n08 * 7) + (n07 * 8) +
    (n06 * 9) + (n05 * 2) + (n04 * 3) + (n03 * 4) + (n02 * 5) + (n01 * 6)
  );
  d2 = 11 - (mod(d2, 11));

  if (d2 >= 10) {
    d2 = 0;
  }

  var cnpj = (
    '' + n01 + n02 + '.' + n03 + n04 + n05 + '.' + n06 + n07 + n08 + '/' + n09 + n10 + n11 + n12 + '-' + d1 + d2
  );

  if (on) {
    cnpj = cnpj.replace(/[^0-9]/gim, '');
  }

  return cnpj;
}

function generateCep(z) {

  // TODO: Verificar a real necessidade desse parâmetro
  var on = (typeof z == 'undefined') ? true : false;

  var ceps = [
    '13092-150', '13500-000', '13500-110', '13500-313', '13506-555', '13537-000',
    '20260-160', '20511-170', '20511-330', '20521-110', '20530-350', '78931-000',
    '78956-000', '78967-800', '78968-000', '78973-000', '78990-000', '78993-000',
  ];

  cep = ceps[random(ceps.length)];

  return (on) ? cep.replace(/[^0-9]/, cep) : cep;
}

function geneateRg(z) {

  // TODO: Verificar a real necessidade desse parâmetro
  var on = (typeof z == 'undefined') ? true : false;

  var index = 4;
  var rg1 = new Array(index);
  var rg2 = new Array(index);

  rg1[0] = '911225341';
  rg2[0] = '91.122.534-1';
  rg1[1] = '403289440';
  rg2[1] = '4.032.894-40';
  rg1[2] = '418757896';
  rg2[2] = '41.875.789-6';
  rg1[3] = '2977269';
  rg2[3] = '2.977.269';
  rg1[4] = '429434121';
  rg2[4] = '42.943.412-1';

  return (on) ? rg2[random(index)] : rg1[random(index)];
}

function generatePassword(ln) {
  var length = (typeof ln == 'undefined') ? 10 : ln;
  var password = '';
  var chars = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',

    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',

    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',

    '@', '#', '$', '%', '&', '*', '-', '_', '=', '+', '?'
  ];

  for (var idx = 0; idx < length; idx++) {
    password += chars[ Math.floor(Math.random() * chars.length) ];
  }

  return password;
}

function mod(dd, dv) {
  return Math.round(dd - (Math.floor(dd / dv) * dv));
}

function random(n) {
  return Math.round(Math.random() * n);
}

function generateDdd() {
  var DDDs = [
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

function generateEmail() {
  var chars = 'abcdef23456789';
  var email = '';

  for (var i = 0; i < 10; i++) {
    email += chars.charAt(Math.round(chars.length * Math.random()));
  }

  email += '@';

  for (var j = 0; j < 8; j++) {
    email += chars.charAt(Math.round(chars.length * Math.random()));
  }

  return email += '.com.br';
}

function generateFullText() {
  return loremIpsum.split('\n\n');
}

function generateRandomText() {
  return loremIpsum[ Math.floor(Math.random() * loremIpsum.length) ];
}
