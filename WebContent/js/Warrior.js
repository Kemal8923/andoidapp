var Warrior = function(){
	this.canvas = document.getElementById("warrior");
	this._2d = this.canvas.getContext("2d");

	this.keyPressing = null;
	this.keyPrevious = null;
	
	this.map = {};
	
	//start
	this.start("map1.json");
	
};

Warrior.prototype.start = function(name){
	var self = this;
	$.ajax({
		type : "post",
		dataType : "json",
		url : "warrior/maps/"+name,
		success : function(map){
			self.map.name = map.name;
			self.map.size = {};
			self.map.size.width = map.size.width;
			self.map.size.height = map.size.height;
			self.map.layer1 = new Image();
			self.map.layer1.src = map.layer1;
			self.map.objects = [];
			for(var i=0, l=map.objects.length; i<l; i++){
				var obj = {}, _thisObject = map.objects[i];
				if(_thisObject.hero != undefined) 
					obj.hero = map.objects[i].hero;
				obj.img = new Image();
				obj.img.src = _thisObject.img;
				obj.size = {};
				obj.size.width = _thisObject.size.width;
				obj.size.height = _thisObject.size.height;
				obj.pos = {};
				obj.pos.x = _thisObject.position.x*32;//Tilesize is 32*32 px
				obj.pos.y = _thisObject.position.y*32;//Tilesize is 32*32 px
				obj.faceDir = _thisObject.faceDirection;
				obj.movementSpeed = _thisObject.movementSpeed;
				obj.animationStep = _thisObject.animationStep;
				obj.animationSwitch = 9 - 0.5 * obj.movementSpeed;
				obj.animationSwitchCounter = obj.animationSwitch;
				obj.isMoving = false;
				self.map.objects.push(obj);
			}
			self.gameLoop();
		},
		error : function(){ alert("ERROR: Could not load: "+name); }
	});
};

Warrior.prototype.gameLoop = function(){
	var self = this;
	
	window.setInterval(function(){
		self.handleUserInputs();
		self.draw();
	},
	40);
	
};

Warrior.prototype.draw = function(){
	
	this._2d.drawImage( this.map.layer1, 0, 0 );
	
	for(var i=0, l=this.map.objects.length; i<l; i++){
		this.move(this.map.objects[i]);
		this.standInMap(this.map.objects[i]);
	}
	
	for(var i=0, l=this.map.objects.length; i<l; i++){
		this.drawSubimage(this.map.objects[i]);
		if(this.map.objects[i].hero!=undefined) this.map.objects[i].isMoving = false;
	}
	
//	this._2d.fillStyle = "black";
//	this._2d.fillRect(5,5,100,80);
//	this._2d.font = "bold 12px Arial";
//	this._2d.fillStyle = "white";
//	this._2d.fillText("PREVKEY: "+this.keyPrevious,8,20);
//	this._2d.fillText("KEYPRES: "+this.keyPressing, 8, 40);
	
};

Warrior.prototype.handleUserInputs = function(){
	var self = this;
	
	$("body").keydown(function(k){
		if(self.keyPrevious==null) self.keyPrevious = k.keyCode;
		self.keyPressing = k.keyCode;   
	});
	
	$("body").keyup(function(k){
		if(self.keyPrevious === k.keyCode){
			self.keyPrevious = null;
		}
		else{
			self.keyPressing = self.keyPrevious;
		}
		
	});
};

Warrior.prototype.drawSubimage = function(obj){
	
	var UP = 38, RIGHT = 39, DOWN = 40, LEFT = 37;

	switch(obj.faceDir){
		case UP:
			this._2d.drawImage( 
					obj.img, 
					obj.animationStep*obj.size.width, 
					obj.size.height*3, 
					obj.size.width, obj.size.height,
					
					obj.pos.x, obj.pos.y, obj.size.width, obj.size.height
				);
			break;
		case RIGHT:
			this._2d.drawImage( 
					obj.img, 
					obj.animationStep*obj.size.width, 
					obj.size.height*2, 
					obj.size.width, obj.size.height,
					
					obj.pos.x, obj.pos.y, obj.size.width, obj.size.height
				);
			break;
		case DOWN:
			this._2d.drawImage( 
					obj.img, 
					obj.animationStep*obj.size.width, 
					0, 
					obj.size.width, obj.size.height,
					
					obj.pos.x, obj.pos.y, obj.size.width, obj.size.height
				);
			break;
		case LEFT:
			this._2d.drawImage( 
					obj.img, 
					obj.animationStep*obj.size.width, 
					obj.size.height, 
					obj.size.width, obj.size.height,
					
					obj.pos.x, obj.pos.y, obj.size.width, obj.size.height
				);
			break;
	}
};

Warrior.prototype.move = function(obj){
	
	var UP = 38, RIGHT = 39, DOWN = 40, LEFT = 37;
	
	if(obj.isMoving){
		obj.animationSwitchCounter++;
		if(obj.animationSwitchCounter>=obj.animationSwitch){
			obj.animationSwitchCounter = 0;
			obj.animationStep++;
			if(obj.animationStep===4) obj.animationStep = 0;
		}
	}
	else{
		obj.animationStep = 0;
		obj.animationSwitchCounter = obj.animationSwitch;
	}
	
	if(obj.hero != undefined){
		if(this.keyPressing != null){
			obj.isMoving = true;
			switch(this.keyPressing){
				case UP:
					obj.faceDir = UP;
					obj.pos.y -= obj.movementSpeed;
					break;
				case RIGHT:
					obj.faceDir = RIGHT;
					obj.pos.x += obj.movementSpeed;
					break;
				case DOWN:
					obj.faceDir = DOWN;
					obj.pos.y += obj.movementSpeed;
					break;
				case LEFT:
					obj.faceDir = LEFT;
					obj.pos.x -= obj.movementSpeed;
					break;
			}
		}
	}
	else{
		if(obj.goDir===0 && obj.goDir != undefined){
			var randomDir = 36+(Math.ceil(Math.random()*4));
			obj.goDir = 1+Math.ceil(Math.random()*5);
		}
		else{
			var randomDir = 36+(Math.ceil(Math.random()*4));
			obj.goDir = 1+Math.ceil(Math.random()*5);
		}
		obj.goDir--;
		obj.faceDir = randomDir;
		obj.isMoving = true;
		switch(randomDir){
			case UP:
				obj.pos.y -= obj.movementSpeed;
				break;
			case RIGHT:
				obj.pos.x += obj.movementSpeed;
				break;
			case DOWN:
				obj.pos.y += obj.movementSpeed;
				break;
			case LEFT:
				obj.pos.x -= obj.movementSpeed;
				break;
		}
	}

};

Warrior.prototype.standInMap = function(obj){
	
	var UP = 38, RIGHT = 39, DOWN = 40, LEFT = 37;
	
	if(
			obj.isMoving && obj.pos.x < 0 || obj.pos.y < 0 || obj.pos.y+obj.size.height > this.map.size.height || obj.pos.x+obj.size.width > this.map.size.width
	){
		switch(obj.faceDir){
			case UP:
				obj.pos.y += obj.movementSpeed;
				break;
			case RIGHT:
				obj.pos.x -= obj.movementSpeed;
				break;
			case DOWN:
				obj.pos.y -= obj.movementSpeed;
				break;
			case LEFT:
				obj.pos.x += obj.movementSpeed;
				break;
		}
	}	
};