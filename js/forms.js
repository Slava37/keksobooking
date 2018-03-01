'use strict';

window.forms = (function () {

  var formElement = document.querySelector('.notice__form');
  var addressElement = document.getElementById('address');
  var fieldSetsElement = formElement.querySelectorAll('fieldset');
  var btnResetElement = formElement.querySelector('.form__reset');
  var userDialog = document.querySelector('.map');

  // Заполнение поля адреса координатами стартовой позиции метки.
  addressElement.value = window.pin.getStartPositionPinAddress(); // Устанавливаем старовое положение метки в поле адреса.
  addressElement.setAttribute('disabled', true);

  // Доступная и недоступная форма.
  function disableForm() {

    var currentCardElement = document.querySelector('article.map__card');
    document.querySelector('.map').classList.add('map--faded');
    formElement.reset(); // Сбрасываем поля до стартовых значений.
    if (currentCardElement !== null) {
      currentCardElement.style.display = 'none'; // Скрываем карточку.
    }
    window.card.hideCard();
    window.pin.removePins();
    fieldSetsElement.forEach(function (value) {
      value.setAttribute('disabled', true); // Сняли disabled у всех тегов fieldset.address.attributes.setNamedItem('disabled');
    });
    formElement.classList.add('notice__form--disabled');

    addressElement.value = window.pin.getStartPositionPinAddress(); // Возвращаем полю адреса значение стартовой позиции..
    window.pin.setMainPinOnStart();
    window.resetOutputs();
    window.setFiltersDisabled(true);
  }

  function enableForm() {

    // Условие, при котором ряд действий выполняется только, если карта скрыта.
    if (userDialog.classList.contains('map--faded')) {
      userDialog.classList.remove('map--faded'); // Сняли класс у активной карты.
      fieldSetsElement.forEach(function (value) {
        value.removeAttribute('disabled'); // Сняли disabled у всех тегов fieldset.address.attributes.setNamedItem('disabled');
      });
      formElement.classList.remove('notice__form--disabled'); // Сняли disabled у всей формы объявления.
      window.forms.address.setAttribute('disabled', true); // Поле адреса всегда недоступно.
    }

    // Устанавливаем координаты адреса, на конце метки.
    window.forms.address.value = (window.pin.mainPin.offsetLeft + window.pin.getWidthPin() / 2) + ', ' + (window.pin.mainPin.offsetTop + window.pin.getHeightTipOfPin() + window.pin.getHeightPin() / 2);
    window.pin.removePins();
    // Создаем новый массив домов и заполняем его данными с сервера.
    if (!window.newData) {
      window.backend.load(window.notification.onSuccess, window.notification.onMessage);
    } else {
      window.notification.onSuccess(window.newData);
    }
  }

  // Зададим зависимость минимальной стоимости аренды от типа жилья.
  formElement.type.addEventListener('change', function () {
    var mySelect = formElement.type;
    switch (mySelect.value) {
      case 'flat':
        formElement.price.setAttribute('min', 1000);
        break;
      case 'bungalo':
        formElement.price.setAttribute('min', 0);
        break;
      case 'house':
        formElement.price.setAttribute('min', 5000);
        break;
      case 'palace':
        formElement.price.setAttribute('min', 10000);
        break;
    }
  });

  // Зависимость время заезда и выезда.
  formElement.timein.addEventListener('change', function () {
    formElement.timeout.selectedIndex = formElement.timein.selectedIndex;
  });
  formElement.timeout.addEventListener('change', function () {
    formElement.timein.selectedIndex = formElement.timeout.selectedIndex;
  });

  var rooms = formElement.rooms;
  var capacity = formElement.capacity;

  // Задаёт синхронизацию поля количества комнать и поля колличества гостей.
  function onSetRoomWithCapacity(evt) {

    var capacityCount;
    var room;

    if (evt.target === rooms) {
      capacityCount = capacity.options[capacity.selectedIndex].value;
      room = evt.target.value;
    } else if (evt.target === capacity) {
      capacityCount = evt.target.value;
      room = rooms.options[rooms.selectedIndex].value;
    }

    if (room === '1' && capacityCount !== '1') {
      rooms.setCustomValidity('Доступна для 1 гостя');

    } else if (room === '2' && capacityCount !== '2' && capacityCount !== '1') {
      rooms.setCustomValidity('Доступна для 1 или 2 гостей');

    } else if (room === '3' && capacityCount !== '3' && capacityCount !== '2' && capacityCount !== '1') {
      rooms.setCustomValidity('Доступна для 1, 2 или 3 гостей');

    } else if (room === '100' && capacityCount !== '0') {
      rooms.setCustomValidity('Не для гостей');

    } else {
      rooms.setCustomValidity('');
    }
  }

  rooms.addEventListener('change', onSetRoomWithCapacity);
  capacity.addEventListener('change', onSetRoomWithCapacity);

  // Обработчик кнопки "Сбросить"
  btnResetElement.addEventListener('click', disableForm);

  // Создаем обработчик отправки формы на сервер.
  formElement.addEventListener('submit', function (evt) {
    var formData = new FormData(formElement);
    var ourAddress = addressElement.value;

    formData.append('address', ourAddress);
    window.backend.upload(formData, function () {
      formElement.reset();
      addressElement.value = ourAddress; // Поле адреса сбрасываться не должно при отправке формы.
    }, window.notification.onMessage);
    evt.preventDefault();
  });

  return {
    address: addressElement,
    enableForm: enableForm,
    disableForm: disableForm
  };
})();
