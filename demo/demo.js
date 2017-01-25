var form = require('../lib/formspree-form.js');

form({
    form: '#my-form',
    to: 'zacharias@werk85.de',

    globalMessageContainer: '.form-errors',

    successMessage: 'Thank\'s for writing us!',
    failMessage: 'We are sorry! Your message could not be sent.',

    rules: [{
        name: 'message',
        display: 'your Nachricht',
        rules: 'required'
    }, {
        name: 'copy',
        display: 'your Nachricht copy',
        rules: 'numeric'
    }, {
        name: 'email',
        display: 'your maail-address',
        rules: 'required|valid_email',
        // note: since validate-js is not that clever, validation with "depends" must be last in rules list
        depends: function () {
            return !!this.fields.copy.checked;
        }
    }],

    customErrorMessages: {
        'required': 'Please enter %s',
        'valid_email': 'Please check your email-address.'
    }
})