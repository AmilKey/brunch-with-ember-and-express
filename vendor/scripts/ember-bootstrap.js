// Version: 01c440e23a4772f5caabe9d8e27e0b6ac9b35c6c-43-ge92fa8f
// Last commit: e92fa8f (2013-09-11 07:42:04 -0700)


(function() {
var define, requireModule;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requireModule = function(name) {
    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    var mod, deps, callback, reified , exports;

    mod = registry[name];

    if (!mod) {
      throw new Error("Module '" + name + "' not found.");
    }

    deps = mod.deps;
    callback = mod.callback;
    reified = [];
    exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(deps[i]));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;
  };
})();
(function() {
window.Bootstrap = Ember.Namespace.create();
Bootstrap.VERSION = '3.0.0';

if (Ember.libraries) Ember.libraries.register('Bootstrap', Bootstrap.VERSION);

})();



(function() {
var get = Ember.get;

var modalPaneTemplate = [
    '<div class="modal-dialog">',
    '  <div class="modal-content">',
    '    <div class="modal-header">',
    '      {{#if view.showCloseButton}}<button type="button" class="close" rel="close">&times;</button>{{/if}}',
    '      {{view view.headerViewClass}}',
    '    </div>',
    '    <div class="modal-body">{{view view.bodyViewClass}}</div>',
    '    <div class="modal-footer">',
    '      {{view view.footerViewClass}}',
    '    </div>',
    '  </div>',
    '</div>' ].join("\n");

var footerTemplate = [
    '{{#if view.parentView.secondary}}<button type="button" class="btn btn-default" rel="secondary">{{view.parentView.secondary}}</button>{{/if}}',
    '{{#if view.parentView.primary}}<button type="button" class="btn btn-primary" rel="primary">{{view.parentView.primary}}</button>{{/if}}' ]
    .join("\n");

var modalPaneBackdrop = '<div class="modal-backdrop in"></div>';

Bootstrap.ModalPane = Ember.View.extend(Ember.DeferredMixin, {
  classNames: [ 'modal', 'in' ],
  defaultTemplate: Ember.Handlebars.compile(modalPaneTemplate),
  heading: null,
  message: null,
  primary: null,
  secondary: null,
  animateBackdropIn: null,
  animateBackdropOut: null,
  showBackdrop: true,
  showCloseButton: true,
  headerViewClass: Ember.View.extend({
    tagName: 'h3',
    template: Ember.Handlebars.compile('{{view.parentView.heading}}')
  }),
  bodyViewClass: Ember.View.extend({
    tagName: 'p',
    template: Ember.Handlebars.compile('{{{view.parentView.message}}}')
  }),
  footerViewClass: Ember.View.extend({
    template: Ember.Handlebars.compile(footerTemplate)
  }),

  didInsertElement: function() {
    if (get(this, 'showBackdrop')) {
      this._appendBackdrop();
    }
    this.$().show();
    this._setupDocumentKeyHandler();
  },

  willDestroyElement: function() {
    this._removeDocumentKeyHandler();
    if (this._backdrop) {
      this._removeBackdrop();
    }
  },

  keyPress: function(event) {
    if (event.keyCode === 27) {
      this._triggerCallbackAndDestroy({
        close: true
      }, event);
    }
  },

  click: function(event) {
    var target = event.target, targetRel = target.getAttribute('rel');

    if (targetRel) {
      var options = {};
      options[targetRel] = true;

      this._triggerCallbackAndDestroy(options, event);
      return false;
    }
  },

  _appendBackdrop: function() {
    var parentLayer = this.$().parent(), animateIn = this.get("animateBackdropIn");
    this._backdrop = jQuery(modalPaneBackdrop).appendTo(parentLayer);
    if (animateIn) {
      this._backdrop.hide()[animateIn.method](animateIn.options);
    }
  },

  _removeBackdrop: function() {
    var animateOut = this.get("animateBackdropOut"), _this = this;

    if (animateOut) {
      animateOut.options = jQuery.extend({
        always: function() {
          _this._backdrop.remove();
        }
      }, animateOut.options);
      this._backdrop[animateOut.method](animateOut.options);
    } else {
      this._backdrop.remove();
    }
  },

  _setupDocumentKeyHandler: function() {
    var cc = this, handler = function(event) {
      cc.keyPress(event);
    };
    jQuery(window.document).bind('keyup', handler);
    this._keyUpHandler = handler;
  },

  _removeDocumentKeyHandler: function() {
    jQuery(window.document).unbind('keyup', this._keyUpHandler);
  },

  _resolveOrReject: function(options, event) {
    if (options.primary) {
      this.resolve(options, event);
    } else {
      this.reject(options, event);
    }
  },

  _triggerCallbackAndDestroy: function(options, event) {
    var destroy;
    if (this.callback) {
      destroy = this.callback(options, event);
    }
    if (destroy === undefined || destroy) {
      this._resolveOrReject(options, event);
      this.destroy();
    }
  }
});

Bootstrap.ModalPane.reopenClass({
  rootElement: ".ember-application",
  popup: function(options) {
    var modalPane, rootElement;
    if (!options) {
      options = {};
    }
    modalPane = this.create(options);
    rootElement = get(this, 'rootElement');
    modalPane.appendTo(rootElement);
    return modalPane;
  }
});

})();



