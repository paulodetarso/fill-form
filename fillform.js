javascript: (function () {
  t = document.forms.length;
  for (x = 0; x < t; x++) {
    d = document.forms[x];
    for (i = 0; i < d.length; i++) {
      el = d[i];
      if (el.disabled || el.readOnly) {
        continue;
      }
      if (el.type == "text") {
        el.value = el.name;
        if (el.name == "email") {
          el.value = "abcdef@abcdef.com";
        }
      }
      if (el.type == "select-one") {
        opt = document.createElement('option');
        opt.value = el.name;
        opt.innerHTML = el.name;
        el.appendChild(opt);
        el.selectedIndex = (el.length - 1);
      }
      if (el.type == "radio" || el.type == "checkbox") {
        a = document.getElementsByName(el.name);
        for (j = 0; j < a.length; j++) {
          a[j].checked = true;
        }
      }
    }
  }
})();
