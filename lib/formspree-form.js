var _ = require('lodash');
var $ = require('jquery');

var FormValidator = require('validate-js');

function FormspreeForm(options) {
    this.options = _.extend({
        successMessage: 'Vielen Dank für Ihre Nachricht!',
        failMessage: 'Leider konnte Ihre Nachricht nicht verschickt werden.',
        customErrorMessages: [],
        globalMessageContainer: false
    }, options);

    this.$form = $(this.options.form);

    var validator = new FormValidator(this.$form.get(0), this.options.rules, this.onValidation.bind(this));

    _.forEach(this.options.customErrorMessages, function (val, key) {
        validator.setMessage(key, val);
    });
}

FormspreeForm.prototype = {

    // returns object with form data where fieldName is key and fieldValue is value
    gatherData: function () {
        return _.reduce(this.$form.serializeArray(), function (result, val) {
            result[val.name] = val.value;
            return result;
        }, {});
    },

    onValidation: function (errors, event) {
        // clear all existing error messages
        this.resetErrors();

        if (errors.length) {
            _.each(errors, function (error) {
                this.showError(error.message, $(error.element));
            }.bind(this));

        } else {
            this.send(event);
        }
    },

    resetForm: function () {
        this.$form.get(0).reset();
    },

    lockForm: function () {
        this.$form.find(':input, button').prop('disabled', true);
    },

    unlockForm: function () {
        this.$form.find(':input, button').prop('disabled', false);
    },

    resetErrors: function () {
        // reset highlighted forms
        this.$form.find('.has-error').removeClass('has-error');

        // reset labels
        this.$form.find('label:not(:has(input))').each(function () {
            $(this).html($(this).data('default') || $(this).html());
        });

        // reset global status
        this.$form.find('.global-status').remove();
    },

    showError: function (message, $field) {
        var $group = $field.closest('.form-group');
        var $label = $group.find('label:not(:has(input))');

        // add bootstrap error highlighting class
        $group.addClass('has-error');

        // grab label
        var text = $label.text();

        // save default label to able to restore it when clearing error messages
        $label.data('default', text);

        var compiled = _.template('<%= label %> (<%= message %>)');

        $label.text(compiled({
            label: text,
            message: message
        }));
    },

    showGlobalMessage: function (message, type) {
        var css = 'text-info';

        if (type === 'error') css = 'text-danger';
        if (type === 'success') css = 'text-success';

        var compiled = _.template('<span class="global-status help-block"><span class="<%= className %>"><%= message %></span></span>');

        var html = compiled({
            className: css,
            message: message
        });

        this.appendGlobalMessage(html);
    },

    appendGlobalMessage: function (html) {
        var $container;

        if (this.options.globalMessageContainer) {
            $container = $(this.options.globalMessageContainer);
        }

        if (!$container || !$container.length) {
            $container = this.$form;
        }

        var $node = $(html);
        $container.append($node);
    },

    onSend: function (resonse) {
        if (resonse.success) {
            this.showGlobalMessage(_.result(this.options, 'successMessage'), 'success');
            this.resetForm();

        } else {
            this.showGlobalMessage(_.result(this.options, 'failMessage'), 'error');
        }
    },

    send: function (event) {
        event.preventDefault();

        // get data before we lock the form
        var data = this.gatherData();

        this.lockForm();

        var xhr = $.ajax({
            url: '//formspree.io/' + this.options.to,
            method: 'POST',
            dataType: 'json',
            data: data
        });

        xhr.done(_.bind(this.onSend, this));

        xhr.fail(function () {
            this.showGlobalMessage(_.result(this.options, 'failMessage'), 'error');
        }.bind(this));

        xhr.always(_.bind(this.unlockForm, this));
    }
};

module.exports = function (options) {
    return new FormspreeForm(options);
};