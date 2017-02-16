/*! sidebar.js - Appends a sidebar to the DOM with toggle functionality to expand and collapse it. - Version: 2.2.0 */
/**
 * Appends a sidebar to the DOM with toggle functionality to expand and collapse it.
 *
 * @class Sidebar
 *
 * @type     {Object}
 * @property {Function} collapse          - Collapses the sidebar.
 * @property {Function} expand            - Expands the sidebar.
 * @property {Function} getContentElement - Returns the scope of the .content HTML-Element.
 * @property {Function} getHeaderElement  - Returns the scope of the .header HTML-Element.
 * @property {Function} getResizerElement - Returns the scope of the .resizer HTML-Element.
 * @property {Function} getSidebarElement - Returns the scope of the sidebar HTML-Element.
 * @property {Function} remove            - Removes and unbinds the sidebar.
 *
 * @param {Object}   configuration
 * @param {String}   configuration.class    - CSS-Class(default: sidebarJS)
 * @param {Boolean}  configuration.expanded - Initial folding of the sidebar
 * @param {String}   configuration.id       - DOM-ID for the sidebar
 * @param {String}   configuration.layout   - Custom CSS classes to set the layout (bright, dark)
 * @param {Function} configuration.onResize - Callback function for the resizing event
 * @param {String}   configuration.position - Position of the sidebar (top|right|bottom|left)
 *
 * @returns {Object}
 * @example
 * var sidebarRight,
 *     sidebarLeft;
 *
 * // Minimal config - use all defaults
 * sidebarRight = new Sidebar({
 *     id : 'SidebarRight'
 * });
 *
 * // Full config
 * sidebarLeft = new Sidebar({
 *     id       : 'SidebarLeft',
 *     class    : 'sidebarJS',
 *     layout   : 'dark',
 *     position : 'left',
 *     onResize : function(callbackData) {
 *         console.log(callbackData);
 *     },
 *     expanded : false
 * });
 */
