define(['lib/interact'],function(interact) {

  const InputManager = Class.extend({

    init: function(gui, game) {
      this.gui = gui;
      this.game = game;

      const self = this;
      var startPos = undefined;
      var moveContainer = [];
      var canSubmit = false;

      interact('.next-tile').draggable({
        snap: {
          targets: [],
          range: Infinity,
          relativePoints: [{x: 0.5, y: 0.5 }],
          endOnly: true
        },
        onstart: function (event) {
          var rect = interact.getElementRect(event.target);

          event.target.parentNode.appendChild(event.target);

          // record center point when starting the very first a drag
          startPos = {
            x: rect.left + rect.width  / 2,
            y: rect.top  + rect.height / 2
          };

          event.interactable.draggable({
            snap: {
              targets: [startPos]
            }
          });

        },
        onmove: dragMoveListener,
        onend: dragEndListener
      });

      interact('.dropzone').dropzone({
        accept: '.next-tile',

        ondropactivate: function (event) {
          event.target.classList.add('can--drop');
          event.target.classList.remove('bad--catch', 'good--catch');
        },
        ondragenter: function (event) {
          var draggableElement = event.relatedTarget,
          dropzoneElement = event.target,
          dropRect = interact.getElementRect(dropzoneElement),
          dropCenter = {
            x: dropRect.left + dropRect.width / 2,
            y: dropRect.top + dropRect.height / 2
          },
          nextTile = self.game.nextTile;

          event.draggable.draggable({
            snap: {
              targets: [dropCenter]
            }
          });

          self.gui.validateTilePlacement(nextTile, event.target, "drag");

        },
        ondragleave: function (event) {
          // remove the drop feedback style
          event.target.classList.remove('can--catch', 'caught--it', 'cannot--catch');
          event.relatedTarget.classList.remove('drop--me');
        },
        ondrop: function (event) {
          var nextTile = self.game.nextTile,
          x = Number(event.target.dataset.x),
          y = Number(event.target.dataset.y);

          self.gui.validateTilePlacement(nextTile, event.target, "drop");
          //console.log("this:", event.relatedTarget, "got dropped:", event.target.dataset);
          event.relatedTarget.dataset.grid_id = event.target.id;
          addToMoveContainer(event.relatedTarget);
        }
      });

      interact(self.gui.gameGridContainer).draggable({
        // enable inertial throwing
        inertia: true,
        // keep the element within the area
        restrict: {
          //restriction: {top: -(boardPxSize-250), left: -(boardPxSize-250), bottom: (boardPxSize+500), right: (boardPxSize)},
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },

        onmove: dragMoveListenerWithMoveContainer,
        onend: gridDragEndListener
      });

      function addToMoveContainer (object) {
        // don't add object to moveContainer if it's already in
        if (moveContainer.includes(object)) {
          null
        } else {
          moveContainer.push(object);
        }
      };

      function dragMoveListener (event) {
        var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // translate the element
        target.style.webkitTransform =
        target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        target.classList.add('getting--dragged');
      };

      function dragMoveListenerWithMoveContainer (event) {
        var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // translate the element
        target.style.webkitTransform =
        target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        target.classList.add('getting--dragged');

        // move what's in the moveContainer as well
        for (var i=0;i<moveContainer.length;i++) {
          var target = moveContainer[i],
          // keep the dragged position in the data-x/data-y attributes
          x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
          y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

          // translate the element
          target.style.webkitTransform =
          target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';

          // update the positon attributes
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
          target.classList.add('getting--dragged');
        }
      };

      function dragEndListener (event) {
        event.target.classList.remove('getting--dragged');
      };

      function gridDragEndListener (event) {
        // set dropzone class only to elements in the bounds
        // of the game mask
        for (var i = 0; i<self.gui.gridTiles.length; i++) {
          if(isGridElementinView(self.gui.gridTiles[i][0])) {
            self.gui.gridTiles[i][0].classList.add('dropzone');
          } else {
            self.gui.gridTiles[i][0].classList.remove('dropzone');
          }
        }
        event.target.classList.remove('getting--dragged');
      };

      function isGridElementinView (grid_element) {
        // function which checks if grid element is
        // in the bounds of the game mask. Used by
        // gridDragEndListener to check whether the element
        // should be set as a valid dropzone or not
        var grid_rect = grid_element.getBoundingClientRect();

        var mask_rect = $(self.gui.gameMask)[0].getBoundingClientRect();

        return (
          grid_rect.top >= mask_rect.top &&
          grid_rect.left >= mask_rect.left &&
          grid_rect.bottom <= mask_rect.bottom &&
          grid_rect.right <= mask_rect.right
        );
      };
    },

    setup: function(options) {
    }

  });

  return InputManager;
});
