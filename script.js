(function () {
  var form = document.getElementById('form');
  var ids = ['nome', 'materiais', 'horas', 'valorHora', 'despesas', 'acrescimo'];
  var el = {};
  ids.forEach(function (id) { el[id] = document.getElementById(id); });

  var custoEl = document.getElementById('custo');
  var precoEl = document.getElementById('preco');
  var copiarBtn = document.getElementById('copiar');
  var copiarTexto = document.getElementById('copiarTexto');

  var ultimo = null; // último cálculo realizado

  var moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

  // Converte "1.234,56" ou "1234.56" em número. Vazio => 0. Inválido => NaN.
  function lerNumero(texto) {
    var t = String(texto).trim().replace(/\s/g, '');
    if (t === '') return 0;
    if (t.indexOf(',') > -1) t = t.replace(/\./g, '').replace(',', '.');
    if (!/^\d*\.?\d+$|^\d+\.$/.test(t)) return NaN;
    return parseFloat(t);
  }

  function marcarErro(id, invalido) {
    el[id].closest('.entrada').classList.toggle('invalido', invalido);
  }

  function calcular() {
    var valores = {};
    var temErro = false;
    ['materiais', 'horas', 'valorHora', 'despesas', 'acrescimo'].forEach(function (id) {
      var n = lerNumero(el[id].value);
      var invalido = isNaN(n);
      marcarErro(id, invalido);
      if (invalido) temErro = true;
      valores[id] = n;
    });
    if (temErro) return;

    var custo = valores.materiais + valores.horas * valores.valorHora + valores.despesas;
    var preco = custo * (1 + valores.acrescimo / 100);

    custoEl.textContent = moeda.format(custo);
    precoEl.textContent = moeda.format(preco);

    ultimo = {
      nome: el.nome.value.trim(),
      materiais: valores.materiais,
      horas: valores.horas,
      valorHora: valores.valorHora,
      despesas: valores.despesas,
      acrescimo: valores.acrescimo,
      custo: custo,
      preco: preco
    };
  }

  function limpar() {
    form.reset();
    ids.forEach(function (id) { if (id !== 'nome') marcarErro(id, false); });
    custoEl.textContent = moeda.format(0);
    precoEl.textContent = moeda.format(0);
    ultimo = null;
    el.nome.focus();
  }

  function montarResumo(d) {
    return [
      'Orçamento de Marcenaria',
      'Peça: ' + (d.nome || 'Não informada'),
      'Materiais: ' + moeda.format(d.materiais),
      'Mão de obra: ' + numero.format(d.horas) + ' h x ' + moeda.format(d.valorHora) +
        ' = ' + moeda.format(d.horas * d.valorHora),
      'Despesas extras: ' + moeda.format(d.despesas),
      'Custo total: ' + moeda.format(d.custo),
      'Acréscimo: ' + numero.format(d.acrescimo) + '%',
      'Preço sugerido: ' + moeda.format(d.preco)
    ].join('\n');
  }

  function avisoCopiado(msg) {
    copiarTexto.textContent = msg;
    copiarBtn.classList.add('ok');
    setTimeout(function () {
      copiarTexto.textContent = 'Copiar resumo';
      copiarBtn.classList.remove('ok');
    }, 1800);
  }

  function copiarFallback(texto) {
    var area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(area);
    return ok;
  }

  function copiar() {
    if (!ultimo) calcular();
    if (!ultimo) { avisoCopiado('Corrija os campos'); return; }
    var texto = montarResumo(ultimo);

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(
        function () { avisoCopiado('Resumo copiado!'); },
        function () { avisoCopiado(copiarFallback(texto) ? 'Resumo copiado!' : 'Não foi possível copiar'); }
      );
    } else {
      avisoCopiado(copiarFallback(texto) ? 'Resumo copiado!' : 'Não foi possível copiar');
    }
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); calcular(); });
  document.getElementById('limpar').addEventListener('click', limpar);
  copiarBtn.addEventListener('click', copiar);

  // Remove o destaque de erro ao digitar
  ids.forEach(function (id) {
    el[id].addEventListener('input', function () { marcarErro(id, false); });
  });
})();