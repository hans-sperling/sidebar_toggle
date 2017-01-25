function SidebarRightToggleView(configuration) {

    // ---------------------------------------------------------------------------------------- Preferences & Properties

    var defaultConfiguration = {
            callback : function() {},
            scope    : 'sidebarJS',
            layout   : 'bright',
            element  : ''
        },           // Default configuration
        config = {}, // Contains the merged configurations of default- and user-given-config.
        toggleView,
        items = [];

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

        appendToggle(config.element);
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
            appendTool : appendTool
        };
    }


    /**
     * Appends the sidebar elements to the DOM and returns the html element of the sidebar.
     *
     * @private
     * @returns {HTMLElement}
     */
    function appendToggle(element) {
        var ul = document.createElement('ul');

        ul.className = 'list';
        ul.setAttribute('data-id', '0');
        ul.setAttribute('data-level', '0');

        toggleView = ul;

        element.className += ' toggleView';
        element.appendChild(toggleView);

        config.callback({
            toggleView : toggleView
        });
    }


    function bindEvents() {
        toggleView.onclick = function (e) {
            var target = e.target,
                limit  = 10,
                i;

            do {
                if (target.classList.contains('item')) {
                    if (!target.classList.contains('scoped')) {
                        var scoped = toggleView.getElementsByClassName('scoped');

                        // Remove all deprecated scoped items
                        for (i = 0; i < scoped.length; i++) {
                            scoped[i].className = scoped[i].className.replace('scoped', '').trim();
                        }

                        target.className += ' scoped';
                    }
                }

                if (target.classList.contains('toggle')) {
                    var parent = target.parentNode;
                    // To up to find parent li.row with data-id attribute

                    console.log(parent);
                    while(!parent.classList.contains('.item')) {
                        parent = parent.parentNode;
                    }

                    console.log('parent found: ', parent);
                    if (target.classList.contains('enabled')) {
                        target.className  = target.className.replace('enabled', '').trim();
                        target.className += ' disabled';
                    }
                    else if (target.classList.contains('disabled')) {
                        target.className  = target.className.replace('disabled', '').trim();
                        target.className += ' enabled';
                    }
                }

                target = target.parentNode;

                limit--;
            }
            while (!target.parentNode.classList.contains('toggleView') || limit <= 0);
        };
    }

    // -------------------------------------------------------------------------------------------------- Public methods

    function appendTool(data) {
        var markup  = [],
            item    = data || {},
            element = toggleView.parentNode.querySelectorAll('[data-id="' + item.pid +'"]');

        if (items[item.id] || !element.length) {
            console.warn('There is already a item with this id : ', item.id);
            return;
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
        markup.push(    '<div class="part markup">' + data.tool.getMarkup() + '</div>');
        markup.push(  '</div>');
        markup.push('</li>');

        element.innerHTML += markup.join('');

        item.tool.callback();
    }

    // ----------------------------------------------------------------------------- Initial & Constructor call / Return

    (init)();

    return getPublicApi();
}
