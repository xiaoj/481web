//*** Added my own own image_slider ***//
// This is currently a 'select_one', it is designed to select
// one and only one image.
// In order to test image_slider, go to chrome dev tools,
// hit settings (in the lower right), hit overrides and click
// "emulate touch events". Then refresh the app, keeping chrome dev tools OPEN.
// You must do this each new chrome window you open.
// the confirm button will always be disabled unless an image
// is selected
define(['database', 'promptTypes','jquery','underscore', 'prompts'],
  function(database, promptTypes, $,       _) {
    customs = {};
    customs["image_slider"] = promptTypes.select.extend({
      events: {
        "tap .slider-option": "changeSliderOption",
        "dblclick .slider-option": "changeSliderOption",
      },
      changeSliderOption: function(evt) {
        var checked = $(evt.currentTarget);
        checked.siblings('.slider-option').removeClass('checked');
        checked.addClass("checked");
        var ctxt = controller.newContext(evt);
        var name = checked.attr('value');
        this.setValue($.extend({}, ctxt, {
          success: function() {
            //controller.gotoPreviousScreen(ctxt);
          }
        }), name);
      },
      postActivate: function(ctxt) {
        var that = this;
        var newctxt = $.extend({}, ctxt, {success: function(outcome) {
          ctxt.append("prompts." + that.type + ".postActivate." + outcome,
          "px: " + that.promptIdx);
          //that.updateRenderValue(that.parseSaveValue(that.getValue()));
          ctxt.success({enableForwardNavigation: false});
        }});
        that.renderContext.choices = _.map(that.form.choices[that.param], _.clone);
        newctxt.success("image_slider success");
      },
      renderContext: {
        "enableForwardNavigation": false,
        "enableBackNavigation": false
      },
      setSavedValue: function() {
        // get saved value from database
        // if not null highlight appropriate option
        var value = this.getValue();
        if (value != null) {
          var option = $(".slider-option[value='" + value +"']");
          option.addClass("checked");
          this.activateConfirmBtn();
        }
      },
      afterRender : function() {
        window.mySwipe = Swipe(document.getElementById('slider'));
        $.event.special.tap.tapholdThreshold = 400;
        this.setSavedValue();
      },
      templatePath: "templates/image_slider.handlebars"
    });
    customs["menu"] = promptTypes.select_one.extend({
      events: {
        "change input": "modification",
        "change select": "modification",
        //Only needed for child views
        "click .deselect": "deselect",
        "click .grid-select-item": "selectGridItem",
        //"click .ui-radio": "selectItem",
        "taphold .ui-radio": "deselect"
      },
      selectItem: function(evt) {
        var $target = $(evt.target).closest('.ui-radio');
        var $input = $target.find('input');
        $input.prop("checked", function(index, oldPropertyValue) {
          if( oldPropertyValue ) {
            $input.prop("checked", false);
            $input.change();
          } else {
            $input.prop("checked", true);
            $input.change();
          }
        });
      },
      postActivate: function(ctxt) {
        var that = this;
        var newctxt = $.extend({}, ctxt, {success: function(outcome) {
          ctxt.append("prompts." + that.type + ".postActivate." + outcome,
          "px: " + that.promptIdx);
          that.updateRenderValue(false);  // call with false to 'forget' previous selection
          ctxt.success({enableForwardNavigation: false, enableBackNavigation: true});
        }});
        that.renderContext.passiveError = null;
        that.renderContext.choices = _.map(that.form.choices[that.param], _.clone);
        that.setValue(newctxt, null);
      },
      modification: function(evt) {
        var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".modification", "px: " + this.promptIdx);
        var that = this;
        if(this.withOther) {
          //This hack is needed to prevent rerendering
          //causing the other input to loose focus when clicked.
          if( $(evt.target).val() === 'other' &&
          $(evt.target).prop('checked') &&
          //The next two lines determine if the checkbox was already checked.
          this.renderContext.other &&
          this.renderContext.other.checked) {
            return;
          }
        }
        if(this.appearance === 'grid') {
          //Make selection more reponsive by providing visual feedback before
          //the template is re-rendered.
          this.$('.grid-select-item.ui-bar-e').removeClass('ui-bar-e').addClass('ui-bar-c');
          this.$('input:checked').closest('.grid-select-item').addClass('ui-bar-e');
        }
        var formValue = (this.$('form').serializeArray());
        this.setValue($.extend({}, ctxt, {
          success: function() {
            that.updateRenderValue(formValue);
            that.render();
            controller.gotoNextScreen(ctxt);
          }
        }), this.generateSaveValue(formValue));
      }
    });
    customs["ballard"] = customs["menu"].extend({
      templatePath: "../neonatal/templates/ballard_exam.handlebars",
      events: {
        "change input": "modification",
        "change select": "modification",
        //Only needed for child views
        "click .deselect": "deselect",
        "click .grid-select-item": "selectGridItem",
        "taphold .ui-radio": "deselect",
        "click .clear-ballard": "clearBallardExam",
      },
      clearBallardExam: function(evt) {
        var ctxt = controller.newContext(evt);
        var that = this;
        $.extend({}, ctxt, {
          scores: ['posture', 'square', 'arm', 'popliteal', 'scarf', 'heel',
          'skin', 'lanugo', 'plantar', 'breast', 'eye_ear', 'genitals'],
          count: 0,
          success: function() {
            if (this.count < this.scores.length) {
              database.setData(this, this.scores[this.count++] + '_menu', null);
            } else {  // we have already cleared the last one so rerender
              that._populateAndColorScores();
            }
          }
        }).success();
      },
      postActivate: function(ctxt) {
        var that = this;
        var newctxt = $.extend({}, ctxt, {success: function(outcome) {
          ctxt.append("prompts." + that.type + ".postActivate." + outcome,
          "px: " + that.promptIdx);
          that.updateRenderValue(false);  // call with false to 'forget' previous selection
          ctxt.success({enableForwardNavigation: false, enableBackNavigation: true});
        }});
        that.renderContext.passiveError = null;
        that.renderContext.choices = _.map(that.form.choices[that.param], _.clone);
        that.setValue(newctxt, null);
      },
      afterRender: function() {
        this._populateAndColorScores();
      },
      _populateAndColorScores: function() {
        var posture_score = this._getScore('posture');
        var square_score = this._getScore('square');
        var arm_score = this._getScore('arm');
        var popliteal_score = this._getScore('popliteal');
        var scarf_score = this._getScore('scarf');
        var heel_score = this._getScore('heel');

        var nm_score = posture_score + square_score + arm_score + popliteal_score +
          scarf_score + heel_score;  // okay if undefined

        var skin_score = this._getScore('skin');
        var lanugo_score = this._getScore('lanugo');
        var plantar_score = this._getScore('plantar');
        var breast_score = this._getScore('breast');
        var eye_ear_score = this._getScore('eye_ear');
        var genitals_score = this._getScore('genitals');

        var physical_score = skin_score + lanugo_score + plantar_score + breast_score +
          eye_ear_score + genitals_score;  // okay if undefined

        this._populateAndColorScore('posture', posture_score);
        this._populateAndColorScore('square', square_score);
        this._populateAndColorScore('arm', arm_score);
        this._populateAndColorScore('popliteal', popliteal_score);
        this._populateAndColorScore('scarf', scarf_score);
        this._populateAndColorScore('heel', heel_score);
        this._populateAndColorScore('skin', skin_score);
        this._populateAndColorScore('lanugo', lanugo_score);
        this._populateAndColorScore('plantar', plantar_score);
        this._populateAndColorScore('breast', breast_score);
        this._populateAndColorScore('eye_ear', eye_ear_score);
        this._populateAndColorScore('genitals', genitals_score);

        this._populateAndColorScore('nm', nm_score);
        this._populateAndColorScore('physical', physical_score);

        var total_score = nm_score + physical_score;
        this.$el.find('#total-score').html(total_score);
        if (!isNaN(total_score)) {
          this.$el.find('#complete-exam').hide();
          this.$el.find('#total-score-title').show();
        } else {
          this.$el.find('#complete-exam').show();
          this.$el.find('#total-score-title').hide();
        }
        this._populateAndColorScore('total', nm_score + physical_score);
      },
      _getScore: function(menu) {
        var score = database.getDataValue(menu + '_menu');
        if (score != null) {
          return parseInt(score.split(menu)[1]);
        }
      },
      _populateAndColorScore: function(menu, score) {
        var button = this.$el.find('input#' + menu).parents('label');
        if (button.length == 0) {  // During construction of the page the input element
          // gets moved around
          button = this.$el.find('input#' + menu).siblings('label');
        }
        if (score != null && !isNaN(score)) {
          button.find('.ballard-score').html(score);
          button.addClass('bg-completed');
        } else {
          button.find('.ballard-score').html('');
          button.removeClass('bg-completed');
        }
      }
    });
    return customs;
  });
