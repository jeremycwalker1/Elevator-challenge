var LiftPanel = (function () {
  function LiftPanel(stories) {
    this.stories = stories.map(function (fl) {
      return fl.toString();
    });
    this.travelTime = 1300;
    this.currentIndex = 0;
    this.queue = [];
    this.callbacks = [];

    this.lift = {
      motion: 0,
      currentstory: this.stories[0]
    };
  }

  LiftPanel.prototype.addCallback = function (callback) {
    this.callbacks.push(callback);
    return this;
  };

  LiftPanel.prototype.removeCallback = function (callback) {
    for (var i = this.callbacks.length - 1; i >= 0; i--) {
      if (this.callbacks[i] === callback) {
        this.callbacks.splice(i, 1);
      }
    }
    return this;
  };

  LiftPanel.prototype.refresh = function () {
    fireEvent(this, "story");
    return this;
  };

  LiftPanel.prototype.press = function (story) {
    var index = this.stories.indexOf(story.toString());
    if (index < 0) return;

    this.queue.push(index);
    react(this);
    return this;
  };

  function react(ctrl) {
    if (ctrl.queue.length == 0) return;

    if (ctrl.currentIndex == ctrl.queue[0]) {
      ctrl.lift.motion = 0;
      ctrl.queue.shift();
      fireEvent(ctrl, "arrived");
      window.clearInterval(ctrl.interval);
      ctrl.interval = null;
    }

    if (ctrl.queue.length == 0) return;

    if (ctrl.lift.motion) {
      ctrl.lift.currentstory =
        ctrl.stories[(ctrl.currentIndex += ctrl.lift.motion)];
      fireEvent(ctrl, "story");
      return;
    }

    if (ctrl.currentIndex < ctrl.queue[0]) {
      ctrl.lift.motion = +1;
      fireEvent(ctrl, "up");
    } else if (ctrl.currentIndex > ctrl.queue[0]) {
      ctrl.lift.motion = -1;
      fireEvent(ctrl, "down");
    }
    if (!ctrl.interval) {
      ctrl.interval = window.setInterval(function () {
        react(ctrl);
      }, ctrl.travelTime);
    }
  }

  function fireEvent(ctrl, event) {
    for (var i = 0; i < ctrl.callbacks.length; i++) {
      ctrl.callbacks[i](ctrl.lift, event);
    }
  }

  return LiftPanel;
})();

var lift = new LiftPanel([1, 2, 3, 4, 5, 6]);
lift
  .addCallback(function debugReporting(ctrl, event) {
    console.log(event + " at " + ctrl.currentstory);
  })
  .addCallback(function buttonPanelCallback(ctrl, event) {
    if (event === "arrived") {
      $('button[value="' + ctrl.currentstory + '"].lit').removeClass("lit");
    }
  })
  .addCallback(function arrowLightCallback(ctrl, event) {
    if (event === "up") {
      $("#up-indicator").addClass("lit");
    } else if (event === "down") {
      $("#down-indicator").addClass("lit");
    } else if (event === "arrived") {
      $("#up-indicator").add("#down-indicator").removeClass("lit");
    }
  })
  .addCallback(function storyNumberCallback(ctrl, event) {
    if (event === "story") {
      $("#story-number").text(ctrl.currentstory);
    }
  });

$(function init() {
  $(".panel button").click(function () {
    $(this).addClass("lit");
    lift.press($(this).val());
  });
  lift.refresh();
});
