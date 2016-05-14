/**
 * Created by alex on 06/05/16.
 */

var puzzle = puzzle || {};

puzzle.app = function() {

    var WIDTH_COUNT = 4, HEIGHT_COUNT = 4, DELAY = 100,
        //IMAGE_URL = 'https://scontent.fhfa2-1.fna.fbcdn.net/t31.0-8/13131562_10153585166336918_6514125832382980730_o.jpg';
        //IMAGE_URL = 'http://wanderingdanny.com/oxford/images/p/b4242667-wytham-woods-avenue.jpg';
        //IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/1/15/Hopwas_Woods_Sun.jpg';
        //IMAGE_URL = 'http://southerngaragebands.com/Aero_Woods.jpg';
        IMAGE_URL = 'http://rollycat.com/wp-content/uploads/2016/03/test.jpg';

    var moves = [], ui, engine, lifecycle;


    puzzle.loadImageFromLocation()
    .then(function (image) {
        puzzle.instantiate(WIDTH_COUNT, HEIGHT_COUNT, null, image, play);
    })
    .catch(function () {
        puzzle.instantiate(WIDTH_COUNT, HEIGHT_COUNT, IMAGE_URL, null, play);
    });


    // the place where the brains are connected
    // to elements and they start reacting
    function play(aUi, aEngine) {
        ui = aUi;
        engine = aEngine;
        lifecycle = new puzzle.lifecycle(engine, ui, DELAY);


        var slotList = ui.slotList();

        // attach brain cell to each slot
        slotList.forEach(function(slot, index) {
            slot.cell = engine.getCell(index);
            slot.cell.slot = slot;

            slot.place(slot.cell.position);
            //slot.label(slot.cell.index + 1);
            slot.bindEvents({
                mouseover: lifecycle.onMouseOver,
                mouseout: lifecycle.onMouseOut,
                click: lifecycle.onSlotClick
            });

        });

        lifecycle.start();


        $('.pz-btn-revert').unbind();
        $('.pz-btn-revert').bind({
            click: function(e) {
                lifecycle.revert();
            }
        });

        $('.pz-btn-shuffle').unbind();
        $('.pz-btn-shuffle').bind({
           click: function(e) {
               lifecycle.shuffle();
           }
        });


    }

};

puzzle.loadImageFromLocation = function () {
    var deferred = Q.defer();

    var match = /\?img=/.exec(window.location.href);
    if (match) {
        var index = window.location.href.indexOf('=', match.index);
        var url = decodeURIComponent(window.location.href.substr(index + 1));
        if (url) {
            return puzzle.loadImage(url);
        }
    }
    deferred.reject('no image url found');

    return deferred.promise;
};

puzzle.loadImage = function (url) {
    var deferred = Q.defer();
    var image = $('<img />', {src: url, class: 'pz-content-bg'});
    image.on('load', function (e) {
        deferred.resolve(image);
    });
    image.on('error', function (e) {
        deferred.reject('error loading image at ' + url);
    });
    return deferred.promise;
};

puzzle.instantiate = function(width, height, imageUrl, loadedImage, onLoaded) {
    function initiate(image) {
        var ui = new puzzle.uiControl('.pz-container', image, width, height),
            engine = new puzzle.engineClass(width, height);
        onLoaded(ui, engine);
    }

    function load(url) {
        puzzle.loadImage(url).then(function(image) {
            initiate(image);
        });
    }

    if (imageUrl)
        load(imageUrl);
    if (loadedImage)
        initiate(loadedImage);

    var input = $('input[type=text]');
    input.on('keyup change keydown keypress', function (e) {
        if (input.data('oldVal') !== input.val()) {
            input.data('oldVal', input.val());
            load(input.val());
        }
    });
    input.on('focus click', function (e) {
        input.select();
    });
};

new puzzle.app();