(function() {
var get = Ember.get, set = Ember.set;

Bootstrap.TypeSupport = Ember.Mixin.create({
  baseClassName: Ember.required(String),
  classNameBindings: ['typeClass'],
  type: null, // success, warning, error, info || inverse
  typeClass: Ember.computed(function() {
    var type = get(this, 'type'),
        baseClassName = get(this, 'baseClassName');
    return type ? baseClassName + '-' + type : null;
  }).property('type').cacheable()
});

})();



(function() {
var get = Ember.get;
Bootstrap.AlertMessage = Ember.View.extend(Bootstrap.TypeSupport, {
  classNames: ['alert', 'alert-message'],
  baseClassName: 'alert',
  template: Ember.Handlebars.compile('<a class="close" rel="close" href="#">&times;</a>{{{view.message}}}'),
  message: null,
  removeAfter: null,

  didInsertElement: function() {
    var removeAfter = get(this, 'removeAfter');
    if (removeAfter > 0) {
      Ember.run.later(this, 'destroy', removeAfter);
    }
  },

  click: function(event) {
    var target = event.target,
        targetRel = target.getAttribute('rel');

    if (targetRel === 'close') {
      this.destroy();
      return false;
    }
  }
});

})();



(function() {
Bootstrap.BlockAlertMessage = Bootstrap.AlertMessage.extend({
  classNames: ['alert', 'alert-block']
});

})();



(function() {
var get = Ember.get;

Bootstrap.ItemViewValueSupport = Ember.Mixin.create({
  value: Ember.computed(function() {
    var parentView = get(this, 'parentView'),
        content, valueKey;
    if (!parentView) return null;
    content = get(this, 'content');
    valueKey = get(parentView, 'itemValueKey') || 'value';
    return get(content, valueKey) || content;
  }).property('content').cacheable()
});

})();



(function() {
var get = Ember.get;

Bootstrap.ItemViewTitleSupport = Ember.Mixin.create({
  title: Ember.computed(function() {
    var parentView = get(this, 'parentView'),
        content, 
        titleKey;

    content = get(this, 'content');
    if (parentView) {
      titleKey = get(parentView, 'itemTitleKey') || 'title';

      return get(content, titleKey) || content;
    }

    return content;
  }).property('content').cacheable()
});

})();



(function() {
var get = Ember.get, set = Ember.set;

Bootstrap.ItemSelectionSupport = Ember.Mixin.create(Bootstrap.ItemViewValueSupport, Bootstrap.ItemViewTitleSupport, {
  classNameBindings: ["isActive:active"],
  allowsEmptySelection: false,

  isActive: Ember.computed(function() {
    var parentView = get(this, 'parentView'),
    selection, value;
    if (!parentView) return false;
    selection = get(parentView, 'selection');
    value = get(this, 'value');
    return selection === value;
  }).property('parentView.selection', 'value').cacheable(),

  click: function(event) {
    var value = get(this, 'value'),
    parentView = get(this, 'parentView'),
    allowsEmptySelection = get(parentView, 'allowsEmptySelection'),
    selection = get(parentView, 'selection');
    if (allowsEmptySelection === true && selection === value) {
      value = null;
    }
    set(parentView, 'selection', value);
    return true;
  }
});

})();



