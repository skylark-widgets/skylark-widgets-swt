/**
 * skylark-widgets-swt - The skylark widget framework and standard widgets
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-swt/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx/skylark");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-widgets-swt/swt',[
  "skylark-langx/skylark",
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query"
],function(skylark,langx,browser,eventer,noder,geom,$){
	var ui = skylark.ui = skylark.ui || {};
		sbswt = ui.sbswt = {};

	var CONST = {
		BACKSPACE_KEYCODE: 8,
		COMMA_KEYCODE: 188, // `,` & `<`
		DELETE_KEYCODE: 46,
		DOWN_ARROW_KEYCODE: 40,
		ENTER_KEYCODE: 13,
		TAB_KEYCODE: 9,
		UP_ARROW_KEYCODE: 38
	};

	var isShiftHeld = function isShiftHeld (e) { return e.shiftKey === true; };

	var isKey = function isKey (keyCode) {
		return function compareKeycodes (e) {
			return e.keyCode === keyCode;
		};
	};

	var isBackspaceKey = isKey(CONST.BACKSPACE_KEYCODE);
	var isDeleteKey = isKey(CONST.DELETE_KEYCODE);
	var isTabKey = isKey(CONST.TAB_KEYCODE);
	var isUpArrow = isKey(CONST.UP_ARROW_KEYCODE);
	var isDownArrow = isKey(CONST.DOWN_ARROW_KEYCODE);

	var ENCODED_REGEX = /&[^\s]*;/;
	/*
	 * to prevent double encoding decodes content in loop until content is encoding free
	 */
	var cleanInput = function cleanInput (questionableMarkup) {
		// check for encoding and decode
		while (ENCODED_REGEX.test(questionableMarkup)) {
			questionableMarkup = $('<i>').html(questionableMarkup).text();
		}

		// string completely decoded now encode it
		return $('<i>').text(questionableMarkup).html();
	};

	langx.mixin(ui, {
		CONST: CONST,
		cleanInput: cleanInput,
		isBackspaceKey: isBackspaceKey,
		isDeleteKey: isDeleteKey,
		isShiftHeld: isShiftHeld,
		isTabKey: isTabKey,
		isUpArrow: isUpArrow,
		isDownArrow: isDownArrow
	});

	return ui;

});

define('skylark-widgets-swt/Widget',[
  "skylark-widgets-base/Widget"
],function(Widget){
  return Widget;
});

define('skylark-widgets-swt/Panel',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "skylark-bootstrap3/collapse",
  "./swt",
  "./Widget"
],function(langx,browser,eventer,noder,geom,$,collapse,swt,Widget){

  var Panel = Widget.inherit({
    klassName : "Panel",

    pluginName : "lark.panel",

    options : {
      toggler : {
        selector : ".panel-heading [data-toggle=\"collapse\"]"
      },

      body : {
        selector : ".panel-collapse"
      }
    },

    _init : function() {
      var self = this;
      this.$toggle = this._velm.find(this.options.toggler.selector);
      this.$body = this._velm.find(this.options.body.selector);
      this.$toggle.on('click.lark',function (e) {
        var $this   = $(this);
        var collpasePlugin    = self.$body.collapse('instance');
        if (collpasePlugin) {
          collpasePlugin.toggle();
        } else {
          self.$body.collapse($this.data());
        }
      });

    },

    expand : function() {
      // expand this panel
      this.$body.collapse("show");
    },

    collapse : function() {
      // collapse this panel
      this.$body.collapse("hide");
    },

    toogle : function() {
      // toogle this panel
     this.body.collapse("toogle");
    },

    full : function() {

    },

    unfull : function() {

    },

    toogleFull : function() {

    },
    
    close: function () {
      var panel_dom = this.dom(id);
      this.minimize(id, true).promise().then(function () {
        panel_dom.fadeOut();
      });
    }


  });


  return Panel;

});
define('skylark-widgets-swt/Accordion',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "skylark-bootstrap3/collapse",
  "./swt",
  "./Widget",
  "./Panel"
],function(langx,browser,eventer,noder,geom,$,collapse,swt,Widget, Panel){

  var Accordion = Widget.inherit({
    klassName : "Accordion",

    pluginName : "lark.accordion",

    options : {
      panel: {
        selector : "> .panel",
        template : null,
      }
    },

    _init : function() {
      var panels = [];
      this._velm.$(this.options.panel.selector).forEach(function(panelEl){
        var panel = new Accordion.Panel(panelEl,{

        });
        panels.push(panel);
      });
      this._panels = panels;
    },

    _post : function() {
      // handle internal events
    },

    _refresh : function(updates) {
    },

    panels : {
      get : function() {

      }
    },


    addPanel : function() {
      var $newPanel = $template.clone();
      $newPanel.find(".collapse").removeClass("in");
      $newPanel.find(".accordion-toggle").attr("href",  "#" + (++hash))
               .text("Dynamic panel #" + hash);
      $newPanel.find(".panel-collapse").attr("id", hash).addClass("collapse").removeClass("in");
      $("#accordion").append($newPanel.fadeIn());

    },

    /**
     * Removes a accordion pane.
     *
     * @method remove
     * @return {Accordion} The current widget.
     */
    remove : function() {

    },

    /**
     * Expands a accordion pane.
     *
     * @method remove
     * @return {Accordion} The current widget.
     */
    expand : function() {
      // expand a panel

    },

    /**
     * Expands all accordion panes.
     *
     * @method expandAll
     * @return {Accordion} The current widget.
     */
    expandAll : function() {
      // expand a panel

    },

    /**
     * Collapse a accordion pane.
     *
     * @method collapse
     * @return {Accordion} The current widget.
     */
    collapse : function() {

    },

    /**
     * Collapses all accordion pane.
     *
     * @method collapseAll
     * @return {Accordion} The current widget.
     */
    collapseAll : function() {

    }
  });

  Accordion.Panel = Panel.inherit({
    klassName : "AccordionPanel",

    _init : function() {
      //this._velm.collapse();
      this.overrided();
    },

    expand : function() {
      // expand this panel
      $(this._elm).collapse("show");
    },

    collapse : function() {
      // collapse this panel
      $(this._elm).collapse("hide");
    },

    toogle : function() {
      // toogle this panel
     $(this._elm).collapse("toogle");
    },

    remove : function() {
      this.overided();
    }
  });

  return swt.Accordion = Accordion;
});

define('skylark-widgets-swt/Button',[
  "skylark-langx/langx",
  "skylark-utils-dom/query",
  "./swt",
  "./Widget"
],function(langx,$,swt,Widget){

	class Button extends Widget {
		get klassName() {
      return "Button";
    } 

    get pluginName(){
      return "lark.button";
    } 

		get options () {
      return {
        btnSize : "lg",
        btnType : "default",
        leftIcon : null,
        rightIcon : null,
        topIcon : null, // TODO
        bottomIcon : null //TODO        
      }
		}

    get state() {
      return {
        "text" : String
      }
    }

    _parse (elm,options) {
      var $el = $(elm),
          options = langx.mixin({},options);

      if (!options.btnType) {
        if ($el.hasClass("btn-link")) {
          options.btnType = "link";
        } else if ($el.hasClass("btn-default")) {
          options.btnType = "default";
        } else if ($el.hasClass("btn-primary")) {
          options.btnType = "primary";
        } else if ($el.hasClass("btn-info")) {
          options.btnType = "info";
        } else if ($el.hasClass("btn-success")) {
          options.btnType = "success";
        } else if ($el.hasClass("btn-warning")) {
          options.btnType = "warning";
        } else if ($el.hasClass("btn-danger")) {
          options.btnType = "danger";
        }        
      }

      if (!options.btnSize) {
        if ($el.hasClass("btn-xs")) {
          options.btnSize = "xs";
        } else if ($el.hasClass("btn-sm")) {
          options.btnSize = "sm";
        } else if ($el.hasClass("btn-lg")) {
          options.btnSize = "lg";
        }        
      }

      if (!options.href) {
        options.href = $el.attr('href');

        options.target = $el.attr('target');
      }

      if (!options.text) {
        options.text = $el.find('.text').text();
      }

      if (!options.leftIcon) {
        var $fa_icon_left = $el.find('.fa-icon-left');
        if ($fa_icon_left.length > 0) {
          $fa_icon_left.removeClass('fa-icon-left').removeClass('fa');
          options.leftIcon = $fa_icon_left.attr('class');
          $fa_icon_left.addClass('fa-icon-left').addClass('fa');
        }
      }

      if (!options.rightIcon) {
        var $fa_icon_right = $el.find('.fa-icon-right');

        if ($fa_icon_right.length > 0) {
          $fa_icon_right.removeClass('fa-icon-right').removeClass('fa');
          options.rightIcon = $fa_icon_right.attr('class');
          $fa_icon_right.addClass('fa-icon-right').addClass('fa');
        }        
      }
    }

    _refresh (updates) {
      //this.overrided(updates);
      super._refresh(updates);

      var velm = this._velm;

      if (updates.btnType) {
          velm.removeClass('btn-link btn-default btn-primary btn-info btn-success btn-warning btn-danger').addClass("btn-" + updates.btnType.value);
      }

      if (updates.btnSize) {
        velm.removeClass('btn-xs btn-sm btn-lg').addClass("btn-" + updates.btnSize.value);
      }

      if (updates.text) {
        velm.$('.text').text(updates.text.value);
      }

      if (updates.left) {
          velm.$('.fa-icon-left').remove();
          velm.prepend('<i style="word-spacing: -1em;" class="fa fa-icon-left fa-' + updates.iconleft.value + '">&nbsp;</i>\n');
      }

      if (updates.iconright) {
          velm.$('.fa-icon-right').remove();
          if (updates.iconright.value) {
              velm.append('<i style="word-spacing: -1em;" class="fa fa-icon-right fa-' + updates.iconright.value + '">&nbsp;</i>\n');
          }
      }
    }
  };

  Widget.register(Button);
//  class Buttonx extends Button {
//
//  }

//  Widget.register(Buttonx,"lark.button");
  return swt.Button = Button;

});




define('skylark-widgets-swt/Carousel',[
    "skylark-langx/langx",
    "skylark-utils-dom/browser",
    "skylark-utils-dom/eventer",
    "skylark-utils-dom/noder",
    "skylark-utils-dom/geom",
    "skylark-utils-dom/query",
    "./swt",
    "./Widget",
    "skylark-bootstrap3/carousel"
], function(langx, browser, eventer, noder, geom,  $, swt, Widget) {

    var Carousel =  Widget.inherit({
        klassName : "Carousel",
        pluginName : "lark.carousel",

        options : {

            items : [],

            indicatorTemplate : "",
            slideTemplate : "",

            templates : {
              container : "<div class=\"carousel slide\" data-ride=\"carousel\">" +
                          "/div",
              indicators : {
                  container : "<ol class=\"carousel-indicators\">" +
                              "</ol>",
                  item :  "<li></li>"
              },

              slides : {
                  container : "<div class=\"carousel-inner\">" +
                              "/div",
                  item :  "<div class=\"item carousel-item\">" +
                            "<img alt=\"First slide\"  src=\"{{url}}\">" +
                          "</div>"
              }
            }
        },

        _init : function() {
          this._bs_carousel = this._velm.carousel(this.options);
          var self = this;          
          this._velm.on("click.lark", "[data-slide],[data-slide-to]", function(e) {
            var $this = $(this)
            var slideIndex = $this.attr('data-slide-to');
            if (slideIndex) {
                self.to(slideIndex);
            } else {
              var slideAction = $this.attr('data-slide');
              if (slideAction == "prev") {
                self.prev();
              } else {
                self.next();
              }
            }

            e.preventDefault();

        });
        },

        to : function(pos) {
          return this._bs_carousel.to(pos);
        },

        pause : function(e) {
          this._bs_carousel.pause(e);
          return this;
        },

        cycle : function(e) {
          return this._bs_carousel.cycle(e);
        },

        next : function() {
          return this._bs_carousel.next();
        },

        prev : function() {
          return this._bs_carousel.prev();
        },

        add : function() {
            
        },

        createIndicator: function (obj) {
          var gallery = this.gallery,
            indicator = this.indicatorPrototype.cloneNode(false)
          var title = gallery.getItemTitle(obj)
          var thumbnailProperty = this.options.thumbnailProperty
          var thumbnailUrl
          var thumbnail
          if (this.options.thumbnailIndicators) {
            if (thumbnailProperty) {
              thumbnailUrl = Gallery.getItemProperty(obj, thumbnailProperty)
            }
            if (thumbnailUrl === undefined) {
              thumbnail = obj.getElementsByTagName && $(obj).find('img')[0]
              if (thumbnail) {
                thumbnailUrl = thumbnail.src
              }
            }
            if (thumbnailUrl) {
              indicator.style.backgroundImage = 'url("' + thumbnailUrl + '")'
            }
          }
          if (title) {
            indicator.title = title;
          }
          return indicator;
      },

      addIndicator: function (index) {
        if (this.indicatorContainer.length) {
          var indicator = this.createIndicator(this.list[index])
          indicator.setAttribute('data-slide-to', index)
          this.indicatorContainer[0].appendChild(indicator)
          this.indicators.push(indicator)
        }
      },

      setActiveIndicator: function (index) {
        if (this.indicators) {
          if (this.activeIndicator) {
            this.activeIndicator.removeClass(this.options.activeIndicatorClass)
          }
          this.activeIndicator = $(this.indicators[index])
          this.activeIndicator.addClass(this.options.activeIndicatorClass)
        }
      },

      initSlides: function (reload) {
        if (!reload) {
          this.indicatorContainer = this.container.find(
            this.options.indicatorContainer
          )
          if (this.indicatorContainer.length) {
            this.indicatorPrototype = document.createElement('li')
            this.indicators = this.indicatorContainer[0].children
          }
        }
        this.overrided(reload);
      },

      addSlide: function (index) {
        this.overrided(index);
        this.addIndicator(index)
      },

      resetSlides: function () {
        this.overrided();
        this.indicatorContainer.empty();
        this.indicators = [];
      },

    });

    return swt.Carousel = Carousel;

});
define('skylark-widgets-swt/_Toggler',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "./swt",
  "./Widget"
],function(langx,browser,eventer,noder,geom,$,swt,Widget){

  var _Toggler = swt._Toggler = Widget.inherit({
    klassName: "_Toggler",

    toggle: function () {
      var checked = this.isChecked();

      if (checked) {
        this.uncheck();
      } else {
        this.check();
      }
    },

    check: function  () {
      this.state.set('checked',true);
      return this;
    },

    uncheck: function () {
      this.state.set('checked',false);
      return this;
    },

    /**
     * Getter function for the checked state.
     *
     * @method isChecked
     * @return {Boolean} True/false 
     */
    isChecked: function () {
      return this.state.get('checked');
    }
  });

	return _Toggler;
});

define('skylark-widgets-swt/CheckBox',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "./swt",
  "./_Toggler"
],function(langx,browser,eventer,noder,geom,$,swt,_Toggler){

  var CheckBox =  _Toggler.inherit({
    klassName: "CheckBox",

    pluginName : "lark.checkbox",

    options : {
      selectors : {
        chk : "input[type=checkbox]",
        lbl : "checkbox-label"
      },
      template : undefined,
      checked : undefined,
      label : undefined,
      value : undefined
    },

    /*
     *@override
     */
    _parse : function(elm,options) {
      options = this.overrided(elm,options);
      var $el = $(elm),
          chkSelector = options.selectors && options.selectors.chk,
          lblSelector = options.selectors && options.selectors.lbl;

      if (!chkSelector) {
        chkSelector = this.options.selectors.chk;
      }
      if (!lblSelector) {
        lblSelector = this.options.selectors.lbl;
      }

      var $chk = $el.find(chkSelector),
          $lbl = $el.find(lblSelector);

      if (options.checked == undefined) {
        options.checked = $chk.prop('checked')
      } else {
        $chk.prop('checked',options.checked);
      }

      if (options.disabled == undefined) {
        options.disabled = $chk.prop('disabled')
      } else {
        $chk.prop('disabled',options.disabled);
      }

      return options;
    },

    /*
     *@override
     */
    _create : function() {
      //TODO
    },

    /*
     *@override
     */
    _init : function() {
      var elm = this._elm;

      // cache elements
      this.$lbl = this._velm.$(this.options.selectors.lbl);
      this.$chk = this._velm.$(this.options.selectors.chk);
    },


    /*
     *@override
     */
    _startup : function() {
      // handle internal events
      var self = this;
      this.$chk.on('change', function(evt) {
        //var $chk = $(evt.target);
        var checked = self.$chk.prop('checked');
        self.state.set("checked",checked);
      });
    },

    /*
     *@override
     */
    _refresh : function(updates) {

        function setCheckedState (checked) {
          var $chk = self.$chk;
          var $lbl = self.$label;
          var $containerToggle = self.$toggleContainer;

          if (checked) {
            $chk.prop('checked', true);
            $lbl.addClass('checked');
            $containerToggle.removeClass('hide hidden');
          } else {
            $chk.prop('checked', false);
            $lbl.removeClass('checked');
            $containerToggle.addClass('hidden');
          }
        }

        function setDisabledState (disabled) {
          var $chk = self.$chk;
          var $lbl = self.$label;

          if (disabled) {
            $chk.prop('disabled', true);
            $lbl.addClass('disabled');
          } else {
            $chk.prop('disabled', false);
            $lbl.removeClass('disabled');
          }
        }

        // update visual with attribute values from control
        this.overrided(changed);
        var self  = this;

        if (updates["checked"]) {
          setCheckedState(updates["checked"].value);
        }
        if (updates["disabled"]) {
          setDisabledState(updates["disabled"].value);
        }
    }
  });

	return swt.CheckBox = CheckBox;
});

