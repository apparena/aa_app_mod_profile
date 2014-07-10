define([
    'jquery',
    'underscore',
    'backbone',
    'modules/aa_app_mod_profile/js/views/ProfileView'
], function ($, _, Backbone, ProfileView) {
    'use strict';

    return function () {
        var profileView = ProfileView().init({init: true});
        profileView.render();
    };
});