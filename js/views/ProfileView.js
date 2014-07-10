define([
    'ViewExtend',
    'jquery',
    'underscore',
    'backbone',
    'text!modules/aa_app_mod_profile/templates/index.html',
    'modules/aa_app_mod_auth/js/views/UserDataView',
    'modules/aa_app_mod_auth/js/views/LoginView',
    'jMD5',
    'jquery.validator_config',
    'jquery.serialize_object'
], function (View, $, _, Backbone, ProfileTemplate, UserDataView, LoginView) {
    'use strict';

    return function () {
        View.namespace = 'ProfileView';

        View.code = Backbone.View.extend({
            /**
             * defined backbone el
             * @property el
             * @type {Object}
             * @default ".content-wrapper"
             */
            el: $('.content-wrapper'),

            /**
             * defined backbone events
             * @property events
             * @type {Object}
             */
            events: {
                'click #profile-submit': 'submitData'
            },

            /**
             * stores sent opt-in mailings
             * @property sentOptinMail
             * @type {Object}
             * @default {}
             */
            sentOptinMail: {},

            /**
             * initializer
             * redirection if uid is zero
             * @method initialize
             * @return {Object} Returns this
             */
            initialize: function () {
                _.bindAll(this, 'render', 'submitData', 'handleOptinMail');

                // define basic element
                this.setElement($('.content-wrapper'));

                // is user not signed-in, redirect to homepage
                if (_.uid === 0) {
                    this.goTo('');
                    return this;
                }
                return this;
            },

            /**
             * render static template and put them to .content-wrapper
             * @method render
             * @return {Object} Returns this
             */
            render: function () {
                this.userdataView = UserDataView().init();
                this.userdataModel = this.userdataView.user_data_model;
                this.loginView = LoginView().init();

                // set listener to name changes, to change the name in templates
                this.listenTo(this.userdataModel, 'change:firstname', this.handleUserNameOnPage);
                this.listenTo(this.userdataModel, 'change:lastname', this.handleUserNameOnPage);

                var that = this,
                    data, compiledTemplate,
                    newsletter = '', reminder = '',
                    avatar = this.loginView.loginModel.get('avatar'),
                    avatar_extension = '';

                if (this.userdataModel.get('newsletter').toString() === '1' || this.userdataModel.get('newsletter').toString() === 'true') {
                    newsletter = 'checked="checked"';
                }
                if (this.userdataModel.get('reminder').toString() === '1' || this.userdataModel.get('reminder').toString() === 'true') {
                    reminder = 'checked="checked"';
                }

                this.userdataView.defineRequirements();

                if (avatar.selected === 'gravatar') {
                    avatar_extension = '&s=163';
                } else if (avatar.selected === 'facebook') {
                    avatar_extension = '&width=163&height=163';
                }

                data = {
                    'fullname':   this.userdataModel.get('firstname') + ' ' + this.userdataModel.get('lastname'),
                    'newsletter': newsletter,
                    'reminder':   reminder,
                    'avatar':     avatar.avatars[avatar.selected] + avatar_extension,
                    'userdata':   this.userdataModel.attributes,
                    'required':   this.userdataView.required,
                    'login_mail': this.loginView.loginModel.get('email'),
                    'login_type': this.loginView.loginModel.get('login_type'),
                    'login_sid':  this.loginView.loginModel.get('sid')
                };

                compiledTemplate = _.template(ProfileTemplate, data);
                this.$el.html(compiledTemplate);
                this.setElement(this.$('#profile'));

                // add team name, if user joined a team
                require([
                    'models/MemberTeamModel',
                    'models/TeamModel'
                ], function (MemberTeamModel, TeamModel) {
                    var memberTeamModel = MemberTeamModel().init(),
                        teamModel = TeamModel().init();

                    // get team id
                    that.listenTo(memberTeamModel, 'sync', function () {
                        if (!_.isEmpty(memberTeamModel.get('team_id')) && memberTeamModel.get('team_id') > 0) {
                            teamModel.setGetTeamUrl(memberTeamModel.get('team_id')).fetch();
                        }
                    });

                    // get team information and set team name
                    that.listenTo(teamModel, 'sync', function () {
                        if (!_.isEmpty(teamModel.get('name'))) {
                            that.$('address').find('a')
                                .attr('href', '#/app/team/' + teamModel.get('id'))
                                .html(teamModel.get('name'))
                                .end().removeClass('hide');
                        }
                    });

                    // start process
                    memberTeamModel.set('uid', _.uid);
                });

                this.goTo('call/profile');

                return this;
            },

            /**
             * handle form validation and input data collection to prepare and send with ajax to server
             * @method submitData
             * @param {Object} elem submit button data
             * @return {Object} Returns this or false
             */
            submitData: function (elem) {
                var btn = $(elem.currentTarget),
                    form = btn.closest('form'),
                    data = (form) ? form.serializeObject() : {},
                    user_data, avatar;

                // add date validation method
                $.validator.addMethod('germanDate', function (value, element) {
                        // put your own logic here, this is just a (crappy) example
                        return value.match(/^\d\d?\.\d\d?\.\d\d\d\d$/);
                    }, 'Please enter a date in the format dd.mm.yyyy.'
                );

                form.validate({
                    debug: true,
                    rules: {
                        email:     {
                            required: true,
                            email:    true
                        },
                        firstname: {
                            required: this.userdataView.required.name
                        },
                        lastname:  {
                            required: this.userdataView.required.name
                        },
                        birthday:  {
                            required:   this.userdataView.required.birthday,
                            germanDate: true
                        },
                        street:    {
                            required: this.userdataView.required.address
                        },
                        zip:       {
                            required: this.userdataView.required.address
                        },
                        city:      {
                            required: this.userdataView.required.address
                        },
                        field1:    {
                            required: this.userdataView.required.field1
                        },
                        field2:    {
                            required: this.userdataView.required.field2
                        },
                        field3:    {
                            required: this.userdataView.required.field3
                        },
                        password:  {
                            required: true
                        }
                    },

                    messages: {
                        email:     {
                            required: _.t('msg_require_mail'),
                            email:    _.t('msg_require_mail_format')
                        },
                        firstname: _.t('msg_require_firstname'),
                        lastname:  _.t('msg_require_lastname'),
                        birthday:  _.t('msg_require_birthday'),
                        street:    _.t('msg_require_street'),
                        zip:       _.t('msg_require_zip'),
                        city:      _.t('msg_require_city'),
                        field1:    _.t('msg_require_field1'),
                        field2:    _.t('msg_require_field2'),
                        field3:    _.t('msg_require_field3'),
                        terms:     _.t('msg_require_terms'),
                        password:  _.t('msg_require_password')
                    }
                });

                if (!form.valid()) {
                    return false;
                }

                // implement data into model and save them into local storage
                this.userdataModel.set(data);
                this.userdataModel.unset('password');
                this.userdataModel.set('terms', '1');
                this.userdataModel.save();

                // save userdate to database
                user_data = this.userdataModel.attributes;
                //user_data.email = this.model.get('email');
                user_data.auth_uid = _.uid;
                data = {
                    user_data: user_data,
                    module:    this.userdataModel.get('module'),
                    action:    'updateData',
                    password:  data.password
                };
                this.ajax(data, true);

                // clear password field
                form.find('#password').val('');

                // send opt-in mail if newsletter was accepted
                if (this.userdataModel.get('newsletter') !== 'false' && this.userdataModel.get('optin_nl').toString() === '0') {
                    //this.handleOptinMail('nl_optin');
                }
                if (this.userdataModel.get('reminder') !== 'false' && this.userdataModel.get('optin_reminder').toString() === '0') {
                    //this.handleOptinMail('reminder_optin');
                }

                // update avatar information
                avatar = this.loginView.loginModel.get('avatar');
                avatar.avatars.gravatar = 'https://secure.gravatar.com/avatar/' + $.md5(this.userdataModel.get('email')) + '?s=163&amp;d=mm';
                this.loginView.loginModel.set('avatar', avatar);
                this.loginView.loginModel.save();
                this.loginView.handleNavigation();

                // todo: message ausgeben das gespeichert wurde

                this.goTo('mod/profile');

                return this;
            },

            /**
             * handle opt-in mailings for reminder and newsletter, only if user need an opt-in process
             * @method handleOptinMail
             * @param {String} type - mail type for optin. nl_optin|reminder_optin
             * @return {Object} Returns this
             */
            handleOptinMail: function (type) {
                var that = this;

                // don't send a optin mail again, if accepted before
                if (type === 'nl_optin' && this.userdataModel.get('optin_nl').toString() === '1') {
                    return false;
                }
                if (type === 'reminder_optin' && this.userdataModel.get('optin_reminder').toString() === '1') {
                    return false;
                }

                /**
                 * load optivo module to send opt-in mailings
                 */
                require(['modules/aa_app_mod_optivo/js/views/OptivoView'], function (OptivoView) {
                    var optivo = OptivoView().init(),
                        recipient = that.userdataModel.get('email');

                    // send only each mail one time, store mails into sentOptinMail
                    if (_.isUndefined(that.sentOptinMail[type])) {
                        optivo.sendTransactionMail({
                            'recipient': recipient,
                            'mailtype':  type,
                            'uid':       _.uid
                        });
                        that.sentOptinMail[type] = 1;
                    }

                    OptivoView().remove();
                });

                return this;
            },

            /**
             * Handles all showed user names on page, after first- or lastname changing.
             * This method will be automatically called after name changing, see render method for defined listener
             * @method handleUserNameOnPage
             * @return {Object} Returns this
             */
            handleUserNameOnPage: function () {
                var fullname = this.userdataModel.get('firstname') + ' ' + this.userdataModel.get('lastname'),
                    name = this.userdataModel.get('firstname');

                this.$('.fullname').html(fullname);
                $('#nav-profile').find('h5').html(_.t('hello') + ' ' + name);
                return this;
            }
        });

        return View;
    }
});