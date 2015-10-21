var USERS = {}, storage = window.localStorage;

USERS = JSON.parse(storage.getItem('users')) || {};