(function() {
var get = Ember.get;

Bootstrap.ItemViewHrefSupport = Ember.Mixin.create({
  href: Ember.computed(function() {
    var parentView = get(this, 'parentView'),
        content, hrefKey;
    content = get(this, 'content');
    if (parentView) {
      hrefKey = get(parentView, 'itemHrefKey') || 'link';
      return get(content, hrefKey) || '#';
    }
    return content;
  }).property('content').cacheable()
});

})();



(function() {
Bootstrap.PillItem = Ember.View.extend(Bootstrap.ItemSelectionSupport, Bootstrap.ItemViewHrefSupport, {
  template: Ember.Handlebars.compile('{{view view.item}}'),

  item: Ember.View.extend({
    tagName: 'a',
    template: Ember.Handlebars.compile('{{view.parentView.title}}'),
    attributeBindings: ['href'],
    hrefBinding: 'parentView.href'
  })
});

})();



(function() {
Bootstrap.Pills = Ember.CollectionView.extend({
  classNames: ['nav', 'nav-pills'],
  classNameBindings: ['isStacked:nav-stacked'],
  tagName: 'ul',
  itemViewClass: Bootstrap.PillItem,
  selection: null
});

})();



(function() {
Bootstrap.Tabs = Ember.CollectionView.extend({
  classNames: ['nav', 'nav-tabs'],
  classNameBindings: ['isStacked:nav-stacked'],
  tagName: 'ul',
  itemViewClass: Bootstrap.PillItem,
  selection: null
});

})();



(function() {
Bootstrap.NavList = Ember.CollectionView.extend({
  classNames: ['nav', 'nav-list'],
  tagName: 'ul',
  itemViewClass: Bootstrap.PillItem,
  selection: null
});

})();



(function() {
var get = Ember.get, fmt = Ember.String.fmt;

Bootstrap.ProgressBar = Ember.View.extend({
  classNames: ['progress'],
  classNameBindings: ['isStriped:progress-striped', 'isAnimated:active'],
  template: Ember.Handlebars.compile('<div class="bar" {{bindAttr style="view.style"}}></div>'),
  isAnimated: false,
  isStriped: false,
  progress: 0,

  style: Ember.computed(function() {
    var progress = get(this, 'progress');

    return fmt('width:%@%;', [progress]);
  }).property('progress').cacheable()
});

})();



(function() {
Bootstrap.Badge = Ember.View.extend(Bootstrap.TypeSupport, {
  tagName: 'span',
  classNames: ['badge'],
  baseClassName: 'badge',
  template: Ember.Handlebars.compile('{{view.content}}')
});

})();



(function() {
Bootstrap.Label = Ember.View.extend(Bootstrap.TypeSupport, {
  tagName: 'span',
  classNames: ['label'],
  baseClassName: 'label',
  template: Ember.Handlebars.compile('{{view.content}}')
});

})();



(function() {
var get = Ember.get;

Bootstrap.Well = Ember.View.extend({
  template: Ember.Handlebars.compile('{{view.content}}'),
  classNames: 'well',
  content: null
});

})();



(function() {
var A = Ember.A;

Bootstrap.Pagination = Ember.CollectionView.extend({
  tagName: 'ul',
  classNames: ['pagination'],
  itemTitleKey: 'title',
  itemHrefKey: 'href',
  init: function() {
    this._super();
    if (!this.get('content')) {
      this.set('content', new A([]));
    }
  },
  itemViewClass: Ember.View.extend(Bootstrap.ItemSelectionSupport, Bootstrap.ItemViewHrefSupport, {
    classNameBindings: ['content.disabled'],
    template: Ember.Handlebars.compile('<a {{bindAttr href="view.href"}}>{{view.title}}</a>')
  })
});

})();