define('skylark-widgets-swt/ComboBox',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "./swt",
  "./Widget",
  "skylark-bootstrap3/dropdown"
],function(langx,browser,eventer,noder,geom,$,swt,Widget){



	// COMBOBOX CONSTRUCTOR AND PROTOTYPE

	var ComboBox = Widget.inherit({
		klassName: "ComboBox",

		pluginName : "lark.combobox",

		widgetClass : "lark-combobox",

		options : {

			autoResizeMenu: true,
			filterOnKeypress: false,
			showOptionsOnKeypress: false,
			filter: function filter (list, predicate, self) {
				var visible = 0;
				self.$dropMenu.find('.empty-indicator').remove();

				list.each(function (i) {
					var $li = $(this);
					var text = $(this).text().trim();

					$li.removeClass();

					if (text === predicate) {
						$li.addClass('text-success');
						visible++;
					} else if (text.substr(0, predicate.length) === predicate) {
						$li.addClass('text-info');
						visible++;
					} else {
						$li.addClass('hidden');
					}
				});

				if (visible === 0) {
					self.$dropMenu.append('<li class="empty-indicator text-muted"><em>No Matches</em></li>');
				}
			}
		},

		_init : function() {
			this.$element = $(this._elm);

			this.$dropMenu = this.$element.find('.dropdown-menu');
			this.$input = this.$element.find('input');
			this.$button = this.$element.find('.btn');
			this.$button.dropdown();
			this.$inputGroupBtn = this.$element.find('.input-group-btn');

			this.$element.on('click.lark', 'a', langx.proxy(this.itemclicked, this));
			this.$element.on('change.lark', 'input', langx.proxy(this.inputchanged, this));
			this.$element.on('shown.bs.dropdown', langx.proxy(this.menuShown, this));
			this.$input.on('keyup.lark', langx.proxy(this.keypress, this));

			// set default selection
			this.setDefaultSelection();

			// if dropdown is empty, disable it
			var items = this.$dropMenu.children('li');
			if( items.length === 0) {
				this.$button.addClass('disabled');
			}

			// filter on load in case the first thing they do is press navigational key to pop open the menu
			if (this.options.filterOnKeypress) {
				this.options.filter(this.$dropMenu.find('li'), this.$input.val(), this);
			}
		},

		_destroy: function () {
			this.$element.remove();
			// remove any external bindings
			// [none]

			// set input value attrbute in markup
			this.$element.find('input').each(function () {
				$(this).attr('value', $(this).val());
			});

			// empty elements to return to original markup
			// [none]

			return this.$element[0].outerHTML;
		},

		doSelect: function ($item) {

			if (typeof $item[0] !== 'undefined') {
				// remove selection from old item, may result in remove and
				// re-addition of class if item is the same
				this.$element.find('li.selected:first').removeClass('selected');

				// add selection to new item
				this.$selectedItem = $item;
				this.$selectedItem.addClass('selected');

				// update input
				this.$input.val(this.$selectedItem.text().trim());
			} else {
				// this is a custom input, not in the menu
				this.$selectedItem = null;
				this.$element.find('li.selected:first').removeClass('selected');
			}
		},

		clearSelection: function () {
			this.$selectedItem = null;
			this.$input.val('');
			this.$dropMenu.find('li').removeClass('selected');
		},

		menuShown: function () {
			if (this.options.autoResizeMenu) {
				this.resizeMenu();
			}
		},

		resizeMenu: function () {
			var width = this.$element.outerWidth();
			this.$dropMenu.outerWidth(width);
		},

		selectedItem: function () {
			var item = this.$selectedItem;
			var data = {};

			if (item) {
				var txt = this.$selectedItem.text().trim();
				data = langx.mixin({
					text: txt
				}, this.$selectedItem.data());
			} else {
				data = {
					text: this.$input.val().trim(),
					notFound: true
				};
			}

			return data;
		},

		selectByText: function (text) {
			var $item = $([]);
			this.$element.find('li').each(function () {
				if ((this.textContent || this.innerText || $(this).text() || '').trim().toLowerCase() === (text || '').trim().toLowerCase()) {
					$item = $(this);
					return false;
				}
			});

			this.doSelect($item);
		},

		selectByValue: function (value) {
			var selector = 'li[data-value="' + value + '"]';
			this.selectBySelector(selector);
		},

		selectByIndex: function (index) {
			// zero-based index
			var selector = 'li:eq(' + index + ')';
			this.selectBySelector(selector);
		},

		selectBySelector: function (selector) {
			var $item = this.$element.find(selector);
			this.doSelect($item);
		},

		setDefaultSelection: function () {
			var selector = 'li[data-selected=true]:first';
			var item = this.$element.find(selector);

			if (item.length > 0) {
				// select by data-attribute
				this.selectBySelector(selector);
				item.removeData('selected');
				item.removeAttr('data-selected');
			}
		},

		enable: function () {
			this.$element.removeClass('disabled');
			this.$input.removeAttr('disabled');
			this.$button.removeClass('disabled');
		},

		disable: function () {
			this.$element.addClass('disabled');
			this.$input.attr('disabled', true);
			this.$button.addClass('disabled');
		},

		itemclicked: function (e) {
			this.$selectedItem = $(e.target).parent();

			// set input text and trigger input change event marked as synthetic
			this.$input.val(this.$selectedItem.text().trim()).trigger('change', {
				synthetic: true
			});

			// pass object including text and any data-attributes
			// to onchange event
			var data = this.selectedItem();

			// trigger changed event
			this.$element.trigger('changed.lark', data);

			e.preventDefault();

			// return focus to control after selecting an option
			this.$element.find('.dropdown-toggle').focus();
		},

		keypress: function (e) {
			var ENTER = 13;
			//var TAB = 9;
			var ESC = 27;
			var LEFT = 37;
			var UP = 38;
			var RIGHT = 39;
			var DOWN = 40;

			var IS_NAVIGATIONAL = (
				e.which === UP ||
				e.which === DOWN ||
				e.which === LEFT ||
				e.which === RIGHT
			);

			if(this.options.showOptionsOnKeypress && !this.$inputGroupBtn.hasClass('open')){
				this.$button.dropdown('toggle');
				this.$input.focus();
			}

			if (e.which === ENTER) {
				e.preventDefault();

				var selected = this.$dropMenu.find('li.selected').text().trim();
				if(selected.length > 0){
					this.selectByText(selected);
				}else{
					this.selectByText(this.$input.val());
				}

				this.$inputGroupBtn.removeClass('open');
			} else if (e.which === ESC) {
				e.preventDefault();
				this.clearSelection();
				this.$inputGroupBtn.removeClass('open');
			} else if (this.options.showOptionsOnKeypress) {
				if (e.which === DOWN || e.which === UP) {
					e.preventDefault();
					var $selected = this.$dropMenu.find('li.selected');
					if ($selected.length > 0) {
						if (e.which === DOWN) {
							$selected = $selected.next(':not(.hidden)');
						} else {
							$selected = $selected.prev(':not(.hidden)');
						}
					}

					if ($selected.length === 0){
						if (e.which === DOWN) {
							$selected = this.$dropMenu.find('li:not(.hidden):first');
						} else {
							$selected = this.$dropMenu.find('li:not(.hidden):last');
						}
					}
					this.doSelect($selected);
				}
			}

			// Avoid filtering on navigation key presses
			if (this.options.filterOnKeypress && !IS_NAVIGATIONAL) {
				this.options.filter(this.$dropMenu.find('li'), this.$input.val(), this);
			}

			this.previousKeyPress = e.which;
		},

		inputchanged: function (e, extra) {
			var val = $(e.target).val();
			// skip processing for internally-generated synthetic event
			// to avoid double processing
			if (extra && extra.synthetic) {
				this.selectByText(val);
				return;
			}
			this.selectByText(val);

			// find match based on input
			// if no match, pass the input value
			var data = this.selectedItem();
			if (data.text.length === 0) {
				data = {
					text: val
				};
			}

			// trigger changed event
			this.$element.trigger('changed.lark', data);
		}

	});



	ComboBox.prototype.getValue = ComboBox.prototype.selectedItem;



	return swt.ComboBox = ComboBox;
});

define('skylark-widgets-swt/TextBox',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "./swt",
  "./Widget"
],function(langx,browser,eventer,noder,geom,$,swt,Widget){

  var SyncAttrs = [
    'rows', 'spellcheck', 'maxLength', 'size', 'readonly', 'min',
    'max', 'step', 'list', 'pattern', 'placeholder', 'required', 'multiple'
  ];

	var TextBox =  swt.TextBox = Widget.inherit({
		klassName: "TextBox",

    pluginName: "lark.textbox",

    /*
     * Parse options from attached dom element.
     * @override
     */
    _parse : function() {
      var  velm = this._velm;

      // get multiline option
      this.options.multiline = velm.is("textarea");
      
      // get current state of input
      var value = $chk.prop('checked');
      var disabled = $chk.prop('disabled');
      this.state.set("value",value);
      this.state.set(("disabled",disabled));

    },

    /*
     * Create a new  dom element for this widget
     * @override
     */
    _create : function() {
      var tagName = "input",attrs = {},
          options = this.options;

      langx.each([
        'rows', 'spellcheck', 'maxLength', 'size', 'readonly', 'min',
        'max', 'step', 'list', 'pattern', 'placeholder', 'required', 'multiple'
      ], function (name) {
        attrs[name] = options[name];
      });

      if (options.multiline) {
        tagName = "textarea"
      } 
      if (options.subtype) {
        attrs.type = options.subtype;
      }
      this._elm = this._dom.noder.createElement(tagName,attrs);
    },

    /*
     * Init this widget
     * @override
     */
    _init : function() {
    },

    /*
     * Sync dom element to widget state 
     * @override
     */
    _sync : function() {
      // handle internal events
      var self = this;
      this._velm.on('change', function(evt) {
        var value = self._velm.prop('value');
        self.state.set("value",value);
      });
    },

    _refresh : function(updates) {
        var self  = this;

        if (updates["value"] !== undefined) {
          if (self._velm.value() !== e.value) {
            self._velm.value(updates.value);
          }
        }
        if (updates["disabled"] !== undefined) {
          self._velm.disable(updates["disabled"]);
        }

        // update visual with attribute values from control
        this.overrided(changed);
    },

  });

	return TextBox;
});


 define('skylark-widgets-swt/ListGroup',[
  "skylark-langx/langx",
  "skylark-utils-dom/query",
  "./swt",
  "./Widget"
],function(langx,$,swt,Widget){

    var ListGroup = Widget.inherit({
        klassName : "ListGroup",

        pluginName : "lark.listgroup",

        options : {
        	multiSelect: false,
        	multiTier : false,
        	toggle : false,
        	classes : {
          	active : "active"
        	},
        	selectors : {
          	item : ".list-group-item"
        	},
        	selected : 0
        },

        state : {
          selected : Object
        },

        _init : function() {
            this.overrided();
            var self = this,
                velm = this._velm,
                itemSelector = this.options.selectors.item;

            this._$items = velm.$(itemSelector);

            velm.on('click', itemSelector, function () {
                var veItem = self._elmx(this);

                if (!veItem.hasClass('disabled')) {
                  var value = veItem.data("value");
                  if (value === undefined) {
                    value = self._$items.index(this);
                  }
                  self.state.set("selected",value);
                }

                //veItem.blur();
                return false;
            });
            this.state.set("selected",this.options.selected);

            var $this = velm,
                $toggle = this.options.toggle,
                obj = this;

            //if (this.isIE() <= 9) {
            //    $this.find("li.active").has("ul").children("ul").collapse("show");
            //    $this.find("li").not(".active").has("ul").children("ul").collapse("hide");
            //} else {
                $this.query("li.active").has("ul").children("ul").addClass("collapse in");
                $this.query("li").not(".active").has("ul").children("ul").addClass("collapse");
            //}

            //add the "doubleTapToGo" class to active items if needed
            if (obj.options.doubleTapToGo) {
                $this.query("li.active").has("ul").children("a").addClass("doubleTapToGo");
            }

            $this.query("li").has("ul").children("a").on("click" + "." + this.pluginName, function(e) {
                e.preventDefault();

                //Do we need to enable the double tap
                if (obj.options.doubleTapToGo) {

                    //if we hit a second time on the link and the href is valid, navigate to that url
                    if (obj.doubleTapToGo($(this)) && $(this).attr("href") !== "#" && $(this).attr("href") !== "") {
                        e.stopPropagation();
                        document.location = $(this).attr("href");
                        return;
                    }
                }

                $(this).parent("li").toggleClass("active").children("ul").collapse("toggle");

                if ($toggle) {
                    $(this).parent("li").siblings().removeClass("active").children("ul.in").collapse("hide");
                }

            });


        },

        _refresh : function(updates) {
          this.overrided(updates);
          var self  = this;

          function findItem(valueOrIdx) {
            var $item;
            if (langx.isNumber(valueOrIdx)) {
              $item = self._$items.eq(valueOrIdx);
            } else {
              $item = self._$items.filter('[data-value="' + valueOrIdx + '"]');
            }
            return $item;
          } 
                 
          function selectOneItem(valueOrIdx) {
            findItem(valueOrIdx).addClass(self.options.classes.active);
          }

          function unselectOneItem(valueOrIdx) {
            findItem(valueOrIdx).removeClass(self.options.classes.active);
          }

          if (updates["selected"]) {
            if (this.options.multiSelect) {
            } else {
              unselectOneItem(updates["selected"].oldValue);
              selectOneItem(updates["selected"].value);
            }

          }
        }

  });

  return ListGroup;

});




define('skylark-widgets-swt/Menu',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "./swt",
  "./Widget"
],function(langx,browser,eventer,noder,geom,$,swt,Widget){
	
	var popup = null;
	var right_to_left ;

	var Menu = swt.Menu = Widget.inherit({
        klassName: "Menu",

	    pluginName : "lark.menu",

        init : function(elm,options) {
        	if (!options) {
        		options = elm;
        		elm = null;
        	}
			var self = this,$el;

			this._options = langx.mixin({
					hide_onmouseleave	: 0,
					icons				: true

			},options);

			if (!elm) {
				$el = this.$el = $("<ul class='vakata-context'></ul>");
			} else {
				$el = this.$el = $(elm);
			}

			var to = false;
			$el.on("mouseenter", "li", function (e) {
					e.stopImmediatePropagation();

					if(noder.contains(this, e.relatedTarget)) {
						// премахнато заради delegate mouseleave по-долу
						// $(this).find(".vakata-context-hover").removeClass("vakata-context-hover");
						return;
					}

					if(to) { clearTimeout(to); }
					$el.find(".vakata-context-hover").removeClass("vakata-context-hover").end();

					$(this)
						.siblings().find("ul").hide().end().end()
						.parentsUntil(".vakata-context", "li").addBack().addClass("vakata-context-hover");
					self._show_submenu(this);
				})
				// тестово - дали не натоварва?
				.on("mouseleave", "li", function (e) {
					if(noder.contains(this, e.relatedTarget)) { return; }
					$(this).find(".vakata-context-hover").addBack().removeClass("vakata-context-hover");
				})
				.on("mouseleave", function (e) {
					$(this).find(".vakata-context-hover").removeClass("vakata-context-hover");
					if(self._options.hide_onmouseleave) {
						to = setTimeout(
							(function (t) {
								return function () { self.hide(); };
							}(this)), self._options.hide_onmouseleave);
					}
				})
				.on("click", "a", function (e) {
					e.preventDefault();
				//})
				//.on("mouseup", "a", function (e) {
					if(!$(this).blur().parent().hasClass("vakata-context-disabled") && self._execute($(this).attr("rel")) !== false) {
						self.hide();
					}
				})
				.on('keydown', 'a', function (e) {
						var o = null;
						switch(e.which) {
							case 13:
							case 32:
								e.type = "click";
								e.preventDefault();
								$(e.currentTarget).trigger(e);
								break;
							case 37:
								self.$el.find(".vakata-context-hover").last().closest("li").first().find("ul").hide().find(".vakata-context-hover").removeClass("vakata-context-hover").end().end().children('a').focus();
								e.stopImmediatePropagation();
								e.preventDefault();
								break;
							case 38:
								o = self.$el.find("ul:visible").addBack().last().children(".vakata-context-hover").removeClass("vakata-context-hover").prevAll("li:not(.vakata-context-separator)").first();
								if(!o.length) { o = self.$el.find("ul:visible").addBack().last().children("li:not(.vakata-context-separator)").last(); }
								o.addClass("vakata-context-hover").children('a').focus();
								e.stopImmediatePropagation();
								e.preventDefault();
								break;
							case 39:
								self.$el.find(".vakata-context-hover").last().children("ul").show().children("li:not(.vakata-context-separator)").removeClass("vakata-context-hover").first().addClass("vakata-context-hover").children('a').focus();
								e.stopImmediatePropagation();
								e.preventDefault();
								break;
							case 40:
								o = self.$el.find("ul:visible").addBack().last().children(".vakata-context-hover").removeClass("vakata-context-hover").nextAll("li:not(.vakata-context-separator)").first();
								if(!o.length) { o = self.$el.find("ul:visible").addBack().last().children("li:not(.vakata-context-separator)").first(); }
								o.addClass("vakata-context-hover").children('a').focus();
								e.stopImmediatePropagation();
								e.preventDefault();
								break;
							case 27:
								self.hide();
								e.preventDefault();
								break;
							default:
								//console.log(e.which);
								break;
						}
					})
				.on('keydown', function (e) {
					e.preventDefault();
					var a = self.$el.find('.vakata-contextmenu-shortcut-' + e.which).parent();
					if(a.parent().not('.vakata-context-disabled')) {
						a.click();
					}
				});

			this.render();
        },

        render : function() {
        	var items = this._options.items;
			if(this._parse(items)) {
				this.$el.html(this.html);
			}
			this.$el.width('');
        },

		_trigger : function (event_name) {
			$(document).trigger("context_" + event_name + ".sbswt", {
				"reference"	: this.reference,
				"element"	: this.$el,
				"position"	: {
					"x" : this.position_x,
					"y" : this.position_y
				}
			});
		},        

		_execute : function (i) {
			i = this.items[i];
			return i && (!i._disabled || (langx.isFunction(i._disabled) && !i._disabled({ "item" : i, "reference" : this.reference, "element" : this.$el }))) && i.action ? i.action.call(null, {
						"item"		: i,
						"reference"	: this.reference,
						"element"	: this.$el,
						"position"	: {
							"x" : this.position_x,
							"y" : this.position_y
						}
					}) : false;
		},
		_parse : function (o, is_callback) {
			var self = this,
				reference = self._options.reference;

			if(!o) { return false; }
			if(!is_callback) {
				self.html		= "";
				self.items	= [];
			}
			var str = "",
				sep = false,
				tmp;

			if(is_callback) { str += "<"+"ul>"; }
			langx.each(o, function (i, val) {
				if(!val) { return true; }
				self.items.push(val);
				if(!sep && val.separator_before) {
					str += "<"+"li class='vakata-context-separator'><"+"a href='#' " + (self._options.icons ? '' : 'style="margin-left:0px;"') + ">&#160;<"+"/a><"+"/li>";
				}
				sep = false;
				str += "<"+"li class='" + (val._class || "") + (val._disabled === true || (langx.isFunction(val._disabled) && val._disabled({ "item" : val, "reference" : reference, "element" : self.$el })) ? " vakata-contextmenu-disabled " : "") + "' "+(val.shortcut?" data-shortcut='"+val.shortcut+"' ":'')+">";
				str += "<"+"a href='#' rel='" + (self.items.length - 1) + "' " + (val.title ? "title='" + val.title + "'" : "") + ">";
				if(self._options.icons) {
					str += "<"+"i ";
					if(val.icon) {
						if(val.icon.indexOf("/") !== -1 || val.icon.indexOf(".") !== -1) { str += " style='background:url(\"" + val.icon + "\") center center no-repeat' "; }
						else { str += " class='" + val.icon + "' "; }
					}
					str += "><"+"/i><"+"span class='vakata-contextmenu-sep'>&#160;<"+"/span>";
				}
				str += (langx.isFunction(val.label) ? val.label({ "item" : i, "reference" : reference, "element" : self.$el }) : val.label) + (val.shortcut?' <span class="vakata-contextmenu-shortcut vakata-contextmenu-shortcut-'+val.shortcut+'">'+ (val.shortcut_label || '') +'</span>':'') + "<"+"/a>";
				if(val.submenu) {
					tmp = self._parse(val.submenu, true);
					if(tmp) { str += tmp; }
				}
				str += "<"+"/li>";
				if(val.separator_after) {
					str += "<"+"li class='vakata-context-separator'><"+"a href='#' " + (self._options.icons ? '' : 'style="margin-left:0px;"') + ">&#160;<"+"/a><"+"/li>";
					sep = true;
				}
			});
			str  = str.replace(/<li class\='vakata-context-separator'\><\/li\>$/,"");
			if(is_callback) { str += "</ul>"; }
			/**
			 * triggered on the document when the contextmenu is parsed (HTML is built)
			 * @event
			 * @plugin contextmenu
			 * @name context_parse.vakata
			 * @param {jQuery} reference the element that was right clicked
			 * @param {jQuery} element the DOM element of the menu itself
			 * @param {Object} position the x & y coordinates of the menu
			 */
			if(!is_callback) { self.html = str; self._trigger("parse"); }
			return str.length > 10 ? str : false;
		},
		_show_submenu : function (o) {
			o = $(o);
			if(!o.length || !o.children("ul").length) { return; }
			var e = o.children("ul"),
				xl = o.offset().left,
				x = xl + o.outerWidth(),
				y = o.offset().top,
				w = e.width(),
				h = e.height(),
				dw = $(window).width() + $(window).scrollLeft(),
				dh = $(window).height() + $(window).scrollTop();
			// може да се спести е една проверка - дали няма някой от класовете вече нагоре
			if(right_to_left) {
				o[x - (w + 10 + o.outerWidth()) < 0 ? "addClass" : "removeClass"]("vakata-context-left");
			}
			else {
				o[x + w > dw  && xl > dw - x ? "addClass" : "removeClass"]("vakata-context-right");
			}
			if(y + h + 10 > dh) {
				e.css("bottom","-1px");
			}

			//if does not fit - stick it to the side
			if (o.hasClass('vakata-context-right')) {
				if (xl < w) {
					e.css("margin-right", xl - w);
				}
			} else {
				if (dw - x < w) {
					e.css("margin-left", dw - x - w);
				}
			}

			e.show();
		},
		show : function (reference, position, data) {
			var o, e, x, y, w, h, dw, dh, cond = true;
			switch(cond) {
				case (!position && !reference):
					return false;
				case (!!position && !!reference):
					this.reference	= reference;
					this.position_x	= position.x;
					this.position_y	= position.y;
					break;
				case (!position && !!reference):
					this.reference	= reference;
					o = reference.offset();
					this.position_x	= o.left + reference.outerHeight();
					this.position_y	= o.top;
					break;
				case (!!position && !reference):
					this.position_x	= position.x;
					this.position_y	= position.y;
					break;
			}
			if(!!reference && !data && $(reference).data('vakata_contextmenu')) {
				data = $(reference).data('vakata_contextmenu');
			}

			if(this.items.length) {
				this.$el.appendTo(document.body);
				e = this.$el;
				x = this.position_x;
				y = this.position_y;
				w = e.width();
				h = e.height();
				dw = $(window).width() + $(window).scrollLeft();
				dh = $(window).height() + $(window).scrollTop();
				if(right_to_left) {
					x -= (e.outerWidth() - $(reference).outerWidth());
					if(x < $(window).scrollLeft() + 20) {
						x = $(window).scrollLeft() + 20;
					}
				}
				if(x + w + 20 > dw) {
					x = dw - (w + 20);
				}
				if(y + h + 20 > dh) {
					y = dh - (h + 20);
				}

				this.$el
					.css({ "left" : x, "top" : y })
					.show()
					.find('a').first().focus().parent().addClass("vakata-context-hover");
				this.is_visible = true;

				popup = this;

				/**
				 * triggered on the document when the contextmenu is shown
				 * @event
				 * @plugin contextmenu
				 * @name context_show.vakata
				 * @param {jQuery} reference the element that was right clicked
				 * @param {jQuery} element the DOM element of the menu itself
				 * @param {Object} position the x & y coordinates of the menu
				 */
				this._trigger("show");
			}
		},
		hide : function () {
			if(this.is_visible) {
				this.$el.hide().find("ul").hide().end().find(':focus').blur().end().detach();
				this.is_visible = false;
				popup = null;
				/**
				 * triggered on the document when the contextmenu is hidden
				 * @event
				 * @plugin contextmenu
				 * @name context_hide.vakata
				 * @param {jQuery} reference the element that was right clicked
				 * @param {jQuery} element the DOM element of the menu itself
				 * @param {Object} position the x & y coordinates of the menu
				 */
				this._trigger("hide");
			}
		}

    });	

	$(function () {
		right_to_left = $(document.body).css("direction") === "rtl";

		$(document)
			.on("mousedown.sbswt.popup", function (e) {
				if(popup && popup.$el[0] !== e.target  && !noder.contains(popup.$el[0], e.target)) {
					popup.hide();
				}
			})
			.on("context_show.sbswt.popup", function (e, data) {
				popup.$el.find("li:has(ul)").children("a").addClass("vakata-context-parent");
				if(right_to_left) {
					popup.$el.addClass("vakata-context-rtl").css("direction", "rtl");
				}
				// also apply a RTL class?
				popup.$el.find("ul").hide().end();
			});
	});

	Menu.popup = function (reference, position, data) {
		var m = new Menu({
			reference : reference,
			items : data
		});
		m.show(reference,position);
	};

	Menu.hide = function() {
		if (popup) {
			popup.hide();
		}
	}

	return Menu;

});

