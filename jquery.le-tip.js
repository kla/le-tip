/* ===========================================================
 * bootstrap-tooltip.js v2.0.4
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function ($) {

  "use strict"; // jshint ;_;


 /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */

  var Tooltip = function (element, options) {
    this.init('tooltip', element, options)
  }

  Tooltip.prototype = {

    constructor: Tooltip

  , init: function (type, element, options) {
      var eventIn
        , eventOut

      this.type = type
      this.$element = $(element)
      this.options = this.getOptions(options)
      this.enabled = true

      if (this.options.trigger != 'manual') {
        eventIn  = this.options.trigger == 'hover' ? 'mouseenter' : 'focus'
        eventOut = this.options.trigger == 'hover' ? 'mouseleave' : 'blur'
        this.$element.on(eventIn, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut, this.options.selector, $.proxy(this.leave, this))
      }

      this.options.selector ?
        (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
        this.fixTitle()
    }

  , getOptions: function (options) {
      options = $.extend({}, $.fn[this.type].defaults, options, this.$element.data())

      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay
        , hide: options.delay
        }
      }

      return options
    }

  , enter: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      self.hoverState = 'in'
      this.timeout = clearTimeout(this.timeout)
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'in') self.show()
      }, self.options.delay.show)
    }

  , leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      self.hoverState = 'out'
      this.timeout = clearTimeout(this.timeout)
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'out') self.hide()
      }, self.options.delay.hide)
    }

  , show: function () {
      var $tip, pos, placement, tp

      if (this.hasContent() && this.enabled) {
        this.hideEverything()
        $tip = this.tip()
        this.setContent()

        if (this.options.animation) {
          $tip.addClass('fade')
        }

        $tip
          .remove()
          .css({ top: 0, left: 0, display: 'block' })
          .appendTo(document.body)

        placement = this.determineAutoPlacement()
        tp = this.getPlacementPosition(placement)

        $tip
          .css({ left: tp.left, top: tp.top })
          .addClass(placement)
          .addClass('in')
      }
    }

  , isHTML: function(text) {
      // html string detection logic adapted from jQuery
      return typeof text != 'string'
        || ( text.charAt(0) === "<"
          && text.charAt( text.length - 1 ) === ">"
          && text.length >= 3
        ) || /^(?:[^<]*<[\w\W]+>[^>]*$)/.exec(text)
    }

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()

      $tip.find('.tooltip-content')[this.isHTML(title) ? 'html' : 'text'](title)
      $tip.removeClass('fade in top bottom left right')
    }

  , hide: function () {
      var that = this
        , $tip = this.tip()

      $tip.removeClass('in')

      function removeWithAnimation() {
        var timeout = setTimeout(function () {
          $tip.off($.support.transition.end).remove()
        }, 500)

        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout)
          $tip.remove()
        })
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation() :
        $tip.remove()
    }

  , hideEverything: function() {
    $.each($('.tooltip'), function() { $(this).data('tooltip').hide() })
  }

  , fixTitle: function () {
      var $e = this.$element
      if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').removeAttr('title')
      }
    }

  , hasContent: function () {
      return this.getTitle()
    }

  , insideViewport: function(placement) {
      var position = this.getPlacementPosition(placement)
        , viewport = {
            top: $(window).scrollTop(),
            left: $(window).scrollLeft(),
            bottom: $(window).scrollTop() + $(window).outerHeight(),
            right: $(window).scrollLeft() + $(window).outerWidth()
          }
        , inside =
            position.left >= viewport.left && position.left <= viewport.right &&
            position.right >= viewport.left && position.right <= viewport.right &&
            position.top >= viewport.top && position.top <= viewport.bottom &&
            position.bottom >= viewport.top && position.bottom <= viewport.bottom
      return inside
    }

  , determineAutoPlacement: function() {
      var placements = ['top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left']
        , defaultPlacement = 'top'

      if (typeof this.options.placement == 'function')
        return this.options.placement.call(this, $tip[0], this.$element[0])

      if (!/auto/.test(this.options.placement))
        return this.options.placement

      if (/auto /.test(this.options.placement))
        placements.splice(0, 0, defaultPlacement = this.options.placement.split(/ +/)[1])

      for (var i=0; i<placements.length; ++i) {
        if (this.insideViewport(placements[i]))
          return placements[i]
      }
      return defaultPlacement
    }

  , getPosition: function () {
      return $.extend({}, this.$element.offset(), {
        width: this.$element[0].offsetWidth
      , height: this.$element[0].offsetHeight
      })
    }

  , getPlacementPosition: function(placement) {
      var pos = this.getPosition()
        , $tip = this.tip()
        , actualWidth = $tip[0].offsetWidth
        , actualHeight = $tip[0].offsetHeight
        , coords
        , nudge = 20

      switch (placement) {
        case 'bottom':
          coords = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
          break
        case 'bottom-left':
          coords = {top: pos.top + pos.height, left: pos.left - actualWidth + nudge}
          break
        case 'bottom-right':
          coords = {top: pos.top + pos.height, left: pos.left + pos.width - nudge}
          break
        case 'top':
          coords = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
          break
        case 'top-left':
          coords = {top: pos.top - actualHeight, left: pos.left - actualWidth + nudge}
          break
        case 'top-right':
          coords = {top: pos.top - actualHeight, left: pos.left + pos.width - nudge}
          break
        case 'left':
          coords = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
          break
        case 'right':
          coords = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
          break
      }
      return $.extend({}, coords, {right: coords.left + actualWidth, bottom: coords.top + actualHeight})
    }

  , getTitle: function () {
      var title
        , $e = this.$element
        , o = this.options

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

      return title
    }

  , tip: function () {
      if (!this.$tip) {
        this.$tip = $(this.options.template)
        if (this.options.cssClass) this.$tip.addClass(this.options.cssClass)
      }
      this.$tip.data('tooltip', this)
      return this.$tip
    }

  , validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide()
        this.$element = null
        this.options = null
      }
    }

  , enable: function () {
      this.enabled = true
    }

  , disable: function () {
      this.enabled = false
    }

  , toggleEnabled: function () {
      this.enabled = !this.enabled
    }

  , toggle: function () {
      this[this.tip().hasClass('in') ? 'hide' : 'show']()
    }

  }


 /* TOOLTIP PLUGIN DEFINITION
  * ========================= */

  $.fn.tooltip = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tooltip')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip

  $.fn.tooltip.defaults = {
    animation: true
  , placement: 'auto'
  , selector: false
  , cssClass: null
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"><div class="tooltip-content"></div></div></div>'
  , trigger: 'hover'
  , title: ''
  , delay: 0
  }

  $(document)
    .on('keyup', function(e) {
      var tooltip
      if (e.keyCode == 27 && (tooltip = $('.tooltip').data('tooltip')))
        tooltip.hide()
    })
    .on('click', function(e) {
      var tooltip = $('.tooltip')
      if (tooltip && (tooltip = tooltip.data('tooltip')) && $(e.target).parents('.tooltip').length <= 0) {
        if (tooltip.$element[0] != e.target)
          tooltip.hide()
      }
    })
    .on('mouseenter', '.tooltip', function(e) {
      $(this).data('tooltip').enter(e)
    })
    .on('mouseleave', '.tooltip', function(e) {
      $(this).data('tooltip').leave(e)
    })

}(window.jQuery);