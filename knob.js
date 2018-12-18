/****************************/	
/**     Knob Object        **/
/** ---------------------- **/
//knob object
/****************************/	
/**
 *  Constructor
 *  @param {string} id: Used to identify canvas element on html to be used with document.getElementByID()
 *  @param {string} type: we can create two knobs:
 *  'ring' 
 *  'gradient' 
 *  @param {object} style: Used to stylish knob with diferents properties:
 *   <!------------------->
 *   <!-- gradient type -->
 *   <!------------------->
 *	style.indicatorFill: fill Gradient used in indicator of value 
 *	style.indicatorDoubleFill: when indicatorType=="double" it's used as second indicator fill Gradient
 *	style.indicatorGradientOrientation: used to establish direction of indicatorFill and indicatorDoubleFill linear gradient 
 *	style.trackFill: fill Color for indicator' track
 *	style.trackStroke: stroke Color for indicator's track
 *	style.outerWheelFill: fill Gradient for Center outer circle
 *	style.outerGradientOrientation: used to establish direction of outerWheelFill linear gradient 
 *	style.innerWheelFill: fill Gradient for Center inner circle
 *	style.innerGradientOrientation: used to establish direction of innerWheelFill linear gradient  
 *	style.shadowFill: fill Color for innerWheel shadow
 *	style.mouseMoveSizePhactor: % size of outerWheel when mousemove event regarded to (diameter / 2) of 80% canvas width
 *	style.mouseUpSizePhactor: % size of outerWheel when mouseup event regarded to (diameter / 2) of 80% canvas width
 *  style.indicatorType: when single use indicatorFill color for 0 to 100% values, when double used indicatorFill color for value 0 to 50% 
 * 	'single' 																	   and indicatorDoubleFill color for value 50 to 100%
 *  'double' 
 * 	<!------------------->
 * 	<!--   ring type   -->
 * 	<!------------------->
 *	style.ring: amount of ring [0 to 20] for knob circunference
 *	style.indicatorFill: Fill color used in indicator of value 
 *	style.ringFill: Fill color used in rings
 *	style.outerWheelFill: fill Gradient for Center outer circle
 *	style.outerWheelFill: fill Gradient for Center inner circle
 *  @param {number} trackCircleSize: size for track circle circumference
 *	'1 = full circumference track'
 *	'1/2 half circumference track'
 *	'3/4 third-fourth circumference track'
 *  @param {number} width: knob width
 *  @param {number} height: knob height
 *  @param {number} min: min value, same as used in range and number html element
 *  @param {number} max: max value, same as used in range and number html element
 *  @param {number} value: value, same as used in range and number html element
 *  @param {number} step: step, same as used in range and number html element
 *  @param {number} stepTime: time in miliseconds that takes the step to increment it's value on mousemove to wheel by dragging it is used to calculate the amount of step that change when mousemove with left click pressed
 *  @param {string} unit: that represent this value is used to access it and display on info label, etc...
 *  "hz", "cents", "db", "sec", "%", "bpm", "º":
 *  @param {function} onChange: callback function in response to knob value change
 *  @param {string} hint: information on what the knob used for
 *
 *  @public
 *
 *	@return {void}   
 */ 
