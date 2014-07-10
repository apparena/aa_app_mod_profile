# App-Arena.com App Module Boilerplate

## Information
* **Github:** [Repository](https://github.com/apparena/aa_app_mod_profile)
* **Docs:**   [Appalizr.com](http://www.appalizr.com/docs.html)
* This is a module of the [aa_app_template](https://github.com/apparena/aa_app_template)

This is a module of the [aa_app_template](https://github.com/apparena/aa_app_template)

## Module job
Shows a new page to edit profile information, change password and later handle avatars, nickname and much more. Work in progress, but currently a stable version with basic functions.

### Dependencies
* [aa_app_mod_auth](https://github.com/apparena/aa_app_mod_auth)

### Important functions
* **render** - render static template and put them to .content-wrapper
* **submitData** - handle form validation and input data collection to prepare and send with ajax to server
	* elem - submit button data (DOM elements from formulae)
* **handleOptinMail** - handle opt-in mailings for reminder and newsletter, only if user need an opt-in process
	* type - mail type for optin. nl_optin|reminder_optin
* **handleUserNameOnPage** - Handles all showed user names on page, after first- or lastname changing. This method will be automatically called after name changing, see render method for defined listener.

### Example - Sow profile page after click or over a main file call
```javascript
require(['modules/aa_app_mod_profile/js/views/ProfileView'], function (ProfileView) {
    var profileView = ProfileView().init({init: true});
    profileView.render();
});
```

### Load module with require
```
modules/aa_app_mod_profile/js/views/ProfileView
```

#### App-Manager locale values
| locale | value example |
|--------|--------|
| msg_require_mail | Es wird eine E-Mail Adresse benötigt. |
| msg_require_mail_format | Die E-Mail muss das Format name@domain.de haben |
| msg_require_firstname | Bitte Vornamen angeben |
| msg_require_lastname | Bitte Nachnamen angeben |
| msg_require_birthday | Bitte Geburtsdatum ausfüllen |
| msg_require_street | Bitte Straßenname angeben |
| msg_require_zip | Bitte Postleitzahl ausfüllen |
| msg_require_city | Bitte Stadt angeben |
| msg_require_field1 | Bitte ausfüllen |
| msg_require_field2 | Bitte ausfüllen |
| msg_require_field3 | Bitte ausfüllen |
| msg_require_terms | Bitte Teilnahmebedingungen bestätigen |
| msg_require_password | Dieses Feld muss den selben Inhalt wie das Passwort haben |
| hello | Hallo |