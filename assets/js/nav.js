document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggler = document.querySelector('.navbar-toggler');
  var collapse = document.getElementById('navbarNav');

  if (toggler && collapse) {
    toggler.addEventListener('click', function () {
      var expanded = toggler.getAttribute('aria-expanded') === 'true';
      toggler.setAttribute('aria-expanded', String(!expanded));
      toggler.classList.toggle('collapsed');
      collapse.classList.toggle('show');
    });
  }

  // Dropdown (quick-action nav menu)
  document.querySelectorAll('.dropdown-toggle').forEach(function (toggle) {
    var menu = toggle.parentElement.querySelector('.dropdown-menu');
    if (!menu) return;

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = menu.classList.contains('show');
      document.querySelectorAll('.dropdown-menu.show').forEach(function (m) {
        m.classList.remove('show');
      });
      if (!isOpen) menu.classList.add('show');
    });
  });

  document.addEventListener('click', function (e) {
    document.querySelectorAll('.dropdown-menu.show').forEach(function (menu) {
      if (!menu.parentElement.contains(e.target)) menu.classList.remove('show');
    });
  });
});