define('skylark-widgets-swt/Pagination',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "./swt",
  "./Widget"
],function(langx,browser,eventer,noder,geom,$,swt,Widget){

    'use strict';

    var Pagination = swt.Pagination = Widget.inherit({
        klassName : "Pagination",

        pluginName : "lark.pagination",

        options : {
            tagName : "ul",
            css : "",
            selectors : {
                firstNavi : "li[aria-label='first']",
                prevNavi : "li[aria-label='prev']",
                nextNavi : "li[aria-label='next']",
                lastNavi : "li[aria-label='last']",
                numericNavi : "li:not([aria-label])",
                numericTxt  : "a"
            },
            totalPages: 7,
            maxButtonsVisible: 5,
            currentPage: 1     
        },

        state : {
            totalPages : Number,
            currentPage : Number
        },

        _parse : function(elm,options) {

        },
        
        _create : function(self) {
        },

        _init : function() {
          this.$first = this._velm.$(this.options.selectors.firstNavi);
          this.$prev = this._velm.$(this.options.selectors.prevNavi);
          this.$last = this._velm.$(this.options.selectors.lastNavi);
          this.$next = this._velm.$(this.options.selectors.nextNavi);
          this.$numeric = this._velm.$(this.options.selectors.numericNavi);

          var self = this;

          function checkCanAction(elm) {
            var $elm = $(elm);
            if ($elm.is(".disabled,.active")) {
              return false;
            } else {
              return $elm;
            }
          }

          this.$first.click(function(){
            if (!checkCanAction(this)) {
              return;
            }
            self.currentPage(1);
          });

          this.$prev.click(function(){
            if (!checkCanAction(this)) {
              return;
            }
            self.currentPage(self.currentPage()-1);
          });

          this.$last.click(function(){
            if (!checkCanAction(this)) {
              return;
            }
            self.currentPage(self.totalPages());
          });

          this.$next.click(function(){
            if (!checkCanAction(this)) {
              return;
            }
            self.currentPage(self.currentPage()+1);
          });

          this.$numeric.click(function(){
            var ret = checkCanAction(this)
            if (!ret) {
              return;
            }
            var numeric = ret.find(self.options.selectors.numericTxt).text(),
                pageNo = parseInt(numeric);
            self.currentPage(pageNo);

          });

          this.state.set("currentPage",this.options.currentPage);
          this.state.set("totalPages",this.options.totalPages);

          this.overrided();
        },

        _refresh: function (updates) {
          this.overrided(updates);
          var self = this;

          function changePageNoBtns(currentPage,totalPages) {

            // Create the numeric buttons.
            // Variable of number control in the buttons.
            var totalPageNoBtns = Math.min(totalPages, self.options.maxButtonsVisible);
            var begin = 1;
            var end = begin + totalPageNoBtns - 1;

            /*
             * Align the values in the begin and end variables if the user has the
             * possibility that select a page that doens't appear in the paginador.
             * e.g currentPage = 1, and user go to the 20 page.
             */
            while ((currentPage < begin) || (currentPage > end)) {
              if (currentPage > end) {
                 begin += totalPageNoBtns;
                 end += totalPageNoBtns;

                 if (end > totalPages) {
                   begin = begin - (end - totalPages);
                   end = totalPages;
                 }
               } else {
                 begin -= totalPageNoBtns;
                 end -= totalPageNoBtns;

                 if (begin < 0) {
                   end = end + (begin + totalPageNoBtns);
                   begin = 1;
                 }
               }
            }
           /*
            * Verify if the user clicks in the last page show by paginator.
            * If yes, the paginator advances.
            */
            if ((currentPage === end) && (totalPages != 1)) {
              begin = currentPage - 1;
              end = begin + totalPageNoBtns - 1;

              if (end >= totalPages) {
                begin = begin - (end - (totalPages));
                end = totalPages;
              }
            }

            /*
             * Verify it the user clicks in the first page show by paginator.
             * If yes, the paginator retrogress
             */
             if ((begin === currentPage) && (totalPages != 1)) {
               if (currentPage != 1) {
                 end = currentPage + 1;
                 begin = end - (totalPageNoBtns - 1);
               }
             }

             var count = self.$numeric.size(),
                 visibles = end-begin + 1,
                 i = 0;

             self.$numeric.filter(".active").removeClass("active");
             while (i<visibles) {
               var pageNo = i + begin,
                   $btn = self.$numeric.eq(i);
               $btn.find(self.options.selectors.numericTxt).text(i+begin).show();
               if (pageNo == currentPage) {
                $btn.addClass("active");
               }
               i++;
             }
             while (i<count) {
               self.$numeric.eq(i).find(self.options.selectors.numericTxt).text(i+begin).hide();
               i++;
             }


          }

          function changeLabeldBtns(currentPage,totalPages) {
            if (currentPage < 1) {
              throw('Page can\'t be less than 1');
            } else if (currentPage > totalPages) {
              throw('Page is bigger than total pages');
            }

            if (totalPages < 1) {
              throw('Total Pages can\'t be less than 1');
            }

            if (currentPage == 1 ) {
              self.$first.addClass("disabled");
              self.$prev.addClass("disabled");
            } else {
              self.$first.removeClass("disabled");
              self.$prev.removeClass("disabled");
            }

            if (currentPage == totalPages ) {
              self.$last.addClass("disabled");
              self.$next.addClass("disabled");
            } else {
              self.$last.removeClass("disabled");
              self.$next.removeClass("disabled");
            }
          }

          if (updates.currentPage || updates.totalPages) {
            var currentPage = self.currentPage(),
                totalPages = self.totalPages();

            changePageNoBtns(currentPage,totalPages);
            changeLabeldBtns(currentPage,totalPages);
          }

        }

    });

    return Pagination;
});
define('skylark-widgets-swt/Progress',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "./swt",
  "./Widget"
],function(langx,browser,eventer,noder,geom,$,swt,Widget){

    'use strict';

     var Progress = swt.Progress = Widget.inherit({
     	klassName : "Progress",

     	pluginName : "lark.progress",

     	options : {
     		selectors : {
     			bar : "progress-bar"
     		},
     		min : 0,
     		max : 100
     	},

     	state : {
     		value : Number
     	},

		_init : function() {
			this._vbar = this._velm.find(this.options.selectors.bar);
			this.value(this.options.min);
		},

		_refresh : function() {
	        this.overrided(changed);
	        var self  = this;

	        if (updates["value"] !== undefined) {
	        	var value = updates["value"],
	        		min = this.options.min,
	        		max = this.options.max;

				this._vbar.css("width",(value-min)/(max-min)*100+"%");
	        }
		},

		start : function(max){
			this.value(this.options.min);
			this._velm.slideDown();
		},

		increase : function(tick){
			var value = this.value();
			this.value(value += tick*1.0);
		},

		finish : function(){
			this.value(this.options.min);
			this._velm.slideUp();
		}     	
     });

	return Progress;
	
 });
define('skylark-widgets-swt/Radio',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "./swt",
  "./_Toggler"
],function(langx,browser,eventer,noder,geom,$,swt,_Toggler){

  var Radio = swt.Radio = _Toggler.inherit({
    klassName: "Radio",

    pluginName : "lark.radio",

    _parse : function() {
      var $radio = this.$radio;

      // get current state of input
      var checked = $radio.prop('checked');
      var disabled = $radio.prop('disabled');

      this.state.set("checked",checked);
      this.state.set(("disabled",disabled));

    },

    _init : function() {
      //this.options = langx.mixin({}, $.fn.checkbox.defaults, options);
      var element = this.domNode;
      var $element = $(element);

      if (element.tagName.toLowerCase() !== 'label') {
        logError('Radio must be initialized on the `label` that wraps the `input` element. See https://github.com/ExactTarget/fuelux/blob/master/reference/markup/checkbox.html for example of proper markup. Call `.checkbox()` on the `<label>` not the `<input>`');
        return;
      }

      // cache elements
      this.$label = $element;
      this.$radio = this.$label.find('input[type="checkbox"]');
      this.$container = $element.parent('.checkbox'); // the container div

      if (!this.options.ignoreVisibilityCheck && this.$radio.css('visibility').match(/hidden|collapse/)) {
        logError('For accessibility reasons, in order for tab and space to function on checkbox, checkbox `<input />`\'s `visibility` must not be set to `hidden` or `collapse`. See https://github.com/ExactTarget/fuelux/pull/1996 for more details.');
      }

      // determine if a toggle container is specified
      var containerSelector = this.$radio.attr('data-toggle');
      this.$toggleContainer = $(containerSelector);


      // set default state
      this.setInitialState();
    },

    _sync : function() {
      // handle internal events
      var self = this;
      this.$radio.on('change', function(evt) {
        //var $radio = $(evt.target);
        var checked = self.$radio.prop('checked');
        self.state.set("checked",checked);
      });
    },

    _refresh : function(updates) {

        function setCheckedState (checked) {
          var $radio = self.$radio;
          var $lbl = self.$label;
          var $containerToggle = self.$toggleContainer;

          if (checked) {
            // reset all items in group
            this.resetGroup();

            $radio.prop('checked', true);
            $lbl.addClass('checked');
            $containerToggle.removeClass('hide hidden');
          } else {
            $radio.prop('checked', false);
            $lbl.removeClass('checked');
            $containerToggle.addClass('hidden');
          }
        }

        function setDisabledState (disabled) {
          var $radio = self.$radio;
          var $lbl = self.$label;

          if (disabled) {
            $radio.prop('disabled', true);
            $lbl.addClass('disabled');
          } else {
            $radio.prop('disabled', false);
            $lbl.removeClass('disabled');
          }
        }

        // update visual with attribute values from control
        this.overrided(changed);
        var self  = this;

        if (updates["checked"]) {
          setCheckedState(updates["checked"].value);
        }
        if (updates["disabled"]) {
          setDisabledState(updates["disabled"].value);
        }
    },

    resetGroup: function resetGroup () {
      var $radios = $('input[name="' + this.groupName + '"]');
      $radios.each(function resetRadio (index, item) {
        var $radio = $(item);
        var $lbl = $radio.parent();
        var containerSelector = $radio.attr('data-toggle');
        var $containerToggle = $(containerSelector);


        $lbl.removeClass('checked');
        $containerToggle.addClass('hidden');
      });
    }
  });

  return Radio;
});


define('skylark-widgets-swt/SearchBox',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "./swt",
  "./Widget",
  "skylark-bootstrap3/dropdown"
],function(langx,browser,eventer,noder,geom,$,swt,Widget){


	// SEARCH CONSTRUCTOR AND PROTOTYPE

	var SearchBox = Widget.inherit({
		klassName: "SearchBox",

		pluginName: "lark.searchbox",

		options : {
			clearOnEmpty: false,
			searchOnKeyPress: false,
			allowCancel: false
		},
	
		_init : function() {
			this.$element = $(this._elm);
			this.$repeater = this.$element.closest('.repeater');

			if (this.$element.attr('data-searchOnKeyPress') === 'true'){
				this.options.searchOnKeyPress = true;
			}

			this.$button = this.$element.find('button');
			this.$input = this.$element.find('input');
			this.$icon = this.$element.find('.glyphicon, .fuelux-icon');

			this.$button.on('click.fu.search', langx.proxy(this.buttonclicked, this));
			this.$input.on('keyup.fu.search', langx.proxy(this.keypress, this));

			if (this.$repeater.length > 0) {
				this.$repeater.on('rendered.fu.repeater', langx.proxy(this.clearPending, this));
			}

			this.activeSearch = '';
		},
		destroy: function () {
			this.$element.remove();
			// any external bindings
			// [none]
			// set input value attrbute
			this.$element.find('input').each(function () {
				$(this).attr('value', $(this).val());
			});
			// empty elements to return to original markup
			// [none]
			// returns string of markup
			return this.$element[0].outerHTML;
		},

		search: function (searchText) {
			if (this.$icon.hasClass('glyphicon')) {
				this.$icon.removeClass('glyphicon-search').addClass('glyphicon-remove');
			}
			if (this.$icon.hasClass('fuelux-icon')) {
				this.$icon.removeClass('fuelux-icon-search').addClass('fuelux-icon-remove');
			}

			this.activeSearch = searchText;
			this.$element.addClass('searched pending');
			this.$element.trigger('searched.fu.search', searchText);
		},

		clear: function () {
			if (this.$icon.hasClass('glyphicon')) {
				this.$icon.removeClass('glyphicon-remove').addClass('glyphicon-search');
			}
			if (this.$icon.hasClass('fuelux-icon')) {
				this.$icon.removeClass('fuelux-icon-remove').addClass('fuelux-icon-search');
			}

			if (this.$element.hasClass('pending')) {
				this.$element.trigger('canceled.fu.search');
			}

			this.activeSearch = '';
			this.$input.val('');
			this.$element.trigger('cleared.fu.search');
			this.$element.removeClass('searched pending');
		},

		clearPending: function () {
			this.$element.removeClass('pending');
		},

		action: function () {
			var val = this.$input.val();

			if (val && val.length > 0) {
				this.search(val);
			} else {
				this.clear();
			}
		},

		buttonclicked: function (e) {
			e.preventDefault();
			if ($(e.currentTarget).is('.disabled, :disabled')) return;

			if (this.$element.hasClass('pending') || this.$element.hasClass('searched')) {
				this.clear();
			} else {
				this.action();
			}
		},

		keypress: function (e) {
			var ENTER_KEY_CODE = 13;
			var TAB_KEY_CODE = 9;
			var ESC_KEY_CODE = 27;

			if (e.which === ENTER_KEY_CODE) {
				e.preventDefault();
				this.action();
			} else if (e.which === TAB_KEY_CODE) {
				e.preventDefault();
			} else if (e.which === ESC_KEY_CODE) {
				e.preventDefault();
				this.clear();
			} else if (this.options.searchOnKeyPress) {
				// search on other keypress
				this.action();
			}
		},

		disable: function () {
			this.$element.addClass('disabled');
			this.$input.attr('disabled', 'disabled');

			if (!this.options.allowCancel) {
				this.$button.addClass('disabled');
			}
		},

		enable: function () {
			this.$element.removeClass('disabled');
			this.$input.removeAttr('disabled');
			this.$button.removeClass('disabled');
		}
	});

	return 	swt.SearchBox = SearchBox;
});

define('skylark-widgets-swt/SelectList',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "./swt",
  "./Widget",
  "skylark-bootstrap3/dropdown"
],function(langx,browser,eventer,noder,geom,$,swt,Widget){


	// SELECT CONSTRUCTOR AND PROTOTYPE

	var SelectList = Widget.inherit({
		klassName: "SelectList",

		pluginName : "lark.selectlist",
	
		options : {
			emptyLabelHTML: '<li data-value=""><a href="#">No items</a></li>'

		},

		_init : function() {
			this.$element = $(this._elm);
			//this.options = langx.mixin({}, $.fn.selectlist.defaults, options);


			this.$button = this.$element.find('.btn.dropdown-toggle');
			this.$hiddenField = this.$element.find('.hidden-field');
			this.$label = this.$element.find('.selected-label');
			this.$dropdownMenu = this.$element.find('.dropdown-menu');

			this.$button.dropdown();

			this.$element.on('click.fu.selectlist', '.dropdown-menu a', langx.proxy(this.itemClicked, this));
			this.setDefaultSelection();

			if (this.options.resize === 'auto' || this.$element.attr('data-resize') === 'auto') {
				this.resize();
			}

			// if selectlist is empty or is one item, disable it
			var items = this.$dropdownMenu.children('li');
			if( items.length === 0) {
				this.disable();
				this.doSelect( $(this.options.emptyLabelHTML));
			}

			// support jumping focus to first letter in dropdown when key is pressed
			this.$element.on('shown.bs.dropdown', function () {
					var $this = $(this);
					// attach key listener when dropdown is shown
					$(document).on('keypress.fu.selectlist', function(e){

						// get the key that was pressed
						var key = String.fromCharCode(e.which);
						// look the items to find the first item with the first character match and set focus
						$this.find("li").each(function(idx,item){
							if ($(item).text().charAt(0).toLowerCase() === key) {
								$(item).children('a').focus();
								return false;
							}
						});

				});
			});

			// unbind key event when dropdown is hidden
			this.$element.on('hide.bs.dropdown', function () {
					$(document).off('keypress.fu.selectlist');
			});
		},

		destroy: function () {
			this.$element.remove();
			// any external bindings
			// [none]
			// empty elements to return to original markup
			// [none]
			// returns string of markup
			return this.$element[0].outerHTML;
		},

		doSelect: function ($item) {
			var $selectedItem;
			this.$selectedItem = $selectedItem = $item;

			this.$hiddenField.val(this.$selectedItem.attr('data-value'));
			this.$label.html($(this.$selectedItem.children()[0]).html());

			// clear and set selected item to allow declarative init state
			// unlike other controls, selectlist's value is stored internal, not in an input
			this.$element.find('li').each(function () {
				if ($selectedItem.is($(this))) {
					$(this).attr('data-selected', true);
				} else {
					$(this).removeData('selected').removeAttr('data-selected');
				}
			});
		},

		itemClicked: function (e) {
			this.$element.trigger('clicked.fu.selectlist', this.$selectedItem);

			e.preventDefault();
			// ignore if a disabled item is clicked
			if ($(e.currentTarget).parent('li').is('.disabled, :disabled')) { return; }

			// is clicked element different from currently selected element?
			if (!($(e.target).parent().is(this.$selectedItem))) {
				this.itemChanged(e);
			}

			// return focus to control after selecting an option
			this.$element.find('.dropdown-toggle').focus();
		},

		itemChanged: function (e) {
			//selectedItem needs to be <li> since the data is stored there, not in <a>
			this.doSelect($(e.target).closest('li'));

			// pass object including text and any data-attributes
			// to onchange event
			var data = this.selectedItem();
			// trigger changed event
			this.$element.trigger('changed.fu.selectlist', data);
		},

		resize: function () {
			var width = 0;
			var newWidth = 0;
			var sizer = $('<div/>').addClass('selectlist-sizer');


			if (Boolean($(document).find('html').hasClass('fuelux'))) {
				// default behavior for fuel ux setup. means fuelux was a class on the html tag
				$(document.body).append(sizer);
			} else {
				// fuelux is not a class on the html tag. So we'll look for the first one we find so the correct styles get applied to the sizer
				$('.fuelux:first').append(sizer);
			}

			sizer.append(this.$element.clone());

			this.$element.find('a').each(function () {
				sizer.find('.selected-label').text($(this).text());
				newWidth = sizer.find('.selectlist').outerWidth();
				newWidth = newWidth + sizer.find('.sr-only').outerWidth();
				if (newWidth > width) {
					width = newWidth;
				}
			});

			if (width <= 1) {
				return;
			}

			this.$button.css('width', width);
			this.$dropdownMenu.css('width', width);

			sizer.remove();
		},

		selectedItem: function () {
			var txt = this.$selectedItem.text();
			return langx.mixin({
				text: txt
			}, this.$selectedItem.data());
		},

		selectByText: function (text) {
			var $item = $([]);
			this.$element.find('li').each(function () {
				if ((this.textContent || this.innerText || $(this).text() || '').toLowerCase() === (text || '').toLowerCase()) {
					$item = $(this);
					return false;
				}
			});
			this.doSelect($item);
		},

		selectByValue: function (value) {
			var selector = 'li[data-value="' + value + '"]';
			this.selectBySelector(selector);
		},

		selectByIndex: function (index) {
			// zero-based index
			var selector = 'li:eq(' + index + ')';
			this.selectBySelector(selector);
		},

		selectBySelector: function (selector) {
			var $item = this.$element.find(selector);
			this.doSelect($item);
		},

		setDefaultSelection: function () {
			var $item = this.$element.find('li[data-selected=true]').eq(0);

			if ($item.length === 0) {
				$item = this.$element.find('li').has('a').eq(0);
			}

			this.doSelect($item);
		},

		enable: function () {
			this.$element.removeClass('disabled');
			this.$button.removeClass('disabled');
		},

		disable: function () {
			this.$element.addClass('disabled');
			this.$button.addClass('disabled');
		}

	});	


	SelectList.prototype.getValue = SelectList.prototype.selectedItem;



	return swt.SelectList = SelectList;
});

