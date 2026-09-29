// halora-chrome.js — mega-menu dropdowns + mobile drawer + cart count
(function(){
  // ── Mega menu (click-toggle, not hover) ─────────
  document.querySelectorAll('.halora-nav-toggle').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var item = this.closest('.halora-nav-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.halora-nav-item.open').forEach(function(i){
        i.classList.remove('open');
        var t = i.querySelector('.halora-nav-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) { item.classList.add('open'); this.setAttribute('aria-expanded', 'true'); }
    });
  });
  document.addEventListener('click', function(){
    document.querySelectorAll('.halora-nav-item.open').forEach(function(i){
      i.classList.remove('open');
      var t = i.querySelector('.halora-nav-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      document.querySelectorAll('.halora-nav-item.open').forEach(function(i){
        i.classList.remove('open');
        var t = i.querySelector('.halora-nav-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      closeDrawer();
    }
  });

  // ── Mobile drawer ───────────────────────────────
  var drawer = document.getElementById('halora-drawer');
  var overlay = document.getElementById('halora-drawer-overlay');
  var openBtn = document.getElementById('halora-hamburger');
  var closeBtn = document.getElementById('halora-drawer-close');

  function openDrawer(){
    if (!drawer) return;
    drawer.classList.add('open');
    overlay && overlay.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
    openBtn && openBtn.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer(){
    if (!drawer) return;
    drawer.classList.remove('open');
    overlay && overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
    openBtn && openBtn.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }
  if (openBtn) openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Drawer accordion sub-menus
  document.querySelectorAll('.halora-drawer__toggle').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var item = this.closest('.halora-drawer__item');
      var isOpen = item.classList.contains('sub-open');
      document.querySelectorAll('.halora-drawer__item.sub-open').forEach(function(i){ i.classList.remove('sub-open'); });
      if (!isOpen) { item.classList.add('sub-open'); this.setAttribute('aria-expanded','true'); }
      else this.setAttribute('aria-expanded','false');
    });
  });

  // ── Search panel ───────────────────────────────
  var searchBtn = document.getElementById('halora-search-btn');
  var searchPanel = document.getElementById('halora-search-panel');
  var searchOverlay = document.getElementById('halora-search-overlay');
  var searchClose = document.getElementById('halora-search-close');
  var searchInput = document.getElementById('halora-search-input');
  var searchSuggest = document.getElementById('halora-search-suggest');
  var searchTimer = null;

  function openSearch(){
    if (!searchPanel) return;
    searchPanel.classList.add('open');
    searchOverlay && searchOverlay.classList.add('open');
    searchPanel.setAttribute('aria-hidden', 'false');
    searchBtn && searchBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ searchInput && searchInput.focus(); }, 80);
  }
  function closeSearch(){
    if (!searchPanel) return;
    searchPanel.classList.remove('open');
    searchOverlay && searchOverlay.classList.remove('open');
    searchPanel.setAttribute('aria-hidden', 'true');
    searchBtn && searchBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (searchBtn) searchBtn.addEventListener('click', function(e){ e.stopPropagation(); openSearch(); });
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchOverlay) searchOverlay.addEventListener('click', closeSearch);

  // Live predictive results via Shopify's /search/suggest.json
  if (searchInput && searchSuggest) {
    searchInput.addEventListener('input', function(){
      clearTimeout(searchTimer);
      var q = this.value.trim();
      if (q.length < 2) { searchSuggest.innerHTML = ''; return; }
      searchTimer = setTimeout(function(){
        fetch('/search/suggest.json?q=' + encodeURIComponent(q) + '&resources[type]=product&resources[limit]=6&resources[options][unavailable_products]=last')
          .then(function(r){ return r.json(); })
          .then(function(data){
            var products = (data.resources && data.resources.results && data.resources.results.products) || [];
            if (!products.length) {
              searchSuggest.innerHTML = '<p class="halora-search__empty">No results — try shorter words, or browse <a href="/collections/all">the apothecary</a>.</p>';
              return;
            }
            searchSuggest.innerHTML = products.map(function(p){
              var img = p.image ? '<img src="' + p.image + '" alt="" loading="lazy">' : '<div class="halora-search__ph"></div>';
              var price = p.price ? '<span class="halora-search__price">PKR ' + (parseInt(p.price, 10) / 100).toLocaleString() + '</span>' : '';
              return '<a class="halora-search__result" href="' + p.url + '">' + img + '<span class="halora-search__name">' + p.title + '</span>' + price + '</a>';
            }).join('');
          })
          .catch(function(){ searchSuggest.innerHTML = ''; });
      }, 180);
    });
  }

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      closeSearch();
    }
    if ((e.key === 'k' || e.key === '/') && (e.metaKey || e.ctrlKey || e.key === '/')) {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
      e.preventDefault();
      openSearch();
    }
  });

  // ── Cart count updater (live update on AJAX add-to-cart) ──
  document.addEventListener('cart:updated', function(e){
    var n = e.detail && e.detail.cart ? e.detail.cart.item_count : null;
    if (n === null) return;
    var badge = document.getElementById('cart-count');
    if (!badge) return;
    badge.textContent = n;
    if (n > 0) badge.classList.add('visible'); else badge.classList.remove('visible');
  });
})();