(function() {
Bootstrap.Pager = Ember.CollectionView.extend({
  tagName: 'ul',
  classNames: ['pager'],
  itemTitleKey: 'title',
  itemHrefKey: 'href',
  content: Ember.A([Ember.Object.create({title: '&larr;'}), Ember.Object.create({title: '&rarr;'})]),

  itemViewClass: Ember.View.extend(Bootstrap.ItemViewTitleSupport, Bootstrap.ItemViewHrefSupport, {
    classNameBindings: ['content.next', 'content.previous', 'content.disabled'],
    template: Ember.Handlebars.compile('<a {{bindAttr href="view.href"}}>{{{view.title}}}</a>')
  }),

  arrayDidChange: function(content, start, removed, added) {
    if (content) {
      Ember.assert('content must always has at the most 2 elements', content.get('length') <= 2);
    }
    return this._super(content, start, removed, added);
  }
});

})();



(function() {
var get = Ember.get;

Bootstrap.FirstLastViewSupport = Ember.Mixin.create({
  createChildView: function(view, attrs) {
    var content;

    if (attrs) {
      content = get(this, 'content');

      if (attrs.contentIndex === 0) {
        view = get(this, 'firstItemViewClass') || view;
      }
      if (attrs.contentIndex === (get(content, 'length') - 1)) {
        view = get(this, 'lastItemViewClass') || view;
      }
    }
    return this._super(view, attrs);
  }
});

})();



(function() {
var get = Ember.get;

Bootstrap.Breadcrumb = Ember.CollectionView.extend(Bootstrap.FirstLastViewSupport, {
  tagName: 'ul',
  classNames: ['breadcrumb'],
  divider: '/',
  arrayDidChange: function(content, start, removed, added) {
    var view, 
        index, 
        length,
        item,
        lastItemViewClass = get(this, 'lastItemViewClass'),
        itemViewClass = get(this, 'itemViewClass'),
        lastView;

    this._super.apply(this, arguments);

    if (!content)
      return;

    length = get(content, 'length');

    if (removed) {
      lastView = get(this, 'childViews.lastObject');

      if (lastItemViewClass.detectInstance(lastView))
        return;

      index = length - 1;

      view = this.createChildView(lastItemViewClass, {
        content: content[index],
        contentIndex: index
      });

      this.replace(index, 1, [view]);
    }

    if (added) {
      get(this, 'childViews').forEach(function(childView, index) {
        if (lastItemViewClass.detectInstance(childView) && index !== length - 1) {
          view = this.createChildView(itemViewClass, {
            content: content[index],
            contentIndex: index
          });

          this.replace(index, 1, [view]);
        }
      }, this);

    }

  },
  itemViewClass: Ember.View.extend(Bootstrap.ItemViewTitleSupport, {
    template: Ember.Handlebars.compile('<a href="#">{{view.title}}</a><span class="divider">{{view.parentView.divider}}</span>')
  }),
  lastItemViewClass: Ember.View.extend(Bootstrap.ItemViewTitleSupport, {
    classNames: ['active'],
    template: Ember.Handlebars.compile('{{view.title}}')
  })
});

})();