function knob(id, type, style, trackCircleSize, width, height, min=0, max=100,  value=0, step=1, stepTime=100, unit, onChange, hint)
{

	this.type = type; //type of knob; ring or gradient
	this.id = id; //will be used as identifier in canvas element on html DOM
	this.min = min;	//the same property that use input[type="number"] or input[type="range"]
	this.max = max; //the same property that use input[type="number"] or input[type="range"]
	this.step = step; //the same property that use input[type="number"] or input[type="range"]
	this.stepTime = stepTime; 
	this.value = value; //the same property that use input[type="number"] or input[type="range"]
	this.unit = unit; //unit that repesent this value eg. %, db, hz, etc
	if (this.value > this.max){this.value = this.max;} //assure that value is not less than this.min
	if (this.value < this.min){this.value = this.min;} //assure that value is not greater than this.max
	this.onChange = onChange; //callback function in response the value changes
	this.hint = hint; //information of what this object represent to be used on info labels
	
	//User Interface Properties
	this.style = style; //color and other properties settings
	this.width = width; //width of object
	this.height = height; //height of object
	this.canvas;	//html element that will contain the object
	
	//MANIPULATING PROPERTIES
	this.previousTime = 0//store the time when mouse move with pressed event.buttons= 1 (left mouse button ) to calculate later on mousemove time that user takes to move an this way calculate the amount of increment or decrement
	
	//Calculate the min and max angle of track circunference
	let circleLength = 360 * parseFloat(trackCircleSize) ; //calculate the max circle angle of track circunference
	circleLength = 360 - circleLength;
	this.minAngle = (circleLength/2);									
	this.maxAngle = 360 - (circleLength/2);
	
	this.valueToAngle(); //call function that calulate angle based on value and min, max value;

}	

/**
 *  Attach Knob to container html element
 *  @param {CSS class selector} style of canvas
 *  @param {html Element} container of knob
 *
 *  @public
 *
 *	@return {void}   
 */ 
 knob.prototype.attachUI = function(style, container)
 {
	  //create canvas element that will contain the knob object
	 this.canvas = document.createElement('canvas'); 
	 this.canvas.id = this.id; 
	 this.canvas.title = this.hint; 
	 this.canvas.width = this.width;
	 this.canvas.height = this.height;
	 this.canvas.style = "cursor:pointer; cursor:hand;";
	 this.canvas.classList.add(style); 
	 this.canvas.setAttribute('data-type',"knob-object"); 
	 //this.canvas.title= this.hint; 
	 container.appendChild(this.canvas); 
	  
	this.drawOnMouseUp()
  }
  
/**
 *  draw Knob while mouse move 
 *
 *  @public
 *
 *	@return {void}   
 */ 
  knob.prototype.drawOnMouseMove = function()
  {
	  this.draw("mouseMove");
  }  
  