function Sidebar(configuration) {

    // ---------------------------------------------------------------------------------------- Preferences & Properties

    var defaultConfiguration = {
            class    : 'sidebarJS',
            expanded : true,
            id       : '',
            layout   : 'bright',
            onResize : function (){},
            position : 'right'
        },           // Default configuration
        config = {}, // Contains the merged configurations of default- and user-given-config.
        sidebar,     // Contains the scope of the sidebars HTML-Element.
        resizer,     // Contains the scope og the sidebars .resizer HTML-Element.
        header,      // Contains the scope of the sidebar .header HTML-Element.
        content;     // Contains the scope of the sidebars .content HTML-Element.

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

        appendSidebar();
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

        config.position = config.position.toLowerCase();
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
            collapse          : collapse,
            expand            : expand,
            remove            : remove,
            getContentElement : getContentElement,
            getHeaderElement  : getHeaderElement,
            getResizerElement : getResizerElement,
            getSidebarElement : getSidebarElement
        };
    }


    /**
     * Appends the sidebar elements to the DOM and returns the html element of the sidebar.
     *
     * @private
     * @returns {HTMLElement}
     */
    function appendSidebar() {
        var hasDomElement = !!document.getElementById(config.id);

        resizer = document.createElement('div');
        resizer.className = 'resizer';
        resizer.innerHTML = '<div class="clickable"><span class="icon-resizer"></span></div>';

        header           = document.createElement('div');
        header.className = 'header';

        content           = document.createElement('div');
        content.className = 'content';

        if (hasDomElement) {
            sidebar = document.getElementById(config.id);

            config = deepMerge(config, {
                expanded : (sidebar.classList.contains('expanded') ? true : (sidebar.classList.contains('collapsed') ? false : config.expanded)),
                position : sidebar.getAttribute('data-position') || config.position,
                layout   : sidebar.getAttribute('data-layout') || config.layout
            });

            sidebar.className = cleanUpClassNames(sidebar.className);
            sidebar.setAttribute('data-position', '');
            sidebar.setAttribute('data-layout',   '');
        }
        else {
            sidebar    = document.createElement('div');
            sidebar.id = config.id;
        }

        sidebar.className = config.class + ((config.expanded) ? ' expanded' : ' collapsed');
        sidebar.setAttribute('data-position', config.position);
        sidebar.setAttribute('data-layout',   config.layout);

        sidebar.appendChild(header);
        sidebar.appendChild(content);
        sidebar.appendChild(resizer);

        if (!hasDomElement) {
            document.getElementsByTagName('body')[0].appendChild(sidebar);
        }

        return sidebar;
    }


    /**
     * Removes all strings in the invalidList from the given className parameter and returns the new string.
     * Used for keeping non-sidebarJS classes.
     *
     * @private
     * @param className
     * @returns {String}
     */
    function cleanUpClassNames(className) {
        var invalidList = ['collapsed', 'expanded'],
            classList   = className.split(' '),
            result      = [],
            passed, i, j;

        for (i = 0; i < classList.length; i++) {
            passed = true;
            for (j = 0; j < invalidList.length; j++) {
                if (classList[i] == invalidList[j]) {
                    passed = false;
                }
            }

            if (passed) {
                result.push(classList[i]);
            }
        }

        return result.join(' ');
    }

    // ---------------------------------------------------------------------------------------------------------- Events

    /**
     * Binds the events of the sidebar.
     * - Resizer toggle - Expand or collapse the sidebar
     *
     * @private
     */
    function bindEvents() {
        resizer.addEventListener("click", function onClickEvent() {
            if (config.expanded) {
                collapse();
            }
            else {
                expand();
            }
        });
    }


    /**
     * Unbinds all events.
     *
     * @private
     */
    function unbindEvents() {
        resizer.removeEventListener("click", function removeOnClickEvent() {});
    }

    // -------------------------------------------------------------------------------------------------- Public methods

    /**
     * Collapses the sidebar and fires onResize-Callback.
     *
     * @public
     * @example
     * // Create an expanded instance of a sidebar
     * var sidebar = new Sidebar({
     *     id       : 'Sidebar',
     *     expanded : true
     * });
     *
     * // Collapse the sidebar
     * sidebar.collapse();
     */
    function collapse() {
        if (config.expanded) {
            config.expanded = false;

            sidebar.className  = cleanUpClassNames(sidebar.className);
            sidebar.className += ' collapsed';

            config.onResize({
                expanded : config.expanded
            });
        }
    }


    /**
     * Expands the sidebar and fires onResize-Callback.
     *
     * @public
     * @example
     * // Create a collapsed instance of a sidebar
     * var sidebar = new Sidebar({
     *     id       : 'Sidebar',
     *     expanded : false
     * });
     *
     * // Expand the sidebar
     * sidebar.expand();
     */
    function expand() {
        if (!config.expanded) {
            config.expanded = true;

            sidebar.className  = cleanUpClassNames(sidebar.className);
            sidebar.className += '  expanded';

            config.onResize({
                expanded : config.expanded
            });
        }
    }


    /**
     * Returns the scope of the content HTML-Element.
     *
     * @public
     * @returns {HTMLElement}
     * @example
     * var sidebar,
     *     contentElement,
     *     newElement;
     *
     * // Create an instance of a sidebar
     * sidebar = new Sidebar({
     *     id : 'Sidebar'
     * });
     *
     * // Get the content element of the sidebar
     * contentElement = sidebar.getContentElement();
     *
     * // Create child element for the content element
     * newElement = document.createElement('p');
     * newElement.innerHTML = 'Content markup';
     *
     * // Append child element
     * contentElement.appendChild(newElement);
     */
    function getContentElement() {
        return content;
    }


    /**
     * Returns the scope of the header HTML-Element.
     *
     * @public
     * @returns {HTMLElement}
     * @example
     * var sidebar,
     *     headerElement,
     *     newElement;
     *
     * // Create an instance of a sidebar
     * sidebar = new Sidebar({
     *     id : 'Sidebar'
     * });
     *
     * // Get the header element of the sidebar
     * headerElement = sidebar.getHeaderElement();
     *
     * // Create child element for the header element
     * newElement = document.createElement('p');
     * newElement.innerHTML = 'Header markup';
     *
     * // Append child element
     * headerElement.appendChild(newElement);
     */
    function getHeaderElement() {
        return header;
    }


    /**
     * Returns the scope of the .resizer HTML-Element.
     *
     * @public
     * @returns {HTMLElement}
     * @example
     * var sidebar,
     *     resizerElement;
     *
     * // Create an instance of a sidebar
     * sidebar = new Sidebar({
     *     id : 'Sidebar'
     * });
     *
     * // Get the resizer element of the sidebar
     * resizerElement = sidebar.getResizerElement();
     *
     * // Add a custom CSS selector to the resizer element
     * resizerElement.classList.push('customCssSelector');
     */
    function getResizerElement() {
        return resizer;
    }


    /**
     * Returns the scope of the sidebar HTML-Element.
     *
     * @public
     * @returns {HTMLElement}
     * @example
     * var sidebar,
     *     sidebarElement;
     *
     * // Create an instance of a sidebar
     * sidebar = new Sidebar({
     *     id : 'Sidebar'
     * });
     *
     * // Get the sidebar element of the sidebar
     * sidebarElement = sidebar.getSidebarElement();
     *
     * // Add a custom CSS selector to the sidebar element
     * sidebarElement.classList.push('customCssSelector');
     */
    function getSidebarElement() {
        return sidebar;
    }


    /**
     * Removes and unbinds the sidebar.
     *
     * @public
     * @example
     * var sidebar;
     *
     * // Create an instance of a sidebar
     * sidebar = new Sidebar({
     *     id : 'Sidebar'
     * });
     *
     * // Remove the sidebar from the DOM and unbind all its events
     * sidebar.remove();
     */
    function remove() {
        unbindEvents();
        sidebar.parentElement.removeChild(sidebar);
    }

    // ----------------------------------------------------------------------------- Initial & Constructor call / Return

    (init)();

    return getPublicApi();
}
