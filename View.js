import { create, forEach, diff, } from './VDOM.js'

const CONTAINER= Symbol( 'CONTAINER', );

export default class View
{
	constructor( container, )
	{
		this[CONTAINER]= container;
	}
	
	update( vdoms )
	{
		this[CONTAINER].innerHTML= '';
		
		forEach(
			vdoms,
			x=> x.toDOM( document, ).forEach(
				x=> this[CONTAINER].appendChild( x, ),
			),
		);
	}
}
