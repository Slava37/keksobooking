'use strict';

window.pin = (function () {

  var WIDTH_PIN = 40;
  var HEIGHT_PIN = 44;
  var HEIGHT_TIP_OF_PIN = 18;
  var MAP_MAX_TOP = 150;
  var MAP_MAX_BOTTOM = 500;
  var MAP_WIDTH = document.querySelector('.map__pins').offsetWidth;
  var START_POSITION_X = window.mapElement.querySelector('.map__pin--main').offsetLeft;
  var START_POSITION_Y = window.mapElement.querySelector('.map__pin--main').offsetTop - HEIGHT_PIN / 2;
  var MAX_HOUSES = 5;

  var mainPin = window.mapElement.querySelector('.map__pin--main');
  var address = document.getElementById('address');
  var pinImage = mainPin.querySelector('.main__pin--image');
  var buttonTemplate = document.querySelector('template').content.querySelector('.map__pin');
  var pins = window.mapElement.querySelector('.map__pins');

  var position = getStartPositionPinAddress();

  // Реализация передвижения метки.
  pinImage.addEventListener('mousedown', function (evt) {
    evt.preventDefault();

    var startCoords = {
      x: evt.clientX,
      y: evt.clientY
    };

    function onMouseMove(moveEvt) {
      moveEvt.preventDefault();

      var shift = {
        x: startCoords.x - moveEvt.clientX,
        y: startCoords.y - moveEvt.clientY
      };
      startCoords = {
        x: moveEvt.clientX,
        y: moveEvt.clientY
      };

      if ((mainPin.offsetTop - shift.y) < MAP_MAX_BOTTOM && (mainPin.offsetTop - shift.y) > MAP_MAX_TOP) {
        mainPin.style.top = (mainPin.offsetTop - shift.y) + 'px';
      }
      if ((mainPin.offsetLeft - shift.x) < MAP_WIDTH && (mainPin.offsetLeft - shift.x) > 0) {
        mainPin.style.left = (mainPin.offsetLeft - shift.x) + 'px';
      }
      position = (mainPin.offsetLeft - shift.x) + ', ' + (mainPin.offsetTop - shift.y);
      address.value = ((mainPin.offsetLeft - shift.x) + ', ' + (mainPin.offsetTop + window.pin.getHeightTipOfPin() - shift.x));
      address.value = position;
    }

    // Обработка отпускания кнопки мыши при перетаскивании, появляется активное окно.
    function onMouseUp() {
      window.forms.enableForm();
      address.value = position;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);

  });

  var setMainPinOnStart = function () {
    mainPin.style.left = START_POSITION_X + 'px'; // ставим метку на стартовую позицию.
    mainPin.style.top = START_POSITION_Y + 'px';
  };

  function getHeightPin() {
    return HEIGHT_PIN;
  }
  function getWidthPin() {
    return WIDTH_PIN;
  }
  function getHeightTipOfPin() {
    return HEIGHT_TIP_OF_PIN;
  }
  function getStartPositionPinAddress() {
    return START_POSITION_X + ', ' + START_POSITION_Y;
  }

  // Удаляет метки.
  function removePins() {
    var pinsElement = document.querySelector('.map__pins').getElementsByTagName('button');
    var pinsArrLength = pinsElement.length;
    for (var i = 1; i < pinsArrLength; i++) {
      pinsElement[0].parentNode.removeChild(pinsElement[1]); // Удаляем метки, кроме главной.
    }
  }

  // Возаращает новую метку, созданный на основе данных параметра (объекта).
  function createButtonsPin(house) {
    var pinElement = buttonTemplate.cloneNode(true);
    pinElement.querySelector('img').src = house.author.avatar;

    pinElement.style.left = house.location.x + 'px';

    pinElement.style.top = (house.location.y - WIDTH_PIN) + 'px';
    pinElement.classList.add('fragments');

    // Добавляем обработчик и создание карточки для дома.
    pinElement.addEventListener('click', function () {
      window.showCard(house);
    });
    return pinElement;
  }

  // Возвращает фрагмент, созданный из массива меток.
  function makeFragmentPins(houses) {
    var lengthArr = MAX_HOUSES < houses.length ? MAX_HOUSES : houses.length;
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < lengthArr; i++) {
      var newPin = createButtonsPin(houses[i]);
      fragment.appendChild(newPin);
    }
    return fragment;
  }
  // При успешном загрузке данных с сервера мы экспортируем экземпляр данных.
  window.renderPins = function () {
    var data = window.newData.slice();
    pins.appendChild(window.pin.makeFragmentPins(window.filter.apply(data))); // Поставили метки обьявлений.

    window.setFiltersDisabled(false);

    // Передаем функцию отрисовки пинов в модуль filter.js чере коллбек.
    window.filter.setCallback(function () {
      pins.appendChild(window.pin.makeFragmentPins(window.filter.apply(data)));
    });
  };
  return {
    getHeightPin: getHeightPin,
    getWidthPin: getWidthPin,
    getHeightTipOfPin: getHeightTipOfPin,
    getStartPositionPinAddress: getStartPositionPinAddress,
    removePins: removePins,
    setMainPinOnStart: setMainPinOnStart,
    mainPin: mainPin,
    makeFragmentPins: makeFragmentPins
  };
})();
