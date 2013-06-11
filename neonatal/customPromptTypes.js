// Team Neonatal Assist
// This file contains our custom prompt types, used in our app.
// They extend prompt types that come with ODK Survey. For each prompt
// type, we have included a class comment which describes the usage of
// that prompt.
define(['database', 'promptTypes','jquery','underscore', 'prompts'],
  function(database, promptTypes, $,       _) {
    customs = {};  // Dictionary which is returned after it is filled
                   // with custom types.
    /* The image_slider prompt type defines a list of images which display
     * on a single page vertically. One image at a time can be selected -- by
     * a single tap -- and the name of the image which is selected is stored
     * in the database under the name for the image_slider. By "name" we refer
     * to the "name" column in an ODK data sheet. The images are set in the
     * ODK spreadsheet as "choices", refer to documentation on the ODK provided
     * select type.
     */
    customs["image_slider"] = promptTypes.select.extend({
      events: {
        "tap .slider-option": "changeSliderOption",
      },
      // Handles database update when image is selected.
      changeSliderOption: function(evt) {
        var checked = $(evt.currentTarget);
        checked.siblings('.slider-option').removeClass('checked');  // Styling
        checked.addClass("checked");  // Styling
        var ctxt = controller.newContext(evt);
        var name = checked.attr('value');  // Get name of image selected
        this.setValue(ctxt, name);  // Update DB
      },
      // Standard postactivate method
      postActivate: function(ctxt) {
        var that = this;
        var newctxt = $.extend({}, ctxt, {success: function(outcome) {
          ctxt.append("prompts." + that.type + ".postActivate." + outcome,
          "px: " + that.promptIdx);
          ctxt.success();
        }});
        that.renderContext.choices = _.map(that.form.choices[that.param], _.clone);
        newctxt.success("image_slider success");
      },
      // Check database to see if this slider has already been used and highlight
      // previous selection.
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
    /* The menu prompt type provides a list of options, when an option is selected
     * the user is brought to the "next" screen. The next screen is defined by ODK's
     * navigation system, which searches the spreadsheet linearlly, beginning at the 
     * current prompt until finding one whose condition column evaluates to true.
     * To define the options, use the choices sheet, like a select prompt type.
     * To ensure the use goes to the right page, set conditions on the pages
     * which evaluate to true based on which menu item was selected.
     */
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
      // Update menu items to reflect which has been selected.
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
      // Updates database with which menu item has been selected.
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
    /* The ballard exam is very specific to our app. It consists of menu which 
     * has special properties. Those properties are that the specific menu items
     * are highlighted if they have been visited and completed previously. Also,
     * the score corresponding to the image which the user selected is disaplayed 
     * next to the menu item. There is a clear button which clears the databse of all
     * data pertaining to the ballard exam. Finally, if the user completes the whole
     * ballard exam a total score is displayed at the top of the page.
     */
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
      // Clears scores from database and rerenders to give feedback to user.
      clearBallardExam: function(evt) {
        var ctxt = controller.newContext(evt);
        var that = this;  // So we can reference the whole widget from within
                          // deeper contexts
        $.extend({}, ctxt, {
          scores: ['posture', 'square', 'arm', 'popliteal', 'scarf', 'heel',
          'skin', 'lanugo', 'plantar', 'breast', 'eye_ear', 'genitals'],
          count: 0,
          success: function() {
            if (this.count < this.scores.length) {  // Recursive case.
            // We lookup the count'th score and render the string as it appears in the database.
            // e.g. this.scores[0] + '_menu' == "posture_menu", which is a row in our database.
            // We set the value of that row to null. The recursion is not evident, it comes from the
            // fact that once the database has finished its update it calls the success function of the
            // ctxt passed into it. The success function happens to be the one we are currently defining.
            // So this success function and databse.setData are mutually recursive, with success defining
            // the base case.
              database.setData(this, this.scores[this.count++] + '_menu', null);
            } else {  // Base case: we have already cleared the last one so rerender
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
      // Colors and inserts scores for the menu items if they have been completed.
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
      // Gets score for menu item from database
      _getScore: function(menu) {
        var score = database.getDataValue(menu + '_menu');
        if (score != null) {
          return parseInt(score.split(menu)[1]);
        }
      },
      // Adds score and color to a single menu item
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
    return customs;  // The dictionary we have built up.
  });