(function() {
/**
* @property buttonDropdownTemplate
* @type {String}
*/
var buttonDropdownTemplate = [
  '<a {{bindAttr class="view.typeClass :btn :dropdown-toggle" }} data-toggle="dropdown" href="#">',
  '{{view.label}}',
  '<span class="caret"></span>',
  '</a>',
  '<ul class="dropdown-menu">',
  '   {{#if view.items}}',
  '       {{#each item in view.items}}',
  '           <li {{bindAttr class="item.disabled:disabled"}}>{{view view.Item contextBinding="item"}}</li>',
  '       {{/each}}',
  '   {{/if}}',
  '</ul>'
].join("\n");

/**
* @property Bootstrap.ButtonDropdown
* @type {Ember.View}
*/
Bootstrap.ButtonDropdown = Ember.View.extend({

  /**
  * @property label
  * @type {String}
  */
  label: null,

  /**
  * @property items
  * @type {Array}
  */
  items: [],

  /**
  * @property classNames
  * @type {Array}
  */
  classNames: ['btn-group'],

  /**
  * @property defaultTemplate
  * @type {String}
  */
  defaultTemplate: Ember.Handlebars.compile(buttonDropdownTemplate),

  /**
  * @property Item
  * @type {Ember.View}
  */
  Item: Ember.View.extend({

    /**
    * @property tagName
    * @type {String}
    * @default "a"
    */
    tagName: 'a',

    /**
    * @property attributeBindings
    * @type {Array}
    */
    attributeBindings: ['href'],

    /**
    * @property template
    * @type {Function}
    */
    template: Ember.Handlebars.compile('{{label}}'),

    /**
    * @property href
    * @type {Object}
    * @return {String}
    */
    href: '#',

    /**
    * @method click
    * Attempt to invoke the specified action name on the controller.
    * @return {void}
    */
    click: function() {

      var item        = Ember.get(this, 'context'),
          actionName  = Ember.get(item, 'actionName'),
          controller  = Ember.get(this, 'controller');
      var disabled    = Ember.get(item, 'disabled');

      if (disabled === true) {
        // We won't invoke the action if it's disabled.
        return;
      }

      Ember.assert('View `Bootstrap.ButtonDropdown` does not have a controller attached.', !!Ember.get(this, 'controller'));
      Ember.assert(Ember.String.fmt('Controller `%@` does not have an action `%@`!', controller, actionName), !!Ember.canInvoke(controller, actionName));

      // Invoke the action on the controller, passing in the item as the first param.
      Ember.tryInvoke(controller, actionName, [item]);
    }

  })

});

})();



(function() {
Bootstrap.Forms = Ember.Namespace.create({

  human: function(value) {
    if (value === undefined || value === false)
      return;

    // Underscore string
    value = Ember.String.decamelize(value);
    // Replace all _ with spaces
    value = value.replace(/_/g, " ");
    // Capitalize the first letter of every word
    value = value.replace(/(^|\s)([a-z])/g, function(m,p1,p2){ return p1+p2.toUpperCase(); });
    return value;
  }
});

})();



(function() {
Bootstrap.Forms.Field = Ember.View.extend({
  tagName: 'div',
  classNameBindings: [':form-group', 'isValid:has-no-error:has-error'],
  labelCache: undefined,
  help: undefined,
  isValid: true,
  template: Ember.Handlebars.compile([
    '{{view view.labelView viewName="labelView"}}',
    '{{view view.inputField viewName="inputField"}}',
    '{{view view.errorsView}}',
    '{{view view.helpView}}'].join("\n")),

  label: Ember.computed(function(key, value) {
    if(arguments.length === 1){
      if(this.get('labelCache') === undefined){
        var path = this.get('valueBinding._from');
        if (path) {
          path = path.split(".");
          return path[path.length - 1];
        }
      } else {
        return this.get('labelCache');
      }
    } else {
      this.set('labelCache', value);
      return value;
    }
  }).property(),

  labelView: Ember.View.extend({
    tagName: 'label',
    classNames: ['control-label'],
    template: Ember.Handlebars.compile('{{view.value}}'),

    value: Ember.computed(function(key, value) {
      var parent = this.get('parentView');

      if (value && value !== parent.get('label')) {
        parent.set('label', value);
      } else {
        value = parent.get('label');
      }

      // If the labelCache property is present on parent, then the
      // label was set manually, and there's no need to humanise it.
      // Otherwise, it comes from the binding and needs to be
      // humanised.
      return parent.get('labelCache') === undefined || parent.get('labelCache') === false ?
        Bootstrap.Forms.human(value) : value;
    }).property('parentView.label'),

    inputElementId: 'for',
    forBinding: 'inputElementId',
    attributeBindings: ['for']
  }),

  inputField: Ember.View.extend({
    classNames: ['ember-bootstrap-extend', 'form-control'],
    tagName: 'div',
    template: Ember.Handlebars.compile('This class is not meant to be used directly, but extended.')
  }),

  errorsView: Ember.View.extend({
    tagName: 'div',
    classNames: ['errors', 'help-inline'],
    template: Ember.Handlebars.compile('{{view.message}}'),

    message: Ember.computed(function(key, value) {
      var parent = this.get('parentView');

      if (parent != null) {
        var binding = parent.get('valueBinding._from');
        var fieldName = null;
        var object = null;

        if (binding) {
          binding = binding.replace("_parentView.", "").split(".");
          fieldName = binding[binding.length - 1];
          object = parent.get(binding.slice(0, binding.length-1).join('.'));
        } else {
          fieldName = parent.get('label');
          object = parent.get('context');
        }

        if (object && !object.get('isValid')) {
          var errors = object.get('errors');

          if (errors && fieldName in errors && !Ember.isEmpty(errors[fieldName])) {
            parent.set('isValid', false);
            return errors[fieldName].join(', ');
          } else {
            parent.set('isValid', true);
            return '';
          }
        } else {
          parent.set('isValid', true);
          return '';
        }
      }
    }).property('parentView.context.isValid', 'parentView.label')
  }),

  helpView: Ember.View.extend({
    tagName: 'div',
    classNames: ['help-block'],
    template: Ember.Handlebars.compile('{{view.content}}'),
    contentBinding: 'parentView.help'
  }),

  didInsertElement: function() {
    this.set('labelView.inputElementId', this.get('inputField.elementId'));
  }
});

})();