/**
 *  draw while mouse is not moving
 *
 *  @public
 *
 *	@return {void}   
 */ 
  knob.prototype.drawOnMouseUp = function()
  {
	 this.draw("mouseUp");			  
  }
  
 /**
 *  draw knob
 *  @param {string} state:  MouseMove or MouseUp
 * 'mouseMove' draw with mouseMove effects
 * 'mouseUp' draw with mouseUp effects
 *
 *  @public
 *
 *	@return {void}   
 */ 
  knob.prototype.draw = function(state)
  {
	 let ctx = this.canvas.getContext("2d");	
	 ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
     ctx.beginPath();	
	 let centerX = this.canvas.width/2;
	 let centerY = this.canvas.height/2; 			  
	  
	  switch (this.type)
	  {
		// <!-- gradient --> //	  
	   	case 'gradient':	  
			var knobOffset;
	 		var diameter;
	 		var radius;
	 		var lineWidth;
	 		var innerRadius;
			  
			knobOffset = this.canvas.width * 20/100;
	 		diameter = this.canvas.width - knobOffset;
	 		radius = diameter / 2;
	 		lineWidth = diameter / 15;
		
			 let multiplierPhactor=0; //size of centerRadius regarded to canvas width
			 switch(state){
				 case "mouseMove": multiplierPhactor = this.style.mouseMoveSizePhactor; break;
				 case "mouseUp": multiplierPhactor =this.style.mouseUpSizePhactor; break;}
	 		// circle outer size //	 	
	  		centerRadius = (radius * multiplierPhactor)/100
	  		ctx.save();
			  
			
			 var indicatorFill;
			 // track indicatorFill //
			if (this.style.indicatorType == "single")
			{ 
				var clockwise = false; 
				var angleOffset = 90;
				indicatorFill = this.style.indicatorFill;
			}
			 else
			{
				angleOffset = 270-this.minAngle; 
				if (this.angle>=180)
				{					
					clockwise = true;
					indicatorFill = this.style.indicatorFill;
					
				}
				else
				{
					clockwise = false;
					indicatorFill = this.style.indicatorDoubleFill;
				}
			}
	 
			  
	  		// track//
	  		ctx.beginPath();    	
	  		ctx.fillStyle = this.style.trackFill
	  		ctx.strokeStyle =this.style.trackStroke;
	  		ctx.lineWidth = lineWidth;
	  		ctx.lineTo(centerX, centerY);
	  		ctx.arc(centerX, centerY, radius, (this.minAngle+90) * Math.PI/ 180,  (this.maxAngle+90)  * Math.PI/ 180, false);
	  		ctx.lineTo(centerX, centerY);
	  		ctx.stroke();
	  		ctx.fill();
	  
			// track indicatorFill  
			 if (this.style.innerGradientOrientation== "vertical")
			{
				var indicatorFillGradient = ctx.createLinearGradient(0,centerY - radius, 0 ,centerY + radius);	
			}
			else
			{
				var indicatorFillGradient = ctx.createLinearGradient(centerX - radius, 0 ,centerX + radius, 0);
			}
			//call linear gradient cretor function
			linearGradientCreator(indicatorFillGradient, indicatorFill);
			  
			  
	  		ctx.beginPath();
	  		ctx.fillStyle = indicatorFillGradient;
	  		ctx.lineWidth = lineWidth/2;
	  		ctx.lineTo(centerX, centerY);
	  		ctx.arc(centerX, centerY, radius, (this.minAngle+angleOffset) * Math.PI/ 180, ((this.minAngle + this.maxAngle+90)  -this.angle)  * (Math.PI/180), clockwise);
	  		ctx.lineTo(centerX, centerY);
	  		ctx.fill();	  
	  	  
	  		// trackStroke //
	  		ctx.beginPath();
	  		ctx.strokeStyle = this.style.trackStroke;
	    	ctx.lineWidth = lineWidth;
	  		ctx.lineTo(centerX, centerY);
	  		ctx.arc(centerX, centerY, centerRadius , (this.minAngle+90) * Math.PI/ 180,  (this.maxAngle+90) * Math.PI/ 180, false);
	  		ctx.lineTo(centerX, centerY);
	  		ctx.stroke();
	  			 

			  
	  		// outerWheel Fill //
			if (this.style.outerGradientOrientation== "vertical")
			{
				var outerWheelGradient = ctx.createLinearGradient(0,centerY - centerRadius, 0 ,centerY + centerRadius);	
			}
			else
			{
				var outerWheelGradient = ctx.createLinearGradient(centerX - centerRadius, 0 ,centerX + centerRadius, 0);
			}
	  				
			//call linear gradient cretor function
			linearGradientCreator(outerWheelGradient, this.style.outerWheelFill);	
			  
	  		ctx.beginPath();	   		
			//only display shadow if max angle <=315
			if(this.maxAngle<=315) 
			{
				// center shadow fill //
	  			ctx.shadowOffsetX = 0;
	  			ctx.shadowOffsetY = (centerRadius/5);
	  			ctx.shadowBlur = (centerRadius/5);
	  			ctx.shadowColor = this.style.shadowFill;
			}			  
			ctx.fillStyle = outerWheelGradient;
	  		ctx.arc(centerX, centerY, centerRadius, 0 * Math.PI/ 180,  360 * Math.PI/ 180, false);
	  		ctx.fill();		
	
	  		// innerWheel Fill //
			innerRadius = (centerRadius * 90)/100;	
			if (this.style.innerGradientOrientation== "vertical")
			{
				var  innerWheelGradient = ctx.createLinearGradient(0,centerY - innerRadius, 0 , centerY + innerRadius);	
			}
			else
			{
				var  innerWheelGradient = ctx.createLinearGradient(centerX - innerRadius, 0 , centerX + innerRadius, 0);
			}
			//call linear gradient cretor function
			linearGradientCreator(innerWheelGradient, this.style.innerWheelFill); 			  
		
	  		ctx.beginPath();	  
	  		ctx.fillStyle = innerWheelGradient;	  
	  		ctx.arc(centerX, centerY,innerRadius , 0 * Math.PI/ 180,  360 * Math.PI/ 180, false);
	  		ctx.fill();
	  
	   		//  value indicatorFill // 
      		ctx.beginPath();
      		ctx.fillStyle = indicatorFill;
      		var knobX = (centerRadius - (centerRadius/3)) * Math.sin(this.angle  * (Math.PI/180));
      		var knobY = (centerRadius  - (centerRadius/3)) * Math.cos(this.angle  * (Math.PI/180));

      		ctx.arc(knobX + centerX, centerY + knobY,innerRadius /6 , 0 * Math.PI/ 180,  360 * Math.PI/ 180, false);
	  		ctx.fill(); 
	 		ctx.restore();	
		break;  
			  
		// <!-- RING --> //	  	  
	   	case 'ring':	 
			  
			knobOffset = this.canvas.width * 10/100;
	 		diameter = this.canvas.width - knobOffset;
	 		radius = diameter / 2;
	 		radius = (radius * 80)/100;
	 		clipMaskRadius = (this.canvas.width - knobOffset)/2;
	 		lineWidth = diameter / 10;	 		
	  
	 		/* outer wheel clip mask */
	  		ctx.save();	
	  		ctx.beginPath();
	  		ctx.stroke();
	  		ctx.arc(centerX, centerY, clipMaskRadius, 0 * Math.PI/ 180,  360 * Math.PI/ 180, false);
	  		ctx.clip();		  
	  
			
			 // outerWheel Fill //
			if (this.style.outerGradientOrientation== "vertical")
			{
				var  outerWheelGradient = ctx.createLinearGradient(0,centerY - radius, 0 ,centerY + radius);	
			}
			else
			{
				var  outerWheelGradient = ctx.createLinearGradient(centerX - radius, 0 ,centerX + radius, 0);
			}
			  	
			//call linear gradient cretor function
			linearGradientCreator(outerWheelGradient, this.style.outerWheelFill);	
			  
	  		ctx.beginPath();	
	  		ctx.fillStyle = outerWheelGradient 
	  		ctx.arc(centerX, centerY, (radius * 110)/100, 0 * Math.PI/ 180,  360 * Math.PI/ 180, false);
	  		ctx.fill();	
	
	  		// innerWheel Fill //
			innerRadius= (radius * 85)/100
			  
			if (this.style.innerGradientOrientation== "vertical")
			{
				var  innerWheelGradient = ctx.createLinearGradient(0,centerY - innerRadius, 0 , centerY + innerRadius);	
			}
			else
			{
				var  innerWheelGradient = ctx.createLinearGradient(centerX - innerRadius, 0 , centerX + innerRadius, 0);
			}
			//call linear gradient cretor function
			linearGradientCreator(innerWheelGradient, this.style.innerWheelFill); 
			  
	  		ctx.beginPath();
	  		ctx.fillStyle = innerWheelGradient;	  		
	  		ctx.arc(centerX, centerY,innerRadius , 0 * Math.PI/ 180,  360 * Math.PI/ 180, false);
	  		ctx.fill();
	  
	   		var indicatorFill;
			 // track indicatorFill //
			if (this.style.indicatorType == "single")
			{ 
				var clockwise = false; 
				var angleOffset = 90;
				indicatorFill = this.style.indicatorFill;
			}
			 else
			{
				angleOffset = 270-this.minAngle; 
				if (this.angle>=180)
				{					
					clockwise = true;
					indicatorFill = this.style.indicatorFill;
					
				}
				else
				{
					clockwise = false;
					indicatorFill = this.style.indicatorDoubleFill;
				}
			}
		
			ctx.lineWidth = lineWidth; 
			  
			if(isNaN(this.angle)) {this.angle = 0;}
			  
			var knobX = radius * Math.sin(this.angle  * (Math.PI/180));
      		var knobY = radius * Math.cos(this.angle  * (Math.PI/180));
			  
			if (this.style.indicatorGradientOrientation == "vertical")
			{
			 var indicatorFillGradient = ctx.createLinearGradient(centerX, centerY, knobX + centerX, centerY + knobY);	
			}
			else
			{
			 var x = centerX + (lineWidth * Math.sin(this.angle  * (Math.PI/180)));
      		 var y = centerY + (lineWidth * Math.cos(this.angle  * (Math.PI/180)));	
				
			 var x2 = centerY + (lineWidth  * Math.sin((this.angle + lineWidth)  * (Math.PI/180)));
      		 var y2 =centerY  + (lineWidth  * Math.cos((this.angle+ lineWidth)   * (Math.PI/180)));
			
			 var indicatorFillGradient = ctx.createLinearGradient(x, y, x2, y2);
				
			}
			//call linear gradient cretor function
			linearGradientCreator(indicatorFillGradient, indicatorFill);
			  
      		ctx.strokeStyle =indicatorFillGradient;

      		ctx.beginPath();
      		ctx.moveTo(centerX, centerY);
	  		ctx.lineTo(knobX + centerX, centerY + knobY);
      		ctx.stroke();
	  
			if (state=="mouseMove")
			{
	  	    	//RING(s) CREATOR
			 	//use this condition for ring less than four to avoid radiusCircle become to large
				var radiusCircle;
				if ( this.style.ring>=4){ radiusCircle = Math.PI * diameter / ( this.style.ring * 4);}
	  			else{radiusCircle = Math.PI * diameter / (4 * 4);}
			  
	  			let halfRadiusCircle=radiusCircle/2;
	        	let distance  = 360 /  this.style.ring;
				let phase = this.angle - 90;
		
				for (var ring=0; ring < this.style.ring; ring++)
				{
					//calculate angle for each ring
					var angle =(360-((this.angle-90) + ring * distance))  * (Math.PI/180)
					
					//coordenates of outside the outer wheel
	  				let gradientX1 = (radius + radiusCircle)  * Math.cos(angle);
	  				let gradientY1 = (radius + radiusCircle)  * Math.sin(angle);
					
					//coordenates of inside the outer wheel
	  				let gradientX2 = (radius-halfRadiusCircle)  * Math.cos(angle);
	  				let gradientY2 = (radius-halfRadiusCircle)  * Math.sin(angle);
					
					//coordenates of rings the outer wheel
	  				let ringX = (radius + halfRadiusCircle)  * Math.cos(angle);
	  				let ringY = (radius + halfRadiusCircle )  * Math.sin(angle);
				
					
					var ringGradient = ctx.createLinearGradient(centerX + gradientX1, centerY + gradientY1, centerX + gradientX2, centerY + gradientY2);						
					
					//call linear gradient creator function
					linearGradientCreator(ringGradient, this.style.ringFill);
					
					//draw rings
					ctx.beginPath();
	  				ctx.fillStyle = ringGradient;
	  				ctx.arc(centerX + ringX, centerY+ ringY, radiusCircle, 0 * Math.PI/ 180,  360 * Math.PI/ 180, false);
	  				ctx.fill();	
		
				}
			}  
			
	  		ctx.restore();	
	
			  
		break;
			  
			  
			  
	  }	  
  }
  
