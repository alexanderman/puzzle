/**
 * Created by alex on 07/05/16.
 */

var puzzle = puzzle || {};

puzzle.uiControl = function (containerSelector, imageElement, widthCount, heightCount) {
    'use strict';

    var container = $(containerSelector), slotList = [], board = [],
        overlay;
    var divProps = {
        width: Math.floor(container.width() / widthCount),
        height: Math.floor(container.height() / heightCount)
    };


    function SlotClass(div, row, col) {
        var elem = div;
        var inPlace = false;
        slotList.push(this);
        var isMissing = false;

        this.position = {row: row, col: col};
        this.point = function () {
            return elem.position();
        };

        this.bindEvents = function (events) {
            elem.bind(events);
        };

        this.highLight = function (isHi) {
            if (!inPlace) elem.css({'border': (isHi ? 'solid 1px black' : 'solid 1px transparent')});
        };

        this.showInPlace = function (isIn) {
            inPlace = isIn;
            if (inPlace) this.highLight(true);
        };

        this.place = function (position) {
            var style = {left: position.col * divProps.width + 'px', top: position.row * divProps.height + 'px'};
            elem.css(style);
            container.append(elem);
        };
        this.move = function (position) {
            var style = {left: position.col * divProps.width + 'px', top: position.row * divProps.height + 'px'};
            if (!isMissing) {
                style['z-index'] = 1;
                setTimeout(function () {
                    elem.css({'z-index': 0});
                }, 200);
            }
            elem.css(style);
        };

        this.label = function (text) {
            var div = $('<div/>', {class: 'label'});
            var h1 = $('<h1/>');
            div.append(h1);
            h1.html(text);
            elem.append(div);
        };

        this.setMissing = function (missing) {
            isMissing = missing;
        };

        this.show = function (isShow) {
            if (isShow) {
                elem.removeClass('hidden');
            }
            else {
                elem.addClass('hidden');
            }
        }


    }

    function createBackground(img) {
        var width = container.width(), height = container.height();
        var imgWidth = img[0].naturalWidth, imgHeight = img[0].naturalHeight, proportions = imgHeight / imgWidth;
        var imgProps = {};

        if (width * proportions >= height) {
            imgProps.width = width;
            imgProps.height = Math.floor(width * proportions);
        }
        else {
            imgProps.width = Math.floor(height / proportions);
            imgProps.height = height;
        }
        imgProps.left = Math.floor(width / 2) - Math.floor(imgProps.width / 2);
        imgProps.top = Math.floor(height / 2) - Math.floor(imgProps.height / 2);

        var fixY = 1, fixX = 1;
        img.css({
            width: imgProps.width + 'px',
            height: imgProps.height + 'px',
            left: imgProps.left + fixX + 'px',
            top: imgProps.top + fixY + 'px'
        });
        container.html('');
        var bg = $('<div/>', {class: 'pz-container-bg'});
        bg.append(img);
        container.append(bg);

        createOverlay(bg);

        return imgProps;
    }

    function createOverlay(bgDiv) {
        overlay = bgDiv.clone();
        overlay.addClass('pz-overlay');
        overlay.find('img').css({opacity: 1});
        container.append(overlay);
    }


    function createScene(imgProps) {
        function div(style) {
            var elem = $('<div/>', {class: 'puzzle-slot'});
            Object.keys(style).forEach(function (key) {
                elem.css(key, style[key] + 'px');
            });
            return elem;
        }

        function image(style, originalImage) {
            var elem = originalImage.clone();
            elem.attr('class', 'puzzle-slot-img');
            elem.css(style);
            return elem;
        }

        for (var row = 0; row < heightCount; row++) {
            board.push([]);
            for (var col = 0; col < widthCount; col++) {

                var divStyle = $.extend({}, divProps);
                divStyle.top = row * divProps.height;
                divStyle.left = col * divProps.width;

                var imgStyle = $.extend({}, imgProps);
                imgStyle.top = imgStyle.top - divStyle.top;
                imgStyle.left = imgStyle.left - divStyle.left;

                var divElem = div(divStyle);
                var imgElem = image(imgStyle, imageElement);
                divElem.append(imgElem);

                board[row].push(new SlotClass(divElem, row, col));
                divElem.data('slot', board[row][col]);
            }
        }

    }

    createScene(createBackground(imageElement));


    this.slotList = function () {
        return slotList;
    };

    this.showOverlay = function (isShow) {
        overlay.css({visibility: isShow ? 'visible' : 'hidden', opacity: isShow ? 1 : 0});
    };


};


