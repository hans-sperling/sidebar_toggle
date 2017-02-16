function Sidebar_Toggle(configuration) {

    // ---------------------------------------------------------------------------------------- Preferences & Properties

    var defaultConfiguration = {
            element  : '',
            layout   : 'bright',
            items    : [],
            onToggle : function(){}
        },           // Default configuration
        config = {}, // Contains the merged configurations of default- and user-given-config.
        toggle,
        items = {};

    // ------------------------------------------------------------------------------------------- Initial & Constructor

    /**
     * Initializes this module.
     * - Merges default config and user given config
     * - Appends this module to the DOM
     * - Binding of the events
     *
     * @private
     */
    function init() {
        mergeConfig();

        appendToggleToElement(config.element);
        appendItems(config.items);
        bindEvents();
    }

    // -------------------------------------------------------------------------------------------------- Helper methods

    /**
     * Deep merge of two given objects.
     *
     * @private
     * @param   {Object} objSlave
     * @param   {Object} objMaster
     * @returns {Object}
     *
     * @link https://github.com/KyleAMathews/deepmerge
     */
    function deepMerge(objSlave, objMaster) {
        var array  = Array.isArray(objMaster);
        var result = array && [] || {};

        if (array) {
            objSlave = objSlave || [];
            result   = result.concat(objSlave);
            objMaster.forEach(function(e, i) {
                if (typeof result[i] === 'undefined') {
                    result[i] = e;
                }
                else if (typeof e === 'object') {
                    result[i] = deepMerge(objSlave[i], e);
                }
                else {
                    if (objSlave.indexOf(e) === -1) {
                        result.push(e);
                    }
                }
            });
        }
        else {
            if (objSlave && typeof objSlave === 'object') {
                Object.keys(objSlave).forEach(function (key) {
                    result[key] = objSlave[key];
                })
            }
            Object.keys(objMaster).forEach(function (key) {
                if (typeof objMaster[key] !== 'object' || !objMaster[key]) {
                    result[key] = objMaster[key];
                }
                else {
                    if (!objSlave[key]) {
                        result[key] = objMaster[key];
                    }
                    else {
                        result[key] = deepMerge(objSlave[key], objMaster[key]);
                    }
                }
            });
        }

        return result;
    }


    /**
     * Merges the default config with the user given config.
     *
     * @private
     */
    function mergeConfig() {
        configuration = configuration || {};
        config        = deepMerge(defaultConfiguration, configuration);
    }

    // -------------------------------------------------------------------------------------------------- Module methods

    /**
     * Returns the public api.
     *
     * @private
     * @returns {Object}
     */
    function getPublicApi() {
        return {
            appendItem : appendItem
        };
    }


    /**
     * Appends the sidebar elements to the DOM and returns the html element of the sidebar.
     *
     * @private
     * @returns {HTMLElement}
     */
    function appendToggleToElement(element) {
        var ul = document.createElement('ul');

        ul.className = 'list';
        ul.setAttribute('data-id', '0');
        ul.setAttribute('data-level', '0');

        toggle = ul;

        element.className += ' sidebar_toggle';
        element.appendChild(toggle);
    }


    function bindEvents() {
        toggle.onclick = function (e) {
            var target  = e.target,
                element = target,
                limit   = 10,
                id      = null,
                enabled = null,
                i, item;

            while ((element !== toggle) || (limit <= 0)) {
                if (element.classList.contains('item')) {
                    id = element.getAttribute('data-id');

                    if (!element.classList.contains('scoped')) {
                        var scoped = toggle.getElementsByClassName('scoped');

                        // Remove all deprecated scoped items
                        for (i = 0; i < scoped.length; i++) {
                            scoped[i].className = scoped[i].className.replace('scoped', '').trim();
                        }

                        element.className += ' scoped';
                    }
                }

                if (element.classList.contains('toggle')) {
                    if (element.classList.contains('enabled')) {
                        element.className  = element.className.replace('enabled', '').trim();
                        element.className += ' disabled';
                        enabled = false;
                    }
                    else if (element.classList.contains('disabled')) {
                        element.className  = element.className.replace('disabled', '').trim();
                        element.className += ' enabled';
                        enabled = true;
                    }
                }

                element = element.parentNode;

                limit--;
            }

            if (enabled !== null) {
                item = items[id];

                if (enabled) {
                    item.enabled = true;
                    item.tool.enable({
                        id      : item.id,
                        pid     : item.pid,
                        enabled : item.enabled
                    });
                }
                else {
                    item.enabled = false;
                    item.tool.disable({
                        id      : item.id,
                        pid     : item.pid,
                        enabled : item.enabled
                    });
                }

                // Callback onToggle event
                config.onToggle({
                    id      : item.id,
                    pid     : item.pid,
                    enabled : item.enabled
                });
            }
        };
    }

    // -------------------------------------------------------------------------------------------------- Public methods

    function appendItems(items) {
        var amount = items.length,
            i, item;

        for (i = 0; i < amount; i++) {
            item = items[i];
            appendItem(item);
        }
    }


    function appendItem(item) {

        var markup  = [],
            element = toggle.parentNode.querySelectorAll('[data-id="' + item.pid +'"]'),
            enabled = item.enabled;

        if(!element.length) {
            console.warn('There is no element with data-id=', item.id);
        }

        if (items[item.id]) {
            console.warn('There is already a item with this id : ', item.id);
        }

        element = element[0];

        items[item.id] = item;

        markup.push('<li class="item tool" data-id="' + item.id + '">');
        markup.push(  '<div class="row">');
        markup.push(    '<div class="part toggle ' + ((item.enabled) ? 'enabled' : 'disabled') + '">');
        markup.push(      '<span class="icon-toggle"></span>');
        markup.push(    '</div>');
        markup.push(    '<div class="part move"></div>');
        markup.push(    '<div class="part space"></div>');
        markup.push(    '<div class="part markup">' + item.tool.getMarkup() + '</div>');
        markup.push(  '</div>');
        markup.push('</li>');

        element.innerHTML += markup.join('');

        item.tool.callback();
    }

    // ----------------------------------------------------------------------------- Initial & Constructor call / Return

    (init)();

    return getPublicApi();
}
