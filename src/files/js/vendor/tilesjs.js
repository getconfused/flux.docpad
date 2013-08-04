/*! Tiles.js | http://thinkpixellab.com/tilesjs | 2012-12-03 */


// single namespace export
var Tiles = {};

(function($) {

    var Tile = Tiles.Tile = function(tileId, element) {

        this.id = tileId;

        // position and dimensions of tile inside the parent panel
        this.top = 0;
        this.left = 0;
        this.width = 0;
        this.height = 0;

        // cache the tile container element
        this.$el = $(element || document.createElement('div'));
    };

    Tile.prototype.appendTo = function($parent, fadeIn, delay, duration) {
        this.$el
            .hide()
            .appendTo($parent);

        if (fadeIn) {
            this.$el.delay(delay).fadeIn(duration);
        }
        else {
            this.$el.show();
        }
    };

    Tile.prototype.remove = function(animate, duration) {
        if (animate) {
            this.$el.fadeOut({
                complete: function() {
//                    $(this).remove();
                }
            });
        }
        else {
            this.$el.hide();
        }
    };

    // updates the tile layout with optional animation
    Tile.prototype.resize = function(cellRect, pixelRect, animate, duration, onComplete) {
       
        // store the list of needed changes
        var cssChanges = {},
            changed = false;

        // update position and dimensions
        if (this.left !== pixelRect.x) {
            cssChanges.left = pixelRect.x;
            this.left = pixelRect.x;
            changed = true;
        }
        if (this.top !== pixelRect.y) {
            cssChanges.top = pixelRect.y;
            this.top = pixelRect.y;
            changed = true;
        }
        if (this.width !== pixelRect.width) {
            cssChanges.width = pixelRect.width;
            this.width = pixelRect.width;
            changed = true;
        }
        if (this.height !== pixelRect.height) {
            cssChanges.height = pixelRect.height;
            this.height = pixelRect.height;
            changed = true;
        }

        // Sometimes animation fails to set the css top and left correctly
        // in webkit. We'll validate upon completion of the animation and
        // set the properties again if they don't match the expected values.
        var tile = this,
            validateChangesAndComplete = function() {
                var el = tile.$el[0];
                if (tile.left !== el.offsetLeft) {
                    //console.log ('mismatch left:' + tile.left + ' actual:' + el.offsetLeft + ' id:' + tile.id);
                    tile.$el.css('left', tile.left);
                }
                if (tile.top !== el.offsetTop) {
                    //console.log ('mismatch top:' + tile.top + ' actual:' + el.offsetTop + ' id:' + tile.id);
                    tile.$el.css('top', tile.top);
                }

                if (onComplete) {
                    onComplete();
                }
            };


        // make css changes with animation when requested
        if (animate && changed) {

            this.$el.animate(cssChanges, {
                duration: duration,
                easing: 'swing',
                complete: validateChangesAndComplete
            });
        }
        else {
            if (changed) {
                this.$el.css(cssChanges);
            }

            setTimeout(validateChangesAndComplete, duration);
        }
    };

})(jQuery);

               
/*
    A grid template specifies the layout of variably sized tiles. A single
    cell tile should use the period character. Larger tiles may be created
    using any character that is unused by a adjacent tile. Whitespace is
    ignored when parsing the rows. 

    Examples:

    var simpleTemplate = [
        '    A  A  .  B    ',
        '    A  A  .  B    ',
        '    .  C  C  .    ',
    ]

    var complexTemplate = [
        '    J  J  .  .  E  E    ',
        '    .  A  A  .  E  E    ',
        '    B  A  A  F  F  .    ',
        '    B  .  D  D  .  H    ',
        '    C  C  D  D  G  H    ',
        '    C  C  .  .  G  .    ',
    ];
*/

