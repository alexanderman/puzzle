/**
 * Created by alex on 06/05/16.
 */

var puzzle = puzzle || {};

puzzle.engineClass = function(width, height) {
    'use strict';

    var missingSlotsNumber = 1, missingCell;

    var slotList = [];
    var dataSet = [];

    // <editor-fold desc="BrainClass">
    function BrainClass(index, row, col){
        this.index = index;
        this.missing = false;
        this.position = { row:row, col:col };
    }
    BrainClass.prototype.hasUp = function() {
        var sibling = (dataSet[this.position.row-1] || {})[this.position.col];
        return sibling && sibling.missing;
    };
    BrainClass.prototype.getUp = function() {
        var sibling = (dataSet[this.position.row-1] || {})[this.position.col];
        return sibling;
    };
    BrainClass.prototype.hasDown = function() {
        var sibling = (dataSet[this.position.row+1] || {})[this.position.col];
        return sibling && sibling.missing;
    };
    BrainClass.prototype.getDown = function() {
        var sibling = (dataSet[this.position.row+1] || {})[this.position.col];
        return sibling;
    };
    BrainClass.prototype.hasLeft = function() {
        var sibling = (dataSet[this.position.row] || {})[this.position.col-1];
        return sibling && sibling.missing;
    };
    BrainClass.prototype.getLeft = function() {
        var sibling = (dataSet[this.position.row] || {})[this.position.col-1];
        return sibling;
    };
    BrainClass.prototype.hasRight = function() {
        var sibling = (dataSet[this.position.row] || {})[this.position.col+1];
        return sibling && sibling.missing;
    };
    BrainClass.prototype.getRight = function() {
        var sibling = (dataSet[this.position.row] || {})[this.position.col+1];
        return sibling;
    };
    BrainClass.prototype.hasMove = function() {
        return this.hasDown() || this.hasLeft() || this.hasRight() || this.hasUp();
    };
    BrainClass.prototype.swap = function(cell) {
        var tempPos = this.position;
        this.position = cell.position;
        cell.position = tempPos;
        dataSet[cell.position.row][cell.position.col] = cell;
        dataSet[this.position.row][this.position.col] = this;
    };
    BrainClass.prototype.isInPlace = function() {
      return this.index === this.position.row * width + this.position.col;
    };

    BrainClass.prototype.toString = function() {
        return '   '.substr(this.index.toString().length) + this.index.toString();
    };
    // </editor-fold>

    function shuffle(list) {
        var len = list.length;
        while (len > 0) {
            var index = Math.floor(Math.random() * len);
            len--;
            var temp = list[len];
            list[len] = list[index];
            list[index] = temp;
        }
    }
    function geIndexList(len) {
        var list = [];
        for (var i=0; i<len; i++) { list.push(i); }
        return list;
    }

    // TODO: change dataSet to object (key row-col)
    function populateDataSet(shuffled) {
        dataSet = [];
        for (var row=0; row<height; row++) {
            dataSet.push([]);
            for (var col=0; col<width; col++) {
                var shuffledIdx = shuffled[width * row + col];
                var cell = slotList[shuffledIdx];
                cell.position = { row:row, col:col };
                dataSet[row].push(cell);
            }
        }
    }

    function logData() {
        console.log(
        dataSet.map(function (row) {
            return row.toString();
        }).join('\n')
        );
    }

    var i;
    for (i=0; i<width*height; i++) {
        slotList.push( new BrainClass(i, Math.floor(i/width), i%width) );
    }
    populateDataSet(geIndexList(width * height));

    this.resetMissing = function () {
        if (missingCell) {
            missingCell.missing = false;
        }
        for (i=0; i<missingSlotsNumber; i++) {
            missingCell = slotList[Math.floor(Math.random() * slotList.length)];
            missingCell.missing = true;
        }
    };

    this.getCell = function(i) {
        return slotList[i];
    };

    this.shuffle = function() {
        var indexes = geIndexList(width * height);
        shuffle(indexes);
        populateDataSet(indexes);
        return indexes;
    };

    this.isFinished = function() {
        for (var i=0; i<slotList.length; i++) {
            if (!slotList[i].isInPlace()) return false;
        }
        return true;
    };

    var lastMissingPos;
    this.getRandomMove = function() {
        var p = missingCell.position;

        var moves = [
            { row: p.row-1, col: p.col },
            { row: p.row+1, col: p.col },
            { row: p.row, col: p.col-1 },
            { row: p.row, col: p.col+1 }
        ];
        // excluding last move
        if (lastMissingPos) {
            for (var i=0; i<moves.length; i++) {
                if (moves[i].col === lastMissingPos.col && moves[i].row === lastMissingPos.row) {
                    moves.splice(i, 1);
                    break;
                }
            }
        }
        lastMissingPos = p;

        var possibleCells = [];
        moves.forEach(function(p) {
            if ((dataSet[p.row] || {})[p.col]) {
                possibleCells.push(dataSet[p.row][p.col]);
            }
        });

        var index = Math.floor(Math.random() * possibleCells.length);
        return [possibleCells[index], missingCell];
    };



};



