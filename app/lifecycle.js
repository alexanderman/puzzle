/**
 * Created by alex on 13/05/16.
 */

var puzzle = puzzle || {};

puzzle.lifecycle = function (engine, ui, runInterval) {

    var _moves = [], _interval, _delay, _missingSlot;

    function getSlot(e) {
        return $(e.currentTarget).data('slot');
    }
    function move(slot1, slot2, skipMoveSave) {
        slot1.cell.swap(slot2.cell);
        slot1.move(slot1.cell.position);
        slot2.move(slot2.cell.position);
        if (!skipMoveSave) _moves.push([slot1, slot2]);

        if (engine.isFinished()) {
            _moves.splice(0);
            cover()
            .then(function () {
                resetMissing();
                delay(1000, uncover);
            });
        }
    }
    function startRunnig(work) {
        if (!work) return;
        if (!_interval) {
            work();
            _interval = setInterval(function() {
                work();
            }, runInterval);
        }
    }
    function stopRunning() {
        clearInterval(_interval);
        _interval = null;
    }
    function delay(ms, callback) {
        var deferred = Q.defer();
        if (_delay) {
            deferred.reject('wrong delay call, _delay exists');
            return;
        }
        _delay = setTimeout(function(){
            _delay = null;
            callback();
            deferred.resolve();
        }, ms);
        return deferred.promise;
    }
    function isBusy() {
        return !!(_delay || _interval);
    }
    function uncover() {
        return delay(1000, function () {
            ui.showOverlay(false);
        })
        .then(function () {
            return delay(500, function () {
                _missingSlot.show(false);
            });
        });
    }
    function cover(){
        return delay(500, function () {
            _missingSlot.show(true);
        })
        .then(function () {
            return delay(1000, function () {
                ui.showOverlay(true);
            })
        });
    }
    function resetMissing() {
        engine.resetMissing();
        ui.slotList().forEach(function (slot) {
            slot.setMissing(slot.cell.missing);
            slot.show(true);
            if (slot.cell.missing) {
                _missingSlot = slot;
            }
        });
    }

    this.onMouseOver = function(e) {
        var slot = getSlot(e);
        if (slot.cell.hasMove()) {
            slot.highLight(true);
        }
    };

    this.onMouseOut = function(e) {
        var slot = getSlot(e);
        slot.highLight(false);
    };

    this.onSlotClick = function(e) {
        var slot = getSlot(e), moved = false, sibling;

        if (!moved && slot.cell.hasDown()) {
            move(slot, slot.cell.getDown().slot);
            moved = true;
        }
        if (!moved && slot.cell.hasUp()) {
            move(slot, slot.cell.getUp().slot);
            moved = true;
        }
        if (!moved && slot.cell.hasLeft()) {
            move(slot, slot.cell.getLeft().slot);
            moved = true;
        }
        if (!moved && slot.cell.hasRight()) {
            move(slot, slot.cell.getRight().slot);
            moved = true;
        }
    };

    this.revert = function () {
        var deferred = Q.defer();
        if (isBusy()) {
            deferred.reject('can not run revert, busy');
            return deferred.promise;
        }
        startRunnig(function (){
            var lastMove = _moves.pop();
            if (lastMove) {
                move(lastMove[0], lastMove[1], true);
            }
            else {
                stopRunning();
                deferred.resolve();
            }
        });
        return deferred.promise;
    };

    this.shuffle = function () {
        if (isBusy()) return Q.reject('can not run shuffle, busy');
        startRunnig(function () {
            var cells = engine.getRandomMove();
            move(cells[0].slot, cells[1].slot);
        });
        return delay(2000, stopRunning);
    };

    this.start = function () {
        ui.showOverlay(true);
        resetMissing();
        return uncover();
    };

    // not working: _interval is null after revert but _delay is not!
    this.loop = function () {
        var self = this;

        self.shuffle()
        .then(self.revert)
        .then(function () {
           self.loop();
        }).catch(function(err){
           console.log(err);
        });
    };


};