/**
 *  Calculate angle for current knob 
 *
 *  @param {float} step: amount of step the value will change
 *
 *  @public
 *
 *	@return {void}   
 */ 
 knob.prototype.changeEvent = function(step)
 {
	this.value+=step;
	  
	if (this.value < this.min){this.value = this.min}
	if (this.value>this.max){this.value = this.max}

	this.valueToAngle();
	this.drawOnMouseMove();
	this.onChange(); //call change event function
	  
  }
  
/**
 * Calculate new knob value from wheel event
 *
 * @param {wheelevent} Event: currentEvent to used event.DeltaY property on wheel Event
 * @param {wheelevent} Event: currentEvent to used event.DeltaY property on wheel Event
 *
 * @public
 *
 *	@return {void}   
 */ 
  knob.prototype.wheelEvent = function(event, step)
  {
	let wheelstep = 0;
	event.deltaY < 0 ? wheelstep = 1 : wheelstep = -1;
	//calculate the number of wheel spinned; event.DeltaY<0 means 1 wheel spinned up, event.DeltaY>0 1 wheel spinned down
	 //if ctrl is pressed then it speed the step guiding by the wheel speed and stepTime phactor 
	  if(event.ctrlKey)
	  {
		  this.value+=step 
	  }
	  else
	  {
		this.value+=(this.step * wheelstep)  
	  }
	 
	  
	if (this.value < this.min){this.value = this.min}
	if (this.value>this.max){this.value = this.max}

	this.valueToAngle();
	this.drawOnMouseMove();
	this.onChange(); //call change event function
	  
  }

