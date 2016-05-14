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
    puzzle.instantiate(WIDTH_COUNT, HEIGHT_COUNT, IMAGE_URL, play);

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
        //.then(function () {
        //    lifecycle.loop();
        //});



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

puzzle.instantiate = function(width, height, imageUrl, onLoaded) {
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
    load(imageUrl);

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