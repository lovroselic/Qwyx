"use strict";
//console.clear();
/////////////////////////////////////////////////
/*
  
 to do:

 known bugs: 

 */
////////////////////////////////////////////////////
var MapDict = {
  void: 0,
  border: 1,
  path: 2,
  oldBorder: 4,
  blue: 8,
  brown: 16
};
var INI = {
  GRID_SIZE: 3,
  SIZE: (243 + 1) * 3,
  OFF_X: 9,
  OFF_Y: 9,
  SPRITE_SIZE: 13,
  SLOW: 1,
  FAST: 3,
  MOVE_GRIDS: 3,
  PATH_COLOR: "#FFF",
  PATH: 2,
  MAX: 242 * 242,
  LEVEL_SCORE: 10000,
  SPARX_RESPAWN: 90,
  MIN_SPARX_RESPAWN: 10,
  FUSE_START_TIMEOUT: 2000,
  MIN_FUSE_START_TIMEOUT: 200,
  MAX_LINE: 40,
  MIN_LINE: 4,
  MAX_LINE_CHANGE: 5,
  MIN_TURN: 10,
  MAX_TURN: 60
};
var PRG = {
  VERSION: "1.00",
  CSS: "color: #0F0",
  NAME: "QWYX",
  YEAR: 2020,
  INIT: function () {
    console.log("%c****************************", PRG.CSS);
    console.log(
      `%c${PRG.NAME} ${PRG.VERSION} by Lovro Selic, (c) C00lSch00l ${PRG.YEAR} on ˘${navigator.userAgent}`,
      PRG.CSS
    );
    $("#title").html(PRG.NAME);
    $("#version").html(
      `${PRG.NAME} V${PRG.VERSION} <span style='font-size:14px'>&copy</span> C00lSch00l ${PRG.YEAR}`
    );
    $("input#toggleAbout").val("About " + PRG.NAME);
    $("#about fieldset legend").append(" " + PRG.NAME + " ");

    ENGINE.autostart = true;
    ENGINE.start = PRG.start;
    ENGINE.readyCall = GAME.setup;
    ENGINE.init();

    ENGINE.setGridSize(INI.GRID_SIZE);
    ENGINE.setSpriteSheetSize(INI.SPRITE_SIZE);
  },
  setup: function () {
    $("#toggleHelp").click(function () {
      $("#help").toggle(400);
    });
    $("#toggleAbout").click(function () {
      $("#about").toggle(400);
    });
  },
  start: function () {
    console.log(`%c${PRG.NAME} started.`, PRG.CSS);
    $(ENGINE.topCanvas).off("mousemove", ENGINE.mouseOver);
    $(ENGINE.topCanvas).off("click", ENGINE.mouseClick);
    $(ENGINE.topCanvas).css("cursor", "");

    //add boxes
    console.log("%cAdding boxes, setting ENGINE ....", PRG.CSS);
    var disableKeys = ["enter", "space"];
    for (let key in disableKeys) ENGINE.disableKey(key);

    ENGINE.gameWIDTH = INI.SIZE + 2 * INI.OFF_X;
    ENGINE.gameHEIGHT = INI.SIZE + 2 * INI.OFF_Y;

    GAME.PAINT.OFFSET = new Vector(INI.OFF_X, INI.OFF_Y);

    INI.GRIDS = INI.SIZE / INI.GRID_SIZE;
    ENGINE.titleHEIGHT = 48;
    ENGINE.titleWIDTH = ENGINE.gameWIDTH;
    ENGINE.bottomHEIGHT = 40;
    ENGINE.bottomWIDTH = ENGINE.gameWIDTH;
    ENGINE.scoreWIDTH = ENGINE.gameWIDTH;
    ENGINE.scoreHEIGHT = 64;

    ENGINE.checkProximity = false;
    ENGINE.checkIntersection = false;
    ENGINE.setCollisionsafe(INI.SPRITE_SIZE);

    $("#bottom").css(
      "margin-top",
      ENGINE.gameHEIGHT +
        ENGINE.titleHEIGHT +
        ENGINE.bottomHEIGHT +
        ENGINE.scoreHEIGHT
    );

    $(ENGINE.gameWindowId).width(ENGINE.gameWIDTH + 4);

    ENGINE.addBOX(
      "TITLE",
      ENGINE.titleWIDTH,
      ENGINE.titleHEIGHT,
      ["title"],
      null
    );
    ENGINE.addBOX(
      "SCORE",
      ENGINE.scoreWIDTH,
      ENGINE.scoreHEIGHT,
      ["score_back", "score", "hiscore"],
      null
    );
    ENGINE.addBOX(
      "ROOM",
      ENGINE.gameWIDTH,
      ENGINE.gameHEIGHT,
      [
        "background",
        "line",
        "qwyx",
        "animation",
        "actors",
        "explosion",
        "text",
        "button",
        "click"
      ],
      null
    );

    ENGINE.addBOX(
      "DOWN",
      ENGINE.bottomWIDTH,
      ENGINE.bottomHEIGHT,
      ["bottom", "bottomText"],
      null
    );

    QWYX.startPositions.push(
      new QGrid(
        Math.floor(INI.SIZE / 6),
        Math.floor(INI.SIZE / 6),
        new Angle(0),
        Math.round((INI.MAX_LINE + INI.MIN_LINE) / 2),
        new Color(0, 255, 0)
      )
    );
    QWYX.startPositions.push(
      new QGrid(
        Math.floor(INI.SIZE / 6),
        Math.floor(INI.SIZE / 9),
        new Angle(0),
        Math.round((INI.MAX_LINE + INI.MIN_LINE) / 2),
        new Color(0, 0, 255)
      )
    );
    GAME.titleScreen();
  }
};
class Sparx {
  constructor(dir, gridArray) {
    let start = new Grid(Math.floor(INI.GRIDS / 2) + 1, 0);
    this.MoveState = new MoveState(start);
    this.MoveState.linkGridArray(gridArray);
    this.actor = new ACTOR("Sparx", 0, 0, "linear", ASSET.Sparx);
    this.speed = INI.FAST;
    GRID.gridToSprite(start, this.actor);
    this.MoveState.next(dir);
    this.lastDir = dir;
    this.cw = dir.x;
    this.live = true;
    this.type = "sparx";
  }
  static initPair(gridArray) {
    let choices = [LEFT, RIGHT];
    for (const choice of choices) {
      ENEMY.POOL.push(new Sparx(choice, gridArray));
    }
  }
  draw() {
    if (this.live) {
      ENGINE.spriteDraw(
        "actors",
        this.actor.x,
        this.actor.y,
        this.actor.sprite(),
        GAME.PAINT.OFFSET
      );
    }
  }
  move() {
    if (this.live) {
      let hit = ENGINE.collision(this.actor, HERO.actor);
      if (hit) {
        let dist = this.MoveState.homeGrid.distanceDiagonal(
          HERO.MoveState.homeGrid
        );
        if (dist < 2) {
          this.live = false;
          HERO.die();
        }
      }
      if (this.MoveState.moving) {
        GRID.translateMove(this, MAP);
      } else {
        let dir;
        let sign = 1;
        let directions = MAP.getDirections(
          this.MoveState.endGrid,
          MapDict.border,
          this.lastDir.mirror()
        );

        if (directions.length === 0) {
          directions = MAP.getDirections(
            this.MoveState.endGrid,
            MapDict.oldBorder,
            this.lastDir.mirror()
          );
          sign = -1;
        }
        if (directions.length === 1) {
          dir = directions[0];
          return this.setNext(dir);
        } else {
          if (sign === 1) {
            let options;
            let idx = this.lastDir.isInAt(directions);
            let cont = null;
            let turn = null;
            if (idx !== -1) {
              cont = directions[idx];
            }
            idx = this.lastDir.isInAt(ENGINE.dirCircle);

            if (directions.length === 3) sign = -1;
            idx =
              (idx - this.cw * sign + ENGINE.dirCircle.length) %
              ENGINE.dirCircle.length;
            let turningDir = ENGINE.dirCircle[idx];
            let tryTurn = turningDir.isInAt(directions);
            if (tryTurn !== -1) {
              turn = directions[tryTurn];
            }

            options = [turn, cont];
            while (true) {
              dir = options.splice(0, 1)[0];
              if (dir !== null) break;
            }
            return this.setNext(dir);
          } else {
            let path = MAP.findPathByValue(
              this.MoveState.endGrid,
              MapDict.oldBorder,
              MapDict.border,
              this.lastDir
            );
            if (path.stack.length === 0){
              console.error("path stack of length 0!");
              return;
            }
            return this.setNext(path.stack[0]);
          }
        }
      }
    }
  }
  setNext(dir) {
    this.MoveState.next(dir);
    this.lastDir = dir;
  }
}
var ENEMY = {
  manage: function () {
    QWYX.collision();
    ENEMY.move();
  },
  move: function () {
    FUSE.move();
    for (const enemy of ENEMY.POOL) {
      enemy.move();
    }
  },
  draw: function () {
    ENGINE.layersToClear.add("actors");
    FUSE.draw();
    for (const enemy of ENEMY.POOL) {
      enemy.draw();
    }
  },
  POOL: [],
  removeSparx: function () {
    let EPL = ENEMY.POOL.length - 1;
    for (let i = EPL; i >= 0; i--) {
      if (ENEMY.POOL[i].type === "sparx") {
        ENEMY.POOL.splice(i, 1);
      }
    }
  }
};
var FUSE = {
  construct() {
    FUSE.MoveState = new MoveState(new Grid(0, 0));
    FUSE.actor = new ACTOR("Fuse", 0, 0, "linear", ASSET.Fuse);
    FUSE.speed = INI.FAST;
    FUSE.end();
  },
  end() {
    FUSE.live = false;
    FUSE.active = false;
    FUSE.wait = true;
    FUSE.position = 0;
  },
  start() {
    FUSE.position = 0;
    FUSE.live = true;
    FUSE.active = true;
    FUSE.wait = true;
    FUSE.MoveState.reset(GAME.path[0]);
    GRID.gridToSprite(GAME.path[0], FUSE.actor);
  },
  nextMove() {
    if (!FUSE.active) return;
    let dir = GAME.path[FUSE.position].direction(GAME.path[FUSE.position + 1]);
    FUSE.MoveState.next(dir);
    FUSE.position++;
  },
  move() {
    if (!FUSE.live) return;
    if (FUSE.wait) return;
    if (FUSE.MoveState.moving) {
      GRID.translateMove(FUSE, MAP);
      AUDIO.Fuse.play();
    } else if (FUSE.active) {
      FUSE.nextMove();
    }
    GAME.PAINT.gridOnLine(FUSE.MoveState.homeGrid, "#666");
    let hit = GRID.spriteToSpriteCollision(HERO, FUSE);
    if (hit) {
      HERO.die();
    }
  },
  draw() {
    if (!FUSE.live) return;
    if (!FUSE.active) return;
    ENGINE.spriteDraw(
      "actors",
      FUSE.actor.x,
      FUSE.actor.y,
      FUSE.actor.sprite(),
      GAME.PAINT.OFFSET
    );
  }
};
var LevelTable = {
  N_Qwyx(level) {
    if (level < 4) {
      return 1;
    } else return 2;
  },
  N_lines(level) {
    return 6 + level;
  },
  maxSpeed(level) {
    return 4 + level;
  },
  maxLine(level) {
    return INI.MAX_LINE + (level - 1) * 2;
  },
  sparxRespawnRate(level) {
    return Math.max(
      INI.MIN_SPARX_RESPAWN,
      INI.SPARX_RESPAWN - (level - 1) * 15
    );
  },
  fuseStartTimeout(level) {
    return Math.max(
      INI.MIN_FUSE_START_TIMEOUT,
      INI.FUSE_START_TIMEOUT - (level - 1) * 500
    );
  }
};
class QGrid {
  constructor(x, y, a, lineLength = null, color = null) {
    this.x = x;
    this.y = y;
    this.a = a;
    this.lineLength = lineLength;
    this.color = color;
    this.line = this.createLine();
  }
  toGrid() {
    return new Grid(this.x, this.y);
  }
  createLine() {
    let A1 = Math.radians(this.a.rotateCCW(90));
    let x1 = Math.round(this.x + (this.lineLength / 2) * Math.sin(A1));
    let y1 = Math.round(this.y + (this.lineLength / 2) * Math.cos(A1));
    let A2 = Math.radians(this.a.rotateCW(90));
    let x2 = Math.round(this.x + (this.lineLength / 2) * Math.sin(A2));
    let y2 = Math.round(this.y + (this.lineLength / 2) * Math.cos(A2));

    let T1 = new Grid(x1, y1);
    let T2 = new Grid(x2, y2);
    let test = [T1, T2];
    for (let [i, T] of test.entries()) {
      test[i].x = Math.max(T.x, 1);
      test[i].y = Math.max(T.y, 1);
      test[i].x = Math.min(T.x, INI.GRIDS - 2);
      test[i].y = Math.min(T.y, INI.GRIDS - 2);
    }

    if (MAP !== null) {
      for (let [i, T] of test.entries()) {
        let path = GRID.raycasting(new Grid(this.x, this.y), T);
        test[i] = MAP.followPathUntil(path, MapDict.void);
      }
    }

    ({ x: x1, y: y1 } = test[0]);
    ({ x: x2, y: y2 } = test[1]);
    return new Line(x1, y1, x2, y2);
  }
}
class Color {
  constructor(r, g, b) {
    this.R = r;
    this.G = g;
    this.B = b;
  }
  color() {
    return `rgb(${this.R}, ${this.G}, ${this.B})`;
  }
  next() {
    const options = ["R", "G", "B"];
    let c = options.chooseRandom();
    let next = new Color(this.R, this.G, this.B);
    next[c] = RND(0, 255);
    return next;
  }
  static random() {
    return new Color(RND(0, 255), RND(0, 255), RND(0, 255)).color();
  }
}
class Line {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
  draw(CTX, offset = GAME.PAINT.OFFSET) {
    const size = ENGINE.INI.GRIDPIX;
    CTX.beginPath();
    CTX.moveTo(offset.x + this.x1 * size + 1, offset.y + this.y1 * size + 1);
    CTX.lineTo(offset.x + this.x2 * size + 1, offset.y + this.y2 * size + 1);
    CTX.stroke();
  }
}
class Qwyx {
  constructor(qgrid) {
    this.qgrid = qgrid;
    this.N = QWYX.numberOfLines;
    this.maxSpeed = QWYX.maxSpeed;
    this.maxLine = QWYX.maxLine;
    this.lines = [];
    this.speed = 1;
    this.add(qgrid);
    this.type = "qwyx";
  }
  first() {
    return this.lines[0];
  }
  add(qgrid) {
    this.lines.splice(0, 0, qgrid);
    if (this.lines.length > this.N) {
      this.lines.length = this.N;
    }
    this.grid = this.lines[0].toGrid();
  }
  move() {
    let bounced = false;
    let first = this.first();
    let newDir = first.a.rotate(
      [1, 0, 0, -1].chooseRandom() * RND(INI.MIN_TURN, INI.MAX_TURN)
    );
    let x2 = Math.round(
      first.x + this.speed * Math.sin(Math.radians(newDir.angle))
    );
    let y2 = Math.round(
      first.y + this.speed * Math.cos(Math.radians(newDir.angle))
    );

    if (x2 < 1) {
      x2 = 1;
      newDir = newDir.bounce(270);
      bounced = true;
    } else if (x2 > MAP.width - 2) {
      x2 = MAP.width - 2;
      newDir = newDir.bounce(90);
      bounced = true;
    }
    if (y2 < 1) {
      y2 = 1;
      newDir = newDir.bounce(0);
      bounced = true;
    } else if (y2 > MAP.width - 2) {
      y2 = MAP.height - 2;
      newDir = newDir.bounce(180);
      bounced = true;
    }

    let innerTest = new Grid(x2, y2);
    let path = GRID.raycasting(new Grid(first.x, first.y), innerTest);
    let onBorder = null;
    let i = 1;

    do {
      if (
        !MAP.value(path[i], MapDict.void) &&
        !MAP.value(path[i], MapDict.path)
      ) {
        onBorder = path[i];
        bounced = true;
        break;
      }
      i++;
    } while (i < path.length);

    x2 = path[i - 1].x;
    y2 = path[i - 1].y;

    if (bounced && onBorder !== null) {
      let faceArray = [onBorder];
      for (let D of ENGINE.directions) {
        let grid = onBorder.add(D);
        if (MAP.value(grid, MapDict.border)) {
          faceArray.push(grid);
        }
      }
      let axis = checkX(faceArray);
      let last = new Grid(x2, y2);
      let position = pos(last, onBorder, axis);

      let face;
      if (axis === "x") {
        face = 90;
      } else face = 0;
      face += position * 180;
      newDir = newDir.bounce(face);
    }

    let color = first.color.next();
    let lineL =
      first.lineLength + [1, -1].chooseRandom() * RND(1, INI.MAX_LINE_CHANGE);
    lineL = Math.max(lineL, INI.MIN_LINE);
    lineL = Math.min(lineL, this.maxLine);

    const next = new QGrid(x2, y2, newDir, lineL, color);
    this.add(next);
    if (bounced) {
      this.speed = this.maxSpeed;
    } else {
      this.speed = this.speed + [1, -1, -1, -1, 0, 0].chooseRandom();
      this.speed = Math.max(this.speed, 1);
      this.speed = Math.min(this.speed, this.maxSpeed);
    }

    function checkX(faceArray) {
      for (let q = 0; q < faceArray.length - 1; q++) {
        if (faceArray[q].x !== faceArray[q + 1].x) {
          return "y";
        }
      }
      return "x";
    }
    function pos(last, onBorder, axis) {
      if (
        (last[axis] > onBorder[axis] && axis === "x") ||
        (last[axis] < onBorder[axis] && axis === "y")
      ) {
        return 1;
      } else return 0;
    }
  }
  draw() {
    ENGINE.layersToClear.add("qwyx");
    const CTX = LAYER.qwyx;
    const size = ENGINE.INI.GRIDPIX;

    for (const Q of this.lines) {
      CTX.strokeStyle = Q.color.color();
      Q.line.draw(CTX);
    }
  }
  collision() {
    let hit = false;
    for (const [i, L] of this.lines.entries()) {
      let path = GRID.raycasting(
        new Grid(L.line.x1, L.line.y1),
        new Grid(L.line.x2, L.line.y2)
      );
      for (const p of path) {
        if (MAP.value(p, MapDict.path)) {
          this.drawBubble(p);
          hit = true;
        }
      }
    }
    for (let i = 0; i < this.lines.length - 1; i++) {
      let path = GRID.raycasting(
        new Grid(this.lines[i].x, this.lines[i].y),
        new Grid(this.lines[i + 1].x, this.lines[i + 1].y)
      );
      for (const p of path) {
        if (MAP.value(p, MapDict.path)) {
          this.drawBubble(p);
          hit = true;
        }
      }
    }
    return hit;
  }
  drawBubble(grid) {
    let CTX = LAYER.text;
    CTX.strokeStyle = Color.random();
    CTX.beginPath();
    let x =
      GAME.PAINT.OFFSET.x +
      grid.x * ENGINE.INI.GRIDPIX +
      Math.round(ENGINE.INI.GRIDPIX / 2);
    let y =
      GAME.PAINT.OFFSET.y +
      grid.y * ENGINE.INI.GRIDPIX +
      Math.round(ENGINE.INI.GRIDPIX / 2);
    CTX.arc(x, y, RND(7, 20), 0, Math.PI * 2);
    CTX.closePath();
    CTX.stroke();
  }
}
var QWYX = {
  numberOfLines: null,
  POOL: [],
  startPositions: [],
  titleInit(center) {
    ENEMY.POOL.clear();
    QWYX.POOL.clear();
    QWYX.numberOfQwyx = 4;
    QWYX.numberOfLines = 13;
    QWYX.maxSpeed = LevelTable.maxSpeed(1);
    QWYX.maxLine = LevelTable.maxLine(1);
    for (let i = 0; i < QWYX.numberOfQwyx; i++) {
      QWYX.POOL.push(
        new Qwyx(
          new QGrid(
            center.x,
            center.y,
            new Angle([0, 90, 180, 270].chooseRandom()),
            RND(INI.MIN_LINE, INI.MAX_LINE),
            new Color(RND(0, 255), RND(0, 255), RND(0, 255))
          )
        )
      );
    }
    ENEMY.POOL = ENEMY.POOL.concat(QWYX.POOL);
  },
  firstInit() {
    ENEMY.POOL.clear();
    QWYX.POOL.clear();
    let N = LevelTable.N_Qwyx(GAME.level);
    QWYX.numberOfQwyx = N;
    QWYX.numberOfLines = LevelTable.N_lines(GAME.level);
    QWYX.maxSpeed = LevelTable.maxSpeed(GAME.level);
    QWYX.maxLine = LevelTable.maxLine(GAME.level);
    QWYX.sparxRespawnRate = LevelTable.sparxRespawnRate(GAME.level);
    QWYX.fuseStartTimeout = LevelTable.fuseStartTimeout(GAME.level);

    for (let i = 0; i < N; i++) {
      QWYX.POOL.push(new Qwyx(QWYX.startPositions[i]));
    }
    this.setPrimaryReference();
    ENEMY.POOL = ENEMY.POOL.concat(QWYX.POOL);
  },
  setPrimaryReference() {
    this.primary = this.POOL[0];
  },
  primary: null,
  collision() {
    for (const Q of QWYX.POOL) {
      if (Q.collision()) {
        HERO.die();
      }
    }
  }
};
var HERO = {
  construct: function () {
    HERO.startLocation = new Grid(Math.floor(INI.GRIDS / 2) + 1, INI.GRIDS - 1);
    HERO.MoveState = new MoveState(HERO.startLocation);
    HERO.actor = new ACTOR("Styx", 0, 0, "linear", ASSET.Styx);
    HERO.speed = INI.FAST;
    GRID.gridToSprite(HERO.startLocation, HERO.actor);
    HERO.makingLine = false;
    HERO.connected = false;
  },
  firstInit: function () {
    HERO.construct();
  },
  init: function () {},
  draw: function () {
    ENGINE.layersToClear.add("actors");
    ENGINE.spriteDraw(
      "actors",
      HERO.actor.x,
      HERO.actor.y,
      HERO.actor.sprite(),
      GAME.PAINT.OFFSET
    );
  },
  move: function (dir) {
    if (HERO.dead) return;
    if (HERO.MoveState.moving) {
      GRID.translateMove(HERO, MAP, false, HeroOnFinish, false);
    }
    if (HERO.makingLine) {
      if (!GRID.same(GAME.path.last(), HERO.MoveState.homeGrid)) {
        GAME.path.push(HERO.MoveState.homeGrid);
      }
      GAME.PAINT.gridOnLine(HERO.MoveState.homeGrid, INI.PATH_COLOR);
      MAP.set(HERO.MoveState.homeGrid, MapDict.path);
    }

    function HeroOnFinish() {
      if (HERO.connected) {
        HERO.connect();
      }
    }
  },
  connect: function () {
    if (!GRID.same(GAME.path.last(), HERO.MoveState.endGrid)) {
      GAME.path.push(HERO.MoveState.endGrid);
    }
    HERO.makingLine = false;
    HERO.connected = false;
    FUSE.end();
    let T = GAME.path[1];
    let splitPoints = [];
    for (let D = 0; D < ENGINE.directions.length; D++) {
      let newGrid = T.add(ENGINE.directions[D]);
      if (MAP.value(newGrid, 0)) {
        splitPoints.push(newGrid);
      }
    }
    let TP = splitPoints.removeRandom();
    let FF_point;
    let TBP;

    MAP.setValue(GAME.path[1], MapDict.void);
    let check = MAP.findPath_AStar_fast(QWYX.primary.grid, GAME.path[1]);
    let result = GRID.same(TP, check[GAME.path[1].x][GAME.path[1].y].prev);
    let secondQwyx = null;
    if (QWYX.numberOfQwyx > 1) {
      secondQwyx = MAP.findPath_AStar_fast(QWYX.POOL[1].grid, GAME.path[1]);
    }
    MAP.setValue(GAME.path[1], MapDict.path);

    if (result) {
      FF_point = splitPoints[0];
      TBP = TP;
    } else {
      FF_point = TP;
      TBP = splitPoints[0];
    }

    let split = false;
    if (QWYX.numberOfQwyx > 1) {
      split = GRID.same(
        FF_point,
        secondQwyx[GAME.path[1].x][GAME.path[1].y].prev
      );
    }

    if (!split) {
      let dir = GAME.path[0].direction(GAME.path[1]);
      TBP = TBP.add(dir.mirror());
      if (!MAP.value(TBP, 1)) {
        TBP = GAME.path[0].add(dir.mirror());
      }
      let fillCol;
      if (HERO.speed === INI.SLOW) {
        fillCol = MapDict.brown;
      } else fillCol = MapDict.blue;
      let filled = MAP.floodFill(FF_point, fillCol);

      MAP.setValue(TBP, MapDict.void);
      MAP.setStackValue([GAME.path[0], GAME.path.last()], MapDict.border);
      let connection = MAP.findAllNodesOnPath(GAME.path[0], GAME.path.last(), [
        MapDict.border
      ]);
      MAP.setValue(TBP, MapDict.border);
      connection = MAP.xFilterNodes(connection, MapDict.void);
      MAP.setStackValue(connection, MapDict.oldBorder);

      let scoreAddition = filled / INI.MAX;
      GAME.area += scoreAddition;
      let factor = 1;
      if (HERO.speed === INI.SLOW) factor = 2;
      GAME.score +=
        Math.floor(scoreAddition * INI.LEVEL_SCORE) * factor * GAME.bonusFactor;
      
      if (GAME.score >= GAME.extraLife[0]){
        console.log("EXTRA LIFE");
        GAME.lives++;
        AUDIO.ExtraLife.play();
        GAME.extraLife.shift();
      }
    }
    MAP.setStackValue(GAME.path, MapDict.border);
    GAME.path.clear();

    const limit = 0.75;
    GAME.bonus = Math.max(Math.round((GAME.area - limit) * 100), 0);
    if (split) {
      GAME.levelSplit();
    } else if (GAME.area > limit) {
      GAME.levelEnd();
    }
    ENGINE.clearLayer("line");
    GAME.PAINT.back(GAME.colors, LAYER.background);
    HERO.speed = INI.FAST;
    AUDIO.Buzz.play();
  },
  makeMove: function (dir) {
    if (HERO.dead) return;
    if (HERO.MoveState.moving) return;
    if (HERO.makingLine) {
      HERO.lightFuse();
      return;
    }
    let canMove = MAP.checkLine(
      HERO.MoveState.startGrid,
      dir,
      INI.MOVE_GRIDS,
      1
    );
    if (canMove) {
      HERO.MoveState.next(dir, INI.MOVE_GRIDS);
    }
  },
  lightFuse: function () {
    FUSE.active = true;
    if (!FUSE.live) {
      FUSE.start();
      setTimeout(function () {
        FUSE.wait = false;
      }, QWYX.fuseStartTimeout);
    }
  },
  makeLine: function (dir) {
    if (HERO.dead) return;
    if (HERO.MoveState.moving) return;

    if (dir === null && !HERO.makingLine) return;
    if (dir === null) return HERO.lightFuse();

    let canDrawLine = MAP.checkLine(
      HERO.MoveState.startGrid,
      dir,
      INI.MOVE_GRIDS,
      0
    );
    if (canDrawLine) {
      if (!HERO.makingLine) {
        HERO.speed = GAME.speed;
        GAME.path.push(HERO.MoveState.startGrid);
      } else {
        HERO.speed = Math.max(HERO.speed, GAME.speed);
      }
      HERO.makingLine = true;
      FUSE.active = false;
      HERO.MoveState.next(dir, INI.MOVE_GRIDS);
    } else {
      let canConnect = HERO.checkConnection(dir);
      if (canConnect) {
        HERO.makingLine = true;
        FUSE.active = false;
        HERO.MoveState.next(dir, INI.MOVE_GRIDS);
        HERO.connected = true;
      } else {
        HERO.makeMove(dir);
      }
    }
  },
  checkConnection(dir) {
    let bridge = MAP.checkLine(
      HERO.MoveState.startGrid,
      dir,
      INI.MOVE_GRIDS - 1,
      0
    );
    if (bridge) {
      let near = HERO.MoveState.startGrid.add(dir.prolong(INI.MOVE_GRIDS - 1));
      return MAP.checkNext(near, dir, 1);
    }
    return false;
  },
  manage: function () {
    HERO.actor.animateMove("linear");
    HERO.move();
  },
  die: function () {
    ENGINE.clearLayer("actors");
    FUSE.end();
    GAME.sparxTimer = null;
    HERO.makingLine = false;
    EXPLOSIONS.pool.push(
      new AnimationSPRITE(
        HERO.actor.x + INI.OFF_X,
        HERO.actor.y + INI.OFF_Y,
        "Explosion_",
        23
      )
    );
    ENGINE.spriteDraw(
      "animation",
      HERO.actor.x,
      HERO.actor.y,
      SPRITE.Skull,
      GAME.PAINT.OFFSET
    );

    AUDIO.Death.play();
    AUDIO.Death.onended = GAME.finalFork;
    ENGINE.GAME.ANIMATION.next(GAME.outro);
  }
};
var MAP = null;
var GAME = {
  CSS: "color: orange",
  titleScreen: function () {
    GAME.prepareForRestart();
    TITLE.startTitle();
  },
  abort: function () {
    ENGINE.GAME.stopAnimation = true;
    console.error("..... aborting GAME, DEBUG info:");
  },
  start: function () {
    console.log(`%c****************** GAME.start ******************`, GAME.CSS);
    if (AUDIO.Title) {
      AUDIO.Title.pause();
      AUDIO.Title.currentTime = 0;
    }

    $("#startGame").addClass("hidden");
    $(ENGINE.topCanvas).off("mousemove", ENGINE.mouseOver);
    $(ENGINE.topCanvas).off("click", ENGINE.mouseClick);
    $(ENGINE.topCanvas).css("cursor", "");
    ENGINE.hideMouse();
    GAME.extraLife = SCORE.extraLife.clone();
    ENGINE.GAME.start();
    ENGINE.KEY.on();
    GAME.prepareForRestart();
    GAME.level = 1;

    GAME.score = 0;
    GAME.extraLife = SCORE.extraLife.clone();
    GAME.lives = 3;
    ENGINE.INI.ANIMATION_INTERVAL = 16;
    GAME.path = [];
    GAME.bonusFactor = 1;
    ENGINE.GAME.ANIMATION.waitThen(GAME.levelStart, 2);
  },
  prepareForRestart: function () {
    ENGINE.clearLayer("text");
    ENGINE.clearLayer("actors");
    ENGINE.clearLayer("background");
    ENGINE.clearLayer("button");
    ENGINE.clearLayer("click");
    ENGINE.clearLayer("bottomText");
    ENGINE.clearLayer("animation");
    ENGINE.clearLayer("explosion");
    ENGINE.clearLayer("line");
    ENGINE.clearLayer("qwyx");
  },
  finalFork: function () {
    GAME.lives--;
    if (GAME.lives <= 0) {
      GAME.end();
    } else {
      GAME.levelContinue();
    }
  },
  intro: function () {
    ENEMY.manage();
    if (GAME.R <= 0) {
      ENGINE.clearLayer("text");
      GAME.startSparx();
      ENGINE.GAME.ANIMATION.next(GAME.run);
    }
    GAME.introframeDraw();
  },
  drawHeroCursor: function () {
    let CTX = LAYER.text;
    CTX.strokeStyle = GAME.HERO_CURSOR.color();
    CTX.beginPath();
    let x = GAME.PAINT.OFFSET.x + HERO.actor.x;
    let y = GAME.PAINT.OFFSET.y + HERO.actor.y;
    CTX.arc(x, y, GAME.R, 0, Math.PI * 2);
    CTX.stroke();
    GAME.R -= 4;
    GAME.HERO_CURSOR = GAME.HERO_CURSOR.next();
  },
  introframeDraw: function () {
    ENGINE.clearLayerStack();
    ENEMY.draw();
    GAME.drawHeroCursor();
  },
  outro: function () {
    GAME.outroFrameDraw();
  },
  outroFrameDraw() {
    ENGINE.clearLayerStack();
    ENEMY.draw();
    EXPLOSIONS.draw();
  },
  levelExecute: function () {
    console.log("level", GAME.level, "executes");
    GAME.firstFrameDraw(GAME.level);
    ENGINE.GAME.ANIMATION.next(GAME.intro);
    GAME.R = 100;
    GAME.HERO_CURSOR = new Color(255, 0, 0);
  },
  levelContinue: function () {
    console.log("LEVEL", GAME.level, "continues ...");

    if (GAME.path.length !== 0) {
      HERO.MoveState.reset(GAME.path[0]);
      GRID.gridToSprite(GAME.path[0], HERO.actor);

      MAP.setStackValue(GAME.path.slice(1), MapDict.void);
      GAME.path.clear();
    }
    FUSE.end();
    HERO.makingLine = false;
    HERO.connected = false;
    ENEMY.removeSparx();
    GAME.prepareForRestart();
    GAME.firstFrameDraw();
    GAME.sparxTimer = null;
    GAME.levelExecute();
  },
  levelStart: function () {
    console.log("starting level", GAME.level);
    GAME.prepareForRestart();
    GAME.area = 0;
    HERO.firstInit();
    QWYX.firstInit();
    FUSE.construct();
    GAME.initLevel(GAME.level);
    GAME.levelExecute();
  },
  nextLevel: function () {
    TITLE.pressEnter();
    GAME.level++;
    ENGINE.GAME.ANIMATION.next(GAME.waitForEnter.bind(null, GAME.levelStart));
  },
  levelSplit: function () {
    GAME.bonusFactor += 1;
    GAME.levelEnd(true);
  },
  levelEnd: function (split = false) {
    const RD = new RenderData("NGage", 20, "#00EE00", "text", "#444", 1, 1, 2);
    let y = ENGINE.gameHEIGHT / 2;
    ENGINE.TEXT.RD = RD;
    ENGINE.TEXT.centeredText(`LEVEL ${GAME.level} COMPLETED`, y - 32);
    let bonus = GAME.bonus * GAME.bonusFactor * 1000;
    ENGINE.TEXT.centeredText(
      `BONUS: ${GAME.bonus}% * 1000 * ${GAME.bonusFactor} = ${bonus}`,
      y
    );
    GAME.score += bonus;
    TITLE.score();
    if (split) {
      y = ENGINE.gameHEIGHT / 2 - 64;
      ENGINE.TEXT.centeredText(
        `QWYX SPLIT -  BONUS MULTIPLIER: ${GAME.bonusFactor}`,
        y
      );
    }
    AUDIO.ClearLevel.onended = GAME.nextLevel;
    AUDIO.ClearLevel.play();
    ENGINE.GAME.ANIMATION.stop();
  },
  initLevel: function (level) {
    console.log("init level", level);
    GAME.bonus = 0;
    MAP = new GridArray(INI.GRIDS, INI.GRIDS);
    MAP.linkToEntity([HERO, FUSE]);
    MAP.border();
    GAME.PAINT.OFFSET = new Vector(INI.OFF_X, INI.OFF_Y);
  },
  frameDraw: function () {
    ENGINE.clearLayerStack();
    HERO.draw();
    ENEMY.draw();
    TITLE.score();
  },
  colors: ["white", "#666", "#EEE", "blue", "brown"],
  firstFrameDraw: function (level) {
    TITLE.main();
    TITLE.level();
    const CTX = LAYER.background;
    GAME.PAINT.back(GAME.colors, CTX);
    HERO.draw();
  },
  run: function () {
    if (ENGINE.GAME.stopAnimation) return;
    HERO.manage();
    ENEMY.manage();
    GAME.respond();
    ENGINE.TIMERS.update();
    GAME.frameDraw();
  },
  respond: function () {
    //GAME.respond() template
    if (HERO.dead) return;
    var map = ENGINE.GAME.keymap;
    let direction = ENGINE.KEY.dirFromKey();

    if (map[ENGINE.KEY.map.ctrl]) {
      GAME.speed = INI.FAST;
      HERO.makeLine(direction);
      return;
    }

    if (map[ENGINE.KEY.map.shift]) {
      GAME.speed = INI.SLOW;
      HERO.makeLine(direction);
      return;
    }

    //single key section
    if (map[ENGINE.KEY.map.left]) {
      HERO.makeMove(LEFT);
      return;
    }
    if (map[ENGINE.KEY.map.right]) {
      HERO.makeMove(RIGHT);
      return;
    }
    if (map[ENGINE.KEY.map.up]) {
      HERO.makeMove(UP);
      return;
    }
    if (map[ENGINE.KEY.map.down]) {
      HERO.makeMove(DOWN);
      return;
    }

    //no button pressed!
    if (HERO.makingLine) HERO.lightFuse();
    return;
  },
  setup: function () {
    console.log("%cGAME SETUP started", PRG.CSS);
    $("#buttons").prepend("<input type='button' id='startGame' value='START'>");
    $("#startGame").on("click", GAME.start);
  },
  end: function () {
    console.log("GAME ENDED");
    ENGINE.showMouse();
    GAME.checkScore();
    TITLE.gameOver();
    TITLE.pressEnter();
    ENGINE.GAME.ANIMATION.next(GAME.waitForEnter.bind(null, GAME.titleScreen));
  },
  waitForEnter(func) {
    if (ENGINE.GAME.keymap[ENGINE.KEY.map.enter]) {
      ENGINE.GAME.ANIMATION.waitThen(func);
    }
  },
  checkScore: function () {
    console.log(PRG.NAME, "stopped?", !ENGINE.GAME.running);
    SCORE.checkScore(GAME.score);
    SCORE.hiScore();
    TITLE.hiScore();
  },
  configureLevel: function (level) {
    console.log("Configuring level:", level);
  },
  PAINT: {
    back: function (color, CTX, offset = GAME.PAINT.OFFSET, size = ENGINE.INI.GRIDPIX) {
      ENGINE.resetShadow(CTX);
      ENGINE.fillLayer("background", "#000");
      for (const [index, map] of MAP.map.entries()) {
        if (map !== 0) {
          let col = color[Math.log2(map)];
          let grid = MAP.indexToGrid(index);
          CTX.fillStyle = col;
          CTX.pixelAt(offset.x + grid.x * size, offset.y + grid.y * size, size);
        }
      }
    },
    gridOnLine: function (grid, color) {
      const CTX = LAYER.line;
      const size = ENGINE.INI.GRIDPIX;
      CTX.fillStyle = color;
      CTX.pixelAt(INI.OFF_X + grid.x * size, INI.OFF_Y + grid.y * size, size);
    }
  },
  generateTitleText: function () {
    let text = `${PRG.NAME} ${
      PRG.VERSION
    }, a game by Lovro Selic, ${"\u00A9"} C00lSch00l ${
      PRG.YEAR
    } . Music: 'Shadows In The Fog' written and performed by LaughingSkull, ${"\u00A9"} 2012 Lovro Selic. `;
    text +=
      "     ENGINE, GRID and GAME code by Lovro Selic using JavaScript ES10";
    text = text.split("").join(String.fromCharCode(8202));
    return text;
  },
  setTitle: function () {
    const text = GAME.generateTitleText();
    const RD = new RenderData("Arcade", 16, "blue", "bottomText");
    const SQ = new Square(
      0,
      0,
      LAYER.bottomText.canvas.width,
      LAYER.bottomText.canvas.height
    );
    GAME.movingText = new MovingText(text, 3, RD, SQ);
  },
  runTitle: function () {
    if (ENGINE.GAME.stopAnimation) return;
    GAME.movingText.process();
    ENEMY.move();
    GAME.titleFrameDraw();
  },
  titleFrameDraw: function () {
    ENGINE.clearLayerStack();
    GAME.movingText.draw();
    ENEMY.draw();
  },
  sparxTimer: null,
  startSparx: function () {
    Sparx.initPair(MAP);
    if (GAME.sparxTimer !== null) {
      GAME.sparxTimer.unregister();
    }
    GAME.sparxTimer = new CountDown(
      "Sparx",
      QWYX.sparxRespawnRate,
      GAME.startSparx
    );
  }
};
var TITLE = {
  main: function () {
    TITLE.title();
    TITLE.bottom();
    TITLE.score();
    TITLE.hiScore();
  },
  title: function () {
    var CTX = LAYER.title;
    TITLE.background();
    var fs = 42;
    CTX.font = fs + "px NGage";
    CTX.textAlign = "center";
    var txt = CTX.measureText(PRG.NAME);
    var x = ENGINE.titleWIDTH / 2;
    var y = Math.floor((ENGINE.titleHEIGHT - fs) / 2) + fs;
    var gx = x - txt.width / 2;
    var gy = y - fs;
    var grad = CTX.createLinearGradient(gx, gy + 10, gx, gy + fs);
    grad.addColorStop("0", "#CCC");
    grad.addColorStop("0.1", "#EEE");
    grad.addColorStop("0.2", "#DDD");
    grad.addColorStop("0.3", "#AAA");
    grad.addColorStop("0.4", "#999");
    grad.addColorStop("0.5", "#666");
    grad.addColorStop("0.6", "#888");
    grad.addColorStop("0.7", "#AAA");
    grad.addColorStop("0.8", "#BBB");
    grad.addColorStop("0.9", "#EEE");
    grad.addColorStop("1", "#CCC");
    GAME.grad = grad;
    CTX.fillStyle = grad;
    CTX.shadowColor = "#cec967";
    CTX.shadowOffsetX = 2;
    CTX.shadowOffsetY = 2;
    CTX.shadowBlur = 3;
    CTX.fillText(PRG.NAME, x, y);
    
    y = 16;
    CTX.strokeStyle = "#000";
    CTX.lineWidth = 1;
    ENGINE.resetShadow(CTX);

    while (y < ENGINE.titleHEIGHT) {
      CTX.beginPath();
      CTX.moveTo(0, y);
      CTX.lineTo(767, y);
      CTX.stroke();
      y += 3;
    }
  },
  level: function () {
    const RD = new RenderData(
      "NGage",
      18,
      "#C0C0C0",
      "text",
      "#A9A9A9",
      1,
      1,
      3
    );
    ENGINE.TEXT.RD = RD;
    let y = ENGINE.gameHEIGHT / 4 + 24;
    ENGINE.TEXT.centeredText(
      `LEVEL: ${GAME.level.toString().padStart(2, "0")}`,
      y
    );
    y += 24;
    ENGINE.TEXT.centeredText(
      `BONUS MULTIPLIER: ${GAME.bonusFactor.toString()}`,
      y
    );
  },
  background: function () {
    var CTX = LAYER.title;
    CTX.fillStyle = "#000";
    CTX.roundRect(
      0,
      0,
      ENGINE.titleWIDTH,
      ENGINE.titleHEIGHT,
      {
        upperLeft: 20,
        upperRight: 20,
        lowerLeft: 0,
        lowerRight: 0
      },
      true,
      true
    );
  },
  bottom: function () {
    var CTX = LAYER.bottom;
    CTX.fillStyle = "#000";
    CTX.roundRect(
      0,
      0,
      ENGINE.bottomWIDTH,
      ENGINE.bottomHEIGHT,
      {
        upperLeft: 0,
        upperRight: 0,
        lowerLeft: 20,
        lowerRight: 20
      },
      true,
      true
    );
    CTX.textAlign = "center";
    var x = ENGINE.bottomWIDTH / 2;
    var y = ENGINE.bottomHEIGHT / 2;
    CTX.font = "12px Consolas";
    CTX.fillStyle = "silver";
    CTX.shadowOffsetX = 2;
    CTX.shadowOffsetY = 2;
    CTX.shadowBlur = 5;
    CTX.shadowColor = "#cec967";
    CTX.fillText("Version " + PRG.VERSION + " by Lovro Selič", x, y);
  },
  bottomBlank: function () {
    var CTX = LAYER.bottom;
    CTX.fillStyle = "#000";
    CTX.roundRect(
      0,
      0,
      ENGINE.bottomWIDTH,
      ENGINE.bottomHEIGHT,
      {
        upperLeft: 0,
        upperRight: 0,
        lowerLeft: 20,
        lowerRight: 20
      },
      true,
      true
    );
  },
  scoreBlank: function () {
    ENGINE.clearLayer("score_back");
    var CTX = LAYER.score_back;
    CTX.fillStyle = "#000";
    CTX.fillRect(0, 0, ENGINE.scoreWIDTH, ENGINE.scoreHEIGHT);
  },
  score: function () {
    ENGINE.clearLayer("score");
    TITLE.scoreBlank();
    let CTX = LAYER.score;
    let fs = 14;
    let y = Math.floor((ENGINE.scoreHEIGHT - fs) / 2) + fs + 10;
    CTX.font = fs + "px NGage";
    CTX.fillStyle = GAME.grad;
    CTX.shadowColor = "yellow";
    CTX.shadowOffsetX = 0;
    CTX.shadowOffsetY = 0;
    CTX.shadowBlur = 0;
    CTX.textAlign = "left";
    let x = 16;
    let text = `SCORE: ${GAME.score.toString().padStart(7, "0")}`;
    CTX.fillText(text, x, y);

    x = 230;
    text = `CLAIMED: ${Math.round(GAME.area * 100)
      .toString()
      .padStart(2, "0")}%`;
    CTX.fillText(text, x, y);

    x = 390;
    text = `LEVEL: ${GAME.level.toString().padStart(2, "0")}`;
    CTX.fillText(text, x, y);

    x = 515;
    text = `BONUS: ${GAME.bonusFactor.toString()}`;
    CTX.fillText(text, x, y);

    x = 630;
    text = `STYX: ${GAME.lives.toString().padStart(2, "0")}`;
    CTX.fillText(text, x, y);

    if (GAME.sparxTimer === null) return;
    let offsetX = INI.OFF_X + 3;
    y = ENGINE.scoreHEIGHT - 5;
    let startWidth = ENGINE.scoreWIDTH - 2 * offsetX;
    let ratio = GAME.sparxTimer.remains() / INI.SPARX_RESPAWN;
    let width = Math.floor(startWidth * ratio);
    let delta = Math.ceil((startWidth - width) / 2);

    CTX.save();
    CTX.lineCap = "round";
    CTX.strokeStyle = "red";
    CTX.lineWidth = 4;
    CTX.beginPath();
    CTX.moveTo(offsetX + delta, y);
    CTX.lineTo(offsetX + delta + width, y);
    CTX.stroke();
    CTX.restore();
  },
  hiScore: function () {
    ENGINE.clearLayer("hiscore");
    let CTX = LAYER.hiscore;
    let fs = 14;
    let y = fs + fs;
    CTX.font = fs + "px NGage";
    CTX.fillStyle = "lime";
    CTX.shadowOffsetX = 0;
    CTX.shadowOffsetY = 0;
    CTX.shadowBlur = 0;
    CTX.textAlign = "left";
    var index = SCORE.SCORE.name[0].indexOf("&nbsp");
    var HS;
    if (index > 0) {
      HS = SCORE.SCORE.name[0].substring(
        0,
        SCORE.SCORE.name[0].indexOf("&nbsp")
      );
    } else {
      HS = SCORE.SCORE.name[0];
    }
    var text =
      "HISCORE: " +
      SCORE.SCORE.value[0].toString().padStart(7, "0") +
      " by " +
      HS;
    let measure = CTX.measureText(text);
    let x = Math.floor((ENGINE.scoreWIDTH - measure.width) / 2);
    CTX.fillText(text, x, y);
  },
  gameOver: function () {
    ENGINE.clearLayer("text");
    var CTX = LAYER.text;
    CTX.textAlign = "center";
    var x = ENGINE.gameWIDTH / 2;
    var y = ENGINE.gameHEIGHT / 2;
    var fs = 64;
    CTX.font = fs + "px NGage";
    var txt = CTX.measureText("GAME OVER");
    var gx = x - txt.width / 2;
    var gy = y - fs;
    var grad = CTX.createLinearGradient(gx, gy + 10, gx, gy + fs);
    grad.addColorStop("0", "#DDD");
    grad.addColorStop("0.1", "#EEE");
    grad.addColorStop("0.2", "#DDD");
    grad.addColorStop("0.3", "#CCC");
    grad.addColorStop("0.4", "#BBB");
    grad.addColorStop("0.5", "#AAA");
    grad.addColorStop("0.6", "#BBB");
    grad.addColorStop("0.7", "#CCC");
    grad.addColorStop("0.8", "#DDD");
    grad.addColorStop("0.9", "#EEE");
    grad.addColorStop("1", "#DDD");
    CTX.fillStyle = grad;
    CTX.shadowColor = "#FFF";
    CTX.shadowOffsetX = 2;
    CTX.shadowOffsetY = 2;
    CTX.shadowBlur = 3;
    CTX.fillText("GAME OVER", x, y);
  },
  pressEnter: function () {
    const RD = new RenderData(
      "NGage",
      24,
      "limegreen",
      "text",
      "#000044",
      1,
      1,
      3
    );
    ENGINE.TEXT.RD = RD;
    var y = ENGINE.gameHEIGHT / 2 + 48;
    ENGINE.TEXT.centeredText("Press ENTER to continue", y);
  },
  music: function () {
    if (AUDIO.Title) AUDIO.Title.play();
  },
  startTitle: function () {
    if (AUDIO.Title) AUDIO.Title.play();
    ENGINE.clearLayer("text");
    ENGINE.clearLayer("actors");
    ENGINE.clearLayer("score");
    ENGINE.clearLayer("hiscore");

    TITLE.background();
    TITLE.scoreBlank();
    var CTX = LAYER.background;
    ENGINE.fillLayer("background", "#000");
    TITLE.bottomBlank();

    const RD = new RenderData(
      "NGage",
      30,
      "silver",
      "text",
      "darkgray",
      2,
      2,
      2
    );
    ENGINE.TEXT.RD = RD;
    let x, y;
    y = 180;
    ENGINE.TEXT.centeredText("BY", y);
    y = 220;
    ENGINE.TEXT.centeredText("LOVRO SELIC", y);
    $("#DOWN")[0].scrollIntoView();
    let cname = ENGINE.getCanvasName("ROOM");
    ENGINE.topCanvas = cname;
    TITLE.drawButtons();

    CTX = LAYER.text;
    const TD = new RenderData("NGage", 80, "blue", "text", "azure", 4, 2, 5);
    ENGINE.TEXT.RD = TD;
    y = 80;
    ENGINE.TEXT.centeredText(PRG.NAME, y);

    y = 26;
    CTX.strokeStyle = "#000";
    CTX.lineWidth = 1;
    ENGINE.resetShadow(CTX);
    while (y < 90) {
      CTX.beginPath();
      CTX.moveTo(0, y);
      CTX.lineTo(767, y);
      CTX.stroke();
      y += 3;
    }

    y = 245;
    x = 25;
    let w = ENGINE.gameWIDTH - 2 * x - 1;
    let h = 615 - y - 1;
    CTX.strokeStyle = "white";

    MAP = new GridArray(w / 3, h / 3);
    MAP.border();

    GAME.PAINT.OFFSET = new Vector(x, y);
    const colors = ["#000", "#666", "#EEE", "blue", "brown"];
    GAME.PAINT.back(colors, CTX, new Vector(x, y));
    let center = new Grid(Math.round(w / 6), Math.round(h / 6));
    QWYX.titleInit(center);

    GAME.setTitle();
    ENGINE.INI.ANIMATION_INTERVAL = 16;
    ENGINE.GAME.start(); //INIT game loop
    ENGINE.GAME.ANIMATION.next(GAME.runTitle);
  },
  drawButtons: function () {
    ENGINE.clearLayer("button");
    FORM.BUTTON.POOL.clear();
    let x = 32;
    let y = 640;
    let w = 132;
    let h = 24;
    let startBA = new Area(x, y, w, h);
    let buttonColors = new ColorInfo("blue", "#lightblue", "#222", "#666", 13);
    let musicColors = new ColorInfo("lime", "#090", "#222", "#666", 13);

    FORM.BUTTON.POOL.push(
      new Button("Start game", startBA, buttonColors, GAME.start)
    );
    const sg = localStorage.getItem(PRG.SG);
    y += 1.5 * h;
    let music = new Area(x, y, w, h);
    FORM.BUTTON.POOL.push(
      new Button("Play title music", music, musicColors, TITLE.music)
    );
    FORM.BUTTON.draw();
    $(ENGINE.topCanvas).mousemove(ENGINE.mouseOver);
    $(ENGINE.topCanvas).click(ENGINE.mouseClick);
  },
  lines: function () {
    let x = 208;
    let y = 250;
    TITLE.line(x, y);
    y = 660;
    TITLE.line(x, y);
    y = 720;
    TITLE.line(x, y);
  },
  line: function (x, y) {
    let CTX = LAYER.animation;
    let size = 2;
    let width = 615;
    let curX = x;
    while (curX <= x + width) {
      CTX.fillStyle = GREENS.chooseRandom();
      CTX.pixelAt(curX, y, size);
      curX += size;
    }
  },
  drawHiScore() {
    let y = 320;
    let x = 208;
    var CTX = LAYER.background;
    CTX.textAlign = "left";
    let fs = 28;
    CTX.font = `${fs}px Consolas`;
    ENGINE.resetShadow(CTX);
    for (var hs = 1; hs <= SCORE.SCORE.depth; hs++) {
      let name = SCORE.SCORE.name[hs - 1].split("&")[0].padEnd(10, " ");
      let HS = `${hs.toString().padStart(2, "0")}. ${name} ${SCORE.SCORE.value[
        hs - 1
      ]
        .toString()
        .padStart(7, " ")}`;
      if (hs === 1) {
        CTX.fillStyle = "gold";
      } else if (hs === 2) {
        CTX.fillStyle = "silver";
      } else if (hs === 3) {
        CTX.fillStyle = "#cd7f32";
      } else {
        CTX.fillStyle = "green";
      }
      CTX.fillText(HS, x, y);
      y += Math.floor(fs * 1.2);
    }
  }
};

$(function () {
  PRG.INIT();
  PRG.setup();
  ENGINE.LOAD.preload();
  SCORE.init("SC", "QWYX", 10, 30000);
  SCORE.loadHS();
  SCORE.hiScore();
  SCORE.extraLife = [60000, 100000, 250000, Infinity];
});