/**
 * change value to newly mouseevent angle passed by parameter
 * @param {int} angle in grade of mouseevent postinio to set value 
 *  @public
 *
 *	@return {void}   
 */ 
 knob.prototype.changeQuickAngle = function(angle)
 {
	  	this.angle = angle;
	   	if (this.angle<this.minAngle){this.angle = this.minAngle}
	   	if (this.angle>this.maxAngle){this.angle = this.maxAngle}

	    this.angleToValue();
	  	this.drawOnMouseMove();
	  	this.onChange(); //call change event function

  }
  
/**
 *  calculate knob angle from input value
 
 * * @param {float} value to set to knob
 *
 *  @public
 *
 *	@return {void}   
 */ 
 knob.prototype.setValue = function(value)
 {	  	
  	if (parseFloat(value)<this.min){parseFloat(value) = this.min}
	if (parseFloat(value)>this.max){parseFloat(value) = this.max}
			
	this.value = parseFloat(value);
	this.valueToAngle();
	this.drawOnMouseUp();
	this.onChange(); //call change event function
	  
  }
  
/**
 *  calulate angle based on value and min, max value
 *
 *  @public
 *
 *	@return {void}   
 */ 
 knob.prototype.valueToAngle = function()
 {
	  
	  let totalAngle = this.maxAngle - this.minAngle;
	  let totalValue = this.max - this.min;
	  
	  this.angleIncrement = totalAngle / totalValue;	
	  this.angleStepIncrement = this.angleIncrement * this.step; 
	  
	  let percentValue = this.value - this.min;
	  this.angle = this.maxAngle - (percentValue * this.angleIncrement);  
	  
  }
 
