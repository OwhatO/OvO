
const EVENT_NAME= Symbol( 'EVENT_NAME', );
const CALLBACK= Symbol( 'CALLBACK', );

export default class Listener
{
	constructor( eventName, callback, )
	{
		if(!( callback instanceof Function ))
			throw 'The callback of Listener must be a function.';
		
		this[EVENT_NAME]= `${eventName}`;
		this[CALLBACK]= callback;
	}
	
	get eventName()
	{
		return this[EVENT_NAME];
	}
	
	get callback()
	{
		return this[CALLBACK];
	}
	
	listenTo( eventTarget, )
	{
		if(!( eventTarget instanceof EventTarget ))
			throw 'Must listen to a instance of EventTarget.';
		
		eventTarget.addEventListener( this[EVENT_NAME], this[CALLBACK], );
	}
}