(function($) {

    // remove whitespace and create 2d array
    var parseCells = function(rows) {
        var cells = [],
            numRows = rows.length,
            x, y, row, rowLength, cell;

        // parse each row
        for(y = 0; y < numRows; y++) {
            
            row = rows[y];
            cells[y] = [];

            // parse the cells in a single row
            for (x = 0, rowLength = row.length; x < rowLength; x++) {
                cell = row[x];
                if (cell !== ' ') {
                    cells[y].push(cell);
                }
            }
        }

        // TODO: check to make sure the array isn't jagged

        return cells;
    };

    function Rectangle(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    Rectangle.prototype.copy = function() {
        return new Rectangle(this.x, this.y, this.width, this.height);
    };

    Tiles.Rectangle = Rectangle;

    // convert a 2d array of cell ids to a list of tile rects
    var parseRects = function(cells) {
        var rects = [],
            numRows = cells.length,
            numCols = numRows === 0 ? 0 : cells[0].length,
            cell, height, width, x, y, rectX, rectY;

        // make a copy of the cells that we can modify
        cells = cells.slice();
        for (y = 0; y < numRows; y++) {
            cells[y] = cells[y].slice();
        }

        // iterate through every cell and find rectangles
        for (y = 0; y < numRows; y++) {
            for(x = 0; x < numCols; x++) {
                cell = cells[y][x];

                // skip cells that are null
                if (cell == null) {
                    continue;
                }

                width = 1;    
                height = 1;

                if (cell !== Tiles.Template.SINGLE_CELL) {

                    // find the width by going right until cell id no longer matches 
                    while(width + x < numCols &&
                          cell === cells[y][x + width]) {
                        width++;
                    }

                    // now find height by going down
                    while (height + y < numRows &&
                           cell === cells[y + height][x]) {
                        height++;
                    }
                }

                // null out all cells for the rect
                for(rectY = 0; rectY < height; rectY++) {
                    for(rectX = 0; rectX < width; rectX++) {
                        cells[y + rectY][x + rectX] = null;
                    }
                }

                // add the rect
                rects.push(new Rectangle(x, y, width, height));
            }
        }

        return rects;
    };

    Tiles.Template = function(rects, numCols, numRows) {
        this.rects = rects;
        this.numTiles = this.rects.length;
        this.numRows = numRows;
        this.numCols = numCols;
    };

    Tiles.Template.prototype.copy = function() {

        var copyRects = [],
            len, i;
        for (i = 0, len = this.rects.length; i < len; i++) {
            copyRects.push(this.rects[i].copy());
        }

        return new Tiles.Template(copyRects, this.numCols, this.numRows);
    };

    // appends another template (assumes both are full rectangular grids)
    Tiles.Template.prototype.append = function(other) {

        if (this.numCols !== other.numCols) {
            throw 'Appended templates must have the same number of columns';
        }
        
        // new rects begin after the last current row
        var startY = this.numRows,
            i, len, rect;

        // copy rects from the other template
        for (i = 0, len = other.rects.length; i < len; i++) {
            rect = other.rects[i];
            this.rects.push(
                new Rectangle(rect.x, startY + rect.y, rect.width, rect.height));
        }

        this.numRows += other.numRows;
    };

    Tiles.Template.fromJSON = function(rows) {
        // convert rows to cells and then to rects
        var cells = parseCells(rows),
            rects = parseRects(cells);
        return new Tiles.Template(
            rects,
            cells.length > 0 ? cells[0].length : 0,
            cells.length);
    };

    Tiles.Template.prototype.toJSON = function() {
        // for now we'll assume 26 chars is enough (we don't solve graph coloring)
        var LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            NUM_LABELS = LABELS.length,
            labelIndex = 0,
            rows = [],
            i, len, rect, x, y, label;

        // fill in single tiles for each cell
        for (y = 0; y < this.numRows; y++) {
            rows[y] = [];
            for (x = 0; x < this.numCols; x++) {
                rows[y][x] = Tiles.Template.SINGLE_CELL;
            }
        }

        // now fill in bigger tiles
        for (i = 0, len = this.rects.length; i < len; i++) {
            rect = this.rects[i];
            if (rect.width > 1 || rect.height > 1) {

                // mark the tile position with a label
                label = LABELS[labelIndex];
                for(y = 0; y < rect.height; y++) {
                    for(x = 0; x < rect.width; x++) {
                        rows[rect.y + y][rect.x + x] = label;
                    }
                }

                // advance the label index
                labelIndex = (labelIndex + 1) % NUM_LABELS;
            }
        }

        // turn the rows into strings
        for (y = 0; y < this.numRows; y++) {
            rows[y] = rows[y].join('');
        }

        return rows;
    };
    
    // period used to designate a single 1x1 cell tile
    Tiles.Template.SINGLE_CELL = '.';

})(jQuery);


// template provider which returns simple templates with 1x1 tiles
Tiles.UniformTemplates = {
    get: function(numCols, targetTiles) {
        var numRows = Math.ceil(targetTiles / numCols),
            rects = [],
            x, y;

        // create the rects for 1x1 tiles
        for (y = 0; y < numRows; y++) {
            for (x = 0; x < numCols; x++) {
                rects.push(new Tiles.Rectangle(x, y, 1, 1));
            }
        }

        return new Tiles.Template(rects, numCols, numRows);
    }
};
(function($) {

    var Grid = Tiles.Grid = function(element) {

        this.$el = $(element);

        // animation lasts 500 ms by default
        this.animationDuration = 500;

        // min width and height of a cell in the grid
        this.cellSizeMin = 260;

        // the default set of factories used when creating templates
        // this.templateFactory = Tiles.UniformTemplates;
        this.templateFactory = PulseTileTemplates;
        
        
        // defines the page size for prioritization of positions and tiles
        this.priorityPageSize = Number.MAX_VALUE;

        // spacing between tiles
        this.cellPadding = 10;

        // actual width and height of a cell in the grid
        this.cellSize = 0;

        // number of tile cell columns
        this.numCols = 1;

        // cache the current template
        this.template = null;

        // flag that tracks whether a redraw is necessary
        this.isDirty = true;

        this.tiles = [];

        // keep track of added and removed tiles so we can update tiles
        // and the render the grid independently.
        this.tilesAdded = [];
        this.tilesRemoved = [];
    };

    Grid.prototype.getContentWidth = function() {
        // by default, the entire container width is used when drawing tiles
        return this.$el.width();
    };

    // gets the number of columns during a resize
    Grid.prototype.resizeColumns = function() {
        var panelWidth = this.getContentWidth();
        
        // ensure we have at least one column
        return Math.max(1, Math.floor((panelWidth + this.cellPadding) /
            (this.cellSizeMin + this.cellPadding)));
    };

    // gets the cell size during a grid resize
    Grid.prototype.resizeCellSize = function() {
        var panelWidth = this.getContentWidth();
        return Math.ceil((panelWidth + this.cellPadding) / this.numCols) -
            this.cellPadding;
    };

    Grid.prototype.resize = function() {
        
        var newCols = this.resizeColumns();

        if (this.numCols !== newCols && newCols > 0) {
            this.numCols = newCols;
            this.isDirty = true;
        }

        var newCellSize = this.resizeCellSize();        
        if (this.cellSize !== newCellSize && newCellSize > 0) {
            this.cellSize = newCellSize;
            this.isDirty = true;    
        }
    };

    // refresh all tiles based on the current content
    Grid.prototype.updateTiles = function(newTileIds) {

        // ensure we dont have duplicate ids
        newTileIds = uniques(newTileIds);

        var numTiles = newTileIds.length,
            newTiles = [],
            i, tile, tileId, index;

        // retain existing tiles and queue remaining tiles for removal
        for (i = this.tiles.length - 1; i >= 0; i--) {
            tile = this.tiles[i];
            index = $.inArray(tile.id, newTileIds);
            if (index < 0) {
                this.tilesRemoved.push(tile);
            }
            else {
                newTiles[index] = tile;
            }
        }

        // clear existing tiles
        this.tiles = [];

        // make sure we have tiles for new additions
        for (i = 0; i < numTiles; i++) {
            
            tile = newTiles[i];
            if (!tile) {

                tileId = newTileIds[i];
                
                // see if grid has a custom tile factory
                if (this.createTile) {
                    
                    tile = this.createTile(tileId);
    
                    // skip the tile if it couldn't be created
                    if (!tile) {
                        //console.log('Tile element could not be created, id: ' + tileId);
                        continue;
                    }

                } else {

                    tile = new Tiles.Tile(tileId);
                }
                
                // add tiles to queue (will be appended to DOM during redraw)
                this.tilesAdded.push(tile);
                //console.log('Adding tile: ' + tile.id);
            }

            this.tiles.push(tile);
        }
    };

    // helper to return unique items
    function uniques(items) {
        var results = [],
            numItems = items ? items.length : 0,
            i, item;

        for (i = 0; i < numItems; i++) {
            item = items[i];
            if ($.inArray(item, results) === -1) {
                results.push(item);
            }
        }

        return results;
    }

    // prepend new tiles
    Grid.prototype.insertTiles = function(newTileIds) {
        this.addTiles(newTileIds, true);
    };

    // append new tiles
    Grid.prototype.addTiles = function(newTileIds, prepend) {

        if (!newTileIds || newTileIds.length === 0) {
            return;
        }

        var prevTileIds = [],
            prevTileCount = this.tiles.length,
            i;

        // get the existing tile ids
        for (i = 0; i < prevTileCount; i++) {
            prevTileIds.push(this.tiles[i].id);
        }

        var tileIds = prepend ? newTileIds.concat(prevTileIds) 
            : prevTileIds.concat(newTileIds);
        this.updateTiles(tileIds);
    };

    Grid.prototype.removeTiles = function(removeTileIds) {

        if (!removeTileIds || removeTileIds.length === 0) {
            return;
        }

        var updateTileIds = [],
            i, len, id;
            


        // get the set of ids which have not been removed
        for (i = 0, len = this.tiles.length; i < len; i++) {
            id = this.tiles[i].id;
            if ($.inArray(id, removeTileIds) === -1) {
                updateTileIds.push(id);
            }
        }

        this.updateTiles(updateTileIds);
    };

    Grid.prototype.createTemplate = function(numCols, targetTiles) {
        
        // ensure that we have at least one column
        numCols = Math.max(1, numCols);

        var template = this.templateFactory.get(numCols, targetTiles);
        if (!template) {
            
            // fallback in case the default factory can't generate a good template
            template = Tiles.UniformTemplates.get(numCols, targetTiles);
        }
        
        return template;
    };

    // ensures we have a good template for the specified numbef of tiles
    Grid.prototype.ensureTemplate = function(numTiles) {

        if (this.template && this.template.rects.length >= (numTiles + this.numCols)) {
          this.template = null
        }
        var f = '/all';
        if (!this.template || this.template.numCols !== this.numCols) {
            this.template = PulseTileTemplates.getStreamTemplate(f, this.numCols, numTiles);
            
            if (!this.template) {
                // this.template.append(
                //     
                // );    
              this.template = this.createTemplate(this.numCols, this.numCols*2);

//              this.template = this.createTemplate(this.numCols, numTiles);
              PulseTileTemplates.setStreamTemplate(f, this.template);
            }
            this.isDirty = true;
        }
            

        // verfiy that the current template is still valid
        if (!this.template || this.template.numCols !== this.numCols) {
            this.template = this.createTemplate(this.numCols, numTiles);

            this.isDirty = true;
        } else {
            // append another template if we don't have enough rects
            var missingRects = numTiles - this.template.rects.length;
            if (missingRects > 0) {
                this.template.append(
                    this.createTemplate(this.numCols, missingRects)
                );    
                this.template.append(
                    this.createTemplate(this.numCols, this.numCols*2)
                );    
                this.isDirty = true;
            }

        }
    };

    // helper that returns true if a tile was in the viewport or will be given
    // the new pixel rect coordinates and dimensions
    function wasOrWillBeVisible(viewRect, tile, newRect) {

        var viewMaxY = viewRect.y + viewRect.height,
            viewMaxX = viewRect.x + viewRect.width;

        // note: y axis is the more common exclusion, so check that first

        // was the tile visible?
        if (tile) {
            if (!((tile.top > viewMaxY) || (tile.top + tile.height < viewRect.y) ||
                (tile.left > viewMaxX) || (tile.left + tile.width < viewRect.x))) {
                return true;
            }
        }
        
        if (newRect) {
            // will it be visible?
            if (!((newRect.y > viewMaxY) || (newRect.y + newRect.height < viewRect.y) ||
                (newRect.x > viewMaxX) || (newRect.x + newRect.width < viewRect.x))) {
                return true;
            }
        }
        
        return false;
    }

    Grid.prototype.shouldRedraw = function() {

        // see if we need to calculate the cell size
        if (this.cellSize <= 0) {
            this.resize();
        }

        // verify that we have a template
        this.ensureTemplate(this.tiles.length);

        // only redraw when necessary
        var shouldRedraw = (this.isDirty ||
            this.tilesAdded.length > 0 ||
            this.tilesRemoved.length > 0);

        return shouldRedraw;
    };

    // redraws the grid after tile collection changes
    Grid.prototype.redraw = function(animate, onComplete) {
        // see if we should redraw
        if (!this.shouldRedraw()) {
            if (onComplete) {
                onComplete(false); // tell callback that we did not redraw
            }
            return;
        }        

        var numTiles = this.tiles.length,
            pageSize = this.priorityPageSize,
            duration = this.animationDuration,
            cellPlusPadding = this.cellSize + this.cellPadding,
            tileIndex = 0,
            appendDelay = 0,
            viewRect = new Tiles.Rectangle(
                this.$el.scrollLeft(),
                this.$el.scrollTop(),
                this.$el.width(),
                this.$el.height()),
            tile, added, pageRects, pageTiles, i, len, cellRect, pixelRect,
            animateTile, priorityRects, priorityTiles;

            
        // chunk tile layout by pages which are internally prioritized
        for (tileIndex = 0; tileIndex < numTiles; tileIndex += pageSize) {

            // get the next page of rects and tiles
            pageRects = this.template.rects.slice(tileIndex, tileIndex + pageSize);
            pageTiles = this.tiles.slice(tileIndex, tileIndex + pageSize);

            // create a copy that can be ordered
            priorityRects = pageRects.slice(0);
            priorityTiles = pageTiles.slice(0);

            // prioritize the page of rects and tiles
            if (this.prioritizePage) {
                this.prioritizePage(priorityRects, priorityTiles);
            }
                
            // place all the tiles for the current page
            for (i = 0, len = priorityTiles.length; i < len; i++) {
                tile = priorityTiles[i];
                added = $.inArray(tile, this.tilesAdded) >= 0;

                cellRect = priorityRects[i];
                pixelRect = new Tiles.Rectangle(                        
                    cellRect.x * cellPlusPadding,
                    cellRect.y * cellPlusPadding,
                    (cellRect.width * cellPlusPadding) - this.cellPadding,
                    (cellRect.height * cellPlusPadding) - this.cellPadding);

                tile.resize(
                    cellRect,
                    pixelRect,
                    animate && !added && wasOrWillBeVisible(viewRect, tile, pixelRect),
                    duration);

                if (added) {

                    // decide whether to animate (fadeIn) and get the duration
                    animateTile = animate && wasOrWillBeVisible(viewRect, null, pixelRect);
                    if (animateTile && this.getAppendDelay) {
                        appendDelay = this.getAppendDelay(
                            cellRect, pageRects, priorityRects, 
                            tile, pageTiles, priorityTiles);
                    } else {
                        appendDelay = 0;
                    }


                    tile.appendTo(this.$el, animateTile, appendDelay, duration);
                }
            }
        }

        // fade out all removed tiles
        for (i = 0, len = this.tilesRemoved.length; i < len; i++) {
            tile = this.tilesRemoved[i];

            animateTile = animate && wasOrWillBeVisible(viewRect, tile, null);
            tile.remove(animateTile, duration);
        }

        // clear pending queues for add / remove
        this.tilesRemoved = [];
        this.tilesAdded = [];
        this.isDirty = false;

        if (onComplete) {
            setTimeout(function() { onComplete(true); }, duration + 10);
        }
    };

})(jQuery);






(function() {
  var c = [  {
        width: 6,
        height: 2,
        probability: 0.80
      },{
    width: 2,
    height: 2,
    probability: 0.15
  }, {
    width: 2,
    height: 1,
    probability: 0.2
  }, {
    width: 1,
    height: 1,
    probability: 0.65
  }];
  var d = [
  {
      cols: 7,
      tiles: 14,
      rows: ["AAAAAAA", "AAAAAAA"]
  },
  {
      cols: 6,
      tiles: 12,
      rows: ["AAAAAA", "AAAAAA"]
  },
  {
      cols: 5,
      tiles: 10,
      rows: ["AAAAA", "AAAAA"]
  },
  {
      cols: 4,
      tiles: 8,
      rows: ["AAAA", "AAAA"]
  },
  {
      cols: 3,
      tiles: 6,
      rows: ["AAA", "AAA"]
  },
  {
      cols: 2,
      tiles: 4,
      rows: ["AA", "AA"]
  },
  {
      cols: 1,
      tiles: 2,
      rows: ["A", "A"]
  },
  
  {
    cols: 5,
    tiles: 25,
    rows: [".AABB", "...BB", "CCDD.", "CC...", "EE...", "..FF.", ".GGHH", ".GGII"]
  }, {
    cols: 5,
    tiles: 25,
    rows: [".AABB", "CC.BB", "DDEE.", "DD.FF", ".GG..", "..HH.", "IIHH.", ".JJKK", ".JJLL"]
  }, {
    cols: 5,
    tiles: 25,
    rows: ["...AA", ".BB..", ".BB..", "CC...", "..DD.", "EEDD.", "...FF"]
  }, {
    cols: 5,
    tiles: 25,
    rows: [".AABB", "CC.BB", "DDEE.", "DD.FF", ".GG..", "..HH.", "IIHH.", ".JJKK", ".JJLL"]
  }];
  var a = {},
      b = "col-";
  PulseTileTemplates = {
    get: function(k, f) {
      var j = [],
          g, e, h;
      for (g = 0, e = d.length; g < e; g++) {
        h = d[g];
        if (h.cols === k && h.tiles === f) {
          j.push(h)
        }
      }

      if (j.length > 0) {
        g = Math.floor(Math.random() * j.length);

        return Tiles.Template.fromJSON(j[g].rows)
      }
      return Tiles.DiverseTemplates.get(k, f, c)
    },
    getStreamTemplate: function(h, j, f) {
      var e = a[h];
      if (e) {
        var g = e[b + j];
        if (g && g.rects.length <= f) {
          return g.copy()
        }
      }
      return null
    },
    setStreamTemplate: function(g, f) {
      var e = a[g];
      if (!e) {
        e = a[g] = {}
      }
      e[b + f.numCols] = f.copy()
    }
  }
})();




(function() {
  var j = 6,
      a = 50,
      m = 2;

  function d(q, p, r, t) {
    this.width = q;
    this.height = p;
    this.area = q * p;
    this.count = r;
    this.probability = t
  }
  d.sortByAreaDesc = function(q, p) {
    if (q.area > p.area) {
      return -1
    }
    if (q.area === p.area) {
      return 0
    }
    return 1
  };

  function e(q, p) {
    return Math.floor(Math.random() * (p - q + 1) + q)
  }
  function f(t) {
    var r = [],
        q, p;
    for (q = 0, p = t.length; q < p; q++) {
      r.push(t[q].count)
    }
    return JSON.stringify(r)
  }
  function b(u, w, B) {
    var r = [],
        p = 0,
        t = 0,
        v, x, F, A, E;
        
        
        var A = new d(u,2 , Math.ceil(1 * w), 1);
        // r.push(A);
        
    for (v = 0, x = B.length; v < x; v++) {
      F = B[v];
      if (F.width <= u) {
        A = new d(F.width, F.height, Math.ceil(F.probability * w), F.probability);
        r.push(A);
        t += A.count;
        p += (A.area * A.count)
      }
    }
    r.sort(d.sortByAreaDesc);

    var z = 0,
        C = 0,
        y = 0,
        D;
    var q = function(G, H) {
      var I = r[G];
      if (H < 0) {
        H = Math.max(H, -I.count)
      }
      I.count += H;
      t += H;
      p += (H * I.area)
    };
    while (z++ < a) {
      D = Math.ceil(p / u);
      for (v = r.length - 1; v >= 0; v--) {
        A = r[v];
        if (A.height > D || A.width > u) {
          q(v, -A.count)
        }
      }
      if (t !== w) {
        q(y, w - t)
      }
      if (p % u === 0) {
        for (C = 0; C < m; C++) {
          E = l(r, u, p / u);
          if (E) {
            return E
          }
        }
      } else {} if (y === r.length - 1) {
        q(y, 1);
        y--
      } else {
        q(y, -1);
        y++
      }
    }
    return null
  }
  function l(q, r, w) {
    var F = [],
        C, B;
    for (B = 0; B < w; B++) {
      F[B] = [];
      for (C = 0; C < r; C++) {
        F[B][C] = false
      }
    }
    var D = [],
        u, t, v, z, E, A;
    for (u = 0, v = q.length - 1; u < v; u++) {
      z = q[u];
      for (t = 0; t < z.count; t++) {
        E = k(z, F, r, w);
        h(E, D);
        A = n(E);
        if (!A) {
          return null
        }
        for (B = 0; B < A.height; B++) {
          for (C = 0; C < A.width; C++) {
            F[A.y + B][A.x + C] = true
          }
        }
        D.push(A)
      }
    }
    var p = q[q.length - 1];
    D = D.concat(k(p, F, r, w));
    D.sort(g);
    return new Tiles.Template(D, r, w)
  }
  function h(y, z) {
    var r = y.length,
        u = z.length,
        p, x, t, q, w, v;
    for (t = 0; t < r; t++) {
      p = y[t];
      p.penalty = 0;
      for (q = 0; q < u; q++) {
        x = z[q];
        if (p.x === x.x && p.width === x.width) {
          w = Math.min(Math.abs(p.y - (x.y + x.height)), Math.abs(x.y - (p.y + p.height)));
          v = Math.max(0, j - w) + 1;
          p.penalty += v
        } else {
          if (p.y === x.y && p.height === x.height) {
            w = Math.min(Math.abs(p.x - (x.x + x.width)), Math.abs(x.x - (p.x + p.width)));
            v = Math.max(0, j - w) + 1;
            p.penalty += v
          }
        }
      }
    }
  }
  function n(v) {
    var t = v.length;
    if (t === 0) {
      return null
    }
    v.sort(c);
    var p = v[0].penalty,
        u = [],
        r, q;
    for (r = 0; r < t; r++) {
      q = v[r];
      if (q.penalty > p) {
        break
      }
      u.push(q)
    }
    return u[e(0, u.length - 1)]
  }
  function g(q, p) {
    if (q.y < p.y) {
      return -1
    }
    if (q.y > p.y) {
      return 1
    }
    if (q.x < p.x) {
      return -1
    }
    if (q.x > p.x) {
      return 1
    }
    return 0
  }
  function c(q, p) {
    if (q.penalty < p.penalty) {
      return -1
    }
    if (q.penalty > p.penalty) {
      return 1
    }
    return 0
  }
  function k(w, E, q, v) {
    var D = Tiles.Rectangle,
        C = [],
        p = v - w.height + 1,
        u = q - w.width + 1,
        A, z, t, r, B;
    for (z = 0; z < p; z++) {
      for (A = 0; A < u; A++) {
        B = true;
        for (t = 0; t < w.height; t++) {
          for (r = 0; r < w.width; r++) {
            if (E[z + t][A + r]) {
              B = false;
              break
            }
          }
        }
        if (B) {
          C.push(new D(A, z, w.width, w.height))
        }
      }
    }
    return C
  }
  var o = [{
    width: 2,
    height: 2,
    probability: 0.2
  }, {
    width: 2,
    height: 1,
    probability: 0.25
  }, {
    width: 1,
    height: 2,
    probability: 0.25
  }, {
    width: 1,
    height: 1,
    probability: 0.3
  }];
  Tiles.DiverseTemplates = {
    get: function(r, p, q) {
      return b(r, p, q || o)
    }
  }
})();
