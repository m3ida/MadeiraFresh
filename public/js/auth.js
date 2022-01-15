let $id = (id) => document.getElementById(id);
var [login, register, form] = ['login', 'register', 'authentication'].map(
  (id) => $id(id)
);

if (document.getElementById('authentication-dropdown')) {
  document
    .getElementById('authentication-dropdown')
    .addEventListener('click', function (event) {
      event.stopPropagation();
    });

  [login, register].map((element) => {
    element.onclick = function () {
      [login, register].map(($ele) => {
        $ele.classList.remove('active');
      });
      this.classList.add('active');
      if (this.getAttribute('id') === 'register') {
        document
          .getElementById('authentication-dropdown')
          .classList.add('active');
        form.classList.add('active');
      } else {
        document
          .getElementById('authentication-dropdown')
          .classList.remove('active');
        form.classList.remove('active');
      }
    };
  });
}