(function() {
Bootstrap.Forms.Select = Bootstrap.Forms.Field.extend({
  optionLabelPath: 'content',
  optionValuePath: 'content',

  inputField: Ember.Select.extend({
    contentBinding:         'parentView.content',

    optionLabelPathBinding: 'parentView.optionLabelPath',
    optionValuePathBinding: 'parentView.optionValuePath',

    valueBinding:           'parentView.value',
    selectionBinding:       'parentView.selection',
    promptBinding:          'parentView.prompt',
    multipleBinding:        'parentView.multiple',
    disabledBinding:        'parentView.disabled',
    classNameBindings:      ['parentView.inputClassNames'],
    name: Ember.computed(function() {
      return this.get('parentView.name') || this.get('parentView.label');
    }).property('parentView.name', 'parentView.label')    
  })
});

})();



(function() {
var get = Ember.get;

Bootstrap.TextSupport = Ember.Mixin.create({
  valueBinding: 'parentView.value',
  placeholderBinding: 'parentView.placeholder',
  disabledBinding: 'parentView.disabled',
  maxlengthBinding: 'parentView.maxlength',
  classNameBindings: 'parentView.inputClassNames',
  classNames: ['form-control'],
  attributeBindings: ['name'],
  name: Ember.computed(function() {
    return get(this, 'parentView.name') || get(this, 'parentView.label');
  }).property('parentView.name', 'parentView.label').cacheable()
});

})();



(function() {
Bootstrap.Forms.TextArea = Bootstrap.Forms.Field.extend({

  inputField: Ember.TextArea.extend(Bootstrap.TextSupport, {
    rowsBinding: 'parentView.rows',
    colsBinding: 'parentView.cols' 
  })
});

})();



(function() {
Bootstrap.Forms.TextField = Bootstrap.Forms.Field.extend({
  type: 'text',

  inputField: Ember.TextField.extend(Bootstrap.TextSupport, {
    typeBinding: 'parentView.type',
    sizeBinding: 'parentView.size'
  })
});

})();



(function() {
Bootstrap.Forms.Checkbox = Bootstrap.Forms.Field.extend({

  inputField: Ember.Checkbox.extend({
    attributeBindings: ['name'],
    checkedBinding:   'parentView.checked',
    disabledBinding: 'parentView.disabled',
    classNameBindings: ['parentView.inputClassNames'],
    name: Ember.computed(function() {
      return this.get('parentView.name') || this.get('parentView.label');
    }).property('parentView.name', 'parentView.label')
  })
});

})();



(function() {
Bootstrap.Forms.UneditableInput = Bootstrap.Forms.Field.extend({

  inputField: Ember.View.extend({
    tagName: 'span',
    classNames: ['uneditable-input'],
    attributeBindings: ['name'],
    template: Ember.Handlebars.compile('{{view.value}}'),

    valueBinding:   'parentView.value',
    classNameBindings: ['parentView.inputClassNames'],
    name: Ember.computed(function() {
      return this.get('parentView.name') || this.get('parentView.label');
    }).property('parentView.name', 'parentView.label')
  })
});

})();



(function() {

})();


})();