define('skylark-widgets-swt/Tabular',[
  "skylark-langx/langx",
  "skylark-utils-dom/browser",
  "skylark-utils-dom/eventer",
  "skylark-utils-dom/noder",
  "skylark-utils-dom/geom",
  "skylark-utils-dom/query",
  "./swt",
  "./Widget"
],function(langx,browser,eventer,noder,geom,$,swt,Widget){


    var Tabular = Widget.inherit({
        klassName : "Tabular",

        pluginName : "lark.tabular",

        options : {
            buttonClasses : { 
                append: null, 
                removeLast: null, 
                insert: null, 
                remove: null, 
                moveUp: null, 
                moveDown: null, 
                rowDrag: null 
            },
            sectionClasses : { 
                caption: null, 
                header: null, 
                body: null, 
                subPanel: null, 
                footer: null 
            },
            hideButtons : { 
                append: false, 
                removeLast: false, 
                insert: false, 
                remove: false, 
                moveUp: false, 
                moveDown: false 
            }

        },

        _showEmptyMessage : function (settings, skipWidthCalculation) {
            var tbWrap = this._tbWrap;

            var $emptyCell = $('<td></td>').text(settings._i18n.rowEmpty).attr('colspan', settings._finalColSpan);
            $('table.body tbody', tbWrap).append($('<tr></tr>').addClass('empty').append($emptyCell));
            if (!skipWidthCalculation && settings.maxBodyHeight > 0) {
                // Check scrolling enabled
                if (settings.autoColumnWidth) {
                    this._calculateColumnWidth();
                } else {
                    // Set the width of empty message cell to the thead width
                    $emptyCell.width($('table.head', tbWrap).width() - 4);
                }
            }
        },  

        _calculateColumnWidth : function () {
            var tbWrap = this._tbWrap;

            var $tbWhole = $('table.body', tbWrap);
            var $scroller = $('div.scroller', tbWrap);
            var settings = $tbWhole.data('appendGrid');
            var tbHeadRow = $('table.head tr.columnHead', tbWrap)[0];
            var tbColGp = $('table.body colgroup', tbWrap)[0];
            // Check any rows within the grid
            if (settings._rowOrder.length > 0) {
                // Reset the table/column width
                $('td', tbHeadRow).width('auto');
                $('col', tbColGp).width('auto');
                $tbWhole.width('auto');
                $scroller.width('auto');
                // Check the total number of columns
                var tbBodyRow = $('tbody tr', $tbWhole)[0];
                var marginThreshold = -2;
                if ($.fn.modal) {
                    // If bootstrap is loaded, cell margin was reset
                    marginThreshold = 1;
                }
                var colLimit = Math.min(tbHeadRow.childNodes.length, tbBodyRow.childNodes.length);
                for (var z = 0; z < colLimit; z++) {
                    var headCellWidth = tbHeadRow.childNodes[z].clientWidth + 1;
                    var bodyCellWidth = tbBodyRow.childNodes[z].clientWidth + marginThreshold;
                    if (bodyCellWidth > headCellWidth) {
                        tbHeadRow.childNodes[z].style.width = bodyCellWidth + 'px';
                    } else {
                        tbColGp.childNodes[z].style.width = headCellWidth + 'px';
                    }
                }
            } else {
                $('table.body,table.foot', tbWrap).width($('table.head').width());
            }
            // Set the width of footer row
            $('table.foot', tbWrap).width($tbWhole.width());
            // Check the scroll panel width
            $scroller.width($tbWhole.width() + $scroller[0].offsetWidth - $scroller[0].clientWidth + 1);
        },


        _createGridButton : function (param, uiIcon) {
            // Generate the standard grid action button based on its parameter.
            var genButton = null;
            if (param) {
                if (langx.isFunction(param)) {
                    // Generate button if it is a function.
                    genButton = $(param());
                } else if (param.nodeType) {
                    // Clone the button if it is a DOM element.
                    genButton = $(param).clone();
                } else if (param.icon || param.label) {
                    // Generate jQuery UI Button if it is a plain object with `icon` or `label` property.
                    genButton = $('<button/>').attr({ type: 'button' });
                    genButton.plugin("lark.button",param);
                }
            }
            if (!genButton) {
                // Use default setting (jQuery UI Button) if button is not created.
                genButton = $('<button/>').attr({ type: 'button' });
                genButton.plugin("lark.button",{ icon: uiIcon, showLabel: false });
            }
            return genButton;
        },

        _sortSequence : function (startIndex) {
            var tbWhole = this._elm;
            var settings = $(tbWhole).data('appendGrid');
            if (!settings.hideRowNumColumn) {
                for (var z = startIndex; z < settings._rowOrder.length; z++) {
                    $('#' + settings.idPrefix + '_Row_' + settings._rowOrder[z] + ' td.first', tbWhole).text(z + 1);
                }
            }
        },

        _emptyGrid : function () {
            var tbWhole = this._elm;

            // Load settings
            var settings = $(tbWhole).data('appendGrid');
            // Remove rows
            $('tbody', tbWhole).empty();
            settings._rowOrder.length = 0;
            settings._uniqueIndex = 0;
            // Save setting
            this._saveSetting(settings);
            // Add empty row
            this._showEmptyMessage(settings);
        },        

        _gridRowDragged : function (isMoveUp, uniqueIndex, tbRowIndex) {
            var tbWhole = this._elm;

            // Get setting
            var settings = $(tbWhole).data('appendGrid');
            // Find the start sorting index
            var startIndex = -1;
            for (var z = 0; z < settings._rowOrder.length; z++) {
                if (settings._rowOrder[z] == uniqueIndex) {
                    if (isMoveUp) {
                        startIndex = tbRowIndex;
                        settings._rowOrder.splice(z, 1);
                        settings._rowOrder.splice(tbRowIndex, 0, uniqueIndex);
                    } else {
                        startIndex = z;
                        settings._rowOrder.splice(tbRowIndex + 1, 0, uniqueIndex);
                        settings._rowOrder.splice(z, 1);
                    }
                    break;
                }
            }
            // Do re-order
            this._sortSequence( startIndex);
            // Save setting
            this._saveSetting(settings);

            // Trigger event
            if (langx.isFunction(settings.afterRowDragged)) {
                settings.afterRowDragged(tbWhole, tbRowIndex, uniqueIndex);
            }
        },

       _saveSetting : function (settings) {
            var tbWhole = this._elm;

            $(tbWhole).data('appendGrid', settings);
            $('#' + settings.idPrefix + '_rowOrder', tbWhole).val(settings._rowOrder.join());
        },


        _checkGridAndGetSettings : function (noMsg) {
            // Check the jQuery grid object is initialized and return its settings

            var settings = null,
                $grid = $(this._elm);

            if ($grid.length == 1) {
                settings = $grid.data('appendGrid');
                if (!settings && !noMsg) {
                    alert(_systemMessages.notInit);
                }
            } else if (!noMsg) {
                alert(_systemMessages.getValueMultiGrid);
            }
            return settings;
        },

        _insertRow : function (numOfRowOrRowArray, rowIndex, callerUniqueIndex) {
            // Define variables
            var self = this,
                tbWhole = this._elm;
            var settings = $(tbWhole).data('appendGrid');
            var addedRows = [], parentIndex = null, uniqueIndex, ctrl, hidden = [];
            var tbHead = tbWhole.getElementsByTagName('thead')[0];
            var tbBody = tbWhole.getElementsByTagName('tbody')[0];
            var tbRow, tbSubRow = null, tbCell, reachMaxRow = false, calColWidth = false;
            var oldHeight = 0, oldScroll = 0;
            if (settings.maxBodyHeight > 0) {
                tbHead = $('#' + settings._wrapperId + ' table thead')[0];
            }
            // Check number of row to be inserted
            var numOfRow = numOfRowOrRowArray, loadData = false;
            if (langx.isArray(numOfRowOrRowArray)) {
                numOfRow = numOfRowOrRowArray.length;
                loadData = true;
            }
            // Check parent row
            if (langx.isNumeric(callerUniqueIndex)) {
                for (var z = 0; z < settings._rowOrder.length; z++) {
                    if (settings._rowOrder[z] == callerUniqueIndex) {
                        rowIndex = z;
                        if (z != 0) parentIndex = z - 1;
                        break;
                    }
                }
            }
            else if (langx.isNumeric(rowIndex)) {
                if (rowIndex >= settings._rowOrder.length) {
                    rowIndex = null;
                } else {
                    parentIndex = rowIndex - 1;
                }
            }
            else if (settings._rowOrder.length != 0) {
                rowIndex = null;
                parentIndex = settings._rowOrder.length - 1;
            }
            // Store old grid height
            if (settings.maintainScroll && !langx.isNumeric(rowIndex)) {
                oldHeight = $(tbWhole).height();
                oldScroll = $(tbWhole).scrollParent().scrollTop();
            }
            // Remove empty row
            if (settings._rowOrder.length == 0) {
                $('tr.empty', tbWhole).remove();
                calColWidth = true;
            }
            // Add total number of row
            for (var z = 0; z < numOfRow; z++) {
                // Check maximum number of rows
                if (0 < settings.maxRowsAllowed && settings._rowOrder.length >= settings.maxRowsAllowed) {
                    reachMaxRow = true;
                    break;
                }
                // Update variables
                settings._uniqueIndex++;
                uniqueIndex = settings._uniqueIndex;
                hidden.length = 0;
                // Check row insert index
                if (langx.isNumeric(rowIndex)) {
                    settings._rowOrder.splice(rowIndex, 0, uniqueIndex);
                    if (settings.useSubPanel) {
                        tbBody.insertBefore(tbSubRow = document.createElement('tr'), tbBody.childNodes[rowIndex * 2]);
                        tbBody.insertBefore(tbRow = document.createElement('tr'), tbBody.childNodes[rowIndex * 2]);
                    } else {
                        tbBody.insertBefore(tbRow = document.createElement('tr'), tbBody.childNodes[rowIndex]);
                    }
                    addedRows.push(rowIndex);
                }
                else {
                    settings._rowOrder.push(uniqueIndex);
                    tbBody.appendChild(tbRow = document.createElement('tr'));
                    if (settings.useSubPanel) {
                        tbBody.appendChild(tbSubRow = document.createElement('tr'));
                    }
                    addedRows.push(settings._rowOrder.length - 1);
                }
                tbRow.id = settings.idPrefix + '_Row_' + uniqueIndex;
                if (settings._sectionClasses.body) {
                    tbRow.className = settings._sectionClasses.body;
                }
                $(tbRow).data('appendGrid', uniqueIndex);
                // Config on the sub panel row
                if (tbSubRow != null) {
                    tbSubRow.id = settings.idPrefix + '_SubRow_' + uniqueIndex;
                    $(tbSubRow).data('appendGrid', uniqueIndex);
                    if (settings._sectionClasses.subPanel) {
                        tbSubRow.className = settings._sectionClasses.subPanel;
                    }
                }
                // Add row number
                if (!settings.hideRowNumColumn) {
                    tbRow.appendChild(tbCell = document.createElement('td'));
                    $(tbCell).addClass('ui-widget-content first').text(settings._rowOrder.length);
                    if (settings.useSubPanel) tbCell.rowSpan = 2;
                }
                // Process on each columns
                for (var y = 0; y < settings.columns.length; y++) {
                    // Skip hidden
                    if (settings.columns[y].type == 'hidden') {
                        hidden.push(y);
                        continue;
                    }
                    // Check column invisble
                    var className = 'ui-widget-content';
                    if (settings.columns[y].invisible) className += ' invisible';
                    // Insert cell
                    tbRow.appendChild(tbCell = document.createElement('td'));
                    tbCell.id = settings.idPrefix + '_' + settings.columns[y].name + '_td_' + uniqueIndex;
                    tbCell.className = className;
                    if (settings.columns[y].cellCss != null) $(tbCell).css(settings.columns[y].cellCss);
                    // Prepare control id and name
                    var ctrlId = settings.idPrefix + '_' + settings.columns[y].name + '_' + uniqueIndex, ctrlName;
                    if (langx.isFunction(settings.nameFormatter)) {
                        ctrlName = settings.nameFormatter(settings.idPrefix, settings.columns[y].name, uniqueIndex);
                    } else {
                        ctrlName = ctrlId;
                    }
                    // Check control type
                    ctrl = null;
                    if (settings.columns[y].type == 'custom') {
                        if (langx.isFunction(settings.columns[y].customBuilder)) {
                            ctrl = settings.columns[y].customBuilder(tbCell, settings.idPrefix, settings.columns[y].name, uniqueIndex);
                        }
                    } else if (settings.columns[y].type == 'select' || settings.columns[y].type == 'ui-selectmenu') {
                        ctrl = document.createElement('select');
                        ctrl.id = ctrlId;
                        ctrl.name = ctrlName;
                        // Build option list
                        if (langx.isArray(settings.columns[y].ctrlOptions)) {
                            // For array type option list
                            if (settings.columns[y].ctrlOptions.length > 0) {
                                if (langx.isPlainObject(settings.columns[y].ctrlOptions[0])) {
                                    // Check to generate optGroup or not
                                    var lastGroupName = null, lastGroupElem = null;
                                    for (var x = 0; x < settings.columns[y].ctrlOptions.length; x++) {
                                        if (!isEmpty(settings.columns[y].ctrlOptions[x].group)) {
                                            if (lastGroupName != settings.columns[y].ctrlOptions[x].group) {
                                                lastGroupName = settings.columns[y].ctrlOptions[x].group;
                                                lastGroupElem = document.createElement('optgroup');
                                                lastGroupElem.label = lastGroupName;
                                                ctrl.appendChild(lastGroupElem);
                                            }
                                        } else {
                                            lastGroupElem = null;
                                        }
                                        var option = $('<option/>').val(settings.columns[y].ctrlOptions[x].value).text(settings.columns[y].ctrlOptions[x].label);
                                        if (!isEmpty(settings.columns[y].ctrlOptions[x].title)) {
                                            option.attr('title', settings.columns[y].ctrlOptions[x].title);
                                        }
                                        if (null == lastGroupElem) {
                                            option.appendTo(ctrl);
                                        }
                                        else {
                                            option.appendTo(lastGroupElem);
                                        }
                                        // ctrl.options[ctrl.options.length] = new Option(settings.columns[y].ctrlOptions[x].label, settings.columns[y].ctrlOptions[x].value);
                                    }
                                }
                                else {
                                    for (var x = 0; x < settings.columns[y].ctrlOptions.length; x++) {
                                        ctrl.options[ctrl.options.length] = new Option(settings.columns[y].ctrlOptions[x], settings.columns[y].ctrlOptions[x]);
                                    }
                                }
                            }
                        } else if (langx.isPlainObject(settings.columns[y].ctrlOptions)) {
                            // For plain object type option list
                            for (var x in settings.columns[y].ctrlOptions) {
                                ctrl.options[ctrl.options.length] = new Option(settings.columns[y].ctrlOptions[x], x);
                            }
                        } else if (typeof (settings.columns[y].ctrlOptions) == 'string') {
                            // For string type option list
                            var arrayOpt = settings.columns[y].ctrlOptions.split(';');
                            for (var x = 0; x < arrayOpt.length; x++) {
                                var eqIndex = arrayOpt[x].indexOf(':');
                                if (-1 == eqIndex) {
                                    ctrl.options[ctrl.options.length] = new Option(arrayOpt[x], arrayOpt[x]);
                                } else {
                                    ctrl.options[ctrl.options.length] = new Option(arrayOpt[x].substring(eqIndex + 1, arrayOpt[x].length), arrayOpt[x].substring(0, eqIndex));
                                }
                            }
                        } else if (langx.isFunction(settings.columns[y].ctrlOptions)) {
                            settings.columns[y].ctrlOptions(ctrl);
                        }
                        tbCell.appendChild(ctrl);
                        // Handle UI widget
                        if (settings.columns[y].type == 'ui-selectmenu') {
                            $(ctrl).selectmenu(settings.columns[y].uiOption);
                        }
                    }
                    else if (settings.columns[y].type == 'checkbox') {
                        ctrl = document.createElement('input');
                        ctrl.type = 'checkbox';
                        ctrl.id = ctrlId;
                        ctrl.name = ctrlName;
                        ctrl.value = 1;
                        tbCell.appendChild(ctrl);
                        tbCell.style.textAlign = 'center';
                    }
                    else if (settings.columns[y].type == 'textarea') {
                        ctrl = document.createElement('textarea');
                        ctrl.id = ctrlId;
                        ctrl.name = ctrlName;
                        tbCell.appendChild(ctrl);
                    }
                    else if (-1 != settings.columns[y].type.search(/^(color|date|datetime|datetime\-local|email|month|number|range|search|tel|time|url|week)$/)) {
                        ctrl = document.createElement('input');
                        try {
                            ctrl.type = settings.columns[y].type;
                        }
                        catch (err) { /* Not supported type */ }
                        ctrl.id = ctrlId;
                        ctrl.name = ctrlName;
                        tbCell.appendChild(ctrl);
                    }
                    else {
                        // Generate text input
                        ctrl = document.createElement('input');
                        ctrl.type = 'text';
                        ctrl.id = ctrlId;
                        ctrl.name = ctrlName;
                        tbCell.appendChild(ctrl);
                        // Handle UI widget
                        if (settings.columns[y].type == 'ui-datepicker') {
                            $(ctrl).datepicker(settings.columns[y].uiOption);
                        } else if (settings.columns[y].type == 'ui-spinner') {
                            $(ctrl).spinner(settings.columns[y].uiOption);
                        } else if (settings.columns[y].type == 'ui-autocomplete') {
                            $(ctrl).autocomplete(settings.columns[y].uiOption);
                        }
                    }
                    // Add extra control properties
                    if (settings.columns[y].type != 'custom') {
                        // Add control attributes as needed
                        if (settings.columns[y].ctrlAttr != null) $(ctrl).attr(settings.columns[y].ctrlAttr);
                        // Add control properties as needed
                        if (settings.columns[y].ctrlProp != null) $(ctrl).prop(settings.columns[y].ctrlProp);
                        // Add control CSS as needed
                        if (settings.columns[y].ctrlCss != null) $(ctrl).css(settings.columns[y].ctrlCss);
                        // Add control class as needed
                        if (settings.columns[y].ctrlClass != null) $(ctrl).addClass(settings.columns[y].ctrlClass);
                        // Add jQuery UI tooltip as needed
                        if (settings.columns[y].uiTooltip) $(ctrl).tooltip(settings.columns[y].uiTooltip);
                        // Add control events as needed
                        if (langx.isFunction(settings.columns[y].onClick)) {
                            $(ctrl).click({ caller: tbWhole, callback: settings.columns[y].onClick, uniqueIndex: uniqueIndex }, function (evt) {
                                evt.data.callback(evt, $(evt.data.caller).appendGrid('getRowIndex', evt.data.uniqueIndex));
                            });
                        }
                        if (langx.isFunction(settings.columns[y].onChange)) {
                            $(ctrl).change({ caller: tbWhole, callback: settings.columns[y].onChange, uniqueIndex: uniqueIndex }, function (evt) {
                                evt.data.callback(evt, $(evt.data.caller).plugin("lark.tabular").getRowIndex(evt.data.uniqueIndex));
                            });
                        }
                    }
                    if (loadData) {
                        // Load data if needed
                        setCtrlValue(settings, y, uniqueIndex, numOfRowOrRowArray[z][settings.columns[y].name]);
                    } else if (!isEmpty(settings.columns[y].value)) {
                        // Set default value
                        setCtrlValue(settings, y, uniqueIndex, settings.columns[y].value);
                    }
                }
                // Add button cell if needed
                if (!settings._hideLastColumn || settings.columns.length > settings._visibleCount) {
                    if (!settings.rowButtonsInFront) {
                        tbRow.appendChild(tbCell = document.createElement('td'));
                    } else if (!settings.hideRowNumColumn) {
                        tbRow.insertBefore(tbCell = document.createElement('td'), tbRow.childNodes[1]);
                    } else {
                        tbRow.insertBefore(tbCell = document.createElement('td'), tbRow.firstChild);
                    }
                    tbCell.className = 'ui-widget-content last';
                    tbCell.id = settings.idPrefix + '_last_td_' + uniqueIndex;
                    if (settings._hideLastColumn) tbCell.style.display = 'none';
                    // Add standard buttons
                    if (!settings.hideButtons.insert) {
                        var button = this._createGridButton(settings.customGridButtons.insert, 'ui-icon-arrowreturnthick-1-w')
                            .attr({ id: settings.idPrefix + '_Insert_' + uniqueIndex, title: settings._i18n.insert, tabindex: -1 })
                            .addClass('insert').data('appendGrid', { uniqueIndex: uniqueIndex })
                            .click(function (evt) {
                                var rowUniqueIndex = $(this).data('appendGrid').uniqueIndex;
                                $(tbWhole).plugin("lark.tabular").insertRow(1, null, rowUniqueIndex);
                                if (evt && evt.preventDefault) evt.preventDefault(settings._buttonClasses.insert);
                                return false;
                            }).appendTo(tbCell);
                        if (!isEmpty(settings._buttonClasses.insert)) button.addClass(settings._buttonClasses.insert);
                    }
                    if (!settings.hideButtons.remove) {
                        var button = this._createGridButton(settings.customGridButtons.remove, 'ui-icon-trash')
                            .attr({ id: settings.idPrefix + '_Delete_' + uniqueIndex, title: settings._i18n.remove, tabindex: -1 })
                            .addClass('remove').data('appendGrid', { uniqueIndex: uniqueIndex })
                            .click(function (evt) {
                                var rowUniqueIndex = $(this).data('appendGrid').uniqueIndex;
                                self._removeRow( null, rowUniqueIndex, false);
                                if (evt && evt.preventDefault) evt.preventDefault();
                                return false;
                            }).appendTo(tbCell);
                        if (!isEmpty(settings._buttonClasses.remove)) button.addClass(settings._buttonClasses.remove);
                    }
                    if (!settings.hideButtons.moveUp) {
                        var button = this._createGridButton(settings.customGridButtons.moveUp, 'ui-icon-arrowthick-1-n')
                            .attr({ id: settings.idPrefix + '_MoveUp_' + uniqueIndex, title: settings._i18n.moveUp, tabindex: -1 })
                            .addClass('moveUp').data('appendGrid', { uniqueIndex: uniqueIndex })
                            .click(function (evt) {
                                var rowUniqueIndex = $(this).data('appendGrid').uniqueIndex;
                                $(tbWhole).plugin("lark.tabular").moveUpRow(null, rowUniqueIndex);
                                if (evt && evt.preventDefault) evt.preventDefault();
                                return false;
                            }).appendTo(tbCell);
                        if (!isEmpty(settings._buttonClasses.moveUp)) button.addClass(settings._buttonClasses.moveUp);
                    }
                    if (!settings.hideButtons.moveDown) {
                        var button = this._createGridButton(settings.customGridButtons.moveDown, 'ui-icon-arrowthick-1-s')
                            .attr({ id: settings.idPrefix + '_MoveDown_' + uniqueIndex, title: settings._i18n.moveDown, tabindex: -1 })
                            .addClass('moveDown').data('appendGrid', { uniqueIndex: uniqueIndex })
                            .click(function (evt) {
                                var rowUniqueIndex = $(this).data('appendGrid').uniqueIndex;
                                $(tbWhole).plugin("lark.tabular").moveDownRow(null, rowUniqueIndex);
                                if (evt && evt.preventDefault) evt.preventDefault();
                                return false;
                            }).appendTo(tbCell);
                        if (!isEmpty(settings._buttonClasses.moveDown)) button.addClass(settings._buttonClasses.moveDown);
                    }
                    // Handle row dragging
                    if (settings.rowDragging) {
                        var button = $('<div/>').addClass('rowDrag ui-state-default ui-corner-all')
                            .attr('title', settings._i18n.rowDrag).append($('<div/>').addClass('ui-icon ui-icon-caret-2-n-s').append($('<span/>').addClass('ui-button-text').text('Drag')))
                            .appendTo(tbCell);
                        if (!isEmpty(settings._buttonClasses.rowDrag)) button.addClass(settings._buttonClasses.rowDrag);
                    }
                    // Add hidden
                    for (var y = 0; y < hidden.length; y++) {
                        ctrl = document.createElement('input');
                        ctrl.id = settings.idPrefix + '_' + settings.columns[hidden[y]].name + '_' + uniqueIndex;
                        if (langx.isFunction(settings.nameFormatter)) {
                            ctrl.name = settings.nameFormatter(settings.idPrefix, settings.columns[y].name, uniqueIndex);
                        } else {
                            ctrl.name = ctrl.id;
                        }
                        ctrl.type = 'hidden';

                        if (loadData) {
                            // Load data if needed
                            ctrl.value = numOfRowOrRowArray[z][settings.columns[hidden[y]].name];
                        } else if (!isEmpty(settings.columns[hidden[y]].value)) {
                            // Set default value
                            ctrl.value = settings.columns[hidden[y]].value;
                        }
                        tbCell.appendChild(ctrl);
                    }
                    // Add extra buttons
                    if (settings.customRowButtons && settings.customRowButtons.length) {
                        // Add front buttons
                        for (var y = settings.customRowButtons.length - 1; y >= 0; y--) {
                            var buttonCfg = settings.customRowButtons[y];
                            if (buttonCfg && buttonCfg.uiButton && buttonCfg.click && buttonCfg.atTheFront) {
                                $(tbCell).prepend(makeCustomRowButton(tbWhole, buttonCfg, uniqueIndex));
                            }
                        }
                        // Add end buttons
                        for (var y = 0; y < settings.customRowButtons.length; y++) {
                            var buttonCfg = settings.customRowButtons[y];
                            if (buttonCfg && buttonCfg.uiButton && buttonCfg.click && !buttonCfg.atTheFront) {
                                $(tbCell).append(makeCustomRowButton(tbWhole, buttonCfg, uniqueIndex));
                            }
                        }
                    }
                }
                // Create sub panel
                if (settings.useSubPanel) {
                    tbSubRow.appendChild(tbCell = document.createElement('td'));
                    tbCell.className = 'ui-widget-content';
                    tbCell.colSpan = settings._visibleCount + (settings._hideLastColumn ? 0 : 1);
                    if (langx.isFunction(settings.subPanelBuilder)) {
                        settings.subPanelBuilder(tbCell, uniqueIndex);
                    }
                }
            }
            // Check if re-calculate column width is required
            if (0 < settings.maxBodyHeight && settings._calculateWidth && !calColWidth) {
                var scroll = $('#' + settings._wrapperId + '>div.scroller')[0];
                if (scroll.scrollHeight > scroll.offsetHeight) {
                    calColWidth = true;
                    settings._calculateWidth = false;
                }
            }
            // Save setting
            this._saveSetting(settings);
            // Calculate column width
            if (calColWidth && settings.autoColumnWidth && settings.maxBodyHeight > 0) {
                this._calculateColumnWidth();
            }
            // Trigger events
            if (langx.isNumeric(rowIndex)) {
                if (langx.isFunction(settings.afterRowInserted)) {
                    settings.afterRowInserted(tbWhole, parentIndex, addedRows);
                }
            }
            else {
                if (langx.isFunction(settings.afterRowAppended)) {
                    settings.afterRowAppended(tbWhole, parentIndex, addedRows);
                }
            }
            if (reachMaxRow && langx.isFunction(settings.maxNumRowsReached)) {
                settings.maxNumRowsReached();
            }
            // Scroll the page when append row
            if (settings.maintainScroll && !langx.isNumeric(rowIndex)) {
                // Try to maintain the height so that user no need to scroll every time when row added
                var newHeight = $(tbWhole).height();
                $(tbWhole).scrollParent().scrollTop(oldScroll + newHeight - oldHeight);
            }
            // Return added rows' uniqueIndex
            return { addedRows: addedRows, parentIndex: parentIndex, rowIndex: rowIndex };
        },

        _removeRow : function (rowIndex, uniqueIndex, force) {
            var tbWhole = this._elm;

            var settings = $(tbWhole).data('appendGrid');
            var tbBody = tbWhole.getElementsByTagName('tbody')[0];
            if (langx.isNumeric(uniqueIndex)) {
                for (var z = 0; z < settings._rowOrder.length; z++) {
                    if (settings._rowOrder[z] == uniqueIndex) {
                        rowIndex = z;
                        break;
                    }
                }
            }
            if (langx.isNumeric(rowIndex)) {
                // Remove middle row
                if (force || typeof (settings.beforeRowRemove) != 'function' || settings.beforeRowRemove(tbWhole, rowIndex)) {
                    settings._rowOrder.splice(rowIndex, 1);
                    if (settings.useSubPanel) {
                        tbBody.removeChild(tbBody.childNodes[rowIndex * 2]);
                        tbBody.removeChild(tbBody.childNodes[rowIndex * 2]);
                    } else {
                        tbBody.removeChild(tbBody.childNodes[rowIndex]);
                    }
                    // Save setting
                    this._saveSetting(settings);
                    // Sort sequence
                    this._sortSequence( rowIndex);
                    // Trigger event
                    if (langx.isFunction(settings.afterRowRemoved)) {
                        settings.afterRowRemoved(tbWhole, rowIndex);
                    }
                }
            }
            else {
                // Store old window scroll value
                var oldHeight = 0, oldScroll = 0;
                if (settings.maintainScroll) {
                    oldHeight = $(tbWhole).height();
                    oldScroll = $(tbWhole).scrollParent().scrollTop();
                }
                // Remove last row
                if (force || !langx.isFunction(settings.beforeRowRemove) || settings.beforeRowRemove(tbWhole, settings._rowOrder.length - 1)) {
                    uniqueIndex = settings._rowOrder.pop();
                    tbBody.removeChild(tbBody.lastChild);
                    if (settings.useSubPanel) {
                        tbBody.removeChild(tbBody.lastChild);
                    }
                    // Save setting
                    this._saveSetting(settings);
                    // Trigger event
                    if (langx.isFunction(settings.afterRowRemoved)) {
                        settings.afterRowRemoved(tbWhole, null);
                    }
                }
                // Scroll the page when append row
                if (settings.maintainScroll) {
                    // Try to maintain the height so that user no need to scroll every time when row added
                    var newHeight = $(tbWhole).height();
                    $(tbWhole).scrollParent().scrollTop(oldScroll + newHeight - oldHeight);
                }
            }
            // Add empty row
            if (settings._rowOrder.length == 0) {
                this._showEmptyMessage(settings);
            }
        },

        _loadData : function (records, isInit) {
            var tbWhole = this._elm;
            var tbBody, tbRow, tbCell, uniqueIndex, insertResult;
            var settings = $(tbWhole).data('appendGrid');
            if (settings) {
                // Clear existing content
                tbBody = tbWhole.getElementsByTagName('tbody')[0];
                $(tbBody).empty();
                settings._rowOrder.length = 0;
                settings._uniqueIndex = 0;
                // Check any records
                if (records != null && records.length) {
                    // Add rows
                    insertResult = this._insertRow(records.length, null, null);
                    // Set data
                    for (var r = 0; r < insertResult.addedRows.length; r++) {
                        for (var c = 0; c < settings.columns.length; c++) {
                            setCtrlValue(settings, c, settings._rowOrder[r], records[r][settings.columns[c].name]);
                        }
                        if (langx.isFunction(settings.rowDataLoaded)) {
                            settings.rowDataLoaded(tbWhole, records[r], r, settings._rowOrder[r]);
                        }
                    }
                }
                // Save setting
                settings._isDataLoaded = true;
                if (isInit) settings.initData = null;
                $(tbWhole).data('appendGrid', settings);
                // Trigger data loaded event
                if (langx.isFunction(settings.dataLoaded)) {
                    settings.dataLoaded(tbWhole, records);
                }
            }
        },

        _init: function () {
            var options = this.options,
                self = this;
            // Check mandatory paramters included
            if (!langx.isArray(options.columns) || options.columns.length == 0) {
                alert(_systemMessages.noColumnInfo);
            }
            // Check target element is table or not
            var tbWhole = this._elm, tbWrap, tbHead, tbBody, tbFoot, tbColGp, tbRow, tbCell;
            if (isEmpty(tbWhole.tagName) || tbWhole.tagName != 'TABLE') {
                alert(_systemMessages.elemNotTable);
            }
            // Generate settings
            var settings = langx.extend({}, _defaultInitOptions, _defaultCallbackContainer, options);
            // Add internal settings
            langx.extend(settings, {
                // The UniqueIndex accumulate counter
                _uniqueIndex: 0,
                // The row order array
                _rowOrder: [],
                // Indicate data is loaded or not
                _isDataLoaded: false,
                // Visible column count for internal calculation
                _visibleCount: 0,
                // Total colSpan count after excluding `hideRowNumColumn` and not generating last column
                _finalColSpan: 0,
                // Indicate to hide last column or not
                _hideLastColumn: false,
                // The element ID of the `appendGrid` wrapper
                _wrapperId: null,
                // 
                _calculateWidth: true
            });
            // Labels or messages used in grid
            if (langx.isPlainObject(options.i18n))
                settings._i18n = langx.extend({}, _defaultTextResources, options.i18n);
            else
                settings._i18n = langx.extend({}, _defaultTextResources);
            // The extra class names for buttons
            if (langx.isPlainObject(options.buttonClasses))
                settings._buttonClasses = langx.extend({}, _defaultButtonClasses, options.buttonClasses);
            else
                settings._buttonClasses = langx.extend({}, _defaultButtonClasses);
            // The extra class names for sections
            if (langx.isPlainObject(options.sectionClasses))
                settings._sectionClasses = langx.extend({}, _defaultSectionClasses, options.sectionClasses);
            else
                settings._sectionClasses = langx.extend({}, _defaultSectionClasses);
            // Make sure the `hideButtons` setting defined
            if (langx.isPlainObject(options.hideButtons))
                settings.hideButtons = langx.extend({}, _defaultHideButtons, options.hideButtons);
            else
                settings.hideButtons = langx.extend({}, _defaultHideButtons);
            // Check `idPrefix` is defined
            if (isEmpty(settings.idPrefix)) {
                // Check table ID defined
                if (isEmpty(tbWhole.id) || tbWhole.id == '') {
                    // Generate an ID using current time
                    settings.idPrefix = 'ag' + new Date().getTime();
                }
                else {
                    settings.idPrefix = tbWhole.id;
                }
            }
            // Check custom grid button parameters
            if (!langx.isPlainObject(settings.customGridButtons)) {
                settings.customGridButtons = {};
            }
            // Check rowDragging and useSubPanel option
            if (settings.useSubPanel && settings.rowDragging) {
                settings.rowDragging = false;
            }
            // Create thead and tbody
            tbHead = document.createElement('thead');
            tbHead.className = 'ui-widget-header';
            tbBody = document.createElement('tbody');
            tbBody.className = 'ui-widget-content';
            tbFoot = document.createElement('tfoot');
            tbFoot.className = 'ui-widget-header';
            tbColGp = document.createElement('colgroup');
            // Prepare the table element
            settings._wrapperId = settings.idPrefix + '-wrapper';
            tbWrap = this._tbWrap = document.createElement('div');
            $(tbWrap).attr('id', settings._wrapperId).addClass('appendGrid').insertAfter(tbWhole);
            $(tbWhole).empty().addClass('ui-widget').appendTo(tbWrap);
            // Check if content scrolling is enabled
            if (settings.maxBodyHeight > 0) {
                // Seperate the thead and tfoot from source table
                $('<table></table>').addClass('ui-widget head').append(tbHead).prependTo(tbWrap);
                $(tbWhole).addClass('body').wrap($('<div></div>').addClass('scroller').css('max-height', settings.maxBodyHeight)).append(tbColGp, tbBody);
                $('<table></table>').addClass('ui-widget foot').append(tbFoot).appendTo(tbWrap);
            } else {
                // Add thead, tbody and tfoot to the same table
                $(tbWhole).addClass('head body foot').append(tbColGp, tbHead, tbBody, tbFoot);
            }
            // Handle header row
            var tbHeadCellRowNum, tbHeadCellRowButton;
            tbHead.appendChild(tbRow = document.createElement('tr'));
            if (settings._sectionClasses.header) {
                tbRow.className = 'columnHead ' + settings._sectionClasses.header;
            } else {
                tbRow.className = 'columnHead';
            }
            if (!settings.hideRowNumColumn) {
                tbRow.appendChild(tbHeadCellRowNum = document.createElement('td'));
                tbHeadCellRowNum.className = 'ui-widget-header first';
                // Add column group for scrolling
                tbColGp.appendChild(document.createElement('col'));
            }
            // Prepare column information and add column header
            var pendingSkipCol = 0;
            for (var z = 0; z < settings.columns.length; z++) {
                // Assign default setting
                var columnOpt = langx.extend({}, _defaultColumnOptions, settings.columns[z]);
                settings.columns[z] = columnOpt;
                // Skip hidden
                if (settings.columns[z].type != 'hidden') {
                    // Check column is invisible
                    if (!settings.columns[z].invisible) {
                        settings._visibleCount++;
                    }
                    // Check skip header colSpan
                    if (pendingSkipCol == 0) {
                        var className = 'ui-widget-header';
                        if (settings.columns[z].invisible) className += ' invisible';
                        if (settings.columns[z].resizable) className += ' resizable';
                        tbRow.appendChild(tbCell = document.createElement('td'));
                        tbCell.id = settings.idPrefix + '_' + settings.columns[z].name + '_td_head';
                        tbCell.className = className;
                        if (settings.columns[z].displayCss) $(tbCell).css(settings.columns[z].displayCss);
                        if (settings.columns[z].headerSpan > 1) {
                            $(tbCell).attr('colSpan', settings.columns[z].headerSpan);
                            pendingSkipCol = settings.columns[z].headerSpan - 1;
                        }
                        // Add tooltip
                        if (langx.isPlainObject(settings.columns[z].displayTooltip)) {
                            $(tbCell).tooltip(settings.columns[z].displayTooltip);
                        }
                        else if (!isEmpty(settings.columns[z].displayTooltip)) {
                            $(tbCell).attr('title', settings.columns[z].displayTooltip).tooltip();
                        }
                        // Check to set display text or generate by function
                        if (langx.isFunction(settings.columns[z].display)) {
                            settings.columns[z].display(tbCell);
                        } else if (!isEmpty(settings.columns[z].display)) {
                            $(tbCell).text(settings.columns[z].display);
                        }
                        // Add column group for scrolling
                        tbColGp.appendChild(document.createElement('col'));
                    } else {
                        pendingSkipCol--;
                    }
                }
            }
            // Enable columns resizable
            if ($.fn.resizable ) {
                $('td.resizable', tbHead).resizable({ handles: 'e' });
            }
            // Check to hide last column or not
            if (settings.hideButtons.insert && settings.hideButtons.remove
                    && settings.hideButtons.moveUp && settings.hideButtons.moveDown
                    && (!langx.isArray(settings.customRowButtons) || settings.customRowButtons.length == 0)) {
                settings._hideLastColumn = true;
            }
            // Calculate the `_finalColSpan` value
            settings._finalColSpan = settings._visibleCount;
            if (!settings.hideRowNumColumn) settings._finalColSpan++;
            if (!settings._hideLastColumn) settings._finalColSpan++;
            // Generate last column header if needed
            if (!settings._hideLastColumn) {
                if (settings.rowButtonsInFront) {
                    if (settings.hideRowNumColumn) {
                        // Insert a cell at the front
                        tbRow.insertBefore(tbHeadCellRowButton = document.createElement('td'), tbRow.firstChild);
                    } else {
                        // Span the first cell that across row number and row button cells
                        // tbHeadCellRowNum.colSpan = 2;
                        // tbHeadCellRowButton = tbHeadCellRowNum;

                        // Insert a cell as the second column
                        tbRow.insertBefore(tbHeadCellRowButton = document.createElement('td'), tbRow.childnodes[1]);
                    }
                } else {
                    tbRow.appendChild(tbHeadCellRowButton = document.createElement('td'));
                }
                tbHeadCellRowButton.className = 'ui-widget-header last';
                tbHeadCellRowButton.id = settings.idPrefix + '_last_td_head';
                // Add column group for scrolling
                tbColGp.appendChild(document.createElement('col'));
            }
            // Add caption when defined
            if (settings.caption) {
                tbHead.insertBefore(tbRow = document.createElement('tr'), tbHead.firstChild);
                if (settings._sectionClasses.caption) {
                    tbRow.className = settings._sectionClasses.caption;
                }
                tbRow.appendChild(tbCell = document.createElement('td'));
                tbCell.id = settings.idPrefix + '_caption_td';
                tbCell.className = 'ui-state-active caption';
                tbCell.colSpan = settings._finalColSpan;
                // Add tooltip
                if (langx.isPlainObject(settings.captionTooltip)) {
                    $(tbCell).tooltip(settings.captionTooltip);
                } else if (!isEmpty(settings.captionTooltip)) {
                    $(tbCell).attr('title', settings.captionTooltip).tooltip();
                }
                // Check to set display text or generate by function
                if (langx.isFunction(settings.caption)) {
                    settings.caption(tbCell);
                } else {
                    $(tbCell).text(settings.caption);
                }
            }
            // Handle footer row
            tbFoot.appendChild(tbRow = document.createElement('tr'));
            if (settings._sectionClasses.footer) {
                tbRow.className = settings._sectionClasses.footer;
            }
            tbRow.appendChild(tbCell = document.createElement('td'));
            tbCell.id = settings.idPrefix + '_footer_td';
            tbCell.colSpan = settings._finalColSpan;
            $('<input/>').attr({
                type: 'hidden',
                id: settings.idPrefix + '_rowOrder',
                name: settings.idPrefix + '_rowOrder'
            }).appendTo(tbCell);
            // Make row invisible if all buttons are hidden
            if (settings.hideButtons.append && settings.hideButtons.removeLast
                    && (!langx.isArray(settings.customFooterButtons) || settings.customFooterButtons.length == 0)) {
                tbRow.style.display = 'none';
            } else {
                if (!settings.hideButtons.append) {
                    var button = this._createGridButton(settings.customGridButtons.append, 'ui-icon-plusthick')
                    .attr({ title: settings._i18n.append }).addClass('append')
                    .click(function (evt) {
                        self._insertRow(1, null, null);
                        if (evt && evt.preventDefault) evt.preventDefault();
                        return false;
                    }).appendTo(tbCell);
                    if (!isEmpty(settings._buttonClasses.append)) button.addClass(settings._buttonClasses.append);
                }
                if (!settings.hideButtons.removeLast) {
                    var button = this._createGridButton(settings.customGridButtons.removeLast, 'ui-icon-closethick')
                    .attr({ title: settings._i18n.removeLast }).addClass('removeLast')
                    .click(function (evt) {
                        self._removeRow( null, this.value, false);
                        if (evt && evt.preventDefault) evt.preventDefault();
                        return false;
                    }).appendTo(tbCell);
                    if (!isEmpty(settings._buttonClasses.removeLast)) button.addClass(settings._buttonClasses.removeLast);
                }
                if (settings.customFooterButtons && settings.customFooterButtons.length) {
                    // Add front buttons
                    for (var y = settings.customFooterButtons.length - 1; y >= 0; y--) {
                        var buttonCfg = settings.customFooterButtons[y];
                        if (buttonCfg && buttonCfg.uiButton && buttonCfg.click && buttonCfg.atTheFront) {
                            $(tbCell).prepend(makeCustomBottomButton(tbWhole, buttonCfg));
                        }
                    }
                    // Add end buttons
                    for (var y = 0; y < settings.customFooterButtons.length; y++) {
                        var buttonCfg = settings.customFooterButtons[y];
                        if (buttonCfg && buttonCfg.uiButton && buttonCfg.click && !buttonCfg.atTheFront) {
                            $(tbCell).append(makeCustomBottomButton(tbWhole, buttonCfg));
                        }
                    }
                }
            }
            // Enable dragging
            if (settings.rowDragging) {
                $(tbBody).sortable({
                    axis: 'y',
                    containment: tbWhole,
                    handle: '.rowDrag',
                    helper: function (e, tr) {
                        var org = tr.children();
                        var helper = tr.clone();
                        // Fix the cell width of cloned table cell
                        helper.children().each(function (index) {
                            $(this).width(org.eq(index).width());
                            // Set the value of drop down list when drag (Issue #18)
                            var helperSelect = $('select', this);
                            if (helperSelect.length > 0) {
                                for (var y = 0; y < helperSelect.length; y++) {
                                    var orgSelect = org.eq(index).find('select');
                                    if (orgSelect.length > y) {
                                        helperSelect[y].value = orgSelect[y].value;
                                    }
                                }
                            }
                        });
                        return helper;
                    },
                    update: function (event, ui) {
                        var uniqueIndex = ui.item[0].id.substring(ui.item[0].id.lastIndexOf('_') + 1);
                        var tbRowIndex = ui.item[0].rowIndex - $('tr', tbHead).length;
                        self._gridRowDragged(ui.originalPosition.top > ui.position.top, uniqueIndex, tbRowIndex);
                    }
                });
            }
            // Save options
            $(tbWhole).data('appendGrid', settings);
            if (langx.isArray(options.initData)) {
                // Load data if initData is array
                this._loadData(options.initData, true);
            } else {
                // Add empty rows
                //$(tbWhole).appendGrid('appendRow', settings.initRows);
                this.appendRow(settings.initRows);
            }
            // Show no rows in grid
            if (settings._rowOrder.length == 0) {
                this._showEmptyMessage(settings, true);
            }
            // Calculate column width
            if (settings.maxBodyHeight > 0) {
                if (settings.autoColumnWidth) {
                    this._calculateColumnWidth();
                } else {
                    $('table.foot', tbWrap).width($(tbWhole).width());
                }
            }
        },

        isReady: function () {
            // Check the appendGrid is initialized or not
            var settings = this._checkGridAndGetSettings( true);
            if (settings) {
                return true;
            }
            return false;
        },

        isDataLoaded: function () {
            // Check the grid data is loaded by `load` method or `initData` parameter or not
            var settings = this._checkGridAndGetSettings();
            if (settings) {
                return settings._isDataLoaded;
            }
            return false;
        },

        load: function (records) {
            var settings = this._checkGridAndGetSettings();
            if (settings) {
                if (records != null && records.length > 0) {
                    this._loadData(records, false);
                } else {
                    this._emptyGrid();
                }
            }
            return this;
        },

        appendRow: function (numOfRowOrRowArray) {
            return this.insertRow(numOfRowOrRowArray);
        },

        insertRow: function (numOfRowOrRowArray, rowIndex, callerUniqueIndex) {
            var settings = this._checkGridAndGetSettings();
            if (settings) {
                if ((langx.isArray(numOfRowOrRowArray) && numOfRowOrRowArray.length > 0) || (langx.isNumeric(numOfRowOrRowArray) && numOfRowOrRowArray > 0)) {
                    // Define variables
                    var tbWhole = this[0];
                    insertResult = this._insertRow(numOfRowOrRowArray, rowIndex, callerUniqueIndex);
                    // Reorder sequence as needed
                    if (langx.isNumeric(rowIndex) || langx.isNumeric(callerUniqueIndex)) {
                        // Sort sequence
                        this._sortSequence( insertResult.rowIndex);
                        // Move focus
                        var insertUniqueIndex = settings._rowOrder[insertResult.addedRows[0]];
                        $('#' + settings.idPrefix + '_Insert_' + insertUniqueIndex, tbWhole).focus();
                    }
                }
            }
            return this;
        },
        removeRow: function (rowIndex, uniqueIndex) {
            var settings = this._checkGridAndGetSettings();
            if (settings && settings._rowOrder.length > 0) {
                this._removeRow(rowIndex, uniqueIndex, true);
            }
            return this;
        },
        emptyGrid: function () {
            var settings = this._checkGridAndGetSettings();
            if (settings) {
                this._emptyGrid();
            }
            return target;
        },
        moveUpRow: function (rowIndex, uniqueIndex) {
            var settings = this._checkGridAndGetSettings(), target = this;
            if (settings) {
                var tbWhole = target[0], trTarget, trSwap, trAdtTarget, swapSeq, oldIndex = null;
                var tbBody = tbWhole.getElementsByTagName('tbody')[0];
                if (langx.isNumeric(rowIndex) && rowIndex > 0 && rowIndex < settings._rowOrder.length) {
                    oldIndex = rowIndex;
                    uniqueIndex = settings._rowOrder[rowIndex];
                } else if (langx.isNumeric(uniqueIndex)) {
                    oldIndex = findRowIndex(uniqueIndex, settings);
                }
                if (oldIndex != null && oldIndex > 0) {
                    // Get row to swap
                    trTarget = document.getElementById(settings.idPrefix + '_Row_' + uniqueIndex, tbWhole);
                    trSwap = document.getElementById(settings.idPrefix + '_Row_' + settings._rowOrder[oldIndex - 1], tbWhole);
                    // Get the sub panel row if used
                    if (settings.useSubPanel) {
                        trAdtTarget = document.getElementById(settings.idPrefix + '_SubRow_' + uniqueIndex, tbWhole);
                    }
                    // Remove current row
                    tbBody.removeChild(trTarget);
                    if (settings.useSubPanel) {
                        tbBody.removeChild(trAdtTarget);
                    }
                    // Insert before the above row
                    tbBody.insertBefore(trTarget, trSwap);
                    if (settings.useSubPanel) {
                        tbBody.insertBefore(trAdtTarget, trSwap);
                    }
                    // Update rowOrder
                    settings._rowOrder[oldIndex] = settings._rowOrder[oldIndex - 1];
                    settings._rowOrder[oldIndex - 1] = uniqueIndex;
                    // Update row label
                    swapSeq = $('td.first', trSwap).html();
                    $('td.first', trSwap).html($('td.first', trTarget).html());
                    $('td.first', trTarget).html(swapSeq)
                    // Save setting
                    this._saveSetting(settings);
                    // Change focus
                    $('td.last button.moveUp', trTarget).removeClass('ui-state-hover').blur();
                    $('td.last button.moveUp', trSwap).focus();
                    // Trigger event
                    if (settings.afterRowSwapped) {
                        settings.afterRowSwapped(tbWhole, oldIndex, oldIndex - 1);
                    }
                }
            }
            return target;
        },
        moveDownRow: function (rowIndex, uniqueIndex) {
            var settings = this._checkGridAndGetSettings(), target = this;
            if (settings) {
                var tbWhole = target[0], trTarget, trSwap, trAdtSwap, swapSeq, oldIndex = null;
                var tbBody = tbWhole.getElementsByTagName('tbody')[0];
                if (langx.isNumeric(rowIndex) && rowIndex >= 0 && rowIndex < settings._rowOrder.length - 1) {
                    oldIndex = rowIndex;
                    uniqueIndex = settings._rowOrder[rowIndex];
                } else if (langx.isNumeric(uniqueIndex)) {
                    oldIndex = findRowIndex(uniqueIndex, settings);
                }
                if (oldIndex != null && oldIndex != settings._rowOrder.length - 1) {
                    // Get row to swap
                    trTarget = document.getElementById(settings.idPrefix + '_Row_' + uniqueIndex, tbWhole);
                    trSwap = document.getElementById(settings.idPrefix + '_Row_' + settings._rowOrder[oldIndex + 1], tbWhole);
                    // Get the sub panel row if used
                    if (settings.useSubPanel) {
                        trAdtSwap = document.getElementById(settings.idPrefix + '_SubRow_' + settings._rowOrder[oldIndex + 1], tbWhole);
                    }
                    // Remove current row
                    tbBody.removeChild(trSwap);
                    // Insert before the above row
                    tbBody.insertBefore(trSwap, trTarget);
                    if (settings.useSubPanel) {
                        tbBody.insertBefore(trAdtSwap, trTarget);
                    }
                    // Update rowOrder
                    settings._rowOrder[oldIndex] = settings._rowOrder[oldIndex + 1];
                    settings._rowOrder[oldIndex + 1] = uniqueIndex;
                    // Update row label
                    swapSeq = $('td.first', trSwap).html();
                    $('td.first', trSwap).html($('td.first', trTarget).html());
                    $('td.first', trTarget).html(swapSeq)
                    // Save setting
                    this._saveSetting(settings);
                    // Change focus
                    $('td.last button.moveDown', trTarget).removeClass('ui-state-hover').blur();
                    $('td.last button.moveDown', trSwap).focus();
                    // Trigger event
                    if (settings.afterRowSwapped) {
                        settings.afterRowSwapped(tbWhole, oldIndex, oldIndex + 1);
                    }
                }
            }
            return target;
        },
        showColumn: function (name) {
            var settings = this._checkGridAndGetSettings();
            if (settings && name) {
                // Find column index
                var colIndex = -1, tbWhole = this[0];
                for (var z = 0; z < settings.columns.length; z++) {
                    if (settings.columns[z].name == name) {
                        colIndex = z;
                        break;
                    }
                }
                // Make sure the column exist and show the column if it is invisible only
                if (colIndex != -1 && settings.columns[colIndex].invisible) {
                    // Change caption and footer column span
                    settings._visibleCount++;
                    settings._finalColSpan++;
                    $('#' + settings.idPrefix + '_caption_td').attr('colSpan', settings._finalColSpan);
                    $('#' + settings.idPrefix + '_footer_td').attr('colSpan', settings._finalColSpan);
                    // Remove invisible class on each row
                    $('#' + settings.idPrefix + '_' + name + '_td_head').removeClass('invisible');
                    for (var z = 0; z < settings._rowOrder.length; z++) {
                        var uniqueIndex = settings._rowOrder[z];
                        $('#' + settings.idPrefix + '_' + name + '_td_' + uniqueIndex).removeClass('invisible');
                        if (settings.useSubPanel) {
                            $('#' + settings.idPrefix + '_SubRow_' + uniqueIndex).attr('colSpan', settings._visibleCount + (settings._hideLastColumn ? 0 : 1));
                        }
                    }
                    // Save changes
                    settings.columns[colIndex].invisible = false;
                    this._saveSetting(settings);
                }
            }
            return this;
        },
        hideColumn: function (name) {
            var settings = this._checkGridAndGetSettings();
            if (settings && name) {
                // Find column index
                var colIndex = -1, tbWhole = this[0];
                for (var z = 0; z < settings.columns.length; z++) {
                    if (settings.columns[z].name == name) {
                        colIndex = z;
                        break;
                    }
                }
                // Make sure the column exist and hide the column if it is visible only
                if (colIndex != -1 && !settings.columns[colIndex].invisible) {
                    // Change caption and footer column span
                    settings._visibleCount--;
                    settings._finalColSpan--;
                    $('#' + settings.idPrefix + '_caption_td').attr('colSpan', settings._finalColSpan);
                    $('#' + settings.idPrefix + '_footer_td').attr('colSpan', settings._finalColSpan);
                    // Add invisible class on each row
                    $('#' + settings.idPrefix + '_' + name + '_td_head').addClass('invisible');
                    for (var z = 0; z < settings._rowOrder.length; z++) {
                        var uniqueIndex = settings._rowOrder[z];
                        $('#' + settings.idPrefix + '_' + name + '_td_' + uniqueIndex).addClass('invisible');
                        if (settings.useSubPanel) {
                            $('#' + settings.idPrefix + '_SubRow_' + uniqueIndex).attr('colSpan', settings._visibleCount + (settings._hideLastColumn ? 0 : 1));
                        }
                    }
                    // Save changes
                    settings.columns[colIndex].invisible = true;
                    this._saveSetting(settings);
                }
            }
            return this;
        },
        isColumnInvisible: function (name) {
            var settings = this._checkGridAndGetSettings();
            if (settings && name) {
                for (var z = 0; z < settings.columns.length; z++) {
                    if (settings.columns[z].name == name) {
                        return settings.columns[z].invisible;
                    }
                }
            }
            return null;
        },
        getRowCount: function () {
            var settings = this._checkGridAndGetSettings();
            if (settings) {
                return settings._rowOrder.length;
            }
            return null;
        },
        getUniqueIndex: function (rowIndex) {
            var settings = this._checkGridAndGetSettings();
            if (settings && langx.isNumeric(rowIndex) && rowIndex < settings._rowOrder.length) {
                return settings._rowOrder[rowIndex];
            }
            return null;
        },
        getRowIndex: function (uniqueIndex) {
            var settings = this._checkGridAndGetSettings();
            if (settings && langx.isNumeric(uniqueIndex)) {
                for (var z = 0; z < settings._rowOrder.length; z++) {
                    if (settings._rowOrder[z] == uniqueIndex) {
                        return z;
                    }
                }
            }
            return null;
        },
        getRowValue: function (rowIndex, uniqueIndex, loopIndex) {
            var settings = this._checkGridAndGetSettings(), result = null;
            if (settings) {
                if (langx.isNumeric(rowIndex) && rowIndex >= 0 && rowIndex < settings._rowOrder.length) {
                    uniqueIndex = settings._rowOrder[rowIndex];
                }
                if (!isEmpty(uniqueIndex)) {
                    result = getRowValue(settings, uniqueIndex, loopIndex);
                }
            }
            return result;
        },
        getAllValue: function (objectMode) {
            var settings = this._checkGridAndGetSettings(), result = null;
            if (settings) {
                // Prepare result based on objectMode setting
                result = objectMode ? {} : [];
                // Process on each rows
                for (var z = 0; z < settings._rowOrder.length; z++) {
                    if (objectMode) {
                        rowValue = getRowValue(settings, settings._rowOrder[z], z);
                        langx.extend(result, rowValue)
                    } else {
                        rowValue = getRowValue(settings, settings._rowOrder[z]);
                        result.push(rowValue);
                    }
                }
                if (objectMode) {
                    result[settings.rowCountName] = settings._rowOrder.length;
                }
            }
            return result;
        },
        getCtrlValue: function (name, rowIndex) {
            var settings = this._checkGridAndGetSettings();
            if (settings && rowIndex >= 0 && rowIndex < settings._rowOrder.length) {
                for (var z = 0; z < settings.columns.length; z++) {
                    if (settings.columns[z].name === name) {
                        return getCtrlValue(settings, z, settings._rowOrder[rowIndex]);
                    }
                }
            }
            return null;
        },
        setCtrlValue: function (name, rowIndex, value) {
            var settings = this._checkGridAndGetSettings();
            if (settings && rowIndex >= 0 && rowIndex < settings._rowOrder.length) {
                for (var z = 0; z < settings.columns.length; z++) {
                    if (settings.columns[z].name == name) {
                        setCtrlValue(settings, z, settings._rowOrder[rowIndex], value);
                        break;
                    }
                }
            }
            return this;
        },
        getCellCtrl: function (name, rowIndex) {
            var settings = this._checkGridAndGetSettings();
            if (settings && rowIndex >= 0 && rowIndex < settings._rowOrder.length) {
                var uniqueIndex = settings._rowOrder[rowIndex];
                for (var z = 0; z < settings.columns.length; z++) {
                    if (settings.columns[z].name === name) {
                        return getCellCtrl(settings.columns[z].type, settings.idPrefix, name, uniqueIndex);
                    }
                }
            }
            return null;
        },
        getCellCtrlByUniqueIndex: function (name, uniqueIndex) {
            var settings = this._checkGridAndGetSettings();
            if (settings) {
                for (var z = 0; z < settings.columns.length; z++) {
                    if (settings.columns[z].name === name) {
                        return getCellCtrl(settings.columns[z].type, settings.idPrefix, name, uniqueIndex);
                    }
                }
            }
            return null;
        },
        getRowOrder: function () {
            var settings = this._checkGridAndGetSettings();
            if (settings) {
                // Return a copy of `Row Order` array
                return settings._rowOrder.slice();
            }
            return null;
        },
        getColumns: function () {
            var settings = this._checkGridAndGetSettings();
            if (settings) {
                // Return a copy of the columns array
                return settings.columns.slice();
            }
            return null;
        },
        isRowEmpty: function (rowIndex) {
            var settings = this._checkGridAndGetSettings();
            if (settings) {
                return isRowEmpty(settings, rowIndex);
            }
            return null;
        },
        removeEmptyRows: function () {
            var settings = this._checkGridAndGetSettings();
            if (settings) {
                var tbWhole = this[0];
                for (var z = settings._rowOrder.length; z >= 0; z--) {
                    if (isRowEmpty(settings, z)) {
                        // Remove itself
                        this._removeRow( null, settings._rowOrder[z], true);
                    }
                }
                return this;
            }
            return null;
        }



    });
    // The default initial options.
    var _defaultInitOptions = {
        // The text as table caption, set null to disable caption generation.
        caption: null,
        // Tooltip for caption.
        captionTooltip: null,
        // The total number of empty rows generated when init the grid. This will be ignored if `initData` is assigned.
        initRows: 3,
        // The maximum number of rows allowed in this grid.
        maxRowsAllowed: 0,
        // An array of data to be filled after initialized the grid.
        initData: null,
        // Array of column options.
        columns: null,
        // Labels or messages used in grid.
        i18n: null,
        // The ID prefix of controls generated inside the grid. Table ID will be used if not defined.
        idPrefix: null,
        // Enable row dragging by using jQuery UI sortable on grid rows.
        rowDragging: false,
        // Hide the buttons at the end of rows or bottom of grid.
        hideButtons: null,
        // Hide the row number column.
        hideRowNumColumn: false,
        // Generate row buttom column in the front of input columns.
        rowButtonsInFront: false,
        // The variable name of row count used for object mode of getAllValue
        rowCountName: '_RowCount',
        // The extra class names for buttons.
        buttonClasses: null,
        // The extra class names for table sections.
        sectionClasses: null,
        // Custom the standard grid buttons.
        customGridButtons: null,
        // Adding extra button(s) at the end of rows.
        customRowButtons: null,
        // Adding extra button(s) at the bottom of grid.
        customFooterButtons: null,
        // Use the sub panel or not
        useSubPanel: false,
        // Maintain the scroll position after appended or removed last row.
        maintainScroll: false,
        // The maximum height of grid content, scroll bar will be display when the height is greater than this value.
        maxBodyHeight: 0,
        // Auto calculate the column width when scroll bar on table body is in use.
        autoColumnWidth: true
    };
    var _defaultCallbackContainer = {
        // The callback function for format the HTML name of generated controls.
        nameFormatter: null,
        // The callback function to be triggered after all data loaded to grid.
        dataLoaded: null,
        // The callback function to be triggered after data loaded to a row.
        rowDataLoaded: null,
        // The callback function to be triggered after new row appended.
        afterRowAppended: null,
        // The callback function to be triggered after new row inserted.
        afterRowInserted: null,
        // The callback function to be triggered after grid row swapped.
        afterRowSwapped: null,
        // The callback function to be triggered before grid row remove.
        beforeRowRemove: null,
        // The callback function to be triggered after grid row removed.
        afterRowRemoved: null,
        // The callback function to be triggered after grid row dragged.
        afterRowDragged: null,
        // The callback function for generating sub panel content.
        subPanelBuilder: null,
        // The callback function for getting values from sub panel. Used for `getAllValue` method.
        subPanelGetter: null,
        // The callback function to be triggered when row(s) is/are adding to grid but the maximum number of rows allowed is reached.
        maxNumRowsReached: null
    };
    // Default column options.
    var _defaultColumnOptions = {
        // Type of column control.
        type: 'text',
        // Name of column.
        name: null,
        // Default value.
        value: null,
        // Display text on the header section.
        display: null,
        // Extra CSS setting to be added to display text.
        displayCss: null,
        // Tooltip for column head.
        displayTooltip: null,
        // The `colspan` setting on the column header.
        headerSpan: 1,
        // Extra CSS setting to be added to the control container table cell.
        cellCss: null,
        // Extra attributes to be added to the control.
        ctrlAttr: null,
        // Extra properties to be added to the control.
        ctrlProp: null,
        // Extra CSS to be added to the control.
        ctrlCss: null,
        // Extra name of class to be added to the control.
        ctrlClass: null,
        // The available option for building `select` type control.
        ctrlOptions: null,
        // Options for initalize jQuery UI widget.
        uiOption: null,
        // Options for initalize jQuery UI tooltip.
        uiTooltip: null,
        // Let column resizable by using jQuery UI Resizable Interaction.
        resizable: false,
        // Show or hide column after initialized.
        invisible: false,
        // The value to compare for indentify this column value is empty.
        emptyCriteria: null,
        // Callback function to build custom type control.
        customBuilder: null,
        // Callback function to get control value.
        customGetter: null,
        // Callback function to set control value.
        customSetter: null,
        // The `OnClick` event callback of control.
        onClick: null,
        // The `OnChange` event callback of control.
        onChange: null
    };
    var _systemMessages = {
        noColumnInfo: 'Cannot initial grid without column information!',
        elemNotTable: 'Cannot initial grid on element other than TABLE!',
        notInit: '`appendGrid` does not initialized',
        getValueMultiGrid: 'Cannot get values on multiple grid',
        notSupportMethod: 'Method is not supported by `appendGrid`: '
    };
    var _defaultTextResources = {
        append: 'Append Row',
        removeLast: 'Remove Last Row',
        insert: 'Insert Row Above',
        remove: 'Remove Current Row',
        moveUp: 'Move Up',
        moveDown: 'Move Down',
        rowDrag: 'Sort Row',
        rowEmpty: 'This Grid Is Empty'
    };
    var _defaultButtonClasses = { append: null, removeLast: null, insert: null, remove: null, moveUp: null, moveDown: null, rowDrag: null };
    var _defaultSectionClasses = { caption: null, header: null, body: null, subPanel: null, footer: null };
    var _defaultHideButtons = { append: false, removeLast: false, insert: false, remove: false, moveUp: false, moveDown: false };


    function makeCustomBottomButton(tbWhole, buttonCfg) {
        var exButton = $('<button/>').attr({ type: 'button', tabindex: -1 })
        .button(buttonCfg.uiButton).click({ tbWhole: tbWhole }, buttonCfg.click);
        if (buttonCfg.btnClass) exButton.addClass(buttonCfg.btnClass);
        if (buttonCfg.btnCss) exButton.css(buttonCfg.btnCss);
        if (buttonCfg.btnAttr) exButton.attr(buttonCfg.btnAttr);
        return exButton;
    }
    function makeCustomRowButton(tbWhole, buttonCfg, uniqueIndex) {
        var exButton = $('<button/>').val(uniqueIndex).attr({ type: 'button', tabindex: -1 })
        .button(buttonCfg.uiButton).click({ tbWhole: tbWhole, uniqueIndex: uniqueIndex }, function (evt) {
            var rowData = $(evt.data.tbWhole).plugin("lark.tabular").getRowValue(null, evt.data.uniqueIndex);
            buttonCfg.click(evt, evt.data.uniqueIndex, rowData);
        });
        if (buttonCfg.btnClass) exButton.addClass(buttonCfg.btnClass);
        if (buttonCfg.btnCss) exButton.css(buttonCfg.btnCss);
        if (buttonCfg.btnAttr) exButton.attr(buttonCfg.btnAttr);
        return exButton;
    }




    function findRowIndex(uniqueIndex, settings) {
        for (var z = 0; z < settings._rowOrder.length; z++) {
            if (settings._rowOrder[z] == uniqueIndex) {
                return z;
            }
        }
        return null;
    }
    function isEmpty(value) {
        return typeof (value) == 'undefined' || value == null;
    }
    function getObjValue(obj, key) {
        if (!isEmpty(obj) && langx.isPlainObject(obj) && !isEmpty(obj[key])) {
            return obj[key];
        }
        return null;
    }
    function getRowIndex(settings, uniqueIndex) {
        var rowIndex = null;
        for (var z = 0; z < settings._rowOrder.length; z++) {
            if (settings._rowOrder[z] == uniqueIndex) {
                return z;
            }
        }
        return rowIndex;
    }
    function getRowValue(settings, uniqueIndex, loopIndex) {
        var result = {}, keyName = null, suffix = (isEmpty(loopIndex) ? '' : '_' + loopIndex);
        for (var z = 0; z < settings.columns.length; z++) {
            keyName = settings.columns[z].name + suffix;
            result[keyName] = getCtrlValue(settings, z, uniqueIndex);
        }
        // Merge control values from sub panel if getter method defined
        if (settings.useSubPanel && langx.isFunction(settings.subPanelGetter)) {
            var adtData = settings.subPanelGetter(uniqueIndex);
            if (langx.isPlainObject(adtData)) {
                if (suffix == '') {
                    // Extend to row data directly for array mode
                    langx.extend(result, adtData);
                } else {
                    // For returning values in object mode, add suffix to all keys
                    var newData = {};
                    for (var key in adtData) {
                        newData[key + suffix] = adtData[key];
                    }
                    langx.extend(result, newData);
                }
            }
        }
        return result;
    }
    function getCtrlValue(settings, colIndex, uniqueIndex) {
        var type = settings.columns[colIndex].type, columnName = settings.columns[colIndex].name;
        if (type == 'custom') {
            if (langx.isFunction(settings.columns[colIndex].customGetter)) {
                return settings.columns[colIndex].customGetter(settings.idPrefix, columnName, uniqueIndex);
            } else {
                return null;
            }
        } else {
            var ctrl = getCellCtrl(type, settings.idPrefix, columnName, uniqueIndex);
            if (ctrl == null) {
                return null;
            }
            else if (type == 'checkbox') {
                return ctrl.checked ? 1 : 0;
            } else {
                return $(ctrl).val();
            }
        }
    }
    function getCellCtrl(type, idPrefix, columnName, uniqueIndex) {
        return document.getElementById(idPrefix + '_' + columnName + '_' + uniqueIndex);
    }
    function setCtrlValue(settings, colIndex, uniqueIndex, data) {
        var type = settings.columns[colIndex].type;
        var columnName = settings.columns[colIndex].name;
        // Handle values by type
        if (type == 'custom') {
            if (langx.isFunction(settings.columns[colIndex].customSetter)) {
                settings.columns[colIndex].customSetter(settings.idPrefix, columnName, uniqueIndex, data);
            } else {
                // `customSetter` is not a function?? Skip handling...
            }
        } else {
            var element = getCellCtrl(type, settings.idPrefix, columnName, uniqueIndex);
            if (type == 'checkbox') {
                element.checked = (data != null && data != 0);
            } else if (type == 'ui-selectmenu') {
                element.value = (data == null ? '' : data);
                $(element).selectmenu('refresh');
            }
            else {
                $(element).val(data == null ? '' : data);
            }
        }
    }


    function isRowEmpty(settings, rowIndex) {
        for (var z = 0; z < settings.columns.length; z++) {
            var uniqueIndex = settings._rowOrder[rowIndex];
            var currentValue = getCtrlValue(settings, z, uniqueIndex);
            // Check the empty criteria is function
            if (langx.isFunction(settings.columns[z].emptyCriteria)) {
                if (!settings.columns[z].emptyCriteria(currentValue)) {
                    return false;
                }
            } else {
                // Find the default value
                var defaultValue = null;
                if (!isEmpty(settings.columns[z].emptyCriteria)) {
                    defaultValue = settings.columns[z].emptyCriteria;
                } else {
                    // Check default value based on its type
                    if (settings.columns[z].type == 'checkbox') {
                        defaultValue = 0;
                    } else if (settings.columns[z].type == 'select' || settings.columns[z].type == 'ui-selectmenu') {
                        var options = getCellCtrl(settings.columns[z].type, settings.idPrefix, settings.columns[z].name, uniqueIndex).options;
                        if (options.length > 0) {
                            defaultValue = options[0].value;
                        } else {
                            defaultValue = '';
                        }
                    } else {
                        defaultValue = '';
                    }
                }
                // Compare with the default value
                if (currentValue != defaultValue) {
                    return false;
                }
            }
        }
        return true;
    }


    /*
    /// <summary>
    /// Initialize append grid or calling its methods.
    /// </summary>
    $.fn.appendGrid = function (params) {
        if (_methods[params]) {
            return _methods[params].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof (params) === 'object' || !params) {
            return _methods.init.apply(this, arguments);
        } else {
            alert(_systemMessages.notSupportMethod + params);
        }
    };
    */

    return Tabular ;
});

