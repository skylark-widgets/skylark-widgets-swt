/**
 * skylark-widgets-swt - The skylark widget framework and standard widgets
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-swt/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-utils-dom/query","skylark-widgets-base/Widget"],function(t,o,r){var i=r.inherit({options:{toolbar:!0,toolbarFloat:!0,toolbarHidden:!1,toolbarFloatOffset:0,template:'<div class="richeditor-toolbar"><ul></ul></div>',separator:{template:'<li><span class="separator"></span></li>'}},_construct:function(t,o){this.editor=t,r.prototype._construct.call(this,o)},_init:function(t,r){var i,e,s,n;(this.opts=this.options,this.opts.toolbar)&&(this._render(),this.list.on("click",function(t){return!1}),this.wrapper.on("mousedown",(n=this,function(t){return n.list.find(".menu-on").removeClass(".menu-on")})),o(document).on("mousedown.richeditor"+this.editor.id,function(t){return function(o){return t.list.find(".menu-on").removeClass(".menu-on")}}(this)),!this.opts.toolbarHidden&&this.opts.toolbarFloat&&(this.wrapper.css("top",this.opts.toolbarFloatOffset),s=0,e=function(t){return function(){return t.wrapper.css("position","static"),t.wrapper.width("auto"),t.editor.editable.util.reflow(t.wrapper),t.wrapper.width(t.wrapper.outerWidth()),t.wrapper.css("left",t.editor.editable.util.os.mobile?t.wrapper.position().left:t.wrapper.offset().left),t.wrapper.css("position",""),s=t.wrapper.outerHeight(),t.editor.placeholderEl.css("top",s),!0}}(this),i=null,o(window).on("resize.richeditor-"+this.editor.id,function(t){return i=e()}),o(window).on("scroll.richeditor-"+this.editor.id,function(t){return function(r){var n,a,l;if(t.wrapper.is(":visible"))if(n=(l=t.editor.wrapper.offset().top)+t.editor.wrapper.outerHeight()-80,(a=o(document).scrollTop()+t.opts.toolbarFloatOffset)<=l||a>=n){if(t.editor.wrapper.removeClass("toolbar-floating").css("padding-top",""),t.editor.editable.util.os.mobile)return t.wrapper.css("top",t.opts.toolbarFloatOffset)}else if(i||(i=e()),t.editor.wrapper.addClass("toolbar-floating").css("padding-top",s),t.editor.editable.util.os.mobile)return t.wrapper.css("top",a-l+t.opts.toolbarFloatOffset)}}(this))),this.editor.on("destroy",function(t){return function(){return t.buttons.length=0}}(this)),o(document).on("mousedown.richeditor-"+this.editor.id,function(t){return function(o){return t.list.find("li.menu-on").removeClass("menu-on")}}(this)))}});return i.pluginName="Toolbar",i.prototype._tpl={wrapper:'<div class="richeditor-toolbar"><ul></ul></div>',separator:'<li><span class="separator"></span></li>'},i.prototype._render=function(){var t,r,i,e;for(this.buttons=[],this.wrapper=o(this._elm).prependTo(this.editor.wrapper),this.list=this.wrapper.find("ul"),t=0,r=(e=this.opts.toolbar).length;t<r;t++)if("|"!==(i=e[t])){if(!this.constructor.buttons[i])throw new Error("richeditor: invalid toolbar button "+i);this.buttons.push(new this.constructor.buttons[i]({toolbar:this,editor:this.editor}))}else o(this.options.separator.template).appendTo(this.list);if(this.opts.toolbarHidden)return this.wrapper.hide()},i.prototype.findButton=function(t){var o;return null!=(o=this.list.find(".toolbar-item-"+t).data("button"))?o:null},i.addButton=function(t){return this.buttons[t.prototype.name]=t},i.buttons={},i});
//# sourceMappingURL=sourcemaps/Toolbar.js.map
