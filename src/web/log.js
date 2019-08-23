export class ContentArea {
  constructor() {
    /** @type {Number} */
    this.width = Number;
    /** @type {Number} */
    this.top = Number;
    /** @type {Number} */
    this.height = Number;
    /** @type {Number} */
    this.left = Number;
  }
}

export class Settings {
  constructor() {
    /** @type {Number} */
    this.duration = Number;     // seconds? loolks like ms
    /** @type {Number} */
    this.contentWidth = Number; // int
    /** @type {Number} */
    this.contentLeft = Number;  // int
    /** @type {Number} */
    this.fontSize = Number;

    // new
    /** @type {Number} */
    this.wordSpacing = Number;
    /** @type {String} */
    this.foreground = String;
    /** @type {String} */
    this.background = String;
    /** @type {String} */
    this.cursor = String;
    /** @type {Number} */
    this.letterSpacing = Number;
    /** @type {Number} */
    this.lineHeight = Number;
  }
}

export class Bounds {
  constructor() {
    /** @type {Number} */
    this.width = Number;
    /** @type {Number} */
    this.top = Number;
    /** @type {Number} */
    this.height = Number;
    /** @type {Number} */
    this.left = Number;
  }
}

export class Clickable {
  constructor() {
    /** @type {Number} */
    this.index = Number;        // int
    /** @type {Boolean} */
    this.clicked = Boolean;
    /** @type {Bounds} */
    this.bounds = Bounds;
  }
}

export class TestEvent {
  constructor() {
    /** @type {Date} */
    this.timestamp = Date;
    /** @type {String} */
    this.type = String;
  }
}

export class TestEventBuild extends TestEvent {
  constructor() {
    super();

    this.type = 'building';

    /** @type {String} */
    this.test = String;
  }
}

export class TestEventClicked extends TestEvent {
  constructor() {
    super();

    this.type = 'clicked';

    /** @type {Number} */
    this.index = Number;
  }
}

export class TestEventScroll extends TestEvent {
  constructor() {
    super();

    this.type = 'scroll';

    /** @type {Number} */
    this.position = Number;
  }
}

export class TestEventVeroNav extends TestEvent {
  constructor() {
    super();

    this.type = 'veroNavigation';

    /** @type {String} */
    this.target = String;
  }
}

export class TestEventVeroNavData extends TestEvent {
  constructor() {
    super();

    this.type = 'veroNavigationData';

    /** @type {String} */
    this.variable = String;
    /** @type {String} */
    this.value = String;
  }
}

export class TestEventVeroUI extends TestEvent {
  constructor() {
    super();

    this.type = 'uiAdjustment';

    /** @type {String} */
    this.enable = String;
    /** @type {String} */
    this.target = String;
  }
}

export class Vector3 {
  constructor() {
    /** @type {Number} */
    this.x = Number;
    /** @type {Number} */
    this.y = Number;
    /** @type {Number} */
    this.z = Number;
  }
}

export class Vector3Ordered {
  constructor() {
    /** @type {String} */
    this._order = String;
    /** @type {Number} */
    this._x = Number;
    /** @type {Number} */
    this._y = Number;
    /** @type {Number} */
    this._z = Number;
  }
}

export class HeadData {
  constructor() {
    /** @type {Date} */
    this.timestamp = Date;
    /** @type {Vector3} */
    this.pos = Vector3;
    /** @type {Vector3Ordered} */
    this.euler = Vector3Ordered;
  }
}

export class HeadTotal {
  constructor() {
    /** @type {Number} */
    this.total = Number;
    /** @type {Number} */
    this.perSecond = Number;
    /** @type {String} */
    this.unit = String;
    /** @type {String} */
    this.label = String;
  }
}

export class HeadTotals {
  constructor() {
    /** @type {HeadTotal} */
    this.roll = HeadTotal;
    /** @type {HeadTotal} */
    this.pitch = HeadTotal;
    /** @type {HeadTotal} */
    this.heading = HeadTotal;
    /** @type {HeadTotal} */
    this.movement = HeadTotal;
  }
}

export class WrongAndCorrect {
  constructor() {
    /** @type {Number} */
    this.wrong = Number;
    /** @type {Number} */
    this.correct = Number;
  }
}

export class Schema {
  constructor() {
    /** @type {ContentArea} */
    this.contentArea = ContentArea;
    /** @type {Number} */
    this.windowWidth = Number;  // int
    /** @type {Number} */
    this.windowHeight = Number; // int
    /** @type {Number} */
    this.scrolls = Number;      // int
    /** @type {Settings} */
    this.settings = Settings;
    //** @type {Number[]} */
    //this.hitsPerTenth = [ Number ];     // int, 10 values
    /** @type {WrongAndCorrect[] & number[]} */
    this.hitsPerTenth = [ Number, WrongAndCorrect ];     // 10 values
    /** @type {Clickable[]} */
    this.clickables = [ Clickable ];
    /** @type {Number} */
    this.maxHistPerTenth = Number;      // int
    /** @type {Number[]} */
    this.marked = [ Number ];           // int
    /** @type {Number} */
    this.misses = Number;               // int
    /** @type {String} */
    this.instruction = String;
    /** @type {Number} */
    this.docHeight = Number;
    /** @type {Date} */
    this.startTime = Date;
    /** @type {Number} */
    this.marks = Number;                // int
    /** @type {Number} */
    this.duration = Number;             // TimeSpan
    /** @type {String} */
    this.resultWord = String;           // ['sanaa', 'kakkosta', 'numeroa']
    /** @type {Date} */
    this.endTime = Date;
    /** @type {Number} */
    this.maxScroll = Number;
    /** @type {TestEvent[]} */
    this.events = [
      TestEvent,
      TestEventBuild,
      TestEventClicked,
      TestEventScroll,
      TestEventVeroNav,
      TestEventVeroNavData,
      TestEventVeroUI,
    ];
    /** @type {HeadData[]} */
    this.headData = [ HeadData ];
    /** @type {HeadTotals} */
    this.headTotals = HeadTotals;

    // new
    /** @type {String} */
    this.participantCode = String;
    /** @type {Number} */
    this.marksWrong = Number;
    /** @type {Number} */
    this.lastMarked = Number;
    /** @type {Number[]} */
    this.markedWrong = [Number];
  }
}
