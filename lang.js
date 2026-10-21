// NL/EN switch for the kweer* site. Elements carry class "nl" or "en"; the html
// element's data-lang decides which one shows. The choice is remembered per browser.
(function () {
  var KEY = 'kweer-lang';
  var root = document.documentElement;

  function pickInitial() {
    var param = new URLSearchParams(location.search).get('lang');
    if (param === 'nl' || param === 'en') return param;
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === 'nl' || saved === 'en') return saved;
    } catch (e) {}
    return (navigator.language || 'nl').toLowerCase().indexOf('nl') === 0 ? 'nl' : 'en';
  }

  function apply(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    var title = root.getAttribute('data-title-' + lang);
    if (title) document.title = title;
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-set-lang') === lang ? 'true' : 'false');
    });
  }

  apply(pickInitial());

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-set-lang]');
    if (!btn) return;
    var lang = btn.getAttribute('data-set-lang');
    try { localStorage.setItem(KEY, lang); } catch (err) {}
    apply(lang);
  });
})();
