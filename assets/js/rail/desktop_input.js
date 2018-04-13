var DesktopInput = (function () {
	// private static
	var nextId = 1;
	
	// constructor
	
	var __constructor = function (context) {
		// private
		var id = nextId++;
		if (context) {
			var context = context;
		}

		// public (this instance only)
		this.draw_button_layer = function () {
			var initGameBox = document.createElement("button");
			initGameBox.id = "init-box";
			initGameBox.innerHTML = "Initalize Game";
			
			(function() {
				initGameBox.addEventListener("click", function() {
					console.log("new Game");
					context.gameEngine.init();
				});
			})();
			
			context.elements.gameInfoLeft.append(initGameBox);
			
			var newTileBox = document.createElement("button");
			newTileBox.id = "newtile-box";
			newTileBox.innerHTML = "New Tile";
			
			(function() {
				newTileBox.addEventListener("click", function() {
					console.log("new Tile");
					context.gameObj.create_next_tile();
					context.boardView.render();
				});
			})();
			
			context.elements.gameInfoLeft.append(newTileBox);
			
			var saveBox = document.createElement("button");
			saveBox.id = "save-box";
			saveBox.innerHTML = "Save Game";
			
			(function() {
				saveBox.addEventListener("click", function() {
					console.log("saving game...");
					console.log(context.gameObj.save_game());
					localStorage.setItem('saveGame', JSON.stringify(context.gameObj.save_game()));
				});
			})();
			
			context.elements.gameInfoLeft.append(saveBox);
			
			var loadBox = document.createElement("button");
			loadBox.id = "load-box";
			loadBox.innerHTML = "Load Game";
			
			(function() {
				loadBox.addEventListener("click", function() {
					console.log("loading game...");
					if (localStorage.saveGame) {
						var load = localStorage.getItem('saveGame');
						context.gameObj.load_game(JSON.parse(load));
						context.boardView.render();
					}
				});
			})();
			
			context.elements.gameInfoLeft.append(loadBox);
		};
		
		this.init_interact_layer = function () {
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
					nextTile = context.gameObj.get_next_tile();
					
					event.draggable.draggable({
						snap: {
							targets: [dropCenter]
						}
					});
					
					dragValidPlacementAddClasses(draggableElement, dropzoneElement);
					
				},
				ondragleave: function (event) {
				    // remove the drop feedback style
				    event.target.classList.remove('can--catch', 'caught--it', 'cannot--catch');
				    event.relatedTarget.classList.remove('drop--me');
				},
				ondrop: function (event) {
			    	var nextTile = context.gameObj.get_next_tile(),
			    	x = Number(event.target.dataset.x),
			    	y = Number(event.target.dataset.y);
			    	
			    	dropValidPlacementAddClasses(event.relatedTarget, event.target);
			    	//console.log("this:", event.relatedTarget, "got dropped:", event.target.dataset);
					event.relatedTarget.dataset.grid_id = event.target.id;
					addToMoveContainer(event.relatedTarget);
				}
			});
			
			interact('#'+context.elements.gameGrid.id).draggable({
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
						
			function dragValidPlacementAddClasses (draggableElement, dropzoneElement) {
				var nextTile = context.gameObj.get_next_tile();
				var drop_x = Number(dropzoneElement.dataset.x);
				var drop_y = Number(dropzoneElement.dataset.y);
				
				// check tile placement's validity
				if (context.gameObj.get_board().check_valid_placement(nextTile, drop_x, drop_y)) {
					// feedback the possibility of a drop
					dropzoneElement.classList.add('can--catch');
					draggableElement.classList.add('drop--me');
				} else {
					dropzoneElement.classList.add('cannot--catch');
				}
			};
			
			function dropValidPlacementAddClasses (draggableElement, dropzoneElement) {
				//console.log(draggableElement, dropzoneElement);
				var nextTile = context.gameObj.get_next_tile();
				var drop_x = Number(dropzoneElement.dataset.x);
				var drop_y = Number(dropzoneElement.dataset.y);
				
				// clear present classes
				dropzoneElement.classList.remove('bad--catch', 'good--catch');
						
				// check tile placement's validity
				if (context.gameObj.get_board().check_valid_placement(nextTile, drop_x, drop_y)) {
					// feedback the possibility of a drop
					dropzoneElement.classList.add('good--catch');
					context.elements.submitBox.classList.add("active");
					context.elements.submitBox.disabled = false;
					canSubmit = true;
				} else {
					dropzoneElement.classList.add('bad--catch');
					context.elements.submitBox.classList.remove("active");
					context.elements.submitBox.disabled = true;
					canSubmit = false;
				}
			};
			
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
				for (var i = 0; i<context.elements.gridTiles.length; i++) {
					if(isGridElementinView(context.elements.gridTiles[i])) {
						context.elements.gridTiles[i].classList.add('dropzone');
					} else {
						context.elements.gridTiles[i].classList.remove('dropzone');
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
				
				var mask_rect = context.elements.gameMask.getBoundingClientRect();
				
				return (
				    grid_rect.top >= mask_rect.top &&
				    grid_rect.left >= mask_rect.left &&
				    grid_rect.bottom <= mask_rect.bottom &&
				    grid_rect.right <= mask_rect.right
				);
			};
		};

	};
	
	// public static
	__constructor.get_nextId = function () {
		return nextId;
	};
	
	return __constructor;
})();