/**
 *  calulate value based on angle and min, max value
 *
 *  @public
 *
 *	@return {void}   
 */ 
 knob.prototype.angleToValue = function()
 {

	  let totalAngle = this.maxAngle - this.minAngle;
	  let totalValue = this.max - this.min;

	  let tempAngle = 360 - this.angle
	  this.value =   ((tempAngle - this.minAngle) / totalAngle) *  totalValue +  this.min;  
	  
  }  
   
/**
 *  return knob from knobMatrix passed by parameter
 *
 *  @param {string} id of current knob
 *
 *  @public
 *
 *	@return {void}   
 */ 
 function getCurrentKnob(id)
 {	
	 var currKnob;
	 knobMatrix.forEach(knobFunction);
	 function knobFunction(knob)
	 {
		if (knob.id==id){currKnob = knob;}		
	 }
	
	 return currKnob;
	 
  }

//Matrix used to store all knobs created on Dom 
//we can access it and modify using getCurrentKnob
var knobMatrix =[]; 

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/************///*/*/*/*/*/*/*/*/*//
/*General Knob listener */
/*******************///*/*/*/*/*/*/*/*/*//
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
 var currentKnob=undefined; //will store the current knob object

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//Add mousedown listener to document to detect when over a Knob
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */	
document.addEventListener("mousedown",  function(event) { 
	 if (event.target.dataset.type =="knob-object") {
		currentKnob = getCurrentKnob(event.target.id);	//store the current knob target
		 let centerCoordX = currentKnob.width/2;
		 let centerCoordY = currentKnob.height/2;
		 let adjacent = (event.offsetX - centerCoordX);
		 let opposite = (event.offsetY - centerCoordY);
		 let phase = 0; //will store the phase of angle
		 
		 if((adjacent >= 0) && (opposite > 0)) {phase = 90;} //block 4
		 if((adjacent >= 0) && (opposite < 0)) {phase = 90;} //block 3
		 if((adjacent <= 0) && (opposite < 0)) {phase = 270;} //block 2
		 if((adjacent <= 0) && (opposite > 0)) {phase = 270;} //block 1
		 if((adjacent == 0) && (opposite == 0)) {phase = 360;} //block 1
      
		 let radians = Math.atan(opposite/adjacent) * -1; // calculate angle with formula "angle = arcTan(opposite/adjacent)" and multiply by -1 to match the rotantion directrion of knob that is counterclockwise
		 let angle = radians * (180/Math.PI) + phase
		 currentKnob.changeQuickAngle(angle) //call to set value based on calculated angle
	 }
}, false)
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//Add mousemove listener to document to detect when over a Knob
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */	
document.addEventListener("mousemove",function(event) { 
	if (event.buttons == 1){ //if left mouse button is pressed	
		if (currentKnob!=undefined) {
			event.preventDefault(); //tells the user agent that if the event does not get explicitly handled, its default action should not be taken as it normally would be.
			
			let step= currentKnob.step; //get the knob step value
			let d = new Date();
         	let currentTime = d.getTime();
		 	let time = currentTime - currentKnob.previousTime; //store the time that mouseevent takes while moving
		 	let speedPhactor = (currentKnob.stepTime * step) / time //calculate the speed factor each 1 sec (1000) speedPhactor is equal to step
		 	speedPhactor < step ? speedPhactor = step : null; //we make sure that speedphactor is never less than step
		 	let direction=0; //store the direction movement if up is positive if down is negative else is 0
		 	if (event.movementY>0) {direction = -1}
		 	if (event.movementY<0) {direction = 1}
		 	let stepSpeed = speedPhactor * step * direction; //calculate how much the new speed' step value  is moving and the direction of movement
		 	currentKnob.changeEvent(stepSpeed) //call to change event function to draw knob with new position and value
		 	currentKnob.previousTime = currentTime; //store the previous timeStamp		 
	 }}
}, false)
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//Add mouseup listener to document to detect when over a Knob
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */	
document.addEventListener("mouseup",  function(event) { 
	 if (currentKnob!=undefined) {
		 currentKnob.previousTime = 0;
		 currentKnob.drawOnMouseUp();
		 currentKnob = undefined
	 }
}, false)
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//Add wheel listener to document to detect when over a Knob
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */	
document.addEventListener("wheel", function(event) { 
	if (event.target.dataset.type =="knob-object") {
		event.preventDefault(); //tells the user agent that if the event does not get explicitly handled, its default action should not be taken as it normally would be.
		currentKnob = getCurrentKnob(event.target.id);	//store the current knob target
		let step= currentKnob.step; //get the knob step value
		let d = new Date();
		let currentTime = d.getTime();
		let time = currentTime - currentKnob.previousTime; //store the time that mouseevent takes while moving
		let speedPhactor = (currentKnob.stepTime * step) / time //calculate the speed factor each 1 sec (1000) speedPhactor is equal to step
		speedPhactor < step ? speedPhactor = step : null; //we make sure that speedphactor is never less than step	
		let direction=0; //store the direction movement if up is positive if down is negative else is 0
		if (event.deltaY>0) {direction = -1}
		if (event.deltaY<0) {direction = 1}
		
		let stepSpeed = speedPhactor * step * direction;
		currentKnob.wheelEvent(event, stepSpeed); 	//call function that calculate value and speed depending on wheelDeltaY 
		currentKnob.previousTime = currentTime; //store the previous timeStamp
	}}, true);	 