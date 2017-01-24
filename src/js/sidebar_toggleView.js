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
        toggleView.addEventListener("click", function onClickEvent() {
            // ...
        });

        /*
        $sidebar.on('click.sidebarEvents', '.item', function(e) {
            var $this  = $(this),
                $item  = $this,
                $items = $sidebar.find('.item'),
                $row   = $item.find('.row');

            $items.removeClass('scoped');
            $item.addClass('scoped');
        });
        */
    }

    // -------------------------------------------------------------------------------------------------- Public methods

    function appendTool(data) {
        console.log(data);
        var markup  = [],
            item    = data || {},
            element = document.querySelectorAll('[data-id="' + item.pid +'"]');

        // @todo - Searc only fpr data-id attributes in the current scope 'sidebarJS'

        if (items[item.id] || !element.length) {
            console.warn('There is already a item with this id : ', item.id);
            return;
        }

        element = element[0];

        items[item.id] = item;

        markup.push('<li class="item tool" data-id="' + item.id + '">');
        markup.push(  '<div class="row">');
        markup.push(    '<div class="part toggle">');
        markup.push(      '<span class="icon-toggle ' + ((item.enabled) ? 'enabled' : 'disabled') + '"></span>');
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