define('skylark-widgets-swt/TabStrip',[
    "skylark-langx/langx",
    "skylark-utils-dom/browser",
    "skylark-utils-dom/eventer",
    "skylark-utils-dom/noder",
    "skylark-utils-dom/geom",
    "skylark-utils-dom/query",
    "./swt",
    "./Widget",
    "skylark-bootstrap3/tab",
    "skylark-bootstrap3/dropdown"
], function(langx, browser, eventer, noder, geom,  $, swt, Widget) {

    var TabStrip = Widget.inherit({
        klassName : "TabStrip",
        pluginName : "lark.tabstrip",

        options : {
          selectors : {
            header : ".nav-tabs",
            tab : "[data-toggle=\"tab\"]",
            content : ".tab-content",
            tabpane : ".tab-pane"
          }
        },

        _init : function() {
          this.$header = this._velm.$(this.options.selectors.header); 
          this.$tabs = this.$header.find(this.options.selectors.tab);
          this.$content = this._velm.$(this.options.selectors.content);
          this.$tabpanes = this.$content.find(this.options.selectors.tabpane);

          this.$header.find('[data-toggle="dropdown"]').dropdown();

          var self = this;
          this.$tabs.each(function(idx,tabEl){
            $(tabEl).tab({
              target : self.$tabpanes[idx]
            });
          });

        },

        add : function() {
          //TODO
        },

        remove : function(){
          //TODO
        }
    });

    return swt.TabStrip = TabStrip;

});
define('skylark-widgets-swt/Toolbar',[
  "skylark-langx/langx",
  "skylark-utils-dom/query",
  "skylark-widgets-base/Widget"
],function(langx,$,Widget){ 



  var Toolbar = Widget.inherit({
    pluginName : "lark.toolbar",

    options : {
      toolbarFloat: true,
      toolbarHidden: false,
      toolbarFloatOffset: 0,
      template : '<div class="lark-toolbar"><ul></ul></div>',
      separator : {
        template :  '<li><span class="separator"></span></li>'
      }
    },

    _init : function() {
      var floatInitialized, initToolbarFloat, toolbarHeight;
      //this.editor = editor;

      //this.opts = langx.extend({}, this.opts, opts);
      this.opts = this.options;


      //if (!langx.isArray(this.opts.toolbar)) {
      //  this.opts.toolbar = ['bold', 'italic', 'underline', 'strikethrough', '|', 'ol', 'ul', 'blockquote', 'code', '|', 'link', 'image', '|', 'indent', 'outdent'];
      //}

      this.wrapper = $(this._elm);
      this.list = this.wrapper.find('ul');
      this.list.on('click', function(e) {
        return false;
      });
      this.wrapper.on('mousedown', (function(_this) {
        return function(e) {
          return _this.list.find('.menu-on').removeClass('.menu-on');
        };
      })(this));
      $(document).on('mousedown.toolbar', (function(_this) {
        return function(e) {
          return _this.list.find('.menu-on').removeClass('menu-on');
        };
      })(this));
      if (!this.opts.toolbarHidden && this.opts.toolbarFloat) {
        this.wrapper.css('top', this.opts.toolbarFloatOffset);
        toolbarHeight = 0;
        initToolbarFloat = (function(_this) {
          return function() {
            _this.wrapper.css('position', 'static');
            _this.wrapper.width('auto');
            _this.editor.editable.util.reflow(_this.wrapper);
            _this.wrapper.width(_this.wrapper.outerWidth());
            _this.wrapper.css('left', _this.editor.editable.util.os.mobile ? _this.wrapper.position().left : _this.wrapper.offset().left);
            _this.wrapper.css('position', '');
            toolbarHeight = _this.wrapper.outerHeight();
            _this.editor.placeholderEl.css('top', toolbarHeight);
            return true;
          };
        })(this);
        floatInitialized = null;

        /*
        $(window).on('resize.richeditor-' + this.editor.id, function(e) {
          return floatInitialized = initToolbarFloat();
        });
        $(window).on('scroll.richeditor-' + this.editor.id, (function(_this) {
          return function(e) {
            var bottomEdge, scrollTop, topEdge;
            if (!_this.wrapper.is(':visible')) {
              return;
            }
            topEdge = _this.editor.wrapper.offset().top;
            bottomEdge = topEdge + _this.editor.wrapper.outerHeight() - 80;
            scrollTop = $(document).scrollTop() + _this.opts.toolbarFloatOffset;
            if (scrollTop <= topEdge || scrollTop >= bottomEdge) {
              _this.editor.wrapper.removeClass('toolbar-floating').css('padding-top', '');
              if (_this.editor.editable.util.os.mobile) {
                return _this.wrapper.css('top', _this.opts.toolbarFloatOffset);
              }
            } else {
              floatInitialized || (floatInitialized = initToolbarFloat());
              _this.editor.wrapper.addClass('toolbar-floating').css('padding-top', toolbarHeight);
              if (_this.editor.editable.util.os.mobile) {
                return _this.wrapper.css('top', scrollTop - topEdge + _this.opts.toolbarFloatOffset);
              }
            }
          };
        })(this));
        */
      }

      /*
      this.editor.on('destroy', (function(_this) {
        return function() {
          return _this.buttons.length = 0;
        };
      })(this));
      */

      
    },

    addToolItem : function(itemWidget) {
      $(itemWidget._elm).appendTo(this.list);
      return this;
    },

    addSeparator : function() {
      $(this.options.separator.template).appendTo(this.list);
      return this;
    }

  });


  return Toolbar;

});
define('skylark-widgets-swt/Tree',[
  "skylark-langx/skylark",
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-utils-dom/plugins",
  "./swt",
  "./Widget"  
], function(skylark,langx,$,plugins,swt,Widget) {

  /*global jQuery, console*/

  'use strict';


  var _default = {};

  _default.settings = {

    injectStyle: true,

    levels: 2,

    expandIcon: 'glyphicon glyphicon-plus',
    collapseIcon: 'glyphicon glyphicon-minus',
    emptyIcon: 'glyphicon',
    nodeIcon: '',
    selectedIcon: '',
    checkedIcon: 'glyphicon glyphicon-check',
    uncheckedIcon: 'glyphicon glyphicon-unchecked',

    color: undefined, // '#000000',
    backColor: undefined, // '#FFFFFF',
    borderColor: undefined, // '#dddddd',
    onhoverColor: '#F5F5F5',
    selectedColor: '#FFFFFF',
    selectedBackColor: '#428bca',
    searchResultColor: '#D9534F',
    searchResultBackColor: undefined, //'#FFFFFF',

    enableLinks: false,
    highlightSelected: true,
    highlightSearchResults: true,
    showBorder: true,
    showIcon: true,
    showCheckbox: false,
    showTags: false,
    multiSelect: false,

    // Event handlers
    onNodeChecked: undefined,
    onNodeCollapsed: undefined,
    onNodeDisabled: undefined,
    onNodeEnabled: undefined,
    onNodeExpanded: undefined,
    onNodeSelected: undefined,
    onNodeUnchecked: undefined,
    onNodeUnselected: undefined,
    onSearchComplete: undefined,
    onSearchCleared: undefined
  };

  _default.options = {
    silent: false,
    ignoreChildren: false
  };

  _default.searchOptions = {
    ignoreCase: true, 
    exactMatch: false,
    revealResults: true
  };

  var Tree =  swt.Tree = Widget.inherit({
    klassName: "Tree",

    pluginName : "lark.tree",

    widgetClass : "lark-tree",

    options : {
      injectStyle: true,

      levels: 2,

      expandIcon: 'glyphicon glyphicon-plus',
      collapseIcon: 'glyphicon glyphicon-minus',
      emptyIcon: 'glyphicon',
      nodeIcon: '',
      selectedIcon: '',
      checkedIcon: 'glyphicon glyphicon-check',
      uncheckedIcon: 'glyphicon glyphicon-unchecked',

      color: undefined, // '#000000',
      backColor: undefined, // '#FFFFFF',
      borderColor: undefined, // '#dddddd',
      onhoverColor: '#F5F5F5',
      selectedColor: '#FFFFFF',
      selectedBackColor: '#428bca',
      searchResultColor: '#D9534F',
      searchResultBackColor: undefined, //'#FFFFFF',

      enableLinks: false,
      highlightSelected: true,
      highlightSearchResults: true,
      showBorder: true,
      showIcon: true,
      showCheckbox: false,
      showTags: false,
      multiSelect: false,

      // Event handlers
      onNodeChecked: undefined,
      onNodeCollapsed: undefined,
      onNodeDisabled: undefined,
      onNodeEnabled: undefined,
      onNodeExpanded: undefined,
      onNodeSelected: undefined,
      onNodeUnchecked: undefined,
      onNodeUnselected: undefined,
      onSearchComplete: undefined,
      onSearchCleared: undefined

    },   

    template : {
      list: '<ul class="list-group"></ul>',
      item: '<li class="list-group-item"></li>',
      indent: '<span class="indent"></span>',
      icon: '<span class="icon"></span>',
      link: '<a href="#" style="color:inherit;"></a>',
      badge: '<span class="badge"></span>'
    },

    css : '.Tree .list-group-item{cursor:pointer}.Tree span.indent{margin-left:10px;margin-right:10px}.Tree span.icon{width:12px;margin-right:5px}.Tree .node-disabled{color:silver;cursor:not-allowed}' ,

    _construct : function (element, options) {

      this.$element = $(element);
      this.elementId = element.id;
      this.styleId = this.elementId + '-style';

      this._init(options);
    },

    _init : function (options) {

      //var options = this.options

      this.tree = [];
      this.nodes = [];

      if (options.data) {
        if (typeof options.data === 'string') {
          options.data = JSON.parse(options.data);
        }
        this.tree = langx.extend(true, [], options.data);
        delete options.data;
      }
      //this.options = langx.extend({}, _default.settings, options);

      this.destroy();
      this.subscribeEvents();
      this.setInitialStates({ nodes: this.tree }, 0);
      this.render();
    },

    remove : function () {
      this.destroy();
      datax.removeData(this, this.pluginName);
      $('#' + this.styleId).remove();
    },

    destroy : function () {

      if (!this.initialized) return;

      this.$wrapper.remove();
      this.$wrapper = null;

      // Switch off events
      this.unsubscribeEvents();

      // Reset this.initialized flag
      this.initialized = false;
    },

    unsubscribeEvents : function () {

      this.$element.off('click');
      this.$element.off('nodeChecked');
      this.$element.off('nodeCollapsed');
      this.$element.off('nodeDisabled');
      this.$element.off('nodeEnabled');
      this.$element.off('nodeExpanded');
      this.$element.off('nodeSelected');
      this.$element.off('nodeUnchecked');
      this.$element.off('nodeUnselected');
      this.$element.off('searchComplete');
      this.$element.off('searchCleared');
    },

    subscribeEvents : function () {

      this.unsubscribeEvents();

      this.$element.on('click', langx.proxy(this.clickHandler, this));

      if (typeof (this.options.onNodeChecked) === 'function') {
        this.$element.on('nodeChecked', this.options.onNodeChecked);
      }

      if (typeof (this.options.onNodeCollapsed) === 'function') {
        this.$element.on('nodeCollapsed', this.options.onNodeCollapsed);
      }

      if (typeof (this.options.onNodeDisabled) === 'function') {
        this.$element.on('nodeDisabled', this.options.onNodeDisabled);
      }

      if (typeof (this.options.onNodeEnabled) === 'function') {
        this.$element.on('nodeEnabled', this.options.onNodeEnabled);
      }

      if (typeof (this.options.onNodeExpanded) === 'function') {
        this.$element.on('nodeExpanded', this.options.onNodeExpanded);
      }

      if (typeof (this.options.onNodeSelected) === 'function') {
        this.$element.on('nodeSelected', this.options.onNodeSelected);
      }

      if (typeof (this.options.onNodeUnchecked) === 'function') {
        this.$element.on('nodeUnchecked', this.options.onNodeUnchecked);
      }

      if (typeof (this.options.onNodeUnselected) === 'function') {
        this.$element.on('nodeUnselected', this.options.onNodeUnselected);
      }

      if (typeof (this.options.onSearchComplete) === 'function') {
        this.$element.on('searchComplete', this.options.onSearchComplete);
      }

      if (typeof (this.options.onSearchCleared) === 'function') {
        this.$element.on('searchCleared', this.options.onSearchCleared);
      }
    },

    /*
      Recurse the tree structure and ensure all nodes have
      valid initial states.  User defined states will be preserved.
      For performance we also take this opportunity to
      index nodes in a flattened structure
    */
    setInitialStates : function (node, level) {

      if (!node.nodes) return;
      level += 1;

      var parent = node;
      var _this = this;
      langx.each(node.nodes, function checkStates(index, node) {

        // nodeId : unique, incremental identifier
        node.nodeId = _this.nodes.length;

        // parentId : transversing up the tree
        node.parentId = parent.nodeId;

        // if not provided set selectable default value
        if (!node.hasOwnProperty('selectable')) {
          node.selectable = true;
        }

        // where provided we should preserve states
        node.state = node.state || {};

        // set checked state; unless set always false
        if (!node.state.hasOwnProperty('checked')) {
          node.state.checked = false;
        }

        // set enabled state; unless set always false
        if (!node.state.hasOwnProperty('disabled')) {
          node.state.disabled = false;
        }

        // set expanded state; if not provided based on levels
        if (!node.state.hasOwnProperty('expanded')) {
          if (!node.state.disabled &&
              (level < _this.options.levels) &&
              (node.nodes && node.nodes.length > 0)) {
            node.state.expanded = true;
          }
          else {
            node.state.expanded = false;
          }
        }

        // set selected state; unless set always false
        if (!node.state.hasOwnProperty('selected')) {
          node.state.selected = false;
        }

        // index nodes in a flattened structure for use later
        _this.nodes.push(node);

        // recurse child nodes and transverse the tree
        if (node.nodes) {
          _this.setInitialStates(node, level);
        }
      });
    },

    clickHandler : function (event) {

      if (!this.options.enableLinks) event.preventDefault();

      var target = $(event.target);
      var node = this.findNode(target);
      if (!node || node.state.disabled) return;
      
      var classList = target.attr('class') ? target.attr('class').split(' ') : [];
      if ((classList.indexOf('expand-icon') !== -1)) {

        this.toggleExpandedState(node, _default.options);
        this.render();
      }
      else if ((classList.indexOf('check-icon') !== -1)) {
        
        this.toggleCheckedState(node, _default.options);
        this.render();
      }
      else {
        
        if (node.selectable) {
          this.toggleSelectedState(node, _default.options);
        } else {
          this.toggleExpandedState(node, _default.options);
        }

        this.render();
      }
    },

    // Looks up the DOM for the closest parent list item to retrieve the
    // data attribute nodeid, which is used to lookup the node in the flattened structure.
    findNode : function (target) {

      var nodeId = target.closest('li.list-group-item').attr('data-nodeid');
      var node = this.nodes[nodeId];

      if (!node) {
        console.log('Error: node does not exist');
      }
      return node;
    },

    toggleExpandedState : function (node, options) {
      if (!node) return;
      this.setExpandedState(node, !node.state.expanded, options);
    },

    setExpandedState : function (node, state, options) {

      if (state === node.state.expanded) return;

      if (state && node.nodes) {

        // Expand a node
        node.state.expanded = true;
        if (!options.silent) {
          this.$element.trigger('nodeExpanded', langx.extend(true, {}, node));
        }
      }
      else if (!state) {

        // Collapse a node
        node.state.expanded = false;
        if (!options.silent) {
          this.$element.trigger('nodeCollapsed', langx.extend(true, {}, node));
        }

        // Collapse child nodes
        if (node.nodes && !options.ignoreChildren) {
          langx.each(node.nodes, langx.proxy(function (index, node) {
            this.setExpandedState(node, false, options);
          }, this));
        }
      }
    },

    toggleSelectedState : function (node, options) {
      if (!node) return;
      this.setSelectedState(node, !node.state.selected, options);
    },

    setSelectedState : function (node, state, options) {

      if (state === node.state.selected) return;

      if (state) {

        // If multiSelect false, unselect previously selected
        if (!this.options.multiSelect) {
          langx.each(this.findNodes('true', 'g', 'state.selected'), langx.proxy(function (index, node) {
            this.setSelectedState(node, false, options);
          }, this));
        }

        // Continue selecting node
        node.state.selected = true;
        if (!options.silent) {
          this.$element.trigger('nodeSelected', langx.extend(true, {}, node));
        }
      }
      else {

        // Unselect node
        node.state.selected = false;
        if (!options.silent) {
          this.$element.trigger('nodeUnselected', langx.extend(true, {}, node));
        }
      }
    },

    toggleCheckedState : function (node, options) {
      if (!node) return;
      this.setCheckedState(node, !node.state.checked, options);
    },

    setCheckedState : function (node, state, options) {

      if (state === node.state.checked) return;

      if (state) {

        // Check node
        node.state.checked = true;

        if (!options.silent) {
          this.$element.trigger('nodeChecked', langx.extend(true, {}, node));
        }
      }
      else {

        // Uncheck node
        node.state.checked = false;
        if (!options.silent) {
          this.$element.trigger('nodeUnchecked', langx.extend(true, {}, node));
        }
      }
    },

    setDisabledState : function (node, state, options) {

      if (state === node.state.disabled) return;

      if (state) {

        // Disable node
        node.state.disabled = true;

        // Disable all other states
        this.setExpandedState(node, false, options);
        this.setSelectedState(node, false, options);
        this.setCheckedState(node, false, options);

        if (!options.silent) {
          this.$element.trigger('nodeDisabled', langx.extend(true, {}, node));
        }
      }
      else {

        // Enabled node
        node.state.disabled = false;
        if (!options.silent) {
          this.$element.trigger('nodeEnabled', langx.extend(true, {}, node));
        }
      }
    },

    render : function () {

      if (!this.initialized) {

        // Setup first time only components
        this.$element.addClass(this.widgetClass);
        this.$wrapper = $(this.template.list);

        this.injectStyle();

        this.initialized = true;
      }

      this.$element.empty().append(this.$wrapper.empty());

      // Build tree
      this.buildTree(this.tree, 0);
    },

    // Starting from the root node, and recursing down the
    // structure we build the tree one node at a time
    buildTree : function (nodes, level) {

      if (!nodes) return;
      level += 1;

      var _this = this;
      langx.each(nodes, function addNodes(id, node) {

        var treeItem = $(_this.template.item)
          .addClass('node-' + _this.elementId)
          .addClass(node.state.checked ? 'node-checked' : '')
          .addClass(node.state.disabled ? 'node-disabled': '')
          .addClass(node.state.selected ? 'node-selected' : '')
          .addClass(node.searchResult ? 'search-result' : '') 
          .attr('data-nodeid', node.nodeId)
          .attr('style', _this.buildStyleOverride(node));

        // Add indent/spacer to mimic tree structure
        for (var i = 0; i < (level - 1); i++) {
          treeItem.append(_this.template.indent);
        }

        // Add expand, collapse or empty spacer icons
        var classList = [];
        if (node.nodes) {
          classList.push('expand-icon');
          if (node.state.expanded) {
            classList.push(_this.options.collapseIcon);
          }
          else {
            classList.push(_this.options.expandIcon);
          }
        }
        else {
          classList.push(_this.options.emptyIcon);
        }

        treeItem
          .append($(_this.template.icon)
            .addClass(classList.join(' '))
          );


        // Add node icon
        if (_this.options.showIcon) {
          
          var classList = ['node-icon'];

          classList.push(node.icon || _this.options.nodeIcon);
          if (node.state.selected) {
            classList.pop();
            classList.push(node.selectedIcon || _this.options.selectedIcon || 
                    node.icon || _this.options.nodeIcon);
          }

          treeItem
            .append($(_this.template.icon)
              .addClass(classList.join(' '))
            );
        }

        // Add check / unchecked icon
        if (_this.options.showCheckbox) {

          var classList = ['check-icon'];
          if (node.state.checked) {
            classList.push(_this.options.checkedIcon); 
          }
          else {
            classList.push(_this.options.uncheckedIcon);
          }

          treeItem
            .append($(_this.template.icon)
              .addClass(classList.join(' '))
            );
        }

        // Add text
        if (_this.options.enableLinks) {
          // Add hyperlink
          treeItem
            .append($(_this.template.link)
              .attr('href', node.href)
              .append(node.text)
            );
        }
        else {
          // otherwise just text
          treeItem
            .append(node.text);
        }

        // Add tags as badges
        if (_this.options.showTags && node.tags) {
          langx.each(node.tags, function addTag(id, tag) {
            treeItem
              .append($(_this.template.badge)
                .append(tag)
              );
          });
        }

        // Add item to the tree
        _this.$wrapper.append(treeItem);

        // Recursively add child ndoes
        if (node.nodes && node.state.expanded && !node.state.disabled) {
          return _this.buildTree(node.nodes, level);
        }
      });
    },

    // Define any node level style override for
    // 1. selectedNode
    // 2. node|data assigned color overrides
    buildStyleOverride : function (node) {

      if (node.state.disabled) return '';

      var color = node.color;
      var backColor = node.backColor;

      if (this.options.highlightSelected && node.state.selected) {
        if (this.options.selectedColor) {
          color = this.options.selectedColor;
        }
        if (this.options.selectedBackColor) {
          backColor = this.options.selectedBackColor;
        }
      }

      if (this.options.highlightSearchResults && node.searchResult && !node.state.disabled) {
        if (this.options.searchResultColor) {
          color = this.options.searchResultColor;
        }
        if (this.options.searchResultBackColor) {
          backColor = this.options.searchResultBackColor;
        }
      }

      return 'color:' + color +
        ';background-color:' + backColor + ';';
    },

    // Add inline style into head
    injectStyle : function () {

      if (this.options.injectStyle && !document.getElementById(this.styleId)) {
        $('<style type="text/css" id="' + this.styleId + '"> ' + this.buildStyle() + ' </style>').appendTo('head');
      }
    },

    // Construct trees style based on user options
    buildStyle : function () {

      var style = '.node-' + this.elementId + '{';

      if (this.options.color) {
        style += 'color:' + this.options.color + ';';
      }

      if (this.options.backColor) {
        style += 'background-color:' + this.options.backColor + ';';
      }

      if (!this.options.showBorder) {
        style += 'border:none;';
      }
      else if (this.options.borderColor) {
        style += 'border:1px solid ' + this.options.borderColor + ';';
      }
      style += '}';

      if (this.options.onhoverColor) {
        style += '.node-' + this.elementId + ':not(.node-disabled):hover{' +
          'background-color:' + this.options.onhoverColor + ';' +
        '}';
      }

      return this.css + style;
    },

    /**
      Returns a single node object that matches the given node id.
      @param {Number} nodeId - A node's unique identifier
      @return {Object} node - Matching node
    */
    getNode : function (nodeId) {
      return this.nodes[nodeId];
    },

    /**
      Returns the parent node of a given node, if valid otherwise returns undefined.
      @param {Object|Number} identifier - A valid node or node id
      @returns {Object} node - The parent node
    */
    getParent : function (identifier) {
      var node = this.identifyNode(identifier);
      return this.nodes[node.parentId];
    },

    /**
      Returns an array of sibling nodes for a given node, if valid otherwise returns undefined.
      @param {Object|Number} identifier - A valid node or node id
      @returns {Array} nodes - Sibling nodes
    */
    getSiblings : function (identifier) {
      var node = this.identifyNode(identifier);
      var parent = this.getParent(node);
      var nodes = parent ? parent.nodes : this.tree;
      return nodes.filter(function (obj) {
          return obj.nodeId !== node.nodeId;
        });
    },

    /**
      Returns an array of selected nodes.
      @returns {Array} nodes - Selected nodes
    */
    getSelected : function () {
      return this.findNodes('true', 'g', 'state.selected');
    },

    /**
      Returns an array of unselected nodes.
      @returns {Array} nodes - Unselected nodes
    */
    getUnselected : function () {
      return this.findNodes('false', 'g', 'state.selected');
    },

    /**
      Returns an array of expanded nodes.
      @returns {Array} nodes - Expanded nodes
    */
    getExpanded : function () {
      return this.findNodes('true', 'g', 'state.expanded');
    },

    /**
      Returns an array of collapsed nodes.
      @returns {Array} nodes - Collapsed nodes
    */
    getCollapsed : function () {
      return this.findNodes('false', 'g', 'state.expanded');
    },

    /**
      Returns an array of checked nodes.
      @returns {Array} nodes - Checked nodes
    */
    getChecked : function () {
      return this.findNodes('true', 'g', 'state.checked');
    },

    /**
      Returns an array of unchecked nodes.
      @returns {Array} nodes - Unchecked nodes
    */
    getUnchecked : function () {
      return this.findNodes('false', 'g', 'state.checked');
    },

    /**
      Returns an array of disabled nodes.
      @returns {Array} nodes - Disabled nodes
    */
    getDisabled : function () {
      return this.findNodes('true', 'g', 'state.disabled');
    },

    /**
      Returns an array of enabled nodes.
      @returns {Array} nodes - Enabled nodes
    */
    getEnabled : function () {
      return this.findNodes('false', 'g', 'state.disabled');
    },


    /**
      Set a node state to selected
      @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    selectNode : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setSelectedState(node, true, options);
      }, this));

      this.render();
    },

    /**
      Set a node state to unselected
      @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    unselectNode : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setSelectedState(node, false, options);
      }, this));

      this.render();
    },

    /**
      Toggles a node selected state; selecting if unselected, unselecting if selected.
      @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    toggleNodeSelected : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.toggleSelectedState(node, options);
      }, this));

      this.render();
    },


    /**
      Collapse all tree nodes
      @param {optional Object} options
    */
    collapseAll : function (options) {
      var identifiers = this.findNodes('true', 'g', 'state.expanded');
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setExpandedState(node, false, options);
      }, this));

      this.render();
    },

    /**
      Collapse a given tree node
      @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    collapseNode : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setExpandedState(node, false, options);
      }, this));

      this.render();
    },

    /**
      Expand all tree nodes
      @param {optional Object} options
    */
    expandAll : function (options) {
      options = langx.extend({}, _default.options, options);

      if (options && options.levels) {
        this.expandLevels(this.tree, options.levels, options);
      }
      else {
        var identifiers = this.findNodes('false', 'g', 'state.expanded');
        this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
          this.setExpandedState(node, true, options);
        }, this));
      }

      this.render();
    },

    /**
      Expand a given tree node
      @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    expandNode : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setExpandedState(node, true, options);
        if (node.nodes && (options && options.levels)) {
          this.expandLevels(node.nodes, options.levels-1, options);
        }
      }, this));

      this.render();
    },

    expandLevels : function (nodes, level, options) {
      options = langx.extend({}, _default.options, options);

      langx.each(nodes, langx.proxy(function (index, node) {
        this.setExpandedState(node, (level > 0) ? true : false, options);
        if (node.nodes) {
          this.expandLevels(node.nodes, level-1, options);
        }
      }, this));
    },

    /**
      Reveals a given tree node, expanding the tree from node to root.
      @param {Object|Number|Array} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    revealNode : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        var parentNode = this.getParent(node);
        while (parentNode) {
          this.setExpandedState(parentNode, true, options);
          parentNode = this.getParent(parentNode);
        }
      }, this));

      this.render();
    },

    /**
      Toggles a nodes expanded state; collapsing if expanded, expanding if collapsed.
      @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    toggleNodeExpanded : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.toggleExpandedState(node, options);
      }, this));
      
      this.render();
    },


    /**
      Check all tree nodes
      @param {optional Object} options
    */
    checkAll : function (options) {
      var identifiers = this.findNodes('false', 'g', 'state.checked');
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setCheckedState(node, true, options);
      }, this));

      this.render();
    },

    /**
      Check a given tree node
      @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    checkNode : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setCheckedState(node, true, options);
      }, this));

      this.render();
    },

    /**
      Uncheck all tree nodes
      @param {optional Object} options
    */
    uncheckAll : function (options) {
      var identifiers = this.findNodes('true', 'g', 'state.checked');
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setCheckedState(node, false, options);
      }, this));

      this.render();
    },

    /**
      Uncheck a given tree node
      @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    uncheckNode : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setCheckedState(node, false, options);
      }, this));

      this.render();
    },

    /**
      Toggles a nodes checked state; checking if unchecked, unchecking if checked.
      @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    toggleNodeChecked : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.toggleCheckedState(node, options);
      }, this));

      this.render();
    },


    /**
      Disable all tree nodes
      @param {optional Object} options
    */
    disableAll : function (options) {
      var identifiers = this.findNodes('false', 'g', 'state.disabled');
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setDisabledState(node, true, options);
      }, this));

      this.render();
    },

    /**
      Disable a given tree node
      @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    disableNode : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setDisabledState(node, true, options);
      }, this));

      this.render();
    },

    /**
      Enable all tree nodes
      @param {optional Object} options
    */
    enableAll : function (options) {
      var identifiers = this.findNodes('true', 'g', 'state.disabled');
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setDisabledState(node, false, options);
      }, this));

      this.render();
    },

    /**
      Enable a given tree node
      @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    enableNode : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setDisabledState(node, false, options);
      }, this));

      this.render();
    },

    /**
      Toggles a nodes disabled state; disabling is enabled, enabling if disabled.
      @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      @param {optional Object} options
    */
    toggleNodeDisabled : function (identifiers, options) {
      this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
        this.setDisabledState(node, !node.state.disabled, options);
      }, this));

      this.render();
    },


    /**
      Common code for processing multiple identifiers
    */
    forEachIdentifier : function (identifiers, options, callback) {

      options = langx.extend({}, _default.options, options);

      if (!(identifiers instanceof Array)) {
        identifiers = [identifiers];
      }

      langx.each(identifiers, langx.proxy(function (index, identifier) {
        callback(this.identifyNode(identifier), options);
      }, this));  
    },

    /*
      Identifies a node from either a node id or object
    */
    identifyNode : function (identifier) {
      return ((typeof identifier) === 'number') ?
              this.nodes[identifier] :
              identifier;
    },

    /**
      Searches the tree for nodes (text) that match given criteria
      @param {String} pattern - A given string to match against
      @param {optional Object} options - Search criteria options
      @return {Array} nodes - Matching nodes
    */
    search : function (pattern, options) {
      options = langx.extend({}, _default.searchOptions, options);

      this.clearSearch({ render: false });

      var results = [];
      if (pattern && pattern.length > 0) {

        if (options.exactMatch) {
          pattern = '^' + pattern + '$';
        }

        var modifier = 'g';
        if (options.ignoreCase) {
          modifier += 'i';
        }

        results = this.findNodes(pattern, modifier);

        // Add searchResult property to all matching nodes
        // This will be used to apply custom styles
        // and when identifying result to be cleared
        langx.each(results, function (index, node) {
          node.searchResult = true;
        })
      }

      // If revealResults, then render is triggered from revealNode
      // otherwise we just call render.
      if (options.revealResults) {
        this.revealNode(results);
      }
      else {
        this.render();
      }

      this.$element.trigger('searchComplete', langx.extend(true, {}, results));

      return results;
    },

    /**
      Clears previous search results
    */
    clearSearch : function (options) {

      options = langx.extend({}, { render: true }, options);

      var results = langx.each(this.findNodes('true', 'g', 'searchResult'), function (index, node) {
        node.searchResult = false;
      });

      if (options.render) {
        this.render();  
      }
      
      this.$element.trigger('searchCleared', langx.extend(true, {}, results));
    },

    /**
      Find nodes that match a given criteria
      @param {String} pattern - A given string to match against
      @param {optional String} modifier - Valid RegEx modifiers
      @param {optional String} attribute - Attribute to compare pattern against
      @return {Array} nodes - Nodes that match your criteria
    */
    findNodes : function (pattern, modifier, attribute) {

      modifier = modifier || 'g';
      attribute = attribute || 'text';

      var _this = this;
      return langx.grep(this.nodes, function (node) {
        var val = _this.getNodeValue(node, attribute);
        if (typeof val === 'string') {
          return val.match(new RegExp(pattern, modifier));
        }
      });
    },

    /**
      Recursive find for retrieving nested attributes values
      All values are return as strings, unless invalid
      @param {Object} obj - Typically a node, could be any object
      @param {String} attr - Identifies an object property using dot notation
      @return {String} value - Matching attributes string representation
    */
    getNodeValue : function (obj, attr) {
      var index = attr.indexOf('.');
      if (index > 0) {
        var _obj = obj[attr.substring(0, index)];
        var _attr = attr.substring(index + 1, attr.length);
        return this.getNodeValue(_obj, _attr);
      }
      else {
        if (obj.hasOwnProperty(attr)) {
          return obj[attr].toString();
        }
        else {
          return undefined;
        }
      }
    }
  });


  return Tree;
});
define('skylark-widgets-swt/main',[
    "./swt",
    "./Widget",
    "./Accordion",
    "./Button",
    "./Carousel",
    "./CheckBox",
    "./ComboBox",
    "./TextBox",
    "./ListGroup",
    "./Menu",
    "./Pagination",
    "./Progress",
    "./Radio",
    "./SearchBox",
    "./SelectList",
    "./Tabular",
    "./TabStrip",
    "./TextBox",
    "./Toolbar",
    "./Tree"
], function(swt) {
    return swt;
});
define('skylark-widgets-swt', ['skylark-widgets-swt/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-widgets-swt.js.map
